import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from 'playwright';
import { fixturePng } from '../fixtures/imagegen-service.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const origin = 'https://invincy.github.io';
const png = fixturePng(384, 640);
const id = 'remote_' + '1'.repeat(32);
const calls = [];
let online = false, failed = false, polls = 0;
const browser = await chromium.launch();
try {
  const page = await browser.newPage(devices['Pixel 7']);
  await page.addInitScript(() => sessionStorage.setItem('invincible.image-connection.test-owner', 'local'));
  const localRequests = [];
  await page.route('http://127.0.0.1:8788/**', route => {
    localRequests.push(route.request().url());
    return route.abort();
  });
  await page.exposeFunction('fixtureRelay', data => {
    calls.push(data);
    if (data.action === 'status') return { online };
    if (data.action === 'enqueue') { polls = 0; return { job: { id, status: 'queued' } }; }
    if (data.action === 'job') {
      if (polls++ === 0) return { job: { id, status: 'running' } };
      return { job: failed ? { id, status: 'failed', error: { message: 'Test generation failed.' } } :
        { id, status: 'completed', verified: true, seed: 17, image: { width: 384, height: 640 }, generationSeconds: 2 } };
    }
    if (data.action === 'image' && !failed) return { png: png.toString('base64') };
    throw Error('Unexpected relay request.');
  });
  await page.route(origin + '/invincible/**', async route => {
    const name = new URL(route.request().url()).pathname.slice('/invincible/'.length);
    if (name === 'fixture') {
      return route.fulfill({ contentType: 'text/html', body: `<!doctype html>
        <meta name="viewport" content="width=device-width">
        <link rel="stylesheet" href="/invincible/creator/image-generator.css">
        <main></main>
        <script type="module">
          import { mountConnectedImageGenerator } from '/invincible/creator/image-generator.js';
          mountConnectedImageGenerator(document.querySelector('main'), {
            getAccountId: () => 'test-owner', callRelay: window.fixtureRelay,
            getProjectId: () => 'isolated-test-project',
            onAttach: async file => { window.attachedBytes = [...new Uint8Array(await file.arrayBuffer())]; },
          });
        </script>` });
    }
    const file = path.resolve(root, name);
    assert.ok(file.startsWith(root + path.sep));
    return route.fulfill({ contentType: name.endsWith('.css') ? 'text/css' : 'text/javascript', body: await fs.readFile(file) });
  });
  await page.goto(origin + '/invincible/fixture');
  await page.getByText(/Laptop offline/).first().waitFor();
  const generate = page.getByRole('button', { name: 'Generate', exact: true });
  assert.equal(await generate.isEnabled(), false);
  assert.equal(await page.getByText('Manual pairing', { exact: true }).isVisible(), false);
  await page.getByText('Advanced settings', { exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Set up on this laptop', exact: true }).isVisible(), false);
  assert.equal(await page.getByText('Help me write', { exact: true }).isVisible(), false);
  await page.getByText('Advanced settings', { exact: true }).click();
  online = true;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.getByText('Laptop online', { exact: true }).waitFor();
  await page.getByRole('textbox', { name: 'Prompt' }).fill('An Indian fortress at sunrise');
  await page.getByRole('radio', { name: /Portrait/ }).check();
  await generate.click();
  await page.getByText(/^Queued/).waitFor();
  await page.getByText(/^Running/).waitFor();
  await page.getByText(/^Completed/).waitFor();
  assert.equal(await page.getByRole('img', { name: 'Generated image' }).evaluate(image => image.naturalWidth + 'x' + image.naturalHeight), '384x640');
  assert.deepEqual(calls.find(call => call.action === 'enqueue').arguments, { prompt: 'An Indian fortress at sunrise', preset: 'portrait' });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG', exact: true }).click();
  assert.deepEqual(await fs.readFile(await (await download).path()), png);
  await page.getByRole('button', { name: 'Attach to current project', exact: true }).click();
  await page.getByText('Attached to current project', { exact: true }).waitFor();
  assert.deepEqual(Buffer.from(await page.evaluate(() => window.attachedBytes)), png);
  failed = true;
  await page.getByRole('button', { name: 'Regenerate', exact: true }).click();
  await page.getByText('Failed · Test generation failed.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('img', { name: 'Generated image' }).isVisible(), false);
  assert.equal(await page.getByRole('button', { name: 'Download PNG', exact: true }).isVisible(), false);
  assert.equal(calls.filter(call => call.action === 'image').length, 1);
  assert.deepEqual(localRequests, []);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  console.log('PASS: mobile remote images, offline state, status, verified PNG preview and download, project attachment, and failure without loopback.');
} finally { await browser.close(); }
