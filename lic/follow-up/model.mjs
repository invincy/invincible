// Policy identifiers are strings: never coerce them to numbers or remove leading zeroes.
export const fields = [
  ['policyNo', 'Policy number', ['policyno', 'policynumber', 'policyno.']],
  ['name', 'Policyholder name', ['phname', 'name', 'policyholdername']],
  ['plan', 'Plan', ['plan', 'planno']],
  ['amount', 'Amount', ['netamount', 'amount']],
  ['dueDate', 'Due date', ['duedate']],
  ['phone', 'Policyholder mobile', ['phmobile', 'phone', 'mobile', 'mobilenumber']],
  ['op1', 'OP-NAPped policy 1', ['opneft1', 'opnapped1']],
  ['op2', 'OP-NAPped policy 2', ['opneft2', 'opnapped2']],
  ['op3', 'OP-NAPped policy 3', ['opneft3', 'opnapped3']],
  ['sourceStatus', 'Source status', ['status']],
  ['branch', 'Branch', ['branch']],
  ['claimType', 'Claim type', ['claimtype']],
];
export const outcomes = {
  replied: 'Customer replied', whatsapp: 'Will WhatsApp', submitting: 'Will submit',
  no_answer: 'No answer', wrong_number: 'Wrong number', completed: 'Completed', note: 'Note / schedule only',
};
const clean = value => String(value ?? '').trim();
const empty = value => /^(?:|na|n\/a|null|none|-)$/i.test(clean(value));
export const policyKey = value => clean(value).toUpperCase().replace(/\s+/g, '');
export const policyId = value => 'p-' + encodeURIComponent(policyKey(value));
export function parseCSV(text) {
  if (text.length > 5_000_000) throw new Error('CSV is too large. Import files below 5 MB.');
  const rows = []; let row = [], cell = '', quoted = false, closed = false;
  const pushCell = () => { row.push(cell.trim()); cell = ''; closed = false; };
  const pushRow = () => { pushCell(); if (row.some(value => value !== '')) rows.push(row); row = []; };
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; } }
      else cell += char;
    } else if (char === ',' || char === '\n' || char === '\r') {
      if (char === ',') pushCell();
      else { pushRow(); if (char === '\r' && text[i + 1] === '\n') i++; }
    } else if (char === '"' && !cell.trim() && !closed) { cell = ''; quoted = true; }
    else if ((closed && !/\s/.test(char)) || char === '"') throw new Error('Malformed CSV quoting near row ' + (rows.length + 1) + '.');
    else if (!closed) cell += char;
  }
  if (quoted) throw new Error('CSV has an unclosed quoted field.');
  if (cell || row.length || closed) pushRow();
  if (rows.length < 2) throw new Error('Include a header row and at least one policy row.');
  const headers = rows.shift();
  if (headers.some(h => !h) || new Set(headers.map(h => h.toLowerCase())).size !== headers.length) throw new Error('Column headers must be non-empty and unique.');
  if (rows.length > 5000) throw new Error('Import at most 5,000 policy rows at a time.');
  return { headers, rows };
}
export function autoMapping(headers) {
  const normalize = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return Object.fromEntries(fields.map(([key, , aliases]) => [key, headers.findIndex(header => aliases.includes(normalize(header)))]));
}
export function dateValue(value) {
  const text = clean(value); if (empty(text)) return '';
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) { const dmy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/); if (dmy) match = [text, dmy[3], dmy[2], dmy[1]]; }
  if (!match) throw new Error('Use YYYY-MM-DD or DD/MM/YYYY for dates.');
  const [, y, m, d] = match, date = new Date(Date.UTC(+y, +m - 1, +d));
  if (+y < 1900 || date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d) throw new Error('Invalid calendar date.');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
