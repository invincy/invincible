const METHOD_ALIASES={blender:"Blender","3d":"Blender","3d animation":"Blender",ai:"AI Video","ai video":"AI Video","generated video":"AI Video",editing:"Editing",compositing:"Editing",assets:"Assets","existing footage":"Existing Footage",footage:"Existing Footage",mixed:"Mixed"};
export const PRODUCTION_METHODS=["Blender","AI Video","Editing","Assets","Existing Footage"];
export const WORKFLOW_STATES=["Not Started","Modeling","Animating","Rendering","Ready"];
export const SCENE_STATES=["Planned","Assets Ready","Editing","Completed"];

const clean=value=>String(value??"").replace(/^\uFEFF/,"").replace(/<br\s*\/?\s*>/gi,"\n").replace(/&vert;/gi,"|").trim();
const key=value=>clean(value).toLowerCase().replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/[_/-]+/g," ").replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
const id=()=>crypto.randomUUID?.()||("scene-"+Date.now()+"-"+Math.random().toString(36).slice(2));
const aliases={
 scene:["scene","scene no","scene number","shot","shot no","number","no"],
 timeline:["timeline","time","timecode","start end time"],
 duration:["duration","length","seconds","runtime"],
 voiceover:["voiceover","voice over","vo","narration","script","spoken line"],
 visual:["visual animation","visual","animation","visual instructions","visual direction"],
 assets:["assets required","assets","required assets","asset requirements"],
 methods:["production method","production methods","method","workflow"],
 sceneStatus:["production status","scene status","status"],
 animationGroup:["animation group","group","blender project","animation project"],
 cameraMovement:["camera movement","camera","camera direction"],
 characterPrompt:["character prompt","character reference","subject prompt"],
 imagePrompt:["image prompt","image generation prompt","still prompt"],
 videoPrompt:["video prompt","video generation prompt","motion prompt"],
 blenderPrompt:["blender prompt","codex prompt","blender codex animation prompt","animation codex prompt"],
 technicalNotes:["technical notes","notes","production notes"]
};
export const IMPORT_FIELDS=[
 ["scene","Scene"],["timeline","Timeline"],["duration","Duration"],["voiceover","Voiceover"],
 ["visual","Visual / Animation"],["assets","Assets Required"],["methods","Production Method"],
 ["sceneStatus","Status"],["animationGroup","Animation Group"],["cameraMovement","Camera Movement"],
 ["characterPrompt","Character Prompt"],["imagePrompt","Image Prompt"],["videoPrompt","Video Prompt"],
 ["blenderPrompt","Blender Prompt"],["technicalNotes","Technical Notes"]
];

