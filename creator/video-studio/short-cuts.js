// A cut refers to stable source scenes; source animation clocks never change.
export function validateShortCuts(cuts, scenes) {
 if (cuts === undefined) return;
 if (!Array.isArray(cuts) || cuts.length > 30) throw Error('Use up to 30 Shorts.');
 const ids = new Set();
 for (const cut of cuts) {
  if (!cut || typeof cut !== 'object' || Array.isArray(cut) || Object.keys(cut).some(k => !['id','title','hook','firstSceneId','lastSceneId'].includes(k))) throw Error('Invalid Short fields.');
  for (const key of ['id','firstSceneId','lastSceneId']) if (typeof cut[key] !== 'string' || !cut[key].length || cut[key].length > 150) throw Error('Invalid Short scene or ID.');
  if (ids.has(cut.id)) throw Error('Duplicate Short ID.');
  ids.add(cut.id);
  if (typeof cut.title !== 'string' || !cut.title.trim() || cut.title.length > 200 || (cut.hook !== undefined && (typeof cut.hook !== 'string' || cut.hook.length > 500))) throw Error('Give the Short a title and a hook of up to 500 characters.');
  const first = scenes.findIndex(s => s.id === cut.firstSceneId), last = scenes.findIndex(s => s.id === cut.lastSceneId);
  if (first < 0 || last < first) throw Error('A Short needs an existing first and last scene in timeline order.');
  const duration = scenes[last].startSeconds + scenes[last].durationSeconds - scenes[first].startSeconds;
  if (duration > 180 + 1e-6) throw Error('Keep each Short within three minutes.');
 }
}

// Crop recordings without speeding them up. Reject boundaries that would alter a
// saved fade envelope instead of silently changing the original sound mix.
export function cutAudio(clips, start, end) {
 const out = [];
 for (const clip of clips) {
  const from = Math.max(start, clip.startSeconds), to = Math.min(end, clip.startSeconds + clip.durationSeconds);
  if (to <= from) continue;
  const offset = from - clip.startSeconds, tail = clip.startSeconds + clip.durationSeconds - to;
  if ((offset > 1e-6 && offset < clip.fadeIn - 1e-6) || (tail > 1e-6 && tail < clip.fadeOut - 1e-6)) throw Error('A Short boundary crosses an audio fade. Choose a neighboring scene boundary.');
  if (clip.loop) {
   const phase = offset % clip.sourceDurationSeconds;
   if (Math.min(phase,clip.sourceDurationSeconds-phase) > 1e-6) throw Error('This cut starts inside a repeating sound. Choose its loop boundary or use a non-looping track.');
  }
  out.push({...clip,id:clip.id,startSeconds:from-start,trimStart:clip.trimStart+(clip.loop?0:offset),durationSeconds:to-from,fadeIn:offset>1e-6?0:clip.fadeIn,fadeOut:tail>1e-6?0:clip.fadeOut});
 }
 return out;
}
