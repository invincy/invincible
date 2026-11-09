import {drawDocumentary,presentationAt} from './map-documentary.js?v=2026110903';
import {ensureDocumentaryFonts} from './map-fonts.js?v=2026110903';
import {drawDefaultLabels,drawDefaultCredits} from './map-labels.js?v=2026110903';
import {locationVisible} from './map-globe.js';
import {CanvasHistoricalMap} from './history-canvas.js';
import {mapFrame,durationOf,sceneTimeline} from './history-model.js?v=2026110903';
import {createVisualRenderer} from './map-editor-renderer.js?v=2026110903';
import {baseStyle,styleFor} from './map-style-library.js';
import {layerAlpha} from './map-editor-model.js?v=2026110903';
import {exportDimensions,encodeMapVideo} from './map-video-export.js';
import {resolveOverlayPolicy} from './map-overlay-presets.js?v=2026110903';

const overlayPlugins=new Map();
export function registerMapOverlayPlugin(id,pluginOrFactory){
 if(typeof id!=='string'||!/^[a-zA-Z0-9._:-]{1,120}$/.test(id))throw Error('Overlay plugin ID must be a non-empty identifier up to 120 characters.');
 if(typeof pluginOrFactory!=='function')throw Error('Register an overlay factory so every player owns an independent instance.');
 const existing=overlayPlugins.get(id);if(existing&&existing!==pluginOrFactory)throw Error('Overlay plugin ID is already registered; use a new versioned ID.');
 overlayPlugins.set(id,pluginOrFactory);
}
export const getMapOverlayPlugin=id=>overlayPlugins.get(id);
export const unregisterMapOverlayPlugin=id=>overlayPlugins.delete(id);

function pluginIdentity(projectObj,specObj){
 const ref=specObj?.overlayPlugin??projectObj?.overlayPlugin;
 if(!ref)return '';
 return typeof ref==='string'?ref:JSON.stringify([ref.id,ref.options||null]);
}
function instantiatePlugin(projectObj,specObj,explicitPlugin){
 const ref=specObj?.overlayPlugin??projectObj?.overlayPlugin;
 const refId=typeof ref==='string'?ref:ref?.id;
 const refOptions=ref&&typeof ref==='object'?ref.options:{};
 const candidate=explicitPlugin||(refId?overlayPlugins.get(refId):null);
 if(!candidate){if(refId)throw Error('Required overlay plugin is not registered: '+refId);return null;}
 return typeof candidate==='function'?candidate(projectObj,specObj,structuredClone(refOptions||{})):candidate;
}
function drawRoundRect(ctx,x,y,w,h,r){
 const radius=Math.max(0,Math.min(r,w/2,h/2));
 ctx.beginPath();
 if(typeof ctx.roundRect==='function')ctx.roundRect(x,y,w,h,radius);
 else{ctx.moveTo(x+radius,y);ctx.arcTo(x+w,y,x+w,y+h,radius);ctx.arcTo(x+w,y+h,x,y+h,radius);ctx.arcTo(x,y+h,x,y,radius);ctx.arcTo(x,y,x+w,y,radius);}
 ctx.closePath();
}

