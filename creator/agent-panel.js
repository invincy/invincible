import {loadScriptSyncCheckpoint} from './ai-draft.js?v=2026111319';

// Coordinates, keyframes and other unkeyed arrays need explicit replacement
// so the JSON from View JSON can be submitted directly to the patch validator.
function patchValue(value) {
 if (Array.isArray(value)) {
  return value.every(item => item && typeof item.id === 'string')
   ? value.map(patchValue) : {$replace: value};
 }
 if (value && typeof value === 'object') {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, patchValue(item)]));
 }
 return value;
}

export function scenePatch(scene, revision, mapSources = []) {
 const {name, engineType, sourceStart, transition, overlays} = scene;
 const engineData = structuredClone(scene.engineData || {});
 if (engineData.sourceId && !engineData.project) {
  const source = mapSources.find(item => item.id === engineData.sourceId);
  if (!source) throw Error('Map source is missing: ' + engineData.sourceId);
  engineData.project = structuredClone(source.project);
  delete engineData.sourceId;
 }
 const fields = {name, engineType, sourceStart, transition, overlays, engineData};
 return {
  patchSceneId: scene.id,
  expectedRevision: revision,
  changes: patchValue(Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)))
 };
}

export function mountAgentPanel(root, {openMotion, getProject, getAccountId}) {
 const find = id => root.querySelector('#' + id);
 const target = find('agentTarget');
 const input = find('agentPayload');
 const status = find('agentStatus');
 const save = find('agentSave');
 let snapshot;
 let busy = false;
 async function withAgent(operation) {
  if (busy) return;
  busy = true;
  status.textContent = "Working…";
  save.disabled = true;
  try {
   if (!getAccountId() || !getProject()) throw Error('Open a signed-in project first.');
   if (!window.invincibleAgent) await openMotion();
   const agent = window.invincibleAgent;
   if (!agent) throw Error('Motion & export is unavailable.');
   await operation(agent);
  } catch (error) {
   status.textContent = error.message;
  } finally {
   busy = false;
   save.disabled = !snapshot;
  }
 }
 function unwrap(result) {
  if (!result.ok) throw Error(result.errors.map(error => error.message).join('\n'));
  return result;
 }
 async function refresh(agent) {
  const owner = getAccountId();
  const project = getProject();
  const [state, checkpoint] = await Promise.all([
   agent.getProjectJSON(),
   loadScriptSyncCheckpoint(owner, project.id).catch(() => null)
  ]);
  if (owner !== getAccountId() || project.id !== getProject()?.id) throw Error('Project access changed.');
  snapshot = unwrap(state);
  status.textContent = "";
  const {manifest, revision, availableAssets, audioTiming} = snapshot;
  const clips = Array.isArray(audioTiming) && audioTiming.length ? audioTiming : manifest.audio ? [manifest.audio] : [];
  const audio = clips.find(clip => clip.role === 'voiceover') || clips[0];
  const transcript = checkpoint?.transcript;
  find('agentState').textContent = [
   'MP3: ' + (audio ? [audio.durationSeconds && audio.durationSeconds.toFixed(2) + 's', audio.fileId].filter(Boolean).join(' · ') : checkpoint?.audioAvailable ? 'Ready in Script' : 'Unavailable'),
   'Timing: ' + (transcript?.segments?.length ? transcript.segments.length + ' segments' : 'Unavailable'),
   'Scenes: ' + manifest.scenes.length + ' (' + manifest.scenes.filter(scene => scene.engineType === 'map').length + ' maps)',
   'Revision: ' + (revision ?? 'unsaved'),
   snapshot.staged ? 'Staged editor changes exist' : ''
  ].filter(Boolean).join(' | ');
  find('agentMedia').value = ['Name\tFile ID\tDimensions', ...availableAssets.map(asset =>
   [asset.name, asset.id, asset.width && asset.height ? asset.width + ' × ' + asset.height : ''].join('\t')
  )].join('\n');
  const selected = target.value;
  target.replaceChildren(new Option('Full Video Manifest', ''), ...manifest.scenes.map(scene =>
   new Option((scene.name || scene.id) + ' · ' + scene.id, scene.id)
  ));
  if ([...target.options].some(option => option.value === selected)) target.value = selected;
 }
 function showJSON() {
  if (!snapshot) return;
  const scene = snapshot.manifest.scenes.find(item => item.id === target.value);
  input.value = JSON.stringify(scene
   ? scenePatch(scene, snapshot.revision, snapshot.manifest.mapSources)
   : {...snapshot.manifest, expectedRevision: snapshot.revision}, null, 2);
 }
 root.addEventListener('toggle', () => {
  if (root.open) withAgent(refresh);
 });
 find('agentRefresh').onclick = () => withAgent(refresh);
 find('agentRead').onclick = showJSON;
 target.onchange = showJSON;
 root.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  withAgent(async agent => {
   const latest = unwrap(await agent.getProjectJSON());
   if (!snapshot || latest.staged) throw Error('Save or discard staged editor changes, then refresh project state.');
   const payload = JSON.parse(input.value);
   if (target.value && payload.patchSceneId !== target.value) throw Error('Patch ID must match the selected scene.');
   if (!target.value && !Array.isArray(payload.scenes)) throw Error('Select a target scene for a patch.');
   payload.expectedRevision ??= snapshot.revision;
   const result = unwrap(await agent.applyPatch(payload));
   status.textContent = 'Saved to your account · revision ' + result.revision;
   try { await refresh(agent); } catch (error) { snapshot = null; throw Error('Saved to your account. State refresh failed: ' + error.message); }
   status.textContent = 'Saved to your account · revision ' + result.revision;
  });
 });
}
