export async function decodeVoiceover(file){
 if(!file||file.size>100*1024*1024)throw Error('Choose an MP3 or WAV up to 100 MB.');
 const context=new AudioContext({sampleRate:48000});
 try{const buffer=await context.decodeAudioData(await file.arrayBuffer());if(buffer.numberOfChannels>2)throw Error('Use a mono or stereo voiceover; multichannel audio is not downmixed automatically.');if(buffer.duration>600)throw Error('Voiceover must be at most ten minutes.');return buffer;}finally{await context.close();}
}
// Chunking bounds extra memory and preserves all original samples, with leading silence.
export function audioChunk(buffer,startSeconds,gain,at,length,rate=48000){
 const channels=Math.min(2,buffer.numberOfChannels),data=new Float32Array(length*channels);
 for(let c=0;c<channels;c++){const source=buffer.getChannelData(c);for(let n=0;n<length;n++){const pos=((at+n)/rate-startSeconds)*buffer.sampleRate;if(pos<0||pos>=source.length)continue;const i=Math.floor(pos),f=pos-i;data[c*length+n]=(source[i]+((source[i+1]??source[i])-source[i])*f)*gain;}}
 return {data,channels};
}
export function audioGainAt(clip,local){
 if(local<0||local>=clip.durationSeconds)return 0;
 return clip.gain*Math.min(1,clip.fadeIn?local/clip.fadeIn:1,clip.fadeOut?(clip.durationSeconds-local)/clip.fadeOut:1);
}
export function mixAudioChunk(tracks,at,length,rate=48000){
 const channels=Math.max(1,...tracks.map(t=>t.buffer.numberOfChannels)),data=new Float32Array(length*channels);
 for(const t of tracks){for(let c=0;c<channels;c++){const source=t.buffer.getChannelData(Math.min(c,t.buffer.numberOfChannels-1));for(let n=0;n<length;n++){
  const local=(at+n)/rate-t.startSeconds;if(local<0||local>=t.durationSeconds)continue;const pos=((t.loop?local%t.sourceDurationSeconds:local)+t.trimStart)*t.buffer.sampleRate,i=Math.floor(pos),f=pos-i;if(i>=source.length)continue;
  let next=source[i+1]??source[i];if(t.loop&&(i+1)>=((t.trimStart+t.sourceDurationSeconds)*t.buffer.sampleRate)){const wrap=t.trimStart*t.buffer.sampleRate+((i+1-(t.trimStart+t.sourceDurationSeconds)*t.buffer.sampleRate)%(t.sourceDurationSeconds*t.buffer.sampleRate)),j=Math.floor(wrap),fraction=wrap-j;next=source[j]+((source[j+1]??source[j])-source[j])*fraction;}
  data[c*length+n]+=(source[i]+(next-source[i])*f)*audioGainAt(t,local);
 }}}
 for(let i=0;i<data.length;i++)data[i]=Math.max(-1,Math.min(1,data[i]));return {data,channels};
}
export function audioTrimWithinSource(clip,buffer){return clip.trimStart+(clip.loop?clip.sourceDurationSeconds:clip.durationSeconds)<=buffer.duration+1/Math.min(48000,buffer.sampleRate)+Number.EPSILON;}
// Scene clips use local time in saved JSON and the same absolute-time mixer as recordings.
export function audioClipsForManifest(manifest){
 return [...(manifest.audioClips||[]),...(manifest.scenes||[]).flatMap(scene=>(scene.audioClips||[]).map(clip=>({...clip,startSeconds:scene.startSeconds+clip.startSeconds})))];
}
export function findAudioClip(manifest,id){
 const global=manifest.audioClips?.find(clip=>clip.id===id);if(global)return {clip:global,scene:null};
 for(const scene of manifest.scenes||[]){const clip=scene.audioClips?.find(clip=>clip.id===id);if(clip)return {clip,scene};}
 return null;
}
export async function loadAudioTracks(manifest,getFile,{onUnavailable,decode=decodeVoiceover,fetchAsset=async url=>{const response=await fetch(url,{credentials:'omit'});if(!response.ok)throw Error('Sound could not be loaded (HTTP '+response.status+').');return response.blob();}}={}){
 const buffers = new Map(), tracks = [];
 for (const clip of audioClipsForManifest(manifest)) {
  const key=clip.fileId?'file:'+clip.fileId:'url:'+clip.url;
  if (!buffers.has(key)) buffers.set(key, (async () => {
   const file = clip.fileId?await getFile(clip.fileId):await fetchAsset(clip.url);
   if (!file) throw Error('Missing recording on this device: ' + clip.name);
   return decode(file);
  })());
  try {
   const buffer = await buffers.get(key);
   if (!audioTrimWithinSource(clip, buffer)) throw Error('Audio trim exceeds original recording: ' + clip.name);
   tracks.push({...clip, buffer});
  } catch (error) {
   if (!onUnavailable || error.name === 'AbortError') throw error;
   onUnavailable(clip, error);
  }
 }
 return tracks;
}
// Piecewise-linear envelopes match audioGainAt, including playback from the middle of a fade.
export function scheduleAudioTracks(context,tracks,time){
 const nodes=[];for(const t of tracks){const local=Math.max(0,time-t.startSeconds);if(local>=t.durationSeconds)continue;const when=context.currentTime+Math.max(0,t.startSeconds-time),source=context.createBufferSource(),gain=context.createGain();source.buffer=t.buffer;if(t.loop){source.loop=true;source.loopStart=t.trimStart;source.loopEnd=t.trimStart+t.sourceDurationSeconds;}gain.gain.setValueAtTime(audioGainAt(t,local),when);
  for(const [point,value] of [[t.fadeIn,t.gain],[t.durationSeconds-t.fadeOut,t.gain],[t.durationSeconds,t.fadeOut?0:t.gain]])if(point>local)gain.gain.linearRampToValueAtTime(value,when+point-local);
  source.connect(gain);gain.connect(context.destination);source.start(when,t.trimStart+(t.loop?local%t.sourceDurationSeconds:local),t.durationSeconds-local);nodes.push({source,gain});
 }return ()=>nodes.forEach(({source,gain})=>{try{source.stop();}catch{}source.disconnect();gain.disconnect();});
}
