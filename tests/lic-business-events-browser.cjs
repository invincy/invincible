const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = process.cwd();
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml'};
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE} : {})});
  try {
    for (const [width, height] of [[320,480], [320,568], [360,640], [390,844], [1440,900]]) {
      const page = await browser.newPage({viewport:{width,height}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://**/*', route => route.abort());
      await page.addInitScript(() => {
        window.Audio = class extends EventTarget {
          constructor(src) { super(); this.src=src; this.currentTime=0; this.duration=10; this.paused=true; this.ended=false; window.graphAudio=this; }
          play() { this.paused=false; this.ended=false; this.dispatchEvent(new Event('playing')); return Promise.resolve(); }
          pause() { this.paused=true; this.dispatchEvent(new Event('pause')); }
        };
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/lic/bima-platinum/`);
      await page.click('#storyModeToggleOne'); // Manual: hold the completed Page 1.
      const events = page.locator('.business-event');
      assert.equal(await events.count(), 5);
      assert.equal(await page.locator('.business-event.is-visible').count(), 0);
      for (let i=0; i<5; i++) {
        const reveal = Number(await events.nth(i).getAttribute('data-reveal'));
        for (const [delta, visible] of [[-.001,false],[.001,true]]) {
          await page.evaluate(({reveal,delta}) => {
            graphAudio.currentTime=(.03+(reveal+delta)*.87)*graphAudio.duration;
            graphAudio.dispatchEvent(new Event('timeupdate'));
          }, {reveal,delta});
          assert.equal(await events.nth(i).evaluate(el=>el.classList.contains('is-visible')),visible,`event ${i} follows curve at ${width}px`);
        }
      }
      await page.evaluate(() => { graphAudio.currentTime=9.5; graphAudio.dispatchEvent(new Event('timeupdate')); });
      assert.equal(await page.locator('.business-event.is-visible').count(),5);
      await page.click('#advisorAudioBtn');
      assert.equal(await page.locator('.business-event.is-visible').count(),5,'Pause keeps labels');
      await page.click('#advisorAudioBtn');
      await page.evaluate(() => { graphAudio.ended=true; graphAudio.dispatchEvent(new Event('ended')); });
      assert.equal(await page.locator('.business-event.is-visible').count(),5,'Completion holds all labels');
      await page.waitForTimeout(50); // ResizeObserver applies screen-size typography.
      const geometry = await page.locator('#storyChart').evaluate(chart => {
        const path=chart.querySelector('.scenario-business'), length=path.getTotalLength();
        const plot=chart.querySelector('svg').getBoundingClientRect();
        const labels=[...chart.querySelectorAll('.business-event')].map(event=>{
          const dot=event.querySelector('circle'), point=path.getPointAtLength(Number(event.dataset.reveal)*length);
          const rect=event.querySelector('text').getBoundingClientRect();
          const matrix=path.getScreenCTM();
          return {x:rect.x,y:rect.y,right:rect.right,bottom:rect.bottom,
            font:Number.parseFloat(getComputedStyle(event.querySelector('text')).fontSize)*matrix.a,
            error:Math.hypot(Number(dot.getAttribute('cx'))-point.x,Number(dot.getAttribute('cy'))-point.y)};
        });
        return {labels,plot:{x:plot.x,y:plot.y,right:plot.right,bottom:plot.bottom}};
      });
      for (const [i,a] of geometry.labels.entries()) {
        assert.ok(a.error<.01,'Dot stays on original curve');
        assert.ok(a.font>=8.9,'Readable screen-space label type');
        assert.ok(a.x>=geometry.plot.x && a.right<=geometry.plot.right && a.y>=geometry.plot.y && a.bottom<=geometry.plot.bottom,`label ${i} stays in plot at ${width}px`);
        for (const b of geometry.labels.slice(i+1)) assert.ok(a.right<=b.x || b.right<=a.x || a.bottom<=b.y || b.bottom<=a.y,'Labels do not overlap');
      }
      fs.mkdirSync('.test-output/business-events',{recursive:true});
      await page.screenshot({path:`.test-output/business-events/${width}-${height}.png`});
      await page.click('#advisorAudioBtn');
      assert.equal(await page.locator('.business-event.is-visible').count(),0,'Replay resets labels');
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await events.evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).opacity==='1')),true,'Reduced motion presents the complete annotated curve');
      await page.click('#ctaForwardBtn');
      assert.equal(await page.locator('.business-events').isVisible(),false,'Page 2 retains its graph without annotations');
      assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log('Business labels: exact curve timing, pause, seek, completion, replay and five responsive layouts passed.');
  } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
