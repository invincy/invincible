const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const { parseTable, findAmount } = await import('../lic/presentation-builder/model.mjs');
  const header = 'age,term,cover,amount,basis\n';
  const rows = parseTable(header + '30,25,200000,12345.50,annual', 'premium');
  assert.equal(findAmount(rows, { age: 30, term: 25, cover: 200000 }, 'annual').amount, 12345.5);
  assert.equal(findAmount(rows, { age: 31, term: 25, cover: 200000 }, 'annual'), undefined);
  assert.throws(() => parseTable(header + '30,25,200000,12345,annual\n30,25,200000,12346,annual', 'premium'), /Duplicate/);
  assert.throws(() => parseTable(header + '30,25,200000,1000,annual', 'bonus'), /Invalid/);
  const server = http.createServer((req, res) => {
    const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/invincible\//, '/');
    const file = path.resolve('.' + route + (route.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(process.cwd() + path.sep) || !fs.existsSync(file)) return res.writeHead(404).end();
    const mime = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.mp3': 'audio/mpeg' };
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined) });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:' + server.address().port + '/invincible/lic/agent/');
    await page.getByRole('link', { name: 'Presentation Builder' }).click();
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Load Plan 733 sample' }).click();
    await page.getByText('Draft saved on this browser.').waitFor();
    await page.getByText('Premium and bonus tables').click();
    await page.getByLabel('Premium table').setInputFiles({ name: 'premium.csv', mimeType: 'text/csv', buffer: Buffer.from(header + '30,25,200000,12345.50,annual') });
    await page.getByText(/premium sample/).waitFor();
    await page.getByLabel('Bonus table').setInputFiles({ name: 'bonus.csv', mimeType: 'text/csv', buffer: Buffer.from(header + '30,25,200000,35000,illustrative') });
    await page.getByText(/bonus sample/).waitFor();
    await page.getByRole('button', { name: 'Edit scene layout' }).click();
    const draftCareer = page.locator('#screen').getByRole('button', { name: 'Career' });
    assert.equal(await page.locator('#screen .coin').count(), 4);
    const oldTop = await draftCareer.evaluate(node => node.style.top);
    const box = await draftCareer.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 35, { steps: 4 });
    await page.mouse.up();
    const newTop = await draftCareer.evaluate(node => node.style.top);
    assert.notEqual(newTop, oldTop, 'Dragging changes the selected coin position');
    await page.locator('#layout-entrance').selectOption('rise');
    await page.getByLabel('Entrance delay (seconds)').fill('0.4');
    await page.getByLabel('Entrance delay (seconds)').press('Tab');
    await page.getByText('Draft saved on this browser.').waitFor();
    await page.reload();
    await page.getByRole('button', { name: 'Edit scene layout' }).click();
    assert.equal(await draftCareer.evaluate(node => node.style.top), newTop);
    await page.getByRole('button', { name: 'Play from start' }).click();
    assert.equal(await draftCareer.getAttribute('data-entrance'), 'rise');
    assert.equal(await draftCareer.evaluate(node => node.style.getPropertyValue('--entrance-delay')), '0.4s');
    const screen = page.locator('#screen');
    const audio = page.locator('#narration');
    async function finishClip() {
      await page.waitForFunction(() => {
        const node = document.querySelector('#narration');
        return node.readyState >= 2 && !node.paused;
      });
      await audio.evaluate(node => { node.currentTime = node.duration - .1; });
    }
    await finishClip();
    await screen.getByRole('button', { name: 'Career' }).click();
    await screen.getByRole('heading', { name: 'Career' }).waitFor();
    await finishClip();
    await screen.getByRole('heading', { name: 'Choose age, term and cover' }).waitFor();
    await finishClip();
    await screen.getByRole('button', { name: 'Continue' }).click();
    await screen.getByText(/12,345.5/).waitFor();

    await page.getByRole('button', { name: 'Add scene' }).click();
    await page.getByLabel('Scene title').fill('Bonus illustration');
    await page.getByLabel('Show a table amount').selectOption('bonus');
    await page.getByLabel('Amount basis').selectOption('illustrative');
    await page.getByLabel('Artwork').setInputFiles(path.resolve('lic/jeevan-lakshya/assets/study.png'));
    await page.getByText('study.png').waitFor();
    await page.reload();
    await page.getByRole('button', { name: 'Bonus illustration' }).click();
    await page.getByText('study.png').waitFor();
    await page.getByRole('button', { name: 'Play selected scene' }).click();
    await screen.getByText(/35,000/).waitFor();
    assert.equal(await screen.locator('img').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    assert.deepEqual(errors, []);
    console.log('PASS table validation, LIC Plans entry, branch audio routing, premium and bonus lookup, uploaded artwork and draft reload');
  } finally {
    await browser?.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
