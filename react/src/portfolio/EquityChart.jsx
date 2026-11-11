import {useEffect, useMemo, useState} from 'react';
import {analyzeEquity, fetchEquityHistory, ranges} from './equity-analysis.mjs';
import {todayIST} from './model.mjs';

const dateFormat = new Intl.DateTimeFormat('en-IN', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'});
const dateLabel = date => dateFormat.format(new Date(date + 'T00:00:00Z'));
export const percentage = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

export function useEquityAnalysis(holdings, enabled, range) {
  const [response, setResponse] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const today = todayIST();
  const keys = holdings.filter(h => h.units > 0 && /^(INE|INF)[A-Z0-9]{9}$/.test(h.id)).map(h => h.id).sort().join(',');
  const request = today + ':' + attempt + ':' + keys;
  const series = response?.request === request ? response.series : null;
  useEffect(() => {
    if (!enabled || !keys || response?.request === request) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    fetchEquityHistory(keys.split(','), today, controller.signal).then(data => {
      if (active) setResponse({request, series:data});
    }).finally(() => clearTimeout(timeout));
    return () => {active = false; clearTimeout(timeout); controller.abort();};
  }, [enabled, keys, request, response, today]);
  const analysis = useMemo(() => analyzeEquity(holdings, series || {}, range, today), [holdings, series, range, today]);
  return {analysis, loading: enabled && Boolean(keys) && !series, refresh: () => setAttempt(n => n + 1)};
}

function PriceChart({points, percent, compare, money}) {
  const [position, setPosition] = useState(points.length - 1);
  const last = points.length - 1;
  const index = Math.min(last, position);
  const format = percent ? percentage : money;
  const values = points.flatMap(p => compare && p.benchmark !== null ? [p.percent, p.benchmark] : [percent ? p.percent : p.value]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = i => 4 + (i / last) * 592;
  const y = value => 120 - (value - min) / span * 108;
  const primary = points.map((p, i) => x(i) + ',' + y(percent ? p.percent : p.value)).join(' ');
  const benchmark = points.map((p, i) => p.benchmark === null ? '' : x(i) + ',' + y(p.benchmark)).filter(Boolean).join(' ');
  const selected = points[index];

  return <>
    <div className="pf-price-reading"><time dateTime={selected.date}>{dateLabel(selected.date)}</time><strong>{format(percent ? selected.percent : selected.value)}</strong>{compare && selected.benchmark !== null && <span>Nifty 50 {percentage(selected.benchmark)}</span>}</div>
    <svg className="pf-price-chart" viewBox="0 0 600 132" preserveAspectRatio="none" role="img" aria-label="History of current equity holdings" onPointerDown={event => {
      const rect = event.currentTarget.getBoundingClientRect();
      const fraction = (event.clientX - rect.left) / rect.width;
      setPosition(Math.round(Math.max(0, Math.min(1, fraction)) * last));
    }}>
      {[12, 48, 84, 120].map(level => <line key={level} x1="0" x2="600" y1={level} y2={level} stroke="var(--pf-line)" vectorEffect="non-scaling-stroke"/>)}
      <polyline points={primary} fill="none" stroke="var(--pf-accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
      {compare && <polyline points={benchmark} fill="none" stroke="#f0c47d" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke"/>}
      <line x1={x(index)} x2={x(index)} y1="0" y2="132" stroke="var(--pf-muted)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke"/>
    </svg>
    <input className="pf-chart-scrubber" aria-label="Select a chart date" aria-valuetext={dateLabel(selected.date)} type="range" min="0" max={last} value={index} onChange={e => setPosition(Number(e.target.value))}/>
    <div className="pf-chart-dates"><span>{dateLabel(points[0].date)}</span><span>{dateLabel(points[last].date)}</span></div>
  </>;
}

export function EquityChart({range, setRange, analysis, loading, refresh, money}) {
  const [percent, setPercent] = useState(false);
  const [benchmark, setBenchmark] = useState(false);
  const canCompare = analysis.points.some(p => p.benchmark !== null);
  return <section className="pf-surface pf-growth pf-equity-chart">
    <div className="pf-section-heading">
      <h2>Equity performance</h2>
      <div className="pf-switch" aria-label="Chart metric">
        <button aria-pressed={!percent} onClick={() => setPercent(false)}>Value ₹</button>
        <button aria-pressed={percent} onClick={() => setPercent(true)}>Return %</button>
      </div>
    </div>
    <div className="pf-equity-ranges pf-switch" aria-label="Performance period">
      {ranges.map(item => <button key={item} aria-pressed={range === item} onClick={() => setRange(item)}>{item}</button>)}
    </div>
    {analysis.points.length > 1 ? <PriceChart key={range + analysis.end + analysis.included} points={analysis.points} percent={percent} compare={percent && benchmark && canCompare} money={money}/>
      : <div className="pf-chart-empty" role="img" aria-label="No price chart available"/>}
    {loading ? <p role="status">Loading daily closing prices…</p>
      : analysis.points.length ? <div className="pf-equity-meta">
        <span>Current holdings · closing prices · {analysis.included}/{analysis.count} covered</span>
        <button onClick={refresh}>Refresh</button>
      </div>
      : <div className="pf-equity-meta"><span>{analysis.count ? 'No comparable closing prices for this period.' : 'Add an equity holding to see performance.'}</span>{analysis.count > 0 && <button onClick={refresh}>Retry</button>}</div>}
    {percent && analysis.points.length > 0 && <label className="pf-compare"><input type="checkbox" checked={benchmark && canCompare} disabled={!canCompare} onChange={e => setBenchmark(e.target.checked)}/>{canCompare ? 'Compare Nifty 50' : 'Nifty 50 history unavailable'}</label>}
    {analysis.stale && <p role="status">Latest available close is {dateLabel(analysis.end)}.</p>}
    {analysis.missing.length > 0 && <details className="pf-history-coverage"><summary>{analysis.missing.length} holdings without comparable prices</summary><p>{analysis.missing.join(', ')}</p></details>}
  </section>;
}
