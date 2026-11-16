import {collection,doc,onSnapshot,query,runTransaction,where,updateDoc} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {auth,authReady,db} from '../../shared/firebase-client.js';

const PREFIX='invincible:creator-scene-jpg:v1:';
const AGENT_ID='browser-creator-renderer';
const withTimeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error(`${label} timed out after ${Math.round(ms/1000)}s.`)),ms))]);

export function startBrowserSceneJpgBridge({account,projectId,ready,getManifest,capture,upload,status}){
  if(!account||!projectId)return()=>{};
  let stopped=false,active=new Set();
  const tasks=collection(db,'users',account,'aiTasks');
  const unsubscribe=onSnapshot(query(tasks,where('status','==','queued')),
    snapshot=>{for(const row of snapshot.docs)void process(row);},
    error=>status?.(`Browser JPG bridge unavailable: ${error.message}`));
  const unsubscribeRunning=onSnapshot(query(tasks,where('status','==','running')),
    snapshot=>{for(const row of snapshot.docs){const task=row.data()||{};if(task.agentId===AGENT_ID&&Number(task.leaseExpiresAtMs||0)<Date.now())void reclaim(row);}},
    error=>status?.(`Browser JPG recovery unavailable: ${error.message}`));
  async function reclaim(row){await updateDoc(doc(db,'users',account,'aiTasks',row.id),{status:'queued',agentId:null,leaseExpiresAtMs:null,updatedAtMs:Date.now(),error:'Previous browser render expired; retrying.'}).catch(()=>{});}
  async function process(row){
    if(stopped||active.has(row.id))return;
    const task=row.data()||{},command=String(task.command||'');
    if(!command.startsWith(PREFIX))return;
    let request;
    try{request=JSON.parse(command.slice(PREFIX.length));}catch{return;}
    if(request.projectId!==projectId)return;
    active.add(row.id);
    const ref=doc(db,'users',account,'aiTasks',row.id);
    try{
      const claimed=await runTransaction(db,async tx=>{
        const snap=await tx.get(ref),current=snap.data();
        if(!snap.exists()||current?.status!=='queued')return false;
        tx.update(ref,{status:'running',agentId:AGENT_ID,leaseExpiresAtMs:Date.now()+120000,updatedAtMs:Date.now()});
        return true;
      });
      if(!claimed)return;
      await authReady;
      if(auth.currentUser?.uid!==account)throw Error('The signed-in account changed.');
      await withTimeout(ready,30000,'Creator Studio initialization');
      const manifest=getManifest(),scene=manifest?.scenes?.find(item=>item.id===request.sceneId);
      if(!scene)throw Error(`Scene does not exist: ${request.sceneId}`);
      const offset=Number(request.offsetSeconds),safeOffset=Number.isFinite(offset)?Math.max(0,Math.min(scene.durationSeconds,offset)):scene.durationSeconds/2;
      const blob=await withTimeout(capture(scene.id,safeOffset),45000,'Scene JPG capture');
      const index=manifest.scenes.findIndex(item=>item.id===scene.id)+1;
      const base=String(manifest.title||'invincible').replace(/[^\p{L}\p{N}_-]/gu,'_');
      const file=new File([blob],`${base}-scene-${String(index).padStart(2,'0')}-t-${safeOffset.toFixed(2)}s.jpg`,{type:'image/jpeg'});
      const info=await withTimeout(upload(file),30000,'JPG upload');
      const url=await withTimeout(info.read(info.asset.id),30000,'JPG URL retrieval');
      await updateDoc(ref,{status:'completed',result:{projectId,sceneId:scene.id,offsetSeconds:safeOffset,assetId:info.asset.id,downloadUrl:url,name:file.name},completedAtMs:Date.now(),updatedAtMs:Date.now(),agentId:null,leaseExpiresAtMs:null});
      status?.(`Scene ${index} JPG returned to the plugin at ${safeOffset.toFixed(2)}s.`);
    }catch(error){
      await updateDoc(ref,{status:'failed',error:String(error?.message||error).slice(0,2000),updatedAtMs:Date.now(),agentId:null,leaseExpiresAtMs:null}).catch(()=>{});
      status?.(`Scene JPG failed: ${error.message}`);
    }finally{active.delete(row.id);}
  }
  return()=>{stopped=true;unsubscribe();unsubscribeRunning();active.clear();};
}
