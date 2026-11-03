import test from 'node:test';
import assert from 'node:assert/strict';
import { blankCash, money, cashTotal, transactionDetails, applyTransaction } from '../lic/cashier/model.mjs';
const cash = (counts = {}, loose = 0) => ({ counts: { ...blankCash().counts, ...counts }, loose });
const counter = () => ({ status: 'open', balance: cash({ 100: 5 }), collected: 0, cashIn: 0, cashOut: 0, transactionCount: 0 });
const entry = () => ({ amounts: [{ amount: '3500', label: 'Premium' }], received: cash({ 500: 8 }), returned: cash({ 100: 5 }) });
test('cash flow retains exact note counts and opening money across entries', () => {
  const first = applyTransaction(counter(), entry());
  assert.equal(cashTotal(first.balance), 400000);
  assert.equal(first.balance.counts[100], 0);
  assert.equal(first.balance.counts[500], 8);
  assert.equal(first.collected, 350000);
  const second = applyTransaction(first, { amounts: [{ amount: '600' }, { amount: '400' }], received: cash({ 500: 2 }), returned: cash() });
  assert.equal(second.collected, 450000);
  assert.equal(second.cashIn, 500000);
  assert.equal(second.cashOut, 50000);
  assert.equal(second.transactionCount, 2);
  assert.equal(second.balance.counts[500], 10);
  assert.equal(cashTotal(second.balance), 500000);
});
test('shortage, overpayment and unavailable change cannot be silently saved', () => {
  const draft = entry(); draft.returned = cash();
  assert.equal(transactionDetails(draft).difference, 50000);
  assert.throws(() => applyTransaction(counter(), draft), /Balance/);
  draft.received = cash({ 500: 6 });
  assert.equal(transactionDetails(draft).difference, -50000);
  draft.received = cash({ 500: 8 }); draft.returned = cash({ 50: 10 });
  assert.throws(() => applyTransaction(counter(), draft), /Not enough ₹50/);
});
test('paise, invalid values and closed counters are handled explicitly', () => {
  assert.equal(money('3500.05'), 350005);
  for (const value of ['', '-1', '1.001', '1e5', 'NaN']) assert.throws(() => money(value));
  const draft = { amounts: [{ amount: '99.50' }], received: cash({ 100: 1 }), returned: cash({}, 50) };
  const initial = counter(); initial.balance.loose = 50;
  assert.equal(cashTotal(applyTransaction(initial, draft).balance), 60000);
  assert.throws(() => applyTransaction({ ...initial, status: 'closed' }, draft), /closed/);
  draft.received.counts[100] = 1.5;
  assert.throws(() => transactionDetails(draft), /whole numbers/);
});
