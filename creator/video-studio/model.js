import {compileAnimation} from '../map-animation-import.js';
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
function validateScene(scene,assets,mapAssets,{template=false}={}){
 keys(scene,['id','startSeconds','durationSeconds','engineType','engineData','overlays','transition'],'scene');id(scene.id);num(scene.startSeconds,0,600,'scene start');num(scene.durationSeconds,1/30,600,'scene duration');
 if(!['map','lic','graphic'].includes(scene.engineType)||template&&scene.engineType!=='graphic')fail('Use map, lic or graphic scenes (brand templates use graphic).');
 const data=scene.engineData;
 if(scene.engineType==='map'){
  keys(data,['animation','geometryReviewed'],'map engine');if(data.geometryReviewed!==undefined&&typeof data.geometryReviewed!=='boolean')fail('geometryReviewed must be boolean.');
  const compiled=compileAnimation({scenes:[],historicalMap:{version:1,theme:'night',events:[],features:{type:'FeatureCollection',features:[]},camera:[],visual:{version:1,layers:[],assets:mapAssets}}},data.animation,{geometryReviewed:data.geometryReviewed===true});
  if(Math.abs(compiled.summary.duration-scene.durationSeconds)>1e-6)fail('Map duration must match its scene.');
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
 keys(m,['schemaVersion','title','aspectRatio','fps','brandPresetId','scenes','assets','audio','introEnabled','outroEnabled'],'manifest');
 if(m.schemaVersion!==1||m.fps!==30||!['9:16','16:9'].includes(m.aspectRatio))fail('Use schemaVersion 1, fps 30 and 9:16 or 16:9.');str(m.title,200,'title');if(m.brandPresetId!==undefined)id(m.brandPresetId);
 for(const p of ['introEnabled','outroEnabled'])if(m[p]!==undefined&&typeof m[p]!=='boolean')fail(p+' must be boolean.');
 if(!Array.isArray(m.assets)||m.assets.length>200)fail('Use up to 200 asset references.');const assets=new Set();
 for(const a of m.assets){keys(a,['id','name','fileId','url','libraryId'],'asset');id(a.id);str(a.name,200,'asset name');if(assets.has(a.id))fail('Duplicate asset ID.');assets.add(a.id);
  if(['fileId','url','libraryId'].filter(k=>a[k]!==undefined).length!==1)fail('Assets need exactly one fileId, HTTPS url or libraryId.');
  if(a.url!==undefined){let u;try{u=new URL(a.url);}catch{fail('Invalid asset URL.');}if(u.protocol!=='https:'||u.username||u.password)fail('Assets require HTTPS without credentials.');}
  if(a.fileId!==undefined)id(a.fileId);if(a.libraryId!==undefined&&!mapAssets.some(item=>item.id===a.libraryId&&item.type==='image'))fail('Missing image in existing map library: '+a.libraryId);
 }
 if(!Array.isArray(m.scenes)||m.scenes.length>100)fail('Use up to 100 scenes.');let end=0;const ids=new Set();
 for(const s of m.scenes){validateScene(s,assets,mapAssets);if(ids.has(s.id))fail('Duplicate scene ID.');ids.add(s.id);if(s.startSeconds<end-1e-6)fail('Scenes must be ordered and cannot overlap.');end=s.startSeconds+s.durationSeconds;if(end>600)fail('Video exceeds ten minutes.');}
 if(m.audio!=null){keys(m.audio,['fileId','name','startSeconds','gain'],'audio');id(m.audio.fileId);str(m.audio.name,200,'audio name');num(m.audio.startSeconds,0,600,'audio start');num(m.audio.gain,0,2,'audio gain');}
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
 let end=Math.max(lead,...scenes.map(s=>s.startSeconds+s.durationSeconds),manifest.audio?audioStart+audioDuration:0);
 if(manifest.outroEnabled&&brand?.outro){scenes.push({...brand.outro,id:'brand-outro',startSeconds:end});end+=brand.outro.durationSeconds;}
 if(end>600)fail('Scenes, branding and full voiceover must fit within ten minutes.');
 return {scenes,audioStart,duration:Math.ceil(end*30-1e-7)/30};
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
