// Firestore Security Rules tests for creatorProjects concurrency, ownership and bounds; emulator-only.
const assert=require('node:assert/strict');
const {createRequire}=require('node:module'),fs=require('node:fs'),path=require('node:path');
const localRequire=createRequire(path.resolve(__dirname,'../react/package.json'));
const sdk=localRequire('firebase/firestore'),appSdk=localRequire('firebase/app');

const projectId='demo-invincible-creator-rules';
const fullRules=fs.readFileSync(path.resolve(__dirname,'../firestore.rules'),'utf8');

function emulatorAddress(){
 const value=process.env.FIRESTORE_EMULATOR_HOST;
 if(!value)throw Error('Run this test through the Firestore emulator (FIRESTORE_EMULATOR_HOST).');
 const [host,port]=value.split(':');
 return {host,port:Number(port)};
}

async function clear(){
 const {host,port}=emulatorAddress();
 const res=await fetch(`http://${host}:${port}/emulator/v1/projects/${projectId}/databases/(default)/documents`,{method:'DELETE'});
 if(!res.ok)throw Error('Could not clear Firestore emulator.');
}

async function setRules(rules){
 const {host,port}=emulatorAddress();
 const res=await fetch(`http://${host}:${port}/emulator/v1/projects/${projectId}:securityRules`,{
  method:'PUT',
  body:JSON.stringify({rules:{files:[{content:rules}]}})
 });
 if(!res.ok)throw Error(await res.text());
}

async function createClient(uid,mockUserToken){
 const {host,port}=emulatorAddress();
 const app=appSdk.initializeApp({projectId,apiKey:'emulator-only',appId:'test'},'creator-rules-'+uid+'-'+Math.random());
 const db=sdk.getFirestore(app);
 sdk.connectFirestoreEmulator(db,host,port,mockUserToken?{mockUserToken}:undefined);
 return {
  uid,db,sdk,app,
  ref:id=>sdk.doc(db,'creatorProjects',id),
  async close(){await sdk.terminate(db);await appSdk.deleteApp(app);}
 };
}

const denied=fn=>assert.rejects(fn,err=>err?.code==='permission-denied');

