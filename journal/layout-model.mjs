export const LAYOUT_ID='journal-canvas-layout-v1';
export const palette={blue:'#c1d2ed',sage:'#c6dccd',sand:'#eadbbd',rose:'#e8ccda',lavender:'#d7cdeb'};
export const colour=value=>/^#[0-9a-f]{6}$/i.test(value||'')?value:palette[value]||palette.blue;
export const templates=[
 {kind:'mood',title:'Daily Mood',symbol:'◡',colour:'sand',width:260,height:130},
 {kind:'special',title:'Anything Special Today?',symbol:'◇',colour:'lavender',width:290,height:190},
 {kind:'diary',title:'Daily Diary',symbol:'▤',colour:'blue',width:310,height:290},
 {kind:'todo',title:'To-Do',symbol:'☑',colour:'blue',width:280,height:240},
 {kind:'tomorrow',title:'Tomorrow',symbol:'▣',colour:'sage',width:280,height:240},
 {kind:'ideas',title:'Ideas & Possibilities',symbol:'✧',colour:'sand',width:300,height:240},
 {kind:'planner',title:'Daily Planner',symbol:'▣',colour:'sage',width:300,height:190}
];
export function readLayout(record){
 const value=record?structuredClone(record):{};
 // Preserve unknown fields and every saved row. Validation belongs to explicit edits.
 return {...value,id:LAYOUT_ID,tool:'canvas-layout',points:[],cards:Array.isArray(value.cards)?value.cards:[],icons:Array.isArray(value.icons)?value.icons:[],customIcons:Array.isArray(value.customIcons)?value.customIcons:[],connections:Array.isArray(value.connections)?value.connections:[],settings:{grid:true,...value.settings}};
}
export function strokeBounds(stroke){
 const points=(stroke.points||[]).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));if(!points.length)return null;
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(const p of points){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);}
 const size=stroke.width||stroke.fontSize||2,pad=size/2;
 if(stroke.tool==='text'){const lines=String(stroke.text||'').split('\n');maxX=Math.max(maxX,minX+Math.max(1,...lines.map(s=>s.length))*size*.65);maxY=Math.max(maxY,minY+lines.length*size*1.3);}
 return {x:minX-pad,y:minY-pad,width:Math.max(size,maxX-minX+size),height:Math.max(size,maxY-minY+size)};
}
export function intersects(a,b,pad=16){return a.x<aWidth(b)+pad&&aWidth(a)+pad>b.x&&a.y<b.y+b.height+pad&&a.y+a.height+pad>b.y;}
const aWidth=r=>r.x+r.width;
export function vacantPosition(start,size,layout,strokes,view){
 const occupied=[...layout.cards.filter(c=>!c.hidden),...layout.icons.map(i=>({x:i.x,y:i.y,width:i.size||64,height:i.size||64})),...strokes.map(strokeBounds).filter(Boolean)];
 // Search the nearby canvas first, then extend beyond all known content. Never move ink.
 const candidates=[];
 for(let row=0;row<12;row++)for(let col=0;col<6;col++){const candidate={...size,x:start.x+col*(size.width+28),y:start.y+row*(size.height+28)};if(!occupied.some(r=>intersects(candidate,r)))candidates.push(candidate);}
 const inView=view&&candidates.find(c=>c.x>=view.x&&c.y>=view.y&&c.x+c.width<=view.x+view.width&&c.y+c.height<=view.y+view.height);
 const chosen=inView||candidates[0];if(chosen)return {x:chosen.x,y:chosen.y};
 return {x:start.x,y:Math.max(start.y,...occupied.map(r=>r.y+r.height))+40};
}
export function starterLayout(strokes,width=1000,height=800,record){
 const layout=readLayout(record),wide=width>=700,top=wide?Math.max(100,height-500):70;
 const daily=[['planner','Daily Planner',190],['todo','To-Do',190],['ideas',"Today's Idea",180],['mood',"Today's Mood",130]];
 for(const [index,[kind,title,tall]]of daily.entries()){
  // Hidden/removed daily cards count as present, so a user's choice survives reopening.
  if(layout.cards.some(c=>c.kind===kind||(!c.kind&&(c.id===kind||c.title===title))))continue;
  const template=templates.find(t=>t.kind===kind),size={width:Math.min(template.width,Math.max(220,width-48)),height:wide?tall:kind==='mood'?130:150};
  const start=wide?{x:index%2?356:28,y:top+Math.floor(index/2)*218}:{x:24,y:top+index*178};
  const position=vacantPosition(start,size,layout,strokes,{x:0,y:0,width,height:height-70});
  const id=layout.cards.some(c=>c.id===kind)?'daily-default-'+kind:kind;
  layout.cards.push({...template,...size,...position,id,title,text:'',items:[]});
 }
 return layout;
}
export function anchor(ref,layout,strokes){
 if(ref.type==='point'&&Number.isFinite(ref.x)&&Number.isFinite(ref.y))return {x:ref.x,y:ref.y};
 let item;if(ref.type==='card')item=layout.cards.find(c=>c.id===ref.id&&!c.hidden);
 if(ref.type==='icon'){const icon=layout.icons.find(i=>i.id===ref.id);if(icon)item={...icon,width:icon.size||64,height:icon.size||64};}
 if(ref.type==='stroke'){const stroke=strokes.find(s=>s.id===ref.id);if(stroke)item=strokeBounds(stroke);}
 return item?{x:item.x+(item.width||300)/2,y:item.y+(item.height||220)/2}:null;
}
export function hitStroke(point,strokes,tolerance=18){
 for(const stroke of [...strokes].reverse()){
  const bounds=strokeBounds(stroke);if(!bounds)continue;
  if(stroke.tool==='text'&&point.x>=bounds.x&&point.x<=bounds.x+bounds.width&&point.y>=bounds.y&&point.y<=bounds.y+bounds.height)return stroke;
  const pts=stroke.points||[];
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[i+1]||a,dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy||1)));if(Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy)<=tolerance+(stroke.width||2)/2)return stroke;}
 }return null;
}
