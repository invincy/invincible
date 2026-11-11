export const ranges = ['7D', '1M', '3M', '6M', '1Y'];
const day = 86400000;
const iso = date => date.toISOString().slice(0, 10);
const dateOf = value => new Date(value + 'T00:00:00Z');
const distance = (a, b) => (dateOf(a) - dateOf(b)) / day;

export function rangeStart(end, range) {
  const date = dateOf(end);
  if (range === '7D') return iso(new Date(+date - 7 * day));
  const months = range === '1Y' ? 12 : Number(range.slice(0, -1));
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(lastDay, date.getUTCDate()));
  return iso(first);
}

export function normalizeCandles(candles, start, end) {
  const byDate = new Map();
  for (const candle of candles) {
    const date = candle?.[0]?.slice(0, 10);
    const close = candle?.[4];
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && date >= start && date <= end &&
        Number.isFinite(close) && close > 0) byDate.set(date, close);
  }
  return [...byDate].sort(([a], [b]) => a.localeCompare(b));
}

export async function fetchEquityHistory(ids, end, signal) {
  const start = iso(new Date(+dateOf(rangeStart(end, '1Y')) - 14 * day));
  const requested = [...ids, 'benchmark'];
  const series = Object.create(null);
  for (let i = 0; i < requested.length; i += 4) {
    if (signal.aborted) break;
    await Promise.allSettled(requested.slice(i, i + 4).map(async id => {
      const key = id === 'benchmark' ? 'NSE_INDEX|Nifty 50' : 'NSE_EQ|' + id;
      const url = 'https://api.upstox.com/v3/historical-candle/' + encodeURIComponent(key) + '/days/1/' + end + '/' + start;
      const response = await fetch(url, {signal, credentials: 'omit', referrerPolicy: 'no-referrer'});
      if (!response.ok) return;
      const payload = await response.json();
      if (Array.isArray(payload.data?.candles)) series[id] = normalizeCandles(payload.data.candles, start, end);
    }));
  }
  return series;
}

export const unrealised = h => h.units * h.price - h.cost;

export function frontMovers(rows) {
  const equities = rows.filter(h => h.kind === 'equity');
  const gains = equities.filter(h => unrealised(h) > 0).sort((a, b) => unrealised(b) - unrealised(a));
  const losses = equities.filter(h => unrealised(h) < 0).sort((a, b) => unrealised(a) - unrealised(b));
  const movers = [...gains.slice(0, 2), ...losses.slice(0, 2)];
  const ids = new Set(movers.map(h => h.id));
  return [...movers, ...rows.filter(h => !ids.has(h.id))];
}

export function analyzeEquity(holdings, series, range, today) {
  const active = holdings.filter(h => h.units > 0);
  const end = active.map(h => series[h.id]?.at(-1)?.[0] || '').sort().at(-1);
  const result = {end, count: active.length, included: 0, rows: new Map(), points: [], missing: [], stale: false};
  if (!end) {
    result.missing = active.map(h => h.name);
    return result;
  }
  result.stale = distance(today, end) > 5;
  const boundary = rangeStart(end, range);
  const candidates = active.flatMap(h => {
    const prices = new Map(series[h.id] || []);
    const dates = [...prices.keys()];
    // Large discontinuities need a corporate-action check before using the closes.
    const suspect = dates.some((date, index) => index > 0 && date > boundary &&
      Math.abs(prices.get(date) / prices.get(dates[index - 1]) - 1) > 0.35);
    if (suspect || !prices.has(end) || !dates.some(date => date <= boundary && distance(boundary, date) <= 7)) {
      result.missing.push(h.name);
      return [];
    }
    return [{h, prices, dates}];
  });
  if (!candidates.length) return result;
  const common = candidates[0].dates.filter(date => candidates.every(item => item.prices.has(date)));
  const start = common.findLast(date => date <= boundary && distance(boundary, date) <= 7);
  if (!start || start === end) {
    result.missing = active.map(h => h.name);
    return result;
  }
  result.included = candidates.length;
  result.start = start;
  const benchmark = new Map(series.benchmark || []);
  const indexStart = benchmark.get(start);
  const hasIndex = indexStart && benchmark.has(end);
  for (const {h, prices} of candidates) {
    const first = prices.get(start);
    const last = prices.get(end);
    result.rows.set(h.id, {percent: (last / first - 1) * 100, contribution: (last - first) * h.units, last});
  }
  for (const date of common.filter(date => date >= start && date <= end)) {
    const value = candidates.reduce((sum, {h, prices}) => sum + h.units * prices.get(date), 0);
    const indexClose = benchmark.get(date);
    const base = result.points[0]?.value || value;
    result.points.push({date, value, percent: (value / base - 1) * 100,
      benchmark: hasIndex && indexClose ? (indexClose / indexStart - 1) * 100 : null});
  }
  return result;
}
