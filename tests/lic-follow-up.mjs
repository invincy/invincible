import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCSV, autoMapping, previewImport, mobile, dateValue, policyId, mergeImport, applyResponse, archiveCase, matches, contactFilters, contactFilterKeys, normalizeNeftStatus, currentNeftStatus, readinessKey, statusLabel, daysFromToday } from '../lic/follow-up/model.mjs';
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
test('archive and restore preserve remarks and schedules; completion leaves the active list', () => {
  const original = { ...imported()[0], remarks: 'Retain old remarks', followUpDate: '2026-11-01', attemptedAt: 'before' };
  const archived = archiveCase(original, true, 'manual', 'now');
  assert.equal(matches(archived), false); assert.equal(matches(archived, { view: 'archived' }), true);
  assert.equal(matches(archived, { view: 'everything' }), true); assert.equal(archived.remarks, original.remarks);
  const restored = archiveCase(archived, false, '', 'later'); assert.equal(matches(restored), true); assert.equal(restored.followUpDate, original.followUpDate);
  const completed = applyResponse(original, { outcome: 'completed', at: 'now', note: '', followUpDate: '', phoneCorrection: null });
  assert.equal(completed.archived, true); assert.equal(completed.archiveReason, 'completed'); assert.equal(matches(completed), false);
  assert.equal(matches(completed, { view: 'completed' }), true);
  assert.equal(archiveCase(completed, false, '', 'later').outcome, 'reopened');
});
test('returning CSV rows restore missing cases while keeping explicitly removed and completed cases archived', () => {
  const original = { ...imported()[0], remarks: 'Preserve this', attemptedAt: 'before' };
  for (const reason of ['manual', 'completed', 'missing_csv']) {
    const archived = archiveCase(original, true, reason, 'now');
    const reimport = mergeImport(archived, imported()[0], 'later');
    assert.equal(reimport.archived, reason !== 'missing_csv'); assert.equal(reimport.remarks, 'Preserve this'); assert.equal(reimport.attemptedAt, 'before');
  }
});


test('six contact availability filters classify usable mobiles and OP-NAP references independently', () => {
  const records = [
    { id: 'both', phone: '9876543210', opPolicies: ['00999'] },
    { id: 'mobile', phone: '+91 9123456789', opPolicies: [] },
    { id: 'op', phone: 'NA', opPolicies: ['00888'] },
    { id: 'neither', phone: '', opPolicies: [] },
    { id: 'zero', phone: '0000000000', opPolicies: ['00777'] },
    { id: 'invalid', phone: '12345', opPolicies: [] },
    { id: 'wrong', phone: '9876543210', wrongNumber: true, opPolicies: ['00666'] },
    { id: 'corrected', phone: 'NA', phoneOverride: '9234567890', opPolicies: ['00555'] },
    { id: 'placeholder', phone: '', opPolicies: ['NA', '-', '0000', ''] },
  ];
  const expected = {
    all: records.map(r => r.id), mobile: ['both', 'mobile', 'corrected'],
    no_mobile: ['op', 'neither', 'zero', 'invalid', 'wrong', 'placeholder'],
    op: ['both', 'op', 'zero', 'wrong', 'corrected'], no_mobile_op: ['op', 'zero', 'wrong'],
    neither: ['neither', 'invalid', 'placeholder'],
  };
  assert.equal(contactFilters.length, 6);
  const before = structuredClone(records);
  for (const [contact] of contactFilters) {
    assert.deepEqual(records.filter(r => matches(r, { contact })).map(r => r.id), expected[contact]);
    assert.deepEqual(records.filter(r => contactFilterKeys(r).includes(contact)).map(r => r.id), expected[contact]);
  }
  assert.deepEqual(records, before, 'filtering never changes stored records');
  for (const phone of ['', 'NA', 'N/A', '0000000000', '12345', '1234567890', '9999999999', '9876543210 ext 2', '+449876543210']) {
    assert.equal(matches({ phone }, { contact: 'mobile' }), false, phone);
    assert.equal(matches({ phone }, { contact: 'neither' }), true, phone);
  }
});
test('contact availability combines with search, plan, outcome, archive and all three imported OP columns', () => {
  for (let column = 0; column < 3; column++) {
    const cells = ['1', 'Asha', '28', '100', '', 'NA', '', '', '']; cells[6 + column] = '000123';
    const preview = previewImport(parseCSV(header + '\n' + cells.join(',')), mapping);
    assert.deepEqual(preview.errors, []); assert.equal(matches(preview.records[0], { contact: 'no_mobile_op' }), true);
  }
  const record = { ...imported()[0], outcome: 'submitting', attemptedAt: 'before' };
  assert.equal(matches(record, { contact: 'mobile', query: '00888', plan: '28', view: 'submitting' }), true);
  for (const options of [{ contact: 'no_mobile' }, { query: 'missing' }, { plan: '14' }, { view: 'no_answer' }]) {
    assert.equal(matches(record, { contact: 'mobile', query: '00888', plan: '28', view: 'submitting', ...options }), false);
  }
  const archived = { ...record, archived: true };
  assert.equal(matches(archived, { contact: 'mobile' }), false);
  assert.equal(matches(archived, { contact: 'mobile', view: 'archived' }), true);
  assert.equal(matches(archived, { contact: 'mobile', view: 'everything' }), true);
});


