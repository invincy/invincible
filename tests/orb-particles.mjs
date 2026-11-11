import assert from 'node:assert/strict';
import test from 'node:test';
import {dashboardStartupMotion} from '../react/src/startup-motion.mjs';
import {createOrbParticles,orbParticleTier} from '../react/src/orb-particles.js';
test('orb uses bounded desktop, mobile and low-capability particle budgets',()=>{
 for(const [mobile,lightweight,count]of[[false,false,19456],[true,false,14544],[false,true,14544],[true,true,11112]]){
  const particles=createOrbParticles(orbParticleTier(mobile,lightweight));assert.equal(particles.length/5,count);assert.ok(particles.every(Number.isFinite));assert.equal(particles.byteLength,count*20);
 }
});
test('all trail families taper size and alpha, with no oversized cell heads or widely spaced tails',()=>{
 const tier=orbParticleTier(false,false),particles=createOrbParticles(tier);let offset=0;
 for(const [streams,length]of[[tier.streams,tier.trailCount],[tier.wideStreams,224],[tier.cellStreams,240]])for(let stream=0;stream<streams;stream++){
  const start=offset,head=particles[start+3];assert.ok(head<=3.401);
  for(let point=1;point<length;point++){
   offset+=5;assert.ok(particles[offset+3]<particles[offset-2]);assert.ok(particles[offset+4]<=particles[offset-1]);
   assert.ok(Math.abs(particles[offset]-particles[offset-5])<=.00101);
  }
  assert.ok(Math.abs(particles[offset+3]/head-.45)<.001);assert.equal(particles[offset+4],0);offset+=5;
 }
});

test('rich dashboard orb increases density with bounded mobile and low capability tiers',()=>{
 for(const [mobile,lightweight,limit]of[[false,false,50000],[true,false,35000],[false,true,26000],[true,true,21000]]){
  const base=orbParticleTier(mobile,lightweight),rich=orbParticleTier(mobile,lightweight,true);
  const count=createOrbParticles(rich).length/5;
  assert.ok(rich.streams>base.streams);assert.ok(rich.flecks>=base.flecks*3);
  assert.ok(count<limit);assert.ok(count>createOrbParticles(base).length/5);
 }
});

test('dashboard density retains every original particle and adds finer points within device budgets',()=>{
 for(const [mobile,lightweight,count] of [[false,false,130500],[true,false,85500],[false,true,49500],[true,true,49500]]){
  const tier=orbParticleTier(mobile,lightweight,true,true);
  const original=createOrbParticles({...tier,totalPoints:0});
  const particles=createOrbParticles(tier);
  assert.equal(particles.length,count*5);
  assert.deepEqual(particles.subarray(0,original.length),original);
  assert.ok(particles.every(Number.isFinite));
  const extraCount=(particles.length-original.length)/5;
  let largeCount=0,largestCount=0;
  for(let index=original.length;index<particles.length;index+=5){
   const size=particles[index+3];
   if(size>=2.4){assert.ok(size>=2.47&&size<2.82);largestCount++;}
   else if(size>=1.75){assert.ok(size>=1.84&&size<2.2);largeCount++;}
   else assert.ok(size>=1.14&&size<1.5);
   assert.ok(particles[index+4]<0);
  }
  assert.equal(largeCount,Math.ceil(extraCount/4));
  assert.equal(largestCount,Math.floor((extraCount+2)/4));
 }
});

test('the whole globe keeps turning beyond two seconds as startup momentum decays',()=>{
 const speed=seconds=>(dashboardStartupMotion(seconds+.01).turn-dashboardStartupMotion(seconds).turn)/.01;
 assert.ok(speed(0)>speed(1));
 assert.ok(speed(1)>speed(2));
 assert.ok(speed(2)>.2);
 assert.ok(speed(5)<.01);
});

test('gold highlights brighten trail heads and leave positions, sizes and fine dots intact',()=>{
 const tier=orbParticleTier(false,false,true,true);
 const original=createOrbParticles(tier);
 const highlighted=createOrbParticles({...tier,highlightTrails:true});
 const trailPoints=tier.streams*tier.trailCount+tier.wideStreams*224+tier.cellStreams*240;
 assert.ok(highlighted[4]>original[4]);
 assert.equal(highlighted.length,original.length);
 for(let index=0;index<trailPoints*5;index+=5){
  for(let field=0;field<4;field++)assert.equal(highlighted[index+field],original[index+field]);
  assert.ok(highlighted[index+4]>=original[index+4]);
 }
 assert.deepEqual(highlighted.subarray(trailPoints*5),original.subarray(trailPoints*5));
});
