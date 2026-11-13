import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleSceneDraft, analyzeVoiceover, buildCreativePlanPrompt, buildQwenPrompt, compileCreativePlan, loadCreatorAssetCatalog, normalizeCreativeInstructions, normalizeTranscript, toCreatorStudioImport, validateMapAnimation } from './voiceover-analysis.mjs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compileAiStoryboardManifest } from '../creator/ai-preview.js';

const transcript = { duration: 7, segments: [
  { id: 's1', start: 0, end: 3, text: 'Babur reached Panipat.', words: [{ word: 'Babur', start: 0, end: 1 }, { word: 'reached', start: 1, end: 2 }, { word: 'Panipat.', start: 2, end: 3 }] },
  { id: 's2', start: 3, end: 7, text: 'The battle changed north India.', words: [] }
] };

test('normalizes Whisper segment and word timing', () => {
  const result = normalizeTranscript(transcript);
  assert.equal(result.segments[0].words.length, 3);
  assert.equal(result.duration, 7);
});

test('builds a constrained Qwen prompt', () => {
  const prompt = buildQwenPrompt(transcript, [{ id: 'commander_babur', name: 'Babur', type: 'image' }], 'Use restrained gold titles and a slow camera movement.');
  assert.match(prompt, /Do not invent asset IDs/);
  assert.match(prompt, /commander_babur/);
  assert.match(prompt, /restrained gold titles/);
});

test('bounds creative direction', () => {
  assert.equal(normalizeCreativeInstructions('  cinematic map reveal  '), 'cinematic map reveal');
  assert.throws(() => normalizeCreativeInstructions('x'.repeat(4001)), /4,000/);
});

