import test from 'node:test';import assert from 'node:assert/strict';
import {compileAnimation} from '../creator/map-animation-import.js';
import {scenePackage,appendScenePackage} from '../creator/map-editor-model.js';
import {validateMap} from '../creator/history-model.js';
import {drawLocationMarker} from '../creator/map-markers.js';
const plan=()=>({format:'invincible-map-animation',version:1,duration:3,layers:[{id:'city',type:'label',name:'City',position:[77,29],start:0,end:3,markerStyle:'city'}]});
test('marker selection survives animation import and scene packaging without moving its location',()=>{const p=compileAnimation({scenes:[]},plan()).project,l=p.historicalMap.visual.layers.find(l=>l.name==='City');assert.equal(l.markerStyle,'city');assert.deepEqual(l.position,[77,29]);const next=appendScenePackage({scenes:[]},scenePackage(p,p.historicalMap,p.scenes[0].id));assert.equal(next.historicalMap.visual.layers.find(l=>l.name==='City').markerStyle,'city');validateMap(next.historicalMap,next);});
test('invalid marker choices are rejected before import mutation',()=>{const p={scenes:[]},input=plan();input.layers[0].markerStyle='crown';assert.throws(()=>compileAnimation(p,input),/location marker/);assert.deepEqual(p,{scenes:[]});});
test('legacy dot markers leave the existing compositor in charge',()=>{const ctx=new Proxy({},{get(){throw Error('Legacy marker must not touch the canvas');}});assert.equal(drawLocationMarker(ctx,{style:undefined}),false);assert.equal(drawLocationMarker(ctx,{style:'dot'}),false);});
