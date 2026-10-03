import assert from 'node:assert/strict';
import test from 'node:test';
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
