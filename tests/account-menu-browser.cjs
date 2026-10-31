const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'..');
(async()=>{
 let version='2026.11.01.1',offline=false,loads=0;
 const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/invincible/app-version.json'){res.setHeader('Content-Type','application/json');res.statusCode=offline?503:200;res.end(JSON.stringify({version,notes:'Latest changes'}));return;}
  if(pathname==='/invincible/'){loads++;res.setHeader('Content-Type','text/html');res.end(`<meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:black"><div id="host"></div><script type="module">import{mountAccountMenu}from'./shared/account-menu.js';window.menu=mountAccountMenu(document.querySelector('#host'),{user:{uid:'test',displayName:'Test User',email:'test@example.com'},logout:async()=>{if(window.failLogout)throw Error();window.loggedOut=true;}});</script>`);return;}
  try{const file=path.join(root,pathname.replace('/invincible/',''));res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'image/png');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox'],executablePath:process.env.CHROMIUM_EXECUTABLE||chromium.executablePath()});
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,393,834,1440]){
  await page.setViewportSize({width,height:850});await page.goto(`http://127.0.0.1:${server.address().port}/invincible/`);
  await page.getByRole('button',{name:'Profile and settings'}).click();await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Check for updates'}).click();await page.getByText('You’re up to date.').waitFor();
  assert.equal(await page.getByRole('button',{name:'Update and reload'}).isVisible(),false);
  assert.equal(await page.locator('.inv-settings').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}),true);
  fs.mkdirSync(root+'/.test-output',{recursive:true});await page.screenshot({path:root+`/.test-output/settings-${width}.png`});
  await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('.inv-profile')===document.activeElement);
 }
 await page.getByRole('button',{name:'Profile and settings'}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('.inv-account-options').isVisible(),false);
 await page.getByRole('button',{name:'Profile and settings'}).click();await page.getByRole('button',{name:'Settings',exact:true}).click();
 offline=true;await page.getByRole('button',{name:'Check for updates'}).click();await page.getByText('Could not check for updates.',{exact:false}).waitFor();assert.equal(await page.getByRole('button',{name:'Update and reload'}).isVisible(),false);
 offline=false;version='next';await page.getByRole('button',{name:'Check for updates'}).click();await page.getByText('Update next is available.').waitFor();
 await page.evaluate(()=>{localStorage.setItem('saved-work','retained');Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{getRegistration:async()=>({update:async()=>{window.swUpdated=true},waiting:{postMessage:data=>{window.swMessage=data}}})}})});
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Update and reload'}).click();assert.equal(await page.evaluate(()=>window.swUpdated),undefined);
 const before=loads;page.once('dialog',d=>d.accept());await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Update and reload'}).click()]);assert.equal(loads,before+1);assert.equal(await page.evaluate(()=>localStorage.getItem('saved-work')),'retained');
 await page.getByRole('button',{name:'Profile and settings'}).click();await page.evaluate(()=>window.failLogout=true);await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByText('Sign-out did not complete.',{exact:false}).waitFor();await page.evaluate(()=>window.failLogout=false);await page.getByRole('button',{name:'Sign out',exact:true}).click();assert.equal(await page.evaluate(()=>window.loggedOut),true);
 assert.deepEqual(errors,[]);console.log('Profile/settings: current/new/offline update checks, reload/data preservation, sign-out failure/success, keyboard and four layouts passed.');
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
