import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseReports,policyKey,reconcile,premiumSchedule,addMonths,rollbackFields,can,messageFor} from '../lic/crm/domain.mjs';
// Synthetic data mirrors the inspected Print's exact columns; no private source is committed.
const sample=fs.readFileSync(new URL('./fixtures/lic-print-v12.txt',import.meta.url),'utf8');
test('Print v12 extracts independent premium dates, rider and claim columns without banking identity',()=>{
 const {fields:f,raw,valid}=parseReports(sample)[0];assert.equal(raw,sample);assert.equal(valid,true);
 assert.equal(f.policyNo,'000012345');assert.equal(f.plan,'178');assert.equal(f.premium,10044);assert.equal(f.mode,'YLY');assert.equal(f.sumAssured,200000);
 assert.equal(f.doc,'2006-10-19');assert.equal(f.lastDue,'2025-10');assert.equal(f.fup,'2022-10');assert.equal(f.lastAccountDate,'2022-01-04');
 assert.equal(f.dab,'Yes');assert.deepEqual(f.rawRiderCodes,['EDBA']);assert.equal(f.nominee,'SYNTHETIC NOMINEE');assert.equal(f.nomineeRelationship,'BROTHER');assert.equal(f.neft,'Yes');assert.equal(f.mobile,null);assert.equal(f.agencyCode,'00522858');assert.equal(f.loan,'No');assert.equal(f.claims[0].net,315162);assert.equal(f.claims[0].paymentDate,'2026-10-30');assert.equal(f.dob,'1983-08-09');assert.equal('pan' in f,false);
 assert.equal(premiumSchedule(f,'2020-01-01','2090-01-01').length,0);
});
test('multiple reports preserve original bytes and never split on blank lines',()=>{
 const reports=parseReports(sample+'\n\n'+sample.replaceAll('000012345','000012346'));assert.equal(reports.length,2);assert.equal(reports[1].fields.policyNo,'000012346');assert.equal(reports[1].fields.branch,'858');assert.equal(reports.map(r=>r.raw).join(''),sample+'\n\n'+sample.replaceAll('000012345','000012346'));
 assert.throws(()=>parseReports('bad text'),/heading/);assert.equal(parseReports('STATUS REPORT OF POLICY-NO : broken')[0].valid,false);
});
test('blank mobile never consumes address; absent EDBA and ambiguous NEFT remain unknown',()=>{
 const f=parseReports(sample.replace('EDBA ','').replace('Registered: YES','Registered:   '))[0].fields;assert.equal(f.dab,'Unknown');assert.equal(f.neft,'Unknown');assert.equal(f.mobile,null);
 assert.equal(parseReports(sample.replace('Mob No :','Mob No : 9876543210'))[0].fields.mobile,'9876543210');
 const bad=parseReports(sample.replace('04/01/2022','31/02/2022'))[0];assert.equal(bad.fields.lastAccountDate,null);
 const loan=parseReports(sample.replace('No Previous Loan Exists','Loan 1234 outstanding 50000'))[0];assert.equal(loan.fields.loan,'Unknown');assert.match(loan.warnings.join(' '),/Loan layout/);
});
test('sync protects identity, manual provenance, older dates, and existing customer links',()=>{
 const report=parseReports(sample)[0],first=reconcile(null,report,{uid:'a',now:'now'}).next;first.customerId='established';first.provenance.neft={verified:true,reportDate:'2026-11-02'};
 assert.deepEqual(reconcile(first,report).changes,[]);const incoming=structuredClone(report);incoming.fields.neft='No';incoming.fields.name='A different person';incoming.fields.fup='2023-01';incoming.fields.reportDate='2026-10-01';
 const result=reconcile(first,incoming);assert.equal(result.next.customerId,'established');assert.equal(result.next.fields.fup,'2022-10');assert.ok(result.conflicts.some(c=>c.field==='neft'));assert.ok(result.conflicts.some(c=>c.field==='name'));
 const accepted=reconcile(first,incoming,{approved:['neft','name','fup']});assert.equal(accepted.next.fields.fup,'2023-01');assert.equal(accepted.next.customerId,'established');
 incoming.fields.mobile=null;assert.equal(reconcile(first,incoming).next.fields.mobile,undefined);
});
test('renewals follow anchored calendar days, final dues and explicit status protections',()=>{
 const base={id:'LIC-1',fields:{policyNo:'1',doc:'2024-01-31',mode:'MLY',ppt:2,fup:'2024-01',lastDue:'2025-12',premium:100,status:'IN-FORCE'}};
 const monthly=premiumSchedule(base,'2024-01-01','2026-12-31');assert.equal(monthly.length,24);assert.equal(monthly[1].due,'2024-02-29');assert.equal(monthly[2].due,'2024-03-31');assert.equal(monthly.at(-1).due,'2025-12-31');
 for(const [mode,count]of [['QLY',8],['HLY',4],['YLY',2]])assert.equal(premiumSchedule({...base,fields:{...base.fields,mode}},'2024-01-01','2027-01-01').length,count);
 for(const status of ['MAT-CL-PAID','PAID-UP','LAPSED','SURRENDERED','DEATH-CL-PAID','Unknown'])assert.deepEqual(premiumSchedule({...base,fields:{...base.fields,status}},'2024-01-01','2027-01-01'),[]);
 assert.equal(addMonths('2023-01-31',1),'2023-02-28');assert.equal(addMonths('2024-02-29',12),'2025-02-28');
 const advanced=premiumSchedule({...base,fields:{...base.fields,fup:'2025-01'}},'2024-01-01','2026-12-31');assert.equal(advanced.length,12);assert.ok(advanced.every(e=>e.status!=='Confirmed paid'));
 assert.equal(premiumSchedule(base,'2024-01-01','2024-01-31',{'2024-01-31':{status:'paid',evidence:'receipt'}})[0].status,'Confirmed paid');
});
test('safe rollback checks both current value and source provenance',()=>{
 const p={fields:{neft:'Yes',fup:'2026-10'},provenance:{neft:{sourceHash:'h'},fup:{sourceHash:'later'}},revision:2,customerId:'same'};
 const r=rollbackFields(p,[{field:'neft',old:'No',value:'Yes'},{field:'fup',old:'2026-07',value:'2026-10'}],'h');assert.equal(r.next.fields.neft,'No');assert.equal(r.next.fields.fup,'2026-10');assert.deepEqual(r.skipped,['fup']);assert.equal(r.next.customerId,'same');
});
test('workspace role matrix and manual WhatsApp preserve uncertainty',()=>{
 for(const action of ['read','write','members','delete','export'])assert.equal(can('owner',action),true);
 assert.equal(can('editor','write'),true);assert.equal(can('editor','members'),false);assert.equal(can('editor','export'),false);assert.equal(can('viewer','read'),true);assert.equal(can('viewer','write'),false);assert.equal(can(undefined,'read'),false);
 assert.equal(policyKey(' 000123 '),'LIC-000123');assert.throws(()=>policyKey('1/../../x'));
 const message=messageFor({name:'Example'},{fields:{policyNo:'000123'}},'en');assert.match(message,/XXXX0123/);assert.doesNotMatch(message,/₹|paid|overdue/i);
});
const real=process.env.LIC_PRINT_SAMPLE;
test('attached original Print format (external private fixture)',{skip:!real},()=>{
 const report=parseReports(fs.readFileSync(real,'utf8'))[0];assert.equal(report.valid,true);assert.equal(report.fields.dab,'Yes');assert.equal(report.fields.status,'MAT-CL-PAID');assert.equal(report.fields.mobile,null);assert.equal(report.fields.lastDue,'2025-10');assert.equal(report.fields.fup,'2022-10');assert.equal(report.fields.lastAccountDate,'2022-01-04');assert.equal(report.fields.claims[0].net,315162);
});
