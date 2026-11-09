export async function mapAssetCall(name,data){
 const [{getFunctions,httpsCallable},{firebaseApp,authReady}]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js'),import('../shared/firebase-client.js')]);await authReady;
 return (await httpsCallable(getFunctions(firebaseApp,'asia-south1'),name)(data)).data;
}
export async function resolveMapAsset(asset){
 if(asset.cloudAssetId){const [{createMediaClient},{auth,authReady}]=await Promise.all([import('./media-library.js?v=2026111002'),import('../shared/firebase-client.js')]);await authReady;if(!auth.currentUser)throw Error('Sign in to retrieve cloud artwork.');return createMediaClient(auth.currentUser.uid).read(asset.cloudAssetId);}
 if(asset.url)return asset.url;
 const assetId=asset.storagePath.split('/').at(-1),result=await mapAssetCall('creatorMapAssetUrl',{projectId:asset.storageProjectId,assetId});return result.url;
}
export async function uploadMapAsset(projectId,file,assetId,credit='',name=file.name){
 if(!projectId)throw Error('Save and open this project before uploading custom assets.');
 const [{createMediaClient,inspectMedia,mapAssetFromMedia},{auth,authReady}]=await Promise.all([import('./media-library.js?v=2026111002'),import('../shared/firebase-client.js')]);await authReady;if(!auth.currentUser)throw Error('Sign in to upload artwork.');
 const info=await inspectMedia(file);if(!['image','glb'].includes(info.kind))throw Error('Use an image or GLB for the map.');info.credit=credit;info.name=name||file.name;
 return mapAssetFromMedia(await createMediaClient(auth.currentUser.uid).upload(file,info));
}