test('loads real Creator Studio assets and animation presets', async () => {
  const catalog = await loadCreatorAssetCatalog(new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
  assert.ok(catalog.assets.some(asset => asset.id === 'commander_babur'));
  assert.ok(catalog.assets.some(asset => asset.id === 'india-flag-map'));
  assert.ok(catalog.animationPresets.some(preset => preset.id === 'documentary'));
  assert.equal(catalog.styleProfile.composition.aspectRatio, '9:16');
  assert.equal(catalog.styleProfile.animation.troopMovement, 'sequential-timed-layers');
});

test('uses transcript timing as source of truth and accepts catalog assets', () => {
  const draft = assembleSceneDraft(transcript, { scenes: [
    { id: 'scene-1', sourceSegmentIds: ['s1'], visual: 'Babur and a map of Panipat', animation: 'Slow push in', assetIds: ['commander_babur'] },
    { id: 'scene-2', sourceSegmentIds: ['s2'], visual: 'Battlefield map', animation: 'Map reveal', assetIds: [] }
  ] }, [{ id: 'commander_babur', name: 'Babur', type: 'image' }]);
  assert.equal(draft.scenes[0].startSeconds, 0);
  assert.equal(draft.scenes[0].endSeconds, 3);
  assert.equal(draft.valid, true);
  assert.deepEqual(toCreatorStudioImport(draft).scenes[0].voiceover, 'Babur reached Panipat.');
});

test('rejects invented assets and missing transcript segments', () => {
  const draft = assembleSceneDraft(transcript, { scenes: [{ sourceSegmentIds: ['s1', 'unknown'], visual: 'x', assetIds: ['made_up'] }] }, []);
  assert.equal(draft.valid, false);
  assert.match(draft.errors.join(' '), /unknown asset/);
  assert.match(draft.errors.join(' '), /unknown transcript segment/);
});

test('rejects malformed word timings', () => {
  assert.throws(() => normalizeTranscript({ segments: [{ start: 0, end: 2, text: 'x', words: [{ word: 'x', start: 1, end: 3 }] }] }), /Invalid word timing/);
});

test('accepts executable map animation instructions and rejects unsupported references', () => {
  const plan = { format: 'invincible-map-animation', version: 1, title: 'Babur advances', duration: 3, aspectRatio: '9:16', overlayPreset: 'documentary', basemap: 'terrain', terrain: false, camera: [{ time: 0, center: [76.96, 29.39], zoom: 5, pitch: 20, bearing: 0, easing: 'smooth' }, { time: 3, center: [76.96, 29.39], zoom: 5.4, pitch: 20, bearing: 2, easing: 'smooth' }], assets: [{ id: 'babur', libraryId: 'commander_babur' }], layers: [{ id: 'army', type: 'image', name: 'Babur', start: 0, end: 3, assetId: 'babur', position: [76.8, 29.5], scale: 1, rotation: 0, altitude: 0, corners: [[76.5, 29.7], [77.1, 29.7], [77.1, 29.1], [76.5, 29.1]] }] };
  assert.deepEqual(validateMapAnimation(plan, { duration: 3, assetCatalog: [{ id: 'commander_babur', name: 'Commander · Babur · 1526', type: 'image' }] }), { valid: true, errors: [] });
  assert.equal(validateMapAnimation({ ...plan, assets: [{ id: 'babur', libraryId: 'made-up' }] }, { duration: 3, assetCatalog: [] }).valid, false);
});

test('does not invent Panipat positions or routes when the approved catalog has no geometry', () => {
  const transcript = { segments: [{ id: 'segment-1', start: 0, end: 3, text: 'Babur advanced toward Panipat.' }] };
  const prompt = buildCreativePlanPrompt(transcript, { assets: [], verifiedLocations: [], verifiedRoutes: [] });
  assert.match(prompt, /Never invent positions, routes or asset IDs/);
  assert.match(prompt, /Verified locations: \[\]/);
  assert.doesNotMatch(prompt, /76\.96|29\.39|Panipat \[/);
  const draft = compileCreativePlan(transcript, { scenes: [{ sourceSegmentId: 'segment-1', intent: 'advance', location: 'Panipat', routeId: 'invented' }] }, { assets: [], verifiedLocations: [], verifiedRoutes: [] });
  assert.equal(draft.scenes[0].mapAnimation, null);
  assert.match(draft.scenes[0].missingInfo.join(' '), /no route was invented/);
});

test('repairs an omitted Qwen row without merging or losing locked Whisper segments', () => {
  const draft=compileCreativePlan(transcript,{scenes:[{sourceSegmentId:'s1',intent:'title',title:'Panipat',assetId:'',locationId:'',routeId:''}]},{assets:[],verifiedLocations:[],verifiedRoutes:[]});
  assert.equal(draft.scenes.length,2);
  assert.deepEqual(draft.scenes.map(scene=>scene.sourceSegmentIds),[['s1'],['s2']]);
  assert.equal(draft.scenes[1].animation,'hold');
  assert.match(draft.scenes[1].missingInfo.join(' '),/safe hold scene was created/);
});

test('still rejects duplicate or unknown Qwen segment references', () => {
  assert.throws(()=>compileCreativePlan(transcript,{scenes:[{sourceSegmentId:'s1',intent:'hold'},{sourceSegmentId:'s1',intent:'title'}]},{assets:[]}),/more than one plan/);
  assert.throws(()=>compileCreativePlan(transcript,{scenes:[{sourceSegmentId:'unknown',intent:'hold'}]},{assets:[]}),/unknown segment/);
});

test('production keeps every locked segment when Qwen returns an unsupported intent', () => {
  const draft=compileCreativePlan(transcript,{scenes:[{sourceSegmentId:'s1',intent:'zoom-and-converge',title:'ITCZ winds'},{sourceSegmentId:'s2',intent:'title',title:'ITCZ'}]},{assets:[],verifiedLocations:[],verifiedRoutes:[]},{production:true});
  assert.equal(draft.scenes.length,2);
  assert.equal(draft.scenes[0].animation,'hold');
  assert.ok(draft.scenes[0].contextCard===true||draft.scenes[0].mapAnimation);
  assert.match(draft.scenes[0].missingInfo.join(' '),/unsupported animation intent/);
  assert.equal(draft.scenes[1].animation,'title');
  assert.throws(()=>compileCreativePlan(transcript,{scenes:[{sourceSegmentId:'s1',intent:'zoom-and-converge'},{sourceSegmentId:'s2',intent:'title'}]},{assets:[],verifiedLocations:[],verifiedRoutes:[]}),/unsupported intent/);
});

test('analyzes only workspace audio through injected local adapters', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'invincible-voiceover-'));
  const audioPath = path.join(workspace, 'panipat.wav');
  await fs.writeFile(audioPath, 'test-audio');
  const result = await analyzeVoiceover({ audioPath, workspaceRoot: workspace, assetCatalog: [], transcribe: async () => transcript, plan: async () => ({ scenes: [{ sourceSegmentIds: ['s1', 's2'], visual: 'Map reveal', assetIds: [] }] }) });
  assert.equal(result.scenes[0].durationSeconds, 7);
  await assert.rejects(() => analyzeVoiceover({ audioPath: path.join(workspace, '..', 'outside.wav'), workspaceRoot: workspace, transcribe: async () => transcript, plan: async () => ({ scenes: [] }) }), /restricted agent workspace/);
});

test('production finds dated and modern locators and falls back without invented geometry', async () => {
  const root = new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
  const catalog = await loadCreatorAssetCatalog(root, { includeHistory: true });
  const text = ['१५२६ में लोदी का शासन था।', 'यह गुजरात और राजस्थान के हिस्सों में था।', 'A completely unlisted dynasty.'];
  const transcript = {segments:text.map((line,index)=>({id:'s'+index,start:index*3,end:index*3+3,text:line}))};
  const intentions = {scenes:text.map((_,index)=>({sourceSegmentId:'s'+index,intent:'advance',routeId:'invented'}))};
  const draft = compileCreativePlan(transcript,intentions,catalog,{production:true});
  assert.deepEqual(draft.scenes[0].mapAnimation.layers.map(layer=>layer.name),['Lodi Dynasty · approximate locator']);
  assert.deepEqual(draft.scenes[1].mapAnimation.layers.map(layer=>layer.name),['Present-day Gujarat','Present-day Rajasthan']);
  assert.ok(draft.scenes.slice(0,2).every(scene=>scene.mapAnimation.layers.every(layer=>layer.type==='label')));
  assert.equal(draft.scenes[2].contextCard,true);
  const scenes = toCreatorStudioImport(assembleSceneDraft(transcript,draft,catalog)).scenes;
  assert.equal(scenes[2].contextCard,true);
  const video = compileAiStoryboardManifest(scenes,{allowContextCards:true,audioFileId:'voice',audioDuration:9.2});
  assert.deepEqual(video.scenes.map(scene=>scene.engineType),['map','map','graphic']);
});
