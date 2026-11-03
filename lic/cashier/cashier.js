import { observeAuth, storageError } from '../../shared/firebase-client.js';
import { DENOMINATIONS, blankCash, money, cashTotal, transactionDetails } from './model.mjs';
import { watchActive, watchCounters, watchTransactions, startCounter, saveEntry } from './storage.js';

const $ = id => document.getElementById(id);
const format = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value / 100);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const fresh = () => ({ id: crypto.randomUUID(), atMs: Date.now(), stage: 'amounts', amounts: [{ amount: '', label: '' }], received: blankCash(), returned: blankCash() });
let uid = null, generation = 0, stops = [], stopLog = () => {}, counters = [], active = null, selected = null, initialized = false;
let openingId = crypto.randomUUID(), draft = fresh(), mode = 'received', busy = false, hasRecovery = false;
const currentCounter = () => selected ? (active?.id === selected ? active : counters.find(item => item.id === selected)) : null;
const starting = () => !currentCounter();
const editable = () => starting() || currentCounter()?.status === 'open';
const cash = () => draft[mode];
const key = () => uid && selected ? `invincible.cashier.draft.${uid}.${selected}` : null;
function fail(error) { $('error').textContent = error?.code ? storageError(error) : error.message; }
function saveDraft() {
  try { if (key()) localStorage.setItem(key(), JSON.stringify(draft)); }
  catch { $('error').textContent = 'Draft recovery is unavailable on this device. Keep this page open until your entry is saved.'; }
}
function restoreDraft() {
  draft = fresh(); hasRecovery = false;
  try {
    const stored = key() ? JSON.parse(localStorage.getItem(key()) || 'null') : null;
    if (stored && Array.isArray(stored.amounts) && stored.received && stored.returned && typeof stored.id === 'string') {
      draft = stored;
      if (!['amounts', 'cash'].includes(draft.stage)) draft.stage = cashTotal(draft.received) || cashTotal(draft.returned) ? 'cash' : 'amounts';
      hasRecovery = true;
    }
  } catch { $('error').textContent = 'Could not restore the previous draft. Saved transaction logs are unaffected.'; }
}
function clearDraft() { try { localStorage.removeItem(key()); } catch {} }
function setBusy(value) {
  busy = value;
  for (const id of ['nextTransaction', 'closeCounter', 'closeFromAmounts', 'retryCounter', 'confirmClose', 'cancelClose', 'counterPicker', 'addAmount', 'countCash', 'editAmounts', 'amountStep', 'cashStep']) $(id).disabled = value;
  $('amounts').querySelectorAll('input,button').forEach(el => { el.disabled = value; });
  if (draft.amounts.length === 1) $('amounts').querySelector('[data-remove]')?.setAttribute('disabled', '');
  $('cashPanel').querySelectorAll('input,button').forEach(el => { el.disabled = value; });
}
function renderPicker() {
  const items = [...counters];
  if (active && !items.some(item => item.id === active.id)) items.unshift(active);
  $('counterPicker').innerHTML = `<option value="" ${active?.status === 'open' ? 'disabled' : ''}>New counter</option>` + items.map(item => `<option value="${esc(item.id)}">${esc(new Date(item.createdAtMs).toLocaleString('en-IN'))} · ${item.status === 'open' ? 'Open' : 'Closed'}</option>`).join('');
  $('counterPicker').value = selected || '';
}
function renderAmounts() {
  $('amounts').innerHTML = draft.amounts.map((item, i) => `<div class="amount-row"><label>Amount ${i + 1} (₹)<input class="amount-input" data-index="${i}" data-field="amount" inputmode="decimal" enterkeyhint="next" type="text" value="${esc(item.amount)}" autocomplete="off"></label><button class="remove-amount" data-remove="${i}" aria-label="Remove amount ${i + 1}" ${draft.amounts.length === 1 ? 'disabled' : ''}>×</button><details class="reference-field" ${item.label ? 'open' : ''}><summary>Reference</summary><label>Reference (optional)<input data-index="${i}" data-field="label" maxlength="120" value="${esc(item.label)}" autocomplete="off"></label></details></div>`).join('');
}
function renderCash() {
  $('cashTitle').textContent = 'Notes & coins';
  $('receivedMode').setAttribute('aria-pressed', String(mode === 'received'));
  $('returnedMode').setAttribute('aria-pressed', String(mode === 'returned'));
  const row = n => `<div class="denomination"><span class="value">₹${n} <span class="times" aria-hidden="true">×</span></span><div class="row-increments" role="group" aria-label="Add ₹${n} notes or coins">${[1, 5, 10, 50, 100].map(count => `<button type="button" data-note="${n}" data-add="${count}" aria-label="Add ${count} of ₹${n}">+${count}</button>`).join('')}</div><div class="count-row"><button type="button" data-minus="${n}" aria-label="Remove one ₹${n}">−</button><input type="number" inputmode="numeric" min="0" max="1000000" step="1" data-count="${n}" aria-label="₹${n} count" value="${esc(cash().counts[n])}"></div><strong class="row-total" data-subtotal="${n}" aria-label="₹${n} row total">${format(n * 100 * cash().counts[n])}</strong></div>`;
  const coinsOpen = [5, 2, 1].some(n => cash().counts[n] !== 0);
  $('denominations').innerHTML = DENOMINATIONS.filter(n => n >= 10).map(row).join('') + `<details class="coin-rows" ${coinsOpen ? 'open' : ''}><summary>Coins <span>₹5 · ₹2 · ₹1</span></summary>${DENOMINATIONS.filter(n => n < 10).map(row).join('')}</details>`;
  $('loose').value = String(cash().loose / 100);
  updateSummary();
}
function updateSummary() {
  let error = '';
  try {
    cash().loose = money($('loose').value);
    $('cashTotal').textContent = format(cashTotal(cash()));
    if (!starting()) {
      const details = transactionDetails(draft);
      $('due').textContent = format(details.due);
      $('contextDue').textContent = format(details.due);
      const diff = details.difference;
      const label = diff === 0 ? 'Balanced' : diff < 0 ? 'Shortage' : 'Change still to give';
      $('runningSummary').innerHTML = metric('Received', details.received) + metric('Change', details.returned);
      $('saveState').textContent = diff === 0 ? 'Balanced' : `${label}: ${format(Math.abs(diff))}`;
      $('saveState').dataset.balanced = String(diff === 0);
    }
  } catch (e) {
    error = e.message;
    if (!starting()) {
      $('due').textContent = '—';
      $('runningSummary').innerHTML = `<div class="summary-item"><span>Entry incomplete</span><strong>${esc(error)}</strong></div>`;
      $('saveState').textContent = error;
      $('saveState').dataset.balanced = 'false';
    }
  }
  // Validation stays inline while typing; saving provides an explicit error if needed.
  if (starting() && error) $('cashTotal').textContent = 'Check counts';
  saveDraft();
}
function metric(label, value, className = '') { return `<div class="summary-item ${className}"><span>${esc(label)}</span><strong>${format(value)}</strong></div>`; }
function cashTable(value) {
  return `<table class="cash-table"><thead><tr><th>Denomination</th><th>Count</th><th>Amount</th></tr></thead><tbody>${DENOMINATIONS.map(n => `<tr><td>₹${n}</td><td>${value.counts[n]}</td><td>${format(n * 100 * value.counts[n])}</td></tr>`).join('')}<tr><td>Misc. / loose change</td><td>—</td><td>${format(value.loose)}</td></tr><tr><th>Total cash</th><td></td><th>${format(cashTotal(value))}</th></tr></tbody></table>`;
}
function renderClosed(counter) {
  $('closingSummary').innerHTML = `<p class="eyebrow">COUNTER CLOSED</p><h2>Closing cash</h2><p class="hint">${esc(new Date(counter.closedAtMs).toLocaleString('en-IN'))} · ${counter.transactionCount} saved entries</p><div class="closing-totals"><div>Opening cash<strong>${format(cashTotal(counter.opening))}</strong></div><div>Net collections<strong>${format(counter.collected)}</strong></div><div>Cash received<strong>${format(counter.cashIn)}</strong></div><div>Change returned<strong>${format(counter.cashOut)}</strong></div></div>${cashTable(counter.balance)}<button id="printSummary">Print summary</button> <button id="newCounter" class="primary">New Counter</button>`;
  $('printSummary').onclick = () => window.print();
  $('newCounter').onclick = () => choose(active?.status === 'open' ? active.id : null);
}
function render() {
  if (!uid || !initialized) return;
  const counter = currentCounter(), isStarting = !counter, open = counter?.status === 'open';
  $('workspace').hidden = false;
  $('entrySteps').hidden = !open;
  $('closingSummary').hidden = !counter || open; $('logPanel').hidden = !counter;
  $('counterLabel').textContent = isStarting ? 'Loading your zero cash counter…' : `${open ? 'Open' : 'Closed'} · ${counter.transactionCount} entries`;
  $('entryNumber').textContent = `#${(counter?.transactionCount || 0) + 1}${hasRecovery ? ' · Draft' : ''}`;
  renderPicker();
  if (open) { renderAmounts(); renderCash(); }
  else if (counter) renderClosed(counter);
  showStage();
  setBusy(busy);
}
function showStage() {
  const counter = currentCounter(), open = counter?.status === 'open', counting = draft.stage === 'cash';
  $('entryPanel').hidden = !open || counting;
  $('cashPanel').hidden = !(open && counting);
  $('amountContext').hidden = !open || !counting;
  $('runningSummary').hidden = !open || !counting;
  $('footerActions').hidden = !open || !counting;
  $('amountStep').toggleAttribute('aria-current', !counting);
  if (!counting) $('amountStep').setAttribute('aria-current', 'step');
  $('cashStep').toggleAttribute('aria-current', counting);
  if (counting) $('cashStep').setAttribute('aria-current', 'step');
}
function goCash() {
  if (busy || currentCounter()?.status !== 'open') return;
  try {
    transactionDetails({ ...draft, received: blankCash(), returned: blankCash() });
    draft.stage = 'cash'; $('error').textContent = ''; showStage(); updateSummary();
    $('amountContext').scrollIntoView({ block: 'start' });
    document.querySelector('[data-note]')?.focus({ preventScroll: true });
  } catch (error) { fail(error); document.querySelector('.amount-input')?.focus(); }
}
function goAmounts() {
  if (busy || currentCounter()?.status !== 'open') return;
  draft.stage = 'amounts'; showStage(); saveDraft();
  $('entrySteps').scrollIntoView({ block: 'start' });
  document.querySelector('.amount-input')?.focus({ preventScroll: true });
}
function choose(id) {
  if (busy) return;
  if (id) $('retryCounter').hidden = true;
  selected = id; mode = 'received'; $('error').textContent = ''; restoreDraft();
  stopLog(); $('log').replaceChildren(); $('logCount').textContent = ''; $('logStatus').textContent = id ? 'Loading saved entries…' : '';
  if (id) {
    const token = generation, wanted = id;
    stopLog = watchTransactions(uid, id, entries => {
      if (token !== generation || wanted !== selected) return;
      $('logCount').textContent = `${entries.length} entries`;
      $('logStatus').textContent = entries.length ? '' : 'No entries.';
      $('log').innerHTML = entries.map(entry => `<details class="log-entry"><summary><strong>#${entry.sequence} · ${format(entry.due)}</strong> · ${esc(new Date(entry.atMs).toLocaleTimeString('en-IN'))} · In ${format(entry.received)}, out ${format(entry.returned)}</summary><p>${entry.amounts.map(item => `${esc(item.label || 'Amount')}: ${format(item.amount)}`).join('<br>')}</p><h3>Cash received</h3>${cashTable(entry.receivedCash)}<h3>Change given</h3>${cashTable(entry.returnedCash)}</details>`).join('');
    }, error => { if (token === generation) { $('logStatus').textContent = 'Could not load transaction log.'; fail(error); } });
  }
  render();
  if (!id) { openingId = crypto.randomUUID(); void openZeroCounter(); }
}
function hasEntry() {
  return draft.amounts.some(item => item.amount.trim() || item.label.trim()) || cashTotal(draft.received) !== 0 || cashTotal(draft.returned) !== 0;
}
async function commit(close = false) {
  if (busy || !uid) return;
  const owner = uid, token = generation, counter = currentCounter();
  if (!counter || counter.status !== 'open') {
    if (close) $('closeDialog').close();
    return;
  }
  $('error').textContent = ''; $('closeError').textContent = '';
  try {
    // Explicitly reject incomplete cash inputs; never save a previously valid loose value.
    cash().loose = money($('loose').value);
    const entry = hasEntry() ? draft : null;
    if (!entry && !close) throw new Error('Enter a transaction amount first.');
    if (entry && transactionDetails(entry).difference !== 0) throw new Error('Balance the cash and change before saving.');
    setBusy(true);
    await saveEntry(owner, counter.id, entry, close, () => uid === owner && generation === token);
    if (uid !== owner || generation !== token) return;
    clearDraft(); draft = fresh(); hasRecovery = false; mode = 'received';
    if (close) $('closeDialog').close();
    $('status').textContent = close ? 'Closed.' : 'Saved.';
    render(); if (!close) document.querySelector('.amount-input')?.focus();
  } catch (error) {
    if (token === generation) { fail(error); if (close) $('closeError').textContent = $('error').textContent; }
  } finally { if (token === generation) { setBusy(false); } }
}
$('amounts').addEventListener('input', event => {
  const { index, field } = event.target.dataset;
  if (index === undefined || !field || busy) return;
  draft.amounts[index][field] = event.target.value; updateSummary();
});
$('amounts').addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button || busy || draft.amounts.length <= 1) return;
  draft.amounts.splice(Number(button.dataset.remove), 1); renderAmounts(); updateSummary();
});
$('addAmount').onclick = () => {
  if (busy || draft.amounts.length >= 100) return;
  draft.amounts.push({ amount: '', label: '' }); renderAmounts(); updateSummary();
  document.querySelectorAll('.amount-input')[draft.amounts.length - 1]?.focus();
};
$('denominations').addEventListener('click', event => {
  if (busy || !editable()) return;
  const add = event.target.closest('[data-note]'), minus = event.target.closest('[data-minus]');
  if (!add && !minus) return;
  const n = Number(add?.dataset.note || minus.dataset.minus);
  const next = cash().counts[n] + (add ? Number(add.dataset.add) : -1);
  cash().counts[n] = Math.max(0, Math.min(1_000_000, next));
  document.querySelector(`[data-count="${n}"]`).value = cash().counts[n];
  document.querySelector(`[data-subtotal="${n}"]`).textContent = format(n * 100 * cash().counts[n]);
  updateSummary();
});
$('denominations').addEventListener('input', event => {
  const n = Number(event.target.dataset.count);
  if (!n || busy) return;
  cash().counts[n] = event.target.value === '' ? NaN : Number(event.target.value);
  document.querySelector(`[data-subtotal="${n}"]`).textContent = Number.isSafeInteger(cash().counts[n]) ? format(n * 100 * cash().counts[n]) : 'Check count';
  updateSummary();
});
for (const target of ['received', 'returned']) $(target + 'Mode').onclick = () => {
  if (busy) return;
  try { cash().loose = money($('loose').value); mode = target; renderCash(); } catch (error) { fail(error); }
};
$('loose').oninput = updateSummary;
$('counterPicker').onchange = () => choose($('counterPicker').value || null);
$('countCash').onclick = goCash;
$('cashStep').onclick = goCash;
$('editAmounts').onclick = goAmounts;
$('amountStep').onclick = goAmounts;
$('amounts').addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.target.matches('.amount-input')) { event.preventDefault(); goCash(); }
});
$('nextTransaction').onclick = () => commit(false);
const confirmCounterClose = () => { if (!busy) { $('closeError').textContent = ''; $('closeDialog').showModal(); } };
$('closeCounter').onclick = confirmCounterClose;
$('closeFromAmounts').onclick = confirmCounterClose;
$('cancelClose').onclick = () => { if (!busy) $('closeDialog').close(); };
$('closeDialog').addEventListener('cancel', event => { if (busy) event.preventDefault(); });
$('confirmClose').onclick = () => commit(true);
async function openZeroCounter() {
  if (busy || !uid || !starting()) return;
  const owner = uid, token = generation;
  try {
    setBusy(true); $('error').textContent = ''; $('retryCounter').hidden = true;
    $('status').textContent = 'Loading…';
    const id = await startCounter(owner, openingId, blankCash(), () => uid === owner && generation === token);
    if (uid !== owner || token !== generation) return;
    if (active?.id !== id) active = { id, status: 'open', opening: blankCash(), balance: blankCash(), transactionCount: 0, collected: 0, cashIn: 0, cashOut: 0, createdAtMs: Date.now() };
    setBusy(false); choose(id);
    $('status').textContent = '';
  } catch (error) {
    if (token === generation) {
      if (active?.status === 'open') { setBusy(false); choose(active.id); $('status').textContent = ''; }
      else { fail(error); $('status').textContent = 'Counter unavailable. Retry.'; $('retryCounter').hidden = false; }
    }
  }
  finally { if (token === generation) setBusy(false); }
}
$('retryCounter').onclick = openZeroCounter;
observeAuth(user => {
  generation++; const token = generation;
  stops.forEach(stop => stop()); stops = []; stopLog(); stopLog = () => {};
  uid = user?.uid || null; counters = []; active = null; selected = null; initialized = false; busy = false;
  draft = fresh(); $('workspace').hidden = true; $('retryCounter').hidden = true; $('amounts').replaceChildren(); $('denominations').replaceChildren(); $('log').replaceChildren(); $('closingSummary').replaceChildren(); $('closeDialog').close(); $('error').textContent = '';
  $('status').textContent = uid ? 'Loading…' : 'Sign in from Dashboard.';
  if (!uid) return;
  stops.push(watchCounters(uid, (items, cached) => {
    if (token !== generation) return;
    counters = items;
    if (initialized) { renderPicker(); if (currentCounter()?.status === 'closed') render(); }
    if (cached) $('status').textContent = 'Offline · saving unavailable.';
  }, error => { if (token === generation) fail(error); }));
  stops.push(watchActive(uid, item => {
    if (token !== generation) return;
    active = item;
    if (!initialized) { initialized = true; choose(item?.status === 'open' ? item.id : null); if (item?.status === 'open') $('status').textContent = ''; }
    else if (!busy && starting() && item?.status === 'open') { choose(item.id); $('status').textContent = ''; }
    else if (!busy && item?.id === selected && item.status === 'closed') { render(); }
    else if (!busy) { renderPicker(); $('counterLabel').textContent = currentCounter() ? `${currentCounter().status === 'open' ? 'Open' : 'Closed'} · ${currentCounter().transactionCount} entries` : 'New counter'; }
  }, error => { if (token === generation) fail(error); }));
}).catch(fail);
