import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const source=await fs.readFile(new URL('../react/src/workday-case-model.js',import.meta.url),'utf8');
const{casePatch,filterCases,caseLabel}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('office case identifiers stay strings and optional fields remain optional',()=>{
 const result=casePatch({policyNumber:' 001234567 ',description:' Note only ',priority:'invalid',status:'invalid'});
 assert.equal(result.policyNumber,'001234567');assert.equal(result.description,'Note only');assert.equal(result.title,'');assert.equal(result.policyName,'');assert.equal(result.status,'todo');assert.equal(result.priority,'normal');assert.equal(caseLabel(result),'Policy 001234567');
});
test('case search combines policy/name/notes with status and priority, without changing records',()=>{
 const rows=[{id:'a',policyNumber:'00123',policyName:'Example',description:'NEFT rejected',status:'pending',priority:'high'},{id:'b',title:'NEFT update',status:'done',priority:'high'},{id:'c',title:'Review form',status:'todo',priority:'normal'},{id:'d',title:'NEFT archived',status:'todo',priority:'high',archived:true}];
 const before=JSON.stringify(rows);
 assert.deepEqual(filterCases(rows,{search:'neft',status:'open',priority:'high'}).map(row=>row.id),['a']);
 assert.deepEqual(filterCases(rows,{search:'00123',status:'all'}).map(row=>row.id),['a']);
 assert.deepEqual(filterCases(rows,{search:'example',status:'pending'}).map(row=>row.id),['a']);
 assert.deepEqual(filterCases(rows,{status:'done'}).map(row=>row.id),['b']);
 assert.equal(JSON.stringify(rows),before);
});
test('high priority comes first; due date sorts within priority and completed work stays retrievable',()=>{
 const rows=[{id:'normal',priority:'normal',status:'todo',dueDate:'2026-01-01'},{id:'later',priority:'high',status:'pending',dueDate:'2026-11-04'},{id:'sooner',priority:'high',status:'progress',dueDate:'2026-11-01'},{id:'done',priority:'low',status:'done'}];
 assert.deepEqual(filterCases(rows).map(row=>row.id),['sooner','later','normal']);
 assert.equal(filterCases(rows,{status:'all'}).length,4);
});
