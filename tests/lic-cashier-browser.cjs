// Controlled Firestore fixtures only. Never reads or writes production records.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const fixture = `
export const db={}; let listeners=[];
const read=()=>JSON.parse(localStorage.getItem('test.cashier')||'{}');
const snapshot=ref=>{const data=read();if(ref.kind==='doc')return {exists:()=>!!data[ref.path],data:()=>data[ref.path],metadata:{hasPendingWrites:false,fromCache:false}};const prefix=ref.path+'/';let docs=Object.entries(data).filter(([key])=>key.startsWith(prefix)&&!key.slice(prefix.length).includes('/')).map(([key,value])=>({id:key.slice(prefix.length),data:()=>value}));if(ref.order)docs.sort((a,b)=>b.data()[ref.order]-a.data()[ref.order]);return {docs:docs.slice(0,ref.limit||Infinity),metadata:{hasPendingWrites:false,fromCache:false}};};
export const doc=(db,...parts)=>({kind:'doc',path:parts.join('/')});
export const collection=(db,...parts)=>({kind:'collection',path:parts.join('/')});
export const orderBy=(field)=>({order:field});export const limit=n=>({limit:n});export const query=(ref,...options)=>Object.assign({},ref,...options);
export const serverTimestamp=()=>new Date().toISOString();
export function onSnapshot(ref,options,next,error){const listener={ref,next};listeners.push(listener);queueMicrotask(()=>{if(listeners.includes(listener))next(snapshot(ref))});window.refreshCashier=()=>[...listeners].forEach(l=>{if(listeners.includes(l))l.next(snapshot(l.ref))});window.staleCashier=()=>next(snapshot(ref));return()=>{listeners=listeners.filter(l=>l!==listener)};}
export async function runTransaction(db,fn){if(window.failSave)throw {code:'permission-denied'};const writes=[];await fn({get:async ref=>{await new Promise(r=>setTimeout(r,window.readDelay||0));return snapshot(ref)},set:(ref,value)=>writes.push([ref.path,value])});const data=read();writes.forEach(([key,value])=>data[key]=value);localStorage.setItem('test.cashier',JSON.stringify(data));window.refreshCashier();if(window.failAfterCommit){window.failAfterCommit=false;throw {code:'unavailable'}}}
`;
const server = http.createServer((req,res) => {
  let url=req.url.split('?')[0];res.setHeader('Content-Type',/\.(mjs|js)$/.test(url)?'text/javascript':url.endsWith('.css')?'text/css':'text/html');
  if(url==='/test-cashier.mjs')return res.end(fixture);
  if(url==='/invincible/shared/firebase-client.js')return res.end(`export const db={};export const auth={currentUser:{uid:'account-a'}};export async function observeAuth(cb){window.testAuth=user=>{auth.currentUser=user;cb(user)};queueMicrotask(()=>cb(auth.currentUser))}export const storageError=e=>e.message||e.code;`);
  try{if(url.endsWith('/'))url+='index.html';const file=path.join(root,url.replace(/^\/invincible\//,''));let body=fs.readFileSync(file);if(file.endsWith('/cashier/storage.js'))body=body.toString().replace('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js','/test-cashier.mjs');res.end(body)}catch{res.statusCode=404;res.end('Missing')}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}/invincible/lic/`;
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('test.cashier')||'{}'));
  const entries=data=>Object.entries(data).filter(([key])=>key.includes('/transactions/'));
  const notes=(n,value)=>page.locator(`[data-count="${n}"]`).fill(String(value));
  const amount=value=>page.locator('.amount-input').first().fill(value);
  try {
    await page.route('https://**/*',route=>route.abort());await page.goto(base);await page.getByRole('link',{name:'Cashier Cash counter & daily tally'}).click();await page.locator('#startCounter:visible').waitFor();
    await notes(100,5);await page.locator('#startCounter').click();await page.locator('#entryPanel:visible').waitFor();
    await amount('3500');await notes(500,8);assert.match(await page.locator('#runningSummary').innerText(),/Change still to give/);
    await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('Balance'));assert.equal(entries(await saved()).length,0);
    await page.locator('#returnedMode').click();await notes(100,5);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('.amount-input').value==='');assert.equal(entries(await saved()).length,1);assert.equal(await page.locator('#closeDialog').isVisible(),false);
    // Multiple premium amounts in a single logged cash exchange; count buttons add notes.
    await amount('600');await page.locator('#addAmount').click();await page.locator('.amount-input').nth(1).fill('400');await page.locator('[data-step="5"]').click();await page.locator('[data-note="100"]').click();assert.equal(await page.locator('[data-count="100"]').inputValue(),'5');await notes(100,10);
    await page.evaluate(()=>window.failSave=true);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('permission-denied'));assert.equal(await page.locator('.amount-input').first().inputValue(),'600');await page.evaluate(()=>window.failSave=false);
    await page.reload();await page.locator('#entryPanel:visible').waitFor();assert.equal(await page.locator('.amount-input').first().inputValue(),'600');assert.equal(await page.locator('.amount-input').count(),2);
    await page.evaluate(()=>window.failAfterCommit=true);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('unavailable'));assert.equal(entries(await saved()).length,2);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('.amount-input').value==='');assert.equal(entries(await saved()).length,2);
    // Cancel close leaves the current entry editable and unsaved.
    await amount('500');await notes(500,1);await page.locator('#closeCounter').click();assert.equal(await page.locator('#closeDialog').isVisible(),true);await page.locator('#cancelClose').click();assert.equal(entries(await saved()).length,2);assert.equal(await page.locator('.amount-input').inputValue(),'500');
    await page.locator('#closeCounter').click();await page.locator('#confirmClose').click();await page.locator('#closingSummary:visible').waitFor();assert.equal(entries(await saved()).length,3);let data=await saved(), counter=Object.entries(data).find(([key,value])=>key.includes('/licCashCounters/')&&!key.includes('/transactions/')&&value.status==='closed')[1];assert.equal(counter.collected,500000);assert.equal(counter.balance.counts[500],9);assert.equal(counter.balance.counts[100],10);assert.match(await page.locator('#closingSummary').innerText(),/5,500/);
    await page.reload();await page.locator('#closingSummary:visible').waitFor();assert.equal(await page.locator('.log-entry').count(),3);await page.locator('.log-entry summary').first().click();assert.match(await page.locator('.log-entry').first().innerText(),/Cash received/);
    fs.mkdirSync(path.join(root,'.test-output'),{recursive:true});
    for(const width of [320,393,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Closing overflow at ${width}`);await page.screenshot({path:path.join(root,`.test-output/lic-cashier-summary-${width}.png`),fullPage:true})}
    await page.locator('#newCounter').click();await page.locator('#startCounter').click();await page.locator('#entryPanel:visible').waitFor();await amount('250');await notes(500,1);await page.locator('#returnedMode').click();await notes(50,5);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('Not enough'));
    // Live state and sensitive drafts cannot cross an account switch or in-flight save.
    await page.locator('#receivedMode').click();await amount('500');await page.locator('#returnedMode').click();await notes(50,0);await page.evaluate(()=>window.readDelay=100);await page.locator('#nextTransaction').click();await page.evaluate(()=>{window.oldCashier=window.staleCashier;window.testAuth({uid:'account-b'});window.oldCashier()});await page.locator('#startCounter:visible').waitFor();await page.waitForTimeout(350);assert.equal(entries(await saved()).length,3);assert.equal(await page.locator('#entryPanel').isVisible(),false);assert.equal(await page.locator('#closingSummary').isVisible(),false);
    await page.evaluate(()=>window.testAuth(null));assert.equal(await page.locator('#workspace').isVisible(),false);await page.evaluate(()=>{window.readDelay=0;window.testAuth({uid:'account-a'})});await page.locator('#entryPanel:visible').waitFor();assert.equal(await page.locator('.amount-input').inputValue(),'500');
    for(const width of [320,393,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Entry overflow at ${width}`);await page.screenshot({path:path.join(root,`.test-output/lic-cashier-entry-${width}.png`),fullPage:true})}
    assert.deepEqual(errors,[]);console.log('Cashier browser checks passed: note counts, batched amounts, cash/change validation, retry deduplication, draft recovery, close confirmation, summaries, logs, account guards and responsive layouts.');
  } finally {await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
