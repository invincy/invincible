// In-memory transaction adapter for service authorization/data regression tests.
// Read-after-write is rejected, matching Firestore's transaction contract.
class Ref {
 constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
 collection(name){return new Query(this.db,this.path+'/'+name);}
 async get(){return this.db.snapshot(this);}
 async delete(){this.db.records.delete(this.path);}
}
class Query {
 constructor(db,path,filters=[],maximum=Infinity,cursor=null){Object.assign(this,{db,path,filters,maximum,cursor});}
 doc(id){return new Ref(this.db,this.path+'/'+id);}
 where(field,op,value){if(!['==','array-contains'].includes(op))throw Error('Unsupported fixture query');return new Query(this.db,this.path,[...this.filters,[field,op,value]],this.maximum,this.cursor);}
 limit(n){return new Query(this.db,this.path,this.filters,n,this.cursor);}
 orderBy(){return this;}
 startAfter(s){return new Query(this.db,this.path,this.filters,this.maximum,s.id);}
 async get(){const docs=[...this.db.records.keys()].filter(p=>p.startsWith(this.path+'/')&&!p.slice(this.path.length+1).includes('/')).sort().filter(p=>!this.cursor||p.split('/').at(-1)>this.cursor).map(p=>this.db.snapshot(new Ref(this.db,p))).filter(s=>this.filters.every(([k,op,v])=>op==='array-contains'?s.data()[k]?.includes(v):s.data()[k]===v)).slice(0,this.maximum);return {docs,size:docs.length,empty:!docs.length};}
}
class MemoryDb {
 constructor(){this.records=new Map();this.queue=Promise.resolve();}
 doc(path){return new Ref(this,path);}collection(path){return new Query(this,path);}
 snapshot(ref){const record=this.records.get(ref.path);return {id:ref.id,ref,exists:record!==undefined,data:()=>structuredClone(record)};}
 async recursiveDelete(ref){for(const p of this.records.keys())if(p===ref.path||p.startsWith(ref.path+'/'))this.records.delete(p);}
 async runTransaction(fn){const run=async()=>{let wrote=false;const writes=[];const tx={get:async ref=>{if(wrote)throw Error('Read after write');return ref.get();},set:(r,v)=>{wrote=true;writes.push(['set',r,v]);},create:(r,v)=>{wrote=true;writes.push(['create',r,v]);},update:(r,v)=>{wrote=true;writes.push(['update',r,v]);},delete:r=>{wrote=true;writes.push(['delete',r]);}};const result=await fn(tx);if(this.failBeforeCommit){this.failBeforeCommit=false;throw Error('Unavailable before commit');}for(const [action,ref,value]of writes){if(action==='delete')this.records.delete(ref.path);else{if(action==='create'&&this.records.has(ref.path))throw Error('Already exists');if(action==='update'&&!this.records.has(ref.path))throw Error('Missing update target');this.records.set(ref.path,structuredClone(action==='update'?{...this.records.get(ref.path),...value}:value));}}if(this.failAfterCommit){this.failAfterCommit=false;throw Error('Lost acknowledgement');}return result;};const promise=this.queue.then(run);this.queue=promise.catch(()=>{});return promise;}
}
module.exports={MemoryDb};
