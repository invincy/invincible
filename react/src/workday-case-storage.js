import{collection,doc,onSnapshot,runTransaction,serverTimestamp}from'firebase/firestore';
import{auth,db}from'./firebase';
import{buildCaseChange,caseId,caseTimestamp}from'./workday-case-model.mjs';
const requireAccount=uid=>{if(auth.currentUser?.uid!==uid)throw new Error('Your account changed. Sign in again before saving.')};
export function watchCases(uid,next,error){return onSnapshot(collection(db,'users',uid,'workdayCases'),{includeMetadataChanges:true},snapshot=>{if(auth.currentUser?.uid===uid)next(snapshot.docs.map(item=>({...item.data(),id:item.id})),snapshot.metadata)},error)}
export function watchCaseFiles(uid,id,next,error){return onSnapshot(collection(db,'users',uid,'workdayCases',id,'entries'),snapshot=>{if(auth.currentUser?.uid===uid)next(snapshot.docs.map(item=>({...item.data(),id:item.id})).sort((a,b)=>caseTimestamp(b.createdAt,b.createdAtMs)-caseTimestamp(a.createdAt,a.createdAtMs)))},error)}
export async function saveCase(uid,id,draft,{operationId,note='',photos=[],expectedRevision=null}){
 requireAccount(uid);const reference=doc(db,'users',uid,'workdayCases',id),now=Date.now();
 return runTransaction(db,async transaction=>{
  requireAccount(uid);const snapshot=await transaction.get(reference),current=snapshot.exists()?snapshot.data():null;
  const next=buildCaseChange(current,draft,{operationId,note,photos,now,expectedRevision});if(!next)return;
  requireAccount(uid);transaction.set(reference,{...next,...(current?{}:{createdAt:serverTimestamp()}),updatedAt:serverTimestamp()});
  transaction.set(doc(reference,'entries','save-'+operationId),{kind:'activity',action:current?'saved':'created',text:current?'Case saved':'Case created',createdAtMs:now,createdAt:serverTimestamp()});
  if(note.trim())transaction.set(doc(reference,'entries',operationId),{kind:'note',text:note.trim(),createdAtMs:now,createdAt:serverTimestamp()});
  for(const photo of photos){if(photo.data.length>750000||!photo.data.startsWith('data:image/jpeg;base64,'))throw new Error('This photo is too large. Please select a smaller image.');transaction.set(doc(reference,'entries',photo.id),{kind:'photo',data:photo.data,name:photo.name,createdAtMs:now,createdAt:serverTimestamp()})}
 });
}
export async function prepareCasePhoto(file){
 if(!file.type.startsWith('image/'))throw new Error('Choose an image file.');
 if(file.size>25*1024*1024)throw new Error('Choose an image smaller than 25 MB.');
 const url=URL.createObjectURL(file),image=new Image();
 try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('This image could not be read. Try a JPEG or PNG.'));image.src=url});
  const canvas=document.createElement('canvas');let edge=2000,data='';
  do{const scale=Math.min(1,edge/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);data=canvas.toDataURL('image/jpeg',.88);edge=Math.floor(edge*.8)}while(data.length>750000&&edge>=400);
  if(data.length>750000)throw new Error('This image is too large to save. Try a smaller photo.');
  return{id:caseId(),name:file.name||'Document photo',data};
 }finally{URL.revokeObjectURL(url)}
}
