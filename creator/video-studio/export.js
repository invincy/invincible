import {audioChunk,mixAudioChunk} from './audio.js?v=2026111014';
// Dedicated audio-inclusive path; the existing Map Editor exporter stays unchanged.
export async function encodeStudioVideo({canvas,timeline,drawFrame,audioBuffer,audioTracks=[],audioGain=1,onProgress=()=>{},onAudioCodec=()=>{},signal}){
 if(!globalThis.VideoEncoder)throw Error('MP4 export needs WebCodecs in current Chrome or Edge.');
 if(!Number.isFinite(timeline.duration)||timeline.duration<=0||timeline.duration>600)throw Error('Use a video from one frame to ten minutes.');
 const {Output,Mp4OutputFormat,BufferTarget,CanvasSource,AudioSampleSource,AudioSample,canEncodeVideo,canEncodeAudio}=await import('../vendor/studio-video.mjs');
 const bitrate=canvas.width*canvas.height*30*.18;
 if(!await canEncodeVideo('avc',{width:canvas.width,height:canvas.height,bitrate}))throw Error('H.264 encoding is unavailable at 1080p in this browser. Try current Chrome or Edge.');
 let audioCodec=null;
 const hasAudio=!!audioBuffer||audioTracks.length>0;
 if(hasAudio){
  if(!globalThis.AudioEncoder)throw Error('Audio encoding is unavailable. Use current Chrome or Edge; audio will not be discarded.');
  const config={sampleRate:48000,numberOfChannels:audioBuffer?Math.min(2,audioBuffer.numberOfChannels):Math.max(1,...audioTracks.map(t=>t.buffer.numberOfChannels)),bitrate:128000};
  for(const codec of ['aac','opus'])if(await canEncodeAudio(codec,config)){audioCodec=codec;break;}
  if(!audioCodec)throw Error('AAC and Opus audio encoders are unavailable. Use current Chrome or Edge; audio will not be discarded.');
  onAudioCodec(audioCodec);
 }
 const output=new Output({format:new Mp4OutputFormat({fastStart:'in-memory'}),target:new BufferTarget()});
 const video=new CanvasSource(canvas,{codec:'avc',bitrate});output.addVideoTrack(video,{frameRate:30});
 const audio=hasAudio?new AudioSampleSource({codec:audioCodec,bitrate:128000}):null;if(audio)output.addAudioTrack(audio);
 const frames=Math.round(timeline.duration*30);let audioAt=0;const rate=48000,samples=Math.ceil(timeline.duration*rate);
 try{
  signal?.throwIfAborted();await output.start();
  for(let frame=0;frame<frames;frame++){
   signal?.throwIfAborted();await drawFrame(frame/30,signal);signal?.throwIfAborted();await video.add(frame/30,1/30,{keyFrame:frame%60===0});
   // Interleave audio and video so encoded queues stay bounded during long renders.
   while(audio&&audioAt<Math.min(samples,Math.ceil((frame+1)/30*rate))){
    const length=Math.min(1024,samples-audioAt),{data,channels}=audioBuffer?audioChunk(audioBuffer,timeline.audioStart,audioGain,audioAt,length,rate):mixAudioChunk(audioTracks,audioAt,length,rate);
    const sample=new AudioSample({format:'f32-planar',sampleRate:rate,numberOfChannels:channels,data,timestamp:audioAt/rate});
    try{await audio.add(sample);}finally{sample.close();}audioAt+=length;signal?.throwIfAborted();
   }
   onProgress({frame:frame+1,frames,progress:(frame+1)/frames});
  }
  video.close();audio?.close();await output.finalize();return new Blob([output.target.buffer],{type:'video/mp4'});
 }catch(error){await output.cancel();throw error;}
}
