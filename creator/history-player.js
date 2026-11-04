import {CanvasHistoricalMap} from './history-canvas.js';
import {mapFrame,durationOf,sceneTimeline} from './history-model.js';
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function sizeMapFrame(host,ratio){const aspect=ratio==='9:16'?9/16:16/9;host.style.width=`min(100%, ${Math.floor(window.innerHeight*0.58*aspect)}px)`;host.style.aspectRatio=ratio==='9:16'?'9 / 16':'16 / 9';host.style.maxHeight='none';}
export async function createHistoryPlayer(host,project,spec,{onTime=()=>{},onError=()=>{}}={}){
 const {Map,NavigationControl}=await import('./vendor/maplibre-gl.mjs');
 const night=spec.theme==='night',background=night?'#101e2b':'#d8caaa',land=night?'#273f4e':'#a99f7f';
 let map;try{map=new Map({container:host,center:[80,23],zoom:3.2,canvasContextAttributes:{preserveDrawingBuffer:true},style:{version:8,sources:{land:{type:'geojson',data:new URL('./history-data/land.geojson',import.meta.url).href,attribution:'Natural Earth (public domain). Physical coastline; no political borders.'}},layers:[{id:'water',type:'background',paint:{'background-color':background}},{id:'land',type:'fill',source:'land',paint:{'fill-color':land}}]},attributionControl:false});}catch{host.replaceChildren();map=new CanvasHistoricalMap(host,{night});onError('WebGL2 unavailable: using the 2D physical-map preview.');}
 if(map.addControl)map.addControl(new NavigationControl({showCompass:true}),'top-right');
 const canvas=document.createElement('canvas');canvas.className='history-overlay';canvas.setAttribute('aria-label','Historical events and date markers');host.append(canvas);
 const ctx=canvas.getContext('2d');let ready=false,disposed=false,raf=0,time=0,playing=false,last=0,recording=null,audio=null,audioContext=null,audioSource=null;
 const resize=new ResizeObserver(()=>{canvas.width=Math.max(1,Math.round(host.clientWidth*devicePixelRatio));canvas.height=Math.max(1,Math.round(host.clientHeight*devicePixelRatio));map.resize();draw();});resize.observe(host);
 const loaded=new Promise((resolve,reject)=>{map.once('load',()=>{ready=true;map.addSource('history',{type:'geojson',data:{type:'FeatureCollection',features:[]}});map.addLayer({id:'territory',source:'history',type:'fill',filter:['in',['geometry-type'],['literal',['Polygon','MultiPolygon']]],paint:{'fill-color':'#b26b4a','fill-opacity':0.5}});map.addLayer({id:'routes',source:'history',type:'line',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#ae4b33','line-width':3}});seek(0);resolve();});map.on('error',e=>{onError('Map: '+(e.error?.message||'render error'));if(!ready)reject(e.error||Error('Map failed to load.'));});});
 function overlay(target,w,h){
  const sx=w/host.clientWidth,sy=h/host.clientHeight;target.save();target.scale(sx,sy);const width=host.clientWidth,height=host.clientHeight;
  const frame=mapFrame(project,spec,time),occupied=[];
  target.font='600 12px system-ui';target.textBaseline='middle';
  for(const event of frame.events){const p=map.project(event.coordinates);if(p.x<0||p.y<50||p.x>width||p.y>height-50)continue;target.fillStyle='#b25f3d';target.beginPath();target.arc(p.x,p.y,4,0,Math.PI*2);target.fill();const text=event.label,tw=Math.min(target.measureText(text).width+16,width-20);let x=Math.max(6,Math.min(width-tw-6,p.x+10)),y=p.y-15;
   for(let i=0;i<8&&occupied.some(r=>x<r.x+r.w&&x+tw>r.x&&y<r.y+25&&y+25>r.y);i++)y+=27;
   if(y>height-70)continue;occupied.push({x,y,w:tw});target.strokeStyle='#7b6145';target.beginPath();target.moveTo(p.x,p.y);target.lineTo(x,y+12);target.stroke();target.fillStyle=night?'#102331e8':'#eee4cde8';target.fillRect(x,y,tw,25);target.fillStyle=night?'#eee4cd':'#312c25';target.fillText(text,x+8,y+13,tw-16);
  }
  for(const f of frame.features.features.filter(f=>f.geometry.type==='LineString')){const c=f.geometry.coordinates,a=map.project(c.at(-2)),b=map.project(c.at(-1));target.save();target.translate(b.x,b.y);target.rotate(Math.atan2(b.y-a.y,b.x-a.x));target.fillStyle='#ae4b33';target.beginPath();target.moveTo(0,0);target.lineTo(-12,-5);target.lineTo(-12,5);target.closePath();target.fill();target.restore();}
  const active=frame.events.at(-1);target.fillStyle=night?'#102331e8':'#eee4cde8';target.fillRect(0,0,width,45);target.fillStyle=night?'#eee4cd':'#312c25';target.font='600 15px system-ui';target.fillText(active?.date||'Historical map',12,23,width-24);target.font='10px system-ui';target.fillStyle=night?'#eee4cd':'#312c25';target.fillText('Natural Earth coastline • Historical events: see Sources • Locations approximate',8,height-12,width-16);target.restore();
 }
 function draw(){if(disposed)return;ctx.clearRect(0,0,canvas.width,canvas.height);if(ready)overlay(ctx,canvas.width,canvas.height);if(recording){const {out,context}=recording;context.drawImage(map.getCanvas(),0,0,out.width,out.height);overlay(context,out.width,out.height);}}
 function seek(value){time=Math.max(0,Math.min(durationOf(project),Number(value)||0));if(ready){const f=mapFrame(project,spec,time);map.jumpTo(f.camera);map.getSource('history').setData(f.features);}if(audio&&Math.abs(audio.currentTime-time)>0.3)audio.currentTime=Math.min(time,Number.isFinite(audio.duration)?audio.duration:time);onTime(time);draw();}
 function stop(){playing=false;cancelAnimationFrame(raf);audio?.pause();if(recording?.recorder.state==='recording')recording.recorder.stop();}
 function tick(now){if(!playing||disposed)return;const dt=(now-last)/1000;last=now;seek(audio&&!audio.paused&&!audio.ended?audio.currentTime:time+dt);if(time>=durationOf(project)){stop();return;}raf=requestAnimationFrame(tick);}
 async function play(){await loaded;if(disposed)return;if(time>=durationOf(project))seek(0);if(audio){await audioContext?.resume();await audio.play();}playing=true;last=performance.now();raf=requestAnimationFrame(tick);}
 async function setAudio(file){stop();if(audio){URL.revokeObjectURL(audio.src);audioSource?.disconnect();}audio=new Audio(URL.createObjectURL(file));audio.preload='auto';await new Promise((resolve,reject)=>{audio.onloadedmetadata=resolve;audio.onerror=()=>reject(Error('Unable to decode audio.'));});if(!audioContext)audioContext=new AudioContext();audioSource=audioContext.createMediaElementSource(audio);audioSource.connect(audioContext.destination);return audio.duration;}
 async function record(ratio){
  await loaded;if(!globalThis.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw Error('Video recording is not supported in this browser.');
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw Error('This browser cannot export WebM.');
  stop();seek(0);const out=document.createElement('canvas');out.width=ratio==='9:16'?720:1280;out.height=ratio==='9:16'?1280:720;
  // Match geographic framing to export aspect instead of stretching a landscape view.
  sizeMapFrame(host,ratio);map.resize();
  const context=out.getContext('2d'),stream=out.captureStream(30);let dest;
  if(audioSource){dest=audioContext.createMediaStreamDestination();audioSource.connect(dest);stream.addTrack(dest.stream.getAudioTracks()[0]);}
  const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000}),chunks=[];
  recording={out,context,recorder};recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const result=new Promise((resolve,reject)=>{recorder.onstop=()=>{recording=null;stream.getTracks().forEach(t=>t.stop());if(dest)audioSource.disconnect(dest);resolve(new Blob(chunks,{type:mime}));};recorder.onerror=()=>{stop();reject(Error('Video export failed.'));};});
  recorder.start(250);try{await play();}catch(error){stop();await result;throw error;}return result;
 }
 map.on('render',draw);map.on('move',draw);
 const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
 return {loaded,seek,play,pause:stop,setAudio,record,get time(){return time;},get camera(){return {center:map.getCenter().toArray(),zoom:map.getZoom(),bearing:map.getBearing(),pitch:map.getPitch()};},destroy(){disposed=true;stop();resize.disconnect();document.removeEventListener('visibilitychange',hidden);if(audio){audio.pause();URL.revokeObjectURL(audio.src);}audioSource?.disconnect();audioContext?.close();map.remove();canvas.remove();}};
}
