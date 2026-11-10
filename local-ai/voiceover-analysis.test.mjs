import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleSceneDraft, analyzeVoiceover, buildQwenPrompt, normalizeTranscript, toCreatorStudioImport } from './voiceover-analysis.mjs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

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
  const prompt = buildQwenPrompt(transcript, [{ id: 'commander_babur', name: 'Babur', type: 'image' }]);
  assert.match(prompt, /Do not invent asset IDs/);
  assert.match(prompt, /commander_babur/);
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

test('analyzes only workspace audio through injected local adapters', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'invincible-voiceover-'));
  const audioPath = path.join(workspace, 'panipat.wav');
  await fs.writeFile(audioPath, 'test-audio');
  const result = await analyzeVoiceover({ audioPath, workspaceRoot: workspace, assetCatalog: [], transcribe: async () => transcript, plan: async () => ({ scenes: [{ sourceSegmentIds: ['s1', 's2'], visual: 'Map reveal', assetIds: [] }] }) });
  assert.equal(result.scenes[0].durationSeconds, 7);
  await assert.rejects(() => analyzeVoiceover({ audioPath: path.join(workspace, '..', 'outside.wav'), workspaceRoot: workspace, transcribe: async () => transcript, plan: async () => ({ scenes: [] }) }), /restricted agent workspace/);
});
