// Short, closely sampled filaments keep fading tails continuous without filling the globe with ribbons.
export function orbParticleTier(mobile,lightweight,rich=false,fine=false){
 let tier;
 if(mobile&&lightweight)tier={streams:64,trailCount:100,wideStreams:8,cellStreams:8,flecks:1000};
 else if(mobile||lightweight)tier={streams:68,trailCount:128,wideStreams:10,cellStreams:10,flecks:1200};
 else tier={streams:96,trailCount:128,wideStreams:12,cellStreams:12,flecks:1600};
 if(rich){
  const scale=lightweight?1.8:mobile?2:2.3;
  tier.streams=Math.round(tier.streams*scale);
  tier.wideStreams=Math.round(tier.wideStreams*(lightweight?1.15:1.5));
  tier.cellStreams=Math.round(tier.cellStreams*(lightweight?1.15:1.5));
  tier.flecks=Math.round(tier.flecks*(lightweight?3:mobile?4:5));
 }
 if(fine){
  tier.flecks+=lightweight?6000:mobile?11000:17000;
  tier.pointSize=.52;
  tier.brightFlecks=true;
  tier.totalPoints=lightweight?66000:mobile?114000:174000;
 }
 return tier;
}
function appendFineParticles(particles,offset){
 const extraCount=particles.length/5-offset;
 for(let index=0;index<extraCount;index++){
  const jitter=Math.imul(index^(index>>>7),0x45d9f3b)>>>0;
  const lane=((index+.5)*.754877666+(jitter&255)/24000)%1;
  const longitude=2*Math.PI*(((index+.5)*.61803398875+((jitter>>>16)&255)/24000)%1);
  const latitude=Math.asin(lane*2-1);
  const radius=.99+.12*((index+.5)*.414213562%1);
  const radial=radius*Math.cos(latitude);
  const group=index%4;
  const variation=(index+.5)*.569840291%1;
  const size=(group===0?1.85:group===1?2.48:1.15)+.33*variation;
  // Negative opacity selects the inexpensive vertex path for added points.
  const opacity=-(.16+.16*((index+.5)*.857726%1))*(group<2?1.24:1);
  particles.set([radial*Math.cos(longitude),radius*Math.sin(latitude),radial*Math.sin(longitude),size,opacity],(offset+index)*5);
 }
}

export function createOrbParticles(tier){
 const {streams,trailCount,wideStreams,cellStreams,flecks,pointSize=1,brightFlecks=false,totalPoints=0,highlightTrails=false}=tier,wideTrailCount=224,cellTrailCount=240;
 const count=streams*trailCount+wideStreams*wideTrailCount+cellStreams*cellTrailCount+flecks;
 const particles=new Float32Array(Math.max(count,totalPoints)*5);let offset=0;
 const trail=(phase,lane,speed,length,alpha)=>{
  let distance=0;
  for(let point=0;point<length;point++){
   const tail=point/(length-1),size=3.4*(1-.55*tail);
   const baseOpacity=alpha*Math.pow(1-tail,1.35)*(brightFlecks ? .75 : 1);
   const opacity=highlightTrails?Math.min(.75,baseOpacity*(1+.32*(1-tail)**2)):baseOpacity;
   // Sampling shrinks with the point radius: longer heads, tightly connected fading tails.
   particles.set([phase-distance,lane,speed,size*pointSize,opacity],offset);offset+=5;distance+=.001*(1-.55*tail);
  }
 };
 for(let stream=0;stream<streams;stream++)trail((stream*.61803398875)%1,(stream+.5)/streams,.065+.02*(.5+.5*Math.sin(stream*1.71)),trailCount,.86);
 for(let stream=0;stream<wideStreams;stream++)trail((stream*.754877666)%1,(stream+.5)/wideStreams+2,.062+.018*(.5+.5*Math.sin(stream*2.13)),wideTrailCount,.78);
 for(let stream=0;stream<cellStreams;stream++)trail((stream*.569840291)%1,(stream+.5)/cellStreams+4,.064+.016*(.5+.5*Math.sin(stream*1.93)),cellTrailCount,.78);
 for(let dot=0;dot<flecks;dot++){
  const shimmer=Math.sin(dot*7.13)**2;
  const opacity=brightFlecks ? .77+.20*shimmer : .45+.30*shimmer;
  particles.set([(dot*.61803398875)%1,((dot+.5)*.754877666)%1,.064+.018*((dot*.41421356)%1),(dot%11===0?3.4:2.8)*pointSize,opacity],offset);offset+=5;
 }
 appendFineParticles(particles,count);
 return particles;
}
