import { observeAuth, storageError } from '../../shared/firebase-client.js';
import { normalizeCustomer, matchesCustomer, dueState, todayIndia } from './model.mjs?v=1';
import { watchCustomers, saveCustomer } from './storage.js?v=1';
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = value => value == null ? 'Premium not entered' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
const dateLabel = value => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z')) : 'No due date';
let user = null, generation = 0, loaded = false, busy = false, rows = [], stop = () => {}, editing = null, pending = null;
function status(message, error = false) { $('status').textContent = message; $('status').className = error ? 'error' : ''; }
function controls() {
  $('addCustomer').disabled = !user || !loaded || busy;
  document.querySelectorAll('#customerForm input, #customerForm textarea, #customerForm button').forEach(el => { el.disabled = busy || (!!pending && el.id !== 'saveCustomer' && el.id !== 'cancelEdit'); });
  $('closeDialog').disabled = busy;
  document.querySelectorAll('[data-edit]').forEach(el => { el.disabled = busy || !loaded; });
  $('saveCustomer').disabled = !user || !loaded || busy;
  $('saveCustomer').textContent = busy ? 'Saving…' : pending ? 'Retry save' : 'Save customer';
}
function render() {
  const today = todayIndia(), policies = rows.flatMap(r => r.policies || []);
  $('metrics').innerHTML = [[rows.length, 'Customers'], [policies.filter(p => dueState(p.dueDate, today) === 'overdue').length, 'Overdue policies'], [policies.filter(p => dueState(p.dueDate, today) === 'soon').length, 'Due in 30 days']].map(([n, label]) => `<div class="metric"><strong>${n}</strong><span>${label}</span></div>`).join('');
  const filtered = rows.filter(r => matchesCustomer(r, $('search').value, $('view').value, today)).sort((a,b) => a.name.localeCompare(b.name));
  $('resultCount').textContent = `${filtered.length} of ${rows.length} customers`;
  $('records').innerHTML = filtered.map(r => `<article class="customer"><div class="customer-heading"><div><h2>${esc(r.name)}</h2><span class="muted">${esc(r.phone || 'No mobile')}${r.email ? ` · ${esc(r.email)}` : ''}</span></div><button data-edit="${esc(r.id)}">Edit</button></div>${r.notes ? `<details><summary>Notes</summary><p class="notes">${esc(r.notes)}</p></details>` : ''}<div class="policies">${[...(r.policies || [])].sort((a,b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).map(p => `<div class="policy"><div><strong>${esc(p.policyNo)}</strong><small>${esc(p.plan || 'Plan not entered')}</small></div><div>${money(p.premium)}<small class="due ${dueState(p.dueDate, today)}">${p.dueDate ? `${dueState(p.dueDate, today) === 'overdue' ? 'Overdue · ' : 'Due '}${dateLabel(p.dueDate)}` : 'No due date'}</small></div></div>`).join('') || '<span class="help">No policies added yet.</span>'}</div></article>`).join('') || `<div class="empty">${!user ? 'Sign in on Dashboard to view your private customer records.' : !loaded ? 'Loading customers…' : rows.length ? 'No matching customers.' : 'No customers yet. Add your first customer to get started.'}</div>`;
  controls();
}
function addPolicy(p = {}) {
  const fieldset = document.createElement('fieldset'); fieldset.className = 'policy-editor';
  fieldset.innerHTML = `<legend>Policy</legend><div class="form-grid"><label>Policy number<input data-field="policyNo" required maxlength="60" value="${esc(p.policyNo)}"></label><label>Plan<input data-field="plan" maxlength="100" value="${esc(p.plan)}"></label><label>Premium amount (₹)<input data-field="premium" type="number" min="0" max="1000000000000" step="0.01" value="${esc(p.premium)}"></label><label>Next premium due<input data-field="dueDate" type="date" value="${esc(p.dueDate)}"></label></div><div class="actions"><button type="button" data-remove>Remove policy</button></div>`;
  fieldset._original = p; $('policyEditors').append(fieldset);
}
function closeDialog() { if (busy) return; $('customerDialog').close(); $('customerForm').reset(); $('policyEditors').replaceChildren(); $('formError').textContent = ''; editing = null; pending = null; }
function openCustomer(id = '') {
  if (!user || !loaded || busy) return;
  const record = rows.find(r => r.id === id); if (id && !record) return;
  editing = { id: id || crypto.randomUUID(), revision: record?.revision || 0 }; pending = null;
  $('dialogTitle').textContent = record ? 'Edit customer' : 'Add customer';
  for (const key of ['name', 'phone', 'email', 'birthday', 'notes']) $(key).value = record?.[key] || '';
  $('policyEditors').replaceChildren(); (record?.policies || []).forEach(addPolicy);
  $('formError').textContent = ''; controls(); $('customerDialog').showModal(); $('name').focus();
}
$('addCustomer').onclick = () => openCustomer();
$('records').onclick = event => { const button = event.target.closest('[data-edit]'); if (button) openCustomer(button.dataset.edit); };
$('addPolicy').onclick = () => { if (!busy && !pending) { if ($('policyEditors').children.length >= 50) { $('formError').textContent = 'Keep up to 50 policies per customer.'; return; } addPolicy(); } };
$('policyEditors').onclick = event => { if (!busy && !pending && event.target.closest('[data-remove]')) event.target.closest('fieldset').remove(); };
$('closeDialog').onclick = $('cancelEdit').onclick = closeDialog;
$('customerDialog').addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
$('search').oninput = $('view').onchange = render;
$('customerForm').onsubmit = async event => {
  event.preventDefault(); if (!user || !loaded || busy || !editing) return;
  const token = generation, account = user.uid;
  try {
    if (!pending) {
      const draft = Object.fromEntries(['name', 'phone', 'email', 'birthday', 'notes'].map(key => [key, $(key).value]));
      draft.policies = [...document.querySelectorAll('.policy-editor')].map(el => ({ ...el._original, ...Object.fromEntries([...el.querySelectorAll('[data-field]')].map(input => [input.dataset.field, input.value])) }));
      pending = { draft: normalizeCustomer(draft), mutationId: crypto.randomUUID(), ...editing };
    }
    busy = true; controls(); $('formError').textContent = '';
    await saveCustomer(account, pending.id, pending.draft, pending.revision, pending.mutationId, () => token === generation);
    if (token !== generation) return;
    busy = false; closeDialog(); status('Customer saved. Premium dates are managed manually.');
  } catch (error) { if (token === generation) $('formError').textContent = storageError(error); }
  finally { if (token === generation) { busy = false; controls(); } }
};
observeAuth(current => {
  const token = ++generation; stop(); stop = () => {}; busy = false; closeDialog(); user = current; rows = []; loaded = false; $('search').value = ''; $('view').value = 'all'; render();
  if (!current) { status('Sign in on Dashboard to use your private customer CRM.'); return; }
  status('Loading customers…');
  stop = watchCustomers(current.uid, (records, cached) => {
    if (token !== generation) return;
    rows = records; loaded = true; render();
    if (!busy) status(cached ? 'Cached records · checking Firebase. Saving requires a connection.' : 'Synced to your Invincible account.');
  }, error => { if (token === generation) { loaded = false; controls(); status(storageError(error), true); } });
}).catch(error => { loaded = false; controls(); status(storageError(error), true); });
render();
// Refresh due buckets when returning to a tab across midnight.
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
