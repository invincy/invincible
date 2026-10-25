import {makeScene,parseTsv,storyboardDuration} from './storyboard-model.js?v=3';
export const METHODS=['Blender','AI Video','Existing Footage','Editing'];
export const SCENE_STATES=['Planned','Assets Ready','Editing','Completed'];
export const uid=()=>globalThis.crypto?.randomUUID?.()||String(Date.now()+Math.random());
const norm=value=>String(value??'').toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases={
 voiceover:['voiceover','vo','narration','script'],visual:['visual','visualanimation','animation','visualinstructions'],
 assets:['assets','assetsrequired','requiredassets'],duration:['duration','timeline','time','seconds','durationseconds'],
 scene:['scene','sceneno','scenenumber'],characterPrompt:['characterprompt'],imagePrompt:['imageprompt','imagegenerationprompt'],
 videoPrompt:['videoprompt','videogenerationprompt'],blenderPrompt:['blenderprompt','codexprompt','animationprompt'],
 productionMethods:['productionmethod','productionmethods','method'],productionStatus:['productionstatus','status'],
 voiceoverTimestamp:['timestamp','timestamps','voiceovertimestamp','voiceovertimestamps','audiotimestamp','audiotimestamps','votimestamp','timecode','audiotimecode','exacttimestamp'],
 animationGroup:['animationgroup','group'],camera:['camera','cameramovement'],technicalNotes:['technicalnotes','notes']
};
export const IMPORT_FIELDS=Object.keys(aliases);
export function methodsOf(scene){
 const source=scene.productionMethods??scene.productionMethod??[];
 const list=Array.isArray(source)?source:String(source).split(/[,;+|/]/);
 const result=METHODS.filter(method=>list.some(value=>norm(value)===norm(method)));
 if(list.some(value=>norm(value)==='mixed'))for(const method of ['Blender','AI Video','Editing'])if(!result.includes(method))result.push(method);
 return result;
}
function markdownRow(line){
 let value=line.trim().replace(/^\|/,'').replace(/(?<!\\)\|$/,'');
 return value.split(/(?<!\\)\|/).map(cell=>cell.replace(/\\\|/g,'|').replace(/<br\s*\/?\s*>/gi,'\n').trim());
}
export function inspectImport(input){
 const text=String(input).replace(/^\uFEFF/,'').replace(/^\n+|\n+$/g,'').replace(/^\x60\x60\x60[^\n]*\n/,'').replace(/\n\x60\x60\x60$/,'');
 if(!text)throw Error('Paste a storyboard first.');
 if(/^[\\[{]/.test(text.trimStart())){
  let data;try{data=JSON.parse(text);}catch{throw Error("The JSON is incomplete or invalid.");}
  const items=Array.isArray(data)?data:data.scenes;
  if(!Array.isArray(items)||!items.length||items.some(item=>!item||typeof item!=="object"||Array.isArray(item)))throw Error("JSON must contain a non-empty array of scene objects.");
  const headers=[...new Set(items.flatMap(item=>Object.keys(item)))];
  return {format:"JSON",headers,rows:items.map(item=>headers.map(key=>Array.isArray(item[key])?item[key].join("; "):String(item[key]??""))),mapping:headers.map(key=>IMPORT_FIELDS.find(field=>aliases[field].includes(norm(key)))||"")};
 }
 const lines=text.split(/\r?\n/);
 const separator=lines.findIndex(line=>line.includes('|')&&markdownRow(line).every(cell=>/^:?-{3,}:?$/.test(cell.replace(/\s/g,''))));
 let rows,format;
 if(separator>0){rows=[markdownRow(lines[separator-1]),...lines.slice(separator+1).filter(line=>line.trim()).map(markdownRow)];format='Markdown';}
 else {rows=parseTsv(text);format='TSV';}
 if(!rows.length)throw Error('No rows found.');
 const mapping=rows[0].map(cell=>IMPORT_FIELDS.find(key=>aliases[key].includes(norm(cell)))||'');
 const header=mapping.some(Boolean);
 let positional=false;if([4,5].includes(rows[0].length)){try{storyboardDuration(rows[0][3]);positional=true;}catch{}}
 if(positional){const timed=rows[0].length===5;return {format,headers:['Voiceover','Visual / Animation','Assets Required','Timeline',...(timed?['Timestamp']:[])],rows,mapping:['voiceover','visual','assets','duration',...(timed?['voiceoverTimestamp']:[])]};}
 if(!header&&rows[0].length===1)return {format:'Voiceover',headers:['Voiceover'],rows,mapping:['voiceover']};
 return {format,headers:rows[0],rows:rows.slice(1),mapping};
}
export function parseProductionImport(input,mappingOverride){
 const table=inspectImport(input),mapping=mappingOverride||table.mapping;
 if(!mapping.includes('voiceover'))throw Error('Map a Voiceover column before importing.');
 const fields=mapping.filter(Boolean);
 if(new Set(fields).size!==fields.length)throw Error('Map each field only once.');
 if(!table.rows.length)throw Error('Add at least one scene.');
 return table.rows.map((row,index)=>{
  if(row.length!==table.headers.length)throw Error('Row '+(index+1)+': column count differs. Use quoted TSV cells or <br> in Markdown for line breaks.');
  const data={};
  mapping.forEach((field,i)=>{if(field)data[field]=row[i]??'';});
  const timing=data.duration;
  if(timing){try{data.duration=storyboardDuration(timing);}catch(error){throw Error('Row '+(index+1)+': '+error.message);}if(/[-–—−]/.test(timing))data.timeline=timing;}
  data.productionMethods=methodsOf(data);
  const status=norm(data.productionStatus);
  // Imported completion is deliberately reviewed in the workbench, never trusted as proof of finished tasks.
  data.importedStatus=data.productionStatus||'';
  data.sceneState='Planned';
  data.production={};
  for(const method of data.productionMethods)data.production[method]=status==='rendered'?{rendering:true}:status==='inprogress'?{started:true}:{};
  return makeScene(data);
 });
}
export function fingerprint(scene){
 return JSON.stringify([scene.voiceover||'',scene.visual||'',scene.assets||'',scene.timeline||scene.duration||'',scene.characterPrompt||'',scene.imagePrompt||'',scene.videoPrompt||'',scene.blenderPrompt||'',scene.camera||'',scene.technicalNotes||'',scene.voiceoverTimestamp||'']);
}
export function uniqueScenes(existing,incoming){
 const seen=new Set(existing.map(fingerprint));let duplicates=0;
 const scenes=incoming.filter(scene=>{const key=fingerprint(scene);if(seen.has(key)){duplicates++;return false;}seen.add(key);return true;});
 return {scenes,duplicates};
}
export function groupFor(project,scene){return (project.animationGroups||[]).find(group=>group.id===scene.animationGroupId);}
export function taskFor(project,scene,method){
 return (method==='Blender'&&groupFor(project,scene)?groupFor(project,scene).production:scene.production?.[method])||{};
}
export function setTask(project,scene,method,patch){
 if(method==='Blender'&&groupFor(project,scene)){const group=groupFor(project,scene);group.production={...group.production,...patch};}
 else {scene.production={...scene.production,[method]:{...scene.production?.[method],...patch}};}
 if(Object.values(patch).some(value=>value===false)){
  const group=method==='Blender'&&groupFor(project,scene);
  for(const item of project.scenes||[])if(item.id===scene.id||(group&&item.animationGroupId===group.id))item.completed=false;
 }
 // Never complete a scene as a side effect of producing an asset.
}
export function animationStage(task){
 if(task.ready)return 'Ready';if(task.rendering)return 'Rendering';if(task.animation)return 'Rendering';if(task.modeling)return 'Animating';if(task.started)return 'Modeling';return 'Not Started';
}
export function sceneAssets(project,scene){
 const group=groupFor(project,scene);
 return (project.assets||[]).filter(asset=>(asset.sceneIds||[]).includes(scene.id)||(group&&(asset.groupIds||[]).includes(group.id)));
}
export function requirements(project,scene){
 const tasks=methodsOf(scene).filter(method=>method!=='Editing').flatMap(method=>{
  const task=taskFor(project,scene,method);
  return method==='Blender'?['modeling','animation','rendering','ready'].map(key=>({key:method+':'+key,done:!!task[key]})):[{key:method,done:!!task.ready}];
 });
 if(!scene.productionMethods&&!scene.productionMethod){
  for(const [prompt,flag] of [['characterPrompt','characterDone'],['imagePrompt','imageDone'],['videoPrompt','videoDone']]){
   if(scene[prompt]&&!['—','-','none','n/a'].includes(scene[prompt].trim().toLowerCase()))tasks.push({key:'Legacy '+prompt,done:!!scene[flag]});
  }
 }
 for(const asset of sceneAssets(project,scene))tasks.push({key:'Asset: '+asset.name,sharedKey:'asset:'+asset.id,done:asset.status==='Ready'});
 tasks.push({key:'Voiceover',done:!!scene.voiceoverReady},{key:'Editing',done:!!scene.editingDone});
 for(const item of scene.checklist||[])tasks.push({key:item.text,done:!!item.done});
 return tasks;
}
// Advisory readiness only; never a prerequisite for manual scene completion.
export function canComplete(project,scene){return requirements(project,scene).every(task=>task.done);}
export function sceneComplete(project,scene){
 // Explicit completion is the creator’s decision; task and asset tracking is optional.
 return !!scene.completed;
}
export function sceneState(project,scene){
 if(sceneComplete(project,scene))return 'Completed';
 if(scene.editingDone||scene.sceneState==='Editing')return 'Editing';
 const assets=requirements(project,scene).filter(task=>!['Voiceover','Editing'].includes(task.key));
 return assets.length&&assets.every(task=>task.done)?'Assets Ready':'Planned';
}
export function projectProgress(project){
 const seen=new Map();
 for(const scene of project.scenes||[]){
  const complete=sceneComplete(project,scene);
  // Completed scenes need no task bookkeeping; pending scenes still count real work.
  for(const task of complete?[]:requirements(project,scene)){
   const shared=task.key.startsWith('Blender:')&&groupFor(project,scene);
   const key=task.sharedKey||(shared?'group:'+shared.id:'scene:'+scene.id)+':'+task.key;
   seen.set(key,task.done);
  }
  seen.set('complete:'+scene.id,complete);
 }
 return seen.size?Math.round([...seen.values()].filter(Boolean).length/seen.size*100):0;
}
export function queueScenes(project,workspace){
 return (project.scenes||[]).filter(scene=>workspace==='All'||(workspace==='Editing'?scene.needsEditing!==false:workspace==='Assets'?!!scene.assets||sceneAssets(project,scene).length>0:methodsOf(scene).includes(workspace)));
}
export function canonicalScript(project){return (project.scenes||[]).map(scene=>scene.voiceover||'').join('\n\n');}
export function scriptReview(project,draft){
 const parts=String(draft).split(/\n\s*\n/);
 if(parts.length!==project.scenes.length)throw Error('Use one paragraph per scene. Expected '+project.scenes.length+' paragraphs; found '+parts.length+'.');
 return project.scenes.map((scene,index)=>({id:scene.id,before:scene.voiceover,after:parts[index],changed:scene.voiceover!==parts[index]}));
}

export function attachImportedGroups(project,scenes){
 for(const scene of scenes){
  if(!scene.animationGroup||scene.animationGroupId)continue;
  project.animationGroups||=[];
  let group=project.animationGroups.find(group=>group.name===scene.animationGroup);
  if(!group){group={id:uid(),name:scene.animationGroup,blenderFile:'',resources:'',production:{}};project.animationGroups.push(group);}
  scene.animationGroupId=group.id;
 }
}

export function productionReadiness(project,scene,method='All'){
 if(method==='Editing')return scene.editingDone?'Ready':scene.sceneState==='Editing'?'In Progress':'Not Started';
 const methods=method==='All'||method==='Assets'?methodsOf(scene).filter(value=>value!=='Editing'):[method];
 const stages=methods.map(value=>animationStage(taskFor(project,scene,value)));
 const linked=sceneAssets(project,scene);
 if(linked.length)stages.push(...linked.map(asset=>asset.status==='Ready'?'Ready':asset.status==='In Progress'?'In Progress':'Not Started'));
 if(!stages.length){
  const legacy=requirements(project,scene).filter(task=>task.key.startsWith('Legacy '));
  return legacy.length&&legacy.every(task=>task.done)?'Ready':legacy.some(task=>task.done)?'In Progress':'Not Started';
 }
 if(stages.every(stage=>stage==='Ready'))return 'Ready';
 if(stages.every(stage=>stage==='Not Started'))return 'Not Started';
 for(const stage of ['Rendering','Animating','Modeling'])if(stages.includes(stage))return stage;
 return 'In Progress';
}
export function filterScenes(project,{method='All',assetStatus='All',completion='All',query=''}={}){
 const text=query.trim().toLocaleLowerCase();
 return queueScenes(project,method).filter(scene=>{
  const readiness=productionReadiness(project,scene,method);
  if(assetStatus!=='All'&&(assetStatus==='In Progress'?!['Modeling','Animating','Rendering','In Progress'].includes(readiness):readiness!==assetStatus))return false;
  if(completion!=='All'&&sceneState(project,scene)!==completion)return false;
  const group=groupFor(project,scene);
  return !text||[scene.voiceover,scene.voiceoverTimestamp,scene.timeline,scene.visual,scene.assets,scene.blenderFile,scene.blenderPrompt,group?.name,group?.blenderFile].join(' ').toLocaleLowerCase().includes(text);
 });
}
