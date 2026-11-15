import {emptyVideo,PRESETS,compileTimeline,validateManifest} from './video-studio/model.js?v=2026111112';
import {createStudioRenderer} from './video-studio/adapters.js?v=2026111014';

function timing(scene){const match=String(scene.timeline||'').match(/([0-9.]+)\s*[-–—]\s*([0-9.]+)/);const start=Number.isFinite(Number(scene.startSeconds))?Number(scene.startSeconds):(match?Number(match[1]):null);const seconds=Number(scene.durationSeconds)>0?Number(scene.durationSeconds):Number(scene.duration)>0?Number(scene.duration):match?Number(match[2])-Number(match[1]):2;return {start,seconds};}
export async function renderAiScenePreviews(scenes,{width=540,height=960,mapAssets=[]}={}){
 if(!Array.isArray(scenes)||!scenes.length)throw Error('There are no approved scenes to preview.');
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 let availableMapAssets=[...mapAssets];
 if(scenes.some(scene=>scene.mapAnimation)&&!availableMapAssets.length){try{const response=await fetch('./asset-libraries/historical-army-commanders-v1.json',{cache:'no-store'});if(response.ok){const catalog=await response.json();availableMapAssets=[...(catalog.assets||[])];}}catch{}}
 const manifest=compileAiStoryboardManifest(scenes,{aspectRatio:width>height?'16:9':'9:16',mapAssets:availableMapAssets});
 const brand=structuredClone(PRESETS[0]);const timeline=compileTimeline(manifest,brand);const renderer=await createStudioRenderer(canvas,manifest,timeline,brand,{getFile:async()=>null,mapAssets:availableMapAssets});
 const results=[];try{for(const scene of timeline.scenes){const sample=Math.min(scene.startSeconds+Math.min(.6,scene.durationSeconds*.35),scene.startSeconds+scene.durationSeconds-1/30);await renderer.draw(sample,{exporting:true});const blob=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(Error('Preview capture failed.')),'image/jpeg',.92));results.push({sceneId:scene.id,timeSeconds:sample,blob,durationSeconds:scene.durationSeconds});}}finally{renderer.destroy();}
 return results;
}

