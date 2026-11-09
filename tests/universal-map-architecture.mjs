import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import {OVERLAY_PRESETS,resolveOverlayPolicy,validateOverlayConfig} from '../creator/map-overlay-presets.js';
import {emptyMap,validateMap,mapFrame,timeOf} from '../creator/history-model.js';
import {safeRelativeAssetPath,safeAssetUrl} from '../creator/map-editor-model.js';
import {compileAnimation} from '../creator/map-animation-import.js';
import {britishIndiaDemo} from '../creator/history-demo.js';
import {referencedMapAssets,validateManifest} from '../creator/video-studio/model.js';
import {makeScene} from '../creator/storyboard-model.js';

const repoUrl=rel=>new URL('../'+rel,import.meta.url);

test('shared map/studio modules and catalogs contain no Panipat hardcoding',async()=>{
 const sharedFiles=[
  'creator/history-player.js',
  'creator/map-defaults.js',
  'creator/map-labels.js',
  'creator/map-editor.js',
  'creator/map-editor-model.js',
  'creator/map-animation-import.js',
  'creator/creator.js',
  'creator/project.js',
  'creator/video-studio/adapters.js',
  'creator/video-studio/model.js',
  'creator/video-studio/workspace.js',
  'creator/map-overlay-presets.js',
  'creator/map-editor-renderer.js',
  'creator/history-demo.js',
  'creator/history-demo.html',
  'creator/video-studio/assembly.js',
  'creator/history-data/demos.json',
  'creator/asset-libraries/index.json'
 ];
 for(const rel of sharedFiles){
  const text=await fs.readFile(repoUrl(rel),'utf8');
  assert.equal(/panipat/i.test(text),false,`Unexpected Panipat reference in ${rel}`);
 }
});

test('data-driven demo and asset library catalogs are valid and point to existing files',async()=>{
 const demoCatalog=JSON.parse(await fs.readFile(repoUrl('creator/history-data/demos.json'),'utf8'));
 assert.equal(demoCatalog.format,'invincible-map-demos');
 assert.equal(demoCatalog.version,1);
 assert.ok(demoCatalog.demos.some(d=>d.id==='british-india'&&d.builtIn===true));

 const assetCatalog=JSON.parse(await fs.readFile(repoUrl('creator/asset-libraries/index.json'),'utf8'));
 assert.equal(assetCatalog.format,'invincible-asset-library-catalog');
 assert.equal(assetCatalog.version,1);
 assert.ok(assetCatalog.libraries.length>=1);
 for(const lib of assetCatalog.libraries){
  assert.equal(safeRelativeAssetPath(lib.path),true,`Invalid catalog library path: ${lib.path}`);
  const targetUrl=new URL(lib.path,repoUrl('creator/asset-libraries/index.json'));
  const body=JSON.parse(await fs.readFile(targetUrl,'utf8'));
  assert.equal(body.format,'invincible-map-assets');
  assert.ok(Array.isArray(body.assets));
 }
});

test('britishIndiaDemo remains standalone with sourced milestones and legacy overlay default',()=>{
 const demo=britishIndiaDemo();
 assert.equal(demo.scenes.length,4);
 const map=validateMap(demo.historicalMap,demo);
 const policy=resolveOverlayPolicy(demo,map);
 assert.equal(policy.presetId,'legacy');
 assert.equal(policy.scaling,'css');
 assert.equal(policy.events.mode,'legacy');
 assert.equal(policy.dateBanner.mode,'bar');
});

