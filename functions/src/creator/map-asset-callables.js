const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineString}=require('firebase-functions/params');
const {getFirestore}=require('firebase-admin/firestore');
const {getStorage}=require('firebase-admin/storage');
const {assertAccess}=require('./access');
const {id,decodeAsset,storagePath,assetRecord}=require('./map-assets');
const bucketName=defineString('CREATOR_STORAGE_BUCKET',{default:''});
const options={region:'asia-south1',timeoutSeconds:90,memory:'512MiB',maxInstances:2};
async function access(request,projectId){if(!request.auth)throw new HttpsError('unauthenticated','Sign in first.');const ref=getFirestore().collection('creatorProjects').doc(id(projectId)),snap=await ref.get();assertAccess(request.auth,snap.exists?snap.data():null);return ref;}
const guarded=fn=>async request=>{try{return await fn(request);}catch(e){if(e instanceof HttpsError)throw e;throw new HttpsError('failed-precondition',e.message||'Map asset operation failed.');}};
exports.creatorMapAssetUpload=onCall(options,guarded(async request=>{
 const data=request.data||{},ref=await access(request,data.projectId),decoded=decodeAsset(data),record=assetRecord(data,ref.id,decoded);
 if(!bucketName.value())throw Error('Creator Storage uploads are not enabled yet. Use a hosted URL for now.');
 const file=getStorage().bucket(bucketName.value()).file(record.storagePath);
 try{await file.save(decoded.bytes,{resumable:false,contentType:data.mimeType,preconditionOpts:{ifGenerationMatch:0},metadata:{metadata:{sha256:decoded.hash}}});}catch(e){if(Number(e.code)!==412)throw Error('Map asset upload failed. Retry with the same file.');const [meta]=await file.getMetadata();if(meta.metadata?.sha256!==decoded.hash)throw Error('This upload ID already contains another file.');}
 await access(request,data.projectId);
 const receipt=ref.collection('mapAssets').doc(record.id);
 return getFirestore().runTransaction(async tx=>{const old=await tx.get(receipt);if(old.exists){if(old.data().sha256!==record.sha256)throw Error('Upload ID conflict.');return {asset:old.data()};}tx.create(receipt,record);return {asset:record};});
}));
exports.creatorMapAssetUrl=onCall(options,guarded(async request=>{
 const data=request.data||{},ref=await access(request,data.projectId),path=storagePath(ref.id,data.assetId),receipt=await ref.collection('mapAssets').doc(id(data.assetId)).get();
 if(!receipt.exists||receipt.data().storagePath!==path)throw Error('Stored map asset not found.');
 if(!bucketName.value())throw Error('Creator Storage is not configured.');
 const [url]=await getStorage().bucket(bucketName.value()).file(path).getSignedUrl({action:'read',expires:Date.now()+15*60*1000});return {url,expiresInSeconds:900};
}));
