// Synthetic customer records only. This exercises the real page and storage adapter, never production Firebase.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const fixture = `
export const db = {}; let listeners = [];
const read = () => JSON.parse(localStorage.getItem('test.lic') || '{}');
const snap = (ref) => {
 const data = read();
 if (ref.kind === 'doc') return { exists: () => !!data[ref.path], data: () => data[ref.path], metadata: { hasPendingWrites: false, fromCache: false } };
 const prefix = ref.path + '/', docs = Object.entries(data).filter(([key]) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/')).map(([key, value]) => ({ id: key.slice(prefix.length), data: () => value }));
 if (ref.order) docs.sort((a,b) => String(b.data().at).localeCompare(String(a.data().at)));
 return { docs, metadata: { hasPendingWrites: false, fromCache: false } };
};
export const doc = (db, ...parts) => ({ kind: 'doc', path: parts.join('/') });
export const collection = (db, ...parts) => ({ kind: 'collection', path: parts.join('/') });
export const getDocsFromServer = async ref => snap(ref);
export const query = (ref, order) => ({ ...ref, order });
export const orderBy = (...args) => args;
export const serverTimestamp = () => new Date().toISOString();
export function onSnapshot(ref, options, callback, error) {
 if (typeof options === 'function') { error = callback; callback = options; }
 const listener = { ref, callback, error }; listeners.push(listener); queueMicrotask(() => callback(snap(ref)));
 window.staleSnapshot = () => callback(snap(ref));
 return () => { listeners = listeners.filter(item => item !== listener); };
}
export async function runTransaction(db, callback) {
 window.txCount = (window.txCount || 0) + 1;
 if (window.failSave || window.txCount === window.failAt) throw { code: 'permission-denied' };
 const writes = []; const result = await callback({ get: async ref => { if (writes.length) throw Error('Read after write'); return snap(ref); }, set: (ref, data) => writes.push([ref.path, data]) });
 await new Promise(resolve => setTimeout(resolve, window.saveDelay || 10));
 const data = read(); for (const [key, value] of writes) data[key] = value;
 localStorage.setItem('test.lic', JSON.stringify(data)); listeners.forEach(item => item.callback(snap(item.ref)));
 if (window.failAfterCommit) { window.failAfterCommit = false; throw { code: 'unavailable' }; }
 return result;
}`;
const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  res.setHeader('Content-Type', /\.(js|mjs)$/.test(url) ? 'text/javascript' : url.endsWith('.css') ? 'text/css' : 'text/html');
  if (url === '/test-firestore.mjs') return res.end(fixture);
  if (url === '/invincible/ai/') return res.end('<!doctype html><title>AI widget fixture</title>');
  if (url === '/invincible/shared/firebase-client.js') return res.end(`export const db={};export async function observeAuth(callback){window.testAuth=callback;queueMicrotask(()=>callback({uid:'account-a'}));return()=>{}}export const storageError=e=>'Save failed: '+(e.code||e.message);`);
  try {
    if (url.endsWith('/')) url += 'index.html';
    const file = path.join(root, url.replace(/^\/invincible\//, ''));
    let content = fs.readFileSync(file);
    if (file.endsWith('storage.js')) content = content.toString().replace('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js', '/test-firestore.mjs');
    res.end(content);
  } catch { res.statusCode = 404; res.end('Missing'); }
});
const header = 'Policyno,PH Name,Plan,Net Amount,Due Date,PH Mobile,OP_Neft1,OP_Neft2,OP_Neft3';
const csv = header + '\n00123,Asha Example,28,68230,2026-10-12,9876543210,00999,00888,00777\n00456,Bhavna Example,14,1627,2026-03-23,NA,00666,,\n00789,Chandra Example,28,200,2026-11-01,12345,00555,,\n00890,<img src=x onerror=alert(1)>,28,0,,9123456789,,,';
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || chromium.executablePath() });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = `http://127.0.0.1:${server.address().port}/invincible/lic/follow-up/`;
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('test.lic') || '{}'));
  const waitSaved = () => page.waitForFunction(() => document.querySelector('#status').textContent.includes('Response and history saved'));
  const pastePreview = async text => {
    await page.locator('#openImport').click(); await page.locator('#csvText').fill(text); await page.locator('#readCSV').click(); await page.locator('#previewCSV').click();
  };
  const confirm = async () => { await page.locator('#confirmImport').click(); await page.locator('#importDialog').waitFor({ state: 'hidden' }); };
  const openPolicy = async name => { await page.locator('.policy-card').filter({ has: page.getByRole('heading', { name, exact: true }) }).getByRole('button', { name: 'Open / log' }).click(); };
  try {
    await page.route('https://**/*', route => route.abort());
    await page.goto(base); await page.locator('#openImport:enabled').waitFor();
    assert.equal(await page.locator('.desktop-nav [data-page=lic][aria-current=page]').count(), 1);
    // Upload and manual mapping are both exercised before the initial import.
    await page.locator('#openImport').click();
    await page.locator('#csvFile').setInputFiles({ name: 'example.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    await page.locator('#mappingSection').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-map=op1]').inputValue(), '6');
    await page.locator('[data-map=phone]').selectOption('-1'); await page.locator('[data-map=phone]').selectOption('5');
    await page.locator('#previewCSV').click(); assert.match(await page.locator('#importSummary').innerText(), /4 unique policies/); await confirm();
    assert.equal(await page.locator('.policy-card').count(), 4); assert.equal(await page.locator('.policy-card img').count(), 0);
    assert.equal(await page.locator('a[href="tel:+919876543210"]').count(), 1);
    await page.locator('#view').selectOption('missing_op'); assert.equal(await page.locator('.policy-card').count(), 2);
    await page.locator('#view').selectOption('new'); assert.equal(await page.locator('.policy-card').count(), 2);
    await page.locator('#view').selectOption('all'); await page.locator('#search').fill('00888'); assert.equal(await page.locator('.policy-card').count(), 1);
    await page.locator('#search').fill(''); await page.locator('#plan').selectOption('14'); assert.equal(await page.locator('.policy-card').count(), 1); await page.locator('#plan').selectOption('');
    await openPolicy('Asha Example'); await page.getByRole('button', { name: 'Submit in 3 days', exact: true }).click();
    const scheduled = await page.locator('#followUpDate').inputValue(); assert.ok(scheduled);
    await page.locator('#note').fill('Customer will submit documents.\nKeep both lines.'); await page.locator('#saveResponse').click(); await waitSaved();
    assert.equal(await page.locator('#history li').count(), 1); assert.match(await page.locator('#history').innerText(), /Keep both lines/);
    await page.locator('[aria-label="Close policy"]').click(); await page.reload(); await page.locator('#openImport:enabled').waitFor();
    await page.locator('#view').selectOption('submitting'); assert.equal(await page.locator('.policy-card').count(), 1); await page.locator('#view').selectOption('all');
    await openPolicy('Asha Example'); assert.equal(await page.locator('#followUpDate').inputValue(), scheduled); await page.locator('#history li').waitFor();
    await page.locator('[aria-label="Close policy"]').click();
    await pastePreview(csv); assert.match(await page.locator('#importSummary').innerText(), /0 new, 4 existing/); await confirm();
    let data = await saved(); assert.equal(Object.keys(data).filter(k => !k.includes('/history/')).length, 4); assert.equal(Object.keys(data).filter(k => k.includes('/history/')).length, 1);
    assert.equal(data['users/account-a/licFollowups/p-00123'].followUpDate, scheduled);
    // Failed writes retain the exact form, then retry without adding duplicate history.
    await openPolicy('Asha Example'); await page.locator('#note').fill('Retain on failure'); await page.evaluate(() => window.failSave = true); await page.locator('#saveResponse').click();
    await page.waitForFunction(() => document.querySelector('#detailError').textContent.includes('permission-denied'));
    assert.equal(await page.locator('#note').inputValue(), 'Retain on failure'); assert.equal(await page.locator('#history li').count(), 1);
    await page.evaluate(() => window.failSave = false); await page.locator('#saveResponse').click(); await waitSaved(); assert.equal(await page.locator('#history li').count(), 2);
    // Lost acknowledgement: the retry sees the same history id and does not append again.
    await page.locator('#note').fill('Uncertain acknowledgement'); await page.evaluate(() => window.failAfterCommit = true); await page.locator('#saveResponse').click();
    await page.waitForFunction(() => document.querySelector('#detailError').textContent.includes('unavailable'));
    await page.locator('#saveResponse').click(); await waitSaved(); assert.equal(await page.locator('#history li').count(), 3);
    await page.locator('[aria-label="Close policy"]').click();
    // Correct missing mobile, reimport, and ensure correction remains callable.
    await openPolicy('Bhavna Example'); await page.locator('summary').click(); await page.locator('#phoneCorrection').fill('9234567890'); await page.locator('#saveResponse').click(); await waitSaved();
    assert.equal(await page.locator('#detailInfo a[href="tel:+919234567890"]').count(), 1); await page.locator('[aria-label="Close policy"]').click();
    await pastePreview(csv); await confirm(); await page.locator('#view').selectOption('missing_op'); assert.equal(await page.locator('.policy-card').count(), 1); await page.locator('#view').selectOption('all');
    // Replacement removes absent cases from active work without deleting their remarks/history.
    const onlyBhavna = header + '\n00456,Bhavna Example,14,1627,2026-03-23,NA,00666,,';
    await pastePreview(onlyBhavna); assert.match(await page.locator('#replacementSummary').innerText(), /3 active cases/); await confirm();
    assert.equal(await page.locator('.policy-card').count(), 1);
    await page.locator('#view').selectOption('archived'); await openPolicy('Asha Example');
    await page.locator('#history li').first().waitFor(); assert.match(await page.locator('#history').innerText(), /Keep both lines/);
    assert.match(await page.locator('#detailInfo').innerText(), /not in the latest replacement CSV/);
    await page.locator('[aria-label="Close policy"]').click(); await page.locator('#view').selectOption('all');
    await pastePreview(csv); await confirm(); assert.equal(await page.locator('.policy-card').count(), 4);
    // Completed and manually removed cases stay archived across reimports, and can be restored.
    await openPolicy('Asha Example'); await page.getByRole('button', { name: 'Completed', exact: true }).click(); await page.locator('#saveResponse').click(); await waitSaved();
    await page.locator('[aria-label="Close policy"]').click(); assert.equal(await page.locator('.policy-card').count(), 3);
    await pastePreview(csv); await confirm(); assert.equal(await page.locator('.policy-card').count(), 3);
    await page.locator('#view').selectOption('archived'); await openPolicy('Asha Example'); await page.locator('#restoreCase').click();
    await page.waitForFunction(() => document.querySelector('#status').textContent.includes('Case restored'));
    assert.match(await page.locator('#history').innerText(), /Keep both lines/); await page.locator('[aria-label="Close policy"]').click(); await page.locator('#view').selectOption('all');
    await openPolicy('Bhavna Example'); await page.evaluate(() => window.failAfterCommit = true); await page.locator('#archiveCase').click();
    await page.waitForFunction(() => document.querySelector('#detailError').textContent.includes('unavailable'));
    await page.locator('#archiveCase').click(); await page.waitForFunction(() => document.querySelector('#status').textContent.includes('Case removed'));
    assert.equal(await page.locator('#history li').count(), 2); await page.locator('[aria-label="Close policy"]').click();
    await pastePreview(csv); await confirm(); assert.equal(await page.locator('.policy-card').count(), 3);
    await page.locator('#view').selectOption('archived'); await openPolicy('Bhavna Example'); await page.locator('#restoreCase').click();
    await page.waitForFunction(() => document.querySelector('#status').textContent.includes('Case restored')); await page.locator('[aria-label="Close policy"]').click(); await page.locator('#view').selectOption('all');
    await pastePreview(onlyBhavna); await page.locator('#importMode').selectOption('merge'); await confirm(); assert.equal(await page.locator('.policy-card').count(), 4);
    // Desktop and narrow phone layouts, including open dialogs, have no horizontal overflow.
    fs.mkdirSync(path.join(root, '.test-output/lic'), { recursive: true });
    for (const width of [1440, 768, 393, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `list overflow at ${width}`);
      await page.screenshot({ path: path.join(root, `.test-output/lic/list-${width}.png`), fullPage: true });
      await openPolicy('Asha Example');
      assert.ok(await page.locator('#detailDialog').evaluate(el => el.scrollWidth <= el.clientWidth), `detail overflow at ${width}`);
      await page.screenshot({ path: path.join(root, `.test-output/lic/detail-${width}.png`) }); await page.locator('[aria-label="Close policy"]').click();
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    // Chunked import failure preserves the acknowledged first batch; retry finishes safely.
    const many = header + '\n' + Array.from({ length: 105 }, (_, i) => `T${i},Test Person ${i},1,100,2026-10-26,9876543210,,,`).join('\n');
    await pastePreview(many); await page.evaluate(() => { window.txCount = 0; window.failAt = 2; }); await page.locator('#confirmImport').click();
    await page.waitForFunction(() => document.querySelector('#importError').textContent.includes('100 policies confirmed'));
    data = await saved(); assert.equal(data['users/account-a/licFollowups/p-00123'].archived, false, 'failed row import must not archive missing cases');
    await page.evaluate(() => window.failAt = 0); await confirm();
    data = await saved(); assert.equal(Object.keys(data).filter(k => !k.includes('/history/')).length, 109);
    await page.locator('#next').click(); assert.match(await page.locator('#pageLabel').innerText(), /Page 2/);
    // Retry even after only part of the missing-case archive phase committed.
    await pastePreview(csv); await page.evaluate(() => { window.txCount = 0; window.failAt = 3; }); await page.locator('#confirmImport').click();
    await page.waitForFunction(() => document.querySelector('#importError').textContent.includes('4 policies confirmed'));
    await page.evaluate(() => window.failAt = 0); await confirm();
    data = await saved(); assert.equal(Object.values(data).filter(r => r.policyNo && !r.archived).length, 4);
    assert.equal(Object.values(data).filter(r => r.policyNo).length, 109, 'replacement never deletes old cases');
    // Account changes close dialogs, clear customer data, and stop stale callbacks.
    await page.locator('#view').selectOption('everything'); await page.locator('#search').fill('Asha'); await openPolicy('Asha Example');
    await page.locator('#note').fill('Old-account in-flight note');
    await page.evaluate(() => window.saveDelay = 250); await page.locator('#saveResponse').click();
    await page.evaluate(() => { const stale = window.staleSnapshot; window.testAuth({ uid: 'account-b' }); stale?.(); });
    await page.locator('#detailDialog').waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.querySelector('#resultCount').textContent === '0 of 0 policies');
    assert.equal(await page.locator('#note').inputValue(), ''); assert.equal(await page.locator('.policy-card').count(), 0);
    await page.waitForTimeout(350); assert.equal(await page.locator('.policy-card').count(), 0); assert.equal(await page.locator('#detailTitle').innerText(), '');
    await page.evaluate(() => window.testAuth(null)); assert.equal(await page.locator('#openImport').isDisabled(), true);
    assert.deepEqual(errors, []);
    console.log('LIC browser checks passed: imports, OP views, logging/history, completion/removal/restoration, replacement and merge imports, archive-preserving reimports, failure recovery, account isolation and 320–1440px layouts.');
  } catch (error) { console.error('Browser errors:', errors); throw error; }
  finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
