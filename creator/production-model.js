import {makeScene,parseTsv,storyboardDuration} from './storyboard-model.js?v=2';
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
 const lines=text.split(/\r?\n/);
 const separator=lines.findIndex(line=>line.includes('|')&&markdownRow(line).every(cell=>/^:?-{3,}:?$/.test(cell.replace(/\s/g,''))));
 let rows,format;
 if(separator>0){rows=[markdownRow(lines[separator-1]),...lines.slice(separator+1).filter(line=>line.trim()).map(markdownRow)];format='Markdown';}
 else {rows=parseTsv(text);format='TSV';}
 if(!rows.length)throw Error('No rows found.');
 const mapping=rows[0].map(cell=>IMPORT_FIELDS.find(key=>aliases[key].includes(norm(cell)))||'');
 const header=mapping.some(Boolean);
 let positional=false;if(!header&&rows[0].length===4){try{storyboardDuration(rows[0][3]);positional=true;}catch{}}
 if(positional)return {format,headers:['Voiceover','Visual / Animation','Assets Required','Timeline'],rows,mapping:['voiceover','visual','assets','duration']};
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
 return JSON.stringify([scene.voiceover||'',scene.visual||'',scene.timeline||scene.duration||'',scene.imagePrompt||'',scene.videoPrompt||'']);
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
export function canComplete(project,scene){return requirements(project,scene).every(task=>task.done);}
export function sceneComplete(project,scene){
 // Preserve untouched completed legacy scenes; new work must meet its declared requirements.
 return !!scene.completed&&(!scene.sceneState&&!scene.productionMethods&&!sceneAssets(project,scene).length&&!(scene.checklist||[]).length||canComplete(project,scene));
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
  for(const task of requirements(project,scene)){
   const shared=task.key.startsWith('Blender:')&&groupFor(project,scene);
   const key=task.sharedKey||(shared?'group:'+shared.id:'scene:'+scene.id)+':'+task.key;
   seen.set(key,complete||task.done);
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
