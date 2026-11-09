import {decodeVoiceover} from './video-studio/audio.js?v=2026111002';
export const isCloudFile=id=>typeof id==='string'&&/^cloud-[a-f0-9]{64}$/.test(id);
export function createMediaClient(accountId){
 async function call(data){
  const [{mapAssetCall},{auth,authReady}]=await Promise.all([import('./map-assets-client.js?v=2026111002'),import('../shared/firebase-client.js')]);await authReady;
  if(auth.currentUser?.uid!==accountId)throw Error('Your account changed. Reopen this project before continuing.');
  const result=await mapAssetCall('creatorMedia',data);
  if(auth.currentUser?.uid!==accountId)throw Error('Your account changed. Reopen this project before continuing.');return result;
 }
 return {async list(){const all=[];let after=null;do{const page=await call({action:'list',after});all.push(...page.assets);after=page.after;}while(after);return all;},
  async upload(file,metadata){const result=await call({action:'prepare',asset:metadata});if(result.asset)return result.asset;
   const uploaded=await fetch(result.uploadUrl,{method:'PUT',body:file,headers:{'Content-Type':metadata.mimeType}});if(!uploaded.ok&&uploaded.status!==412)throw Error('Upload did not finish. Choose the same file to retry.');return (await call({action:'commit',id:metadata.id})).asset;},
  async read(id){return (await call({action:'read',id})).url;},
  async file(id){const url=await this.read(id),response=await fetch(url);if(!response.ok)throw Error('Could not retrieve the original cloud asset.');return response.blob();},
  async loadDraft(projectId){return (await call({action:'loadDraft',projectId})).draft;},
  saveDraft(projectId,manifest,brands,revision){return call({action:'saveDraft',projectId,manifest,brands,revision});}
 };
}
export async function inspectMedia(file){
 const mimeType=/\.glb$/i.test(file.name)?'model/gltf-binary':['audio/x-wav','audio/wave','audio/vnd.wave'].includes(file.type)?'audio/wav':file.type;
 const kind=mimeType.startsWith('image/')?'image':mimeType.startsWith('video/')?'video':mimeType.startsWith('audio/')?'audio':mimeType==='model/gltf-binary'?'glb':null;
 if(!kind||!['image/png','image/jpeg','image/webp','video/mp4','video/webm','audio/mpeg','audio/wav','model/gltf-binary'].includes(mimeType)||file.size>100*1024*1024)throw Error('Use PNG/JPEG/WebP, MP4/WebM, MP3/WAV or GLB up to 100 MB.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const record={id:'cloud-'+hash,name:file.name,mimeType,kind,size:file.size};
 if(kind==='audio'){record.duration=(await decodeVoiceover(file)).duration;}
 if(kind==='image'){const image=await createImageBitmap(file);record.width=image.width;record.height=image.height;image.close();}
 if(kind==='video'){
  const video=document.createElement('video'),url=URL.createObjectURL(file);try{video.preload='metadata';await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Video metadata timed out.')),15000);video.onloadedmetadata=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(Error('Cannot decode this video.'));};video.src=url;});record.width=video.videoWidth;record.height=video.videoHeight;record.duration=video.duration;if(!Number.isFinite(record.duration)||record.duration<=0||record.duration>600)throw Error('Video must be at most ten minutes.');}finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
 }
 return record;
}
export function mapAssetFromMedia(a){if(!['image','glb'].includes(a.kind))throw Error('Choose image or GLB artwork.');return {id:a.id,name:a.name,type:a.kind,cloudAssetId:a.id,credit:a.credit||''};}

export async function uploadSharedMedia(file,extra={}){
 const {auth,authReady}=await import('../shared/firebase-client.js');await authReady;if(!auth.currentUser)throw Error('Sign in to upload to your shared library.');
 const client=createMediaClient(auth.currentUser.uid),info=await inspectMedia(file);Object.assign(info,extra);return client.upload(file,info);
}
export async function readSharedMedia(id){const {auth,authReady}=await import('../shared/firebase-client.js');await authReady;if(!auth.currentUser)throw Error('Sign in to retrieve your cloud media.');return createMediaClient(auth.currentUser.uid).read(id);}
