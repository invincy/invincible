export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(value + 'T12:00:00Z');
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value && value >= '1900-01-01' && value <= '9999-12-31';
}
export function todayIndia(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function dueState(value, today = todayIndia()) {
  if (!validDate(value)) return 'undated';
  const days = (Date.parse(value + 'T12:00:00Z') - Date.parse(today + 'T12:00:00Z')) / 86400000;
  return days < 0 ? 'overdue' : days <= 30 ? 'soon' : 'later';
}
export function normalizeCustomer(input, today = todayIndia()) {
  const text = (value, limit, label) => { const result = String(value ?? '').trim(); if (result.length > limit) throw Error(`${label} is too long.`); return result; };
  const name = text(input.name, 150, 'Name'); if (!name) throw Error('Enter a customer name.');
  const phone = text(input.phone, 30, 'Mobile'), email = text(input.email, 200, 'Email');
  if (phone && !/^\+?[\d ()-]{7,30}$/.test(phone)) throw Error('Enter a valid mobile number, or leave it blank.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Enter a valid email address.');
  const birthday = input.birthday || ''; if (birthday && (!validDate(birthday) || birthday > today)) throw Error('Enter a valid date of birth.');
  const policies = input.policies || []; if (!Array.isArray(policies) || policies.length > 50) throw Error('Keep up to 50 policies per customer.');
  const seen = new Set();
  return { name, phone, email, birthday, notes: text(input.notes, 4000, 'Notes'), policies: policies.map(p => {
    const policyNo = text(p.policyNo, 60, 'Policy number').toUpperCase();
    if (!policyNo) throw Error('Enter a policy number, or remove the empty policy.');
    if (seen.has(policyNo)) throw Error('The same policy number appears twice for this customer.'); seen.add(policyNo);
    const dueDate = p.dueDate || ''; if (dueDate && !validDate(dueDate)) throw Error('Enter a valid premium due date.');
    const premium = p.premium === '' || p.premium === null || p.premium === undefined ? null : Number(p.premium);
    if (premium !== null && (!Number.isFinite(premium) || premium < 0 || premium > 1e12)) throw Error('Enter a valid premium amount.');
    return { ...p, policyNo, plan: text(p.plan, 100, 'Plan'), dueDate, premium };
  }) };
}
export function matchesCustomer(customer, query = '', view = 'all', today = todayIndia()) {
  const policies = customer.policies || [], needle = query.toLowerCase().trim();
  const content = [customer.name, customer.phone, customer.email, ...policies.flatMap(p => [p.policyNo, p.plan])].join(' ').toLowerCase();
  return content.includes(needle) && (view === 'all' || policies.some(p => dueState(p.dueDate, today) === view));
}
// Revision checks prevent one tab from silently overwriting another tab's customer edits.
export function customerWrite(current, draft, expectedRevision, mutationId) {
  if (!mutationId) throw Error('Missing save identifier.');
  if (current?.lastMutationId === mutationId) return null;
  if ((current?.revision || 0) !== expectedRevision) throw Error('This customer changed in another tab. Your draft is retained. Close and reopen the customer to review the latest record.');
  return { ...current, ...normalizeCustomer(draft), revision: expectedRevision + 1, lastMutationId: mutationId };
}
