import {validateManifest} from './model.js?v=2026111813';
import {applyStylePreset as applyVisualStyle,getStylePreset,listStylePresets,updateSavedStylePreset} from './style-presets.js?v=2026111813';
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const fail=(code,message)=>{throw Object.assign(Error(message),{code});};
// Objects merge recursively; ID arrays merge by ID. Destruction is explicit.
export function mergeSceneChanges(base,changes,path='changes'){
 if(object(changes)){
  if(Object.hasOwn(changes,'$replace')){
   if(Object.keys(changes).length!==1)fail('INVALID_PATCH',path+': $replace must stand alone.');
   return structuredClone(changes.$replace);
  }
  const out=object(base)?structuredClone(base):{};
  for(const [key,value] of Object.entries(changes)){
   if(['__proto__','prototype','constructor'].includes(key))fail('INVALID_PATCH','Unsafe patch key.');
   out[key]=mergeSceneChanges(out[key],value,path+'.'+key);
  }
  return out;
 }
 if(Array.isArray(changes)){
  if(!changes.length)return structuredClone(base??[]);
  if(!changes.every(row=>object(row)&&typeof row.id==='string'))fail('INVALID_PATCH',path+': use {$replace: [...]} for arrays without IDs.');
  const out=structuredClone(base??[]),seen=new Set();
  if(!Array.isArray(out))fail('INVALID_PATCH',path+': target is not an array.');
  for(const row of changes){if(seen.has(row.id))fail('INVALID_PATCH','Duplicate patch ID: '+row.id);seen.add(row.id);const index=out.findIndex(item=>item.id===row.id);if(index<0)out.push(structuredClone(row));else out[index]=mergeSceneChanges(out[index],row,path+'['+row.id+']');}
  return out;
 }
 return structuredClone(changes);
}
export function prepareAgentUpdate(current,input,{revision,mapAssets=[]}={}){
 const payload=typeof input==='string'?JSON.parse(input):structuredClone(input);
 if(!object(payload))fail('INVALID_PAYLOAD','Provide a manifest or scene patch.');
 if(payload.expectedRevision!==undefined&&payload.expectedRevision!==revision)fail('REVISION_CONFLICT','Project revision changed. Read it again before applying.');
 let next;
 if(Object.hasOwn(payload,'patchSceneId')){
  for(const key of Object.keys(payload))if(!['patchSceneId','changes','expectedRevision'].includes(key))fail('INVALID_PATCH','Unsupported patch field: '+key);
  if(!object(payload.changes))fail('INVALID_PATCH','changes must be an object.');
  const index=current.scenes.findIndex(scene=>scene.id===payload.patchSceneId);
  if(index<0)fail('INVALID_TARGET','Scene does not exist: '+payload.patchSceneId);
  next=structuredClone(current);const scene=next.scenes[index];
  // Detach a shared source before editing one scene, never edit its siblings.
  if(scene.engineData.sourceId&&payload.changes.engineData?.project){
   scene.engineData.project=structuredClone(next.mapSources.find(source=>source.id===scene.engineData.sourceId).project);
   delete scene.engineData.sourceId;
  }
  next.scenes[index]=mergeSceneChanges(scene,payload.changes);
  if(next.scenes[index].id!==scene.id)fail('INVALID_PATCH','A scene patch cannot change its ID.');
 }else{next=payload;delete next.expectedRevision;}
 return validateManifest(next,{mapAssets});
}
export function sceneSummary(manifest){
 return manifest.scenes.map(scene=>{
  const project=scene.engineData.project||manifest.mapSources?.find(source=>source.id===scene.engineData.sourceId)?.project;
  const visual=project?.historicalMap?.visual;
  return {id:scene.id,name:scene.name||scene.id,startSeconds:scene.startSeconds,durationSeconds:scene.durationSeconds,engineType:scene.engineType,layerCount:(scene.overlays?.length||0)+(visual?.layers?.length||scene.engineData.animation?.layers?.length||0),mapAssetStatus:scene.engineType!=='map'?'not-applicable':project?'inline-native':scene.engineData.animation?'animation':'missing',validationStatus:'schema-valid'};
 });
}
export function createAgentOperations({authorize,getManifest,getSavedManifest=getManifest,getRevision,getMapAssets=()=>[],getAvailableAssets=()=>[],checkResources=async()=>{},save,read=async()=>{},isBlocked=()=>false}){
 let writing=false;
 const result=async fn=>{try{await authorize();return await fn();}catch(error){return {ok:false,errors:[{code:error.code||'VALIDATION_ERROR',message:error.message}]};}};
 return {
  getProjectJSON:()=>result(async()=>{await read();await authorize();return {ok:true,revision:getRevision(),manifest:structuredClone(getSavedManifest()),staged:JSON.stringify(getSavedManifest())!==JSON.stringify(getManifest()),assets:structuredClone(getSavedManifest().assets),availableAssets:structuredClone(getAvailableAssets()),audioTiming:structuredClone(getSavedManifest().audioClips||getSavedManifest().audio||[])};}),
  getSceneSummary:()=>result(async()=>({ok:true,revision:getRevision(),scenes:sceneSummary(validateManifest(getManifest(),{mapAssets:getMapAssets()}))})),
  listStylePresets:()=>result(async()=>({ok:true,revision:getRevision(),presets:listStylePresets(getManifest()).map(({id,name,category,description,custom=false})=>({id,name,category,description,custom}))})),
  getStylePreset:id=>result(async()=>({ok:true,revision:getRevision(),preset:getStylePreset(getManifest(),id)})),
  validateJSON:payload=>result(async()=>{const manifest=prepareAgentUpdate(getManifest(),payload,{revision:getRevision(),mapAssets:getMapAssets()});await checkResources(manifest);await authorize();return {ok:true,revision:getRevision(),manifest,scenes:sceneSummary(manifest)};}),
  applyPatch:payload=>result(async()=>{
   if(writing||isBlocked())fail('BUSY','Finish or discard the pending editor change first.');
   writing=true;
   try{const revision=getRevision(),snapshot=JSON.stringify(getManifest()),manifest=prepareAgentUpdate(getManifest(),payload,{revision,mapAssets:getMapAssets()});await checkResources(manifest);await authorize();if(revision!==getRevision()||snapshot!==JSON.stringify(getManifest()))fail('REVISION_CONFLICT','Project changed during validation.');await save(manifest);return {ok:true,revision:getRevision(),scenes:sceneSummary(getManifest())};}finally{writing=false;}
  }),
  applyStylePreset:payload=>result(async()=>{
   if(writing||isBlocked())fail('BUSY','Finish or discard the pending editor change first.');if(payload?.expectedRevision!==getRevision())fail('REVISION_CONFLICT','Project revision changed. Read it again before applying.');writing=true;
   try{const revision=getRevision(),snapshot=JSON.stringify(getManifest()),manifest=applyVisualStyle(getManifest(),payload.presetId,{sceneId:payload.sceneId||null});await checkResources(manifest);await authorize();if(revision!==getRevision()||snapshot!==JSON.stringify(getManifest()))fail('REVISION_CONFLICT','Project changed during validation.');await save(manifest);return{ok:true,revision:getRevision(),presetId:payload.presetId,sceneId:payload.sceneId||null};}finally{writing=false;}
  }),
  updateStylePreset:payload=>result(async()=>{
   if(writing||isBlocked())fail('BUSY','Finish or discard the pending editor change first.');if(payload?.expectedRevision!==getRevision())fail('REVISION_CONFLICT','Project revision changed. Read it again before updating.');writing=true;
   try{const revision=getRevision(),snapshot=JSON.stringify(getManifest()),manifest=updateSavedStylePreset(getManifest(),payload.preset);await checkResources(manifest);await authorize();if(revision!==getRevision()||snapshot!==JSON.stringify(getManifest()))fail('REVISION_CONFLICT','Project changed during validation.');await save(manifest);return{ok:true,revision:getRevision(),preset:getStylePreset(manifest,payload.preset.id)};}finally{writing=false;}
  })
 };
}