test('this-policy NEFT is explicit and separate from other-policy NEFT and policy Status', () => {
  const data = parseCSV('Policyno,PH Name,Status,OP_Neft1\n001,Asha,INFORCE-CEC - LIC,00999');
  const map = autoMapping(data.headers), record = previewImport(data, map).records[0];
  assert.equal(map.neftStatus, -1); assert.equal(currentNeftStatus(record), 'unknown');
  assert.ok(contactFilterKeys(record).includes('op')); assert.equal(readinessKey(record), 'op');
  assert.equal(Object.hasOwn(record, 'neftStatus'), false);
  assert.equal(currentNeftStatus({ phone: '9876543210' }), 'unknown');
  for (const [value, expected] of [['Yes', 'yes'], ['Y', 'yes'], ['registered', 'yes'], ['true', 'yes'], [1, 'yes'], ['No', 'no'], ['N', 'no'], ['not registered', 'no'], [false, 'no'], [0, 'no'], ['', 'unknown'], ['NA', 'unknown'], ['Unknown', 'unknown'], ['INFORCE', 'unknown']]) assert.equal(normalizeNeftStatus(value), expected);
});
test('NEFT CSV mapping accepts confirmed yes/no, ignores blanks and blocks ambiguous mapped values', () => {
  for (const header of ['NEFT Status', 'NEFT Registered', 'This Policy NEFT', 'NEFT']) {
    const csv = parseCSV('Policyno,PH Name,' + header + '\n01,Asha,Yes\n02,Bhavna,No\n03,Chandra,');
    const mapping = autoMapping(csv.headers), preview = previewImport(csv, mapping);
    assert.equal(mapping.neftStatus, 2); assert.deepEqual(preview.errors, []);
    assert.equal(currentNeftStatus(preview.records[0]), 'yes'); assert.equal(currentNeftStatus(preview.records[1]), 'no');
    assert.equal(currentNeftStatus(preview.records[2]), 'unknown'); assert.equal(Object.hasOwn(preview.records[2], 'neftStatus'), false);
  }
  const csv = parseCSV('Policyno,PH Name,NEFT Status\n01,Asha,unverified words');
  assert.match(previewImport(csv, autoMapping(csv.headers)).errors.join(), /Use Yes \/ No/);
  const conflict = parseCSV('Policyno,PH Name,NEFT Status\n01,Asha,Yes\n01,Asha,No');
  assert.match(previewImport(conflict, autoMapping(conflict.headers)).errors.join(), /Conflicting duplicate/);
});
test('manual NEFT corrections are tri-state, import-safe and removable without faking a contact attempt', () => {
  const original = { ...imported()[0], neftStatus: 'yes', extra: { keep: true } };
  const event = { outcome: 'note', note: '', followUpDate: '', phoneCorrection: null, at: 'now', neftCorrection: 'no' };
  const no = applyResponse(original, event); assert.equal(currentNeftStatus(no), 'no'); assert.equal(no.attemptedAt, undefined); assert.equal(no.contactedAt, undefined);
  const reimported = mergeImport(no, { ...imported()[0], neftStatus: 'yes' }, 'later'); assert.equal(currentNeftStatus(reimported), 'no');
  assert.deepEqual(reimported.extra, original.extra);
  const unknown = applyResponse(reimported, { ...event, neftCorrection: 'unknown' }); assert.equal(currentNeftStatus(unknown), 'unknown');
  const source = applyResponse(unknown, { ...event, neftCorrection: null }); assert.equal(currentNeftStatus(source), 'yes');
  assert.equal(currentNeftStatus(mergeImport(original, imported()[0], 'later')), 'yes', 'old CSV without a NEFT column cannot erase confirmed NEFT');
  assert.throws(() => applyResponse(original, { ...event, neftCorrection: 'maybe' }), /Choose Yes, No or Unknown/);
  assert.equal(currentNeftStatus(applyResponse(no, { outcome: 'note', note: '', followUpDate: '', phoneCorrection: null, at: 'later' })), 'no', 'unrelated responses preserve another NEFT update');
});
test('NEFT filters combine with all other filters and card readiness honours independent channels', () => {
  const record = { ...imported()[0], neftStatus: 'yes', outcome: 'submitting' };
  assert.equal(matches(record, { contact: 'mobile', neft: 'yes', query: '00999', view: 'submitting', plan: '28' }), true);
  assert.equal(matches(record, { neft: 'no' }), false); assert.equal(matches(record, { neft: 'unknown' }), false);
  assert.equal(matches({ ...record, neftOverride: 'unknown' }, { neft: 'unknown' }), true);
  assert.equal(readinessKey(record), 'neft'); assert.equal(readinessKey({ ...record, neftOverride: 'no' }), 'op');
  assert.equal(readinessKey({ phone: '9876543210' }), 'mobile'); assert.equal(readinessKey({ phone: 'NA' }), 'missing');
});
