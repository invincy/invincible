import {validateManifest} from './model.js?v=2026112204';
import {upgradeVideo} from './composition.js?v=2026112204';
import {audioClipsForManifest} from './audio.js?v=2026112201';
import {validateShortCuts,cutAudio} from './short-cuts.js';

export function createShortManifest(source, cut, {audioDuration=0,mapAssets=[]}={}) {
 const master = validateManifest(source,{mapAssets});
 validateShortCuts([cut],master.scenes);
 const manifest = upgradeVideo(master,audioDuration);
 const first = manifest.scenes.findIndex(s=>s.id===cut.firstSceneId), last = manifest.scenes.findIndex(s=>s.id===cut.lastSceneId);
 const start = manifest.scenes[first].startSeconds, end = manifest.scenes[last].startSeconds + manifest.scenes[last].durationSeconds;
 // Flatten scene sounds before rebasing scenes, then keep their measured source offsets.
 manifest.audioClips = cutAudio(audioClipsForManifest(manifest),start,end);
 manifest.scenes = manifest.scenes.slice(first,last+1).map(scene=>{
  const row={...scene,startSeconds:scene.startSeconds-start};delete row.audioClips;return row;
 });
 manifest.title=cut.title;manifest.aspectRatio='9:16';manifest.introEnabled=false;manifest.outroEnabled=false;
 delete manifest.shortCuts;
 return validateManifest(manifest,{mapAssets});
}
