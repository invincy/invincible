import {useState} from 'react';
import {projectSip} from './sip-projection.mjs';

const benchmark = {
  rate: 6.70,
  date: '30 Oct 2026',
  source: 'https://www.niftyindices.com/Factsheet/ind_nifty50.pdf?trk=public_post_comment-text',
};
const number = value => value === '' ? NaN : Number(value);

export function SipProjection({balance, scheduled, money}) {
  const [payment, setPayment] = useState(null);
  const [increase, setIncrease] = useState('0');
  const [years, setYears] = useState('5');
  const [scenario, setScenario] = useState('nifty');
  const [customRate, setCustomRate] = useState('');
  const startingPayment = number(payment ?? scheduled);
  const step = number(increase);
  const result = projectSip({
    balance, payment: startingPayment, increase: step, years: number(years),
    annualRate: scenario === 'nifty' ? benchmark.rate : number(customRate),
  });

  return <details className="pf-surface pf-projection">
    <summary>If I keep investing</summary>
    <div className="pf-extra-controls">
      <label>Starting SIP (₹/month)<input type="number" min="0" step="any" value={payment ?? scheduled} onChange={event => setPayment(event.target.value)}/></label>
      <label>Increase each month (₹)<input type="number" min="0" step="any" value={increase} onChange={event => setIncrease(event.target.value)}/></label>
      <label>Years<input type="number" min="1" max="50" step="1" value={years} onChange={event => setYears(event.target.value)}/></label>
      <label>Return assumption<select value={scenario} onChange={event => setScenario(event.target.value)}>
        <option value="nifty">Nifty 50 historical · {benchmark.rate.toFixed(2)}%</option>
        <option value="custom">Custom</option>
      </select></label>
      {scenario === 'custom' && <label>Annual return (%)<input type="number" min="-99.99" max="100" step="any" value={customRate} onChange={event => setCustomRate(event.target.value)}/></label>}
    </div>
    {scenario === 'nifty' && <p>Nifty 50 five-year annualised total return as of {benchmark.date}. <a href={benchmark.source} target="_blank" rel="noreferrer">Factsheet</a></p>}
    {result ? <>
      {step > 0 && <p>First three payments: {[0, 1, 2].map(month => money(startingPayment + month * step)).join(' → ')} · Final payment: {money(result.finalPayment)}</p>}
      <dl className="pf-projection-results" aria-live="polite">
        <div><dt>Current fund value</dt><dd>{money(balance)}</dd></div>
        <div><dt>New contributions</dt><dd>{money(result.contributed)}</dd></div>
        <div><dt>Projected growth</dt><dd>{money(result.growth)}</dd></div>
        <div><dt>Projected value</dt><dd><strong>{money(result.endingValue)}</strong></dd></div>
      </dl>
    </> : <p role="status">Enter valid amounts, 1–50 whole years and an annual return above −100% and up to 100%.</p>}
    <small>Scenario uses month-end payments and steady compounding, before taxes and fund costs.</small>
  </details>;
}