function findHeader(headers,names){return headers.findIndex(header=>names.some(name=>header===name||header.startsWith(name+" ")||header.endsWith(" "+name)));}
export function mapHeaders(headers){
 const normalized=headers.map(key);
 return Object.fromEntries(Object.entries(aliases).map(([field,names])=>[field,findHeader(normalized,names)]));
}
export function normalizeMethods(value){
 const raw=Array.isArray(value)?value:String(value||"").split(/[,;+&]|\band\b|\//i);
 const found=[];
 for(const item of raw){
  const normalized=key(item);
  if(!normalized)continue;
  if(normalized==="mixed"){for(const method of ["Blender","AI Video","Editing"])if(!found.includes(method))found.push(method);continue;}
  const method=METHOD_ALIASES[normalized]||PRODUCTION_METHODS.find(name=>key(name)===normalized);
  if(method&&!found.includes(method))found.push(method);
 }
 return found;
}
function secondsPart(value){return String(value).replace(/\s*(?:s|sec|secs|seconds?)\s*$/i,"").split(":").reduce((sum,part)=>sum*60+Number(part),0);}
export function parseTiming(value){
 const text=clean(value);
 if(!text)return {timeline:"",duration:0};
 const range=text.match(/^(\d+(?::[0-5]?\d){0,2}(?:\.\d+)?)\s*(?:s|sec)?\s*[-–—−]\s*(\d+(?::[0-5]?\d){0,2}(?:\.\d+)?)\s*(?:s|sec)?$/i);
 if(range){
  const duration=secondsPart(range[2])-secondsPart(range[1]);
  if(!(duration>0))throw Error("Timeline end must be after its start.");
  return {timeline:text,duration};
 }
 const clock=text.match(/^(\d+):([0-5]?\d)$/);
 const duration=clock?Number(clock[1])*60+Number(clock[2]):Number.parseFloat(text);
 if(!Number.isFinite(duration)||duration<=0)throw Error('Use a valid duration such as "8 sec" or timeline such as "0–8s".');
 return {timeline:"",duration};
}
function normalizeChecklist(value={}){
 return {assetReady:!!value.assetReady,modelingComplete:!!value.modelingComplete,animationComplete:!!value.animationComplete,renderingComplete:!!value.renderingComplete,voiceoverReady:!!value.voiceoverReady,editingComplete:!!value.editingComplete,...value};
}
function normalizeWorkflow(value={}){
 const result={Blender:"Not Started","AI Video":"Not Started",Editing:"Not Started",Assets:"Not Started","Existing Footage":"Not Started",...value};
 for(const method of Object.keys(result))if(!WORKFLOW_STATES.includes(result[method]))result[method]="Not Started";
 return result;
}
export function makeProductionScene(data={}){
 const methods=normalizeMethods(data.productionMethods||data.methods||data.productionMethod);
 const legacyComplete=!!data.completed;
 return {...data,
  id:data.id||id(),
  timeline:data.timeline||"",
  duration:Number(data.duration)||parseTiming(data.timeline||"").duration||5,
  voiceover:data.voiceover||"",
  visual:data.visual||data.visualAnimation||"",
  assets:data.assets||data.assetsRequired||"",
  productionMethods:methods,
  sceneStatus:SCENE_STATES.includes(data.sceneStatus)?data.sceneStatus:(legacyComplete?"Completed":"Planned"),
  animationGroupId:data.animationGroupId||"",
  animationGroup:data.animationGroup||"",
  cameraMovement:data.cameraMovement||"",
  characterPrompt:data.characterPrompt||"",
  imagePrompt:data.imagePrompt||"",
  videoPrompt:data.videoPrompt||"",
  blenderPrompt:data.blenderPrompt||"",
  technicalNotes:data.technicalNotes||"",
  assetRefs:Array.isArray(data.assetRefs)?data.assetRefs:[],
  productionChecklist:normalizeChecklist(data.productionChecklist),
  workflowProgress:normalizeWorkflow(data.workflowProgress),
  completed:legacyComplete||data.sceneStatus==="Completed",
  skipped:!!data.skipped
 };
}
function splitMarkdownRow(line){
 let source=line.trim();if(source.startsWith("|"))source=source.slice(1);if(source.endsWith("|"))source=source.slice(0,-1);
 const cells=[];let cell="",escaped=false;
 for(const char of source){if(escaped){cell+=char;escaped=false}else if(char==="\\")escaped=true;else if(char==="|"){cells.push(clean(cell));cell=""}else cell+=char}
 cells.push(clean(cell));return cells;
}
function parseQuotedTsv(text){
 const rows=[];let row=[],cell="",quoted=false,closed=false;const source=String(text).replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n");
 for(let i=0;i<source.length;i++){
  const char=source[i];
  if(quoted){if(char==='"'&&source[i+1]==='"'){cell+='"';i++}else if(char==='"'){quoted=false;closed=true}else cell+=char}
  else if(char==='"'&&!cell&&!closed)quoted=true;
  else if(char==="\t"||char==="\n"){row.push(cell);cell="";closed=false;if(char==="\n"){rows.push(row);row=[]}}
  else{if(closed&&!/\s/.test(char))throw Error("Unexpected text after a quoted cell.");cell+=char}
 }
 if(quoted)throw Error("A quoted cell is incomplete.");
 row.push(cell);rows.push(row);
 return rows.filter(row=>row.some(value=>clean(value)));
}
export function inspectImport(input){
 const text=String(input||"").trim().replace(/^\x60\x60\x60(?:tsv|text|markdown|md)?\s*\n([\s\S]*?)\n\x60\x60\x60$/i,"$1");
 if(!text)throw Error("Paste a storyboard or voiceover first.");
 const markdown=text.split(/\r?\n/).filter(line=>line.trim()&&line.includes("|"));
 if(markdown.length>=2){
  const rows=markdown.map(splitMarkdownRow);
  const headerIndex=rows.findIndex(row=>Object.values(mapHeaders(row)).some(index=>index>=0));
  if(headerIndex>=0){const selected=rows.slice(headerIndex);if(selected[1]?.every(cell=>/^:?-{3,}:?$/.test(cell.replace(/\s/g,""))))selected.splice(1,1);return {format:"markdown",headers:selected[0],rows:selected.slice(1)}}
 }
 if(text.includes("\t")){
  const rows=parseQuotedTsv(text),mapped=mapHeaders(rows[0]),hasHeader=Object.values(mapped).some(index=>index>=0);
  if(hasHeader)return {format:"tsv",headers:rows[0].map(clean),rows:rows.slice(1)};
  if(rows.every(row=>row.length===4))return {format:"tsv",headers:["Voiceover","Visual / Animation","Assets Required","Timeline"],rows};
  return {format:"tsv",headers:rows[0].map((_,index)=>"Column "+(index+1)),rows:rows.slice(1)};
 }
 const paragraphs=text.split(/\n\s*\n/).map(clean).filter(Boolean);
 return {format:"voiceover",headers:["Voiceover"],rows:paragraphs.map(value=>[value])};
}
function mappedValue(row,mapping,field){const index=Number(mapping[field]);return index>=0?clean(row[index]):"";}
export function parseProductionStoryboard(input,options={}){
 const inspected=inspectImport(input);
 const automatic=mapHeaders(inspected.headers);
 const mapping={...automatic,...(options.mapping||{})};
 if(inspected.format==="voiceover")mapping.voiceover=0;
 if(mapping.voiceover<0)throw Error("Map at least a Voiceover column.");
 const scenes=inspected.rows.filter(row=>row.some(value=>clean(value))).map((row,index)=>{
  const timing=mappedValue(row,mapping,"timeline")||mappedValue(row,mapping,"duration");
  let parsed={timeline:"",duration:0};if(timing)try{parsed=parseTiming(timing)}catch(error){throw Error("Scene "+(index+1)+": "+error.message)}
  return makeProductionScene({
   sourceSceneNumber:mappedValue(row,mapping,"scene")||String(index+1),
   ...parsed,
   voiceover:mappedValue(row,mapping,"voiceover"),
   visual:mappedValue(row,mapping,"visual"),
   assets:mappedValue(row,mapping,"assets"),
   productionMethods:normalizeMethods(mappedValue(row,mapping,"methods")),
   sceneStatus:mappedValue(row,mapping,"sceneStatus")||"Planned",
   animationGroup:mappedValue(row,mapping,"animationGroup"),
   cameraMovement:mappedValue(row,mapping,"cameraMovement"),
   characterPrompt:mappedValue(row,mapping,"characterPrompt"),
   imagePrompt:mappedValue(row,mapping,"imagePrompt"),
   videoPrompt:mappedValue(row,mapping,"videoPrompt"),
   blenderPrompt:mappedValue(row,mapping,"blenderPrompt"),
   technicalNotes:mappedValue(row,mapping,"technicalNotes")
  });
 });
 if(!scenes.length)throw Error("No scene rows were found.");
 return {...inspected,mapping,scenes};
}
export function sceneFingerprint(scene){
 return [scene.voiceover,scene.timeline,scene.visual].map(value=>key(value)).join("::");
}
export function findDuplicates(incoming,existing=[]){
 const seen=new Set(existing.map(sceneFingerprint)),duplicates=[];
 incoming.forEach((scene,index)=>{const fingerprint=sceneFingerprint(scene);if(seen.has(fingerprint))duplicates.push(index);seen.add(fingerprint)});
 return duplicates;
}
export function sceneIsComplete(scene){
 const methods=normalizeMethods(scene.productionMethods);
 const workflow=scene.workflowProgress||{};
 const productionReady=methods.every(method=>(workflow[method]||"Not Started")==="Ready");
 const checklist=scene.productionChecklist||{};
 const editReady=!methods.includes("Editing")||checklist.editingComplete||workflow.Editing==="Ready";
 return scene.sceneStatus==="Completed"&&productionReady&&editReady;
}
export function projectProgress(project={}){
 const scenes=(project.scenes||[]).map(makeProductionScene);if(!scenes.length)return 0;
 let earned=0,total=0;
 for(const scene of scenes){
  total+=2;earned+=scene.sceneStatus==="Planned"?0:scene.sceneStatus==="Assets Ready"?0.65:scene.sceneStatus==="Editing"?1.25:2;
  for(const method of scene.productionMethods){total++;const state=scene.workflowProgress[method];earned+=state==="Not Started"?0:state==="Ready"?1:0.5}
 }
 return Math.round(earned/Math.max(total,1)*100);
}
export function buildCanonicalScript(scenes=[]){return scenes.map(scene=>String(scene.voiceover||"").trim()).filter(Boolean).join("\n\n");}
