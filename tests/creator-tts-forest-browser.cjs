// Real Voiceover page and forest integration; auth and navigation are stubbed.
// Screenshots go to the OS temp directory, never the repository.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'invincible-forest-'));
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const relative = decodeURIComponent(url.pathname.replace(/^\/invincible\//, ''));
  if (relative === 'creator/tts.js') {
    res.setHeader('Content-Type', 'text/javascript');
    return res.end("document.querySelector('#workspace').hidden=false;document.querySelector('#accountStatus').textContent='Test account';");
  }
  if (relative === 'site-nav.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(''); }
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
    const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
    const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0); image.close();
    return { width: c.width, height: c.height, data: Array.from(ctx.getImageData(0, 0, c.width, c.height).data) };
  }, screenshot.toString('base64'));
}

function difference(a, b, region = [0, 0, 1, 1], threshold = 8) {
  assert.equal(a.width, b.width); assert.equal(a.height, b.height);
  let changed = 0, total = 0;
  for (let y = Math.floor(a.height * region[1]); y < Math.floor(a.height * region[3]); y += 2) {
    for (let x = Math.floor(a.width * region[0]); x < Math.floor(a.width * region[2]); x += 2) {
      const i = (y * a.width + x) * 4;
      const delta = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
      if (delta > threshold) changed++;
      total++;
    }
  }
  return { changed, total };
}

async function prepare(page, { noWebgl = false, omit = '' } = {}) {
  await page.route('https://**/*', route => route.abort());
  await page.addInitScript(({ noWebgl, omit }) => {
    window.forestDraws = 0;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) { window.forestDraws++; return draw.apply(this, args); };
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return noWebgl && type === 'webgl' ? null : getContext.call(this, type, ...args);
    };
    const source = WebGLRenderingContext.prototype.shaderSource;
    WebGLRenderingContext.prototype.shaderSource = function (shader, text) {
      // Remove one actual rendered layer at a time; the resulting pixel differences
      // establish its visible contribution rather than merely matching source text.
      const targets = {
        trees: ['forest(uv, 24.0, 0.48, 0.105, 10.0)', 'forest(uv, 18.0, 0.38, 0.19, 40.0)', 'forest(uv, 9.0, 0.15, 0.36, 90.0)'],
        hills: ['step(y, distant)', 'step(y, middle)', 'step(y, land)'],
        river: ['color = mix(color, water, river);', 'color = mix(color, vec3(0.12, 0.22, 0.19), bank * 0.65);'],
        lightning: ['color += vec3(0.22, 0.40, 0.39) * glow * (exp(-bolt * 105.0) * 0.35 + exp(-bolt * 600.0) * 0.65);']
      };
      for (const target of targets[omit] || []) {
        if (text.includes(target)) text = text.replace(target, target.startsWith('color ') ? '' : '0.0');
      }
      return source.call(this, shader, text);
    };
  }, { noWebgl, omit });
}

