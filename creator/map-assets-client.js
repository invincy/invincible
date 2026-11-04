export async function mapAssetCall(name,data){
 const [{getFunctions,httpsCallable},{firebaseApp,authReady}]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js'),import('../shared/firebase-client.js')]);await authReady;
 return (await httpsCallable(getFunctions(firebaseApp,'asia-south1'),name)(data)).data;
}
export async function resolveMapAsset(asset){
 if(asset.url)return asset.url;
 const assetId=asset.storagePath.split('/').at(-1),result=await mapAssetCall('creatorMapAssetUrl',{projectId:asset.storageProjectId,assetId});return result.url;
}
export async function uploadMapAsset(projectId,file,assetId,credit=''){
 if(!projectId)throw Error('Save and open this project before uploading custom assets.');
 if(file.size>5*1024*1024)throw Error('Use an asset up to 5 MB, or a hosted URL for larger files.');
 const mimeType=/\.glb$/i.test(file.name)?'model/gltf-binary':file.type;
 if(!['image/png','image/jpeg','image/webp','model/gltf-binary'].includes(mimeType))throw Error('Use PNG, JPEG, WebP or GLB.');
 const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('Could not read this file.'));r.readAsDataURL(file);});
 return (await mapAssetCall('creatorMapAssetUpload',{projectId,assetId,name:file.name,mimeType,base64,credit})).asset;
}
