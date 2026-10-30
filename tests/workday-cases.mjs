import assert from'node:assert/strict';
import{test}from'node:test';
import{blankCase,buildCaseChange,caseMatches,sortCases}from'../react/src/workday-case-model.mjs';
test('cases retain policy strings, unknown fields, previous notes and photo totals across updates',()=>{
 const first=buildCaseChange(null,{...blankCase(),title:'NEFT rejected',policyNo:'000858001',name:'Test policyholder'},{operationId:'create',note:'Ask for bank proof',photos:[{}],now:100});
 const updated=buildCaseChange({...first,unknown:'keep'}, {...first,status:'waiting',priority:'high'},{operationId:'update',note:'',photos:[{},{}],expectedRevision:1,now:200});
 assert.equal(updated.policyNo,'000858001');assert.equal(updated.unknown,'keep');assert.equal(updated.latestNote,'Ask for bank proof');assert.equal(updated.photoCount,3);assert.equal(updated.createdAtMs,100);assert.equal(updated.revision,2);
});
test('uncertain save retry is idempotent, stale edits fail and deleted cases are not recreated',()=>{
 const current=buildCaseChange(null,{...blankCase(),title:'D/C form'},{operationId:'one',photos:[{}]});
 assert.equal(buildCaseChange(current,{...current,title:'Same retry'},{operationId:'one',photos:[{}],expectedRevision:0}),null);
 assert.throws(()=>buildCaseChange(current,current,{operationId:'stale',expectedRevision:0}),/changed elsewhere/);
 assert.throws(()=>buildCaseChange(current,current,{operationId:'duplicate'}),/already exists/);
 assert.throws(()=>buildCaseChange(null,current,{operationId:'missing',expectedRevision:1}),/no longer exists/);
 assert.throws(()=>buildCaseChange(null,{...blankCase(),title:' '},{operationId:'blank'}),/task, policy reference/);
});
test('search, status and priority intersect; completed work is retained and high priority sorts first',()=>{
 const items=[{title:'NEFT rejection',policyNo:'000858',name:'A',status:'waiting',priority:'high',updatedAtMs:1},{title:'D/C form',status:'open',priority:'normal',updatedAtMs:5},{title:'NEFT completed',status:'done',priority:'high',updatedAtMs:8}];
 assert.equal(items.filter(item=>caseMatches(item,'neft','active','high')).length,1);
 assert.equal(items.filter(item=>caseMatches(item,'000858','waiting','high')).length,1);
 assert.equal(items.filter(item=>caseMatches(item,'neft','done','high')).length,1);
 assert.equal([...items].sort(sortCases)[0].title,'NEFT completed');
});

test('quick capture accepts notes, a policy reference or a photo without a separate title',()=>{for(const [draft,options,title] of [[blankCase(),{note:'Call tomorrow'},'Call tomorrow'],[{...blankCase(),policyNo:'000001'}, {},'Policy 000001'],[blankCase(),{photos:[{}]},'Document follow-up']])assert.equal(buildCaseChange(null,draft,{operationId:'capture',...options}).title,title)});
