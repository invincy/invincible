import {emptyVideo,validateManifest} from './model.js?v=2026111014';
import {sceneTimeline,validateMap} from '../history-model.js?v=2026111002';
export function upgradeVideo(manifest,audioDuration=0){
 const out=structuredClone(manifest);if(out.schemaVersion===2)return out;
 out.schemaVersion=2;out.audioClips=[];
 if(out.audio){if(!audioDuration)throw Error('Load the original recording before upgrading this draft.');out.audioClips.push({...out.audio,id:crypto.randomUUID(),role:'voiceover',trimStart:0,durationSeconds:audioDuration,fadeIn:0,fadeOut:0});}
 out.audio=null;return out;
}
export const newStudioVideo=()=>({...emptyVideo(),schemaVersion:2,audioClips:[]});
export function nativeMapScenes(project){
 validateMap(project.historicalMap,project);
 const snapshot={scenes:project.scenes.map(s=>({id:s.id,duration:Number(s.duration)})),historicalMap:structuredClone(project.historicalMap)};
 return sceneTimeline(project).map((row,i)=>({id:crypto.randomUUID(),name:row.scene.visual?.slice(0,200)||`Map ${i+1}`,startSeconds:row.start,durationSeconds:row.end-row.start,engineType:'map',engineData:{project:structuredClone(snapshot),sourceStart:row.start},overlays:[]}));
}
export function appendProjectMaps(manifest,project){
 const rows=nativeMapScenes(project),out=structuredClone(manifest);if(!rows.length)throw Error('This project has no map scenes.');const sourceId=crypto.randomUUID();out.mapSources??=[];out.mapSources.push({id:sourceId,project:rows[0].engineData.project});for(const row of rows){delete row.engineData.project;row.engineData.sourceId=sourceId;}return arrangeScenes(out,[...out.scenes,...rows],{mapAssets:project.historicalMap.visual?.assets||[]});
}
// Scene changes are explicitly applied; audio keeps its absolute content timestamps.
export function arrangeScenes(manifest,scenes,{mapAssets=[]}={}){
 const out=structuredClone(manifest);let at=0;out.scenes=scenes.map(s=>{const row={...structuredClone(s),startSeconds:at};at+=row.durationSeconds;return row;});return validateManifest(out,{mapAssets});
}
export function resizeScene(scene,duration){
 const out=structuredClone(scene),ratio=duration/out.durationSeconds;out.durationSeconds=duration;
 for(const layer of out.overlays){for(const p of ['startSeconds','endSeconds'])if(layer[p]!==undefined)layer[p]*=ratio;for(const key of layer.keyframes||[])key.timeSeconds*=ratio;}
 if(out.transition)out.transition.durationSeconds=Math.min(out.transition.durationSeconds,duration/2);
 if(out.engineType==='battlefield')for(const keys of [out.engineData.camera,...out.engineData.formations.map(f=>f.path)])for(const key of keys)key.timeSeconds*=ratio;
 for(const p of out.engineData.projectiles||[])for(const key of ['launchSeconds','flightSeconds','impactSeconds'])p[key]*=ratio;
 if(out.engineType==='lic')for(const key of out.engineData.points)key.timeSeconds*=ratio;
 if(out.engineType==='map'&&out.engineData.animation){const a=out.engineData.animation;a.duration=duration;for(const key of [...a.camera,...(a.lighting||[])])key.time*=ratio;for(const layer of a.layers){layer.start*=ratio;layer.end*=ratio;for(const p of ['fadeIn','fadeOut','revealDuration'])if(layer[p]!==undefined)layer[p]*=ratio;}}
 return out;
}
export function fitMedia(ctx,source,fit='contain'){
 const sw=source.videoWidth||source.width,sh=source.videoHeight||source.height,{width:w,height:h}=ctx.canvas;
 const scale=(fit==='cover'?Math.max:Math.min)(w/sw,h/sh);ctx.drawImage(source,(w-sw*scale)/2,(h-sh*scale)/2,sw*scale,sh*scale);
}
