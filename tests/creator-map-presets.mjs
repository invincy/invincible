import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyMap,validateMap,mapFrame,timeOf} from '../creator/history-model.js';
import {applyPreset,resolvedOverlays,overlayFrame,fitIndia,initialCamera} from '../creator/map-presets.js';
import {compileAnimation} from '../creator/map-animation-import.js';
import {scenePackage,appendScenePackage,visualMap} from '../creator/map-editor-model.js';
import {createGeographicOverlays} from '../creator/map-geographic-overlays.js';
const project={scenes:[{id:'s',duration:10}]};
test('new India presets resolve opacity, imagery, terrain and separate geographic anchor',()=>{
 for(const [id,opacity,style] of [['india-satellite',.85,'satellite'],['india-political',.85,'physical'],['india-topographic',.25,'terrain']]){const m=validateMap(applyPreset(emptyMap(),id),project);assert.equal(resolvedOverlays(m).countryFill.opacity,opacity);assert.equal(m.basemap.id,style);assert.deepEqual([resolvedOverlays(m).ashokaChakra.longitude,resolvedOverlays(m).ashokaChakra.latitude],[78.5,23.5]);const c=fitIndia(mapFrame(project,m,0).camera,360,640);assert.notDeepEqual(c.center,[78.5,23.5]);assert.equal(c.bearing,0);assert.equal(c.pitch,0);assert.equal(initialCamera(m).aspectRatio,'9:16');}
});
test('Mercator fit contains every bounds corner at both aspect ratios',()=>{
 const y=lat=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2;
 for(const [w,h] of [[360,640],[640,360],[1080,1920]]){const c=fitIndia(initialCamera({}),w,h),scale=512*2**c.zoom;for(const [lng,lat] of [[68,6.5],[97.5,37.5],[97.5,6.5],[68,37.5]]){assert.ok(Math.abs((lng-c.center[0])/360*scale)<w/2);assert.ok(Math.abs((y(lat)-y(c.center[1]))*scale)<h/2);}}
});
test('explicit JSON values win and old sessions are unchanged after validation',()=>{
 const legacy=emptyMap(),before=JSON.stringify(legacy);assert.deepEqual(validateMap(legacy,project),legacy);assert.equal(JSON.stringify(legacy),before);
 const m=validateMap({...emptyMap(),mapPreset:'india-satellite',overlays:{countryFill:{opacity:.6}},initialCamera:{center:[77,22],zoom:5,bearing:15,pitch:20,aspectRatio:'16:9'}},project);assert.equal(resolvedOverlays(m).countryFill.opacity,.6);assert.equal(resolvedOverlays(m).countryBorders.width,2);assert.equal(fitIndia(mapFrame(project,m,0).camera,360,640).zoom,5);assert.deepEqual(mapFrame(project,m,0).camera.center,[77,22]);assert.deepEqual(validateMap(JSON.parse(JSON.stringify(m)),project),m);
});
test('opacity and color keys scrub deterministically and independent states reveal smoothly',()=>{
 const m=applyPreset(emptyMap(),'india-satellite');m.overlayKeys=[{sceneId:'s',offset:0,easing:'linear',overlays:{countryFill:{opacity:.2,color:'#000000'}}},{sceneId:'s',offset:10,overlays:{countryFill:{opacity:.85,color:'#ffffff'},countries:{IND:{opacity:1}},states:{'IN-GJ':{opacity:.8}}}}];validateMap(m,project);const f=overlayFrame(project,m,5,timeOf);assert.ok(Math.abs(f.countryFill.opacity-.525)<1e-12);assert.equal(f.countryFill.color,'#808080');assert.equal(f.states['IN-GJ'].opacity,.4);assert.equal(overlayFrame(project,m,10,timeOf).countryFill.opacity,.85);assert.deepEqual(overlayFrame(project,m,5,timeOf),f);assert.equal(overlayFrame(project,m,0,timeOf).countryFill.opacity,.2);
});
test('invalid appearance and key timing reject without mutation',()=>{
 const m=applyPreset(emptyMap(),'india-satellite');for(const change of [x=>x.overlays.countryFill.opacity=1.1,x=>x.overlays.countryBorders.width=-1,x=>x.mapPreset='unknown',x=>x.overlays.states={'IN-GJ':{color:'red'}},x=>x.overlayKeys=[{sceneId:'bad',offset:0,overlays:{}}],x=>x.overlays.wrong={},x=>x.overlays.countries=JSON.parse('{"__proto__":{"opacity":1}}')]){const bad=structuredClone(m);change(bad);assert.throws(()=>validateMap(bad,project));}assert.equal(m.overlays.countryFill.opacity,.85);
});
test('animation presets default portrait, accept overrides and preserve destination styling',()=>{
 const plan={format:'invincible-map-animation',version:1,duration:10,mapPreset:'india-satellite',overlays:{countryFill:{opacity:.6}},layers:[],overlayKeys:[{time:0,easing:'linear',overlays:{countryFill:{opacity:.2}}},{time:10,overlays:{countryFill:{opacity:.85}}}]};
 const {project:p}=compileAnimation({scenes:[]},plan);assert.equal(p.aspectRatio,'9:16');assert.equal(p.historicalMap.camera.length,0);assert.equal(resolvedOverlays(p.historicalMap).countryFill.opacity,.6);assert.ok(Math.abs(overlayFrame(p,p.historicalMap,5,timeOf).countryFill.opacity-.525)<1e-12);
 const old={...project,historicalMap:emptyMap()},appended=compileAnimation(old,plan).project;assert.equal(appended.historicalMap.mapPreset,undefined);assert.deepEqual(appended.historicalMap.basemap,undefined);assert.deepEqual(old.historicalMap,emptyMap());
});
test('scene packages retain overlay timing with fresh scene IDs',()=>{
 const m=visualMap(applyPreset(emptyMap(),'india-topographic'));m.overlayKeys=[{sceneId:'s',offset:2,overlays:{countryFill:{opacity:.6}}}];const pkg=scenePackage(project,m,'s'),p=appendScenePackage({scenes:[]},pkg);assert.equal(p.historicalMap.overlayKeys[0].sceneId,p.scenes[0].id);validateMap(p.historicalMap,p);
});
test('native overlay renderer keeps fill, borders, state reveal and labels separate',()=>{
 const layers=new Map(),sources=new Map();const map={removeLayer:id=>layers.delete(id),getLayer:id=>layers.get(id),getSource:id=>sources.get(id),removeSource:id=>sources.delete(id),addSource:(id,v)=>sources.set(id,v),getStyle:()=>({layers:[{id:'territory',type:'fill'}]}),addLayer:l=>layers.set(l.id,l),setPaintProperty:(id,k,v)=>layers.get(id).paint[k]=v};
 const renderer=createGeographicOverlays(map),m=applyPreset(emptyMap(),'india-political');renderer.setSpec(m);renderer.frame(0);assert.equal(layers.get('appearance-fill').paint['fill-opacity'],.85);assert.ok(Array.isArray(layers.get('appearance-fill').paint['fill-color']));assert.equal(layers.get('appearance-border').paint['line-opacity'],1);assert.equal(layers.get('appearance-state-border').paint['line-opacity'],0);m.overlays.countryFill.opacity=.6;renderer.setSpec(m);renderer.frame(0);assert.equal(layers.get('appearance-fill').paint['fill-opacity'],.6);renderer.destroy();assert.equal(layers.size,0);assert.equal(sources.size,0);
});
