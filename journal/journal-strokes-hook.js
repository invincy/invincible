// Adapter for the existing Journal bundle. Keep pending edits until Firebase confirms them.
export function createJournalStrokesHook({React,openLocalStore,currentUser,getDb,collection,query,orderBy,onSnapshot,doc,setDoc,deleteDoc,readLegacy}){
 return function useJournalStrokes(dateKey,accountId){
  const[strokes,setStrokes]=React.useState([]),[loading,setLoading]=React.useState(true),[error,setError]=React.useState(null),[user,setUser]=React.useState(null),active=React.useRef(null);
  React.useEffect(()=>{
   let resolveReady;
   const session={uid:accountId||'local',pending:new Map(),remote:[],confirmed:false,cancelled:false,stop:()=>{},chain:Promise.resolve(),ready:new Promise(resolve=>{resolveReady=resolve})};
   active.current=session;setStrokes([]);setLoading(true);setError(null);setUser(null);
   const pendingKey=()=>`invincible.journalPending.${session.uid}.${dateKey}`;
   const persist=()=>{try{localStorage.setItem(pendingKey(),JSON.stringify([...session.pending]))}catch(cause){if(!session.cancelled)setError(cause)}};
   const render=()=>{
    const merged=new Map(session.remote.map(stroke=>[stroke.id,stroke]));
    for(const[id,operation]of session.pending)operation.type==='delete'?merged.delete(id):merged.set(id,operation.stroke);
    const rows=[...merged.values()].sort((a,b)=>(a.createdAtMs||0)-(b.createdAtMs||0));
    if(!session.cancelled){setStrokes(rows);setUser(session.uid==='local'?null:{uid:session.uid,pendingCount:session.pending.size,confirmed:session.confirmed});setLoading(false)}
    return rows;
   };
   const flush=()=>{
    session.chain=session.chain.then(async()=>{
     if(!session.db||session.cancelled)return;
     for(const[id,operation]of [...session.pending]){
      if(session.cancelled)return;
      try{
       const ref=doc(session.db,'users',session.uid,'journals',dateKey,'strokes',id);
       if(operation.type==='delete')await deleteDoc(ref);else await setDoc(ref,operation.stroke,{merge:true});
       if(session.pending.get(id)===operation){
        session.pending.delete(id);session.remote=session.remote.filter(stroke=>stroke.id!==id);
        if(operation.type==='upsert')session.remote.push(operation.stroke);
        persist();render();
       }
       if(!session.cancelled)setError(null);
      }catch(cause){if(!session.cancelled)setError(cause);break}
     }
    }).catch(cause=>{if(!session.cancelled)setError(cause)});
    return session.chain;
   };
   session.save=async(id,operation)=>{
    await session.ready;if(session.cancelled)return;
    session.pending.set(id,operation);persist();const rows=render();
    try{if(session.store){if(operation.type==='delete')await session.store.deleteJournalStroke(session.uid,dateKey,id);else await session.store.upsertJournalStroke(session.uid,dateKey,operation.stroke)}}catch{}
    if(session.uid==='local'){try{localStorage.setItem(`journal_${dateKey}`,JSON.stringify(rows))}catch{}return}
    return flush();
   };
   (async()=>{
    try{
     const account=await currentUser();if(session.cancelled)return;session.uid=account?.uid||'local';
     try{session.pending=new Map(JSON.parse(localStorage.getItem(pendingKey())||'[]'))}catch{}
     try{session.store=await openLocalStore();session.remote=await session.store.getJournalStrokes(session.uid,dateKey)||[]}catch{}
     const legacy=readLegacy(dateKey)||[];
     if(legacy.length){for(const stroke of legacy)if(!session.pending.has(stroke.id))session.pending.set(stroke.id,{type:'upsert',stroke:{...stroke,createdAtMs:stroke.createdAtMs??Date.now()}});persist()}
     render();
     if(!account)return;
     session.db=await getDb();if(session.cancelled)return;
     session.stop=onSnapshot(query(collection(session.db,'users',session.uid,'journals',dateKey,'strokes'),orderBy('createdAtMs','asc')),{includeMetadataChanges:true},snapshot=>{
      if(session.cancelled||snapshot.metadata.hasPendingWrites)return;
      session.remote=[];snapshot.forEach(row=>session.remote.push({...row.data(),id:row.id}));session.confirmed=!snapshot.metadata.fromCache;
      const rows=render();if(session.store)session.store.bulkUpsertJournal(session.uid,dateKey,rows).catch(()=>{});
     },cause=>{if(!session.cancelled){setError(cause);setLoading(false)}});
     resolveReady();await flush();
     if(legacy.length&&!session.pending.size)localStorage.removeItem(`journal_${dateKey}`);
    }catch(cause){if(!session.cancelled){setError(cause);setLoading(false)}}finally{resolveReady()}
   })();
   const online=()=>flush();window.addEventListener('online',online);
   return()=>{session.cancelled=true;session.stop();resolveReady();window.removeEventListener('online',online)};
  },[dateKey,accountId]);
  return{strokes,loading,error,user,syncStrokes:()=>window.dispatchEvent(new Event('online')),saveStroke:stroke=>stroke?.id?active.current?.save(stroke.id,{type:'upsert',stroke:{...stroke,createdAtMs:stroke.createdAtMs??Date.now()}}):undefined,deleteStroke:id=>id?active.current?.save(id,{type:'delete'}):undefined};
 };
}