test('resolveOverlayPolicy enforces preset < plugin < project < spec precedence and validates bounds',()=>{
 const p=resolveOverlayPolicy(
  {
   overlayPreset:'legacy',
   overlayPolicy:{
    scaling:'css',
    events:{cornerRadius:10,nightBg:'#111111'},
    attribution:{sourceCredit:'Project Source'},
    renderer:{relief:{exaggeration:0.6}}
   }
  },
  {
   overlayPreset:'documentary',
   overlayPolicy:{
    scaling:'shortEdge1080',
    events:{nightBg:'#222222'},
    renderer:{symbol:{lineWidth:8}}
   }
  },
  {
   scaling:'css',
   events:{cornerRadius:14,nightText:'#abcdef',dotRadius:12},
   dateBanner:{padX:30},
   renderer:{relief:{shadowColor:'#010203',exaggeration:0.9},symbol:{fallbackBasePx:32}}
  }
 );
 assert.equal(p.presetId,'documentary');
 assert.equal(p.scaling,'shortEdge1080');
 assert.equal(p.events.mode,OVERLAY_PRESETS.documentary.events.mode);
 assert.equal(p.events.nightBg,'#222222');
 assert.equal(p.events.cornerRadius,10);
 assert.equal(p.events.nightText,'#abcdef');
 assert.equal(p.dateBanner.padX,30);
 assert.equal(p.attribution.sourceCredit,'Project Source');
 assert.equal(p.renderer.relief.shadowColor,'#010203');
 assert.equal(p.renderer.relief.exaggeration,0.6);
 assert.equal(p.renderer.symbol.lineWidth,8);
 assert.equal(p.renderer.symbol.fallbackBasePx,32);

 assert.doesNotThrow(()=>validateOverlayConfig({
  overlayPreset:'documentary',
  overlayPlugin:{id:'custom.overlay:v1',options:{tone:'warm'}},
  overlayPolicy:{
   scaling:'shortEdge1080',
   events:{visible:true,mode:'card',dotRadius:8,cornerRadius:16},
   dateBanner:{visible:false,mode:'pill',height:72},
   attribution:{visible:true,mode:'compact',sourceCredit:'Survey archive'},
   renderer:{relief:{exaggeration:1.2},symbol:{lineWidth:6,fallbackBasePx:40}}
  }
 }));

 for(const bad of [
  {overlayPreset:'unknown-preset'},
  {overlayPlugin:''},
  {overlayPlugin:'bad plugin with spaces'},
  {overlayPlugin:{id:'ok',extra:1}},
  {overlayPlugin:{id:'ok',options:['bad']}},
  {overlayPolicy:{unknownSection:{}}},
  {overlayPolicy:{scaling:'px'}},
  {overlayPolicy:{events:{mode:'floating'}}},
  {overlayPolicy:{events:{visible:'yes'}}},
  {overlayPolicy:{events:{dotRadius:999}}},
  {overlayPolicy:{events:{badKey:1}}},
  {overlayPolicy:{dateBanner:{mode:'banner'}}},
  {overlayPolicy:{dateBanner:{height:5}}},
  {overlayPolicy:{attribution:{mode:'tiny'}}},
  {overlayPolicy:{attribution:{height:900}}},
  {overlayPolicy:{renderer:{unknown:1}}},
  {overlayPolicy:{renderer:{relief:{exaggeration:9}}}},
  {overlayPolicy:{renderer:{symbol:{fallbackBasePx:2}}}}
 ]){
  assert.throws(()=>validateOverlayConfig(bad));
 }

 const demo=britishIndiaDemo();
 demo.historicalMap.overlayPreset='documentary';
 demo.historicalMap.overlayPlugin={id:'optional.overlay',options:{seed:7}};
 demo.historicalMap.overlayPolicy={events:{cornerRadius:12}};
 demo.historicalMap.customMetadata={preserve:true};
 const validated=validateMap(demo.historicalMap,demo);
 assert.equal(validated.overlayPreset,'documentary');
 assert.deepEqual(validated.overlayPlugin,{id:'optional.overlay',options:{seed:7}});
 assert.equal(validated.overlayPolicy.events.cornerRadius,12);
 assert.deepEqual(validated.customMetadata,{preserve:true});
});

test('safeAssetUrl and safeRelativeAssetPath block traversal, credentials and unsafe schemes',()=>{
 const allowed=[
  'https://cdn.example.org/assets/banner.png',
  './history-data/custom.png',
  './history-data/lib/file.glb?v=2#top',
  '/creator/history-data/preview.png',
  '/invincible/creator/asset-libraries/icon.webp'
 ];
 for(const url of allowed)assert.equal(safeAssetUrl(url),true,`Expected safe URL: ${url}`);

 const rejected=[
  '',
  ' ',
  'http://example.org/insecure.png',
  'https://user:pass@example.org/auth.png',
  'javascript:alert(1)',
  'blob:https://example.org/123',
  'data:image/png;base64,AA==',
  '//evil.example/a.png',
  '../secret.json',
  './../secret.json',
  '/creator/%2e%2e/secret.json',
  '/creator/a//b.png',
  './a\\b.png',
  './dir/',
  'history-data/no-dot.png',
  './foo\x00bar.png'
 ];
 for(const url of rejected){
  assert.equal(safeAssetUrl(url),false,`Expected rejected URL: ${url}`);
  assert.equal(safeRelativeAssetPath(url),false,`Expected rejected relative path: ${url}`);
 }
});

