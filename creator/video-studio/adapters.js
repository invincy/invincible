import {compileAnimation} from '../map-animation-import.js';
import {createHistoryPlayer} from '../history-player.js';
import {layerFrame,sceneAt} from './model.js';
import {resolveMapAsset} from '../map-assets-client.js';
export function mapDraft(animation,geometryReviewed,mapAssets=[]){
 return compileAnimation({scenes:[],historicalMap:{version:1,theme:'night',events:[],features:{type:'FeatureCollection',features:[]},camera:[],visual:{version:1,assets:mapAssets,layers:[]}}},animation,{geometryReviewed}).project;
}
export async function createStudioRenderer(canvas,manifest,timeline,brand,{getFile,mapAssets=[],signal}={}){
 const ctx=canvas.getContext('2d'),images=new Map(),maps=new Map();let disposed=false;
 const ownedUrls=[],hosts=[];
 const destroy=()=>{if(disposed)return;disposed=true;for(const {player} of maps.values())player.destroy();for(const h of hosts)h.remove();for(const url of ownedUrls)URL.revokeObjectURL(url);};
 try{
  await document.fonts.ready;
  for(const asset of manifest.assets){
   signal?.throwIfAborted();let url=asset.url;
   if(asset.fileId){const file=await getFile(asset.fileId);if(!file)throw Error(`Upload missing image again: ${asset.name}`);url=URL.createObjectURL(file);ownedUrls.push(url);}
   if(asset.libraryId)url=await resolveMapAsset(mapAssets.find(a=>a.id===asset.libraryId));
   const image=new Image();image.crossOrigin='anonymous';image.src=url;
   await image.decode().catch(()=>{throw Error(`Cannot load image ${asset.name}. Check its URL and CORS permissions.`);});images.set(asset.id,image);
  }
  for(const scene of timeline.scenes.filter(s=>s.engineType==='map')){
   signal?.throwIfAborted();const draft=mapDraft(scene.engineData.animation,scene.engineData.geometryReviewed===true,mapAssets),host=document.createElement('div');
   host.className='vs-map-host';Object.assign(host.style,{position:'fixed',left:'-20000px',top:'0',width:canvas.width+'px',height:canvas.height+'px',pointerEvents:'none'});document.body.append(host);hosts.push(host);
   const errors=[];const player=await createHistoryPlayer(host,draft,draft.historicalMap,{onError:e=>errors.push(e)});maps.set(scene.id,{player,host,errors});
   await player.loaded;player.map.setPixelRatio?.(1);player.map.resize();await player.setSpec(draft.historicalMap);
  }
  // Probe the canvas after images load: fail before encoding if a remote source taints it.
  for(const image of images.values())ctx.drawImage(image,0,0,1,1);ctx.getImageData(0,0,1,1);ctx.clearRect(0,0,canvas.width,canvas.height);
 }catch(e){destroy();throw e;}
 const width=canvas.width,height=canvas.height;
 function graphics(scene,time){for(const layer of scene.overlays){
  if(time<(layer.startSeconds??0)||time>=(layer.endSeconds??scene.durationSeconds))continue;
  const l=layerFrame(layer,time);ctx.save();ctx.globalAlpha*=l.opacity;ctx.translate(l.x*width,l.y*height);ctx.rotate(l.rotation*Math.PI/180);ctx.scale(l.scale,l.scale);ctx.fillStyle=l.color||brand.foreground;
  const w=(l.width??.8)*width,h=(l.height??.3)*height;
  if(l.type==='text'){ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${l.fontSize??56}px ${brand.font}`;const lines=l.text.split('\n');lines.forEach((line,i)=>ctx.fillText(line,0,(i-(lines.length-1)/2)*(l.fontSize??56)*1.3,w));}
  if(l.type==='rectangle')ctx.fillRect(-w/2,-h/2,w,h);
  if(l.type==='image'){const image=images.get(l.assetId),scale=Math.min(w/image.width,h/image.height);ctx.drawImage(image,-image.width*scale/2,-image.height*scale/2,image.width*scale,image.height*scale);}
  ctx.restore();
 }}
 const money=n=>'₹'+Math.round(n).toLocaleString('en-IN');
 function financial(scene,time){
  const d=scene.engineData,points=d.points.filter(p=>p.timeSeconds<=time),maxYear=Math.max(1,...points.map(p=>p.year)),maxValue=Math.max(1,...d.points.map(p=>(p.addition||0)+(p.income||0)+(p.booster||0)+(p.maturity||0)));
  ctx.textAlign='center';ctx.fillStyle=brand.foreground;ctx.font=`600 52px ${brand.font}`;ctx.fillText(d.title,width*.5,height*.15,width*.88);
  const x=year=>width*(.1+.8*year/maxYear),y=n=>height*(.63-.32*n/maxValue);
  ctx.strokeStyle=brand.accent;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(width*.1,height*.64);ctx.lineTo(width*.9,height*.64);ctx.stroke();
  ctx.beginPath();points.forEach((p,i)=>{const a=x(p.year),b=y((p.addition||0)+(p.income||0)+(p.booster||0)+(p.maturity||0));if(i)ctx.lineTo(a,b);else ctx.moveTo(a,b);});ctx.stroke();
  for(const p of points){ctx.beginPath();ctx.arc(x(p.year),y((p.addition||0)+(p.income||0)+(p.booster||0)+(p.maturity||0)),9,0,2*Math.PI);ctx.fillStyle=brand.accent;ctx.fill();ctx.font=`28px ${brand.font}`;ctx.fillText('Y'+p.year,x(p.year),height*.69);}
  const p=points.at(-1);if(p){ctx.fillStyle=brand.foreground;ctx.font=`600 42px ${brand.font}`;ctx.fillText(p.label,width*.5,height*.77,width*.9);ctx.font=`32px ${brand.font}`;const rows=['premium','addition','income','booster','maturity'].filter(k=>p[k]!==undefined);rows.forEach((k,i)=>ctx.fillText(k+' · '+money(p[k]),width*.5,height*.80+i*height*.03,width*.88));}
  ctx.fillStyle=brand.foreground;ctx.font=`20px ${brand.font}`;ctx.fillText('Illustration: '+d.source,width*.5,height*.97,width*.94);
 }
 async function draw(time,{exporting=false,signal:frameSignal}={}){
  if(disposed)throw new DOMException('Renderer closed','AbortError');frameSignal?.throwIfAborted();
  ctx.globalAlpha=1;ctx.fillStyle=brand.background;ctx.fillRect(0,0,width,height);const scene=sceneAt(timeline,time);if(!scene)return;
  const local=time-scene.startSeconds,transition=scene.transition?.type==='fade'?scene.transition.durationSeconds:0;
  ctx.save();try{
   if(transition)ctx.globalAlpha=Math.max(0,Math.min(1,local/transition,(scene.durationSeconds-local)/transition));
   if(scene.engineData.background){ctx.fillStyle=scene.engineData.background;ctx.fillRect(0,0,width,height);}
   if(scene.engineType==='map'){
    const {player,host,errors}=maps.get(scene.id);if(exporting&&(!player.isNative||errors.length))throw Error(errors[0]||'Map export needs WebGL2.');
    player.seek(local);if(player.isNative)await player.settleFrame(frameSignal);
    if(exporting&&errors.length)throw Error(errors[0]);ctx.drawImage(player.map.getCanvas(),0,0,width,height);
    const overlay=host.querySelector('.history-overlay');if(overlay)ctx.drawImage(overlay,0,0,width,height);
   }else if(scene.engineType==='lic')financial(scene,local);
   graphics(scene,local);
   if(brand.logoAssetId){const image=images.get(brand.logoAssetId);if(!image)throw Error('Brand logo asset is missing.');const size=width*.12,scale=Math.min(size/image.width,size/image.height);ctx.drawImage(image,width*.84,height*.04,image.width*scale,image.height*scale);}
  }finally{ctx.restore();}
 }
 return {draw,destroy};
}
