import test from 'node:test';
import assert from 'node:assert/strict';
import {readAnimation,compileAnimation,animationBrief} from '../creator/map-animation-import.js';
import {emptyMap,mapFrame,lightingFrame} from '../creator/history-model.js';
import {layerAlpha} from '../creator/map-editor-model.js';
import {scenePackage,appendScenePackage} from '../creator/map-editor-model.js';
import {baseStyle,defaultTerrain} from '../creator/map-style-library.js';
import {exportDimensions} from '../creator/map-video-export.js';
const plan=()=>({format:'invincible-map-animation',version:1,title:'Synthetic animation fixture',duration:167.7,aspectRatio:'16:9',basemap:'physical',terrain:false,camera:[{time:0,center:[72,23],zoom:4,pitch:30,bearing:0},{time:5,center:[75,34],zoom:5,pitch:40,bearing:0}],lighting:[{time:0,direction:350,intensity:0.2},{time:5,direction:10,intensity:0.6}],layers:[{id:'line',type:'route',name:'Illustrative line, not a road or boundary',start:0,end:7,coordinates:[[72,23],[75,34]],color:'#ffd05e',dash:[2,3],arrowhead:false,revealDuration:5}]});
test('named custom assets reuse existing private references and are included safely in the ChatGPT brief',()=>{
 const m=emptyMap(),asset={id:'saved-bsf',name:'BSF',type:'image',storageProjectId:'project',storagePath:'creatorProjects/project/mapAssets/saved-bsf',credit:'User supplied'};m.visual={version:1,assets:[asset],layers:[]};
 const project={scenes:[{id:'old',duration:2}],historicalMap:m},before=structuredClone(project),p=plan();p.assets=[{id:'art',libraryName:' bsf '}];p.layers=[{id:'badge',type:'image',name:'Custom BSF',start:0,end:7,assetId:'art',corners:[[72,24],[73,24],[73,23],[72,23]],position:[72.5,23.5]}];
 const r=compileAnimation(project,p);assert.deepEqual(project,before);assert.deepEqual(r.project.historicalMap.visual.assets,[asset]);assert.equal(r.project.historicalMap.visual.layers[0].assetId,'saved-bsf');assert.equal(r.project.historicalMap.visual.layers[0].kind,'image');
 const brief=animationBrief([asset]);assert.match(brief,/libraryName/);assert.match(brief,/"name":"BSF"/);assert.equal(brief.includes('storagePath'),false);assert.equal(brief.includes('User supplied'),false);
 p.assets=[{id:'art',libraryId:'saved-bsf'}];assert.equal(compileAnimation(project,p).project.historicalMap.visual.layers[0].assetId,'saved-bsf');
});
test('missing, ambiguous, mixed and mismatched asset references reject the whole import',()=>{
 const m=emptyMap(),a={id:'a',name:'BSF',type:'image',url:'https://example.org/a.png'};m.visual={version:1,assets:[a,{...a,id:'b',name:'bsf',url:'https://example.org/b.png'}],layers:[]};const project={scenes:[],historicalMap:m},before=JSON.stringify(project),p=plan();
 for(const ref of [{id:'art',libraryName:'missing'},{id:'art',libraryName:'BSF'},{id:'art',libraryId:'missing'},{id:'art',libraryName:'BSF',url:'https://example.org/a.png'},{id:'art',libraryName:'BSF',libraryId:'a'}]){p.assets=[ref];assert.throws(()=>compileAnimation(project,p),/Missing library|More than one|Library references/);assert.equal(JSON.stringify(project),before);}
 p.assets=[{id:'art',libraryId:'a'}];p.layers=[{id:'wrong',type:'glb',start:0,end:7,assetId:'art',position:[72,23]}];assert.throws(()=>compileAnimation(project,p),/matching asset/);assert.equal(JSON.stringify(project),before);
});
test('instruction import appends precise canonical timing without altering original scenes or metadata',()=>{
 const original={id:'saved',custom:{keep:true},scenes:[{id:'old',duration:8,voiceover:'Original'}],historicalMap:emptyMap()},before=structuredClone(original);
 const result=compileAnimation(original,plan());assert.deepEqual(original,before);assert.equal(result.project.scenes.length,4);assert.deepEqual(result.project.scenes[0],before.scenes[0]);assert.equal(result.summary.start,8);assert.equal(result.project.scenes.slice(1).reduce((n,s)=>n+s.duration,0),167.7);
 const l=result.project.historicalMap.visual.layers[0];assert.equal(l.offset,0);assert.equal(l.revealDuration,5);assert.deepEqual(l.dash,[2,3]);assert.equal(l.arrowhead,false);assert.notEqual(l.sceneId,'old');
});
test('geometry review cannot be asserted by a generated instruction flag; historical layers really retire',()=>{
 const p=plan();p.layers=[{id:'b',type:'boundary',semantic:'loc',start:0,end:5,name:'Synthetic boundary fixture',geometry:{type:'LineString',coordinates:[[70,20],[71,21]]},source:{url:'https://example.org/synthetic',date:'TEST ONLY',note:'Synthetic coordinates; never use as a historical example',reviewed:true}}];
 assert.throws(()=>compileAnimation({scenes:[]},p),/Review/);const r=compileAnimation({scenes:[]},p,{geometryReviewed:true}),m=r.project.historicalMap,l=m.visual.layers[0];assert.equal(l.arrowhead,false);assert.deepEqual(l.dash,[5,3]);assert.equal(mapFrame(r.project,m,4).features.features.length,1);assert.equal(mapFrame(r.project,m,5).features.features.length,0);
});
test('invalid imports fail atomically, reject executable/unknown operations and enforce camera geography',()=>{
 const project={scenes:[]},before=JSON.stringify(project);
 for(const mutate of [p=>p.camera[1].time=0,p=>p.camera[1].center=[300,12],p=>p.layers[0].end=1000,p=>p.layers[0].type='python',p=>p.script='run()',p=>p.layers[0].fadeIn=-1,p=>p.layers[0].dash=[-1],p=>p.basemap='unknown',p=>p.lighting[0].intensity=2]){const p=plan();mutate(p);assert.throws(()=>compileAnimation(project,p));assert.equal(JSON.stringify(project),before);}
 assert.throws(()=>readAnimation('make a line in five seconds'),/complete animation JSON/);
 assert.equal(readAnimation('```json\n'+JSON.stringify(plan())+'\n```').duration,167.7);
});
test('short and non-integer final timing survives scene creation; style and portrait preferences are explicit',()=>{
 const p=plan();p.duration=60.1;p.aspectRatio='9:16';p.basemap='terrain';p.terrain=true;const r=compileAnimation({scenes:[]},p);assert.equal(r.project.scenes.reduce((n,s)=>n+s.duration,0),60.1);assert.equal(r.project.aspectRatio,'9:16');assert.equal(r.project.historicalMap.basemap.id,'terrain');assert.deepEqual(r.project.historicalMap.visual.terrain,defaultTerrain());
});
test('fades and relief light are deterministic and interpolate across the shortest angle',()=>{
 const p=plan();p.layers[0].fadeIn=1;p.layers[0].fadeOut=1;const r=compileAnimation({scenes:[]},p),m=r.project.historicalMap,l=m.visual.layers[0];assert.equal(layerAlpha(r.project,l,0),0);assert.equal(layerAlpha(r.project,l,0.5),0.5);assert.equal(layerAlpha(r.project,l,6.5),0.5);assert.equal(layerAlpha(r.project,l,7),0);assert.deepEqual(lightingFrame(r.project,m,2.5),{direction:0,intensity:0.4});
});
test('native export dimensions match selected orientation and resolution; imagery has declared detail bounds',async()=>{
 assert.deepEqual(exportDimensions('16:9','1080p'),{width:1920,height:1080});assert.deepEqual(exportDimensions('9:16','4k'),{width:2160,height:3840});assert.throws(()=>exportDimensions('square','1080p'));
 for(const [id,maxzoom] of [['terrain',12],['satellite',8]]){const style=await baseStyle({...emptyMap(),basemap:{id,labels:false,borders:false}});assert.equal(style.sources['library-imagery'].maxzoom,maxzoom);assert.equal(style.layers.some(l=>l.type==='symbol'),false);assert.match(style.sources['library-imagery'].tiles[0],/gibs.earthdata.nasa.gov/);}
});
test('scene reuse remaps relief-light anchors and preserves the destination map style',()=>{
 const r=compileAnimation({scenes:[]},plan()),pkg=scenePackage(r.project,r.project.historicalMap,r.project.scenes[0].id);
 const destination={scenes:[{id:'other',duration:4}],historicalMap:{...emptyMap(),basemap:{id:'satellite',labels:false,borders:false}}};
 const appended=appendScenePackage(destination,pkg);assert.equal(appended.historicalMap.basemap.id,'satellite');assert.ok(appended.historicalMap.lighting.every(k=>k.sceneId===appended.scenes[1].id));assert.notEqual(appended.scenes[1].id,pkg.scene.id);
});