test('compileAnimation bindScenes preserves scene IDs, narration, timestamps, completion and style',()=>{
 const s1=makeScene({id:'scene-1',duration:4,voiceover:'First line',visual:'Intro',voiceoverTimestamp:'00:00.000–00:04.000',productionMethods:['Voiceover'],completed:true});
 const s2=makeScene({id:'scene-2',duration:6,voiceover:'Second line',visual:'Body',voiceoverTimestamp:'00:04.000–00:10.000',productionMethods:['Camera'],completed:false});
 const s3=makeScene({id:'scene-3',duration:5,voiceover:'Third line',visual:'Outro',voiceoverTimestamp:'00:10.000–00:15.000',productionMethods:['Voiceover'],completed:true});
 const map=emptyMap();
 map.theme='parchment';
 map.basemap={id:'atlas',labels:true,borders:false,saturation:0.25,contrast:0.1};
 map.overlayPreset='legacy';
 map.overlayPolicy={dateBanner:{height:52}};
 const project={title:'Bound Doc',aspectRatio:'16:9',scenes:[s1,s2,s3],historicalMap:map,custom:{tag:'keep'}};

 const plan={
  format:'invincible-map-animation',
  version:1,
  title:'Two-scene overlay',
  duration:10,
  aspectRatio:'9:16',
  basemap:'night'==='night'?'terrain':'physical',
  overlayPreset:'documentary',
  overlayPolicy:{events:{cornerRadius:20}},
  camera:[
   {time:0,center:[77,28],zoom:5,pitch:20,bearing:0},
   {time:8,center:[79,29],zoom:7,pitch:30,bearing:10}
  ],
  layers:[
   {id:'r1',type:'route',name:'March',start:1,end:9,coordinates:[[76,27],[79,29]],color:'#ffcc00',fadeIn:0.2,fadeOut:0.2,revealDuration:4}
  ]
 };

 const compiled=compileAnimation(project,plan,{bindScenes:true});
 const out=compiled.project;
 assert.equal(out.scenes.length,3);
 assert.deepEqual(out.scenes.map(s=>s.id),['scene-1','scene-2','scene-3']);
 assert.deepEqual(out.scenes.map(s=>s.voiceoverTimestamp),['00:00.000–00:04.000','00:04.000–00:10.000','00:10.000–00:15.000']);
 assert.deepEqual(out.scenes.map(s=>s.completed),[true,false,true]);
 assert.equal(out.aspectRatio,'16:9');
 assert.equal(out.custom.tag,'keep');
 assert.equal(out.historicalMap.theme,'parchment');
 assert.equal(out.historicalMap.basemap.id,'atlas');
 assert.equal(out.historicalMap.overlayPreset,'legacy');
 assert.equal(out.historicalMap.overlayPolicy.dateBanner.height,52);
 assert.equal(compiled.summary.boundScenes,3);
 assert.equal(compiled.summary.stylePreserved,true);

 // Camera time 8s spans scene-1 (4s) into scene-2 (+4s offset).
 assert.equal(out.historicalMap.camera[0].sceneId,'scene-1');
 assert.equal(out.historicalMap.camera[0].offset,0);
 assert.equal(out.historicalMap.camera[1].sceneId,'scene-2');
 assert.equal(out.historicalMap.camera[1].offset,4);
 // Route span 1s..9s anchors at scene-1 + 1s with 8s duration across scene-2.
 const routeLayer=out.historicalMap.visual.layers[0];
 assert.equal(routeLayer.sceneId,'scene-1');
 assert.equal(routeLayer.offset,1);
 assert.equal(routeLayer.duration,8);
 assert.deepEqual(mapFrame(out,out.historicalMap,5).features.features.length,0);
 assert.equal(timeOf(out,out.historicalMap.camera[1]),8);

 // Subset binding targets only selected scene IDs.
 const subsetPlan={...plan,duration:11,camera:[{time:0,center:[78,27],zoom:5},{time:7,center:[80,28],zoom:6}],layers:[{id:'m',type:'symbol',icon:'fort',name:'Fort',start:6,end:10,position:[80,28]}]};
 const subsetCompiled=compileAnimation(project,subsetPlan,{bindScenes:true,sceneIds:['scene-2','scene-3']});
 assert.equal(subsetCompiled.summary.boundScenes,2);
 assert.equal(subsetCompiled.project.historicalMap.camera[0].sceneId,'scene-2');
 assert.equal(subsetCompiled.project.historicalMap.camera[1].sceneId,'scene-3');
 assert.equal(subsetCompiled.project.historicalMap.camera[1].offset,1);
 assert.equal(subsetCompiled.project.historicalMap.visual.layers[0].sceneId,'scene-3');
 assert.equal(subsetCompiled.project.historicalMap.visual.layers[0].offset,0);

 // Rejects invalid bind states atomically.
 assert.throws(()=>compileAnimation({scenes:[]},plan,{bindScenes:true}),/Add storyboard scenes/);
 assert.throws(()=>compileAnimation(project,{...plan,duration:16},{bindScenes:true}),/exceeds selected scenes/);
 assert.throws(()=>compileAnimation(project,plan,{bindScenes:true,sceneIds:['scene-2','scene-2']}),/once each/);
 assert.throws(()=>compileAnimation(project,plan,{bindScenes:true,sceneIds:['missing']}),/do not exist/);
 assert.throws(()=>compileAnimation({...project,scenes:[{id:'z',duration:0}]},{...plan,duration:1,camera:[{time:0,center:[77,28],zoom:5}],layers:[]},{bindScenes:true}),/positive durations/);

 // Fresh project gets plan preset & policy.
 const fresh=compileAnimation({scenes:[]},{...plan,overlayPreset:'documentary',overlayPolicy:{events:{cornerRadius:14}}});
 assert.equal(fresh.project.historicalMap.overlayPreset,'documentary');
 assert.equal(fresh.project.historicalMap.overlayPolicy.events.cornerRadius,14);
});

