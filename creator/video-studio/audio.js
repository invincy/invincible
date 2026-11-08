export async function decodeVoiceover(file){
 if(!file||file.size>100*1024*1024)throw Error('Choose an MP3 or WAV up to 100 MB.');
 const context=new AudioContext();
 try{const buffer=await context.decodeAudioData(await file.arrayBuffer());if(buffer.duration>600)throw Error('Voiceover must be at most ten minutes.');return buffer;}finally{await context.close();}
}
// Chunking bounds extra memory and preserves all original samples, with leading silence.
export function audioChunk(buffer,startSeconds,gain,at,length,rate=48000){
 const channels=Math.min(2,buffer.numberOfChannels),data=new Float32Array(length*channels);
 for(let c=0;c<channels;c++){const source=buffer.getChannelData(c);for(let n=0;n<length;n++){const pos=((at+n)/rate-startSeconds)*buffer.sampleRate;if(pos<0||pos>=source.length)continue;const i=Math.floor(pos),f=pos-i;data[c*length+n]=(source[i]+((source[i+1]??source[i])-source[i])*f)*gain;}}
 return {data,channels};
}
