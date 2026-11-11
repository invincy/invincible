import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeEquity, frontMovers, normalizeCandles, rangeStart} from '../react/src/portfolio/equity-analysis.mjs';

test('calendar ranges clamp month ends and leap dates', () => {
  assert.equal(rangeStart('2026-03-31', '1M'), '2026-02-28');
  assert.equal(rangeStart('2024-02-29', '1Y'), '2023-02-28');
  assert.equal(rangeStart('2026-11-09', '7D'), '2026-11-02');
});

test('price history normalizes descending candles and drops invalid rows', () => {
  const candle = (date, close) => [date + 'T00:00:00+05:30', 0, 0, 0, close];
  assert.deepEqual(normalizeCandles([
    candle('2026-11-10', 20), candle('2026-11-09', 10), candle('2026-11-08', null),
    candle('2026-11-07', 8), candle('2026-11-12', 50)
  ], '2026-11-08', '2026-11-11'), [['2026-11-09', 10], ['2026-11-10', 20]]);
});

test('basket and contributions use common trading closes with explicit exclusions', () => {
  const holdings = [{id:'A',name:'A',units:2},{id:'B',name:'B',units:3},{id:'C',name:'C',units:8}];
  const series = {
    A:[['2026-10-08',100],['2026-10-09',101],['2026-11-09',120]],
    B:[['2026-10-08',60],['2026-11-09',50]],
    C:[['2026-10-08',10],['2026-11-07',10]],
    benchmark:[['2026-10-08',1000],['2026-11-09',1050]]
  };
  const result = analyzeEquity(holdings, series, '1M', '2026-11-11');
  assert.equal(result.start, '2026-10-08');
  assert.equal(result.included, 2);
  assert.deepEqual(result.missing, ['C']);
  assert.equal(result.rows.get('A').contribution, 40);
  assert.equal(result.rows.get('B').contribution, -30);
  assert.equal(result.points[0].value, 380);
  assert.equal(result.points.at(-1).value, 390);
  assert.ok(Math.abs(result.points.at(-1).benchmark - 5) < 1e-9);
});

test('front cards show the two largest equity gains and losses without dropping rows', () => {
  const rows = [2,-5,6,0,-8,4].map((gain,i) => ({id:String(i),kind:'equity',units:1,price:10+gain,cost:10}));
  rows.push({id:'mf',kind:'mf',units:1,price:100,cost:0});
  assert.deepEqual(frontMovers(rows).map(h => h.id), ['2','5','4','1','0','3','mf']);
});