test('referencedMapAssets bypasses 50-asset cap for unused catalog entries while catching missing/duplicate refs',()=>{
 const mapAssets=Array.from({length:60},(_,i)=>({
  id:`asset-${i}`,
  name:i===55?'Duplicate':i===56?'Duplicate':`Commander ${i}`,
  type:'image',
  url:`/creator/history-data/img-${i}.png`
 }));
 const anim={
  format:'invincible-map-animation',
  version:1,
  duration:5,
  aspectRatio:'16:9',
  basemap:'physical',
  terrain:false,
  camera:[{time:0,center:[77,28],zoom:5}],
  assets:[{id:'ref-1',libraryName:'Commander 59'}],
  layers:[{id:'img-1',type:'image',name:'Portrait',start:0,end:5,position:[77,28],corners:[[76.5,28.5],[77.5,28.5],[77.5,27.5],[76.5,27.5]],assetId:'ref-1'}]
 };

 const filtered=referencedMapAssets(mapAssets,anim);
 assert.equal(filtered.length,1);
 assert.equal(filtered[0].id,'asset-59');

 const manifest={
  schemaVersion:2,
  title:'Referenced subset check',
  aspectRatio:'9:16',
  fps:30,
  brandPresetId:'adichimp',
  assets:[{id:'a1',name:'Used ref',libraryId:'asset-59'}],
  scenes:[{id:'s1',startSeconds:0,durationSeconds:5,engineType:'map',engineData:{animation:anim,geometryReviewed:false},overlays:[]}],
  audio:null,
  audioClips:[],
  introEnabled:false,
  outroEnabled:false
 };
 assert.doesNotThrow(()=>validateManifest(manifest,{mapAssets}));

 // Duplicate libraryName is rejected while libraryId disambiguates.
 const dupAnim={...anim,assets:[{id:'ref-1',libraryName:'Duplicate'}]};
 assert.throws(()=>compileAnimation({scenes:[],historicalMap:{...emptyMap(),visual:{version:1,layers:[],assets:referencedMapAssets(mapAssets,dupAnim)}}},dupAnim),/More than one library asset/);

 const byIdAnim={...anim,assets:[{id:'ref-1',libraryId:'asset-56'}]};
 assert.doesNotThrow(()=>compileAnimation({scenes:[],historicalMap:{...emptyMap(),visual:{version:1,layers:[],assets:referencedMapAssets(mapAssets,byIdAnim)}}},byIdAnim));

 // Missing libraryId is rejected clearly.
 assert.throws(()=>validateManifest({
  ...manifest,
  assets:[{id:'a1',name:'Missing',libraryId:'does-not-exist'}]
 },{mapAssets}),/Missing image in existing map library: does-not-exist/);
});