export function compileAiStoryboardManifest(storyboard,{aspectRatio='9:16',audioFileId=null,audioName='voiceover.mp3',audioDuration=null,mapAssets=[],allowContextCards=false}={}){
 if(!Array.isArray(storyboard)||!storyboard.length)throw Error('Storyboard contains no scenes.');
 const manifest={...emptyVideo(),schemaVersion:2,title:'Invincible AI production',aspectRatio,audio:null,audioClips:[],scenes:[]};let cursor=0;
 const transition={type:'cut',durationSeconds:0};
 const documentaryFrame=title=>[
  {id:'frame-top',type:'line',x:.5,y:.075,width:.84,rotation:0,lineWidth:2,color:'#E1C65B',opacity:.72},
  {id:'frame-bottom',type:'line',x:.5,y:.925,width:.84,rotation:0,lineWidth:2,color:'#E1C65B',opacity:.72},
  {id:'frame-left',type:'line',x:.08,y:.5,width:1.7,rotation:90,lineWidth:2,color:'#E1C65B',opacity:.72},
  {id:'frame-right',type:'line',x:.92,y:.5,width:1.7,rotation:90,lineWidth:2,color:'#E1C65B',opacity:.72},
  ...(String(title||'').trim()?[
   {id:'title-plaque',type:'rectangle',x:.5,y:.135,width:.74,height:.075,color:'#0D2732',opacity:.92},
   {id:'title',type:'text',text:String(title).slice(0,120),x:.5,y:.135,width:.68,fontFamily:'Invincible Sans',fontSize:48,fontWeight:700,color:'#F4F5F7'}
  ]:[])
 ];
 function addCard(id,startSeconds,durationSeconds,text){
  manifest.scenes.push({id,name:text,startSeconds,durationSeconds,engineType:'graphic',engineData:{},transition,overlays:[...documentaryFrame('MAP REVIEW NEEDED'),
   {id:'context',type:'text',text,x:.5,y:.48,fontSize:54,color:'#F4F5F7'},
   {id:'caption',type:'text',text:'Historical context',x:.5,y:.55,fontSize:30,color:'#E1C65B'}
  ]});
 }
 function addCanvas(id,startSeconds,durationSeconds,row){
  const idea=row.canvasScene,accent=/^#[0-9a-f]{6}$/i.test(idea.accentColor||'')?idea.accentColor:'#61D6D1',enter=Math.min(.8,Math.max(1/60,durationSeconds*.35));
  const first={timeSeconds:0,opacity:0,easing:'smooth'},last={timeSeconds:enter,opacity:1,easing:'smooth'};
  if(idea.motion==='rise'){first.y=.58;last.y=.48;}else if(idea.motion==='pan-left'){first.x=.65;last.x=.5;}else if(idea.motion==='pan-right'){first.x=.35;last.x=.5;}else if(idea.motion==='zoom-in'){first.scale=.72;last.scale=1;}
  const overlays=documentaryFrame(idea.title).map(layer=>['title-plaque','title'].includes(layer.id)?{...layer,keyframes:[first,last]}:layer);
  const appear=(delay=.15)=>[{timeSeconds:0,opacity:0,easing:'hold'},{timeSeconds:Math.min(durationSeconds-.01,Math.max(1/60,enter+delay)),opacity:1,easing:'smooth'}];
  const add=(layer)=>overlays.push(layer);
  if(idea.presetId==='pressure-driven-flow'){
   add({id:'high-zone',type:'circle',x:.25,y:.47,width:.22,height:.22,color:'#3278A8',opacity:.72,keyframes:appear()});
   add({id:'high-label',type:'text',text:'H',x:.25,y:.47,fontSize:58,fontWeight:700,color:'#F4F5F7',keyframes:appear()});
   add({id:'low-zone',type:'circle',x:.75,y:.47,width:.22,height:.22,color:'#B5524A',opacity:.72,keyframes:appear(.25)});
   add({id:'low-label',type:'text',text:'L',x:.75,y:.47,fontSize:58,fontWeight:700,color:'#F4F5F7',keyframes:appear(.25)});
   for(const [i,y] of [.42,.47,.52].entries())add({id:`flow-${i}`,type:'arrow',x:.5,y,width:.31,rotation:0,lineWidth:7,color:'#65B7E6',keyframes:appear(.45+i*.1)});
  }else if(idea.presetId==='shifting-zone'){
   add({id:'zone',type:'rectangle',x:.5,y:.5,width:.72,height:.13,color:'#E77A62',opacity:.32,keyframes:appear()});
   add({id:'zone-label',type:'text',text:'SHIFTING BELT',x:.5,y:.5,width:.62,fontSize:38,fontWeight:700,color:'#F4F5F7',keyframes:appear(.15)});
   for(const [i,x] of [.32,.5,.68].entries())add({id:`shift-${i}`,type:'arrow',x,y:.37,width:.18,rotation:-90,lineWidth:6,color:'#E1C65B',keyframes:appear(.35+i*.1)});
  }else if(idea.presetId==='temperature-comparison'){
   add({id:'warm',type:'circle',x:.31,y:.49,width:.3,height:.3,color:'#C75F4D',opacity:.72,keyframes:appear()});
   add({id:'warm-label',type:'text',text:'WARMER',x:.31,y:.49,width:.26,fontSize:35,fontWeight:700,color:'#F4F5F7',keyframes:appear(.15)});
   add({id:'cool',type:'circle',x:.69,y:.49,width:.3,height:.3,color:'#3C84B5',opacity:.72,keyframes:appear(.25)});
   add({id:'cool-label',type:'text',text:'COOLER',x:.69,y:.49,width:.26,fontSize:35,fontWeight:700,color:'#F4F5F7',keyframes:appear(.4)});
  }else if(idea.presetId==='opposing-formations'){
   for(const [side,color] of [['left','#3F8A62'],['right','#A84F45']])for(let i=0;i<12;i++)add({id:`${side}-unit-${i}`,type:'circle',x:(side==='left'?.25:.75)+(i%3)*.045,y:.35+Math.floor(i/3)*.075,width:.032,height:.032,color,opacity:.9,keyframes:appear(.04*i)});
   add({id:'formation-divider',type:'line',x:.5,y:.5,width:.42,rotation:90,lineWidth:2,color:'#E1C65B',opacity:.55});
  }else if(idea.presetId==='terrain-barrier'){
   for(const [i,x] of [.32,.5,.68].entries()){add({id:`slope-a-${i}`,type:'line',x:x-.04,y:.5,width:.18,rotation:-58,lineWidth:9,color:'#7E9B91',keyframes:appear(.12*i)});add({id:`slope-b-${i}`,type:'line',x:x+.04,y:.5,width:.18,rotation:58,lineWidth:9,color:'#A9B5C3',keyframes:appear(.12*i)});}
  }else if(idea.presetId==='geographic-locator'){
   add({id:'locator-ring',type:'circle',x:.5,y:.48,width:.32,height:.32,color:accent,opacity:.24,keyframes:appear()});
   add({id:'locator-dot',type:'circle',x:.5,y:.48,width:.055,height:.055,color:'#E1C65B',opacity:1,keyframes:appear(.2)});
  }else if(idea.presetId==='revealed-route'){
   add({id:'route',type:'arrow',x:.5,y:.48,width:.52,rotation:-18,lineWidth:9,color:'#E1C65B',keyframes:[{timeSeconds:0,scale:.05,opacity:0,easing:'smooth'},{timeSeconds:Math.min(durationSeconds-.01,Math.max(.2,enter+.4)),scale:1,opacity:1,easing:'smooth'}]});
  }else{
   add({id:'accent',type:'circle',x:.5,y:.45,width:.3,height:.3,color:accent,opacity:.2,keyframes:[first,last]});
  }
  add({id:'visual-intent',type:'text',text:String(idea.visual||row.visual||idea.subtitle||'').slice(0,500),x:.5,y:.79,width:.76,fontFamily:'Invincible Sans',fontSize:30,fontWeight:600,color:'#F4F5F7',keyframes:appear(.35)});
  manifest.scenes.push({id,name:String(idea.title||row.visual||'Canvas scene').slice(0,200),startSeconds,durationSeconds,engineType:'graphic',engineData:{background:'#071426',backgroundStyle:idea.backgroundStyle||'plain',gridColor:accent,gridSpacing:54},transition,overlays});
 }
 for(const [index,row] of storyboard.entries()){
  const {start,seconds}=timing(row);const sceneStart=start===null?cursor:start;
  if(seconds<=0||sceneStart<cursor-1e-6)throw Error(`Scene ${index+1} has invalid or overlapping timing.`);
  if(!allowContextCards&&Math.abs(sceneStart-cursor)>1/30)throw Error(`Scene ${index+1} leaves a timeline gap. Add an approved scene for that interval before import.`);
  if(allowContextCards&&row.contextCard===true&&!row.mapAnimation){
   if(seconds>=1/30)addCard('context-scene-'+index,sceneStart,seconds,'Map detail unavailable');
   cursor=sceneStart+seconds;
   continue;
  }
  if(row.canvasScene&&!row.mapAnimation){if(seconds>=1/30)addCanvas(String(row.id||`ai-scene-${index+1}`),sceneStart,seconds,row);cursor=sceneStart+seconds;continue;}
  if(seconds<1/30)throw Error(`Scene ${index+1} has invalid timing.`);
  if(!row.mapAnimation)throw Error(`Scene ${index+1} has no executable map animation. Descriptive scenes cannot be exported.`);
  if(row.mapAnimation.aspectRatio!==aspectRatio)throw Error(`Scene ${index+1} aspect ratio differs from the production format.`);
  manifest.scenes.push({id:String(row.id||`ai-scene-${index+1}`),name:String(row.visual||row.title||`Scene ${index+1}`).slice(0,200),startSeconds:sceneStart,durationSeconds:seconds,engineType:'map',engineData:{animation:row.mapAnimation,geometryReviewed:false},transition:{type:'cut',durationSeconds:0},overlays:documentaryFrame(row.semanticPlan?.title||row.mapAnimation.title||row.title)});cursor=sceneStart+seconds;
 }
 if(!manifest.scenes.length)throw Error('The narration is too short to render a scene.');
 if(audioFileId){
  if(!audioDuration||audioDuration<cursor-1/30||(!allowContextCards&&audioDuration>cursor+.25))throw Error('The scene plan must cover the voiceover timeline. Its final timestamp differs from the MP3 duration by more than 0.25 seconds.');
  manifest.audioClips.push({id:crypto.randomUUID(),fileId:audioFileId,name:audioName,role:'voiceover',startSeconds:0,trimStart:0,durationSeconds:audioDuration,gain:1,fadeIn:0,fadeOut:0});
 }
 return validateManifest(manifest,{mapAssets});
}