export function mobile(value) {
  const raw = clean(value);
  if (empty(raw)) return { kind: 'missing', label: 'Missing mobile', tel: '' };
  if (!/^[+\d\s()-]+$/.test(raw)) return { kind: 'invalid', label: 'Invalid mobile', tel: '' };
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0091') && digits.length === 14) digits = digits.slice(4);
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits) || /^(\d)\1{9}$/.test(digits)) return { kind: 'invalid', label: 'Invalid mobile', tel: '' };
  return { kind: 'valid', label: '+91 ' + digits, tel: '+91' + digits };
}
export const currentPhone = record => record.phoneOverride ?? record.phone ?? '';
export function contactability(record) {
  const result = mobile(currentPhone(record));
  return result.kind === 'valid' && record.wrongNumber ? { ...result, kind: 'wrong', label: 'Reported wrong number', tel: '' } : result;
}
export function previewImport(parsed, mapping) {
  if (mapping.policyNo < 0 || mapping.name < 0) throw new Error('Map policy number and policyholder name.');
  const selected = Object.values(mapping).filter(index => index >= 0);
  if (new Set(selected).size !== selected.length) throw new Error('Each CSV column can be mapped only once.');
  const errors = [], records = new Map(); let duplicates = 0;
  parsed.rows.forEach((row, i) => {
    try {
      if (row.length !== parsed.headers.length) throw new Error('Column count does not match the header.');
      const get = key => mapping[key] >= 0 ? clean(row[mapping[key]]) : '';
      const policyNo = policyKey(get('policyNo')), name = get('name');
      if (!policyNo || policyNo.length > 100 || !/^[A-Z0-9/-]+$/.test(policyNo) || /^\d+E[+-]?\d+$/i.test(policyNo)) throw new Error('A valid policy number is required (no scientific notation).');
      if (empty(name)) throw new Error('Policyholder name is required.');
      const rawAmount = get('amount').replace(/[₹,\s]/g, '');
      if (!empty(rawAmount) && !/^-?\d+(?:\.\d{1,2})?$/.test(rawAmount)) throw new Error('Invalid amount.');
      const amount = empty(rawAmount) ? null : Number(rawAmount);
      if (amount !== null && !Number.isSafeInteger(Math.round(amount * 100))) throw new Error('Amount is too large.');
      const record = { policyNo, name, plan: get('plan'), amount, dueDate: dateValue(get('dueDate')), phone: get('phone'), sourceStatus: get('sourceStatus'), branch: get('branch'), claimType: get('claimType'), opPolicies: [...new Set(['op1', 'op2', 'op3'].map(get).filter(v => !empty(v) && v !== '0').map(policyKey))] };
      if (Object.values(record).some(v => typeof v === 'string' && v.length > 500)) throw new Error('A field exceeds 500 characters.');
      const id = policyId(policyNo);
      if (records.has(id)) {
        if (JSON.stringify(records.get(id)) !== JSON.stringify(record)) throw new Error('Conflicting duplicate policy ' + policyNo + '. Keep one authoritative row.');
        duplicates++;
      } else records.set(id, record);
    } catch (error) { errors.push(`Row ${i + 2}: ${error.message}`); }
  });
  return { records: [...records.values()], errors, duplicates };
}
// Empty imports never erase useful values; responses and manual phone corrections are separate fields.
export function mergeImport(existing = {}, incoming, timestamp) {
  const next = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if (key === 'opPolicies') next.opPolicies = [...new Set([...(existing.opPolicies || []), ...value])];
    else if (value !== null && !empty(value)) next[key] = value;
    else if (!(key in next)) next[key] = value;
  }
  return { ...next, createdAt: existing.createdAt || timestamp, importedAt: timestamp };
}
export function applyResponse(existing, event) {
  if (!existing) throw new Error('Policy no longer exists. Reimport it before saving.');
  if (!(event.outcome in outcomes)) throw new Error('Select a response.');
  if (clean(event.note).length > 4000) throw new Error('Notes must be under 4,000 characters.');
  const followUpDate = dateValue(event.followUpDate);
  const next = { ...existing, followUpDate, updatedAt: event.at };
  if (event.outcome !== 'note') Object.assign(next, { outcome: event.outcome, attemptedAt: event.at });
  if (event.outcome === 'wrong_number') next.wrongNumber = true;
  if (['replied', 'whatsapp', 'submitting', 'completed'].includes(event.outcome)) next.contactedAt = event.at;
  if (event.outcome === 'completed') next.followUpDate = '';
  if (event.phoneCorrection !== null) {
    if (mobile(event.phoneCorrection).kind !== 'valid') throw new Error('Enter a valid Indian mobile number for the correction.');
    if (event.outcome === 'wrong_number') throw new Error('Save a corrected mobile with Note / schedule only, then record the next call.');
    next.phoneOverride = clean(event.phoneCorrection); next.wrongNumber = false;
  }
  return next;
}
export function statusLabel(record) {
  if (record.outcome === 'completed') return 'Completed';
  if (contactability(record).kind !== 'valid') return 'Uncontactable';
  if (!record.attemptedAt) return 'Not yet contacted';
  return record.outcome === 'no_answer' ? 'Attempted · no answer' : outcomes[record.outcome] || 'Contact attempted';
}
export function matches(record, { query = '', view = 'all', today = '', plan = '' } = {}) {
  const availability = contactability(record);
  const filters = {
    all: true, new: availability.kind === 'valid' && !record.attemptedAt,
    uncontactable: availability.kind !== 'valid', op: !!record.opPolicies?.length,
    missing_op: ['missing', 'invalid'].includes(mobile(currentPhone(record)).kind) && !!record.opPolicies?.length,
    due: !!record.followUpDate && record.followUpDate <= today && record.outcome !== 'completed',
    completed: record.outcome === 'completed',
  };
  const haystack = [record.name, record.policyNo, record.plan, record.phone, record.phoneOverride, record.sourceStatus, record.branch, ...(record.opPolicies || [])].join(' ').toLowerCase();
  const inView = Object.hasOwn(filters, view) ? filters[view] : Object.hasOwn(outcomes, view) && record.outcome === view;
  return !!inView && (!plan || record.plan === plan) && query.trim().toLowerCase().split(/\s+/).every(word => haystack.includes(word));
}
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function daysFromToday(days, date = new Date()) { date = new Date(date); date.setDate(date.getDate() + days); return localDate(date); }
