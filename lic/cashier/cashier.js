import { observeAuth, storageError } from '../../shared/firebase-client.js';
import { DENOMINATIONS, blankCash, money, cashTotal, transactionDetails } from './model.mjs';
import { watchActive, watchCounters, watchTransactions, startCounter, saveEntry } from './storage.js';

const $ = id => document.getElementById(id);
const format = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value / 100);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const fresh = () => ({ id: crypto.randomUUID(), atMs: Date.now(), amounts: [{ amount: '', label: '' }], received: blankCash(), returned: blankCash() });
let uid = null, generation = 0, stops = [], stopLog = () => {}, counters = [], active = null, selected = null, initialized = false;
let opening = blankCash(), openingId = crypto.randomUUID(), draft = fresh(), mode = 'received', step = 1, busy = false, hasRecovery = false;
const currentCounter = () => selected ? (active?.id === selected ? active : counters.find(item => item.id === selected)) : null;
const starting = () => !currentCounter();
const editable = () => starting() || currentCounter()?.status === 'open';
const cash = () => starting() ? opening : draft[mode];
const key = () => uid ? `invincible.cashier.draft.${uid}.${selected || 'opening'}` : null;
function fail(error) { $('error').textContent = error?.code ? storageError(error) : error.message; }
function saveDraft() {
  try { if (key()) localStorage.setItem(key(), JSON.stringify(starting() ? { opening, openingId } : draft)); }
  catch { $('error').textContent = 'Draft recovery is unavailable on this device. Keep this page open until your entry is saved.'; }
}
function restoreDraft() {
  draft = fresh(); opening = blankCash(); openingId = crypto.randomUUID(); hasRecovery = false;
  try {
    const stored = JSON.parse(localStorage.getItem(key()) || 'null');
    if (stored && starting() && stored.opening && typeof stored.openingId === 'string') { opening = stored.opening; openingId = stored.openingId; }
    else if (stored && Array.isArray(stored.amounts) && stored.received && stored.returned && typeof stored.id === 'string') { draft = stored; hasRecovery = true; }
  } catch { $('error').textContent = 'Could not restore the previous draft. Saved transaction logs are unaffected.'; }
}
function clearDraft() { try { localStorage.removeItem(key()); } catch {} }
function setBusy(value) {
  busy = value;
  for (const id of ['nextTransaction', 'closeCounter', 'startCounter', 'confirmClose', 'cancelClose', 'counterPicker', 'addAmount']) $(id).disabled = value;
  $('amounts').querySelectorAll('input,button').forEach(el => { el.disabled = value; });
  $('cashPanel').querySelectorAll('input,button').forEach(el => { el.disabled = value; });
}
function renderPicker() {
  const items = [...counters];
  if (active && !items.some(item => item.id === active.id)) items.unshift(active);
  $('counterPicker').innerHTML = `<option value="" ${active?.status === 'open' ? 'disabled' : ''}>New counter</option>` + items.map(item => `<option value="${esc(item.id)}">${esc(new Date(item.createdAtMs).toLocaleString('en-IN'))} · ${item.status === 'open' ? 'Open' : 'Closed'}</option>`).join('');
  $('counterPicker').value = selected || '';
}
function renderAmounts() {
  $('amounts').innerHTML = draft.amounts.map((item, i) => `<div class="amount-row"><label>Amount ${i + 1} (₹)<input class="amount-input" data-index="${i}" data-field="amount" inputmode="decimal" type="text" value="${esc(item.amount)}" autocomplete="off"></label><label class="amount-label">Reference / note (optional)<input data-index="${i}" data-field="label" maxlength="120" value="${esc(item.label)}" autocomplete="off"></label><button class="remove-amount" data-remove="${i}" aria-label="Remove amount ${i + 1}" ${draft.amounts.length === 1 ? 'disabled' : ''}>×</button></div>`).join('');
}
function renderCash() {
  $('cashTitle').textContent = starting() ? 'Count opening cash' : mode === 'received' ? 'Cash received' : 'Change given';
  document.querySelector('.mode-tabs').hidden = starting();
  $('receivedMode').setAttribute('aria-pressed', String(mode === 'received'));
  $('returnedMode').setAttribute('aria-pressed', String(mode === 'returned'));
  document.querySelectorAll('[data-step]').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.step) === step)));
  $('denominations').innerHTML = DENOMINATIONS.map(n => `<div class="denomination"><button type="button" data-note="${n}" aria-label="Add ${step} of ₹${n}"><span class="value">₹${n}</span><span class="tap">+${step} ${n >= 10 ? 'notes' : 'coins'}</span></button><div class="count-row"><button type="button" data-minus="${n}" aria-label="Remove one ₹${n}">−</button><input type="number" inputmode="numeric" min="0" max="1000000" step="1" data-count="${n}" aria-label="₹${n} count" value="${esc(cash().counts[n])}"></div><small data-subtotal="${n}">${format(n * 100 * cash().counts[n])}</small></div>`).join('');
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
      const diff = details.difference;
      const label = diff === 0 ? 'Balanced' : diff < 0 ? 'Shortage' : 'Change still to give';
      $('runningSummary').innerHTML = metric('Total due', details.due) + metric('Cash received', details.received) + metric('Change given', details.returned) + metric(label, Math.abs(diff), diff === 0 ? 'balanced' : 'short');
    }
  } catch (e) {
    error = e.message;
    if (!starting()) {
      $('due').textContent = '—';
      $('runningSummary').innerHTML = `<div class="summary-item"><span>Entry incomplete</span><strong>${esc(error)}</strong></div>`;
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
  $('closingSummary').innerHTML = `<p class="eyebrow">COUNTER CLOSED</p><h2>Final cash in your counter</h2><p class="hint">${esc(new Date(counter.closedAtMs).toLocaleString('en-IN'))} · ${counter.transactionCount} saved entries</p><div class="closing-totals"><div>Opening cash<strong>${format(cashTotal(counter.opening))}</strong></div><div>Net collections<strong>${format(counter.collected)}</strong></div><div>Cash received<strong>${format(counter.cashIn)}</strong></div><div>Change returned<strong>${format(counter.cashOut)}</strong></div></div>${cashTable(counter.balance)}<p class="hint">Expected closing cash = opening cash + cash received − change returned. Compare these counts with your physical cash.</p><button id="printSummary">Print summary</button> <button id="newCounter" class="primary">Start another counter</button>`;
  $('printSummary').onclick = () => window.print();
  $('newCounter').onclick = () => choose(active?.status === 'open' ? active.id : null);
}
function render() {
  if (!uid || !initialized) return;
  const counter = currentCounter(), isStarting = !counter, open = counter?.status === 'open';
  $('workspace').hidden = false;
  $('startPanel').hidden = !isStarting; $('startCounter').hidden = !isStarting;
  $('entryPanel').hidden = !open; $('cashPanel').hidden = !(isStarting || open);
  $('runningSummary').hidden = !open; $('footerActions').hidden = !open;
  $('closingSummary').hidden = !counter || open; $('logPanel').hidden = !counter;
  $('counterLabel').textContent = isStarting ? 'New counter' : `${open ? 'Counter open' : 'Counter closed'} · ${counter.transactionCount} saved entries`;
  $('entryNumber').textContent = `ENTRY ${(counter?.transactionCount || 0) + 1}${hasRecovery ? ' · RECOVERED DRAFT' : ''}`;
  renderPicker();
  if (isStarting || open) { renderAmounts(); renderCash(); }
  else renderClosed(counter);
  setBusy(busy);
}
function choose(id) {
  if (busy) return;
  selected = id; mode = 'received'; $('error').textContent = ''; restoreDraft();
  stopLog(); $('log').replaceChildren(); $('logCount').textContent = ''; $('logStatus').textContent = id ? 'Loading saved entries…' : '';
  if (id) {
    const token = generation, wanted = id;
    stopLog = watchTransactions(uid, id, entries => {
      if (token !== generation || wanted !== selected) return;
      $('logCount').textContent = `${entries.length} entries`;
      $('logStatus').textContent = entries.length ? '' : 'No saved entries yet.';
      $('log').innerHTML = entries.map(entry => `<details class="log-entry"><summary><strong>#${entry.sequence} · ${format(entry.due)}</strong> · ${esc(new Date(entry.atMs).toLocaleTimeString('en-IN'))} · In ${format(entry.received)}, out ${format(entry.returned)}</summary><p>${entry.amounts.map(item => `${esc(item.label || 'Amount')}: ${format(item.amount)}`).join('<br>')}</p><h3>Cash received</h3>${cashTable(entry.receivedCash)}<h3>Change given</h3>${cashTable(entry.returnedCash)}</details>`).join('');
    }, error => { if (token === generation) { $('logStatus').textContent = 'Could not load transaction log.'; fail(error); } });
  }
  render();
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
    if (!($('cashPanel').hidden)) cash().loose = money($('loose').value);
    const entry = hasEntry() ? draft : null;
    if (!entry && !close) throw new Error('Enter a transaction amount first.');
    if (entry && transactionDetails(entry).difference !== 0) throw new Error('Balance the cash and change before saving.');
    setBusy(true);
    await saveEntry(owner, counter.id, entry, close, () => uid === owner && generation === token);
    if (uid !== owner || generation !== token) return;
    clearDraft(); draft = fresh(); hasRecovery = false; mode = 'received';
    if (close) $('closeDialog').close();
    $('status').textContent = close ? 'Counter closed. Your final cash summary is below.' : 'Transaction saved. Ready for the next one.';
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
  const next = cash().counts[n] + (add ? step : -1);
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
document.querySelectorAll('[data-step]').forEach(button => { button.onclick = () => {
  if (busy) return;
  try { cash().loose = money($('loose').value); step = Number(button.dataset.step); renderCash(); } catch (error) { fail(error); }
}; });
for (const target of ['received', 'returned']) $(target + 'Mode').onclick = () => {
  if (busy) return;
  try { cash().loose = money($('loose').value); mode = target; renderCash(); } catch (error) { fail(error); }
};
$('loose').oninput = updateSummary;
$('counterPicker').onchange = () => choose($('counterPicker').value || null);
$('nextTransaction').onclick = () => commit(false);
$('closeCounter').onclick = () => { $('closeError').textContent = ''; $('closeDialog').showModal(); };
$('cancelClose').onclick = () => { if (!busy) $('closeDialog').close(); };
$('closeDialog').addEventListener('cancel', event => { if (busy) event.preventDefault(); });
$('confirmClose').onclick = () => commit(true);
$('startCounter').onclick = async () => {
  if (busy || !uid || !starting()) return;
  const owner = uid, token = generation;
  try {
    opening.loose = money($('loose').value); setBusy(true); $('error').textContent = '';
    const id = await startCounter(owner, openingId, opening, () => uid === owner && generation === token);
    if (uid !== owner || token !== generation) return;
    try { localStorage.removeItem(`invincible.cashier.draft.${owner}.opening`); } catch {}
    // The active-counter listener provides the authoritative session before editing.
    $('status').textContent = 'Counter started. Enter your first transaction.';
    if (active?.id === id) { setBusy(false); choose(id); }
  } catch (error) { if (token === generation) fail(error); }
  finally { if (token === generation) setBusy(false); }
};
observeAuth(user => {
  generation++; const token = generation;
  stops.forEach(stop => stop()); stops = []; stopLog(); stopLog = () => {};
  uid = user?.uid || null; counters = []; active = null; selected = null; initialized = false; busy = false;
  draft = fresh(); opening = blankCash(); $('workspace').hidden = true; $('amounts').replaceChildren(); $('denominations').replaceChildren(); $('log').replaceChildren(); $('closingSummary').replaceChildren(); $('closeDialog').close(); $('error').textContent = '';
  $('status').textContent = uid ? 'Loading your counter…' : 'Sign in from Dashboard to open your personal cash counter.';
  if (!uid) return;
  stops.push(watchCounters(uid, (items, cached) => {
    if (token !== generation) return;
    counters = items;
    if (initialized) { renderPicker(); if (currentCounter()?.status === 'closed') render(); }
    if (cached) $('status').textContent = 'Showing cached records. Saving requires a connection.';
  }, error => { if (token === generation) fail(error); }));
  stops.push(watchActive(uid, item => {
    if (token !== generation) return;
    active = item;
    if (!initialized) { initialized = true; choose(item?.id || null); $('status').textContent = item?.status === 'open' ? 'Counter resumed. Your saved entries are below.' : 'Ready for your cash counter.'; }
    else if (starting() && item?.status === 'open') { const wasBusy = busy; busy = false; choose(item.id); busy = wasBusy; }
    else if (!busy && item?.id === selected && item.status === 'closed') { render(); }
    else if (!busy) { renderPicker(); $('counterLabel').textContent = currentCounter() ? `${currentCounter().status === 'open' ? 'Counter open' : 'Counter closed'} · ${currentCounter().transactionCount} saved entries` : 'New counter'; }
  }, error => { if (token === generation) fail(error); }));
}).catch(fail);
