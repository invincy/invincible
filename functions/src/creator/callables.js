const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineString}=require('firebase-functions/params');
const {getFirestore}=require('firebase-admin/firestore');
const {getStorage}=require('firebase-admin/storage');
const {createHash}=require('node:crypto');
const {assertAccess,decodeVideo}=require('./access');
const storageBucket=defineString('CREATOR_STORAGE_BUCKET',{default:''});
const id=value=>{if(typeof value!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(value))throw Error('Invalid record ID.');return value;};
const options={region:'asia-south1',timeoutSeconds:90,memory:'512MiB',maxInstances:2};
async function access(request){if(!request.auth)throw new HttpsError('unauthenticated','Sign in first.');const ref=getFirestore().collection('creatorProjects').doc(id(request.data?.projectId)),snap=await ref.get();assertAccess(request.auth,snap.exists?snap.data():null);return {ref,project:snap.data()};}
function guarded(fn){return async request=>{try{return await fn(request);}catch(e){if(e instanceof HttpsError)throw e;throw new HttpsError('failed-precondition',e.message||'Creator operation failed.');}};}
exports.creatorManualClipUpload=onCall(options,guarded(async request=>{
 const {ref,project}=await access(request),data=request.data,clipId=id(data.clipId),versionId=id(data.versionId);
 if(!(project.productionClips||[]).some(c=>c.id===clipId))throw Error('Production Clip not found. Save it before uploading.');
 if(!storageBucket.value())throw Error('Creator Storage is not configured on the backend.');
 const bytes=decodeVideo(data),hash=createHash('sha256').update(bytes).digest('hex'),path=`creatorProjects/${ref.id}/clips/${clipId}/${versionId}`,bucket=getStorage().bucket(storageBucket.value()),file=bucket.file(path);
 try{await file.save(bytes,{resumable:false,contentType:data.mimeType,preconditionOpts:{ifGenerationMatch:0},metadata:{metadata:{sha256:hash}}});}catch(e){if(Number(e.code)!==412)throw Error('Storage upload failed. Check the bucket configuration.');const [meta]=await file.getMetadata();if(meta.metadata?.sha256!==hash)throw Error('Version ID already contains a different file.');}
 const version={id:versionId,name:String(data.name||'Manual video clip').slice(0,150),storagePath:path,mimeType:data.mimeType,sha256:hash,status:'Ready',origin:'manual-video-upload',createdAt:new Date().toISOString()};
 await access(request);
 const asset={...version,type:'Video',path:'gs://'+bucket.name+'/'+path,sceneIds:project.productionClips.find(c=>c.id===clipId).sceneIds,groupIds:[],clipId};
 return {version,asset};
}));
exports.creatorAssetUrl=onCall(options,guarded(async request=>{
 const {project,ref}=await access(request),asset=(project.assets||[]).find(a=>a.id===id(request.data.assetId));
 if(!asset?.storagePath?.startsWith(`creatorProjects/${ref.id}/clips/`)||asset.storagePath.includes('..'))throw Error('Stored project video not found.');
 if(!storageBucket.value())throw Error('Creator Storage is not configured.');const [url]=await getStorage().bucket(storageBucket.value()).file(asset.storagePath).getSignedUrl({action:'read',expires:Date.now()+15*60*1000});return {url,expiresInSeconds:900};
}));
// Intentionally no paid video-generation callable. Manual uploads remain provider-neutral.
