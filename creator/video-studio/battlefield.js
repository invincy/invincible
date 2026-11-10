// Authored tactical terrain, in normalized world coordinates; never geographic evidence.
const finite=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
const point=p=>Array.isArray(p)&&p.length===2&&p.every(v=>finite(v,-2,3));
const check=(yes,message)=>{if(!yes)throw Error(message);};
const fields=(v,names)=>check(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>names.includes(k)),'Unsupported battlefield fields.');
export function emptyBattlefield(){return {background:'#7b865b',terrain:[],formations:[],camera:[{timeSeconds:0,x:.5,y:.5,zoom:1,tilt:.35,bearing:0}]};}
export function validateBattlefield(data,duration,assets){
 fields(data,['background','terrain','formations','camera','projectiles']);check(/^#[a-f\d]{6}$/i.test(data.background),'Choose a battlefield background.');
 check(Array.isArray(data.terrain)&&data.terrain.length<=100,'Use up to 100 terrain objects.');
 const ids=new Set();const unique=id=>{check(typeof id==='string'&&id.length>0&&id.length<=150&&!ids.has(id),'Battlefield IDs must be unique.');ids.add(id);};
 for(const t of data.terrain){fields(t,['id','kind','points','height','width','color']);unique(t.id);check(['hill','cliff','forest','river','road','obstacle'].includes(t.kind),'Unknown terrain type.');check(Array.isArray(t.points)&&t.points.length>=2&&t.points.length<=100&&t.points.every(point),'Terrain needs 2–100 points.');check(finite(t.height,0,.5)&&finite(t.width,.001,.5),'Invalid terrain height or width.');check(/^#[a-f\d]{6}$/i.test(t.color),'Invalid terrain color.');}
 check(Array.isArray(data.formations)&&data.formations.length<=100,'Use up to 100 formations.');let total=0;
 for(const f of data.formations){fields(f,['id','name','assetId','count','columns','spacing','scale','path']);unique(f.id);check(typeof f.name==='string'&&f.name.length<=200,'Invalid formation name.');check(assets.has(f.assetId),'Formation artwork is missing.');check(Number.isInteger(f.count)&&finite(f.count,1,500)&&Number.isInteger(f.columns)&&finite(f.columns,1,50),'Invalid formation size.');total+=f.count;check(total<=3000,'Use up to 3,000 visible troop sprites per battlefield.');check(finite(f.spacing,.005,.2)&&finite(f.scale,.005,.2),'Invalid formation spacing or scale.');validateKeys(f.path,duration,['x','y','rotation']);}
 if(data.projectiles!==undefined){check(Array.isArray(data.projectiles)&&data.projectiles.length<=200,'Use up to 200 projectiles.');for(const p of data.projectiles){
  fields(p,['id','from','to','launchSeconds','flightSeconds','arcHeight','radius','color','impactSeconds','impactRadius']);unique(p.id);
  check(point(p.from)&&point(p.to),'Projectile needs valid launch and impact positions.');
  check(finite(p.launchSeconds,0,duration)&&finite(p.flightSeconds,1/30,duration)&&p.launchSeconds+p.flightSeconds<=duration,'Projectile flight must fit the scene.');
  check(finite(p.arcHeight,0,1)&&finite(p.radius,.001,.1)&&/^#[a-f\d]{6}$/i.test(p.color),'Invalid projectile appearance.');
  check(finite(p.impactSeconds,0,5)&&finite(p.impactRadius,.001,.5)&&p.launchSeconds+p.flightSeconds+p.impactSeconds<=duration+1e-6,'Impact must fit the scene.');
 }}
 validateKeys(data.camera,duration,['x','y','zoom','tilt','bearing']);return data;
}
function validateKeys(keys,duration,props){
 check(Array.isArray(keys)&&keys.length>0&&keys.length<=150&&keys[0].timeSeconds===0,'Paths and cameras must start at zero.');let last=-1;
 for(const k of keys){fields(k,['timeSeconds',...props]);check(finite(k.timeSeconds,0,duration)&&k.timeSeconds>last,'Key times must increase within the scene.');last=k.timeSeconds;for(const p of props)check(finite(k[p],p==='zoom'?.25:p==='tilt'?0:p==='rotation'||p==='bearing'?-3600:-2,p==='zoom'?8:p==='tilt'?.8:p==='rotation'||p==='bearing'?3600:3),'Invalid battlefield keyframe.');}
}
export function poseAt(keys,time){let a=keys[0],b=a;for(const k of keys){if(k.timeSeconds<=time)a=k;else{b=k;break;}b=k;}const u=b.timeSeconds>a.timeSeconds?Math.max(0,Math.min(1,(time-a.timeSeconds)/(b.timeSeconds-a.timeSeconds))):0;return Object.fromEntries(Object.keys(a).filter(p=>p!=='timeSeconds').map(p=>[p,a[p]+(b[p]-a[p])*u]));}
export function elevationAt(terrain,x,y){let z=0;for(const t of terrain.filter(t=>t.kind==='hill'||t.kind==='cliff')){const [a,b]=t.points,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,rx=Math.max(.01,Math.abs(a[0]-b[0])/2),ry=Math.max(.01,Math.abs(a[1]-b[1])/2),d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1)z+=t.height*(t.kind==='cliff'?1:1-d);}return z;}
export function projectBattlePoint(data,time,x,y,z=0){const c=poseAt(data.camera,time),r=c.bearing*Math.PI/180,dx=x-c.x,dy=y-c.y;return [.5+(dx*Math.cos(r)-dy*Math.sin(r))*c.zoom,.5+((dx*Math.sin(r)+dy*Math.cos(r))*(1-c.tilt)-z)*c.zoom];}
export function drawBattlefield(ctx,data,time,images){
 const {width:w,height:h}=ctx.canvas;ctx.fillStyle=data.background;ctx.fillRect(0,0,w,h);const p=(x,y,z=0)=>{const [a,b]=projectBattlePoint(data,time,x,y,z);return [a*w,b*h];};
 const line=(points,color,width)=>{ctx.beginPath();points.forEach(([x,y],i)=>{const a=p(x,y);i?ctx.lineTo(...a):ctx.moveTo(...a);});ctx.strokeStyle=color;ctx.lineWidth=width*w*poseAt(data.camera,time).zoom;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
 for(const t of data.terrain){
  if(t.kind==='hill'||t.kind==='cliff'){const [a,b]=t.points,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,rx=Math.abs(a[0]-b[0])/2,ry=Math.abs(a[1]-b[1])/2;if(t.kind==='cliff'){const rim=Array.from({length:17},(_,i)=>[cx+Math.cos(i/16*Math.PI)*rx,cy+Math.sin(i/16*Math.PI)*ry]);ctx.beginPath();[...rim.map(([x,y])=>p(x,y,t.height)),...rim.slice().reverse().map(([x,y])=>p(x,y,0))].forEach((v,i)=>i?ctx.lineTo(...v):ctx.moveTo(...v));ctx.closePath();ctx.fillStyle='#4b4f42';ctx.fill();}for(let j=0;j<12;j++){const q=1-j/13,pts=Array.from({length:33},(_,i)=>[cx+Math.cos(i/32*Math.PI*2)*rx*q,cy+Math.sin(i/32*Math.PI*2)*ry*q]);ctx.beginPath();pts.forEach(([x,y],i)=>{const v=p(x,y,t.height*(t.kind==='cliff'?1:1-q*q));i?ctx.lineTo(...v):ctx.moveTo(...v);});ctx.closePath();ctx.fillStyle=t.color;ctx.fill();ctx.strokeStyle='#17251c33';ctx.lineWidth=2;ctx.stroke();}}
  else if(t.kind==='forest'){const [a,b]=t.points;for(let i=0;i<70;i++){const x=a[0]+(b[0]-a[0])*((i*37%71)/71),y=a[1]+(b[1]-a[1])*((i*53%73)/73),v=p(x,y,elevationAt(data.terrain,x,y));ctx.fillStyle=t.color;ctx.beginPath();ctx.moveTo(v[0],v[1]-t.width*w);ctx.lineTo(v[0]-t.width*w*.5,v[1]);ctx.lineTo(v[0]+t.width*w*.5,v[1]);ctx.fill();}}
  else {line(t.points,t.color,t.width);if(t.kind==='obstacle')line(t.points,'#171e24',t.width*.25);}
 }
 const sprites=[];for(const f of data.formations){const v=poseAt(f.path,time),r=v.rotation*Math.PI/180;for(let i=0;i<f.count;i++){const dx=(i%f.columns-(f.columns-1)/2)*f.spacing,dy=(Math.floor(i/f.columns)-(Math.ceil(f.count/f.columns)-1)/2)*f.spacing,x=v.x+dx*Math.cos(r)-dy*Math.sin(r),y=v.y+dx*Math.sin(r)+dy*Math.cos(r);sprites.push({f,x,y,rotation:r});}}
 sprites.sort((a,b)=>p(a.x,a.y)[1]-p(b.x,b.y)[1]);for(const s of sprites){const image=images.get(s.f.assetId),[x,y]=p(s.x,s.y,elevationAt(data.terrain,s.x,s.y)),size=s.f.scale*w*poseAt(data.camera,time).zoom,k=Math.min(size/image.width,size/image.height);ctx.save();ctx.translate(x,y);ctx.rotate(s.rotation+poseAt(data.camera,time).bearing*Math.PI/180);ctx.drawImage(image,-image.width*k/2,-image.height*k,image.width*k,image.height*k);ctx.restore();}
 for(const shot of data.projectiles||[]){const v=projectileAt(shot,time);if(!v)continue;const [x,y]=p(v.x,v.y,elevationAt(data.terrain,v.x,v.y)+v.z),zoom=poseAt(data.camera,time).zoom;ctx.save();ctx.fillStyle=shot.color;
  if(v.phase==='flight'){ctx.beginPath();ctx.arc(x,y,shot.radius*w*zoom,0,Math.PI*2);ctx.fill();}
  else {ctx.globalAlpha*=1-v.progress;ctx.beginPath();ctx.arc(x,y,shot.impactRadius*w*zoom*(.2+.8*v.progress),0,Math.PI*2);ctx.fill();}
  ctx.restore();}
}

// An authored impact cue, not a collision/physics simulation. Absolute time makes seeks deterministic.
export function projectileAt(p,time){
 const u=(time-p.launchSeconds)/p.flightSeconds;
 if(u<0||time>=p.launchSeconds+p.flightSeconds+p.impactSeconds)return null;
 if(u>=1)return {phase:'impact',x:p.to[0],y:p.to[1],z:0,progress:(time-p.launchSeconds-p.flightSeconds)/p.impactSeconds};
 return {phase:'flight',x:p.from[0]+(p.to[0]-p.from[0])*u,y:p.from[1]+(p.to[1]-p.from[1])*u,z:4*p.arcHeight*u*(1-u),progress:u};
}
