import {normalizeCandles, rangeStart} from './equity-analysis.mjs';

const csvBase = 'https://www.niftyindices.com/IndexConstituent/';
export const universes = {
  large: {name: 'Nifty 50', file: csvBase + 'ind_nifty50list.csv', size: 50},
  mid: {name: 'Nifty Midcap 100', file: csvBase + 'ind_niftymidcap100list.csv', size: 100},
  small: {name: 'Nifty Smallcap 100', file: csvBase + 'ind_niftysmallcap100list.csv', size: 100},
};
export const watchRanges = ['1D', '7D', '1M', '1Y'];

export function parseConstituents(csv, expected) {
  const lines = csv.trim().replace(/^\uFEFF/, '').split(/\r?\n/);
  const parseLine = line => [...line.matchAll(/(?:^|,)(?:"((?:[^"]|"")*)"|([^",]*))/g)]
    .map(match => (match[1]?.replaceAll('""', '"') ?? match[2]).trim());
  const headers = parseLine(lines.shift()).map(value => value.toLowerCase());
  const name = headers.indexOf('company name');
  const symbol = headers.indexOf('symbol');
  const isin = headers.indexOf('isin code');
  if ([name, symbol, isin].includes(-1)) throw Error('Use the official index constituents CSV.');
  const entries = lines.filter(line => line.trim()).map(line => {
    const fields = parseLine(line);
    return {id: fields[isin], name: fields[name], symbol: fields[symbol]};
  });
  if (entries.length !== expected || entries.some(s => !/^IN[A-Z0-9]{10}$/.test(s.id) || !s.symbol || !s.name) ||
      new Set(entries.map(s => s.id)).size !== expected) {
    throw Error('The file does not contain a complete index universe.');
  }
  return entries;
}

const day = 86400000;
const dateValue = date => Date.parse(date + 'T00:00:00Z');
const daysBefore = (date, days) => new Date(dateValue(date) - days * day).toISOString().slice(0, 10);

export function stockMove(candles, range, end) {
  if (!end || !candles?.length || candles.at(-1)[0] !== end || !watchRanges.includes(range)) return null;
  const boundary = range === '1D' ? daysBefore(end, 1) : rangeStart(end, range);
  const start = candles.findLastIndex(([date]) => date <= boundary);
  if (start < 0 || dateValue(boundary) - dateValue(candles[start][0]) > 7 * day) return null;
  for (let i = start + 1; i < candles.length; i++) {
    if (Math.abs(candles[i][1] / candles[i - 1][1] - 1) > 0.35) return null;
  }
  return (candles.at(-1)[1] / candles[start][1] - 1) * 100;
}

export function rankStocks(stocks, series, range) {
  const end = stocks.map(({id}) => series[id]?.at(-1)?.[0]).filter(Boolean).sort().at(-1);
  const ranked = stocks.flatMap(stock => {
    const move = stockMove(series[stock.id], range, end);
    return move === null ? [] : [{...stock, move}];
  }).sort((a, b) => b.move - a.move || a.symbol.localeCompare(b.symbol));
  return {
    end, included: ranked.length,
    gainers: ranked.filter(stock => stock.move > 0).slice(0, 10),
    losers: ranked.filter(stock => stock.move < 0).reverse().slice(0, 10),
  };
}

const cache = new Map();

async function fetchCloses(key, start, end, signal) {
  const url = 'https://api.upstox.com/v3/historical-candle/' + key + '/days/1/' + end + '/' + start;
  const response = await fetch(url, {signal, credentials: 'omit', referrerPolicy: 'no-referrer'});
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload.data?.candles) ? normalizeCandles(payload.data.candles, start, end) : [];
}

export async function loadWatchPrices(stocks, end, signal) {
  const anniversary = rangeStart(end, '1Y');
  const series = Object.create(null);
  for (let offset = 0; offset < stocks.length; offset += 4) {
    if (signal.aborted) break;
    await Promise.allSettled(stocks.slice(offset, offset + 4).map(async ({id}) => {
      const cached = cache.get(id);
      if (cached?.end === end && Date.now() - cached.loadedAt < 900000) {
        series[id] = cached.candles;
        return;
      }
      const key = encodeURIComponent('NSE_EQ|' + id);
      let candles = await fetchCloses(key, anniversary, end, signal);
      if (!candles.length || signal.aborted) return;
      if (candles[0][0] !== anniversary) {
        let earlier = [];
        try {
          earlier = await fetchCloses(key, daysBefore(anniversary, 7), daysBefore(anniversary, 1), signal);
        } catch {
          // Retain recent data even when the baseline request fails.
        }
        candles = [...earlier, ...candles];
      }
      if (signal.aborted) return;
      cache.set(id, {end, candles, loadedAt: Date.now()});
      series[id] = candles;
    }));
  }
  return series;
}
