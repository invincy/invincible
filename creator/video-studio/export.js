import {audioChunk,mixAudioChunk} from './audio.js?v=2026111014';
export async function checkStudioEncoding({width,height,channels=0}){
 if(!globalThis.VideoEncoder)throw Error('MP4 export needs WebCodecs in current Chrome or Edge.');
 const {canEncodeVideo,canEncodeAudio}=await import('../vendor/studio-video.mjs');
 const bitrate=width*height*30*.18;
 if(!await canEncodeVideo('avc',{width,height,bitrate}))throw Error('H.264 export at 1080p is unavailable in this browser.');
 if(!channels)return {bitrate,audioCodec:null};
 if(!globalThis.AudioEncoder)throw Error('MP4 audio encoding is unavailable. Use current Chrome or Edge.');
 const config={sampleRate:48000,numberOfChannels:channels,bitrate:128000};
 for(const codec of ['aac','opus'])if(await canEncodeAudio(codec,config))return {bitrate,audioCodec:codec};
 throw Error('AAC and Opus audio encoders are unavailable. Use current Chrome or Edge.');
}
// Dedicated audio-inclusive path; the existing Map Editor exporter stays unchanged.
export async function encodeStudioVideo({canvas,timeline,drawFrame,audioBuffer,audioTracks=[],audioGain=1,onProgress=()=>{},onAudioCodec=()=>{},signal}){
 if(!Number.isFinite(timeline.duration)||timeline.duration<=0||timeline.duration>600)throw Error('Use a video from one frame to ten minutes.');
 const channels=audioBuffer?Math.min(2,audioBuffer.numberOfChannels):Math.max(0,...audioTracks.map(t=>t.buffer.numberOfChannels));
 const {bitrate,audioCodec}=await checkStudioEncoding({width:canvas.width,height:canvas.height,channels});
 const {Output,Mp4OutputFormat,BufferTarget,CanvasSource,AudioSampleSource,AudioSample}=await import('../vendor/studio-video.mjs');
 if(audioCodec)onAudioCodec(audioCodec);
 const output=new Output({format:new Mp4OutputFormat({fastStart:'in-memory'}),target:new BufferTarget()});
 const video=new CanvasSource(canvas,{codec:'avc',bitrate});output.addVideoTrack(video,{frameRate:30});
 const audio=audioCodec?new AudioSampleSource({codec:audioCodec,bitrate:128000}):null;if(audio)output.addAudioTrack(audio);
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
