import {compileAnimation} from '../map-animation-import.js';
import {validateMap,durationOf} from '../history-model.js';
import {validateBattlefield} from './battlefield.js';
import {exportDimensions} from '../map-video-export.js';
export {exportDimensions};
export const PRESETS = Object.freeze([
 {id:'adichimp',name:'AdiChimp',background:'#071426',foreground:'#f4f5f7',accent:'#edc46a',font:'system-ui',logoAssetId:'',intro:null,outro:null},
 {id:'lic',name:'LIC',background:'#071b39',foreground:'#ffffff',accent:'#ffce45',font:'system-ui',logoAssetId:'',intro:null,outro:null},
 {id:'custom',name:'Custom',background:'#111827',foreground:'#ffffff',accent:'#61d6d1',font:'system-ui',logoAssetId:'',intro:null,outro:null}
]);
const fail = message=>{throw Error(message);};
const obj = x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const keys = (x,allowed,label)=>{if(!obj(x))fail(`${label} must be an object.`);for(const key of Object.keys(x))if(!allowed.includes(key))fail(`Unsupported ${label} field: ${key}`);};
const num = (x,min,max,label)=>{if(!Number.isFinite(x)||x<min||x>max)fail(`${label} must be between ${min} and ${max}.`);};
const str = (x,max,label)=>{if(typeof x!=='string'||x.length>max)fail(`Invalid ${label}.`);};
const color = x=>{if(!/^#[\da-f]{6}$/i.test(x))fail('Colors must be #rrggbb.');};
const id = x=>{if(typeof x!=='string'||!x.length||x.length>150)fail('Use nonempty IDs up to 150 characters.');};
export function emptyVideo(){return {schemaVersion:1,title:'Untitled video',aspectRatio:'9:16',fps:30,brandPresetId:'adichimp',scenes:[],assets:[],audio:null,introEnabled:false,outroEnabled:false};}
export function validateLayer(layer,duration,assets){
 keys(layer,['id','type','text','assetId','x','y','width','height','scale','rotation','opacity','fontSize','color','startSeconds','endSeconds','keyframes'],'layer');id(layer.id);
 if(!['text','image','rectangle'].includes(layer.type))fail('Layer type must be text, image or rectangle.');
 if(layer.type==='text')str(layer.text,2000,'layer text');
 if(layer.type==='image'&&!assets.has(layer.assetId))fail('Image refers to a missing asset: '+layer.assetId);
 for(const field of ['x','y'])if(layer[field]!==undefined)num(layer[field],-2,3,field);
 for(const field of ['width','height'])if(layer[field]!==undefined)num(layer[field],0.001,4,field);
 if(layer.scale!==undefined)num(layer.scale,0,10,'scale');if(layer.rotation!==undefined)num(layer.rotation,-3600,3600,'rotation');
 if(layer.opacity!==undefined)num(layer.opacity,0,1,'opacity');if(layer.fontSize!==undefined)num(layer.fontSize,8,400,'fontSize');if(layer.color!==undefined)color(layer.color);
 const start=layer.startSeconds??0,end=layer.endSeconds??duration;num(start,0,duration,'layer start');num(end,start,duration,'layer end');
 if(layer.keyframes!==undefined){if(!Array.isArray(layer.keyframes)||layer.keyframes.length>150)fail('Use up to 150 keyframes.');let previous=-1;
  for(const k of layer.keyframes){keys(k,['timeSeconds','x','y','scale','opacity','rotation','easing'],'keyframe');num(k.timeSeconds,0,duration,'keyframe time');if(k.timeSeconds<=previous)fail('Keyframes must be strictly increasing.');previous=k.timeSeconds;
   if(k.easing!==undefined&&!['linear','smooth','hold'].includes(k.easing))fail('Unsupported easing.');for(const p of ['x','y','scale','opacity','rotation'])if(k[p]!==undefined)num(k[p],p==='opacity'?0:p==='scale'?0:p==='rotation'?-3600:-2,p==='opacity'?1:p==='scale'?10:p==='rotation'?3600:3,p);
  }
 }
}
function validateNativeProject(nativeProject){
   keys(nativeProject,['scenes','historicalMap'],'native map snapshot');
   if(!Array.isArray(nativeProject.scenes)||!nativeProject.scenes.length||nativeProject.scenes.length>100)fail('Native map needs scenes.');
   const ids=new Set();for(const s of nativeProject.scenes){keys(s,['id','duration'],'native map scene');id(s.id);num(s.duration,1/30,600,'map duration');if(ids.has(s.id))fail('Duplicate native map scene.');ids.add(s.id);}
   validateMap(nativeProject.historicalMap,nativeProject);
}
function validateScene(scene,assets,mapAssets,{template=false,version=1,mapSources=[]}={}){
 keys(scene,['id','name','startSeconds','durationSeconds','engineType','engineData','overlays','transition'],'scene');id(scene.id);if(scene.name!==undefined)str(scene.name,200,'scene name');num(scene.startSeconds,0,600,'scene start');num(scene.durationSeconds,1/30,600,'scene duration');
 if(!(version===2?['map','lic','graphic','battlefield','image','video']:['map','lic','graphic']).includes(scene.engineType)||template&&scene.engineType!=='graphic')fail('Unsupported scene engine for this manifest version.');
 const data=scene.engineData;
 if(scene.engineType==='map'){
  keys(data,version===2?['animation','geometryReviewed','project','sourceId','sourceStart']:['animation','geometryReviewed'],'map engine');if(data.geometryReviewed!==undefined&&typeof data.geometryReviewed!=='boolean')fail('geometryReviewed must be boolean.');
  if(data.sourceId&&data.project)fail('Choose one map source.');
  const nativeProject=data.project||(data.sourceId?mapSources.find(s=>s.id===data.sourceId)?.project:null);
  if(data.sourceId&&!nativeProject)fail('Missing native map source.');
  if(nativeProject){
   if(data.animation)fail('Choose native map or animation instructions, not both.');
   validateNativeProject(nativeProject);num(data.sourceStart,0,600,'map source start');if(data.sourceStart+scene.durationSeconds>durationOf(nativeProject)+1e-6)fail('Native map trim exceeds its source.');
  }else{
  const compiled=compileAnimation({scenes:[],historicalMap:{version:1,theme:'night',events:[],features:{type:'FeatureCollection',features:[]},camera:[],visual:{version:1,layers:[],assets:mapAssets}}},data.animation,{geometryReviewed:data.geometryReviewed===true});
  if(Math.abs(compiled.summary.duration-scene.durationSeconds)>1e-6)fail('Map duration must match its scene.');
  }
 }else if(scene.engineType==='battlefield')validateBattlefield(data,scene.durationSeconds,assets);
 else if(scene.engineType==='image'||scene.engineType==='video'){
  keys(data,scene.engineType==='video'?['assetId','trimStart','fit']:['assetId','fit'],'media scene');if(!assets.has(data.assetId))fail('Missing media asset.');if(!['contain','cover'].includes(data.fit))fail('Choose contain or cover.');if(scene.engineType==='video')num(data.trimStart,0,600,'video trim');
 }else if(scene.engineType==='lic'){
  keys(data,['title','source','points'],'LIC engine');str(data.title,200,'graph title');str(data.source,1000,'illustration source');if(!data.source.trim())fail('Financial graphs require an illustration source.');
  if(!Array.isArray(data.points)||!data.points.length||data.points.length>100)fail('Use 1–100 financial milestones.');let previous=-1;
  for(const p of data.points){keys(p,['timeSeconds','year','label','premium','addition','income','booster','maturity'],'milestone');num(p.timeSeconds,0,scene.durationSeconds,'milestone time');if(p.timeSeconds<previous)fail('Milestones must follow timeline order.');previous=p.timeSeconds;num(p.year,0,100,'policy year');str(p.label,100,'milestone label');for(const field of ['premium','addition','income','booster','maturity'])if(p[field]!==undefined)num(p[field],0,1e10,field);}
 }else keys(data,['background'],'graphics engine');
 if(data.background!==undefined)color(data.background);
 if(!Array.isArray(scene.overlays)||scene.overlays.length>100)fail('Use up to 100 overlays per scene.');const ids=new Set();for(const l of scene.overlays){validateLayer(l,scene.durationSeconds,assets);if(ids.has(l.id))fail('Duplicate layer ID.');ids.add(l.id);}
 if(scene.transition!==undefined){keys(scene.transition,['type','durationSeconds'],'transition');if(!['cut','fade'].includes(scene.transition.type))fail('Transition must be cut or fade.');num(scene.transition.durationSeconds,0,scene.durationSeconds/2,'transition duration');}
}
export function validateManifest(input,{mapAssets=[]}={}){
 let m;try{m=typeof input==='string'?JSON.parse(input):structuredClone(input);}catch{fail('Choose a complete Video Studio JSON file.');}
 if(new TextEncoder().encode(JSON.stringify(m)).length>1000000)fail('Use a manifest under 1 MB.');
 keys(m,['schemaVersion','title','aspectRatio','fps','brandPresetId','scenes','assets','audio',...(m.schemaVersion===2?['audioClips','mapSources']:[]),'introEnabled','outroEnabled'],'manifest');
 if(![1,2].includes(m.schemaVersion)||m.fps!==30||!['9:16','16:9'].includes(m.aspectRatio))fail('Use schemaVersion 1 or 2, fps 30 and 9:16 or 16:9.');str(m.title,200,'title');id(m.brandPresetId);
 for(const p of ['introEnabled','outroEnabled'])if(m[p]!==undefined&&typeof m[p]!=='boolean')fail(p+' must be boolean.');
 if(!Array.isArray(m.assets)||m.assets.length>200)fail('Use up to 200 asset references.');const assets=new Set();
 for(const a of m.assets){keys(a,['id','name','fileId','url','libraryId',...(m.schemaVersion===2?['credit']:[])],'asset');id(a.id);str(a.name,200,'asset name');if(a.credit!==undefined)str(a.credit,2000,'asset credit');if(assets.has(a.id))fail('Duplicate asset ID.');assets.add(a.id);
  if(['fileId','url','libraryId'].filter(k=>a[k]!==undefined).length!==1)fail('Assets need exactly one fileId, HTTPS url or libraryId.');
  if(a.url!==undefined){let u;try{u=new URL(a.url);}catch{fail('Invalid asset URL.');}if(u.protocol!=='https:'||u.username||u.password)fail('Assets require HTTPS without credentials.');}
  if(a.fileId!==undefined)id(a.fileId);if(a.libraryId!==undefined&&!mapAssets.some(item=>item.id===a.libraryId&&item.type==='image'))fail('Missing image in existing map library: '+a.libraryId);
 }
 if(m.mapSources!==undefined){if(!Array.isArray(m.mapSources)||m.mapSources.length>100)fail('Use up to 100 native map sources.');const ids=new Set();for(const source of m.mapSources){keys(source,['id','project'],'map source');id(source.id);if(ids.has(source.id))fail('Duplicate map source.');ids.add(source.id);if(!source.project)fail('Missing source project.');validateNativeProject(source.project);}}
 if(!Array.isArray(m.scenes)||m.scenes.length>100)fail('Use up to 100 scenes.');let end=0;const ids=new Set();
 for(const s of m.scenes){validateScene(s,assets,mapAssets,{version:m.schemaVersion,mapSources:m.mapSources});if(ids.has(s.id))fail('Duplicate scene ID.');ids.add(s.id);if(s.startSeconds<end-1e-6)fail('Scenes must be ordered and cannot overlap.');end=s.startSeconds+s.durationSeconds;if(end>600)fail('Video exceeds ten minutes.');}
 if(m.audio!=null){keys(m.audio,['fileId','name','startSeconds','gain'],'audio');id(m.audio.fileId);str(m.audio.name,200,'audio name');num(m.audio.startSeconds,0,600,'audio start');num(m.audio.gain,0,2,'audio gain');}
 if(m.schemaVersion===2){
  if(m.audio!=null)fail('Version 2 uses audioClips, not legacy audio.');
  if(!Array.isArray(m.audioClips)||m.audioClips.length>100)fail('Use up to 100 audio clips.');const ids=new Set();
  for(const a of m.audioClips){keys(a,['id','fileId','name','role','startSeconds','trimStart','durationSeconds','gain','fadeIn','fadeOut'],'audio clip');id(a.id);if(ids.has(a.id))fail('Duplicate audio clip.');ids.add(a.id);id(a.fileId);str(a.name,200,'audio name');if(!['voiceover','music','effect'].includes(a.role))fail('Invalid audio role.');num(a.startSeconds,0,600,'audio start');num(a.trimStart,0,600,'audio trim');num(a.durationSeconds,1/48000,600,'audio duration');num(a.gain,0,2,'gain');num(a.fadeIn,0,a.durationSeconds,'fade in');num(a.fadeOut,0,a.durationSeconds,'fade out');if(a.fadeIn+a.fadeOut>a.durationSeconds||a.startSeconds+a.durationSeconds>600)fail('Audio timing exceeds its bounds.');}
 }
 return m;
}
export function validateBrand(input,assets=new Set()){
 const b=structuredClone(input);keys(b,['id','name','background','foreground','accent','font','logoAssetId','intro','outro'],'brand');id(b.id);str(b.name,100,'brand name');for(const p of ['background','foreground','accent'])color(b[p]);str(b.font,100,'font');if(!b.font.trim())fail('Choose a font family.');
 if(b.logoAssetId&&!assets.has(b.logoAssetId))fail('Brand logo refers to a missing asset.');
 for(const p of ['intro','outro'])if(b[p]!=null)validateScene(b[p],assets,[],{template:true});return b;
}
export function compileTimeline(manifest,brand,audioDuration=0){
 const lead=manifest.introEnabled&&brand?.intro?brand.intro.durationSeconds:0;
 const scenes=manifest.scenes.map(s=>({...s,startSeconds:s.startSeconds+lead}));
 if(lead)scenes.unshift({...brand.intro,id:'brand-intro',startSeconds:0});
 const audioStart=(manifest.audio?.startSeconds||0)+lead;
 const audioClips=(manifest.audioClips||[]).map(a=>({...a,startSeconds:a.startSeconds+lead}));
 let end=Math.max(lead,...scenes.map(s=>s.startSeconds+s.durationSeconds),manifest.audio?audioStart+audioDuration:0,...audioClips.map(a=>a.startSeconds+a.durationSeconds));
 if(manifest.outroEnabled&&brand?.outro){scenes.push({...brand.outro,id:'brand-outro',startSeconds:end});end+=brand.outro.durationSeconds;}
 if(end>600)fail('Scenes, branding and full voiceover must fit within ten minutes.');
 return {scenes,audioStart,audioClips,duration:Math.ceil(end*30-1e-7)/30};
}
export function layerFrame(layer,time){
 const out={x:.5,y:.5,scale:1,opacity:1,rotation:0,...layer};
 for(const property of ['x','y','scale','opacity','rotation']){
  const frames=(layer.keyframes||[]).filter(k=>k[property]!==undefined);let a={timeSeconds:0,[property]:out[property]},b=a;
  for(const k of frames){if(k.timeSeconds<=time)a=k;else{b=k;break;}b=k;}
  let u=b.timeSeconds>a.timeSeconds?Math.max(0,Math.min(1,(time-a.timeSeconds)/(b.timeSeconds-a.timeSeconds))):0;
  if(a.easing==='hold')u=u===1?1:0;else if(a.easing==='smooth')u=u*u*(3-2*u);
  out[property]=a[property]+(b[property]-a[property])*u;
 }
 return out;
}
export function sceneAt(timeline,time){return timeline.scenes.find(s=>time>=s.startSeconds&&time<s.startSeconds+s.durationSeconds);}

// Include only a profile's referenced assets when reusing it in another video.
export function assetsForBrand(brand,existing,catalog){
 const needed=new Set([brand.logoAssetId,...[brand.intro,brand.outro].flatMap(scene=>(scene?.overlays||[]).filter(layer=>layer.type==='image').map(layer=>layer.assetId))]);
 const present=new Set(existing.map(asset=>asset.id));
 return [...existing,...catalog.filter(asset=>needed.has(asset.id)&&!present.has(asset.id))];
}
