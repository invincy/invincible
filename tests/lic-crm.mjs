import test from 'node:test';
import assert from 'node:assert/strict';
import { validDate, todayIndia, dueState, normalizeCustomer, matchesCustomer, customerWrite } from '../lic/crm/model.mjs';
const draft = { name: 'Asha Example', phone: '9876543210', policies: [{ policyNo: '000123', plan: 'Test plan', premium: '', dueDate: '2026-11-27' }] };
test('CRM uses Indian calendar dates, exact 30-day window and unknown dates', () => {
  assert.equal(todayIndia(new Date('2026-10-27T19:00:00Z')), '2026-10-28');
  assert.equal(dueState('2026-10-27', '2026-10-28'), 'overdue');
  assert.equal(dueState('2026-10-28', '2026-10-28'), 'soon');
  assert.equal(dueState('2026-11-27', '2026-10-28'), 'soon');
  assert.equal(dueState('2026-11-28', '2026-10-28'), 'later');
  assert.equal(dueState('', '2026-10-28'), 'undated');
  assert.equal(validDate('2026-02-29'), false); assert.equal(validDate('2028-02-29'), true);
});
test('CRM preserves policy strings, distinguishes missing/zero premiums and validates fields', () => {
  const result = normalizeCustomer(draft); assert.equal(result.policies[0].policyNo, '000123'); assert.equal(result.policies[0].premium, null);
  assert.equal(normalizeCustomer({ ...draft, policies: [{ policyNo: '000001', premium: '0' }] }).policies[0].premium, 0);
  for (const bad of [{ ...draft, name: '' }, { ...draft, birthday: '2999-01-01' }, { ...draft, phone: '<script>' }, { ...draft, email: 'bad' }, { ...draft, policies: [{ policyNo: '' }] }, { ...draft, policies: [{ policyNo: '1', dueDate: '2026-02-30' }] }, { ...draft, policies: [{ policyNo: '1', premium: -1 }] }, { ...draft, policies: [{ policyNo: '01' }, { policyNo: '01' }] }]) assert.throws(() => normalizeCustomer(bad));
});
test('CRM customer filtering checks every policy without conflating due states', () => {
  const customer = normalizeCustomer({ ...draft, policies: [...draft.policies, { policyNo: '000456', plan: 'Other', dueDate: '2026-10-01' }, { policyNo: '00789' }] });
  assert.equal(matchesCustomer(customer, '000456', 'overdue', '2026-10-28'), true);
  assert.equal(matchesCustomer(customer, 'asha', 'soon', '2026-10-28'), true);
  assert.equal(matchesCustomer(customer, '', 'undated', '2026-10-28'), true);
  assert.equal(matchesCustomer(customer, 'unmatched', 'all', '2026-10-28'), false);
});
test('CRM retries are idempotent and concurrent edits fail without erasing unknown data', () => {
  const first = customerWrite(null, draft, 0, 'save-1'); assert.equal(first.revision, 1);
  assert.equal(customerWrite(first, draft, 0, 'save-1'), null);
  assert.throws(() => customerWrite(first, { ...draft, name: 'Other editor' }, 0, 'save-2'), /another tab/);
  const next = customerWrite({ ...first, futureField: 'keep' }, { ...draft, name: 'Updated' }, 1, 'save-2');
  assert.equal(next.futureField, 'keep'); assert.equal(next.revision, 2); assert.equal(next.name, 'Updated');
});
