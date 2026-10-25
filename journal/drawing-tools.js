/* Readable controls for the existing Journal renderer. No second stroke store. */
(()=>{
 'use strict';
 const presets=['#111827','#475569','#94a3b8','#ffffff','#ef4444','#f97316','#f59e0b','#fde047','#84cc16','#16a34a','#10b981','#14b8a6','#06b6d4','#0284c7','#2563eb','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#fb7185','#a16207','#78350f','#312e81'];
 const paths={Pen:'<path d="m16 3 5 5-12 12-6 1 1-6zM14 5l5 5M4 15l5 5"/>',Highlighter:'<path d="m14 3 7 7-9 9-7-7zM5 12l-2 6 3 3 6-2M2 22h10"/>',Eraser:'<path d="m15 3 6 6-11 12H5l-3-4zM8 11l8 8M10 21h12"/>',Undo:'<path d="M3 10h11a6 6 0 0 1 0 12M3 10l6-6M3 10l6 6"/>',Redo:'<path d="M21 10H10a6 6 0 0 0 0 12M21 10l-6-6M21 10l-6 6"/>','Select and transform':'<path d="M4 4h4M4 4v4M20 4h-4M20 4v4M4 20h4M4 20v-4M20 20h-4M20 20v-4M9 9l9 4-4 1-1 4z"/>','Add text':'<path d="M4 5h16M12 5v15M8 20h8"/>','Handwriting tools':'<path d="M3 17c4-9 5-12 8-12 3 0-2 13 1 13 2 0 3-7 6-7 2 0 0 7 4 7M3 22h18"/>'};
 const api=()=>window.__journalApi,key='invincible.journal.tools.v1';
 const defaults={pen:{color:'#111827',width:2,opacity:1},highlighter:{color:'#fde047',width:22,opacity:.35},eraser:{width:28,mode:'stroke'},recent:[]};
 let config;try{config=JSON.parse(localStorage.getItem(key)||'null')||{};}catch{config={};}
 config={...defaults,...config,pen:{...defaults.pen,...config.pen},highlighter:{...defaults.highlighter,...config.highlighter},eraser:{...defaults.eraser,...config.eraser}};
 for(const tool of ['pen','highlighter']){if(!/^#[0-9a-f]{6}$/i.test(config[tool].color))config[tool].color=defaults[tool].color;config[tool].width=Math.max(1,Math.min(80,Number(config[tool].width)||defaults[tool].width));config[tool].opacity=Math.max(.05,Math.min(1,Number(config[tool].opacity)||defaults[tool].opacity));}
 config.eraser.width=Math.max(6,Math.min(160,Number(config.eraser.width)||28));config.eraser.mode=['stroke','pixel'].includes(config.eraser.mode)?config.eraser.mode:'stroke';
 config.recent=(Array.isArray(config.recent)?config.recent:[]).filter(color=>/^#[0-9a-f]{6}$/i.test(color)).slice(0,8);
 let panel=null,mode='',anchor=null,cursor=null;
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(config));}catch{}};
 const apply=tool=>{const value=config[tool];api()?.setSettings?.(tool==='eraser'?{eraserWidth:value.width,eraserMode:value.mode}:{color:value.color,opacity:value.opacity,[tool==='pen'?'penWidth':'highlighterWidth']:value.width});};
 const close=()=>{panel?.remove();panel=null;mode='';};
 const setColor=color=>{
  if(!panel||!config[mode]||mode==='eraser'||!/^#[0-9a-f]{6}$/i.test(color))return;
  config[mode].color=color.toLowerCase();apply(mode);save();
  panel.querySelector('[data-color]').value=color;panel.querySelector('[data-hex]').value=color.toUpperCase();
  panel.querySelectorAll('[data-swatch]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.swatch.toLowerCase()===color.toLowerCase())));
  panel.style.setProperty('--ink',color);
 };
 const remember=color=>{config.recent=[color,...config.recent.filter(value=>value!==color)].slice(0,8);save();};
 function open(tool,button){
  const wasOpen=panel&&mode===tool;close();api().setTool(tool);apply(tool);requestAnimationFrame(()=>window.dispatchEvent(new Event('journal-tool-change')));if(wasOpen)return;
  mode=tool;anchor=button;const value=config[tool];panel=document.createElement('section');
  panel.className='journal-ink-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label',tool==='eraser'?'Eraser settings':tool==='highlighter'?'Highlighter settings':'Pen settings');
  panel.innerHTML='<header><strong>'+tool[0].toUpperCase()+tool.slice(1)+'</strong><button type="button" aria-label="Close drawing settings">×</button></header>'+
   (tool==='eraser'?'<div class="journal-eraser-modes"><button type="button" data-erase="stroke" aria-pressed="'+(value.mode==='stroke')+'">Whole stroke</button><button type="button" data-erase="pixel" aria-pressed="'+(value.mode==='pixel')+'">Area</button></div><p data-erase-hint>'+(value.mode==='stroke'?'Remove an entire line with a tap.':'Erase only the area under the cursor.')+'</p>':
   '<div class="journal-ink-preview" aria-hidden="true"><i></i></div><div class="journal-palette">'+[...new Set([...presets,...config.recent])].map(color=>'<button type="button" data-swatch="'+color+'" aria-label="Use '+color+'" aria-pressed="'+(value.color===color)+'" style="--swatch:'+color+'"></button>').join('')+'</div><div class="journal-custom-color"><label>Custom<input type="color" aria-label="Custom ink color" data-color value="'+value.color+'"></label><label>Hex<input type="text" aria-label="Ink hex color" data-hex maxlength="7" spellcheck="false" value="'+value.color.toUpperCase()+'"></label></div>')+
   '<label class="journal-range">'+(tool==='eraser'?'Eraser size':'Width')+'<span data-width-output>'+value.width+' px</span><input type="range" aria-label="'+(tool==='eraser'?'Eraser size':'Ink width')+'" data-width min="'+(tool==='eraser'?6:1)+'" max="'+(tool==='eraser'?160:tool==='highlighter'?80:40)+'" value="'+value.width+'"></label>'+
   (tool==='eraser'?'':'<label class="journal-range">Opacity<span data-opacity-output>'+Math.round(value.opacity*100)+'%</span><input type="range" aria-label="Ink opacity" data-opacity min="5" max="100" step="5" value="'+value.opacity*100+'"></label>');
  document.body.append(panel);panel.style.setProperty('--ink',value.color||'#fff');panel.style.setProperty('--ink-width',Math.min(value.width,24)+'px');panel.style.setProperty('--ink-opacity',value.opacity||1);
  const r=button.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(r.left,innerWidth-Math.min(320,innerWidth-16)-8))+'px';panel.style.top=Math.min(document.querySelector('.toolbar').getBoundingClientRect().bottom+8,Math.max(8,innerHeight-panel.offsetHeight-12))+'px';
  panel.querySelector('header button').onclick=()=>{close();anchor?.focus();};
  panel.addEventListener('click',event=>{const swatch=event.target.closest('[data-swatch]'),erase=event.target.closest('[data-erase]');if(swatch){setColor(swatch.dataset.swatch);remember(swatch.dataset.swatch);}if(erase){config.eraser.mode=erase.dataset.erase;apply('eraser');save();panel.querySelectorAll('[data-erase]').forEach(button=>button.setAttribute('aria-pressed',String(button===erase)));panel.querySelector('[data-erase-hint]').textContent=erase.dataset.erase==='stroke'?'Remove an entire line with a tap.':'Erase only the area under the cursor.';}});
  panel.addEventListener('input',event=>{const input=event.target;if(input.hasAttribute('data-color'))setColor(input.value);if(input.hasAttribute('data-hex')){const color=input.value.startsWith('#')?input.value:'#'+input.value;input.setCustomValidity(/^#[0-9a-f]{6}$/i.test(color)?'':'Enter a six-digit hex colour.');if(!input.validationMessage)setColor(color);}if(input.hasAttribute('data-width')){config[tool].width=Number(input.value);apply(tool);save();panel.querySelector('[data-width-output]').textContent=input.value+' px';panel.style.setProperty('--ink-width',Math.min(Number(input.value),24)+'px');}if(input.hasAttribute('data-opacity')){config[tool].opacity=Number(input.value)/100;apply(tool);save();panel.querySelector('[data-opacity-output]').textContent=input.value+'%';panel.style.setProperty('--ink-opacity',config[tool].opacity);}});
  panel.addEventListener('change',event=>{if(event.target.matches('[data-color],[data-hex]'))remember(config[tool].color);});
 }
 function install(){
  const toolbar=document.querySelector('.toolbar');if(!toolbar||!api()?.setSettings)return;
  if(!toolbar.dataset.refined){toolbar.dataset.refined='true';apply('pen');}
  toolbar.querySelectorAll('.icon-btn').forEach(button=>{const label=button.title||button.getAttribute('aria-label'),path=paths[label];if(!path||button.dataset.refinedIcon)return;button.dataset.refinedIcon='true';const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';button.style.setProperty('--journal-tool-icon','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")');button.setAttribute('aria-label',label);if(button.tagName!=='BUTTON'){button.setAttribute('role','button');button.tabIndex=0;}});
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('.toolbar .icon-btn'),tool=button?.title?.toLowerCase();
  if(button&&['pen','highlighter','eraser'].includes(tool)&&api()?.setSettings){event.preventDefault();event.stopImmediatePropagation();open(tool,button);}
  else if(button)close();
 },true);
 document.addEventListener('pointerdown',event=>{if(panel&&!panel.contains(event.target)&&!event.target.closest('.toolbar .icon-btn'))close();},true);
 document.addEventListener('keydown',event=>{if(event.defaultPrevented)return;if((event.key==='Enter'||event.key===' ')&&event.target.matches('.toolbar .icon-btn:not(button)')){event.preventDefault();event.target.click();return;}if(event.key==='Escape'&&panel){event.preventDefault();close();anchor?.focus();return;}if(event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select,[contenteditable=true]'))return;const labels={b:'Pen',h:'Highlighter',e:'Eraser',v:'Select and transform',t:'Add text'},label=labels[event.key.toLowerCase()];if(label&&api()){const button=document.querySelector('.toolbar [title="'+label+'"]');if(button){event.preventDefault();button.click();}}});
 document.addEventListener('pointermove',event=>{
  if(event.target.id!=='live-canvas'||api()?.tool?.()!=='eraser'){if(cursor)cursor.hidden=true;return;}
  if(!cursor){cursor=document.createElement('div');cursor.className='journal-eraser-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);}
  const size=(config.eraser.mode==='pixel'?config.eraser.width:18)*(window.__journalViewport?.view.zoom||1);cursor.hidden=false;cursor.style.cssText='left:'+event.clientX+'px;top:'+event.clientY+'px;width:'+size+'px;height:'+size+'px;'+(config.eraser.mode==='stroke'?'border-style:dashed;':'');
 },{passive:true});
 document.addEventListener('pointerout',event=>{if(event.target.id==='live-canvas'&&cursor)cursor.hidden=true;},{passive:true});
 window.addEventListener('resize',close);
 new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});install();
})();
