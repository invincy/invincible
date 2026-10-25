import { observeAuth, storageError } from '../../shared/firebase-client.js';
import { fields, outcomes, parseCSV, autoMapping, previewImport, currentPhone, contactability, mobile, statusLabel, matches, localDate, daysFromToday, applyResponse } from './model.mjs';
import { watchPolicies, watchHistory, importPolicies, logResponse, changeCaseState } from './storage.js';
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = value => value === null || value === undefined ? 'Amount unavailable' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
let user = null, generation = 0, loaded = false, busy = false, records = [], page = 0, parsed = null, preview = null, selectedId = '', eventId = '', importId = '', pendingCaseChange = null, pendingResponse = null, stopPolicies = () => {}, stopHistory = () => {}, historyGeneration = 0;
function status(message, error = false) { $('status').textContent = message; $('status').className = error ? 'error' : ''; }
function controls() {
  $('openImport').disabled = busy || !loaded || !user;
  document.querySelectorAll(':is(#importDialog, #detailDialog) :is(button, input, select, textarea)').forEach(el => { el.disabled = busy; });
  if (pendingResponse || pendingCaseChange) document.querySelectorAll('#responseForm input, #responseForm select, #responseForm textarea, #quickResponses button').forEach(el => { el.disabled = true; });
  $('confirmImport').disabled = busy || !preview || !!preview.errors.length || !preview.records.length;
  $('saveResponse').disabled = busy || !user || !loaded || !!pendingCaseChange;
  $('archiveCase').disabled = $('restoreCase').disabled = busy || !user || !loaded || !!pendingResponse;
  const selected = records.find(r => r.id === selectedId), archived = pendingCaseChange ? !pendingCaseChange.archived : !!selected?.archived;
  $('archiveCase').hidden = archived; $('restoreCase').hidden = !archived;
  $('archiveCase').textContent = pendingCaseChange ? 'Retry removal' : 'Remove from active list';
  $('restoreCase').textContent = pendingCaseChange ? 'Retry restoration' : 'Restore to active list';
  $('saveResponse').textContent = pendingResponse ? 'Retry saved response' : 'Save response';
  document.querySelectorAll('[data-open]').forEach(el => { el.disabled = busy || !loaded; });
}
function linked(record) { return record.opPolicies?.length ? `<div class="op-links"><strong>OP-NAPped</strong> · ${record.opPolicies.map(esc).join(' · ')}</div>` : ''; }
function phoneHTML(record) { const phone = contactability(record); return phone.tel ? `<a class="call" href="tel:${phone.tel}">${esc(phone.label)} ↗</a>` : `<span class="badge warn">${esc(phone.label)}</span><small>${esc(currentPhone(record))}</small>`; }
function render() {
  const today = localDate(), views = ['all', 'due', 'new', 'missing_op'], labels = ['Active cases', 'Follow-ups due', 'Not yet contacted', 'Missing/invalid mobile + OP-NAPped'];
  $('metrics').innerHTML = views.map((view, i) => `<div class="metric"><strong>${records.filter(r => matches(r, { view, today })).length}</strong><span>${labels[i]}</span></div>`).join('');
  const plan = $('plan').value;
  $('plan').innerHTML = '<option value="">All plans</option>' + [...new Set(records.map(r => r.plan).filter(Boolean))].sort().map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('');
  $('plan').value = [...$('plan').options].some(o => o.value === plan) ? plan : '';
  const filtered = records.filter(r => matches(r, { query: $('search').value, view: $('view').value, plan: $('plan').value, today })).sort((a, b) => (a.followUpDate || '9999').localeCompare(b.followUpDate || '9999') || a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(filtered.length / 30)); page = Math.min(page, pages - 1);
  $('resultCount').textContent = `${filtered.length} of ${records.length} policies`;
  $('pageLabel').textContent = `Page ${page + 1} of ${pages}`; $('previous').disabled = !page; $('next').disabled = page + 1 >= pages;
  $('records').innerHTML = filtered.slice(page * 30, page * 30 + 30).map(r => `<article class="policy-card"><div><h3>${esc(r.name)}</h3><small>Policy ${esc(r.policyNo)} · Plan ${esc(r.plan || '—')}</small>${linked(r)}</div><div><span class="amount">${money(r.amount)}</span><small>Due ${esc(r.dueDate || 'Not provided')}</small>${r.sourceStatus ? `<small>Source status: ${esc(r.sourceStatus)}</small>` : ''}</div><div>${phoneHTML(r)}<br><span class="badge ${contactability(r).kind !== 'valid' ? 'warn' : ''}">${esc(statusLabel(r))}</span><small>${r.followUpDate ? `Follow-up ${esc(r.followUpDate)}` : 'No follow-up scheduled'}</small></div><button data-open="${esc(r.id)}">Open / log</button></article>`).join('') || `<div class="empty"><strong>${!user ? 'Sign in to your Invincible account' : !loaded ? 'Loading your policies…' : records.length ? 'No matching policies' : 'Your follow-up list starts here'}</strong>${!user ? '<a href="../../">Open Dashboard to sign in</a>' : records.length ? 'Try another search or view.' : 'Import a CSV to review policies and plan your calls.'}</div>`;
  controls();
}
function detailInfo(record) {
  $('detailTitle').textContent = record.name; $('detailPolicy').textContent = `POLICY ${record.policyNo} · PLAN ${record.plan || '—'}`;
  $('detailInfo').innerHTML = `<div>${phoneHTML(record)} <span class="badge">${esc(statusLabel(record))}</span></div><div class="details-grid"><div><small>Amount</small>${money(record.amount)}</div><div><small>Due date</small>${esc(record.dueDate || 'Not provided')}</div><div><small>Branch / claim type</small>${esc(record.branch || '—')} / ${esc(record.claimType || '—')}</div><div><small>Source status</small>${esc(record.sourceStatus || '—')}</div></div>${linked(record)}`;
  if (record.archived) $('detailInfo').insertAdjacentHTML('beforeend', `<p class="notice">Archived: ${esc({ completed: 'case completed', missing_csv: 'not in the latest replacement CSV', manual: 'removed from active list' }[record.archiveReason] || 'removed from active list')}. All remarks and history are retained.</p>`);
}
function stamp(value) { const date = value?.toDate ? value.toDate() : value?.seconds ? new Date(value.seconds * 1000) : new Date(value); return Number.isNaN(date.valueOf()) ? 'Time pending' : date.toLocaleString(); }
function closeDetail() { stopHistory(); historyGeneration++; selectedId = ''; pendingResponse = null; pendingCaseChange = null; $('responseForm').reset(); $('history').replaceChildren(); for (const id of ['detailTitle', 'detailPolicy', 'detailInfo', 'detailError', 'historyStatus']) $(id).replaceChildren(); $('detailDialog').close(); }
function openDetail(id) {
  if (busy || !loaded) return;
  const record = records.find(r => r.id === id); if (!record) return;
  stopHistory(); const historyToken = ++historyGeneration, token = generation;
  selectedId = id; eventId = crypto.randomUUID(); pendingResponse = null; pendingCaseChange = null; $('responseForm').reset(); $('outcome').value = 'note'; $('followUpDate').value = record.followUpDate || ''; $('detailError').textContent = ''; detailInfo(record); controls();
  $('history').replaceChildren(); $('historyStatus').textContent = 'Loading history…'; $('detailDialog').showModal();
  stopHistory = watchHistory(user.uid, id, events => {
    if (token !== generation || historyToken !== historyGeneration) return;
    $('historyStatus').textContent = events.length ? `${events.length} saved entries` : 'No responses logged yet.';
    $('history').innerHTML = events.map(event => `<li><strong>${esc(({ ...outcomes, case_removed: 'Removed from active list', case_restored: 'Restored to active list' })[event.outcome] || event.outcome)}</strong><time>${esc(stamp(event.at))}</time>${event.note ? `<p>${esc(event.note)}</p>` : ''}<small>Follow-up: ${esc(event.followUpDate || 'None')}${event.phoneCorrection ? ` · Mobile corrected to ${esc(event.phoneCorrection)}` : ''}</small></li>`).join('');
  }, error => { if (token === generation && historyToken === historyGeneration) $('historyStatus').textContent = storageError(error); });
}
$('outcome').innerHTML = Object.entries(outcomes).map(([key, label]) => `<option value="${key}">${label}</option>`).join('');
$('view').insertAdjacentHTML('beforeend', Object.entries(outcomes).filter(([key]) => !['note', 'completed'].includes(key)).map(([key, label]) => `<option value="${key}">${label}</option>`).join(''));
const quick = [['replied', 'Customer replied', null], ['whatsapp', 'Will WhatsApp', 1], ['submitting', 'Submit tomorrow', 1], ['submitting', 'Submit in 3 days', 3], ['submitting', 'Submit in 7 days', 7], ['no_answer', 'No answer', 1], ['wrong_number', 'Wrong number', null], ['completed', 'Completed', null]];
$('quickResponses').innerHTML = quick.map(([, label], i) => `<button type="button" data-quick="${i}">${label}</button>`).join('');
$('quickResponses').onclick = event => { const button = event.target.closest('[data-quick]'); if (!button || busy) return; const [outcome, , days] = quick[Number(button.dataset.quick)]; $('outcome').value = outcome; if (days !== null) $('followUpDate').value = daysFromToday(days); if (outcome === 'completed') $('followUpDate').value = ''; };
$('outcome').onchange = () => { if ($('outcome').value === 'completed') $('followUpDate').value = ''; };
$('responseForm').onsubmit = async event => {
  event.preventDefault(); if (busy || !loaded || !user) return;
  const token = generation, account = user.uid, id = selectedId;
  const response = pendingResponse || { id: eventId, outcome: $('outcome').value, note: $('note').value.trim(), followUpDate: $('followUpDate').value, phoneCorrection: $('phoneCorrection').value.trim() || null, at: new Date().toISOString() };
  try { applyResponse(records.find(r => r.id === id), response); } catch (error) { $('detailError').textContent = error.message; return; }
  pendingResponse = response; busy = true; controls(); $('detailError').textContent = ''; status('Saving response…');
  try {
    await logResponse(account, id, response, () => token === generation);
    if (token !== generation) return;
    pendingResponse = null; eventId = crypto.randomUUID(); $('note').value = ''; $('phoneCorrection').value = ''; $('outcome').value = 'note'; status('Response and history saved to Firebase.');
  } catch (error) { if (token === generation) { $('detailError').textContent = storageError(error) + ' Your original response is retained. Retry to confirm it before editing again.'; status('Response was not confirmed. Your form is retained; retry to finish saving.', true); } }
  finally { if (token === generation) { busy = false; controls(); } }
};
async function setArchived(archived) {
  if (busy || !loaded || !user || pendingResponse) return;
  const token = generation, account = user.uid, id = selectedId;
  pendingCaseChange ||= { id: crypto.randomUUID(), archived };
  const request = pendingCaseChange; busy = true; controls(); $('detailError').textContent = '';
  try {
    await changeCaseState(account, id, request.id, request.archived, () => token === generation);
    if (token !== generation) return;
    pendingCaseChange = null; status(request.archived ? 'Case removed from the active list. Remarks and history are saved in Archived cases.' : 'Case restored with its previous remarks and history.');
  } catch (error) { if (token === generation) $('detailError').textContent = storageError(error) + ' Retry the same action to confirm it safely.'; }
  finally { if (token === generation) { busy = false; controls(); } }
}
$('archiveCase').onclick = () => setArchived(true); $('restoreCase').onclick = () => setArchived(false);
$('records').onclick = event => { const button = event.target.closest('[data-open]'); if (button) openDetail(button.dataset.open); };
for (const id of ['search', 'view', 'plan']) $(id).addEventListener(id === 'search' ? 'input' : 'change', () => { page = 0; render(); });
$('previous').onclick = () => { page--; render(); }; $('next').onclick = () => { page++; render(); };
function invalidatePreview() { preview = null; $('previewSection').hidden = true; controls(); }
function clearImport() { parsed = null; importId = crypto.randomUUID(); invalidatePreview(); $('importMode').value = 'replace'; $('mappingSection').hidden = true; $('mapping').replaceChildren(); $('csvText').value = ''; $('csvFile').value = ''; $('importError').textContent = ''; }
function replacementSummary() {
  const included = new Set(preview?.records.map(r => r.policyNo) || []);
  const removed = records.filter(r => !r.archived && !included.has(r.policyNo)).length;
  $('replacementSummary').textContent = $('importMode').value === 'replace' ? `${removed} active cases absent from this CSV will move to Archived cases after all incoming policies save. Their remarks, dates and history will remain available.` : 'Only add or update the policies in this CSV. Other cases will stay in your active list.';
}
$('importMode').onchange = replacementSummary;
$('openImport').onclick = () => { if (!busy && loaded) { clearImport(); $('importDialog').showModal(); } };
$('csvText').oninput = () => { parsed = null; invalidatePreview(); $('mappingSection').hidden = true; };
$('csvFile').onchange = async () => {
  const file = $('csvFile').files[0], token = generation; if (!file) return;
  try { if (file.size > 5_000_000) throw new Error('Choose a CSV file below 5 MB.'); const text = await file.text(); if (token !== generation) return; $('csvText').value = text; readColumns(); } catch (error) { if (token === generation) $('importError').textContent = error.message; }
};
function readColumns() {
  invalidatePreview(); $('importError').textContent = '';
  try {
    parsed = parseCSV($('csvText').value); const mapping = autoMapping(parsed.headers);
    $('mapping').innerHTML = fields.map(([key, label]) => `<label>${esc(label)}${['policyNo', 'name'].includes(key) ? ' *' : ''}<select data-map="${key}"><option value="-1">Not included</option>${parsed.headers.map((header, index) => `<option value="${index}" ${mapping[key] === index ? 'selected' : ''}>${esc(header)}</option>`).join('')}</select></label>`).join('');
    $('mappingSection').hidden = false;
  } catch (error) { parsed = null; $('mappingSection').hidden = true; $('importError').textContent = error.message; }
}
$('readCSV').onclick = readColumns; $('mapping').onchange = invalidatePreview;
$('previewCSV').onclick = () => {
  invalidatePreview(); $('importError').textContent = '';
  try {
    if (!parsed) throw new Error('Read the CSV columns first.');
    preview = previewImport(parsed, Object.fromEntries([...document.querySelectorAll('[data-map]')].map(el => [el.dataset.map, Number(el.value)])));
    const existing = new Set(records.map(r => r.policyNo)), updates = preview.records.filter(r => existing.has(r.policyNo)).length;
    const missingOP = preview.records.filter(r => matches(r, { view: 'missing_op' })).length;
    $('importSummary').textContent = `${preview.records.length} unique policies: ${preview.records.length - updates} new, ${updates} existing. ${preview.duplicates} identical duplicate rows skipped. ${missingOP} with missing/invalid mobile + OP-NAPped. ${preview.errors.length} errors.`;
    $('previewRows').innerHTML = preview.records.map(r => `<div class="preview-row"><strong>${esc(r.name)}</strong> · ${esc(r.policyNo)} · Plan ${esc(r.plan || '—')}<br>${money(r.amount)} · Due ${esc(r.dueDate || '—')} · Mobile ${esc(r.phone || 'Missing')} ${mobile(r.phone).kind === 'invalid' ? '(invalid)' : ''}${linked(r)}</div>`).join('');
    $('importError').textContent = preview.errors.length ? preview.errors.slice(0, 30).join('\n') + '\nFix the errors in your CSV and preview again. Nothing has been imported.' : '';
    $('previewSection').hidden = false; replacementSummary(); controls();
  } catch (error) { $('importError').textContent = error.message; }
};
$('confirmImport').onclick = async () => {
  if (busy || !loaded || !user || !preview || preview.errors.length || !preview.records.length) return;
  const token = generation, account = user.uid, rows = preview.records; let done = 0; busy = true; controls(); $('importError').textContent = '';
  try {
    const result = await importPolicies(account, rows, () => token === generation, count => { done = count; $('importSummary').textContent = `Saved ${count} of ${rows.length} policies…`; }, { mode: $('importMode').value, importId });
    if (token !== generation) return;
    $('importDialog').close(); clearImport(); status(`${rows.length} policies imported. ${result.archived} missing cases archived. Existing remarks and history preserved.`);
  } catch (error) { if (token === generation) $('importError').textContent = `${done} policies confirmed before import stopped. ${storageError(error)} Retrying this import is duplicate-safe.`; }
  finally { if (token === generation) { busy = false; controls(); } }
};
[$('importDialog'), $('detailDialog')].forEach(dialog => {
  const close = () => { if (busy) return; if (dialog.id === 'detailDialog') closeDetail(); else { dialog.close(); clearImport(); } };
  dialog.querySelector('.close').onclick = close;
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
});
observeAuth(current => {
  const token = ++generation; stopPolicies(); closeDetail(); $('importDialog').close(); clearImport(); user = current; records = []; loaded = false; busy = false; page = 0;
  $('search').value = ''; $('view').value = 'all'; render();
  if (!current) { status('Sign in on Dashboard to use your private follow-up manager.'); return; }
  status('Loading your policies…');
  stopPolicies = watchPolicies(current.uid, (rows, cached) => {
    if (token !== generation) return; records = rows; loaded = true; render();
    const selected = records.find(r => r.id === selectedId); if (selected) detailInfo(selected);
    if (!busy) status(cached ? 'Cached policies · checking Firebase. Saving requires a connection.' : 'Synced to Firebase · private to your Invincible account.');
  }, error => { if (token === generation) { loaded = false; controls(); status(storageError(error), true); } });
}).catch(error => status(storageError(error), true));
render();