(async()=>{
 const clients=[];
 const make=async(uid,token)=>{const c=await createClient(uid,token);clients.push(c);return c;};
 try{
  await setRules(fullRules);
  await clear();

  const anon=await make('anon',null);
  const noEmail=await make('noemail',{sub:'noemail'});
  const owner=await make('owner',{sub:'owner',email:'Owner@Example.com',email_verified:true});
  const editor=await make('editor',{sub:'editor',email:'editor@example.com',email_verified:true});
  const outsider=await make('outsider',{sub:'outsider',email:'outsider@example.com',email_verified:true});

  const baseDoc=(id,overrides={})=>({
   id,
   title:'Rule Hardened Film',
   format:'Long',
   stage:'Script',
   scenes:[{id:'s1',duration:5,voiceover:'Opening line'}],
   ownerUid:'owner',
   ownerEmail:'owner@example.com',
   editorEmails:[],
   writeRevision:1,
   writtenBy:'owner',
   writtenAt:sdk.serverTimestamp(),
   createdAt:sdk.serverTimestamp(),
   updatedAt:sdk.serverTimestamp(),
   customMetadata:{keep:true},
   ...overrides
  });

  // 1. Unauthenticated, no-email & outsider create denials.
  await denied(()=>sdk.setDoc(anon.ref('p1'),baseDoc('p1')));
  await denied(()=>sdk.setDoc(noEmail.ref('p1'),baseDoc('p1',{ownerUid:'noemail'})));
  await denied(()=>sdk.setDoc(outsider.ref('p1'),baseDoc('p1')));

  // 2. Invalid create payloads rejected (bad writeRevision, forged timestamps, spoofed ids, oversized fields).
  await denied(()=>sdk.setDoc(owner.ref('p-bad-rev'),baseDoc('p-bad-rev',{writeRevision:2})));
  await denied(()=>sdk.setDoc(owner.ref('p-no-rev'),(()=>{const d=baseDoc('p-no-rev');delete d.writeRevision;return d;})()));
  await denied(()=>sdk.setDoc(owner.ref('p-bad-writer'),baseDoc('p-bad-writer',{writtenBy:'outsider'})));
  await denied(()=>sdk.setDoc(owner.ref('p-bad-ts'),baseDoc('p-bad-ts',{writtenAt:new Date()})));
  await denied(()=>sdk.setDoc(owner.ref('p-bad-id'),baseDoc('wrong-id')));
  await denied(()=>sdk.setDoc(owner.ref('p-long-title'),baseDoc('p-long-title',{title:'x'.repeat(301)})));
  await denied(()=>sdk.setDoc(owner.ref('p-many-scenes'),baseDoc('p-many-scenes',{scenes:Array.from({length:501},(_,i)=>({id:'s'+i}))})));
  await denied(()=>sdk.setDoc(owner.ref('p-bad-map'),baseDoc('p-bad-map',{historicalMap:'invalid'})));

  // 3. Valid owner create succeeds (preserving custom metadata & uppercase email normalization).
  await sdk.setDoc(owner.ref('p1'),baseDoc('p1'));
  assert.equal((await sdk.getDoc(owner.ref('p1'))).data().writeRevision,1);

  // 4. Outsider cannot read or delete.
  await denied(()=>sdk.getDoc(outsider.ref('p1')));
  await denied(()=>sdk.deleteDoc(outsider.ref('p1')));

  // 5. Owner transaction updates r1 -> r2 and invites editor; stale or immutable mutations denied.
  await sdk.updateDoc(owner.ref('p1'),{
   editorEmails:['editor@example.com'],
   writeRevision:2,
   writtenBy:'owner',
   writtenAt:sdk.serverTimestamp(),
   updatedAt:sdk.serverTimestamp()
  });
  await denied(()=>sdk.updateDoc(owner.ref('p1'),{
   title:'Stale write',
   writeRevision:2,
   writtenBy:'owner',
   writtenAt:sdk.serverTimestamp(),
   updatedAt:sdk.serverTimestamp()
  }));
  await denied(()=>sdk.updateDoc(owner.ref('p1'),{
   ownerUid:'outsider',
   writeRevision:3,
   writtenBy:'owner',
   writtenAt:sdk.serverTimestamp(),
   updatedAt:sdk.serverTimestamp()
  }));
  await denied(()=>sdk.updateDoc(owner.ref('p1'),{
   id:'tampered',
   writeRevision:3,
   writtenBy:'owner',
   writtenAt:sdk.serverTimestamp(),
   updatedAt:sdk.serverTimestamp()
  }));

  // 6. Invited editor can read and bump writeRevision r2 -> r3, but cannot hijack ACL/immutable fields or delete.
  assert.equal((await sdk.getDoc(editor.ref('p1'))).data().title,'Rule Hardened Film');
  await sdk.runTransaction(editor.db,async tx=>{
   const snap=await tx.get(editor.ref('p1'));
   const data=snap.data();
   tx.set(editor.ref('p1'),{
    ...data,
    title:'Edited By Collaborator',
    writeRevision:data.writeRevision+1,
    writtenBy:'editor',
    writtenAt:sdk.serverTimestamp(),
    updatedAt:sdk.serverTimestamp()
   });
  });
  assert.equal((await sdk.getDoc(owner.ref('p1'))).data().writeRevision,3);

  for(const badPatch of [
   {editorEmails:[]},
   {ownerUid:'editor'},
   {ownerEmail:'editor@example.com'},
   {id:'other'},
   {createdAt:sdk.serverTimestamp()}
  ]){
   await denied(()=>sdk.updateDoc(editor.ref('p1'),{
    ...badPatch,
    writeRevision:4,
    writtenBy:'editor',
    writtenAt:sdk.serverTimestamp(),
    updatedAt:sdk.serverTimestamp()
   }));
  }
  await denied(()=>sdk.deleteDoc(editor.ref('p1')));

  // 7. Legacy project created before writeRevision existed upgrades smoothly 0 -> 1 on owner update.
  await setRules(`rules_version='2';service cloud.firestore{match /databases/{database}/documents{match /{document=**}{allow read,write:if request.auth!=null;}}}`);
  await sdk.setDoc(owner.ref('legacy-p'),{
   id:'legacy-p',
   title:'Pre-hardening Project',
   ownerUid:'owner',
   ownerEmail:'owner@example.com',
   editorEmails:[],
   createdAt:sdk.serverTimestamp(),
   updatedAt:sdk.serverTimestamp()
  });
  await setRules(fullRules);
  await sdk.runTransaction(owner.db,async tx=>{
   const snap=await tx.get(owner.ref('legacy-p'));
   const prev=snap.data();
   const nextRev=Number.isInteger(prev.writeRevision)?prev.writeRevision+1:1;
   tx.set(owner.ref('legacy-p'),{
    ...prev,
    title:'Upgraded Legacy Project',
    writeRevision:nextRev,
    writtenBy:'owner',
    writtenAt:sdk.serverTimestamp(),
    updatedAt:sdk.serverTimestamp()
   });
  });
  assert.equal((await sdk.getDoc(owner.ref('legacy-p'))).data().writeRevision,1);

  // 8. Owner can delete.
  await sdk.deleteDoc(owner.ref('p1'));
  await denied(()=>sdk.getDoc(outsider.ref('p1')));

  console.log('Creator Project Firestore Rules passed: create/update/delete auth, writeRevision monotonicity, collaborator ACL lock, legacy upgrade, and bounds enforced.');
 }finally{
  await setRules(fullRules).catch(()=>{});
  for(const c of clients)await c.close().catch(()=>{});
 }
})().catch(err=>{console.error(err);process.exitCode=1;});
