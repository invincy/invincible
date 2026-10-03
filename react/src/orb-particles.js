// Short, closely sampled filaments keep fading tails continuous without filling the globe with ribbons.
export function orbParticleTier(mobile,lightweight){
 if(mobile&&lightweight)return {streams:64,trailCount:100,wideStreams:8,cellStreams:8,flecks:1000};
 if(mobile||lightweight)return {streams:68,trailCount:128,wideStreams:10,cellStreams:10,flecks:1200};
 return {streams:96,trailCount:128,wideStreams:12,cellStreams:12,flecks:1600};
}
export function createOrbParticles(tier){
 const {streams,trailCount,wideStreams,cellStreams,flecks}=tier,wideTrailCount=224,cellTrailCount=240;
 const count=streams*trailCount+wideStreams*wideTrailCount+cellStreams*cellTrailCount+flecks;
 const particles=new Float32Array(count*5);let offset=0;
 const trail=(phase,lane,speed,length,alpha)=>{
  let distance=0;
  for(let point=0;point<length;point++){
   const tail=point/(length-1),size=3.4*(1-.55*tail),opacity=alpha*Math.pow(1-tail,1.35);
   // Sampling shrinks with the point radius: longer heads, tightly connected fading tails.
   particles.set([phase-distance,lane,speed,size,opacity],offset);offset+=5;distance+=.001*(1-.55*tail);
  }
 };
 for(let stream=0;stream<streams;stream++)trail((stream*.61803398875)%1,(stream+.5)/streams,.065+.02*(.5+.5*Math.sin(stream*1.71)),trailCount,.86);
 for(let stream=0;stream<wideStreams;stream++)trail((stream*.754877666)%1,(stream+.5)/wideStreams+2,.062+.018*(.5+.5*Math.sin(stream*2.13)),wideTrailCount,.78);
 for(let stream=0;stream<cellStreams;stream++)trail((stream*.569840291)%1,(stream+.5)/cellStreams+4,.064+.016*(.5+.5*Math.sin(stream*1.93)),cellTrailCount,.78);
 for(let dot=0;dot<flecks;dot++){
  particles.set([(dot*.61803398875)%1,((dot+.5)*.754877666)%1,.064+.018*((dot*.41421356)%1),dot%11===0?3.4:2.8,.45+.30*Math.sin(dot*7.13)**2],offset);offset+=5;
 }
 return particles;
}
