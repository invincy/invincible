import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCSV, autoMapping, previewImport, mobile, dateValue, policyId, mergeImport, applyResponse, matches, statusLabel, daysFromToday } from '../lic/follow-up/model.mjs';
const header = 'Policyno,PH Name,Plan,Net Amount,Due Date,PH Mobile,OP_Neft1,OP_Neft2,OP_Neft3';
const csv = header + '\r\n"00123","Patel, Asha",28,"68,230",2026-10-12,+91 9876543210,00999,00888,00777\r\n00456,"Name ""Quoted""\nSecond line",14,0,23/03/2026,NA,00666,,\r\n';
const parsed = parseCSV('\uFEFF' + csv), mapping = autoMapping(parsed.headers);
const imported = () => previewImport(parsed, mapping).records;
test('CSV supports BOM, quoted commas, escaped quotes, multiline fields and empty trailing fields', () => {
  const preview = previewImport(parsed, mapping); assert.deepEqual(preview.errors, []); assert.equal(preview.records.length, 2);
  assert.equal(preview.records[0].name, 'Patel, Asha'); assert.equal(preview.records[0].amount, 68230);
  assert.equal(preview.records[1].name, 'Name "Quoted"\nSecond line'); assert.equal(preview.records[1].amount, 0);
  assert.equal(preview.records[1].dueDate, '2026-03-23');
  assert.throws(() => parseCSV(header + '\n"unclosed'), /unclosed/);
  assert.throws(() => parseCSV('x,x\n1,2'), /unique/);
  assert.throws(() => parseCSV('x,y\n"a"oops,b'), /Malformed/);
});
test('manual mapping works and policy/OP numbers stay strings with leading zeroes', () => {
  assert.deepEqual(imported()[0].opPolicies, ['00999', '00888', '00777']);
  assert.equal(imported()[0].policyNo, '00123'); assert.notEqual(policyId('00123'), policyId('123'));
  const custom = parseCSV('Holder,Contract,Other\nAsha,0001,0022');
  const result = previewImport(custom, { name: 0, policyNo: 1, op1: 2 });
  assert.equal(result.records[0].policyNo, '0001'); assert.deepEqual(result.records[0].opPolicies, ['0022']);
  assert.throws(() => previewImport(custom, { name: 0, policyNo: 0 }), /only once/);
  assert.throws(() => previewImport(custom, { name: 0, policyNo: -1 }), /Map policy/);
});
test('malformed rows and conflicting duplicates block import; identical duplicates collapse', () => {
  const row = '1,Asha,28,100,2026-10-12,9876543210,,,';
  const data = parseCSV(header + '\n' + row + '\n' + row);
  assert.equal(previewImport(data, mapping).duplicates, 1); assert.equal(previewImport(data, mapping).records.length, 1);
  data.rows.push(['1', 'Changed', '28', '100', '2026-10-12', '', '', '', '']);
  assert.match(previewImport(data, mapping).errors.join(), /Conflicting duplicate/);
  for (const bad of ['1,Asha', ',Asha,28,100,2026-10-12,,,,', '1,,28,100,2026-10-12,,,,', '1,Asha,28,100,2026-02-30,,,,', '1,Asha,28,bad,2026-10-12,,,,', '1E10,Asha,28,100,2026-10-12,,,,']) {
    const p = parseCSV(header + '\n' + bad); assert.ok(previewImport(p, mapping).errors.length, bad);
  }
});
test('mobile validation produces safe tel links and rejects missing/invalid placeholders', () => {
  for (const value of ['9876543210', '+91 98765-43210', '00919876543210', '09876543210']) assert.equal(mobile(value).tel, '+919876543210');
  for (const value of ['NA', '  ', 'N/A']) assert.equal(mobile(value).kind, 'missing');
  for (const value of ['12345', '9999999999', '1234567890', '9876543210 ext 2', '<script>', '+449876543210']) assert.equal(mobile(value).tel, '');
});
test('contact attempts and contactability are independent, OP policies are searchable', () => {
  const [valid, missing] = imported();
  assert.equal(statusLabel(valid), 'Not yet contacted'); assert.equal(statusLabel(missing), 'Uncontactable');
  assert.equal(matches(missing, { view: 'new' }), false); assert.equal(matches(missing, { view: 'missing_op' }), true);
  assert.equal(matches(valid, { query: '00999' }), true); assert.equal(matches(valid, { query: '00888' }), true); assert.equal(matches(valid, { query: '00777' }), true);
  assert.equal(matches(valid, { view: 'missing_op' }), false);
  const attempted = applyResponse(valid, { outcome: 'no_answer', note: '', at: 'now', followUpDate: '2026-10-26', phoneCorrection: null });
  assert.equal(statusLabel(attempted), 'Attempted · no answer'); assert.equal(matches(attempted, { view: 'new' }), false);
  assert.equal(matches(attempted, { view: 'no_answer' }), true); assert.equal(matches(attempted, { view: 'whatsapp' }), false);
  assert.equal(matches(attempted, { view: 'due', today: '2026-10-26' }), true);
  assert.equal(matches(attempted, { view: 'due', today: '2026-10-25' }), false);
});
test('reimport is identity-safe and preserves workflow, corrections and unknown fields', () => {
  const incoming = imported()[0], existing = { ...incoming, outcome: 'whatsapp', attemptedAt: 'earlier', followUpDate: '2026-11-01', phoneOverride: '9123456789', extra: 'retain', opPolicies: ['OLD'] };
  const next = mergeImport(existing, { ...incoming, name: 'Updated name', amount: 0, phone: '', dueDate: '' }, 'new');
  assert.equal(next.name, 'Updated name'); assert.equal(next.amount, 0); assert.equal(next.phone, incoming.phone); assert.equal(next.dueDate, incoming.dueDate);
  for (const key of ['outcome', 'attemptedAt', 'followUpDate', 'phoneOverride', 'extra']) assert.equal(next[key], existing[key]);
  assert.deepEqual(next.opPolicies, ['OLD', '00999', '00888', '00777']);
  assert.deepEqual(mergeImport(next, incoming, 'new').opPolicies, next.opPolicies);
});
test('notes do not count as calls, corrections restore callability, completed clears follow-up', () => {
  const event = { outcome: 'note', note: 'Call later', at: 'now', followUpDate: '2026-11-01', phoneCorrection: null };
  const noted = applyResponse(imported()[0], event); assert.equal(noted.attemptedAt, undefined);
  const wrong = applyResponse(noted, { ...event, outcome: 'wrong_number' }); assert.equal(statusLabel(wrong), 'Uncontactable');
  const fixed = applyResponse(wrong, { ...event, phoneCorrection: '9123456789' }); assert.equal(fixed.wrongNumber, false);
  assert.equal(matches(fixed, { view: 'uncontactable' }), false);
  const done = applyResponse(fixed, { ...event, outcome: 'completed' }); assert.equal(done.followUpDate, ''); assert.equal(done.contactedAt, 'now');
  assert.throws(() => applyResponse(fixed, { ...event, phoneCorrection: 'NA' }), /valid Indian/);
  assert.throws(() => applyResponse(null, event), /no longer exists/);
  assert.throws(() => applyResponse(fixed, { ...event, note: 'a'.repeat(4001) }), /4,000/);
  assert.equal(daysFromToday(3, new Date(2026, 11, 30)), '2027-01-02');
  assert.throws(() => dateValue('2025-02-29'), /Invalid/);
});
test('the provided 858.csv can be validated locally without committing customer data', { skip: !process.env.LIC_SAMPLE_CSV }, () => {
  const sample = parseCSV(fs.readFileSync(process.env.LIC_SAMPLE_CSV, 'utf8')), preview = previewImport(sample, autoMapping(sample.headers));
  assert.deepEqual(preview.errors, []); assert.equal(preview.records.length, 104); assert.equal(preview.records.filter(r => r.opPolicies.length).length, 1);
  console.log('858.csv: 104 unique policies validated; one row has three OP-NAPped links.');
});
