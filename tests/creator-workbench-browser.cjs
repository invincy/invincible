const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),http=require("node:http");
const{chromium}=require("playwright"),root=path.resolve(__dirname,"..");
const fixture=[
"export const db={},auth={currentUser:{uid:'owner',email:'owner@example.com'}},authReady=Promise.resolve();",
"export function observeAuth(callback){queueMicrotask(()=>callback(auth.currentUser));return()=>{}}",
"export const storageError=error=>error.message||'Save failed';",
"let listeners=[];const read=()=>JSON.parse(localStorage.getItem('workbench.fixture')||'{}');",
"export const doc=(db,...parts)=>parts.join('/');export const serverTimestamp=()=>Date.now();",
"function snapshot(ref){const data=read();return {exists:()=>!!data[ref],data:()=>data[ref],metadata:{hasPendingWrites:false}}}",
"export async function getDoc(ref){return snapshot(ref)}",
"export function onSnapshot(ref,...args){const callback=args.find(item=>typeof item==='function');const notify=()=>callback(snapshot(ref));listeners.push(notify);queueMicrotask(notify);return()=>listeners=listeners.filter(item=>item!==notify)}",
"export async function setDoc(ref,value){const all=read();all[ref]={...all[ref],...value};localStorage.setItem('workbench.fixture',JSON.stringify(all));listeners.forEach(listener=>listener())}"
].join("\n");
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,"http://localhost").pathname;
 res.setHeader("Content-Type",/\.m?js$/.test(pathname)?"text/javascript":pathname.endsWith(".css")?"text/css":"text/html");
 if(pathname==="/fixture.mjs"||pathname==="/invincible/shared/firebase-client.js"){res.end(fixture);return}
 try{
  let file=path.join(root,pathname.replace(/^\/invincible\/?/,""));if(fs.statSync(file).isDirectory())file=path.join(file,"index.html");
  let source=fs.readFileSync(file,"utf8").replaceAll("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js","/fixture.mjs");
  if(file.endsWith(".html"))source=source.replace(/<script[^>]*src="\.\.\/site-nav[^>]*><\/script>/,"");
  res.end(source);
 }catch{res.statusCode=404;res.end("Missing")}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const base="http://127.0.0.1:"+server.address().port+"/invincible/creator/project.html?id=gaganyaan";
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on("pageerror",error=>errors.push(error.message));page.on("dialog",dialog=>dialog.accept());
  const legacy={title:"Gaganyaan",ownerUid:"owner",ownerEmail:"owner@example.com",editorEmails:[],script:"Legacy narration",notes:"Keep",custom:{keep:true},scenes:[{id:"legacy-scene",voiceover:"Legacy narration",visual:"Old visual",assets:"LVM3",duration:6,imagePrompt:"Still",videoPrompt:"Move",completed:false,custom:"keep-scene"}]};
  await page.goto(base);await page.evaluate(value=>localStorage.setItem("workbench.fixture",JSON.stringify({"creatorProjects/gaganyaan":value})),legacy);await page.reload();
  await page.locator("#app").waitFor({state:"visible"});assert.equal(await page.locator(".storyboard-scene").count(),1);assert.equal(await page.locator("#projectTitle").innerText(),"Gaganyaan");
  const tsv=["Voiceover\tVisual / Animation\tAssets Required\tTimeline\tProduction Method\tAnimation Group\tBlender Prompt"];
  for(let index=0;index<16;index++)tsv.push("Scene "+(index+1)+"\tVisual "+(index+1)+"\tModel\t"+(index*5)+"–"+((index+1)*5)+"s\t"+(index%2?"AI Video":"Blender + Editing")+"\tUpper Assembly\tAnimate scene "+(index+1));
  await page.locator("#importDetails summary").click();await page.locator("#importInput").fill(tsv.join("\n"));await page.locator("#previewImport").click();
  assert.match(await page.locator("#previewSummary").innerText(),/16 scenes/);await page.locator("#confirmImport").click();assert.equal(await page.locator(".storyboard-scene").count(),17);
  await page.locator("[data-view=production]").click();await page.locator("[data-method=Blender]").click();assert.equal(await page.locator(".production-card").count(),8);
  await page.locator("#groupBy").selectOption("animation");assert.match(await page.locator(".queue-group h3").first().innerText(),/Upper Assembly/);
  const first=page.locator(".production-card").first();await first.locator("[data-work-action=model]").click();assert.equal(await first.locator("[data-workflow-method=Blender]").inputValue(),"Animating");
  await page.locator("[data-view=storyboard]").click();assert.equal(await page.locator("[data-scene-field=sceneStatus]").nth(1).inputValue(),"Planned");
  await page.waitForTimeout(900);await page.reload();await page.locator("#app").waitFor({state:"visible"});assert.equal(await page.locator(".storyboard-scene").count(),17);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("workbench.fixture"))["creatorProjects/gaganyaan"]);assert.deepEqual(stored.custom,{keep:true});assert.equal(stored.scenes[0].custom,"keep-scene");assert.equal(stored.scenes.length,17);
  await page.setViewportSize({width:390,height:844});await page.locator("[data-view=storyboard]").click();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert.ok(overflow<=1,"mobile page must not overflow horizontally");
  assert.equal(await page.locator(".storyboard-header").evaluate(element=>getComputedStyle(element).display),"none");
  assert.deepEqual(errors,[]);
  console.log("Creator production workbench browser tests passed");
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
