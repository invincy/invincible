import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  isPanipatStoryboard,
  validatePanipatStoryboard,
  adaptPanipatStoryboard,
  PANIPAT_DOC_TYPE,
  PANIPAT_VERSION,
  MASTER_AUDIO_DURATION,
  SYNCED_SCENE_BOUNDARIES
} from '../creator/panipat-storyboard-adapter.js';

import {durationOf, sceneTimeline, validateMap} from '../creator/history-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storyboardPath = path.join(__dirname, '../creator/history-data/panipat/panipat_final_storyboard_v2.json');
const rawSpec = JSON.parse(fs.readFileSync(storyboardPath, 'utf-8'));

test('isPanipatStoryboard detects valid and invalid document types', () => {
  assert.equal(isPanipatStoryboard(rawSpec), true);
  assert.equal(isPanipatStoryboard({documentType: 'other', version: '2.0'}), false);
  assert.equal(isPanipatStoryboard({documentType: PANIPAT_DOC_TYPE, version: '1.0'}), false);
  assert.equal(isPanipatStoryboard(null), false);
  assert.equal(isPanipatStoryboard('string'), false);
});

test('validatePanipatStoryboard rejects wrong scenes or audio duration', () => {
  assert.doesNotThrow(() => validatePanipatStoryboard(rawSpec));
  
  const badScenes = structuredClone(rawSpec);
  badScenes.scenes.pop();
  assert.throws(() => validatePanipatStoryboard(badScenes), /13 scenes/);

  const badAudio = structuredClone(rawSpec);
  badAudio.audio.durationSec = 120.0;
  assert.throws(() => validatePanipatStoryboard(badAudio), /Master audio duration/);

  const badRatio = structuredClone(rawSpec);
  badRatio.output.aspectRatio = '16:9';
  assert.throws(() => validatePanipatStoryboard(badRatio), /9:16 portrait/);
});

test('adaptPanipatStoryboard compiles to valid Invincible project schema', () => {
  const project = adaptPanipatStoryboard(rawSpec);

  assert.equal(project.title, 'Panipat — Three Battles That Shaped India');
  assert.equal(project.aspectRatio, '9:16');
  assert.equal(project.scenes.length, 13);

  // Exact audio duration check
  const total = durationOf(project);
  assert.ok(Math.abs(total - MASTER_AUDIO_DURATION) < 0.005, `Total ${total} matches ${MASTER_AUDIO_DURATION}`);

  // Scenes check
  assert.equal(project.scenes[0].id, 'panipat_01_hook');
  assert.equal(project.scenes[12].id, 'panipat_13_conclusion');

  // Verify map validity under canonical validateMap
  assert.doesNotThrow(() => validateMap(project.historicalMap, project));

  // Check camera keyframes: strictly North-up
  const camera = project.historicalMap.camera;
  assert.ok(camera.length >= 13);
  for (const c of camera) {
    assert.equal(c.bearing, 0, 'Geographic scenes must have bearing 0 (North-up)');
  }

  // Check registered assets
  const assets = project.historicalMap.visual.assets;
  assert.ok(assets.some(a => a.id === 'commander_babur'));
  assert.ok(assets.some(a => a.id === 'commander_ahmad_shah_abdali' && a.quality === 'preview'));
  assert.ok(assets.some(a => a.id === 'commander_sadashivrao_bhau'));
  assert.ok(assets.some(a => a.id === 'troop_infantry_sword'));
  assert.ok(assets.some(a => a.id === 'troop_field_cannon'));
  assert.ok(assets.some(a => a.id === 'troop_war_elephant'));

  // Check Panipat rich metadata attached
  const panipat = project.historicalMap.panipat;
  assert.ok(panipat);
  assert.equal(panipat.battlePresets.length, 3);
  assert.equal(panipat.formationRules.mainUnit.icons, 16);
  assert.equal(panipat.formationRules.subUnit.icons, 4);

  // Battle 1526 unit counts: Babur 6 vs Ibrahim Lodi 14 (at 2500/unit)
  const b1526 = panipat.battlePresets.find(b => b.year === 1526);
  assert.equal(b1526.displayMainUnits.left, 6);
  assert.equal(b1526.displayMainUnits.right, 14);

  // Battle 1556 unit counts: Mughal vanguard 4 vs Hemu 12 (cavalry only)
  const b1556 = panipat.battlePresets.find(b => b.year === 1556);
  assert.equal(b1556.displayMainUnits.left, 4);
  assert.equal(b1556.displayMainUnits.right, 12);

  // Battle 1761 unit counts: Durrani 12 vs Maratha 9 (at 5000/unit, disputed estimate)
  const b1761 = panipat.battlePresets.find(b => b.year === 1761);
  assert.equal(b1761.displayMainUnits.left, 12);
  assert.equal(b1761.displayMainUnits.right, 9);
});
