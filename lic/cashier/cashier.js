import { observeAuth, storageError } from '../../shared/firebase-client.js';
import { DENOMINATIONS, blankCash, money, cashTotal, transactionDetails } from './model.mjs';
import { watchActive, watchCounters, watchTransactions, startCounter, saveEntry } from './storage.js';

const $ = id => document.getElementById(id);
const format = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value / 100);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const fresh = () => ({ id: crypto.randomUUID(), atMs: Date.now(), amounts: [{ amount: '', label: '' }], received: blankCash(), returned: blankCash() });
let uid = null, generation = 0, stops = [], stopLog = () => {}, counters = [], active = null, selected = null, initialized = false;
let logEntries = [], reviewing = false, reviewIndex = 0;
let openingId = crypto.randomUUID(), draft = fresh(), mode = 'received', busy = false;
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
  draft = fresh();
  try {
    const stored = key() ? JSON.parse(localStorage.getItem(key()) || 'null') : null;
    if (stored && Array.isArray(stored.amounts) && stored.received && stored.returned && typeof stored.id === 'string') {
      draft = stored;
    }
  } catch { $('error').textContent = 'Could not restore the previous draft. Saved transaction logs are unaffected.'; }
}
function clearDraft() { try { localStorage.removeItem(key()); } catch {} }
function setBusy(value) {
  busy = value;
  $('nextTransaction').textContent = value ? 'Saving…' : 'Next Transaction';
  $('confirmClose').textContent = value ? 'Closing…' : 'Close Counter';
  for (const id of ['nextTransaction', 'closeCounter', 'retryCounter', 'confirmClose', 'cancelClose', 'counterPicker', 'addAmount', 'addAmountLine', 'doneAmounts', 'openCoins', 'openMenu', 'openLog']) $(id).disabled = value;
  $('previousEntry').disabled = value || !uid || !logEntries.length;
  $('amountInput').disabled = value;
  for (const id of ['amounts', 'coinDenominations']) $(id).querySelectorAll('input,button').forEach(el => { el.disabled = value; });
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
  $('amounts').innerHTML = draft.amounts.map((item, i) => `<div class="amount-row"><label>Amount ${i + 1} (₹)<input class="line-amount" data-index="${i}" data-field="amount" inputmode="decimal" enterkeyhint="next" type="text" value="${esc(item.amount)}" autocomplete="off"></label><button class="remove-amount" data-remove="${i}" aria-label="Remove amount ${i + 1}" ${draft.amounts.length === 1 ? 'disabled' : ''}>×</button><details class="reference-field" ${item.label ? 'open' : ''}><summary>Reference</summary><label>Reference (optional)<input data-index="${i}" data-field="label" maxlength="120" value="${esc(item.label)}" autocomplete="off"></label></details></div>`).join('');
}
function renderPrimary() {
  const single = draft.amounts.length === 1;
  $('amountInput').readOnly = !single;
  if (single) $('amountInput').value = draft.amounts[0].amount;
  else {
    try { $('amountInput').value = String(draft.amounts.reduce((sum, item) => sum + money(item.amount), 0) / 100); }
    catch { $('amountInput').value = ''; }
  }
  $('addAmount').textContent = single ? '+' : `${draft.amounts.length}×`;
}
function renderCash() {
  $('receivedMode').setAttribute('aria-pressed', String(mode === 'received'));
  $('returnedMode').setAttribute('aria-pressed', String(mode === 'returned'));
  const row = n => `<div class="denomination"><span class="value">₹${n}</span><div class="row-increments" role="group" aria-label="Add ₹${n} notes or coins">${[1, 5, 10, 50, 100].map(count => `<button type="button" data-note="${n}" data-add="${count}" aria-label="Add ${count} of ₹${n}">+${count}</button>`).join('')}</div><div class="count-row"><input type="number" inputmode="numeric" min="0" max="1000000" step="1" enterkeyhint="done" data-count="${n}" aria-label="₹${n} count" value="${esc(cash().counts[n])}"></div><strong class="row-total" data-subtotal="${n}" aria-label="₹${n} row total">${format(n * 100 * cash().counts[n])}</strong></div>`;
  $('denominations').innerHTML = DENOMINATIONS.filter(n => n >= 10).map(row).join('');
  $('coinDenominations').innerHTML = DENOMINATIONS.filter(n => n < 10).map(row).join('');
  $('loose').value = String(cash().loose / 100);
  updateSummary();
}
function updateSummary() {
  let received = 0, returned = 0;
  try {
    cash().loose = money($('loose').value);
    received = cashTotal(draft.received); returned = cashTotal(draft.returned);
    $('cashTotal').textContent = format(cashTotal(cash()));
    $('coinTotal').textContent = format([5, 2, 1].reduce((sum, n) => sum + n * 100 * cash().counts[n], 0));
    const details = transactionDetails(draft);
    $('due').textContent = format(details.due);
    const diff = details.difference;
    $('saveState').textContent = diff === 0 ? 'Balanced' : `${diff < 0 ? 'Short' : 'Change to give'} ${format(Math.abs(diff))}`;
    $('saveState').dataset.balanced = String(diff === 0);
  } catch {
    $('due').textContent = '₹0';
    $('saveState').textContent = hasEntry() ? 'Check entry' : '—';
    $('saveState').dataset.balanced = 'false';
  }
  $('runningSummary').innerHTML = `<span>Received <strong>${format(received)}</strong></span><span>Change <strong>${format(returned)}</strong></span>`;
  saveDraft();
}
function cashTable(value) {
  return `<table class="cash-table"><thead><tr><th>Denomination</th><th>Count</th><th>Amount</th></tr></thead><tbody>${DENOMINATIONS.map(n => `<tr><td>₹${n}</td><td>${value.counts[n]}</td><td>${format(n * 100 * value.counts[n])}</td></tr>`).join('')}<tr><td>Misc. / loose change</td><td>—</td><td>${format(value.loose)}</td></tr><tr><th>Total cash</th><td></td><th>${format(cashTotal(value))}</th></tr></tbody></table>`;
}
function renderClosed(counter) {
  $('closingSummary').innerHTML = `<div class="closing-heading"><h2>Closing cash</h2><span>${counter.transactionCount} entries</span></div><div class="closing-totals"><div>Opening<strong>${format(cashTotal(counter.opening))}</strong></div><div>Collections<strong>${format(counter.collected)}</strong></div><div>Received<strong>${format(counter.cashIn)}</strong></div><div>Change<strong>${format(counter.cashOut)}</strong></div></div>${cashTable(counter.balance)}<div class="action-buttons"><button id="printSummary">Print</button><button id="newCounter" class="primary">New Counter</button></div>`;
  $('printSummary').onclick = () => window.print();
  $('newCounter').onclick = () => choose(active?.status === 'open' ? active.id : null);
}
function render() {
  if (!uid || !initialized) return;
  const counter = currentCounter(), open = counter?.status === 'open';
  $('workspace').hidden = false;
  $('closingSummary').hidden = !counter || open;
  for (const id of ['entryPanel', 'cashPanel', 'runningSummary', 'footerActions']) $(id).hidden = !open;
  $('counterLabel').textContent = counter ? `${open ? 'Open' : 'Closed'} · ${counter.transactionCount} entries` : 'Loading…';
  renderPicker();
  if (open) { renderPrimary(); renderAmounts(); renderCash(); }
  else if (counter) renderClosed(counter);
  setBusy(busy);
}
function renderLog() {
  $('previousEntry').disabled = busy || !uid || !logEntries.length;
  $('logCount').textContent = `${logEntries.length} entries`;
  $('logCount').hidden = reviewing;
  $('logStatus').textContent = logEntries.length ? '' : 'No entries.';
  $('reviewNav').hidden = !reviewing;
  $('logTitle').textContent = reviewing && logEntries[reviewIndex] ? `Entry #${logEntries[reviewIndex].sequence}` : 'Transaction log';
  $('olderEntry').disabled = reviewIndex >= logEntries.length - 1;
  $('newerEntry').disabled = reviewIndex <= 0;
  $('reviewPosition').textContent = logEntries.length ? `${reviewIndex + 1} / ${logEntries.length}` : '';
  $('log').innerHTML = logEntries.map((entry, index) => `<details class="log-entry" ${reviewing ? (index === reviewIndex ? 'open' : 'hidden') : ''}><summary><strong>#${entry.sequence} · ${format(entry.due)}</strong> · ${esc(new Date(entry.atMs).toLocaleTimeString('en-IN'))} · In ${format(entry.received)}, out ${format(entry.returned)}</summary><p>${entry.amounts.map(item => `${esc(item.label || 'Amount')}: ${format(item.amount)}`).join('<br>')}</p><h3>Cash received</h3>${cashTable(entry.receivedCash)}<h3>Change given</h3>${cashTable(entry.returnedCash)}</details>`).join('');
  if (reviewing && $('logDialog').open) $('logDialog').scrollTop = 0;
}
function choose(id) {
  if (busy) return;
  if (id) $('retryCounter').hidden = true;
  for (const name of ['amountDialog', 'coinDialog', 'logDialog']) $(name).close();
  logEntries = []; reviewing = false; reviewIndex = 0; $('previousEntry').disabled = true;
  selected = id; mode = 'received'; $('error').textContent = ''; restoreDraft();
  stopLog(); $('log').replaceChildren(); $('logCount').textContent = ''; $('logStatus').textContent = id ? 'Loading saved entries…' : '';
  if (id) {
    const token = generation, wanted = id;
    stopLog = watchTransactions(uid, id, entries => {
      if (token !== generation || wanted !== selected) return;
      const inspectedId = reviewing ? logEntries[reviewIndex]?.id : null;
      logEntries = [...entries].sort((a, b) => (b.sequence || 0) - (a.sequence || 0) || b.atMs - a.atMs);
      reviewIndex = Math.max(0, inspectedId ? logEntries.findIndex(item => item.id === inspectedId) : 0);
      renderLog();
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
    clearDraft(); draft = fresh(); mode = 'received';
    if (close) $('closeDialog').close();
    $('status').textContent = '';
    render(); if (!close) document.querySelector('.amount-input')?.focus();
  } catch (error) {
    if (token === generation) { fail(error); if (close) $('closeError').textContent = $('error').textContent; }
  } finally { if (token === generation) { setBusy(false); } }
}
$('amounts').addEventListener('input', event => {
  const { index, field } = event.target.dataset;
  if (index === undefined || !field || busy) return;
  draft.amounts[index][field] = event.target.value; $('amountError').textContent = ''; renderPrimary(); updateSummary();
});
$('amounts').addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button || busy || draft.amounts.length <= 1) return;
  draft.amounts.splice(Number(button.dataset.remove), 1); renderAmounts(); renderPrimary(); updateSummary();
});
$('addAmountLine').onclick = () => {
  if (busy || draft.amounts.length >= 100) return;
  draft.amounts.push({ amount: '', label: '' }); renderAmounts(); renderPrimary(); updateSummary();
  $('amounts').querySelectorAll('.line-amount')[draft.amounts.length - 1]?.focus();
};
for (const container of ['denominations', 'coinDenominations']) {
  $(container).addEventListener('click', event => {
    if (busy || !editable()) return;
    const add = event.target.closest('[data-note]');
    if (!add) return;
    document.activeElement?.blur(); // Dismiss the mobile keyboard before note counting.
    const n = Number(add.dataset.note);
    cash().counts[n] = Math.max(0, Math.min(1_000_000, (cash().counts[n] || 0) + Number(add.dataset.add)));
    document.querySelector(`[data-count="${n}"]`).value = cash().counts[n];
    document.querySelector(`[data-subtotal="${n}"]`).textContent = format(n * 100 * cash().counts[n]);
    updateSummary();
  });
  $(container).addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.matches('[data-count]')) { event.preventDefault(); event.target.blur(); } });
  $(container).addEventListener('input', event => {
    const n = Number(event.target.dataset.count);
    if (!n || busy) return;
    cash().counts[n] = event.target.value === '' ? NaN : Number(event.target.value);
    document.querySelector(`[data-subtotal="${n}"]`).textContent = Number.isSafeInteger(cash().counts[n]) ? format(n * 100 * cash().counts[n]) : '—';
    updateSummary();
  });
}
for (const target of ['received', 'returned']) $(target + 'Mode').onclick = () => {
  if (busy) return;
  try { cash().loose = money($('loose').value); mode = target; renderCash(); } catch (error) { fail(error); }
};
$('loose').oninput = updateSummary;
$('counterPicker').onchange = () => { $('menuDialog').close(); choose($('counterPicker').value || null); };
$('amountInput').oninput = () => { if (!busy && draft.amounts.length === 1) { draft.amounts[0].amount = $('amountInput').value; updateSummary(); } };
$('amountInput').onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); $('amountInput').blur(); } };
$('loose').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); $('loose').blur(); } });
$('openMenu').onclick = () => $('menuDialog').showModal();
$('openLog').onclick = () => { reviewing = false; renderLog(); $('menuDialog').close(); $('logDialog').showModal(); };
$('previousEntry').onclick = () => { if (busy || !uid || !logEntries.length) return; reviewing = true; reviewIndex = 0; renderLog(); $('logDialog').showModal(); };
$('olderEntry').onclick = () => { if (reviewIndex < logEntries.length - 1) { reviewIndex++; renderLog(); } };
$('newerEntry').onclick = () => { if (reviewIndex > 0) { reviewIndex--; renderLog(); } };
$('showAllEntries').onclick = () => { reviewing = false; renderLog(); };
$('openCoins').onclick = () => $('coinDialog').showModal();
$('addAmount').onclick = () => { $('amountError').textContent = ''; renderAmounts(); $('amountDialog').showModal(); };
$('doneAmounts').onclick = () => {
  try { transactionDetails({ ...draft, received: blankCash(), returned: blankCash() }); renderPrimary(); updateSummary(); $('amountDialog').close(); }
  catch (error) { $('amountError').textContent = error.message; }
};
for (const button of document.querySelectorAll('[data-close]')) button.onclick = () => { $(button.dataset.close).close(); document.activeElement?.blur(); };
$('nextTransaction').onclick = () => commit(false);
const confirmCounterClose = () => { if (!busy) { $('closeError').textContent = ''; $('closeDialog').showModal(); } };
$('closeCounter').onclick = confirmCounterClose;
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
  logEntries = []; reviewing = false; reviewIndex = 0; $('previousEntry').disabled = true;
  draft = fresh(); $('workspace').hidden = true; $('retryCounter').hidden = true; $('amounts').replaceChildren(); $('denominations').replaceChildren(); $('coinDenominations').replaceChildren(); $('amountError').textContent = ''; $('log').replaceChildren(); $('closingSummary').replaceChildren(); $('amountInput').value = ''; for (const dialog of document.querySelectorAll('dialog')) dialog.close(); $('error').textContent = '';
  $('counterPicker').innerHTML = '<option value="">New counter</option>'; $('counterPicker').disabled = !uid; $('openLog').disabled = !uid; $('counterLabel').textContent = ''; $('logCount').textContent = ''; $('logStatus').textContent = ''; $('runningSummary').replaceChildren(); $('loose').value = '0'; $('coinTotal').textContent = '₹0';
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
