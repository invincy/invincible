import {documentaryLabels} from './documentary-map.js';
import {locationVisible} from './map-globe.js';
import {CanvasHistoricalMap} from './history-canvas.js';
import {mapFrame,durationOf,sceneTimeline} from './history-model.js';
import {createVisualRenderer} from './map-editor-renderer.js';
import {baseStyle,styleFor} from './map-style-library.js';
import {layerAlpha} from './map-editor-model.js';
import {exportDimensions,encodeMapVideo} from './map-video-export.js';
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function sizeMapFrame(host,ratio){const aspect=ratio==='9:16'?9/16:16/9;host.style.width=`min(100%, ${Math.floor(window.innerHeight*0.58*aspect)}px)`;host.style.aspectRatio=ratio==='9:16'?'9 / 16':'16 / 9';host.style.maxHeight='none';}
export async function createHistoryPlayer(host,project,spec,{onTime=()=>{},onError=()=>{}}={}){
 const {Map,NavigationControl}=await import('./vendor/maplibre-gl.mjs');
 let night=spec.theme==='night';const background=night?'#101e2b':'#d8caaa',land=night?'#273f4e':'#a99f7f';
 let initialStyle,providerError='';try{initialStyle=await baseStyle(spec);}catch(error){providerError=error.message;initialStyle=await baseStyle({...spec,basemap:undefined});onError(providerError+' Showing the basic physical map; change the library style to retry.');}
 let baseKey=providerError?'':JSON.stringify([spec.theme,spec.basemap]);
 let map;try{map=new Map({container:host,center:[80,23],zoom:3.2,fadeDuration:0,canvasContextAttributes:{preserveDrawingBuffer:true},style:initialStyle,attributionControl:false});}catch{host.replaceChildren();map=new CanvasHistoricalMap(host,{night});onError('WebGL2 unavailable: using the 2D physical-map preview.');}
 if(map.addControl)map.addControl(new NavigationControl({showCompass:true}),'top-right');
 const visual=createVisualRenderer(map,project,onError);
 const canvas=document.createElement('canvas');canvas.className='history-overlay';canvas.setAttribute('aria-label','Historical events and date markers');host.append(canvas);
 const ctx=canvas.getContext('2d');let ready=false,disposed=false,raf=0,time=0,playing=false,last=0,recording=null,audio=null,audioContext=null,audioSource=null,exportController=null,recordController=null,renderError='';
 const resize=new ResizeObserver(()=>{canvas.width=Math.max(1,Math.round(host.clientWidth*devicePixelRatio));canvas.height=Math.max(1,Math.round(host.clientHeight*devicePixelRatio));map.resize();draw();});resize.observe(host);
 function historyLayers(){map.addSource('history',{type:'geojson',data:{type:'FeatureCollection',features:[]}});map.addLayer({id:'territory',source:'history',type:'fill',filter:['in',['geometry-type'],['literal',['Polygon','MultiPolygon']]],paint:{'fill-color':'#b26b4a','fill-opacity':0.5}});map.addLayer({id:'routes',source:'history',type:'line',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#ae4b33','line-width':3}});}
 const loaded=new Promise((resolve,reject)=>{map.once('load',async()=>{ready=true;historyLayers();try{await visual.setSpec(spec);if(disposed)return;seek(0);resolve();}catch(e){reject(e);}});map.on('error',e=>{renderError='Map: '+(e.error?.message||'render error');onError(renderError);if(!ready)reject(e.error||Error('Map failed to load.'));});});
 function overlay(target,w,h){
  const sx=w/host.clientWidth,sy=h/host.clientHeight;target.save();target.scale(sx,sy);const width=host.clientWidth,height=host.clientHeight;
  const frame=mapFrame(project,spec,time),occupied=[];
  target.font='600 12px system-ui';target.textBaseline='middle';
  const eventOrder=new globalThis.Map((spec.visual?.layers||[]).map((l,i)=>[l.ref,i]));for(const event of [...frame.events].sort((a,b)=>(eventOrder.get(a.id)||0)-(eventOrder.get(b.id)||0))){const layer=spec.visual?.layers.find(l=>l.kind==='event'&&l.ref===event.id);if(layer?.visible===false)continue;if(!locationVisible(map,event.coordinates,spec.projection))continue;const p=map.project(event.coordinates);if(p.x<0||p.y<50||p.x>width||p.y>height-50)continue;target.globalAlpha=layer?layerAlpha(project,layer,time):1;target.fillStyle=layer?.color||'#b25f3d';target.beginPath();target.arc(p.x,p.y,4,0,Math.PI*2);target.fill();const text=layer?.name||event.label,tw=Math.min(target.measureText(text).width+16,width-20);let x=Math.max(6,Math.min(width-tw-6,p.x+10)),y=p.y-15;
   for(let i=0;i<8&&occupied.some(r=>x<r.x+r.w&&x+tw>r.x&&y<r.y+25&&y+25>r.y);i++)y+=27;
   if(y>height-70)continue;occupied.push({x,y,w:tw});target.strokeStyle='#7b6145';target.beginPath();target.moveTo(p.x,p.y);target.lineTo(x,y+12);target.stroke();target.fillStyle=night?'#102331e8':'#eee4cde8';target.fillRect(x,y,tw,25);target.fillStyle=night?'#eee4cd':'#312c25';target.fillText(text,x+8,y+13,tw-16);
  }
  target.globalAlpha=1;for(const f of frame.features.features.filter(f=>f.geometry.type==='LineString')){const layer=spec.visual?.layers.find(l=>l.kind==='feature'&&l.ref===f.properties.id);if(layer?.visible===false||layer?.arrowhead===false)continue;const c=f.geometry.coordinates;if(!locationVisible(map,c.at(-1),spec.projection)||!locationVisible(map,c.at(-2),spec.projection))continue;const a=map.project(c.at(-2)),b=map.project(c.at(-1));target.save();target.globalAlpha=layer?layerAlpha(project,layer,time):1;target.translate(b.x,b.y);target.rotate(Math.atan2(b.y-a.y,b.x-a.x));target.fillStyle=layer?.color||'#ae4b33';target.beginPath();target.moveTo(0,0);target.lineTo(-12,-5);target.lineTo(-12,5);target.closePath();target.fill();target.restore();}
  if(spec.basemap?.id==='documentary'&&spec.basemap.labels){
   for(const label of documentaryLabels){
    if(!locationVisible(map,label.position,spec.projection))continue;
    const p=map.project(label.position);target.font=`600 ${Math.max(10,18*label.scale)}px system-ui`;
    const w=target.measureText(label.name).width;
    if(p.x-w/2<5||p.x+w/2>width-5||p.y<20||p.y>height-55)continue;
    target.save();target.textAlign='center';target.lineJoin='round';target.lineWidth=3;target.strokeStyle='#102331';target.fillStyle='#f5fbff';target.strokeText(label.name,p.x,p.y);target.fillText(label.name,p.x,p.y);target.restore();
   }
  }
  visual.overlay(target,time);
  const active=frame.events.at(-1);target.globalAlpha=1;target.fillStyle=night?'#102331e8':'#eee4cde8';if(active){target.fillRect(0,0,width,45);target.fillStyle=night?'#eee4cd':'#312c25';target.font='600 15px system-ui';target.fillText(active.date,12,23,width-24);}target.fillStyle=night?'#102331e8':'#eee4cde8';const osmCredit=spec.features.features.some(f=>f.properties.sourceUrl?.includes('openstreetmap.org'));target.fillRect(0,height-(osmCredit?54:40),width,osmCredit?54:40);target.font='9px system-ui';target.fillStyle=night?'#eee4cd':'#312c25';target.fillText((styleFor(spec)?.credit||'Natural Earth')+' · Imported geography: see Sources',8,height-12,width-16);if(spec.visual?.terrain?.enabled)target.fillText(spec.visual.terrain.attribution,8,height-26,width-16);if(osmCredit)target.fillText('Transport: © OpenStreetMap contributors · ODbL 1.0',8,height-40,width-16);target.restore();
 }
 function draw(){if(disposed)return;ctx.clearRect(0,0,canvas.width,canvas.height);if(ready)overlay(ctx,canvas.width,canvas.height);if(recording){const {out,context}=recording;context.drawImage(map.getCanvas(),0,0,out.width,out.height);overlay(context,out.width,out.height);}}
 function seek(value){time=Math.max(0,Math.min(durationOf(project),Number(value)||0));if(ready){const f=mapFrame(project,spec,time);map.jumpTo(f.camera);const managed=new Set((spec.visual?.layers||[]).filter(l=>l.kind==='feature').map(l=>l.ref));map.getSource('history').setData({...f.features,features:f.features.features.filter(g=>{const l=spec.visual?.layers.find(l=>l.kind==='feature'&&l.ref===g.properties.id);return l?.visible!==false&&(!visual.native||!managed.has(g.properties.id));})});visual.frame(time);}if(audio&&Math.abs(audio.currentTime-time)>0.3)audio.currentTime=Math.min(time,Number.isFinite(audio.duration)?audio.duration:time);onTime(time);draw();}
 function stop(){playing=false;cancelAnimationFrame(raf);audio?.pause();if(recording?.recorder.state==='recording')recording.recorder.stop();}
 function tick(now){if(!playing||disposed)return;const dt=(now-last)/1000;last=now;seek(audio&&!audio.paused&&!audio.ended?audio.currentTime:time+dt);if(time>=durationOf(project)){stop();return;}raf=requestAnimationFrame(tick);}
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
   const check=()=>{const error=renderError||visual.assetErrors[0];if(error){finish(Error(error));return;}if(map.areTilesLoaded()&&map.isStyleLoaded()&&visual.assetsReady)finish();else map.triggerRepaint();};
   const timer=setTimeout(()=>finish(Error('Map tiles or artwork did not finish loading. Check the provider/asset URL and retry.')),30000);
   map.on('render',check);signal?.addEventListener('abort',aborted,{once:true});if(signal?.aborted)aborted();else map.triggerRepaint();
  });
 }
 async function renderVideo(ratio='16:9',resolution='1080p',onProgress=()=>{}){
  await loaded;if(exportController||recordController)throw Error('An export is already running.');stop();
  exportController=new AbortController();const signal=exportController.signal,previous=time,viewport=exportViewport(ratio,resolution),out=document.createElement('canvas');out.width=viewport.width;out.height=viewport.height;const target=out.getContext('2d');
  try{
   await document.fonts.ready;
   return await encodeMapVideo({canvas:out,duration:durationOf(project),signal,onProgress,async drawFrame(t){seek(t);await settledFrame(signal);target.clearRect(0,0,out.width,out.height);target.drawImage(map.getCanvas(),0,0,out.width,out.height);overlay(target,out.width,out.height);}});
  }finally{viewport.restore();exportController=null;if(!disposed)seek(previous);}
 }
 async function record(ratio,resolution='720p'){
  await loaded;if(!globalThis.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw Error('Video recording is not supported in this browser.');
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw Error('This browser cannot export WebM.');
  if(exportController||recordController)throw Error('An export is already running.');
  stop();seek(0);recordController=new AbortController();const signal=recordController.signal,viewport=exportViewport(ratio,resolution),out=document.createElement('canvas');let stream,dest;out.width=viewport.width;out.height=viewport.height;
  try{
   if(visual.native)await settledFrame(signal);signal.throwIfAborted();
   const context=out.getContext('2d');stream=out.captureStream(30);
   if(audioSource){dest=audioContext.createMediaStreamDestination();audioSource.connect(dest);stream.addTrack(dest.stream.getAudioTracks()[0]);}
   const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:Math.round(out.width*out.height*30*0.18)}),chunks=[];
   recording={out,context,recorder};recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   const result=new Promise((resolve,reject)=>{recorder.onstop=()=>{recording=null;if(signal.aborted)reject(signal.reason);else resolve(new Blob(chunks,{type:mime}));};recorder.onerror=()=>{stop();reject(Error('Video export failed.'));};});
   recorder.start(250);try{await play();return await result;}catch(error){stop();await result.catch(()=>{});throw error;}
  }finally{recordController=null;stream?.getTracks().forEach(t=>t.stop());if(dest)audioSource.disconnect(dest);viewport.restore();}
 }
 map.on('render',draw);map.on('move',draw);
 const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
 return {loaded,seek,play,pause:stop,setAudio,record,renderVideo,cancelRender(){exportController?.abort(new DOMException('Render cancelled','AbortError'));recordController?.abort(new DOMException('Recording cancelled','AbortError'));if(recording)stop();},map,get providerError(){return providerError;},get isNative(){return visual.native;},async setSpec(next){
  stop();renderError='';const key=JSON.stringify([next.theme,next.basemap]);
  if(visual.native&&key!==baseKey){const style=await baseStyle(next);ready=false;renderError='';await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{map.off('style.load',done);reject(Error('Map style loading timed out.'));},30000);const done=()=>{clearTimeout(timer);historyLayers();resolve();};map.once('style.load',done);map.setStyle(style);});baseKey=key;providerError='';ready=true;}
  spec=next;night=spec.theme==='night';if(visual.native)map.setProjection({type:spec.projection||'mercator'});else {map.night=night;if(next.basemap?.id&&next.basemap.id!=='physical')onError('Detailed map-library styles need WebGL2; this is the basic 2D fallback.');}
  await visual.setSpec(spec);if(!disposed)seek(time);
 },setCamera(camera){stop();map.jumpTo(camera);draw();},get time(){return time;},get camera(){return {center:map.getCenter().toArray(),zoom:map.getZoom(),bearing:map.getBearing(),pitch:map.getPitch()};},destroy(){if(disposed)return;disposed=true;exportController?.abort(new DOMException('Render closed','AbortError'));recordController?.abort(new DOMException('Recording closed','AbortError'));stop();resize.disconnect();document.removeEventListener('visibilitychange',hidden);if(audio){audio.pause();URL.revokeObjectURL(audio.src);}audioSource?.disconnect();audioContext?.close();visual.destroy();map.remove();canvas.remove();}};
}
