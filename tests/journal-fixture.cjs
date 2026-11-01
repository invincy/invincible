const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),bundle=fs.readFileSync(path.join(root,'journal/assets/journal-v11.js'),'utf8');
const start=bundle.indexOf('window.__journalApi={'),bridge=bundle.slice(start,bundle.indexOf(';return T.jsxs',start));
const renderStart=bundle.indexOf('dh='),renderer=bundle.slice(renderStart,bundle.indexOf(';function d_()',renderStart));
assert.ok(bridge.includes('setSettings:')&&renderer.startsWith('dh='));
const pageSource=fs.readFileSync(path.join(root,'journal/index.html'),'utf8'),guardStart=pageSource.indexOf('(function journalInputGuard()'),guard=pageSource.slice(guardStart,pageSource.indexOf('})();',guardStart)+5);
function createJournalServer(){return http.createServer((req,res)=>{
 const request=new URL(req.url,'http://localhost'),url=request.pathname;
 if(url==='/'){
  const notebook=request.searchParams.has('notebook'),setup=`let journalLoading=false,t={uid:localStorage.getItem('fixture.account')||'fixture'},u='2026-10-26';const Fs={confirmed:true},Et={current:false},c=z=>{u=z;hydrate();},uh=async()=>({}),ch=async()=>t,Oy=(_, ...parts)=>parts.join('/'),lx=async(path,record)=>{if(window.failIdea)throw Error('denied');localStorage.setItem(path,JSON.stringify(record));};
   let d='pen',m='#000000',k=2,x=18,v=1,j='stroke',_=28;const Ut=[];
   const A=z=>m=z,P=z=>k=z,w=z=>x=z,y=z=>v=z,E=z=>j=z,I=z=>_=z,L=()=>{};
   const p=z=>{d=z;document.querySelectorAll('[data-native-tool]').forEach(b=>b.classList.toggle('active',b.dataset.nativeTool===z));};
   const Ft={current:document.querySelector('.canvas-container')},fe={current:document.querySelector('#base-canvas')},de={current:document.querySelector('#live-canvas')};
   const M2=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});let ${renderer};
   const ac=()=>{const ctx=fe.current.getContext('2d');ctx.clearRect(0,0,fe.current.width,fe.current.height);Ut.forEach(stroke=>window.__journalApi.render(ctx,stroke));};
   const persist=()=>{if(${notebook})localStorage.setItem('fixture.journal.'+t.uid+'.'+u,JSON.stringify(Ut));};
   const hydrate=()=>{Ut.splice(0);if(${notebook})Ut.push(...JSON.parse(localStorage.getItem('fixture.journal.'+t.uid+'.'+u)||'[]'));if(window.__journalApi)ac();};
   const journalSaveStroke=stroke=>{const old=Ut.findIndex(item=>item.id===stroke.id);if(old>=0)Ut[old]=structuredClone(stroke);else Ut.push(structuredClone(stroke));persist();ac();};
   const journalDeleteStroke=id=>{const index=Ut.findIndex(item=>item.id===id);if(index>=0)Ut.splice(index,1);persist();ac();};
   const Ci=stroke=>window.__journalHistory?window.__journalHistory.record('save',stroke,Ut,()=>journalSaveStroke(stroke)):journalSaveStroke(stroke),Ve=id=>window.__journalHistory?window.__journalHistory.record('remove',id,Ut,()=>journalDeleteStroke(id)):journalDeleteStroke(id);
   const We=()=>window.__journalHistory?.undo(),kn=()=>window.__journalHistory?.redo();
   ${bridge};hydrate();
   const resizeCanvas=()=>{for(const canvas of [fe.current,de.current]){canvas.width=Ft.current.clientWidth;canvas.height=Ft.current.clientHeight;canvas.style.width=Ft.current.clientWidth+'px';canvas.style.height=Ft.current.clientHeight+'px';}ac();};resizeCanvas();window.addEventListener('resize',resizeCanvas);
   window.drawSample=()=>{const settings=window.__journalApi.settings(),tool=window.__journalApi.tool();Ci({id:crypto.randomUUID(),tool,color:settings.color,opacity:tool==='eraser'?1:settings.opacity,width:tool==='eraser'?settings.eraserWidth:tool==='highlighter'?settings.highlighterWidth:settings.penWidth,points:[{x:100,y:100},{x:300,y:100}]});};
   window.switchJournalAccount=uid=>{t={uid};if(${notebook})localStorage.setItem('fixture.account',uid);hydrate();};window.journalLoading=value=>journalLoading=value;window.pixel=()=>Array.from(fe.current.getContext('2d').getImageData(200,100,1,1).data);
   document.addEventListener('click',event=>{const button=event.target.closest('[title]');if(button?.title==='Undo')We();if(button?.title==='Redo')kn();});
   window.addEventListener('keydown',event=>{if(event.target.closest('input,textarea,select'))return;if((event.ctrlKey||event.metaKey)&&event.key==='z'){event.preventDefault();event.shiftKey?kn():We();}});
   window.penEvents=0;de.current.addEventListener('pointerdown',event=>{if(event.pointerType==='pen')window.penEvents++;});`;
  const css=['drawing-tools.css','canvas-workspace.css','canvas-cards.css'];
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><meta name="viewport" content="width=device-width">${notebook?'<link rel="stylesheet" href="/journal/assets/index-DSgeQfSP.css">':''}${css.map(name=>`<link rel="stylesheet" href="/journal/${name}">`).join('')}${notebook?'<link rel="stylesheet" href="/journal/notebook.css">':''}<body class="journal-page">${notebook?'<nav class="global-nav">Old navigation</nav><nav class="mobile-tabbar">Old tabs</nav><div id="root"><div class="app-container" style="height:100vh;display:flex;flex-direction:column"><div class="topbar">Oversized Journal header and date</div>':''}<div class="toolbar"><div>${['Pen','Highlighter','Eraser'].map(label=>`<div class="icon-btn" role="button" tabindex="0" title="${label}" data-native-tool="${label.toLowerCase()}"><svg/></div>`).join('')}</div><div></div><div>0 strokes</div><div><div class="icon-btn" role="button" title="Undo"><svg/></div><div class="icon-btn" role="button" title="Redo"><svg/></div></div></div><div class="canvas-container" style="position:relative;height:400px;background:white">${notebook?'<div class="background-layer" style="position:absolute;inset:0;z-index:0"></div>':''}<canvas id="base-canvas" width="600" height="400" style="${notebook?'position:absolute;inset:0;z-index:1':''}"></canvas><canvas id="live-canvas" width="600" height="400" style="position:absolute;inset:0;z-index:120"></canvas></div>${notebook?'</div></div>':''}<script>${setup}</script><script>${guard}</script>${notebook?'<script src="/journal/edit-history.js"></script>':''}<script src="/journal/advanced-tools.js"></script><script src="/journal/drawing-tools.js"></script><script src="/journal/canvas-workspace.js"></script><script type="module" src="/journal/canvas-cards.js"></script>${notebook?'<script type="module" src="/journal/notebook.js"></script>':''}`);return;
 }
 try{res.setHeader('Content-Type',url.endsWith('.css')?'text/css':'text/javascript');res.end(fs.readFileSync(path.join(root,url)));}catch{res.statusCode=404;res.end('Missing');}
});}
module.exports={createJournalServer};
