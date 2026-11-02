// Actual Web SDK transactions and deployed rules in the emulator; never production.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {context,clear}=require('./lic-crm-emulator-fixture.cjs');
(async()=>{
 await clear();const all=[];const make=async(uid,verified)=>{const c=await context(uid,verified);all.push(c);return c;};
 try{
 const owner=await make('owner'),editor=await make('editor'),viewer=await make('viewer'),outsider=await make('outsider'),unverified=await make('unverified',false);
 const {id:w}=await owner.execute({action:'create',shared:true,name:'Rule fixture',operationId:'shared'}),run=(c,action,d={})=>c.execute({action,workspaceId:w,...d});
 assert.equal((await owner.execute({action:'list'})).workspaces.length,1);
 const denied=async fn=>assert.rejects(fn,e=>e.code==='permission-denied'||/access denied|verified|expired|already used/.test(e.message));
 await denied(()=>run(outsider,'load'));
 for(const [c,role]of [[editor,'editor'],[viewer,'viewer']]){
  await run(owner,'invite',{email:c.user.email,role,operationId:'invite-'+role});
  const invitation=(await c.execute({action:'list'})).invitations[0];assert.ok(invitation);
  await c.execute({action:'accept',invitationId:invitation.id});assert.equal((await c.execute({action:'list'})).workspaces.length,1);
 }
 await run(editor,'saveCustomer',{id:'c',revision:0,operationId:'c',record:{name:'Example',consent:'Yes'}});
 await run(viewer,'load');
 // Bypass the repository entirely: UI permissions are not the authority.
 await denied(()=>viewer.sdk.setDoc(viewer.sdk.doc(viewer.db,`licCrmWorkspaces/${w}/customers/hacked`),{name:'Injected'}));
 await denied(()=>editor.sdk.updateDoc(editor.sdk.doc(editor.db,`licCrmWorkspaces/${w}`),{'members.editor':'owner',writtenBy:'editor',writtenAt:editor.sdk.serverTimestamp(),writeRevision:99}));
 await denied(()=>outsider.sdk.getDocs(outsider.sdk.collection(outsider.db,`licCrmWorkspaces/${w}/customers`)));
 await run(owner,'invite',{email:'unverified@example.com',role:'editor',operationId:'unverified'});await denied(()=>unverified.execute({action:'accept',invitationId:w+':unverified@example.com'}));
 const sample=fs.readFileSync(path.join(__dirname,'fixtures/lic-print-v12.txt'),'utf8');
 await run(editor,'import',{text:sample,operationId:'batch1'});const load=await run(owner,'load');assert.equal(load.policies.rows.length,1);const p=load.policies.rows[0];
 assert.equal((await run(editor,'import',{text:sample,operationId:'batch1'})).results[0].identical,true);
 await run(editor,'linkPolicy',{policyId:p.id,revision:p.revision,customerId:'c',operationId:'link'});
 await run(editor,'saveFollowup',{id:'f',revision:0,operationId:'followup',record:{category:'NEFT registration',due:'2026-11-02',status:'Pending',notes:'Test',customerId:'c'}});
 await run(owner,'rollback',{importId:'batch1'});assert.equal((await run(owner,'load')).policies.rows[0].fields.policyNo,'000012345');
 await run(editor,'import',{text:sample,operationId:'batch2'});assert.equal((await run(owner,'history',{policyId:p.id})).rows.filter(h=>h.sourceHash).length,2,'Reimport after rollback appends a new immutable history event');
 await run(editor,'communicate',{customerId:'c',state:'Prepared',text:'Verify payment',operationId:'message'});
 await run(owner,'removeMember',{uid:'editor',operationId:'revoke'});await denied(()=>run(editor,'load'));await denied(()=>editor.execute({action:'accept',invitationId:w+':editor@example.com'}));
 await run(owner,'deleteWorkspace');assert.equal((await owner.execute({action:'list'})).workspaces.length,0);
 console.log('CRM Web SDK/rules: invitations, role enforcement, forged writes, revocation, imports, linking, immutable history, rollback/reimport, tasks and deletion passed.');
 }finally{for(const c of all)await c.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
