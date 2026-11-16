import assert from 'node:assert/strict';
import test from 'node:test';
import {projectSip} from '../react/src/portfolio/sip-projection.mjs';
import {parseConstituents, rankStocks, stockMove} from '../react/src/portfolio/watch-market.mjs';

test('SIP step-up adds ₹1,000 each month, including across a year boundary', () => {
  const result = projectSip({balance: 50_000, payment: 8_500, increase: 1_000, years: 2, annualRate: 0});
  assert.deepEqual(result, {endingValue: 530_000, contributed: 480_000, growth: 0, finalPayment: 31_500});
});

test('SIP applies effective annual growth and month-end deposits', () => {
  const result = projectSip({balance: 10_000, payment: 100, increase: 0, years: 1, annualRate: 12});
  const monthlyRate = 1.12 ** (1 / 12) - 1;
  assert.ok(Math.abs(result.endingValue - (11_200 + 100 * 0.12 / monthlyRate)) < 1e-8);
  assert.equal(projectSip({balance: 10, payment: 8_500, increase: 1_000, years: 0, annualRate: 12}), null);
});

test('constituents accept quoted names and reject incomplete or duplicate lists', () => {
  const content = 'Company Name,Industry,Symbol,Series,ISIN Code\r\n"Test, Ltd.",IT,TEST,EQ,INE000A01011';
  assert.deepEqual(parseConstituents(content, 1), [{id: 'INE000A01011', symbol: 'TEST', name: 'Test, Ltd.'}]);
  assert.throws(() => parseConstituents(content, 2), /complete/);
  assert.throws(() => parseConstituents(content + '\n' + content.split('\r\n')[1], 2), /complete/);
});

test('movers rank the top ten by percent on the same closing date', () => {
  const stocks = Array.from({length: 28}, (_, index) => ({id: String(index), symbol: String(index)}));
  const series = Object.fromEntries(stocks.slice(0, 26).map(({id}) => [id, [['2026-11-13', 100], ['2026-11-16', 87 + Number(id)]]]));
  series['26'] = [['2026-11-12', 99], ['2026-11-13', 112]];
  series['27'] = [['2026-11-13', 100], ['2026-11-16', 199]];
  const result = rankStocks(stocks, series, '1D');
  assert.equal(result.included, 26);
  assert.equal(result.gainers.length, 10);
  assert.equal(result.losers.length, 10);
  assert.equal(result.gainers[0].id, '25');
  assert.equal(result.losers[0].id, '0');
  assert.equal(stockMove(series['25'], '1M', result.end), null);
});

test('an unavailable feed produces an empty ranking', () => {
  assert.deepEqual(rankStocks([{id: '1', symbol: 'A'}], {}, '1D'), {
    end: undefined, included: 0, gainers: [], losers: [],
  });
});