test('storageError and Creator saveItem protect revisions and immutable collaboration fields',async()=>{
 const fbSource=await fs.readFile(repoUrl('shared/firebase-client.js'),'utf8');
 const storageFnSrc=fbSource.slice(fbSource.indexOf('export function storageError('));
 const storageError=new Function(storageFnSrc.replace('export function storageError','function storageError')+'return storageError;')();
 assert.match(storageError({code:'revision-conflict'}),/another session or tab/);
 assert.match(storageError({code:'aborted'}),/retry/);
 assert.doesNotMatch(storageError({code:'failed-precondition',message:'Missing index'}),/another session or tab/);

 const creatorSource=await fs.readFile(repoUrl('creator/creator.js'),'utf8');
 const saveFnSrc=creatorSource.slice(creatorSource.indexOf('async function saveItem('),creatorSource.indexOf('async function migrateLegacyProjects('));
 let user={uid:'owner',email:'Owner@Example.com'};
 const store=new Map();
 const doc=(_db,col,id)=>`${col}/${id}`;
 const serverTimestamp=()=>'SERVER_TS';
 const attachImportedGroups=()=>{};
 const statuses=[];
 const status=(msg,type)=>statuses.push({msg,type});
 const runTransaction=async(_db,fn)=>{
  let staged=null;
  const res=await fn({
   async get(ref){return {exists:()=>store.has(ref),data:()=>store.get(ref)};},
   set(ref,val){staged={ref,val};}
  });
  if(staged)store.set(staged.ref,JSON.parse(JSON.stringify(staged.val)));
  return res;
 };
 const factory=new Function(
  'db','doc','runTransaction','serverTimestamp','attachImportedGroups','storageError','status','getUser',
  `let user=null;const refreshUser=()=>{user=getUser();};${saveFnSrc.replace('async function saveItem(item){','async function saveItem(item){refreshUser();')}return saveItem;`
 );
 const saveItem=factory({},doc,runTransaction,serverTimestamp,attachImportedGroups,storageError,status,()=>user);

 // Create initializes revision 1.
 const item={id:'p1',title:'Test',scenes:[]};
 await saveItem(item);
 assert.equal(item.writeRevision,1);
 assert.equal(store.get('creatorProjects/p1').ownerUid,'owner');
 assert.equal(store.get('creatorProjects/p1').writtenBy,'owner');

 // Collaborator update bumps revision but cannot overwrite ownerUid/ownerEmail/editorEmails.
 user={uid:'collab',email:'collab@example.com'};
 store.set('creatorProjects/p1',{
  ...store.get('creatorProjects/p1'),
  ownerEmail:'owner@example.com',
  editorEmails:['collab@example.com'],
  createdAt:'CREATED_TS'
 });
 const collabCopy={
  ...store.get('creatorProjects/p1'),
  title:'Edited by collaborator',
  ownerUid:'collab',
  ownerEmail:'hijack@example.com',
  editorEmails:['evil@example.com']
 };
 await saveItem(collabCopy);
 assert.equal(collabCopy.writeRevision,2);
 const saved=store.get('creatorProjects/p1');
 assert.equal(saved.title,'Edited by collaborator');
 assert.equal(saved.ownerUid,'owner');
 assert.equal(saved.ownerEmail,'owner@example.com');
 assert.deepEqual(saved.editorEmails,['collab@example.com']);
 assert.equal(saved.createdAt,'CREATED_TS');
 assert.equal(saved.writtenBy,'collab');

 // Stale writeRevision is rejected with revision-conflict without mutating store.
 await assert.rejects(()=>saveItem({...saved,writeRevision:1,title:'Stale overwrite'}),e=>e.code==='revision-conflict');
 assert.equal(store.get('creatorProjects/p1').title,'Edited by collaborator');

 // Legacy project without writeRevision upgrades smoothly 0 -> 1.
 user={uid:'owner',email:'owner@example.com'};
 store.set('creatorProjects/legacy',{id:'legacy',ownerUid:'owner',title:'Legacy doc',scenes:[]});
 const legacyItem={id:'legacy',ownerUid:'owner',title:'Legacy updated',scenes:[]};
 await saveItem(legacyItem);
 assert.equal(legacyItem.writeRevision,1);
 assert.equal(store.get('creatorProjects/legacy').writeRevision,1);
 store.delete('creatorProjects/legacy');await assert.rejects(()=>saveItem({...legacyItem,writeRevision:0},{mustExist:true}),e=>e.code==='revision-conflict');assert.equal(store.has('creatorProjects/legacy'),false);
});
