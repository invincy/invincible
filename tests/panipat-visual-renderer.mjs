import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getFormationPositions,
  roundRect,
  drawCard,
  drawYearTriptych,
  drawMainUnit,
  drawBattleComparison,
  renderPanipatOverlay,
  PALETTE
} from '../creator/panipat-visual-renderer.js';

import {adaptPanipatStoryboard} from '../creator/panipat-storyboard-adapter.js';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storyboardPath = path.join(__dirname, '../creator/history-data/panipat/panipat_final_storyboard_v2.json');
const rawSpec = JSON.parse(fs.readFileSync(storyboardPath, 'utf-8'));

// Mock Canvas 2D Context for deterministic node testing
function createMockContext() {
  const calls = [];
  return {
    calls,
    save: () => calls.push(['save']),
    restore: () => calls.push(['restore']),
    beginPath: () => calls.push(['beginPath']),
    closePath: () => calls.push(['closePath']),
    moveTo: (x, y) => calls.push(['moveTo', x, y]),
    lineTo: (x, y) => calls.push(['lineTo', x, y]),
    arcTo: (x1, y1, x2, y2, r) => calls.push(['arcTo', x1, y1, x2, y2, r]),
    fill: () => calls.push(['fill']),
    stroke: () => calls.push(['stroke']),
    fillRect: (x, y, w, h) => calls.push(['fillRect', x, y, w, h]),
    fillText: (text, x, y, maxW) => calls.push(['fillText', text, x, y, maxW]),
    measureText: (text) => ({width: String(text).length * 8}),
    clip: () => calls.push(['clip']),
    drawImage: (...args) => calls.push(['drawImage', ...args]),
    set strokeStyle(v) {},
    set fillStyle(v) {},
    set lineWidth(v) {},
    set font(v) {},
    set textAlign(v) {},
    set textBaseline(v) {},
    set globalAlpha(v) {},
    set shadowColor(v) {},
    set shadowBlur(v) {},
    set shadowOffsetY(v) {}
  };
}

test('formation positions: exactly 16 icons, 4 sub-units of 4, smooth morph', () => {
  const sq = getFormationPositions(0);
  assert.equal(sq.length, 16);
  assert.equal(new Set(sq.map(p => p.subUnit)).size, 4);

  const ln = getFormationPositions(1);
  assert.equal(ln.length, 16);
  assert.equal(new Set(ln.map(p => p.subUnit)).size, 4);

  const mid = getFormationPositions(0.5);
  assert.equal(mid.length, 16);

  // Verify that midpoint coordinates are strictly between square and line coordinates
  for (let i = 0; i < 16; i++) {
    const minX = Math.min(sq[i].sqX, ln[i].lnX);
    const maxX = Math.max(sq[i].sqX, ln[i].lnX);
    assert.ok(mid[i].x >= minX - 0.01 && mid[i].x <= maxX + 0.01);
  }
});

test('drawCard and drawYearTriptych render on mock context without error', () => {
  const ctx = createMockContext();
  drawCard(ctx, {
    x: 28, y: 92, width: 1024, height: 200,
    title: 'Test Title', eyebrow: 'Test Eyebrow', body: 'Test body text here'
  });
  assert.ok(ctx.calls.some(c => c[0] === 'fillText' && c[1] === 'Test Title'));

  drawYearTriptych(ctx, {x: 28, y: 92, width: 1024, scale: 1.0, activeIndex: 1});
  assert.ok(ctx.calls.some(c => c[0] === 'fillText' && c[1] === '1526'));
  assert.ok(ctx.calls.some(c => c[0] === 'fillText' && c[1] === '1556'));
  assert.ok(ctx.calls.some(c => c[0] === 'fillText' && c[1] === '1761'));
});

test('renderPanipatOverlay renders representative cards for all 13 scenes', () => {
  const project = adaptPanipatStoryboard(rawSpec);
  const spec = project.historicalMap;

  // Test overlay rendering at every scene's midpoint
  let at = 0;
  for (let i = 0; i < project.scenes.length; i++) {
    const scene = project.scenes[i];
    const midTime = at + scene.duration / 2;
    const ctx = createMockContext();

    assert.doesNotThrow(() => {
      renderPanipatOverlay(ctx, {
        project,
        spec,
        time: midTime,
        width: 1080,
        height: 1920,
        isPortrait: true
      });
    }, `Failed rendering scene ${i + 1} (${scene.id}) at ${midTime}s`);

    assert.ok(ctx.calls.length > 0, `Scene ${i + 1} should have drawn elements`);
    at += scene.duration;
  }
});

test('battle comparison renders schematic mode with correct unit ratios', () => {
  const project = adaptPanipatStoryboard(rawSpec);
  const panipat = project.historicalMap.panipat;
  const ctx = createMockContext();

  // Test 1526
  drawBattleComparison(ctx, {
    battlePreset: panipat.battlePresets[0],
    scale: 1.0,
    width: 1080,
    height: 1920
  });

  const texts = ctx.calls.filter(c => c[0] === 'fillText').map(c => c[1]);
  assert.ok(texts.includes('SCHEMATIC COMPARISON · NOT GEOGRAPHIC DEPLOYMENT'));
  assert.ok(texts.some(t => t.includes('1526')));
  assert.ok(texts.some(t => t.includes('6 Main Units')));
  assert.ok(texts.some(t => t.includes('14 Main Units')));
  assert.ok(texts.some(t => t.includes('Equipment: 20–24 field guns')));
  assert.ok(texts.some(t => t.includes('Equipment: ~1,000 war elephants')));

  // Test 1556
  const ctx1556 = createMockContext();
  drawBattleComparison(ctx1556, {
    battlePreset: panipat.battlePresets[1],
    scale: 1.0,
    width: 1080,
    height: 1920
  });
  const texts1556 = ctx1556.calls.filter(c => c[0] === 'fillText').map(c => c[1]);
  assert.ok(texts1556.some(t => t.includes('1556')));
  assert.ok(texts1556.some(t => t.includes('4 Main Units')));
  assert.ok(texts1556.some(t => t.includes('12 Main Units')));
  assert.ok(texts1556.some(t => t.includes('Vanguard/cavalry figures only')));

  // Test 1761
  const ctx1761 = createMockContext();
  drawBattleComparison(ctx1761, {
    battlePreset: panipat.battlePresets[2],
    scale: 1.0,
    width: 1080,
    height: 1920
  });
  const texts1761 = ctx1761.calls.filter(c => c[0] === 'fillText').map(c => c[1]);
  assert.ok(texts1761.some(t => t.includes('1761')));
  assert.ok(texts1761.some(t => t.includes('12 Main Units')));
  assert.ok(texts1761.some(t => t.includes('9 Main Units')));
  assert.ok(texts1761.some(t => t.includes('One illustrative reconstruction')));
});
