import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {baseStyle} from '../creator/map-style-library.js';
import {defaultBasemap,documentaryFlags} from '../creator/documentary-map.js';
import {compileAnimation,animationBrief} from '../creator/map-animation-import.js';
import {emptyMap,lightingFrame,mapFrame} from '../creator/history-model.js';
const plan=()=>({format:'invincible-map-animation',version:1,duration:5,aspectRatio:'9:16',camera:[{time:0,center:[82,24],zoom:3,pitch:0,bearing:0}],layers:[]});
test('new instructions use the established house style without changing saved maps',()=>{
 const p=plan(),before=structuredClone(p),r=compileAnimation({scenes:[]},p);
 assert.deepEqual(mapFrame({scenes:[]},{...emptyMap(),basemap:defaultBasemap()},0).camera,{center:[82.3,23.5],zoom:2.85,bearing:0,pitch:0});assert.deepEqual(p,before);assert.deepEqual(r.project.historicalMap.basemap,defaultBasemap());
 assert.equal(lightingFrame(r.project,r.project.historicalMap,0).intensity,.1);
 const existing={scenes:[{id:'s',duration:2}],historicalMap:{...emptyMap(),basemap:{id:'terrain',labels:false,borders:false}}};
 assert.equal(compileAnimation(existing,p).project.historicalMap.basemap.id,'terrain');
 assert.equal(compileAnimation({scenes:[]},{...p,basemap:'physical'}).project.historicalMap.basemap.id,'physical');
 assert.match(animationBrief(),/basemap:"documentary"/);assert.match(animationBrief(),/unless explicitly requested/);
});
test('default reference imagery, persistent overlays and borders retain source semantics',async t=>{
 const data=JSON.parse(fs.readFileSync(new URL('../creator/history-data/documentary-borders.geojson',import.meta.url)));
 t.mock.method(globalThis,'fetch',async url=>{assert.match(String(url),/documentary-borders.geojson$/);return {ok:true,json:async()=>structuredClone(data)};});
 const style=await baseStyle({basemap:defaultBasemap()});
 assert.match(style.sources['library-imagery'].tiles[0],/BlueMarble/);
 assert.equal(style.layers.find(l=>l.id==='library-imagery').paint['raster-saturation'],.3);
 const flags=style.layers.filter(l=>l.id.startsWith('reference-')&&l.type==='raster');assert.equal(flags.length,4);
 for(const l of flags){assert.equal(l.layout?.visibility,undefined);assert.equal(l.paint['raster-fade-duration'],0);assert.ok(l.paint['raster-opacity']>0);}
 for(const flag of documentaryFlags)assert.ok(fs.existsSync(new URL('../creator/history-data/border-flags-v3/'+flag.file,import.meta.url)));
 assert.ok(data.features.some(f=>f.properties.semantic==='loc'));assert.ok(data.features.some(f=>f.properties.semantic==='lac'));assert.ok(data.features.some(f=>f.properties.semantic==='claim'));
 for(const f of data.features){assert.ok(f.properties.source.url);assert.ok(f.properties.source.note);}
 const hidden=await baseStyle({basemap:{...defaultBasemap(),borders:false}});assert.equal(hidden.layers.some(l=>l.id.startsWith('reference-border-')),false);
});
test('Siliguri animates only the map and geographic labels',()=>{
 const p=JSON.parse(fs.readFileSync(new URL('../creator/imports/siliguri-corridor-portrait.animation.json',import.meta.url)));
 const r=compileAnimation({scenes:[]},p,{geometryReviewed:true});assert.equal(r.summary.duration,70.478375);assert.equal(p.basemap,'documentary');assert.ok(p.layers.every(l=>['label','route','boundary'].includes(l.type)));assert.equal(p.assets,undefined);assert.ok(p.camera.every(c=>c.pitch===0));
});

test('regional connections span the source-mapped western and Northeast endpoints',()=>{
 const p=JSON.parse(fs.readFileSync(new URL('../creator/imports/siliguri-corridor-portrait.animation.json',import.meta.url)));
 const data=JSON.parse(fs.readFileSync(new URL('../creator/history-data/regional-transport-connections.geojson',import.meta.url)));
 const result=compileAnimation({scenes:[]},p,{geometryReviewed:true});assert.equal(data.features.length,2);
 for(const f of data.features){const xs=f.geometry.coordinates.map(c=>c[0]);assert.ok(Math.min(...xs)<87.6);assert.ok(Math.max(...xs)>91.7);assert.match(f.properties.source.url,/naturalearthdata.com/);}
 const arrows=p.layers.filter(l=>l.id.startsWith('width-arrow-'));assert.equal(arrows.length,2);assert.deepEqual(arrows[0].coordinates,[...arrows[1].coordinates].reverse());
 const locator=result.project.historicalMap.visual.layers.find(l=>l.name.includes('TRI-JUNCTION'));assert.equal(locator.marker,true);assert.deepEqual(locator.labelOffset,[0,110]);
 const china=JSON.parse(fs.readFileSync(new URL('../creator/history-data/china-country-tint.geojson',import.meta.url)));const cs=china.features[0].geometry.coordinates.flat(Infinity);assert.ok(cs.some(x=>x>130));assert.ok(cs.some(x=>x>50&&x<54));
});
