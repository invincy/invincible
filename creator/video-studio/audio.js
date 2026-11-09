export async function decodeVoiceover(file){
 if(!file||file.size>100*1024*1024)throw Error('Choose an MP3 or WAV up to 100 MB.');
 const context=new AudioContext();
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
  const local=(at+n)/rate-t.startSeconds;if(local<0||local>=t.durationSeconds)continue;const pos=(local+t.trimStart)*t.buffer.sampleRate,i=Math.floor(pos),f=pos-i;if(i>=source.length)continue;
  data[c*length+n]+=(source[i]+((source[i+1]??source[i])-source[i])*f)*audioGainAt(t,local);
 }}}
 for(let i=0;i<data.length;i++)data[i]=Math.max(-1,Math.min(1,data[i]));return {data,channels};
}
export async function loadAudioTracks(manifest,getFile){
 const clips=manifest.audioClips||[],buffers=new Map(),tracks=[];
 for(const clip of clips){let buffer=buffers.get(clip.fileId);if(!buffer){const file=await getFile(clip.fileId);if(!file)throw Error('Missing recording on this device: '+clip.name);buffer=await decodeVoiceover(file);buffers.set(clip.fileId,buffer);}if(clip.trimStart+clip.durationSeconds>buffer.duration+1/48000)throw Error('Audio trim exceeds original recording: '+clip.name);tracks.push({...clip,buffer});}return tracks;
}
// Piecewise-linear envelopes match audioGainAt, including playback from the middle of a fade.
export function scheduleAudioTracks(context,tracks,time){
 const nodes=[];for(const t of tracks){const local=Math.max(0,time-t.startSeconds);if(local>=t.durationSeconds)continue;const when=context.currentTime+Math.max(0,t.startSeconds-time),source=context.createBufferSource(),gain=context.createGain();source.buffer=t.buffer;gain.gain.setValueAtTime(audioGainAt(t,local),when);
  for(const [point,value] of [[t.fadeIn,t.gain],[t.durationSeconds-t.fadeOut,t.gain],[t.durationSeconds,t.fadeOut?0:t.gain]])if(point>local)gain.gain.linearRampToValueAtTime(value,when+point-local);
  source.connect(gain);gain.connect(context.destination);source.start(when,t.trimStart+local,t.durationSeconds-local);nodes.push({source,gain});
 }return ()=>nodes.forEach(({source,gain})=>{try{source.stop();}catch{}source.disconnect();gain.disconnect();});
}
