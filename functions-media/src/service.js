const {HttpsError}=require('firebase-functions/v2/https');
const {FieldValue}=require('firebase-admin/firestore');
const {assetId,projectId,metadata,verifyBytes}=require('./model');
async function handleMedia(request,{db,bucket}){
 if(!request.auth)throw new HttpsError('unauthenticated','Sign in to use your media library.');
 const uid=request.auth.uid,data=request.data||{},account=db.collection('_creatorMedia').doc(uid),assets=account.collection('assets');
 try{
  if(data.action==='list'){
   let q=assets.orderBy('createdAt','desc').limit(100);if(data.after){const last=await assets.doc(assetId(data.after)).get();if(!last.exists)throw Error('Library page no longer exists.');q=q.startAfter(last);}
   const snap=await q.get();return {assets:snap.docs.map(d=>d.data()),after:snap.size===100?snap.docs.at(-1).id:null};
  }
  if(data.action==='prepare'){
   const record=metadata(data.asset),ref=assets.doc(record.id),old=await ref.get();if(old.exists)return {asset:old.data()};
   const object=bucket.file('creatorMedia/'+uid+'/originals/'+record.id);
   const [uploadUrl]=await object.createResumableUpload({origin:'https://invincy.github.io',preconditionOpts:{ifGenerationMatch:0},metadata:{contentType:record.mimeType,metadata:{assetId:record.id}}});
   // A pending receipt never replaces the completed library record.
   await account.collection('pending').doc(record.id).set({...record,requestedAt:FieldValue.serverTimestamp()});return {uploadUrl};
  }
  if(data.action==='commit'){
   const id=assetId(data.id),ref=assets.doc(id),old=await ref.get();if(old.exists)return {asset:old.data()};
   const pending=await account.collection('pending').doc(id).get();if(!pending.exists)throw Error('Start this upload again.');const record=metadata(pending.data()),object=bucket.file('creatorMedia/'+uid+'/originals/'+id),[info]=await object.getMetadata();
   if(Number(info.size)!==record.size||info.contentType!==record.mimeType)throw Error('Uploaded file metadata does not match.');
   const [bytes]=await object.download();verifyBytes(bytes,record);const completed={...record,createdAt:new Date().toISOString()};
   await db.runTransaction(async tx=>{const latest=await tx.get(ref);if(!latest.exists)tx.create(ref,completed);});return {asset:(await ref.get()).data()};
  }
  if(data.action==='read'){
   const id=assetId(data.id),record=await assets.doc(id).get();if(!record.exists)throw Error('This asset is not in your account library.');
   const [url]=await bucket.file('creatorMedia/'+uid+'/originals/'+id).getSignedUrl({action:'read',expires:Date.now()+15*60*1000});return {url};
  }
  if(['saveDraft','loadDraft'].includes(data.action)){
   const id=projectId(data.projectId),project=await db.collection('creatorProjects').doc(id).get();const p=project.data();
   if(!p||p.ownerUid!==uid)throw new HttpsError('permission-denied','Only the project owner can sync this video draft.');
   const ref=account.collection('drafts').doc(id);
   if(data.action==='loadDraft'){const saved=await ref.get();return saved.exists?{draft:saved.data()}: {draft:null};}
   const payload={manifest:data.manifest,brands:data.brands},size=Buffer.byteLength(JSON.stringify(payload));if(size>900000)throw Error('Cloud video draft must be under 900 KB.');
   if(![1,2].includes(payload.manifest?.schemaVersion)||!Array.isArray(payload.brands))throw Error('Invalid video draft.');
   return await db.runTransaction(async tx=>{const old=await tx.get(ref),revision=old.exists?old.data().revision:0;if((data.revision||0)!==revision)throw new HttpsError('aborted','This video changed on another device. Reload before saving; your local draft is retained.');const next=revision+1;tx.set(ref,{...payload,revision:next,updatedAt:new Date().toISOString()});return {revision:next};});
  }
  throw Error('Unknown media library action.');
 }catch(error){if(error instanceof HttpsError)throw error;throw new HttpsError('failed-precondition',error.message||'Media library request failed.');}
}
module.exports={handleMedia};
