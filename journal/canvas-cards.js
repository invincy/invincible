/* Layout metadata travels through the existing account/date-scoped stroke queue. */
(()=>{
 'use strict';
 const ID='journal-canvas-layout-v1', colours={blue:'#c1d2ed',sage:'#c6dccd',sand:'#eadbbd',rose:'#e8ccda',lavender:'#d7cdeb'};
 let surface,layer,controls,session='',signature='',cards=[],editing=false,gesture=null;
 const api=()=>window.__journalApi, viewport=()=>window.__journalViewport;
 const defaults=()=>[
  {id:'diary',title:'Daily diary',icon:'◒',colour:'blue',x:40,y:80,width:350,height:370,text:''},
  {id:'personal',title:'Personal notes',icon:'◇',colour:'sage',x:450,y:80,width:320,height:260,text:''},
  {id:'ideas',title:'Ideas & possibilities',icon:'✧',colour:'sand',x:450,y:400,width:320,height:260,text:''}
 ];
 const number=(n,f,min,max)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):f;
 function clean(rows){return rows.slice(0,80).filter(c=>c&&typeof c.id==='string').map(c=>({id:c.id.slice(0,100),title:String(c.title??'Untitled').slice(0,100),text:String(c.text||'').slice(0,5000),icon:['◒','◇','✧','□'].includes(c.icon)?c.icon:'□',colour:Object.hasOwn(colours,c.colour)?c.colour:'blue',x:number(c.x,40,-50000,50000),y:number(c.y,80,-50000,50000),width:number(c.width,320,220,1200),height:number(c.height,280,180,1400)}));}
 function save(){if(!api()?.ready?.()||session!==context())return;signature=JSON.stringify(cards);api().save({id:ID,tool:'canvas-layout',points:[],cards:clean(cards),schemaVersion:1});}
 function context(){const c=api()?.context?.();return c?c.uid+'.'+c.dateKey:'';}
 function position(card,node){node.style.setProperty('--card-colour',colours[card.colour]);Object.assign(node.style,{left:card.x+'px',top:card.y+'px',width:card.width+'px',height:card.height+'px'});}
 function links(){const svg=layer.querySelector('svg');svg.replaceChildren();if(!cards.length)return;const first=cards[0];for(const card of cards.slice(1)){const path=document.createElementNS('http://www.w3.org/2000/svg','path'),x=first.x+first.width/2,y=first.y+first.height/2,tx=card.x+card.width/2,ty=card.y+card.height/2;path.setAttribute('d',`M${x} ${y} C${(x+tx)/2} ${y},${(x+tx)/2} ${ty},${tx} ${ty}`);svg.append(path);}}
 function draw(){layer.replaceChildren();const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('journal-card-links');svg.setAttribute('aria-hidden','true');layer.append(svg);
  for(const card of cards){const node=document.createElement('section');node.className='journal-note-card';node.dataset.card=card.id;position(card,node);
   node.innerHTML='<header><button type="button" class="journal-card-move" aria-label="Move card" title="Drag to move · arrow keys to nudge"></button><input aria-label="Card title" maxlength="100"><button type="button" data-remove aria-label="Remove card">×</button></header><textarea aria-label="Card writing" maxlength="5000" placeholder="Write here, or use your pen on the canvas…"></textarea><footer><select aria-label="Card colour"></select><button type="button" class="journal-card-resize" aria-label="Resize card" title="Drag to resize · arrow keys to resize">↘</button></footer>';
   node.querySelector('.journal-card-move').textContent=card.icon;const title=node.querySelector('input'),text=node.querySelector('textarea'),select=node.querySelector('select');title.value=card.title;text.value=card.text;
   for(const colour of Object.keys(colours)){const option=document.createElement('option');option.value=colour;option.textContent=colour[0].toUpperCase()+colour.slice(1);select.append(option);}select.value=card.colour;
   for(const field of [title,text])field.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase()))e.stopPropagation();});
   title.oninput=()=>{card.title=title.value;save();};text.oninput=()=>{card.text=text.value;save();};select.onchange=()=>{card.colour=select.value;position(card,node);save();};
   node.querySelector('[data-remove]').onclick=()=>{if((card.text||card.title&&!['Daily diary','Personal notes','Ideas & possibilities','New note'].includes(card.title))&&!confirm('Remove this card and its typed writing? Handwritten ink stays on the canvas.'))return;cards=cards.filter(c=>c.id!==card.id);save();draw();};
   for(const kind of ['move','resize']){const handle=node.querySelector('.journal-card-'+kind);handle.onpointerdown=e=>{if(e.button!==0||!editing)return;e.preventDefault();e.stopPropagation();gesture={kind,id:e.pointerId,card,node,x:e.clientX,y:e.clientY,start:{...card}};handle.setPointerCapture(e.pointerId);};handle.onpointermove=e=>{if(gesture?.id!==e.pointerId)return;e.preventDefault();const g=gesture,z=viewport().view.zoom,dx=(e.clientX-g.x)/z,dy=(e.clientY-g.y)/z;if(kind==='move'){card.x=number(g.start.x+dx,40,-50000,50000);card.y=number(g.start.y+dy,80,-50000,50000);}else{card.width=number(g.start.width+dx,320,220,1200);card.height=number(g.start.height+dy,280,180,1400);}position(card,node);links();};
    const end=e=>{if(gesture?.id!==e.pointerId)return;gesture=null;save();};handle.onpointerup=end;handle.onpointercancel=end;handle.onlostpointercapture=end;
    handle.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const d=e.shiftKey?40:10,dx=e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,dy=e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0;if(kind==='move'){card.x=number(card.x+dx,40,-50000,50000);card.y=number(card.y+dy,80,-50000,50000);}else{card.width=number(card.width+dx,320,220,1200);card.height=number(card.height+dy,280,180,1400);}position(card,node);links();save();};
   }layer.append(node);
  }links();mode(editing);
 }
 function mode(value){editing=value&&!!api()?.ready?.();value=editing;layer.classList.toggle('is-editing',value);layer.inert=!value;controls.querySelector('[data-edit]').setAttribute('aria-pressed',String(value));controls.querySelector('[data-edit]').textContent=value?'Done arranging':'Arrange cards';controls.querySelector('[role=status]').textContent=value?'Drag icons to move · corners to resize':'Free canvas · draw anywhere';}
 function install(){const next=api()?.container?.(),v=viewport();if(!next?.isConnected||!v||!context()){layer?.remove();controls?.remove();surface=null;return;}
  if(surface!==next){layer?.remove();controls?.remove();surface=next;layer=document.createElement('div');layer.className='journal-card-world';surface.append(layer);controls=document.createElement('nav');controls.className='journal-card-controls';controls.setAttribute('aria-label','Journal cards');controls.innerHTML='<span role="status">Free canvas · draw anywhere</span><button type="button" data-edit aria-pressed="false">Arrange cards</button><button type="button" data-add>＋ Add card</button>';surface.append(controls);
   controls.querySelector('[data-edit]').onclick=()=>mode(!editing);controls.querySelector('[data-add]').onclick=()=>{if(cards.length>=80){controls.querySelector('[role=status]').textContent='This canvas has 80 cards.';return;}const view=v.view;cards.push({id:crypto.randomUUID(),title:'New note',text:'',icon:'□',colour:'lavender',x:(30-view.x)/view.zoom,y:(90-view.y)/view.zoom,width:300,height:280});save();draw();mode(true);layer.querySelector('section:last-child input').focus();};session='';
  }
  for(const button of controls.querySelectorAll('button'))button.disabled=!api().ready();
  if(session!==context()){session=context();signature='';gesture=null;editing=false;cards=[];}
  const record=api().strokes().find(s=>s.id===ID),nextCards=Array.isArray(record?.cards)?clean(record.cards):defaults(),nextSignature=JSON.stringify(nextCards);
  if(!gesture&&signature!==nextSignature){signature=nextSignature;cards=nextCards;draw();}
  const view=v.view;layer.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.zoom})`;
 }
 /* Captures use the same world coordinates as ink; never rasterize/edit stored strokes. */
 window.__journalCards={paint(ctx,box){if(!viewport())return;const v=viewport().view;ctx.save();ctx.scale(ctx.canvas.width/box.width,ctx.canvas.height/box.height);ctx.translate(v.x-box.x,v.y-box.y);ctx.scale(v.zoom,v.zoom);for(const c of cards){ctx.globalAlpha=.72;ctx.fillStyle=colours[c.colour];ctx.beginPath();ctx.roundRect(c.x,c.y,c.width,c.height,18);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#20334b';ctx.font='600 16px system-ui';ctx.fillText(c.icon+'  '+c.title,c.x+18,c.y+28,c.width-36);ctx.font='15px system-ui';let y=c.y+62;for(const line of c.text.split('\n')){let row='';for(const word of line.split(' ')){if(ctx.measureText(row+word).width>c.width-36){if(y<c.y+c.height-20)ctx.fillText(row,c.x+18,y);y+=23;row='';}row+=word+' ';}if(y<c.y+c.height-20)ctx.fillText(row,c.x+18,y);y+=23;}}ctx.restore();}};
 window.addEventListener('journal-tool-change',()=>{if(controls)mode(false);});
 setInterval(install,80);install();
})();
