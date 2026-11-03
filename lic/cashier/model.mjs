// All cash arithmetic uses integer paise; note counts are always whole numbers.
export const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];
export const blankCash = () => ({ counts: Object.fromEntries(DENOMINATIONS.map(n => [n, 0])), loose: 0 });
export function money(value) {
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error('Enter a valid amount with up to two decimal places.');
  const [whole, fraction = ''] = text.split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(amount) || amount > 100_000_000_000) throw new Error('Amount is too large.');
  return amount;
}
export function checkCash(cash) {
  if (!cash || !Number.isSafeInteger(cash.loose) || cash.loose < 0) throw new Error('Enter valid miscellaneous / loose change.');
  for (const n of DENOMINATIONS) {
    if (!Number.isSafeInteger(cash.counts?.[n]) || cash.counts[n] < 0 || cash.counts[n] > 1_000_000) throw new Error('Note counts must be whole numbers from 0 to 10,00,000.');
  }
  if (cashTotal(cash) > 100_000_000_000) throw new Error('Cash amount is too large.');
  return cash;
}
export const cashTotal = cash => DENOMINATIONS.reduce((sum, n) => sum + n * 100 * cash.counts[n], cash.loose);
export function combineCash(balance, received, returned) {
  [balance, received, returned].forEach(checkCash);
  const result = blankCash();
  for (const n of DENOMINATIONS) {
    result.counts[n] = balance.counts[n] + received.counts[n] - returned.counts[n];
    if (result.counts[n] < 0) throw new Error(`Not enough ₹${n} notes / coins to give this change. Check opening cash and cash received.`);
  }
  result.loose = balance.loose + received.loose - returned.loose;
  if (result.loose < 0) throw new Error('Not enough miscellaneous / loose change.');
  return checkCash(result);
}
export function transactionDetails(draft) {
  if (!Array.isArray(draft.amounts) || !draft.amounts.length || draft.amounts.length > 100) throw new Error('Add at least one transaction amount (up to 100 per entry).');
  const amounts = draft.amounts.map(item => ({ amount: money(item.amount), label: String(item.label || '').slice(0, 120) }));
  if (amounts.some(item => item.amount <= 0)) throw new Error('Each transaction amount must be greater than zero.');
  const due = amounts.reduce((sum, item) => sum + item.amount, 0);
  if (due > 100_000_000_000) throw new Error('Transaction total is too large.');
  checkCash(draft.received); checkCash(draft.returned);
  const received = cashTotal(draft.received), returned = cashTotal(draft.returned);
  return { amounts, due, received, returned, difference: received - returned - due };
}
export function applyTransaction(counter, draft) {
  if (counter.status !== 'open') throw new Error('This counter is closed. Start a new counter.');
  const details = transactionDetails(draft);
  if (details.difference !== 0) throw new Error('Balance the cash and change before saving.');
  const balance = combineCash(counter.balance, draft.received, draft.returned);
  return { ...counter, balance, collected: counter.collected + details.due, cashIn: counter.cashIn + details.received,
    cashOut: counter.cashOut + details.returned, transactionCount: counter.transactionCount + 1 };
}
