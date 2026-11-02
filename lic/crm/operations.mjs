// Browser-side CRM operations. Firestore Security Rules are the authority.
const hash = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),byte=>byte.toString(16).padStart(2,'0')).join('');
const core = import('./domain.mjs');
function id(value) { if (!/^[A-Za-z0-9_-]{1,100}$/.test(value || '')) throw Error('Invalid record ID.'); return value; }
function text(v, max=200) { const s=String(v??'').trim(); if(s.length>max)throw Error('Field exceeds its size limit.');return s; }
function expect(current, revision) { if((current?.revision||0)!==revision)throw Error('Record changed. Reload before saving.'); }
function data(s) { return s.exists ? s.data() : null; }
function customerDraft(d) {
 const r={name:text(d.name,150),aliases:(d.aliases||[]).slice(0,30).map(v=>text(v,150)),phone:text(d.phone,30),whatsapp:text(d.whatsapp,30),email:text(d.email),birthday:text(d.birthday,10),address:text(d.address,1500),language:['gu','hi','en'].includes(d.language)?d.language:'gu',notes:text(d.notes,4000),tags:(d.tags||[]).slice(0,30).map(v=>text(v,60)),consent:['Yes','No','Unknown'].includes(d.consent)?d.consent:'Unknown',assignedUid:text(d.assignedUid,100),householdId:d.householdId?id(d.householdId):null,relationship:text(d.relationship,100),source:'manual'};
 if(!r.name)throw Error('Customer name is required.');
 for(const p of [r.phone,r.whatsapp])if(p&&!/^\+?[\d ()-]{7,30}$/.test(p))throw Error('Invalid contact number.');
 if(r.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))throw Error('Invalid email.');return r;
}
function agencyDraft(d) { const code=text(d.code,30);if(!/^\d{1,30}$/.test(code))throw Error('Agency code must be a string of digits.');return {code,name:text(d.name,150),phone:text(d.phone,30),branch:text(d.branch,40),division:text(d.division,100),notes:text(d.notes,4000),active:d.active!==false,brand:{displayName:text(d.brand?.displayName,150),color:/^#[a-fA-F0-9]{6}$/.test(d.brand?.color)?d.brand.color:'#d6b66c',signature:text(d.brand?.signature,150)}}; }
export function createCrmRepository(db) {
 const workspaces=db.collection('licCrmWorkspaces');
 async function access(tx,ref,auth,action='read') {const w=data(await tx.get(ref));(await core).assertRole(w?.members?.[auth.uid],action);return w;}
 async function listing(ref) { const s=await ref.limit(1001).get();return {rows:s.docs.slice(0,1000).map(d=>({...d.data(),id:d.id})),truncated:s.size>1000}; }
 return async function execute(auth,input) {
  if(!auth?.uid)throw Error('Sign in to Invincible first.');
  const d=input||{},action=d.action,now=new Date().toISOString(),uid=auth.uid,email=String(auth.token?.email||'').toLowerCase();
  const verified=auth.token?.email_verified===true;
  if(action==='list') {
   const personal=await workspaces.doc('personal-'+uid).get();let spaces={docs:[]},invitations={docs:[]},sharedAvailable=true;
   try{spaces=await workspaces.where('memberUids','array-contains',uid).get();if(verified)invitations=await db.collection('licCrmInvitations').where('email','==',email).get();}catch(error){if(error.code!=='permission-denied')throw error;sharedAvailable=false;}
   const docs=[...(personal.exists?[personal]:[]),...spaces.docs.filter(s=>s.id!==personal.id)],rows=docs.map(s=>({id:s.id,name:s.data().name,role:s.data().members[uid],shared:s.data().shared,deleting:!!s.data().deleting}));
   return {workspaces:rows,sharedAvailable,invitations:invitations.docs.filter(s=>!s.data().accepted&&s.data().expiresAt>now).map(s=>({id:s.id,workspaceId:s.data().workspaceId,name:s.data().name,role:s.data().role}))};
  }
  if(action==='create') {
   const key=d.shared?id(d.operationId):'personal-'+uid,ref=workspaces.doc(key);const name=text(d.name,120)||'My agency workspace';
   await db.runTransaction(async tx=>{const s=await tx.get(ref);if(s.exists){if(s.data().ownerUid!==uid)throw Error('Workspace already exists.');return;}tx.create(ref,{name,shared:!!d.shared,ownerUid:uid,members:{[uid]:'owner'},memberUids:[uid],memberProfiles:{[uid]:{name:text(auth.token?.name||email,150),email}},createdAt:now,revision:1,reminderDays:[-7,0,7]});}); return {id:key};
  }
  if(action==='accept') {
   if(!verified)throw Error('A verified Google-linked email is required.');
   const invitationId=text(d.invitationId,300);if(invitationId.includes('/'))throw Error('Invalid invitation.');const inv=db.collection('licCrmInvitations').doc(invitationId);
   await db.runTransaction(async tx=>{const i=data(await tx.get(inv));if(!i||i.email!==email||i.expiresAt<=now)throw Error('Invitation is invalid or expired.');const ref=workspaces.doc(i.workspaceId),w=data(await tx.get(ref));if(!w||w.deleting||!w.shared)throw Error('Workspace unavailable.');if(i.accepted){if(i.acceptedBy!==uid||!w.members[uid])throw Error('Invitation already used or access revoked.');return;}if(Object.keys(w.members).length>=100&&!w.members[uid])throw Error('Workspace member limit reached.');tx.update(ref,{members:{...w.members,[uid]:uid===w.ownerUid?'owner':i.role},memberUids:[...new Set([...Object.keys(w.members),uid])],lastInvitationId:inv.id,memberProfiles:{...(w.memberProfiles||{}),[uid]:{name:text(auth.token?.name||email,150),email}}});tx.update(inv,{accepted:true,acceptedBy:uid});});return {ok:true};
  }
  const ref=workspaces.doc(id(d.workspaceId)),D=await core;
  // Every action below authorizes inside its transaction, including reads.
  if(action==='load') {
   await db.runTransaction(tx=>access(tx,ref,auth));
   const result={};for(const c of ['agencies','customers','policies','households','followups','communications','imports','posterTemplates'])result[c]=await listing(ref.collection(c));
   // Recheck after reads so an in-flight member removal cannot return a snapshot.
   const w=await db.runTransaction(tx=>access(tx,ref,auth));return {...result,workspace:{id:ref.id,...w}};
  }
  if(action!=='deleteWorkspace'&&action!=='load'){const w=await db.runTransaction(tx=>access(tx,ref,auth));if(w.deleting)throw Error('Workspace deletion is in progress.');}
  if(action==='preview') {
   await db.runTransaction(tx=>access(tx,ref,auth,'write'));
   const reports=D.parseReports(d.text),rows=[],customers=(await listing(ref.collection('customers'))).rows;
   for(const report of reports){const p=report.valid?data(await ref.collection('policies').doc(D.policyKey(report.fields.policyNo)).get()):null;const delta=D.reconcile(p,report,{uid,now});rows.push({fields:report.fields,warnings:report.warnings,valid:report.valid,existing:!!p,revision:p?.revision||0,changes:delta.changes,conflicts:delta.conflicts,possibleCustomers:customers.filter(c=>!c.mergedInto&&((c.phone&&c.phone===report.fields.mobile)||(c.birthday&&c.birthday===report.fields.dob)||c.name?.toLowerCase()===report.fields.name?.toLowerCase())).slice(0,10).map(c=>({id:c.id,name:c.name,phone:c.phone||'',birthday:c.birthday||''}))});}
   await db.runTransaction(tx=>access(tx,ref,auth,'write'));return {reports:rows};
  }
  if(action==='import') {
   const operationId=id(d.operationId),reports=D.parseReports(d.text);if(reports.length>50)throw Error('Save at most 50 reports per request; use batches.');
   const results=[];
   for(const report of reports){
    if(!report.valid){results.push({error:'Invalid report; retained in preview for correction.'});continue;}
    const key=D.policyKey(report.fields.policyNo),policyRef=ref.collection('policies').doc(key),fingerprint=await hash(report.raw),receipt=policyRef.collection('receipts').doc(fingerprint),historyRef=policyRef.collection('history').doc(await hash(operationId+':'+fingerprint)),batchRef=ref.collection('imports').doc(operationId),rawRef=batchRef.collection('reports').doc(fingerprint);
    if(new TextEncoder().encode(report.raw).length>200000)throw Error('Individual report exceeds 200 KB.');
    const result=await db.runTransaction(async tx=>{
     const w=await access(tx,ref,auth,'write'),p=data(await tx.get(policyRef)),seen=data(await tx.get(receipt)),batch=data(await tx.get(batchRef));
     if(seen&&!seen.rolledBack)return {policyNo:report.fields.policyNo,identical:true};
     const approved=d.approvals?.[key]||[];
     if(approved.length&&d.revisions?.[key] !== (p?.revision||0))throw Error('Policy changed since preview; review conflicts again.');
     const delta=D.reconcile(p,report,{uid,now,approved});
     // An unresolved conflict blocks that record, preventing partial identity updates.
     if(delta.conflicts.length)return {policyNo:report.fields.policyNo,conflicts:delta.conflicts};
     const next=delta.next;next.id=key;next.updatedAt=now;next.lastReportDate=[p?.lastReportDate||'',report.fields.reportDate||''].sort().at(-1)||null;
     next.originalAgencyCode=p?.originalAgencyCode||report.fields.agencyCode||null;next.assignedUid=p?.assignedUid||uid;next.managingWorkspace=ref.id;
     const changes=delta.changes.map(c=>({...c,oldProvenance:p?.provenance?.[c.field]||null}));for(const c of changes)next.provenance[c.field].sourceHash=fingerprint;
     if(!p&&!next.customerId){const selected=d.links?.[key],customerId=selected?id(selected):'import-'+(await hash(key)).slice(0,32),cRef=ref.collection('customers').doc(customerId),c=data(await tx.get(cRef));if(selected&&(!c||c.mergedInto))throw Error('Selected customer no longer available.');if(!c)tx.create(cRef,{name:report.fields.name||'Unnamed policyholder',phone:report.fields.mobile||'',birthday:report.fields.dob||'',source:'LIC report',aliases:[],consent:'Unknown',revision:1,createdAt:now});next.customerId=customerId;}
     else if(p?.customerId){const cRef=ref.collection('customers').doc(p.customerId),c=data(await tx.get(cRef));if(c&&c.source==='LIC report'&&!c.phone&&next.fields.mobile)tx.update(cRef,{phone:next.fields.mobile,revision:(c.revision||0)+1,updatedAt:now});}
     tx.set(policyRef,next);tx.create(historyRef,{changes,sourceHash:fingerprint,importId:operationId,uid,at:now,reportDate:report.fields.reportDate,parserVersion:D.PARSER_VERSION,rolledBack:false});tx.set(receipt,{historyId:historyRef.id,sourceHash:fingerprint,importId:operationId,uid,at:now,rolledBack:false});
     tx.set(rawRef,{raw:report.raw,policyId:key,reportDate:report.fields.reportDate,parserVersion:D.PARSER_VERSION,warnings:report.warnings,uid,at:now});
     tx.set(batchRef,{uid,at:batch?.at||now,updatedAt:now,parserVersion:D.PARSER_VERSION,count:(batch?.count||0)+1});
     return {policyNo:report.fields.policyNo,changes:changes.length};
    });results.push(result);
   }return {results};
  }
  if(action==='customerTimeline') {
   await db.runTransaction(tx=>access(tx,ref,auth));const customerId=id(d.id),events=[];
   const ps=await ref.collection('policies').where('customerId','==',customerId).limit(100).get();for(const p of ps.docs){const hs=await listing(p.ref.collection('history'));for(const h of hs.rows)events.push({...h,kind:'Policy history',policyId:p.id});}
   for(const [coll,kind]of [['communications','Communication'],['followups','Follow-up']]){const records=await ref.collection(coll).where('customerId','==',customerId).limit(200).get();for(const r of records.docs)events.push({...r.data(),id:r.id,kind,at:r.data().at||r.data().updatedAt});}
   await db.runTransaction(tx=>access(tx,ref,auth));return {rows:events.sort((a,b)=>(b.at||'').localeCompare(a.at||'')).slice(0,500),limit:500};
  }
  if(action==='followupHistory') {
   await db.runTransaction(tx=>access(tx,ref,auth));const r=await listing(ref.collection('followups').doc(id(d.id)).collection('history'));await db.runTransaction(tx=>access(tx,ref,auth));return r;
  }
  if(action==='history') {
   await db.runTransaction(tx=>access(tx,ref,auth));const result=await listing(ref.collection('policies').doc(id(d.policyId)).collection('history'));await db.runTransaction(tx=>access(tx,ref,auth));return result;
  }
  if(action==='source') {
   await db.runTransaction(tx=>access(tx,ref,auth));const r=data(await ref.collection('imports').doc(id(d.importId)).collection('reports').doc(id(d.sourceHash)).get());await db.runTransaction(tx=>access(tx,ref,auth));return r;
  }
  if(action==='rollback') {
   await db.runTransaction(tx=>access(tx,ref,auth,'members'));
   const batchId=id(d.importId),sources=await ref.collection('imports').doc(batchId).collection('reports').get(),results=[];
   for(const source of sources.docs){const pRef=ref.collection('policies').doc(source.data().policyId),hRef=pRef.collection('history').doc(await hash(batchId+':'+source.id)),receiptRef=pRef.collection('receipts').doc(source.id);results.push(await db.runTransaction(async tx=>{await access(tx,ref,auth,'members');const p=data(await tx.get(pRef)),h=data(await tx.get(hRef)),receipt=data(await tx.get(receiptRef));if(!p||!h||h.importId!==batchId||h.rolledBack)return {skipped:true};const r=D.rollbackFields(p,h.changes,source.id);tx.set(pRef,r.next);tx.update(hRef,{rolledBack:true,rollbackAt:now,rollbackUid:uid});if(receipt?.historyId===hRef.id)tx.update(receiptRef,{rolledBack:true});tx.set(ref.collection('audit').doc('rollback-'+source.id),{action:'rollback',policyId:pRef.id,uid,at:now,skipped:r.skipped});return {policyId:pRef.id,skipped:r.skipped};}));}
   return {results};
  }
  if(action==='export') {
   await db.runTransaction(tx=>access(tx,ref,auth,'export'));const out={schemaVersion:1,exportedAt:now};for(const c of ['agencies','customers','policies','households','followups','communications'])out[c]=(await ref.collection(c).get()).docs.map(s=>({id:s.id,...s.data()}));await db.runTransaction(tx=>access(tx,ref,auth,'export'));return out;
  }
  if(action==='deleteWorkspace') {
   await db.runTransaction(async tx=>{await access(tx,ref,auth,'delete');tx.update(ref,{deleting:true});});
   const inv=await db.collection('licCrmInvitations').where('workspaceId','==',ref.id).get();for(const i of inv.docs)await i.ref.delete();await db.recursiveDelete(ref);return {ok:true};
  }
  // Single atomic mutation + stable audit record makes retries safe.
  const op=id(d.operationId),audit=ref.collection('audit').doc(op);
  return db.runTransaction(async tx=>{
   const w=await access(tx,ref,auth,['invite','removeMember','settings','saveAgency'].includes(action)?'members':'write'),prior=data(await tx.get(audit));if(prior)return prior.result||{ok:true};
   let result={ok:true};
   if(action==='invite') {
    if(!w.shared)throw Error('Personal workspaces cannot be shared.');const target=text(d.email).toLowerCase();if(!/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(target)||!['editor','viewer'].includes(d.role))throw Error('Valid email and collaborator role required.');
    tx.set(db.collection('licCrmInvitations').doc(ref.id+':'+target),{workspaceId:ref.id,name:w.name,email:target,role:d.role,accepted:false,createdBy:uid,expiresAt:new Date(Date.now()+7*86400000).toISOString(),expiresAtMs:Date.now()+7*86400000});
   } else if(action==='removeMember') {
    const target=id(d.uid);if(target===w.ownerUid)throw Error('Cannot remove the owner.');const members={...w.members};delete members[target];const memberProfiles={...(w.memberProfiles||{})};delete memberProfiles[target];tx.update(ref,{members,memberProfiles,memberUids:Object.keys(members)});
    // Accepted invitations cannot be reused after removal.
   } else if(action==='settings') {
    const days=d.reminderDays;if(!Array.isArray(days)||!days.length||days.length>10||days.some(n=>!Number.isInteger(n)||n< -60||n>365))throw Error('Use up to ten reminder offsets between -60 and 365 days.');tx.update(ref,{reminderDays:[...new Set(days)]});
   } else if(action==='saveCustomer'||action==='saveAgency'||action==='saveHousehold'||action==='saveFollowup'||action==='savePosterTemplate') {
    const coll={saveCustomer:'customers',saveAgency:'agencies',saveHousehold:'households',saveFollowup:'followups',savePosterTemplate:'posterTemplates'}[action],record=ref.collection(coll).doc(id(d.id)),current=data(await tx.get(record));expect(current,d.revision);
    let draft;
    if(action==='saveCustomer'){draft=customerDraft(d.record);if(draft.birthday&&!D.validDate(draft.birthday))throw Error('Invalid birth date.');if(draft.householdId&&!data(await tx.get(ref.collection('households').doc(draft.householdId))))throw Error('Household not found.');}
    if(action==='saveAgency'){draft=agencyDraft(d.record);if(current&&current.code!==draft.code)throw Error('Agency code is immutable; create a new portfolio.');if(record.id!==draft.code)throw Error('Agency ID must match the code.');}
    if(action==='savePosterTemplate'){draft={name:text(d.record.name,150),message:text(d.record.message,2000),category:text(d.record.category,60),color:/^#[a-fA-F0-9]{6}$/.test(d.record.color)?d.record.color:'#d6b66c',format:d.record.format==='portrait'?'portrait':'square',language:['gu','hi','en'].includes(d.record.language)?d.record.language:'en'};if(!draft.name)throw Error('Template name required.');}
    if(action==='saveHousehold'){draft={name:text(d.record.name,150),notes:text(d.record.notes,2000),sharedPhone:text(d.record.sharedPhone,30)};if(!draft.name)throw Error('Household name required.');}
    if(action==='saveFollowup'){
     const r=d.record;draft={customerId:r.customerId?id(r.customerId):null,policyId:r.policyId?id(r.policyId):null,category:text(r.category,60),due:text(r.due,10),priority:text(r.priority,20),status:text(r.status,30),notes:text(r.notes,4000),assignedUid:text(r.assignedUid,100),nextAction:text(r.nextAction,1000)};
     if(!D.validDate(draft.due)||!['Pending','Completed','Snoozed'].includes(draft.status))throw Error('Valid due date and task status required.');
     if(draft.customerId&&!data(await tx.get(ref.collection('customers').doc(draft.customerId))))throw Error('Customer not found.');if(draft.policyId&&!data(await tx.get(ref.collection('policies').doc(draft.policyId))))throw Error('Policy not found.');
    }
    if(draft.assignedUid&&!w.members[draft.assignedUid])throw Error('Assigned user must be a current member.');tx.set(record,{...current,...draft,revision:(current?.revision||0)+1,updatedAt:now,createdAt:current?.createdAt||now});if(action==='saveFollowup')tx.create(record.collection('history').doc(op),{uid,at:now,previous:current||null,value:draft});result={id:record.id};
   } else if(action==='linkPolicy') {
    const pRef=ref.collection('policies').doc(id(d.policyId)),p=data(await tx.get(pRef));if(!p)throw Error('Policy not found.');expect(p,d.revision);const target=d.customerId?id(d.customerId):null;if(target&&!data(await tx.get(ref.collection('customers').doc(target))))throw Error('Customer not found.');tx.update(pRef,{customerId:target,revision:p.revision+1,updatedAt:now});tx.create(pRef.collection('history').doc(op),{uid,at:now,source:'Customer reassignment',changes:[{field:'customerId',old:p.customerId||null,value:target}]});result={previousCustomerId:p.customerId||null,customerId:target,policyId:pRef.id};
   } else if(action==='mergeCustomers') {
    const aRef=ref.collection('customers').doc(id(d.sourceId)),bRef=ref.collection('customers').doc(id(d.targetId));if(aRef.id===bRef.id)throw Error('Choose two customers.');
    const a=data(await tx.get(aRef)),b=data(await tx.get(bRef));if(!a||!b||a.mergedInto||b.mergedInto)throw Error('Choose existing unmerged customers.');expect(a,d.sourceRevision);expect(b,d.targetRevision);
    const policies=await tx.get(ref.collection('policies').where('customerId','==',aRef.id));if(policies.size>200)throw Error('Move policies in smaller groups before merging.');
    for(const p of policies.docs){tx.update(p.ref,{customerId:bRef.id,revision:(p.data().revision||0)+1});tx.create(p.ref.collection('history').doc(op),{uid,at:now,source:'Customer merge',changes:[{field:'customerId',old:aRef.id,value:bRef.id}]});}tx.update(aRef,{mergedInto:bRef.id,revision:a.revision+1});tx.update(bRef,{aliases:[...new Set([...(b.aliases||[]),a.name,...(a.aliases||[])])].slice(0,30),revision:b.revision+1});result={sourceId:aRef.id,targetId:bRef.id,policyIds:policies.docs.map(p=>p.id)};
   } else if(action==='splitCustomer') {
    const sourceRef=ref.collection('customers').doc(id(d.sourceId)),source=data(await tx.get(sourceRef));if(!source?.mergedInto)throw Error('Choose a merged source customer.');expect(source,d.revision);
    if(!Array.isArray(d.policyIds)||d.policyIds.length>100)throw Error('Select up to 100 policies.');const selected=[];for(const key of new Set(d.policyIds)){const pRef=ref.collection('policies').doc(id(key)),p=data(await tx.get(pRef));if(!p||p.customerId!==source.mergedInto)throw Error('Policy grouping changed; reload first.');selected.push({ref:pRef,data:p});}
    tx.update(sourceRef,{mergedInto:null,revision:source.revision+1,updatedAt:now});for(const p of selected){tx.update(p.ref,{customerId:sourceRef.id,revision:(p.data.revision||0)+1,updatedAt:now});tx.create(p.ref.collection('history').doc(op),{uid,at:now,source:'Customer split',changes:[{field:'customerId',old:source.mergedInto,value:sourceRef.id}]});}result={id:sourceRef.id,policyIds:selected.map(p=>p.ref.id)};
   } else if(action==='updatePolicy') {
    const pRef=ref.collection('policies').doc(id(d.id)),p=data(await tx.get(pRef));expect(p,d.revision);const fields={...(p?.fields||{})},provenance={...(p?.provenance||{})};
    for(const [k,v] of Object.entries(d.fields||{})){if(!['policyNo','name','plan','doc','term','ppt','maturityPeriod','lastDue','fup','lastAccountDate','sumAssured','mode','premium','status','neft','dab','nominee','mobile','agencyCode'].includes(k))throw Error('Unsupported policy field.');if(v==null||v==='')continue;if(['premium','sumAssured','term','ppt'].includes(k)){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1e12)throw Error('Invalid numeric field.');}else if(typeof v!=='string'||v.length>200)throw Error('Invalid field.');if(['doc','lastAccountDate'].includes(k)&&!D.validDate(v))throw Error('Invalid date.');if(['fup','lastDue','maturityPeriod'].includes(k)&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(v))throw Error('Invalid period.');fields[k]=v;provenance[k]={source:'manual',verified:true,uid,at:now};}
    if(['ppt','term'].some(k=>fields[k]!=null&&(!Number.isInteger(fields[k])||fields[k]<1||fields[k]>120)))throw Error('Policy and premium terms must be whole years between 1 and 120.');
    if(D.policyKey(fields.policyNo)!==pRef.id)throw Error('Policy number cannot change.');if(!p&&!fields.name)throw Error('Policyholder name required.');
    const assignedUid=d.assignedUid??p?.assignedUid??uid;if(assignedUid&&!w.members[assignedUid])throw Error('Invalid servicing member.');
    tx.set(pRef,{...p,fields,provenance,originalAgencyCode:p?.originalAgencyCode||fields.agencyCode||null,customerId:p?.customerId||null,assignedUid,managingWorkspace:ref.id,insurer:'LIC',revision:(p?.revision||0)+1,updatedAt:now});
    tx.set(pRef.collection('history').doc(op),{uid,at:now,source:'manual',changes:Object.keys(d.fields||{}).filter(k=>JSON.stringify(fields[k])!==JSON.stringify(p?.fields?.[k])).map(k=>({field:k,old:p?.fields?.[k]??null,value:fields[k]}))});
   } else if(action==='verifyPayment') {
    const pRef=ref.collection('policies').doc(id(d.policyId)),p=data(await tx.get(pRef));if(!p||!D.validDate(d.due)||!text(d.evidence,1000))throw Error('Policy, installment date and payment evidence required.');const installment=D.premiumSchedule({...p,fields:{...p.fields,status:'IN-FORCE',fup:p.fields.doc?.slice(0,7)}},d.due,d.due);if(!installment.length)throw Error('This date is not a supported scheduled installment.');const payments={...(p.payments||{}),[d.due]:{status:'paid',evidence:text(d.evidence,1000),uid,at:now}};tx.update(pRef,{payments,revision:(p.revision||0)+1});tx.create(pRef.collection('history').doc(op),{uid,at:now,source:'Payment verification',changes:[{field:'payment '+d.due,old:p.payments?.[d.due]||null,value:payments[d.due]}]});
   } else if(action==='communicate') {
    const c=data(await tx.get(ref.collection('customers').doc(id(d.customerId))));if(!c||c.consent==='No')throw Error('Customer not found or communication declined.');
    const record={customerId:d.customerId,policyId:d.policyId?id(d.policyId):null,text:text(d.text,4000),state:d.state,uid,at:now};if(!['Prepared','Opened','Manually marked sent'].includes(record.state))throw Error('Invalid communication state.');record.category=text(d.category||'general',60);record.installment=d.installment||null;
    if(record.state!=='Prepared'){const guard=ref.collection('communicationGuards').doc(await hash([d.customerId,d.policyId||'',record.category,record.installment||'',record.state].join(':'))),previous=data(await tx.get(guard));if(previous&&Date.parse(now)-Date.parse(previous.at)<86400000)throw Error('This reminder action was already recorded within the past 24 hours. Check communication history.');tx.set(guard,{at:now,uid});}
    tx.set(ref.collection('communications').doc(op),record);
   } else throw Error('Unknown CRM action.');
   tx.create(audit,{action,uid,at:now,result});return result;
  });
 };
}
