// Pure deterministic domain code. No network, auth, or customer logging.
export const PARSER_VERSION = 'lic-print-12.1';
export const RIDER_CODES = { EDBA: { dab: 'Yes' } };
export const MODES = { MLY: 1, QLY: 3, HLY: 6, YLY: 12 };
export function validDate(v) { return /^\d{4}-\d{2}-\d{2}$/.test(v || '') && Number.isFinite(Date.parse(v + 'T12:00:00Z')) && new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) === v; }
export function indiaToday(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
function date(v) { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v || ''); const s = m && `${m[3]}-${m[2]}-${m[1]}`; return s && validDate(s) ? s : null; }
function period(v) { const m = /^(\d{2})\/(\d{4})$/.exec(v || ''); return m && +m[1] >= 1 && +m[1] <= 12 ? `${m[2]}-${m[1]}` : null; }
function amount(v) { if (!/^\d[\d,]*(?:\.\d{1,2})?$/.test(v || '')) return null; const n = Number(v.replaceAll(',', '')); return Number.isFinite(n) && n <= 1e12 ? n : null; }
const found = (s, re) => re.exec(s)?.[1]?.trim() || null;
const state = v => /^(YES|Y)$/i.test(v || '') ? 'Yes' : /^(NO|N)$/i.test(v || '') ? 'No' : 'Unknown';
export function policyKey(number) { const n = String(number || '').replace(/\s+/g, ''); if (!/^\d{1,30}$/.test(n)) throw Error('Invalid policy number.'); return `LIC-${n}`; }
export function parseReports(text, mappings = RIDER_CODES) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 5 * 1024 * 1024) throw Error('Import must be text under 5 MB.');
  const starts = [...text.matchAll(/^\s*STATUS REPORT OF POLICY-NO\s*:/gm)];
  if (!starts.length) throw Error('No STATUS REPORT OF POLICY-NO heading found.');
  if (starts.length > 1000) throw Error('Limit each import to 1,000 reports.');
  const boundaries=starts.map((m,i)=>{if(!i)return 0;const previous=starts[i-1].index+starts[i-1][0].length,gap=text.slice(previous,m.index),headers=[...gap.matchAll(/^# Ver[^\n]*LIFE INSURANCE CORPORATION OF INDIA/gm)];return headers.length?previous+headers.at(-1).index:m.index;});
  return starts.map((m, i) => {
    // Preserve the leading print header on the first report; keep every source byte.
    const raw = text.slice(boundaries[i], boundaries[i + 1] ?? text.length);
    const warnings = [], fields = {};
    fields.policyNo = found(raw, /STATUS REPORT OF POLICY-NO\s*:\s*(\d+)/);
    try { policyKey(fields.policyNo); } catch { warnings.push('Missing or invalid policy number.'); }
    const summary = /^\s*(\d+)\/(\d+)\/(\d+)\/(\d+)\s+([\d,]+(?:\.\d+)?)\s+(\w+)\s+([\d,.]+)\s+([\d.]+)\s+(.+)$/m.exec(raw);
    if (summary) {
      Object.assign(fields, { plan: summary[1], term: +summary[2], ppt: +summary[3], accidentPremiumTerm: +summary[4], sumAssured: amount(summary[5]), mode: summary[6], premium: amount(summary[7]), extraRate: amount(summary[8]) });
      const tokens = summary[9].trim().split(/\s+/); fields.rawRiderCodes = tokens.filter(t => mappings[t]);
      fields.status = tokens.find(t => !mappings[t]) || null;
      fields.dab = fields.rawRiderCodes.some(c => mappings[c]?.dab === 'Yes') ? 'Yes' : 'Unknown';
    } else warnings.push('Could not extract PL/T/PPT/Accpr summary columns.');
    const dates = /^\s*(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{4})\s+(\d{2}\/\d{4})\s+(\d{2}\/\d{4})\s+[\d.]+\s+(\d{2}\/\d{2}\/\d{4})/m.exec(raw);
    if (dates) Object.assign(fields, { doc: date(dates[1]), maturityPeriod: period(dates[2]), lastDue: period(dates[3]), fup: period(dates[4]), lastAccountDate: date(dates[5]) });
    else warnings.push('DOC / maturity / Last Due / FUP / Last A/C columns incomplete; no dates inferred.');
    fields.reportDate = date(found(raw, /(?:Date of print[^\n]*\n)\s*(\d{2}\/\d{2}\/\d{4})/));
    fields.agencyCode = found(raw, /Agency Code\s*:\s*(\d+)/);
    fields.branch = found(raw, /PRINTED AT BRANCH\s*:\s*(\d+)/);
    fields.name = found(raw, /^Name\s*:\s*(.*?)\s+Mob No\s*:/m);
    fields.mobile = found(raw, /Mob No[ \t]*:[ \t]*([^\r\n]*)/);
    fields.neft = state(found(raw, /NEFT Registered\s*:\s*(\w+)/));
    fields.panAvailable = state(found(raw, /PAN Available\s+(\w+)/));
    fields.assignment = found(raw, /Assignment\s*:\s*(.*?)\s+NEFT Registered/);
    fields.gender = found(raw, /^Sex\s*:\s*(\w+)/m);
    fields.email = found(raw, /^Email\s*:\s*(.*?)\s+PAN\s*:/m);
    fields.address = found(raw, /^Addr\s*:\s*([\s\S]*?)\nEmail\s*:/m)?.replace(/\s+Pin\s*:\s*\d+/, '').trim() || null;
    fields.pin = found(raw, /Pin\s*:\s*(\d{6})/);
    const insured = /^\s*\d+\s+[A-Z]\s+\S+\s+\d+\s+\w+\s+(\d{2}\/\d{2}\/\d{4})/m.exec(raw); fields.dob = date(insured?.[1]);
    const nominee = /Name of the Nominee\/Assignee[^\n]*\n([^\n]+)/.exec(raw)?.[1];
    if (nominee) { const parts = nominee.trim().split(/\s{2,}/); fields.nominee = parts[0] || null; fields.nomineeRelationship = parts[1] || null; }
    fields.loan = /No Previous Loan Exists/i.test(raw) ? 'No' : 'Unknown';
    if (fields.loan === 'Unknown' && /Loan Detail/i.test(raw)) warnings.push('Loan layout requires review; inspect original Loan Detail section.');
    fields.claims = [...raw.matchAll(/^\s*(\S+)\s+(\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+\S+\s+(\d{2}\/\d{2}\/\d{4})\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s*$/gm)].map(c => ({ type: c[1], duePeriod: period(c[2]), paymentDate: date(c[3]), chequeDate: date(c[4]), gross: amount(c[5]), deductions: amount(c[6]), net: amount(c[7]) }));
    if (!fields.reportDate) warnings.push('Report date missing or invalid; existing values require review.');
    if (fields.status === 'MAT-CL-PAID') warnings.push('Maturity claim paid: renewal schedules disabled regardless of printed maturity period.');
    if (!MODES[fields.mode]) warnings.push('Unsupported or missing premium mode.');
    return { fields, raw, warnings, parserVersion: PARSER_VERSION, valid: !!fields.policyNo && !!summary };
  });
}
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export function reconcile(current, incoming, { uid, now, approved = [] } = {}) {
  const next = structuredClone(current || { insurer: 'LIC', customerId: null, revision: 0, fields: {}, provenance: {} });
  const changes = [], conflicts = [];
  for (const [field,value] of Object.entries(incoming.fields)) {
    if (value == null || value === '' || value === 'Unknown' || Array.isArray(value) && !value.length || equal(next.fields[field], value)) continue;
    const old = next.fields[field], origin = next.provenance[field], approvedField = approved.includes(field);
    const stale = !!old && (!incoming.fields.reportDate || origin?.reportDate && origin.reportDate > incoming.fields.reportDate);
    const guarded = origin?.verified || ['name', 'agencyCode', 'dob'].includes(field) && old != null;
    if ((stale || guarded) && !approvedField) { conflicts.push({ field, old, value, reason: stale ? 'Older or undated source' : 'Verified or identity field' }); continue; }
    next.fields[field] = value; next.provenance[field] = { source: 'LIC report', reportDate: incoming.fields.reportDate || null, uid, at: now, verified: false };
    changes.push({ field, old: old ?? null, value });
  }
  if (changes.length) next.revision++;
  return { next, changes, conflicts };
}
export function can(role, action) { return role === 'owner' || role === 'editor' && !['members', 'delete', 'export'].includes(action) || role === 'viewer' && action === 'read'; }
export function assertRole(role, action) { if (!can(role, action)) throw Error('Workspace access denied.'); }
export function addMonths(doc, offset) {
  const [year, month, day] = doc.split('-').map(Number), d = new Date(Date.UTC(year, month - 1 + offset, 1));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(Math.min(day,last)).padStart(2,'0')}`;
}
export function premiumSchedule(policy, from, to, verification = {}) {
  const f = policy.fields || policy, months = MODES[f.mode];
  // Only known premium-paying states qualify. Unknown states require manual review.
  if (!['IN-FORCE','INFORCE','ACTIVE','IF'].includes(f.status) || !months || !validDate(f.doc) || !f.ppt || !f.lastDue || !f.fup) return [];
  const end = addMonths(f.doc, f.ppt * 12), rows = [];
  for (let i = 0; i < f.ppt * 12 && i <= 1440; i += months) {
    const due = addMonths(f.doc, i); if (due >= end || due.slice(0,7) > f.lastDue) break;
    if (due < from || due > to || due.slice(0,7) < f.fup) continue;
    rows.push({ id: `${policy.id || policyKey(f.policyNo)}-${due}`, due, amount: f.premium ?? null, status: verification[due]?.status === 'paid' ? 'Confirmed paid' : due <= indiaToday() ? 'Payment unverified' : 'Scheduled', evidence: verification[due] || null });
  }
  return rows;
}
export function rollbackFields(current, changes, sourceHash) {
  const next = structuredClone(current), skipped = [];
  for (const c of changes) {
    if(c.field==='policyNo'&&c.old===null){skipped.push(c.field);continue;}
    if (equal(next.fields[c.field], c.value) && next.provenance[c.field]?.sourceHash === sourceHash) {
      if (c.old === null) delete next.fields[c.field]; else next.fields[c.field] = c.old;
      if (c.oldProvenance) next.provenance[c.field] = c.oldProvenance; else delete next.provenance[c.field];
    } else skipped.push(c.field);
  }
  next.revision = (current.revision || 0) + 1; return { next, skipped };
}
export function messageFor(customer, policy, language = 'gu', category = 'premium') {
  const f = policy?.fields || {}, name = customer?.name || '', masked = f.policyNo ? 'XXXX' + f.policyNo.slice(-4) : '';
  const texts = {
    en: {premium:`Hello ${name}, please check the premium and payment status of your LIC policy ${masked}.`,neft:`Hello ${name}, please contact us to check NEFT registration for your LIC policy ${masked}.`,birthday:`Happy birthday ${name}! Wishing you a wonderful year.`,anniversary:`Hello ${name}, best wishes on your policy anniversary.`,general:`Hello ${name}, please contact us regarding your LIC policy ${masked}.`},
    hi: {premium:`नमस्ते ${name}, कृपया अपनी LIC पॉलिसी ${masked} के प्रीमियम और भुगतान की स्थिति जाँच लें।`,neft:`नमस्ते ${name}, LIC पॉलिसी ${masked} के NEFT पंजीकरण की जाँच के लिए संपर्क करें।`,birthday:`जन्मदिन की शुभकामनाएँ ${name}!`,anniversary:`नमस्ते ${name}, पॉलिसी वर्षगाँठ की शुभकामनाएँ।`,general:`नमस्ते ${name}, अपनी LIC पॉलिसी ${masked} के बारे में संपर्क करें।`},
    gu: {premium:`નમસ્તે ${name}, તમારી LIC પોલિસી ${masked} ના પ્રીમિયમ અને ચુકવણીની સ્થિતિ તપાસશો.`,neft:`નમસ્તે ${name}, LIC પોલિસી ${masked} ના NEFT રજીસ્ટ્રેશનની તપાસ માટે સંપર્ક કરશો.`,birthday:`જન્મદિવસની શુભેચ્છાઓ ${name}!`,anniversary:`નમસ્તે ${name}, પોલિસીની વર્ષગાંઠની શુભેચ્છાઓ.`,general:`નમસ્તે ${name}, તમારી LIC પોલિસી ${masked} અંગે સંપર્ક કરશો.`}
  }; return (texts[language] || texts.en)[category] || texts.en.general;
}
