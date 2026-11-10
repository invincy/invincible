const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
// River is retained for future use; mount it on the real page only in this fixture.
let riverPage = fs.readFileSync(path.join(root, 'creator', 'tts.html'), 'utf8');
for (const [pattern, replacement] of [
  [/(href=["'])tts-forest\.css(\?[^"']*)?(["'])/g, '$1tts-river.css$2$3'],
  [/(class=["'])tts-forest(["'])/g, '$1tts-river$2'],
  [/(src=["'])tts-forest\.js(\?[^"']*)?(["'])/g, '$1tts-river.js$2$3']
]) {
  assert.equal([...riverPage.matchAll(pattern)].length, 1, 'expected exactly one forest resource to substitute');
  riverPage = riverPage.replace(pattern, replacement);
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const relative = decodeURIComponent(url.pathname.replace(/^\/invincible\//, ''));
  // Keep the real page and controls, but avoid auth, API and external navigation.
  if (relative === 'creator/tts.js') {
    res.setHeader('Content-Type', 'text/javascript');
    return res.end("document.querySelector('#workspace').hidden=false;document.querySelector('#accountStatus').textContent='Test account';");
  }
  if (relative === 'site-nav.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(''); }
  if (relative === 'creator/tts.html') { res.setHeader('Content-Type', 'text/html'); return res.end(riverPage); }
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    const body = fs.readFileSync(file);
    res.setHeader('Content-Type', relative.endsWith('.js') ? 'text/javascript' : relative.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(body);
  } catch (_) { res.writeHead(404).end(); }
});

async function pixels(page) {
  const screenshot = await page.screenshot({ scale: 'css' });
  return page.evaluate(async data => {
    const image = await createImageBitmap(await (await fetch('data:image/png;base64,' + data)).blob());
    const c = document.createElement('canvas'); c.width = Math.ceil(image.width / 4); c.height = Math.ceil(image.height / 4);
    const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0, c.width, c.height); image.close();
    return Array.from(ctx.getImageData(0, 0, c.width, c.height).data);
  }, screenshot.toString('base64'));
}

function difference(a, b) {
  let changed = 0, total = 0;
  for (let i = 0; i < a.length; i += 4) {
    const delta = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    if (delta > 8) changed++;
    total += delta;
  }
  return { changed, total };
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    console.log('Starting Chrome river checks.');
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
    const base = `http://127.0.0.1:${server.address().port}/invincible/creator/tts.html`;
    for (const viewport of [{ width: 1280, height: 800 }, { width: 393, height: 852 }]) {
      console.log(`Checking ${viewport.width}x${viewport.height}.`);
      const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://**/*', route => route.abort());
      await page.addInitScript(() => {
        window.riverDraws = 0;
        const original = WebGLRenderingContext.prototype.drawArrays;
        WebGLRenderingContext.prototype.drawArrays = function (...args) { window.riverDraws++; return original.apply(this, args); };
      });
      await page.goto(base);
      await page.locator('.tts-river.is-ready').waitFor();
      console.log('River initialized.');
      const sizing = await page.locator('.tts-river').evaluate(c => ({ width: c.width, height: c.height, aria: c.getAttribute('aria-hidden'), pointer: getComputedStyle(c).pointerEvents }));
      assert.equal(sizing.aria, 'true'); assert.equal(sizing.pointer, 'none');
      assert.ok(sizing.width * sizing.height <= 751500, 'pixel budget');
      assert.ok(sizing.width <= viewport.width * (viewport.width <= 700 ? 1 : 1.25) + 1, 'DPR budget');
      const first = await pixels(page);
      console.log('Captured first frame.');
      const initialDraws = await page.evaluate(() => window.riverDraws);
      const start = Date.now();
      await page.waitForTimeout(1100);
      const second = await pixels(page);
      console.log('Captured second frame.');
      const draws = await page.evaluate(() => window.riverDraws);
      const elapsed = (Date.now() - start) / 1000;
      assert.ok(draws > initialDraws + 1 && draws - initialDraws <= Math.ceil(elapsed * 20) + 2, 'continuous, bounded frame scheduling');
      assert.ok(difference(first, second).changed > first.length / 4 * 0.02, 'visible composite changes over time');
      await page.locator('.tts-river').evaluate(c => c.style.opacity = '0');
      const fallback = await pixels(page);
      assert.ok(difference(second, fallback).changed > second.length / 4 * 0.03, 'rendered water is visible behind the page');
      await page.locator('.tts-river').evaluate(c => c.style.removeProperty('opacity'));

      await page.locator('#title').click();
      await page.locator('#title').fill('Pointer works');
      await page.locator('#title').press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'mode');
      await page.locator('#script').click();
      await page.locator('#script').fill('Keyboard and pointer still work.');
      assert.equal(await page.locator('#script').inputValue(), 'Keyboard and pointer still work.');
      if (viewport.width < 700) {
        await page.locator('#voiceSettings > summary').focus();
        const before = await page.locator('#voiceSettings').evaluate(e => e.open);
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#voiceSettings').evaluate(e => e.open), !before);
      }

      await page.evaluate(() => document.activeElement.blur());
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(200);
      const still1 = await pixels(page), stopped = await page.evaluate(() => window.riverDraws);
      await page.waitForTimeout(450);
      const still2 = await pixels(page);
      assert.equal(await page.evaluate(() => window.riverDraws), stopped, 'reduced motion stops rendering');
      assert.equal(difference(still1, still2).changed, 0, 'reduced motion is visually still');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(count => window.riverDraws > count + 2, stopped);

      await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
      const hidden = await page.evaluate(() => window.riverDraws);
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => window.riverDraws), hidden, 'hidden page stops rendering');
      await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
      await page.waitForFunction(count => window.riverDraws > count + 2, hidden);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(100);
      const beforeResize = await page.evaluate(() => window.riverDraws);
      await page.evaluate(() => { for (let i = 0; i < 50; i++) window.dispatchEvent(new Event('resize')); });
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(count => window.riverDraws - count, beforeResize), 1, 'resize bursts coalesce into one still frame');

      const canLose = await page.locator('.tts-river').evaluate(c => {
        const ext = c.getContext('webgl').getExtension('WEBGL_lose_context');
        if (!ext) return false;
        window.riverContextExtension = ext;
        ext.loseContext();
        return true;
      });
      if (canLose) {
        await page.waitForFunction(() => !document.querySelector('.tts-river').classList.contains('is-ready'));
        await page.evaluate(() => window.riverContextExtension.restoreContext());
        await page.locator('.tts-river.is-ready').waitFor();
      }
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`River ${viewport.width}x${viewport.height}: animated composite, still mode, visibility, input and budgets passed.`);
    }

    // Compare the same fixed-time shader with and without its ripple contribution.
    // This observes actual pixels, not merely the presence of ripple code.
    const rainFrames = [];
    for (const disableRain of [false, true]) {
      const context = await browser.newContext({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.route('https://**/*', route => route.abort());
      if (disableRain) await page.addInitScript(() => {
        const original = WebGLRenderingContext.prototype.shaderSource;
        WebGLRenderingContext.prototype.shaderSource = function (shader, source) {
          return original.call(this, shader, source.replace('light + rings', 'light'));
        };
      });
      await page.goto(base);
      await page.locator('.tts-river.is-ready').waitFor();
      rainFrames.push(await pixels(page));
      await context.close();
    }
    assert.ok(difference(rainFrames[0], rainFrames[1]).changed > 20, 'rain ripples visibly affect rendered pixels');
    console.log('River rain: fixed-time ripple contribution is visible.');

    const fallbackPage = await browser.newPage({ viewport: { width: 393, height: 852 } });
    await fallbackPage.route('https://**/*', route => route.abort());
    await fallbackPage.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type === 'webgl' ? null : original.call(this, type, ...args); };
    });
    await fallbackPage.goto(base);
    assert.equal(await fallbackPage.locator('.tts-river').evaluate(c => getComputedStyle(c).opacity), '0');
    assert.match(await fallbackPage.evaluate(() => getComputedStyle(document.body, '::before').backgroundImage), /gradient/);
    await fallbackPage.locator('#script').fill('Fallback remains usable');
    assert.equal(await fallbackPage.locator('#script').inputValue(), 'Fallback remains usable');
    await fallbackPage.close();
    console.log('River WebGL failure: static fallback and controls passed.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });