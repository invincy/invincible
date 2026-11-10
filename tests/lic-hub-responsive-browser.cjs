const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const windowsChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath = process.env.CHROMIUM_EXECUTABLE || (fs.existsSync(windowsChrome) ? windowsChrome : chromium.executablePath());
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/invincible\//, '/');
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  const types = {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp'};
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

async function checkAction(locator) {
  // The shared fixed tab bar is outside the layout viewport's scroll-into-view calculation.
  await locator.evaluate(el => el.scrollIntoView({block:'center', inline:'nearest', behavior:'instant'}));
  const result = await locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {width:r.width, height:r.height, left:r.left, right:r.right, top:r.top, bottom:r.bottom, hit:el === hit || el.contains(hit)};
  });
  assert.ok(result.width >= 44 && result.height >= 44 && result.left >= 0 && result.right <= await locator.page().evaluate(() => innerWidth) + 1 && result.hit, JSON.stringify(result));
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/invincible/`;
  let browser;
  try {
    browser = await chromium.launch({headless:true, executablePath});
    for (const [width, height] of [[320,568], [360,640], [393,699], [999,700], [1000,700], [1280,720], [1920,1080]]) {
      const page = await browser.newPage({viewport:{width,height}, reducedMotion:'reduce'});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://**/*', route => route.abort());
      await page.route('**/ai/?widget=*', route => route.fulfill({status:200, contentType:'text/html', body:''}));
      await page.goto(base + 'lic/');
      await page.locator('.mobile-tabbar').waitFor({state:'attached'});
      assert.equal(await page.locator('.lic-shortcut').count(), 4);
      assert.deepEqual(await page.locator('.lic-shortcut').evaluateAll(els => els.map(el => el.getAttribute('href'))), ['follow-up/', 'crm/agent.html', 'agent/', 'cashier/']);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `hub horizontal overflow ${width}x${height}`);
      const grid = await page.locator('.lic-shortcuts').boundingBox();
      assert.ok(grid.width >= Math.min(width * .9, 1500), `hub gutters ${width}: ${grid.width}`);
      for (const link of await page.locator('.lic-shortcut').all()) await checkAction(link);
      if (width <= 760) {
        await page.locator('.mobile-more-trigger').click();
        assert.equal(await page.locator('#appMoreSheet').evaluate(el => el.open), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#appMoreSheet').evaluate(el => el.open), false);
      }
      const plans = page.locator('.lic-shortcut.agent');
      await plans.focus();
      assert.equal(await plans.evaluate(el => el.matches(':focus-visible')), true);
      await plans.click();
      assert.match(page.url(), /\/lic\/agent\/$/);
      assert.equal(await page.locator('.plan-showcase').count(), 2);
      assert.deepEqual(await page.locator('.plan-showcase .button').evaluateAll(els => els.map(el => el.getAttribute('href'))), ['../jeevan-lakshya/', '../jeevan-lakshya/calculator.html', '../bima-platinum/', '../bima-platinum/calculator.html']);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `plans horizontal overflow ${width}x${height}`);
      const cards = await Promise.all((await page.locator('.plan-showcase').all()).map(card => card.boundingBox()));
      assert.equal(Math.abs(cards[0].y - cards[1].y) < 1, width >= 1000, `plans grid ${width}`);
      if (width >= 1280) assert.ok(cards[1].y + cards[1].height < height, `desktop plans unnecessarily scroll ${width}`);
      for (const link of await page.locator('.plan-showcase .button').all()) await checkAction(link);
      if (width <= 760) {
        assert.ok(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), 'phone plans retain content scrolling');
        const tail = await page.evaluate(() => document.documentElement.scrollHeight - (document.querySelector('.plan-showcase:last-child').getBoundingClientRect().bottom + scrollY));
        assert.ok(tail < 110, `no duplicate mobile bottom gutter: ${tail}`);
      }
      // Longer content must grow the page rather than being clipped by a fixed-height layout.
      await page.locator('.plan-showcase-copy p').first().evaluate(el => { el.textContent = 'Additional plan information '.repeat(60); });
      await checkAction(page.locator('.plan-showcase .button').last());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'long content must not cause horizontal overflow');
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS LIC hub and plans ${width}x${height}`);
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });