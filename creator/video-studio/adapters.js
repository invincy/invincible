import {MAX_MODEL_BYTES} from './three-scene.js';
import {drawCanvasBackground,drawCanvasLayer} from './canvas.js?v=2026111206';
import {ensureDocumentaryFonts} from '../map-fonts.js';
import {compileAnimation} from '../map-animation-import.js?v=2026111002';
import {createHistoryPlayer} from '../history-player.js?v=2026111002';
import {layerFrame,visualSceneAt,referencedMapAssets} from './model.js?v=2026111415';
import {resolveMapAsset} from '../map-assets-client.js?v=2026111002';
import {drawBattlefield} from './battlefield.js?v=2026111014';
import {parallaxTransform,projectLayer} from './parallax.js';
import {fitMedia} from './composition.js?v=2026111207';
export function mapDraft(animation,geometryReviewed,mapAssets=[]){
 return compileAnimation({scenes:[],historicalMap:{version:1,theme:'night',events:[],features:{type:'FeatureCollection',features:[]},camera:[],visual:{version:1,assets:referencedMapAssets(mapAssets,animation),layers:[]}}},animation,{geometryReviewed}).project;
}
export async function createStudioRenderer(canvas,manifest,timeline,brand,{getFile,mapAssets=[],signal}={}){
 const ctx=canvas.getContext('2d'),images=new Map(),maps=new Map(),videos=new Map();let disposed=false,stage=null;
 const ownedUrls=[],hosts=[];
 const releaseStage=()=>{stage?.renderer.destroy();stage=null;};
 const destroy=()=>{if(disposed)return;disposed=true;releaseStage();for(const {player} of maps.values())player.destroy();for(const v of videos.values())v.input.dispose();for(const h of hosts)h.remove();for(const url of ownedUrls)URL.revokeObjectURL(url);};
 try{
  await ensureDocumentaryFonts();await document.fonts.ready;
  const required=new Set([brand.logoAssetId,...timeline.scenes.flatMap(scene=>[...scene.overlays.filter(layer=>layer.type==='image').map(layer=>layer.assetId),...(scene.engineData.backgroundAssetId?[scene.engineData.backgroundAssetId]:[]),...(['image','video'].includes(scene.engineType)?[scene.engineData.assetId]:[]),...(scene.engineData.formations||[]).map(f=>f.assetId)])]);
  const videoIds=new Set(timeline.scenes.filter(s=>s.engineType==='video').map(s=>s.engineData.assetId));
  for(const asset of manifest.assets.filter(asset=>required.has(asset.id))){
   signal?.throwIfAborted();let url=asset.url;
   if(asset.fileId){const file=await getFile(asset.fileId);if(!file)throw Error(`Upload missing image again: ${asset.name}`);url=URL.createObjectURL(file);ownedUrls.push(url);}
   if(asset.libraryId){const ref=mapAssets.find(a=>a.id===asset.libraryId);if(!ref)throw Error('Missing image in existing map library: '+asset.libraryId);url=await resolveMapAsset(ref);}
   if(videoIds.has(asset.id)){
    const {Input,BlobSource,UrlSource,ALL_FORMATS,CanvasSink}=await import('../vendor/studio-video.mjs');
    const input=new Input({source:asset.fileId?new BlobSource(await getFile(asset.fileId)):new UrlSource(url),formats:ALL_FORMATS});videos.set(asset.id,{input});const track=await input.getPrimaryVideoTrack();if(!track||!await track.canDecode())throw Error('Cannot decode clip: '+asset.name);const duration=await track.computeDuration();
    for(const scene of timeline.scenes.filter(s=>s.engineType==='video'&&s.engineData.assetId===asset.id))if(scene.engineData.trimStart+scene.durationSeconds>duration+1e-6)throw Error('Video trim exceeds original clip: '+asset.name);videos.set(asset.id,{input,sink:new CanvasSink(track,{poolSize:2})});continue;
   }
   const image=new Image();image.crossOrigin='anonymous';image.src=url;
   await image.decode().catch(()=>{throw Error(`Cannot load image ${asset.name}. Check its URL and CORS permissions.`);});images.set(asset.id,image);
  }
  // Maps are opened on demand below: a long film must not allocate one WebGL context per shot.
  // Probe the canvas after images load: fail before encoding if a remote source taints it.
  for(const image of images.values())ctx.drawImage(image,0,0,1,1);ctx.getImageData(0,0,1,1);ctx.clearRect(0,0,canvas.width,canvas.height);
 }catch(e){destroy();throw e;}
 const width=canvas.width,height=canvas.height;
 async function mapFor(scene,frameSignal){
  if(maps.has(scene.id))return maps.get(scene.id);
  for(const {player,host} of maps.values()){player.destroy();host.remove();}maps.clear();
  const sourceProject=scene.engineData.project||manifest.mapSources?.find(s=>s.id===scene.engineData.sourceId)?.project;
  const draft=sourceProject?structuredClone(sourceProject):mapDraft(scene.engineData.animation,scene.engineData.geometryReviewed===true,mapAssets),host=document.createElement('div');
  host.className='vs-map-host';Object.assign(host.style,{position:'fixed',left:'-20000px',top:'0',width:width+'px',height:height+'px',pointerEvents:'none'});document.body.append(host);hosts.push(host);
  const errors=[];let player;
  try{player=await createHistoryPlayer(host,draft,draft.historicalMap,{onError:e=>errors.push(e)});const entry={player,host,errors};maps.set(scene.id,entry);await player.loaded;frameSignal?.throwIfAborted();if(disposed)throw new DOMException('Renderer closed','AbortError');player.map.setPixelRatio?.(1);player.map.resize();await player.setSpec(draft.historicalMap);return entry;}catch(e){player?.destroy();host.remove();maps.delete(scene.id);throw e;}
 }
 async function threeFor(scene, frameSignal){
  if(stage?.id===scene.id)return stage.renderer;
  releaseStage();
  const {createStudioThree}=await import('../vendor/map-model.mjs?v=2026111207');
  const activeSignal=frameSignal??signal;
  const renderer=await createStudioThree(scene.engineData,width,height,async id=>{
   const asset=manifest.assets.find(item=>item.id===id),file=await getFile(asset.fileId);
   if(!file)throw Error('Missing GLB: '+asset.name+'. Add it from the shared media library.');
   if(file.size>MAX_MODEL_BYTES)throw Error('Use GLB files up to 8 MB.');
   return file.arrayBuffer();
  },activeSignal);
  if(disposed||activeSignal?.aborted){
   renderer.destroy();
   activeSignal?.throwIfAborted();
   throw new DOMException('Renderer closed','AbortError');
  }
  stage={id:scene.id,renderer};
  return renderer;
 }
 function graphics(scene,time){for(const layer of scene.overlays){
  if(time<(layer.startSeconds??0)||time>=(layer.endSeconds??scene.durationSeconds))continue;
  const pose=layerFrame(layer,time);
  const transform=parallaxTransform(scene.engineType==='graphic'?scene.engineData.parallax:null,layer.depth,time,scene.durationSeconds);
  drawCanvasLayer(ctx,projectLayer(pose,transform),brand,images);
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
  ctx.globalAlpha=1;ctx.fillStyle=brand.background;ctx.fillRect(0,0,width,height);const visual=visualSceneAt(timeline,time),scene=visual?.scene;if(scene?.engineType!=='three')releaseStage();if(!scene)return;
  const local=visual.localTime,transition=scene.transition?.type==='fade'?scene.transition.durationSeconds:0;
  ctx.save();try{
   if(transition)ctx.globalAlpha=Math.max(0,Math.min(1,local/transition,(scene.durationSeconds-local)/transition));
   if(scene.engineData.background){ctx.fillStyle=scene.engineData.background;ctx.fillRect(0,0,width,height);}
   if(scene.engineType==='map'){
    const {player,host,errors}=await mapFor(scene,frameSignal);if(exporting&&(!player.isNative||errors.length))throw Error(errors[0]||'Map export needs WebGL2.');
    player.seek(local+(scene.engineData.sourceStart||0));if(player.isNative)await player.settleFrame(frameSignal);
    if(exporting&&errors.length)throw Error(errors[0]);ctx.drawImage(player.map.getCanvas(),0,0,width,height);
    const overlay=host.querySelector('.history-overlay');if(overlay)ctx.drawImage(overlay,0,0,width,height);
   }else if(scene.engineType==='graphic')drawCanvasBackground(ctx,scene.engineData,images);
   else if(scene.engineType==='three'){
    const three=await threeFor(scene,frameSignal);ctx.drawImage(three.frame(local,scene.durationSeconds),0,0,width,height);
   }else if(scene.engineType==='lic')financial(scene,local);
   else if(scene.engineType==='battlefield')drawBattlefield(ctx,scene.engineData,local,images);
   else if(scene.engineType==='image')fitMedia(ctx,images.get(scene.engineData.assetId),scene.engineData.fit);
   else if(scene.engineType==='video'){
    frameSignal?.throwIfAborted();const video=videos.get(scene.engineData.assetId),abort=()=>video.input.dispose();frameSignal?.addEventListener('abort',abort,{once:true});
    try{const frame=await video.sink.getCanvas(scene.engineData.trimStart+local);frameSignal?.throwIfAborted();if(!frame)throw Error('No video frame at requested source time.');fitMedia(ctx,frame.canvas,scene.engineData.fit);}catch(error){frameSignal?.throwIfAborted();throw error;}finally{frameSignal?.removeEventListener('abort',abort);}
   }
   graphics(scene,local);
   if(brand.logoAssetId){const image=images.get(brand.logoAssetId);if(!image)throw Error('Brand logo asset is missing.');const size=width*.12,scale=Math.min(size/image.width,size/image.height);ctx.drawImage(image,width*.84,height*.04,image.width*scale,image.height*scale);}
  }finally{ctx.restore();}
 }
 return {draw,destroy};
}
