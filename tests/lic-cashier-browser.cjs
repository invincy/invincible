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
export async function runTransaction(db,fn){if(window.failSave)throw {code:'permission-denied'};const writes=[];const result=await fn({get:async ref=>{await new Promise(r=>setTimeout(r,window.readDelay||0));return snapshot(ref)},set:(ref,value)=>writes.push([ref.path,value])});const data=read();writes.forEach(([key,value])=>data[key]=value);localStorage.setItem('test.cashier',JSON.stringify(data));window.refreshCashier();if(window.failAfterCommit){window.failAfterCommit=false;throw {code:'unavailable'}}return result;}
`;
const server = http.createServer((req,res) => {
  let url=req.url.split('?')[0];res.setHeader('Content-Type',/\.(mjs|js)$/.test(url)?'text/javascript':url.endsWith('.css')?'text/css':'text/html');
  if(url==='/test-cashier.mjs')return res.end(fixture);
  if(url==='/invincible/shared/firebase-client.js')return res.end(`export const db={};export const auth={currentUser:{uid:'account-a'}};export async function observeAuth(cb){window.testAuth=user=>{auth.currentUser=user;cb(user)};queueMicrotask(()=>cb(auth.currentUser))}export const storageError=e=>e.message||e.code;`);
  try{if(url.endsWith('/'))url+='index.html';const file=path.join(root,url.replace(/^\/invincible\//,''));let body=fs.readFileSync(file);if(file.endsWith('/cashier/storage.js'))body=body.toString().replace('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js','/test-cashier.mjs');res.end(body)}catch{res.statusCode=404;res.end('Missing')}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:354,height:680}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const base=`http://127.0.0.1:${server.address().port}/invincible/lic/`;
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('test.cashier')||'{}'));
  const entries=data=>Object.entries(data).filter(([key])=>key.includes('/transactions/'));
  const notes=(n,value)=>page.locator(`[data-count="${n}"]`).fill(String(value));
  const amount=value=>page.locator('#amountInput').fill(value);
  const theme=async value=>{await page.locator('#openMenu').click();await page.locator(`[data-theme-choice=${value}]`).click();await page.getByRole('button',{name:'Close menu',exact:true}).click()};
  const fit=async label=>{
    const result=await page.evaluate(()=>{
      const controls=[...document.querySelectorAll('#previousEntry,#openMenu,#amountInput,#addAmount,#receivedMode,#returnedMode,#denominations [data-note],#denominations [data-count],#denominations [data-subtotal],#openCoins,#loose,#nextTransaction,#closeCounter')];
      return {width:innerWidth,height:innerHeight,scrollX:scrollX,scrollY:scrollY,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,mainHeight:document.querySelector('main').scrollHeight,mainClient:document.querySelector('main').clientHeight,controls:controls.map(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {id:el.id||el.getAttribute('aria-label'),interactive:el.matches('button,input'),top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,width:r.width,reachable:!!hit&&(el===hit||el.contains(hit))}})};
    });
    assert.ok(result.documentWidth<=result.width,`Horizontal scroll ${label}`);
    assert.ok(result.documentHeight<=result.height+1,`Page scroll ${label}`);
    assert.ok(result.mainHeight<=result.mainClient+1,`Clipped main content ${label}`);
    assert.equal(result.scrollY,0,`Scroll offset ${label}`);
    for(const control of result.controls){
      assert.ok(control.top>=0&&control.bottom<=result.height+1&&control.left>=0&&control.right<=result.width+1,`${label}: offscreen ${JSON.stringify(control)}`);
      assert.ok(control.height>=(control.interactive?24:1),`${label}: unusable control ${JSON.stringify(control)}`);
      assert.ok(control.reachable,`${label}: obscured control ${JSON.stringify(control)}`);
    }
  };
  try {
    await page.route('https://**/*',route=>route.abort());await page.goto(base);await page.getByRole('link',{name:'Cashier Cash counter & daily tally'}).click();await page.locator('#entryPanel:visible').waitFor();
    assert.equal(await page.locator('#cashPanel').isVisible(),true);
    assert.equal(await page.locator('#countCash,#entrySteps,#startCounter,#startPanel').count(),0);
    assert.equal(await page.locator('#counterPicker').isVisible(),false);
    assert.equal(await page.locator('#logPanel').isVisible(),false);
    assert.equal(await page.locator('.mobile-tabbar').isVisible(),false);
    await fit('initial 354×680');
    await page.emulateMedia({colorScheme:'light'});assert.equal(await page.locator('html').getAttribute('data-cashier-theme'),'light');
    await theme('dark');await page.reload();await page.locator('#entryPanel:visible').waitFor();assert.equal(await page.locator('html').getAttribute('data-cashier-theme'),'dark');
    const initial=Object.entries(await saved()).find(([key])=>key.includes('/licCashCounters/')&&!key.includes('/transactions/'))[1];
    assert.equal(Object.values(initial.opening.counts).reduce((a,b)=>a+b,initial.opening.loose),0);
    // Type and count immediately. There is no progression button or hidden denomination screen.
    await amount('3500');assert.equal(await page.locator('#cashPanel').isVisible(),true);
    for(let i=0;i<5;i++)await page.locator('[data-note="500"][data-add="100"]').click();
    await page.locator('[data-note="500"][data-add="1"]').click();
    assert.equal(await page.locator('[data-count="500"]').inputValue(),'501');assert.match(await page.locator('[data-subtotal="500"]').innerText(),/2,50,500/);
    assert.equal(await page.locator('#amountInput').evaluate(el=>el===document.activeElement),false);
    await fit('501 notes');await page.locator('[data-count="500"]').press('Enter');assert.equal(await page.locator('[data-count="500"]').evaluate(el=>el===document.activeElement),false);await page.locator('[data-note="500"][data-add="1"]').press('Enter');assert.equal(await page.locator('[data-count="500"]').inputValue(),'502');
    await notes(500,7);await notes(100,5);assert.match(await page.locator('#saveState').innerText(),/Change to give/);
    await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('Balance'));assert.equal(entries(await saved()).length,0);await fit('validation error');
    await page.locator('#returnedMode').click();await notes(100,5);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#amountInput').value==='');assert.equal(entries(await saved()).length,1);assert.equal(await page.locator('#closeDialog').isVisible(),false);await page.locator('#previousEntry:enabled').waitFor();await amount('999');const firstReviewData=await saved();await page.locator('#previousEntry').click();assert.equal(await page.locator('#logTitle').innerText(),'Entry #1');assert.equal(await page.locator('#olderEntry').isDisabled(),true);assert.equal(await page.locator('#newerEntry').isDisabled(),true);assert.match(await page.locator('.log-entry:not([hidden])').innerText(),/3,500/);await page.getByRole('button',{name:'Close log',exact:true}).click();assert.equal(await page.locator('#amountInput').inputValue(),'999');assert.deepEqual(await saved(),firstReviewData);
    // Multiple amounts remain available in a secondary editor, without expanding the working screen.
    await amount('600');await page.locator('#addAmount').click();await page.locator('#addAmountLine').click();await page.locator('#doneAmounts').click();assert.equal(await page.locator('#amountDialog').isVisible(),true);assert.ok((await page.locator('#amountError').textContent()).length>0);await page.locator('#amounts .line-amount').nth(1).fill('400');await page.locator('#doneAmounts').click();assert.equal(await page.locator('#amountInput').inputValue(),'1000');assert.equal(await page.locator('#amountInput').isEditable(),false);await notes(100,10);await fit('multiple amounts');
    await page.evaluate(()=>window.failSave=true);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('permission-denied'));await page.evaluate(()=>window.failSave=false);
    await page.reload();await page.locator('#entryPanel:visible').waitFor();assert.equal(await page.locator('#amountInput').inputValue(),'1000');assert.equal(await page.locator('[data-count="100"]').inputValue(),'10');
    await page.evaluate(()=>window.failAfterCommit=true);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('unavailable'));assert.equal(entries(await saved()).length,2);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#amountInput').value==='');assert.equal(entries(await saved()).length,2);
    await amount('500');await notes(500,1);
    const reviewData=await saved(),reviewDraft=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('invincible.cashier.draft.'))));await page.locator('#previousEntry').click();assert.equal(await page.locator('#logTitle').innerText(),'Entry #2');assert.match(await page.locator('.log-entry:not([hidden])').innerText(),/600/);assert.match(await page.locator('.log-entry:not([hidden])').innerText(),/400/);await page.locator('#logDialog').evaluate(el=>el.scrollTop=el.scrollHeight);assert.ok(await page.locator('#olderEntry').evaluate(el=>{const r=el.getBoundingClientRect(),d=document.querySelector('#logDialog').getBoundingClientRect();return r.top>=d.top&&r.bottom<=d.bottom}));await page.locator('#olderEntry').click();assert.equal(await page.locator('#logTitle').innerText(),'Entry #1');await page.locator('#newerEntry').click();assert.equal(await page.locator('#logTitle').innerText(),'Entry #2');await page.locator('#showAllEntries').click();assert.equal(await page.locator('.log-entry:not([hidden])').count(),2);await page.getByRole('button',{name:'Close log',exact:true}).click();assert.equal(await page.locator('#amountInput').inputValue(),'500');assert.equal(await page.locator('[data-count="500"]').inputValue(),'1');assert.deepEqual(await saved(),reviewData);assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('invincible.cashier.draft.')))),reviewDraft);
    // Coin detail is a dialog; the cashier itself never grows or scrolls.
    await page.locator('#openCoins').click();await notes(5,2);assert.match(await page.locator('#coinTotal').innerText(),/10/);await notes(5,0);await page.getByRole('button',{name:'Close coins',exact:true}).click();await fit('coin dialog closed');
    fs.mkdirSync(path.join(root,'.test-output'),{recursive:true});
    for(const selectedTheme of ['light','dark']){
      await theme(selectedTheme);
      for(const [width,height]of [[320,568],[354,480],[354,640],[360,640],[393,740],[430,820],[768,1024],[1440,900],[844,390]]){
        await page.setViewportSize({width,height});assert.ok((await page.locator('[data-note="500"][data-add="1"]').boundingBox()).width<(await page.locator('[data-note="500"][data-add="100"]').boundingBox()).width);await fit(`${selectedTheme} ${width}×${height}`);
        await page.screenshot({path:path.join(root,`.test-output/lic-cashier-screen-${selectedTheme}-${width}x${height}.png`)});
        await page.mouse.wheel(0,600);await fit(`after wheel ${selectedTheme} ${width}×${height}`);
      }
    }
    await page.setViewportSize({width:354,height:680});
    await page.locator('#closeCounter').click();await page.locator('#cancelClose').click();assert.equal(entries(await saved()).length,2);assert.equal(await page.locator('#amountInput').inputValue(),'500');
    await page.locator('#closeCounter').click();await page.locator('#confirmClose').click();await page.locator('#closingSummary:visible').waitFor();assert.equal(entries(await saved()).length,3);
    let data=await saved(), closedPath=Object.keys(data).find(key=>key.includes('/licCashCounters/')&&!key.includes('/transactions/')&&data[key].status==='closed');
    assert.equal(data[closedPath].collected,500000);assert.equal(data[closedPath].balance.counts[500],8);assert.equal(data[closedPath].balance.counts[100],10);assert.match(await page.locator('#closingSummary').innerText(),/5,000/);
    assert.ok(await page.locator('#closingSummary').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight));
    await page.reload();await page.locator('#entryPanel:visible').waitFor();await page.locator('#openMenu').click();await page.locator('#counterPicker').selectOption(closedPath.split('/').pop());await page.locator('#closingSummary:visible').waitFor();await page.locator('#openMenu').click();await page.locator('#openLog').click();await page.locator('.log-entry').first().waitFor();assert.equal(await page.locator('.log-entry').count(),3);await page.locator('.log-entry summary').first().click();assert.match(await page.locator('.log-entry').first().innerText(),/Cash received/);await page.getByRole('button',{name:'Close log',exact:true}).click();
    await page.locator('#newCounter').click();await page.locator('#entryPanel:visible').waitFor();await amount('250');await notes(500,1);await page.locator('#returnedMode').click();await notes(50,5);await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('Not enough'));
    await amount('500');await notes(50,0);await page.locator('#loose').fill('x');await page.locator('#closeCounter').click();await page.locator('#confirmClose').click();await page.waitForFunction(()=>document.querySelector('#closeError').textContent.includes('valid amount'));await page.locator('#cancelClose').click();await page.locator('#loose').fill('0');
    // Stale listeners/in-flight saves cannot expose or write another account's entry.
    await page.evaluate(()=>window.readDelay=100);await page.locator('#nextTransaction').click();await page.evaluate(()=>{window.oldCashier=window.staleCashier;window.testAuth({uid:'account-b'});window.oldCashier()});await page.locator('#entryPanel:visible').waitFor();await page.waitForTimeout(350);assert.equal(entries(await saved()).length,3);assert.equal(await page.locator('#amountInput').inputValue(),'');
    await page.evaluate(()=>window.testAuth(null));assert.equal(await page.locator('#workspace').isVisible(),false);await page.locator('#openMenu').click();assert.equal(await page.locator('#counterPicker option').count(),1);assert.equal(await page.locator('#counterLabel').innerText(),'');assert.equal(await page.locator('#openLog').isDisabled(),true);assert.equal(await page.locator('#previousEntry').isDisabled(),true);await page.getByRole('button',{name:'Close menu',exact:true}).click();await page.evaluate(()=>{window.readDelay=0;window.testAuth({uid:'account-a'})});await page.locator('#entryPanel:visible').waitFor();assert.equal(await page.locator('#amountInput').inputValue(),'500');assert.equal(await page.locator('[data-count="500"]').inputValue(),'1');
    await page.locator('#nextTransaction').click();await page.waitForFunction(()=>document.querySelector('#amountInput').value==='');assert.equal(entries(await saved()).length,4);await page.locator('#closeCounter').click();await page.locator('#confirmClose').click();await page.locator('#closingSummary:visible').waitFor();assert.equal(entries(await saved()).length,4);
    await page.evaluate(()=>{window.failSave=true;window.testAuth({uid:'account-c'})});await page.locator('#retryCounter:visible').waitFor();await page.evaluate(()=>window.failSave=false);await page.locator('#retryCounter').click();await page.locator('#entryPanel:visible').waitFor();
    await page.evaluate(()=>{window.failAfterCommit=true;window.testAuth({uid:'account-d'})});await page.locator('#entryPanel:visible').waitFor();assert.equal(Object.keys(await saved()).filter(key=>key.startsWith('users/account-d/licCashCounters/')&&!key.includes('/transactions/')).length,1);
    assert.deepEqual(errors,[]);console.log('Cashier single-screen checks passed: quick previous-entry review with Older/Newer and preserved drafts, content-weighted button widths, immediate counting, no page scroll or obscured controls in both themes at phone/tablet/desktop/landscape sizes, 501 notes, multi-amount/coin/history dialogs, retries, balances, closing, recovery and account guards.');
  }catch(error){console.error({pageErrors:errors,status:await page.locator('#status').textContent(),error:await page.locator('#error').textContent()});throw error;}
  finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
