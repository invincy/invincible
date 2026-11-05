export function exportDimensions(ratio='16:9',resolution='1080p'){
 if(!['16:9','9:16'].includes(ratio)||!['720p','1080p','4k'].includes(resolution))throw Error('Choose landscape/portrait and 720p, 1080p or 4K.');
 const size={ '720p':[1280,720],'1080p':[1920,1080],'4k':[3840,2160]}[resolution];
 return ratio==='9:16'?{width:size[1],height:size[0]}:{width:size[0],height:size[1]};
}
export async function encodeMapVideo({canvas,duration,fps=30,drawFrame,onProgress=()=>{},signal}){
 if(!globalThis.VideoEncoder)throw Error('Silent MP4 rendering needs WebCodecs in a current Chrome or Edge browser. WebM recording remains available.');
 if(!Number.isFinite(duration)||duration<=0||duration>600||fps!==30)throw Error('MP4 rendering supports 30 fps and up to 10 minutes.');
 const {Output,Mp4OutputFormat,BufferTarget,CanvasSource,canEncodeVideo}=await import('./vendor/map-video.mjs');
 const bitrate=canvas.width*canvas.height*fps*0.18;
 if(!await canEncodeVideo('avc',{width:canvas.width,height:canvas.height,bitrate}))throw Error('This browser cannot encode H.264 at this resolution. Choose a lower resolution or use WebM.');
 const output=new Output({format:new Mp4OutputFormat({fastStart:'in-memory'}),target:new BufferTarget()});
 const source=new CanvasSource(canvas,{codec:'avc',bitrate});output.addVideoTrack(source,{frameRate:fps});
 const frames=Math.ceil(duration*fps);
 try{
  await output.start();
  for(let frame=0;frame<frames;frame++){
   signal?.throwIfAborted();await drawFrame(frame/fps);signal?.throwIfAborted();
   await source.add(frame/fps,1/fps,{keyFrame:frame%60===0});onProgress({frame:frame+1,frames,progress:(frame+1)/frames});
  }
  source.close();await output.finalize();return new Blob([output.target.buffer],{type:'video/mp4'});
 }catch(error){await output.cancel();throw error;}
}