async function isolateScene(page) {
  await page.addStyleTag({ content: 'body.voiceover-page > :not(.tts-forest) { visibility: hidden !important; }' });
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    console.log(`Screenshots: ${output}`);
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
    const base = `http://127.0.0.1:${server.address().port}/invincible/creator/tts.html`;
    for (const viewport of [{ width: 1280, height: 800 }, { width: 393, height: 852 }]) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await prepare(page);
      await page.goto(base);
      assert.equal(await page.locator('link[rel="stylesheet"][href*="tts-forest.css"]').count(), 1);
      assert.equal(await page.locator('script[type="module"][src*="tts-forest.js"]').count(), 1);
      assert.equal(await page.locator('canvas.tts-forest').count(), 1);
      await page.locator('.tts-forest.is-ready').waitFor();
      await page.screenshot({ path: path.join(output, `voiceover-${viewport.width}.png`) });
      const sizing = await page.locator('.tts-forest').evaluate(c => ({ width: c.width, height: c.height, aria: c.getAttribute('aria-hidden'), pointer: getComputedStyle(c).pointerEvents }));
      assert.equal(sizing.aria, 'true'); assert.equal(sizing.pointer, 'none');
      assert.ok(sizing.width * sizing.height <= 750000, 'strict pixel budget');
      assert.ok(sizing.width <= viewport.width * (viewport.width <= 700 ? 1 : 1.25), 'DPR budget');
      await page.locator('#title').fill('Pointer works');
      await page.locator('#title').press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'mode');
      await page.locator('#script').fill('Accessible foreground');
      assert.equal(await page.locator('#script').inputValue(), 'Accessible foreground');

      await isolateScene(page);
      await page.screenshot({ path: path.join(output, `scene-${viewport.width}.png`) });
      const first = await pixels(page);
      const initialDraws = await page.evaluate(() => window.forestDraws);
      const start = Date.now();
      await page.waitForTimeout(1100);
      const second = await pixels(page);
      const draws = await page.evaluate(() => window.forestDraws);
      assert.ok(draws > initialDraws + 1 && draws - initialDraws <= Math.ceil((Date.now() - start) / 1000 * 20) + 2, 'continuous, bounded frames');
      const riverMotion = difference(first, second, [0.3, 0.60, 0.75, 1], 5);
      assert.ok(riverMotion.changed > 30, `visible motion in river: ${riverMotion.changed}`);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(160);
      const still1 = await pixels(page), stopped = await page.evaluate(() => window.forestDraws);
      await page.waitForTimeout(350);
      const still2 = await pixels(page);
      assert.equal(await page.evaluate(() => window.forestDraws), stopped, 'reduced motion stops rendering');
      assert.equal(difference(still1, still2, undefined, 0).changed, 0, 'reduced motion is visually still');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(count => window.forestDraws > count + 2, stopped);
      await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
      const hidden = await page.evaluate(() => window.forestDraws);
      await page.waitForTimeout(200);
      assert.equal(await page.evaluate(() => window.forestDraws), hidden, 'hidden tab pauses');
      await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
      await page.waitForFunction(count => window.forestDraws > count + 2, hidden);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(100);
      const beforeResize = await page.evaluate(() => window.forestDraws);
      await page.evaluate(() => { for (let i = 0; i < 50; i++) window.dispatchEvent(new Event('resize')); });
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(count => window.forestDraws - count, beforeResize), 1, 'resize burst coalesces');
      await page.setViewportSize({ width: viewport.width + 20, height: viewport.height - 30 });
      await page.waitForTimeout(150);
      const resized = await page.locator('.tts-forest').evaluate(c => ({ w: c.width, h: c.height }));
      assert.ok(resized.w !== sizing.width && resized.w * resized.h <= 750000, 'actual resize updates bounded buffer');

      const canLose = await page.locator('.tts-forest').evaluate(c => {
        const ext = c.getContext('webgl').getExtension('WEBGL_lose_context');
        if (!ext) return false;
        window.forestContextExtension = ext; ext.loseContext(); return true;
      });
      if (canLose) {
        await page.waitForFunction(() => !document.querySelector('.tts-forest').classList.contains('is-ready'));
        const lost = await page.evaluate(() => window.forestDraws);
        await page.waitForTimeout(100);
        assert.equal(await page.evaluate(() => window.forestDraws), lost);
        await page.evaluate(() => window.forestContextExtension.restoreContext());
        await page.locator('.tts-forest.is-ready').waitFor();
      } else console.log('WEBGL_lose_context unavailable; restoration not exercised.');
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${viewport.width}x${viewport.height}: motion, controls, stillness, visibility, resize and budgets passed.`);
    }

    const layers = {};
    for (const omit of ['', 'trees', 'hills', 'river', 'lightning']) {
      const context = await browser.newContext({ viewport: { width: 800, height: 600 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await prepare(page, { omit }); await page.goto(base);
      await page.locator('.tts-forest.is-ready').waitFor();
      await isolateScene(page);
      layers[omit || 'all'] = await pixels(page);
      await context.close();
    }
    for (const [layer, minimum] of [['trees', 200], ['hills', 200], ['river', 200], ['lightning', 10]]) {
      const delta = difference(layers.all, layers[layer], undefined, 3);
      assert.ok(delta.changed > minimum, `${layer} visibly contributes (${delta.changed} pixels)`);
      console.log(`${layer}: ${delta.changed} changed sampled pixels.`);
    }

    const fallback = await browser.newPage({ viewport: { width: 800, height: 600 }, reducedMotion: 'reduce' });
    await prepare(fallback, { noWebgl: true }); await fallback.goto(base);
    assert.equal(await fallback.locator('.tts-forest').evaluate(c => getComputedStyle(c).opacity), '0');
    await fallback.locator('#script').fill('Fallback remains usable');
    await isolateScene(fallback);
    await fallback.screenshot({ path: path.join(output, 'fallback.png') });
    const fallbackPixels = await pixels(fallback);
    await fallback.addStyleTag({ content: 'body.voiceover-page.studio-ui::before { background: #080f1b !important; }' });
    const blankPixels = await pixels(fallback);
    assert.ok(difference(fallbackPixels, blankPixels).changed > 10000, 'illustrated fallback actually renders');
    await fallback.close();
    console.log(`Static fallback and controls passed. Screenshots: ${output}`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });