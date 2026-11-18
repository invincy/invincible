import test from 'node:test';
import assert from 'node:assert/strict';
import {tintPixelBuffer} from '../creator/image-tint.js';
test('image tint preserves alpha, source pixels, black/white detail and colour separation',()=>{
 const source=new Uint8ClampedArray([120,70,20,0,160,110,70,64,160,110,70,128,160,110,70,255,0,0,0,255,255,255,255,255]),copy=source.slice();
 const green=tintPixelBuffer(source,'#36AD78'),orange=tintPixelBuffer(source,'#E58A42');
 assert.deepEqual(source,copy);for(let i=3;i<source.length;i+=4){assert.equal(green[i],source[i]);assert.equal(orange[i],source[i]);}
 assert.deepEqual(green.slice(0,4),source.slice(0,4));assert.deepEqual(green.slice(-8),source.slice(-8));
 assert.ok(green[5]>green[4]);assert.ok(orange[4]>orange[5]);assert.notDeepEqual(green,orange);
});
test('legacy artwork without a tint, or with white, remains unchanged',()=>{
 const source=new Uint8ClampedArray([37,91,146,77]);for(const color of [undefined,'#FFFFFF','#ffffff','invalid'])assert.deepEqual(tintPixelBuffer(source,color),source);
});

import {validateLayer} from '../creator/video-studio/model.js';
test('image tint is explicit, validated and independent of legacy image colour',()=>{
 const layer={id:'unit',type:'image',assetId:'unit',color:'#aabbcc',tintColor:'#39B982'};const assets=new Set(['unit']);validateLayer(layer,2,assets);assert.throws(()=>validateLayer({...layer,tintColor:'red'},2,assets),/Colors/);assert.throws(()=>validateLayer({...layer,type:'rectangle'},2,assets),/only available/);
});
