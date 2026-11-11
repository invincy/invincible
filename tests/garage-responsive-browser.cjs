const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const date = new Date();
const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-15`;
const fixture = {
  vehicles: [{ id: 'car', name: 'LongVehicleNameWithoutSpaces'.repeat(2).slice(0, 50), type: 'Car', fuelType: 'Petrol', registration: 'AB123456789012345678', odometer: 120000 }],
  odometerReadings: [{ id: 'km', vehicleId: 'car', date: today, odometer: 120000 }],
  fuel: [{ id: 'fuel', vehicleId: 'car', date: today, odometer: 120000, quantity: 42, unit: 'L', cost: 4500, fullTank: true }],
  services: [{ id: 'service', vehicleId: 'car', date: today, odometer: 120000, work: 'LongServiceDescriptionWithoutSpaces'.repeat(3).slice(0, 100), workshop: 'WorkshopNameWithoutSpaces'.repeat(3), cost: 12500 }],
  reminders: [{ id: 'reminder', vehicleId: 'car', title: 'InsuranceRenewalWithoutSpaces'.repeat(2), date: today, odometer: 125000 }],
};
const firestore = `export const db={};export const doc=()=>({});export const serverTimestamp=()=>0;export const runTransaction=async()=>{};export function onSnapshot(ref,options,callback){queueMicrotask(()=>callback({exists:()=>true,data:()=>(${JSON.stringify(fixture)}),metadata:{hasPendingWrites:false,fromCache:false}}));return()=>{}}`;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost').pathname;
  if (url === '/test-firestore.mjs') { res.setHeader('Content-Type', 'text/javascript'); res.end(firestore); return; }
  if (url === '/invincible/shared/firebase-client.js') { res.setHeader('Content-Type', 'text/javascript'); res.end("export {db} from '/test-firestore.mjs';export async function observeAuth(callback){callback({uid:'fixture'});return()=>{}}export const storageError=()=> 'Save failed';"); return; }
  const file = path.join(root, url.replace(/^\/invincible\/?/, ''));
  try {
    const target = file.endsWith(path.sep) ? path.join(file, 'index.html') : file;
    res.setHeader('Content-Type', /\.m?js$/.test(target) ? 'text/javascript' : target.endsWith('.css') ? 'text/css' : target.endsWith('.svg') ? 'image/svg+xml' : target.endsWith('.png') ? 'image/png' : 'text/html');
    let data = fs.readFileSync(target);
    if (target.endsWith('garage.js')) data = Buffer.from(data.toString().replace('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js', '/test-firestore.mjs'));
    res.end(data);
  } catch { res.statusCode = 404; res.end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
  try {
    for (const [width, height] of [[1280, 720], [1920, 1080], [320, 569], [360, 640], [390, 694]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://**/*', route => route.abort());
      await page.goto(`http://127.0.0.1:${server.address().port}/invincible/garage/index.html`);
      await page.locator('#serviceList .record').waitFor();
      const measurements = await page.evaluate(() => {
        const bounds = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width }; };
        const textOverflow = ['.vehicle-copy', '#serviceList .record-main > div', '#reminderList .record > div:first-child', '#lastService'].filter(selector => { const el = document.querySelector(selector); return el.scrollWidth > el.clientWidth + 1; });
        return { width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, main: bounds('main'), hero: bounds('.vehicle-hero'), vehicleText: bounds('.vehicle-copy'), service: bounds('#serviceList .record'), serviceText: bounds('#serviceList .record-main > div'), reminder: bounds('#reminderList .record'), reminderText: bounds('#reminderList .record > div:first-child'), textOverflow };
      });
      assert.ok(measurements.scrollWidth <= measurements.width + 1, `${width}: document overflow ${JSON.stringify(measurements)}`);
      assert.deepEqual(measurements.textOverflow, [], `${width}: clipped text`);
      for (const [parent, child] of [['hero', 'vehicleText'], ['service', 'serviceText'], ['reminder', 'reminderText']]) {
        assert.ok(measurements[child].right <= measurements[parent].right + 1, `${width}: ${child} exceeds ${parent}: ${JSON.stringify(measurements)}`);
      }
      if (width === 1920) assert.ok(measurements.main.width >= 1600, `Desktop workspace too narrow: ${JSON.stringify(measurements)}`);
      if (width <= 390) assert.ok(measurements.height > height, 'Populated phone content must remain scrollable');
      await page.locator('#editVehicle').click();
      assert.equal(await page.locator('#vehicleDialog').isVisible(), true);
      await page.locator('#vehicleForm [name=odometer]').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('#vehicleForm [name=odometer]').isVisible(), true);
      await page.locator('#vehicleDialog .close').first().click();
      await page.locator('#serviceList button.edit').click();
      const panels=await page.locator('.space-panels').evaluate(track=>({
        count:track.querySelectorAll(':scope > .space-panel').length,
        snap:getComputedStyle(track).scrollSnapType,
        left:track.scrollLeft
      }));
      assert.equal(panels.count,3);
      if(width<=900){assert.match(panels.snap,/x mandatory/);assert.ok(panels.left>0);}
      assert.equal(await page.locator('#serviceForm [name=work]').inputValue(), fixture.services[0].work);
      await page.locator('#serviceDialog .close').first().click();
      await page.locator('#reminderList button.edit').click();
      assert.equal(await page.locator('#reminderForm [name=title]').inputValue(), fixture.reminders[0].title);
      await page.locator('#reminderDialog .close').first().click();
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Garage responsive layout, long records, dialogs and scrolling passed.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });