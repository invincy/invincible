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
 function addCard(id,startSeconds,durationSeconds,text){
  manifest.scenes.push({id,name:text,startSeconds,durationSeconds,engineType:'graphic',engineData:{},transition,overlays:[
   {id:'context',type:'text',text,x:.5,y:.48,fontSize:54,color:'#F4F5F7'},
   {id:'caption',type:'text',text:'Historical context',x:.5,y:.55,fontSize:30,color:'#E1C65B'}
  ]});
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
  if(seconds<1/30)throw Error(`Scene ${index+1} has invalid timing.`);
  if(!row.mapAnimation)throw Error(`Scene ${index+1} has no executable map animation. Descriptive scenes cannot be exported.`);
  if(row.mapAnimation.aspectRatio!==aspectRatio)throw Error(`Scene ${index+1} aspect ratio differs from the production format.`);
  manifest.scenes.push({id:String(row.id||`ai-scene-${index+1}`),name:String(row.visual||row.title||`Scene ${index+1}`).slice(0,200),startSeconds:sceneStart,durationSeconds:seconds,engineType:'map',engineData:{animation:row.mapAnimation,geometryReviewed:false},transition:{type:'cut',durationSeconds:0},overlays:[]});cursor=sceneStart+seconds;
 }
 if(!manifest.scenes.length)throw Error('The narration is too short to render a scene.');
 if(audioFileId){
  if(!audioDuration||audioDuration<cursor-1/30||(!allowContextCards&&audioDuration>cursor+.25))throw Error('The scene plan must cover the voiceover timeline. Its final timestamp differs from the MP3 duration by more than 0.25 seconds.');
  manifest.audioClips.push({id:crypto.randomUUID(),fileId:audioFileId,name:audioName,role:'voiceover',startSeconds:0,trimStart:0,durationSeconds:audioDuration,gain:1,fadeIn:0,fadeOut:0});
 }
 return validateManifest(manifest,{mapAssets});
}
