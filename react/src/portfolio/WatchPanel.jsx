import {useEffect, useState} from 'react';
import {loadWatchPrices, parseConstituents, rankStocks, stockMove, universes, watchRanges} from './watch-market.mjs';

const marketClock = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
});
function closingDate() {
  const [date, hour] = marketClock.format(new Date()).split(' ');
  return Number(hour) >= 16 ? date : new Date(Date.parse(date + 'T00:00:00Z') - 86400000).toISOString().slice(0, 10);
}

const percent = value => value == null ? '—' : (value > 0 ? '+' : '') + value.toFixed(2) + '%';

export function WatchPanel({watchlist, onToggle, busy}) {
  const [universe, setUniverse] = useState('large');
  const [range, setRange] = useState('7D');
  const [direction, setDirection] = useState('gainers');
  const [imports, setImports] = useState({});
  const [attempt, setAttempt] = useState(0);
  const [market, setMarket] = useState(null);
  const [savedPrices, setSavedPrices] = useState(null);
  const [fileError, setFileError] = useState('');
  const selected = universes[universe];
  const imported = imports[universe];
  const day = closingDate();
  const marketKey = universe + ':' + attempt + ':' + day;
  const watchKey = watchlist.map(stock => stock.id).join(',') + ':' + attempt + ':' + day;

  useEffect(() => {
    const controller = new AbortController();
    const {signal} = controller;
    async function load() {
      try {
        let stocks = imported;
        if (!stocks) {
          const response = await fetch(selected.file, {signal, credentials: 'omit'});
          if (!response.ok) throw Error('Constituent list unavailable.');
          stocks = parseConstituents(await response.text(), selected.size);
        }
        const series = await loadWatchPrices(stocks, day, signal);
        if (!signal.aborted) setMarket({key: marketKey, stocks, series});
      } catch {
        if (!signal.aborted) setMarket({key: marketKey, error: true});
      }
    }
    load();
    return () => controller.abort();
  }, [selected, imported, marketKey, day]);

  useEffect(() => {
    if (!watchlist.length) return;
    const controller = new AbortController();
    loadWatchPrices(watchlist, day, controller.signal).then(series => {
      if (!controller.signal.aborted) setSavedPrices({key: watchKey, series});
    });
    return () => controller.abort();
  }, [watchlist, watchKey, day]);

  const current = market?.key === marketKey ? market : null;
  const ranking = current?.stocks && rankStocks(current.stocks, current.series, range);
  const saved = savedPrices?.key === watchKey ? savedPrices.series : null;
  const savedEnd = Object.values(saved || {}).map(candles => candles.at(-1)?.[0]).filter(Boolean).sort().at(-1);
  const watchedIds = new Set(watchlist.map(stock => stock.id));

  async function loadFile(file) {
    if (!file) return;
    try {
      if (file.size > 250000) throw Error('Use a CSV under 250 KB.');
      const stocks = parseConstituents(await file.text(), selected.size);
      setImports(previous => ({...previous, [universe]: stocks}));
      setFileError('');
      setAttempt(previous => previous + 1);
    } catch (error) {
      setFileError(error.message);
    }
  }

  function watchButton(stock) {
    const watched = watchedIds.has(stock.id);
    return <button type="button" disabled={busy} aria-label={(watched ? 'Remove ' : 'Watch ') + stock.symbol}
      aria-pressed={watched} onClick={() => onToggle({id: stock.id, name: stock.name, symbol: stock.symbol})}>{watched ? '★' : '☆'}</button>;
  }

  return <div className="pf-watch">
    <section className="pf-surface">
      <div className="pf-section-heading"><h2>Market movers</h2><button type="button" onClick={() => setAttempt(attempt + 1)}>Retry data</button></div>
      <div className="pf-extra-controls">
        <label>Index<select value={universe} onChange={event => {setUniverse(event.target.value);setFileError('');}}>
          {Object.entries(universes).map(([key, {name}]) => <option key={key} value={key}>{name}</option>)}
        </select></label>
        <label>Period<select value={range} onChange={event => setRange(event.target.value)}>
          {watchRanges.map(period => <option key={period}>{period}</option>)}
        </select></label>
        <label>Show<select value={direction} onChange={event => setDirection(event.target.value)}>
          <option value="gainers">Top 10 gainers</option><option value="losers">Top 10 losers</option>
        </select></label>
      </div>
      {!current && <p role="status">Loading constituents and closing prices…</p>}
      {current?.error && <div>
        <p role="status">Couldn’t load the index list. Download the official CSV and import it here.</p>
        <a href={selected.file} target="_blank" rel="noreferrer">Download {selected.name} CSV</a>
        <label className="pf-watch-import">Import constituents CSV<input type="file" accept=".csv,text/csv" onChange={event => {loadFile(event.target.files[0]);event.target.value = '';}}/></label>
      </div>}
      {fileError && <p role="alert">{fileError}</p>}
      {ranking && <>
        <p role="status">{ranking.included ? ranking.included + '/' + current.stocks.length + ' stocks with comparable closes · ' + ranking.end : 'No comparable closing prices available for this period.'}</p>
        <ul className="pf-watch-list">
          {ranking[direction].map(stock => <li key={stock.id}>
            <span><b>{stock.symbol}</b><small>{stock.name}</small></span>
            <strong className={stock.move >= 0 ? 'pf-up' : 'pf-down'}>{percent(stock.move)}</strong>
            {watchButton(stock)}
          </li>)}
        </ul>
        {!!ranking.included && !ranking[direction].length && <p>No {direction} in the available data.</p>}
      </>}
    </section>
    <section className="pf-surface">
      <div className="pf-section-heading"><h2>My watchlist</h2></div>
      {!watchlist.length && <p>Star a stock in Market movers to track it here.</p>}
      {!!watchlist.length && <><p role="status">{savedEnd ? 'Closing prices through ' + savedEnd : saved ? 'Closing prices unavailable.' : 'Loading saved stocks…'}</p>
        <ul className="pf-watch-list">
          {watchlist.map(stock => <li key={stock.id}>
            <span><b>{stock.symbol}</b><small>{stock.name}</small></span>
            <span className="pf-watch-periods">{watchRanges.map(period => <small key={period}>{period} <b>{percent(stockMove(saved?.[stock.id], period, savedEnd))}</b></small>)}</span>
            {watchButton(stock)}
          </li>)}
        </ul>
      </>}
    </section>
  </div>;
}
