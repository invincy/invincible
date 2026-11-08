import {encodeStudioVideo} from '../../creator/video-studio/export.js';
import {exportDimensions,emptyVideo,PRESETS,validateManifest,compileTimeline} from '../../creator/video-studio/model.js';
import {createStudioRenderer} from '../../creator/video-studio/adapters.js';
import {decodeVoiceover} from '../../creator/video-studio/audio.js';
import {openStudioStore} from '../../creator/video-studio/storage.js';
export function voiceFixture(){
 const rate=48000,frames=rate,bytes=new Uint8Array(44+frames*2),v=new DataView(bytes.buffer),text=(s,at)=>[...s].forEach((c,i)=>v.setUint8(at+i,c.charCodeAt(0)));
 text('RIFF',0);v.setUint32(4,bytes.length-8,true);text('WAVEfmt ',8);v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text('data',36);v.setUint32(40,frames*2,true);
 for(let i=0;i<frames;i++)v.setInt16(44+i*2,i>rate*.05&&i<rate*.8?Math.round(Math.sin(i/rate*2*Math.PI*440)*16000):0,true);
 return new File([bytes],'synthetic-voice.wav',{type:'audio/wav'});
}
const check=(condition,message)=>{if(!condition)throw Error(message);};
export async function inspectVideo(blob,times=[]){
 const video=document.createElement('video'),url=URL.createObjectURL(blob);video.src=url;
 try{
  await new Promise((r,j)=>{video.onloadedmetadata=r;video.onerror=()=>j(Error('MP4 did not decode.'));});
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d'),pixels=[];
  for(const t of times){video.currentTime=t;await new Promise(r=>video.onseeked=r);ctx.drawImage(video,0,0,1,1);pixels.push(ctx.getImageData(0,0,1,1).data[0]);}
  const context=new AudioContext();let audio;try{audio=await context.decodeAudioData(await blob.arrayBuffer());}finally{await context.close();}
  const samples=audio.getChannelData(0),rate=audio.sampleRate,step=Math.round(rate*.005);let onset=-1,energy=0;
  for(let i=0;i<samples.length;i+=step){let power=0;for(let n=i;n<Math.min(samples.length,i+step);n++)power+=samples[n]*samples[n];if(onset<0&&Math.sqrt(power/step)>.05)onset=i/rate;energy+=power;}
  return {width:video.videoWidth,height:video.videoHeight,duration:video.duration,audioDuration:audio.duration,onset,energy,pixels,bytes:blob.size};
 }finally{URL.revokeObjectURL(url);}
}
export async function verifyMedia(onProgress=()=>{},onBlob=()=>{}){
 const results=[],audioFile=voiceFixture(),audio=await decodeVoiceover(audioFile);
 // Local persistence of the original uploaded bytes, isolated to a synthetic account.
 const s=openStudioStore('video-verification-fixture');try{await s.put('file:voice',audioFile);const restored=await s.get('file:voice'),a=new Uint8Array(await audioFile.arrayBuffer()),b=new Uint8Array(await restored.arrayBuffer());check(a.length===b.length&&a.every((v,i)=>v===b[i]),'Original audio bytes changed.');}finally{await s.close();}
 for(const ratio of ['9:16','16:9']){
  onProgress('Encoding '+ratio);const canvas=document.createElement('canvas');Object.assign(canvas,exportDimensions(ratio));const ctx=canvas.getContext('2d');let codec;
  const blob=await encodeStudioVideo({canvas,timeline:{duration:2,audioStart:.75},audioBuffer:audio,onAudioCodec:c=>codec=c,drawFrame:t=>{ctx.fillStyle=t>=.8?'#ffffff':'#000000';ctx.fillRect(0,0,canvas.width,canvas.height);}});
  const result=await inspectVideo(blob,[.7,.9]);check(result.width===canvas.width&&result.height===canvas.height,'Wrong output dimensions.');check(Math.abs(result.duration-2)<1/30,'Wrong duration.');check(result.energy>100,'Encoded audio is silent.');check(Math.abs(result.onset-.8)<=1/30,'Audio/visual sync exceeds one frame.');check(result.pixels[0]<10&&result.pixels[1]>240,'Visual cue did not decode.');results.push({ratio,codec,...result});onBlob(blob,ratio);
 }
 onProgress('Checking brand templates, LIC adapter and original media');
 const graphic=(id,start,duration,text)=>({id,startSeconds:start,durationSeconds:duration,engineType:'graphic',engineData:{},overlays:[{id:'label',type:'text',text,fontSize:60}]}),brand={...PRESETS[0],intro:graphic('intro',0,.5,'Intro'),outro:graphic('outro',0,.5,'Outro')};
 const manifest={...emptyVideo(),introEnabled:true,outroEnabled:true,audio:{fileId:'voice',name:audioFile.name,startSeconds:.25,gain:1},scenes:[graphic('story',0,.5,'Story'),{id:'lic',startSeconds:.5,durationSeconds:.5,engineType:'lic',engineData:{title:'Synthetic only',source:'Fixture — not a policy quote',points:[{timeSeconds:0,year:1,label:'Premium',premium:100},{timeSeconds:.25,year:2,label:'Payout',income:50}]},overlays:[]}]};
 validateManifest(manifest);const plain=compileTimeline({...manifest,introEnabled:false,outroEnabled:false},brand,audio.duration),timeline=compileTimeline(manifest,brand,audio.duration);check(plain.scenes.length===2&&timeline.scenes.length===4,'Intro/outro opt-in failed.');check(timeline.audioStart===.75,'Intro audio offset failed.');
 const canvas=document.createElement('canvas');Object.assign(canvas,exportDimensions('9:16'));const renderer=await createStudioRenderer(canvas,manifest,timeline,brand,{getFile:()=>audioFile});
 try{const blob=await encodeStudioVideo({canvas,timeline,audioBuffer:audio,drawFrame:(t,signal)=>renderer.draw(t,{exporting:true,signal})}),result=await inspectVideo(blob);check(Math.abs(result.onset-.8)<=1/30&&result.energy>100,'Branded audio synchronization failed.');results.push({brandAndLic:true,...result});onBlob(blob,'branded');}finally{renderer.destroy();}
 // Cancel during encoding and require an explicit rejection, never a partial file.
 const abort=new AbortController();let rejected=false;try{await encodeStudioVideo({canvas,timeline:{duration:2,audioStart:0},audioBuffer:audio,signal:abort.signal,drawFrame:()=>abort.abort(new DOMException('Test cancelled','AbortError'))});}catch(e){rejected=e.name==='AbortError';}check(rejected,'Cancellation did not reject.');results.push({cancelled:true,originalBytesPreserved:true});
 onProgress('Checking Map adapter and native framebuffer');
 const animation={format:'invincible-map-animation',version:1,duration:1,aspectRatio:'9:16',basemap:'physical',terrain:false,camera:[{time:0,center:[73,28],zoom:4,pitch:0,bearing:0},{time:1,center:[75,30],zoom:5,pitch:0,bearing:0}],layers:[{id:'route',type:'route',name:'Synthetic route',start:0,end:1,coordinates:[[72,27],[76,32]],color:'#edc46a'}]};
 const mapManifest={...emptyVideo(),scenes:[{id:'map',startSeconds:0,durationSeconds:1,engineType:'map',engineData:{animation},overlays:[]}]};validateManifest(mapManifest);const mapTimeline=compileTimeline(mapManifest,PRESETS[0]);const mapRenderer=await createStudioRenderer(canvas,mapManifest,mapTimeline,PRESETS[0],{getFile:()=>null});
 try{await mapRenderer.draw(.25,{exporting:true});const host=document.querySelector('.vs-map-host .maplibregl-canvas');check(host?.width===1080&&host?.height===1920,'Map framebuffer is not 1080×1920.');const blob=await encodeStudioVideo({canvas,timeline:mapTimeline,audioBuffer:audio,drawFrame:(t,signal)=>mapRenderer.draw(t,{exporting:true,signal})}),result=await inspectVideo(blob);check(result.energy>100&&result.width===1080&&result.height===1920,'Map/audio export failed.');results.push({mapAdapter:true,...result});onBlob(blob,'map');}finally{mapRenderer.destroy();}
 return results;
}