export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function sizeMapFrame(host,ratio){const aspect=ratio==='9:16'?9/16:16/9;host.style.width=`min(100%, ${Math.floor(window.innerHeight*0.58*aspect)}px)`;host.style.aspectRatio=ratio==='9:16'?'9 / 16':'16 / 9';host.style.maxHeight='none';}
export async function createHistoryPlayer(host,project,spec,{onTime=()=>{},onError=()=>{},overlayPlugin=null}={}){
 const {Map,NavigationControl}=await import('./vendor/maplibre-gl.mjs');
 const needsFonts=map=>map.presentation?.presetVersion===2||project.scenes?.some(s=>s.mapPresentation?.presetVersion===2);if(needsFonts(spec))await ensureDocumentaryFonts();
 let activePlugin=instantiatePlugin(project,spec,overlayPlugin),pluginKey=overlayPlugin?'__explicit__':pluginIdentity(project,spec);
 let policy=resolveOverlayPolicy(project,spec,activePlugin?.policy);
 let night=spec.theme==='night';const background=night?'#101e2b':'#d8caaa',land=night?'#273f4e':'#a99f7f';
 let initialStyle,providerError='';try{initialStyle=await baseStyle(spec);}catch(error){providerError=error.message;initialStyle=await baseStyle({...spec,basemap:undefined});onError(providerError+' Showing the basic physical map; change the library style to retry.');}
 let lastHistoryData='';
 let baseKey=providerError?'':JSON.stringify([spec.theme,spec.basemap]);
 let map;try{map=new Map({container:host,center:[80,23],zoom:3.2,fadeDuration:0,canvasContextAttributes:{preserveDrawingBuffer:true},style:initialStyle,attributionControl:false});}catch{host.replaceChildren();map=new CanvasHistoricalMap(host,{night});onError('WebGL2 unavailable: using the 2D physical-map preview.');}
 if(map.addControl)map.addControl(new NavigationControl({showCompass:true}),'top-right');
 const visual=createVisualRenderer(map,project,onError,policy);
 const canvas=document.createElement('canvas');canvas.className='history-overlay';canvas.setAttribute('aria-label','Historical events and date markers');host.append(canvas);
 const ctx=canvas.getContext('2d');let ready=false,disposed=false,raf=0,tickTimer=0,time=0,playing=false,last=0,recording=null,seeking=false,renderedDuringSeek=false,audio=null,audioContext=null,audioSource=null,exportController=null,recordController=null,renderError='';
 const resize=new ResizeObserver(()=>{canvas.width=Math.max(1,Math.round(host.clientWidth*devicePixelRatio));canvas.height=Math.max(1,Math.round(host.clientHeight*devicePixelRatio));map.resize();draw();});resize.observe(host);
 function historyLayers(){lastHistoryData='';map.addSource('history',{type:'geojson',data:{type:'FeatureCollection',features:[]}});map.addLayer({id:'territory',source:'history',type:'fill',filter:['in',['geometry-type'],['literal',['Polygon','MultiPolygon']]],paint:{'fill-color':'#b26b4a','fill-opacity':0.5}});map.addLayer({id:'routes',source:'history',type:'line',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#ae4b33','line-width':3}});}
 const loaded=new Promise((resolve,reject)=>{map.once('load',async()=>{ready=true;historyLayers();try{await visual.setSpec(spec,policy);await activePlugin?.preload?.(project,spec);if(disposed)return;seek(0);resolve();}catch(e){reject(e);}});map.on('error',e=>{renderError='Map: '+(e.error?.message||'render error');onError(renderError);if(!ready)reject(e.error||Error('Map failed to load.'));});});
 function overlay(target,w,h,frame=mapFrame(project,spec,time)){
  const sx=w/host.clientWidth,sy=h/host.clientHeight;target.save();target.scale(sx,sy);const width=host.clientWidth,height=host.clientHeight;
  target.globalAlpha=1;for(const f of frame.features.features.filter(f=>f.geometry.type==='LineString')){const layer=spec.visual?.layers.find(l=>l.kind==='feature'&&l.ref===f.properties.id);if(layer?.visible===false||layer?.arrowhead===false)continue;const c=f.geometry.coordinates;if(c.length<2)continue;const alpha=layer?layerAlpha(project,layer,time):1;if(alpha<=0.01)continue;if(!locationVisible(map,c.at(-1),spec.projection)||!locationVisible(map,c.at(-2),spec.projection))continue;const a=map.project(c.at(-2)),b=map.project(c.at(-1));target.save();target.globalAlpha=alpha;target.translate(b.x,b.y);target.rotate(Math.atan2(b.y-a.y,b.x-a.x));target.fillStyle=layer?.color||'#ae4b33';target.beginPath();target.moveTo(0,0);target.lineTo(-12,-5);target.lineTo(-12,5);target.closePath();target.fill();target.restore();}
  visual.overlay(target,time,{width,height});
  const presentation=presentationAt(project,spec,time),paintSpec=presentation?{...spec,presentation}:spec;
  if(presentation){if(policy.events.visible!==false){if(presentation.presetVersion===2)drawDocumentary(target,{map,project,spec:paintSpec,time,width,height,events:frame.events});else drawDefaultLabels(target,{map,project,spec:paintSpec,time,width,height});}activePlugin?.render?.(target,{project,spec,map,time,width,height,isPortrait:h>w,night,policy});drawDefaultCredits(target,{spec:paintSpec,width,height,credit:[styleFor(spec)?.credit||'Natural Earth',policy.attribution.sourceCredit].filter(Boolean).join(' · '),date:frame.events.at(-1)?.date});target.restore();return;}
  const virtualScale=policy.scaling==='shortEdge1080'?Math.max(0.05,Math.min(width,height)/1080):1;
  const vw=width/virtualScale,vh=height/virtualScale;
  target.save();if(virtualScale!==1)target.scale(virtualScale,virtualScale);
  const ep=policy.events;
  if(ep.visible!==false){
   const occupied=[];target.font=ep.font;target.textBaseline='middle';
   const ch=ep.cardHeight??25,stepY=ep.stepY??27,padX=ep.padX??8,minY=ep.minY??50,maxBottom=ep.maxBottomMargin??70,attempts=ep.maxAttempts??8,radius=ep.cornerRadius??0,dotR=ep.dotRadius??4;
   const eventOrder=new globalThis.Map((spec.visual?.layers||[]).map((l,i)=>[l.ref,i]));
   for(const event of [...frame.events].sort((a,b)=>(eventOrder.get(a.id)||0)-(eventOrder.get(b.id)||0))){
    const layer=spec.visual?.layers.find(l=>l.kind==='event'&&l.ref===event.id);if(layer?.visible===false)continue;if(!locationVisible(map,event.coordinates,spec.projection))continue;
    const p=map.project(event.coordinates),px=p.x/virtualScale,py=p.y/virtualScale;if(px<0||py<minY||px>vw||py>vh-minY)continue;
    target.globalAlpha=layer?layerAlpha(project,layer,time):1;target.fillStyle=layer?.color||ep.dotColor||'#b25f3d';target.beginPath();target.arc(px,py,dotR,0,Math.PI*2);target.fill();
    const text=layer?.name||event.label,tw=Math.min(target.measureText(text).width+padX*2,vw-20);let x=Math.max(6,Math.min(vw-tw-6,px+10)),y=py-Math.round(ch*0.6);
    for(let i=0;i<attempts&&occupied.some(r=>x<r.x+r.w&&x+tw>r.x&&y<r.y+ch&&y+ch>r.y);i++)y+=stepY;
    if(y>vh-maxBottom)continue;occupied.push({x,y,w:tw});
    target.strokeStyle=ep.leaderColor||'#7b6145';target.lineWidth=ep.leaderWidth??1;target.beginPath();target.moveTo(px,py);target.lineTo(x,y+Math.floor(ch/2));target.stroke();
    target.fillStyle=night?ep.nightBg:ep.dayBg;
    if(ep.mode==='card'&&radius>0){drawRoundRect(target,x,y,tw,ch,radius);target.fill();if((ep.borderWidth??0)>0&&ep.borderColor){target.strokeStyle=ep.borderColor;target.lineWidth=ep.borderWidth;target.stroke();}}
    else target.fillRect(x,y,tw,ch);
    target.fillStyle=night?ep.nightText:ep.dayText;target.fillText(text,x+padX,y+Math.ceil(ch/2),tw-padX*2);
   }
  }
  const active=frame.events.at(-1),dp=policy.dateBanner;
  if(dp.visible!==false&&active){
   target.globalAlpha=1;target.textBaseline='middle';target.font=dp.font;
   if(dp.mode==='pill'){
    const padX=dp.padX??24,bh=dp.height??66,bx=24,by=dp.marginTop??22,text=String(active.date||'');
    const bw=Math.min(vw-48,target.measureText(text).width+padX*2);
    target.fillStyle=night?dp.nightBg:dp.dayBg;drawRoundRect(target,bx,by,bw,bh,dp.cornerRadius??16);target.fill();
    if((dp.borderWidth??0)>0&&dp.borderColor){target.strokeStyle=dp.borderColor;target.lineWidth=dp.borderWidth;target.stroke();}
    target.fillStyle=night?dp.nightText:dp.dayText;target.fillText(text,bx+padX,by+Math.ceil(bh/2),bw-padX*2);
   }else{
    target.fillStyle=night?dp.nightBg:dp.dayBg;target.fillRect(0,0,vw,dp.height);
    target.fillStyle=night?dp.nightText:dp.dayText;target.fillText(active.date,dp.padX??12,Math.ceil(dp.height/2),vw-(dp.padX??12)*2);
   }
  }
  target.restore();
  if(activePlugin?.render)activePlugin.render(target,{project,spec,map,time,width,height,isPortrait:h>w,night,policy});
  const ap=policy.attribution;
  if(ap.visible!==false){
   target.save();if(virtualScale!==1)target.scale(virtualScale,virtualScale);
   target.globalAlpha=1;target.textBaseline='middle';
   const attrHeight=ap.height??40,provider=styleFor(spec)?.credit||ap.fallbackProvider||'Natural Earth';
   const attrText=[provider,ap.sourceCredit||'',ap.suffix].filter(Boolean).join(' · ');
   target.fillStyle=night?ap.nightBg:ap.dayBg;target.fillRect(0,vh-attrHeight,vw,attrHeight);
   target.font=ap.font;target.fillStyle=night?ap.nightText:ap.dayText;target.fillText(attrText,8,vh-12,vw-16);
   if(spec.visual?.terrain?.enabled&&spec.visual.terrain.attribution)target.fillText(spec.visual.terrain.attribution,8,vh-26,vw-16);
   target.restore();
  }
  target.restore();
 }
 function draw(captureRecording=true,frame=null){if(disposed)return;const f=frame||(ready?mapFrame(project,spec,time):null);ctx.clearRect(0,0,canvas.width,canvas.height);if(ready)overlay(ctx,canvas.width,canvas.height,f);if(captureRecording&&recording){const {out,context}=recording;context.drawImage(map.getCanvas(),0,0,out.width,out.height);overlay(context,out.width,out.height,f);}}
 function seek(value){time=Math.max(0,Math.min(durationOf(project),Number(value)||0));let f=null;seeking=true;renderedDuringSeek=false;try{if(ready){f=mapFrame(project,spec,time);map.jumpTo(f.camera);const managed=new Set((spec.visual?.layers||[]).filter(l=>l.kind==='feature').map(l=>l.ref));const historyData={...f.features,features:f.features.features.filter(g=>{const l=spec.visual?.layers.find(l=>l.kind==='feature'&&l.ref===g.properties.id);return l?.visible!==false&&(!visual.native||!managed.has(g.properties.id));})},historyKey=JSON.stringify(historyData);if(historyKey!==lastHistoryData){lastHistoryData=historyKey;map.getSource('history').setData(historyData);}visual.frame(time);}}finally{seeking=false;}if(audio&&Math.abs(audio.currentTime-time)>0.3)audio.currentTime=Math.min(time,Number.isFinite(audio.duration)?audio.duration:time);onTime(time);draw(!recording||renderedDuringSeek,f);}
 function stop(){playing=false;clearTimeout(tickTimer);tickTimer=0;cancelAnimationFrame(raf);audio?.pause();if(recording?.recorder.state==='recording')recording.recorder.stop();}
 function tick(now){if(!playing||disposed)return;const dt=(now-last)/1000;last=now;seek(audio&&!audio.paused&&!audio.ended?audio.currentTime:time+dt);if(time>=durationOf(project)){stop();return;}if(recording){tickTimer=setTimeout(()=>{tickTimer=0;if(playing&&!disposed)raf=requestAnimationFrame(tick);},dt>0.04?20:0);}else raf=requestAnimationFrame(tick);}
 async function play(){await loaded;if(disposed)return;if(time>=durationOf(project))seek(0);if(audio){await audioContext?.resume();await audio.play();}playing=true;last=performance.now();raf=requestAnimationFrame(tick);}
 async function setAudio(file){stop();if(audio){URL.revokeObjectURL(audio.src);audioSource?.disconnect();}audio=new Audio(URL.createObjectURL(file));audio.preload='auto';await new Promise((resolve,reject)=>{audio.onloadedmetadata=resolve;audio.onerror=()=>reject(Error('Unable to decode audio.'));});if(!audioContext)audioContext=new AudioContext();audioSource=audioContext.createMediaElementSource(audio);audioSource.connect(audioContext.destination);return audio.duration;}
 function exportViewport(ratio,resolution){
  const dimensions=exportDimensions(ratio,resolution),oldStyle=host.getAttribute('style'),oldPixelRatio=map.getPixelRatio?.()??devicePixelRatio;
  const interactions=['boxZoom','doubleClickZoom','dragRotate','dragPan','keyboard','scrollZoom','touchZoomRotate','touchPitch'].map(key=>[map[key],map[key]?.isEnabled?.()]);for(const [handler,enabled] of interactions)if(enabled)handler.disable();
  const width=host.clientWidth;Object.assign(host.style,{width:width+'px',height:(width*dimensions.height/dimensions.width)+'px',aspectRatio:dimensions.width+' / '+dimensions.height,minHeight:'0',maxHeight:'none'});
  map.setPixelRatio?.(dimensions.width/width);map.resize();
  const restore=()=>{if(oldStyle===null)host.removeAttribute('style');else host.setAttribute('style',oldStyle);if(!disposed){map.setPixelRatio?.(oldPixelRatio);map.resize();for(const [handler,enabled] of interactions)if(enabled)handler.enable();}};
  return {...dimensions,restore};
 }
 async function settledFrame(signal){
  if(!visual.native)throw Error('HD rendering requires WebGL2. This browser is showing the basic 2D fallback.');
  if(providerError)throw Error(providerError);
  await new Promise((resolve,reject)=>{
   const finish=error=>{clearTimeout(timer);map.off('render',check);signal?.removeEventListener('abort',aborted);error?reject(error):resolve();};
   const aborted=()=>finish(signal.reason||new DOMException('Render cancelled','AbortError'));
   const check=()=>{
    const pluginError=(activePlugin?.errors?.()||[])[0];
    const error=renderError||visual.assetErrors[0]||pluginError;
    if(error){finish(error instanceof Error?error:Error(String(error)));return;}
    const pluginReady=activePlugin?.ready?!!activePlugin.ready():true;
    if(map.areTilesLoaded()&&map.isStyleLoaded()&&visual.assetsReady&&pluginReady)finish();else map.triggerRepaint();
   };
   const timer=setTimeout(()=>finish(Error('Map tiles or artwork did not finish loading. Check the provider/asset URL and retry.')),30000);
   map.on('render',check);signal?.addEventListener('abort',aborted,{once:true});if(signal?.aborted)aborted();else map.triggerRepaint();
  });
 }
 async function renderVideo(ratio='16:9',resolution='1080p',onProgress=()=>{}){
  if(exportController||recordController)throw Error('An export is already running.');
  exportController=new AbortController();const signal=exportController.signal,previous=time;let viewport=null;
  try{
   await loaded;signal.throwIfAborted();
   stop();viewport=exportViewport(ratio,resolution);const out=document.createElement('canvas');out.width=viewport.width;out.height=viewport.height;const target=out.getContext('2d');
   await document.fonts.ready;signal.throwIfAborted();
   return await encodeMapVideo({canvas:out,duration:durationOf(project),signal,onProgress,async drawFrame(t){seek(t);await settledFrame(signal);target.clearRect(0,0,out.width,out.height);target.drawImage(map.getCanvas(),0,0,out.width,out.height);overlay(target,out.width,out.height);}});
  }finally{viewport?.restore();exportController=null;if(!disposed&&ready)seek(previous);}
 }
 async function record(ratio,resolution='720p'){
  if(exportController||recordController)throw Error('An export is already running.');
  recordController=new AbortController();const signal=recordController.signal;let viewport=null,stream=null,dest=null;
  try{
   await loaded;signal.throwIfAborted();
   if(!globalThis.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw Error('Video recording is not supported in this browser.');
   const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw Error('This browser cannot export WebM.');
   stop();seek(0);viewport=exportViewport(ratio,resolution);const out=document.createElement('canvas');out.width=viewport.width;out.height=viewport.height;
   if(visual.native)await settledFrame(signal);signal.throwIfAborted();
   const context=out.getContext('2d');stream=out.captureStream(30);
   if(audioSource){dest=audioContext.createMediaStreamDestination();audioSource.connect(dest);stream.addTrack(dest.stream.getAudioTracks()[0]);}
   const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:Math.round(out.width*out.height*30*0.18)}),chunks=[];
   const result=new Promise((resolve,reject)=>{recorder.onstop=()=>{recording=null;if(signal.aborted)reject(signal.reason);else resolve(new Blob(chunks,{type:mime}));};recorder.onerror=()=>{stop();reject(Error('Video export failed.'));};});
   result.catch(()=>{});
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   signal.throwIfAborted();
   recording={out,context,recorder};
   try{recorder.start(250);await play();signal.throwIfAborted();return await result;}catch(error){stop();await result.catch(()=>{});throw error;}
  }finally{recording=null;recordController=null;stream?.getTracks().forEach(t=>t.stop());if(dest)audioSource.disconnect(dest);viewport?.restore();}
 }
 const onRender=()=>{if(seeking){renderedDuringSeek=true;return;}draw(true);},onMove=()=>{if(!seeking&&!recording)draw(false);};
 map.on('render',onRender);map.on('move',onMove);
 const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
 return {loaded,seek,play,settleFrame:settledFrame,pause:stop,setAudio,record,renderVideo,cancelRender(){exportController?.abort(new DOMException('Render cancelled','AbortError'));recordController?.abort(new DOMException('Recording cancelled','AbortError'));if(recording)stop();},map,get providerError(){return providerError;},get isNative(){return visual.native;},get overlayPolicy(){return policy;},async setSpec(next){
  stop();const prevSpec=spec,prevNight=night,prevPolicy=policy,prevPlugin=activePlugin,prevPluginKey=pluginKey,prevBaseKey=baseKey,prevRenderError=renderError;
  renderError='';const key=JSON.stringify([next.theme,next.basemap]);
  const nextKey=overlayPlugin?'__explicit__':pluginIdentity(project,next);
  let nextPlugin=prevPlugin,createdNewPlugin=false;
  if(!overlayPlugin&&nextKey!==prevPluginKey){nextPlugin=instantiatePlugin(project,next,null);createdNewPlugin=true;}
  const nextPolicy=resolveOverlayPolicy(project,next,nextPlugin?.policy);
  try{
   let nextStyle=null;
   if(visual.native&&key!==baseKey){nextStyle=await baseStyle(next);}
   if(needsFonts(next))await ensureDocumentaryFonts();
   await nextPlugin?.preload?.(project,next);
   if(nextStyle){
    ready=false;renderError='';
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{map.off('style.load',done);reject(Error('Map style loading timed out.'));},30000);const done=()=>{clearTimeout(timer);historyLayers();resolve();};map.once('style.load',done);map.setStyle(nextStyle);});
    baseKey=key;providerError='';ready=true;
   }
   spec=next;night=next.theme==='night';policy=nextPolicy;activePlugin=nextPlugin;pluginKey=nextKey;
   if(visual.native)map.setProjection({type:spec.projection||'mercator'});else {map.night=night;if(next.basemap?.id&&next.basemap.id!=='physical')onError('Detailed map-library styles need WebGL2; this is the basic 2D fallback.');}
   await visual.setSpec(spec,policy);
   if(createdNewPlugin&&prevPlugin&&prevPlugin!==nextPlugin){try{prevPlugin.destroy?.();}catch{}}
   if(!disposed)seek(time);
  }catch(error){
   if(createdNewPlugin&&nextPlugin&&nextPlugin!==prevPlugin){try{nextPlugin.destroy?.();}catch{}}
   spec=prevSpec;night=prevNight;policy=prevPolicy;activePlugin=prevPlugin;pluginKey=prevPluginKey;renderError=prevRenderError;
   if(visual.native){
    map.setProjection({type:spec.projection||'mercator'});
    if(baseKey!==prevBaseKey){
     try{const oldStyle=await baseStyle(prevSpec);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Restore timed out')),15000);map.once('style.load',()=>{clearTimeout(timer);historyLayers();resolve();});map.setStyle(oldStyle);});baseKey=prevBaseKey;ready=true;}catch{}
    }
    await visual.setSpec(prevSpec,prevPolicy).catch(()=>{});
   }else{map.night=night;}
   if(!disposed)seek(time);
   throw error;
  }
 },setCamera(camera){stop();map.jumpTo(camera);draw();},get time(){return time;},get camera(){return {center:map.getCenter().toArray(),zoom:map.getZoom(),bearing:map.getBearing(),pitch:map.getPitch()};},destroy(){if(disposed)return;disposed=true;exportController?.abort(new DOMException('Render closed','AbortError'));recordController?.abort(new DOMException('Recording closed','AbortError'));stop();resize.disconnect();document.removeEventListener('visibilitychange',hidden);if(audio){audio.pause();URL.revokeObjectURL(audio.src);}audioSource?.disconnect();audioContext?.close();visual.destroy();try{activePlugin?.destroy?.();}catch{}map.remove();canvas.remove();}};
}
