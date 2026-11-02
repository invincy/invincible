// Firebase Web SDK adapter. Every write is authorized by deployed Firestore rules.
// A workspace revision serializes relationship queries with concurrent mutations.
export function crmWorkspacePath(uid,id){return id==='personal-'+uid?`users/${uid}/licAgentCrmWorkspaces/${id}`:`licCrmWorkspaces/${id}`;}
export function createFirestoreDriver(database, user, isCurrent, sdk) {
  const check = () => { if (!isCurrent()) throw Error('Account or workspace changed. Operation stopped.'); };
  const logicalPersonal='licCrmWorkspaces/personal-'+user.uid,physicalPersonal=crmWorkspacePath(user.uid,'personal-'+user.uid);
  const physical=path=>path===logicalPersonal||path.startsWith(logicalPersonal+'/')?physicalPersonal+path.slice(logicalPersonal.length):path;
  const logical=path=>path===physicalPersonal||path.startsWith(physicalPersonal+'/')?logicalPersonal+path.slice(physicalPersonal.length):path;
  const toDoc = snap => ({ id:snap.id, ref:new Document(logical(snap.ref.path)), raw:snap, exists:snap.exists(), data:()=>snap.data() });
  const toQuery = docs => ({ docs, size:docs.length, empty:!docs.length });
  class Document {
    constructor(path) { this.path=path;this.id=path.split('/').at(-1); }
    collection(name) { return new Collection(this.path+'/'+name); }
    async get() { check();const s=toDoc(await sdk.getDocFromServer(sdk.doc(database,physical(this.path))));check();return s; }
    async delete() { check();await sdk.deleteDoc(sdk.doc(database,physical(this.path)));check(); }
  }
  class Collection {
    constructor(path,constraints=[]) { this.path=path;this.constraints=constraints; }
    doc(id) { return new Document(this.path+'/'+id); }
    where(...args) { return new Collection(this.path,[...this.constraints,sdk.where(...args)]); }
    limit(n) { return new Collection(this.path,[...this.constraints,sdk.limit(n)]); }
    orderBy(name) { return new Collection(this.path,[...this.constraints,sdk.orderBy(name==='__name__'?sdk.documentId():name)]); }
    startAfter(snapshot) { return new Collection(this.path,[...this.constraints,sdk.startAfter(snapshot.raw)]); }
    query() { return sdk.query(sdk.collection(database,physical(this.path)),...this.constraints); }
    async get() { check();const s=await sdk.getDocsFromServer(this.query());check();return toQuery(s.docs.map(toDoc)); }
  }
  const rootOf = path => path.startsWith('licCrmWorkspaces/') ? path.split('/').slice(0,2).join('/') : null;
  async function runTransaction(callback) {
    check();return sdk.runTransaction(database,async native=>{
      const reads=new Map(),writes=[];
      const read = async ref => {
        check();
        if(ref instanceof Collection) {
          // Web transactions cannot read queries. The root revision is read before
          // this query and bumped on every child mutation, forcing a retry if the
          // matching set changes. Re-read returned documents inside the transaction.
          const root=rootOf(ref.path);if(root&&!reads.has(root))await read(new Document(root));
          const found=await ref.get(),docs=[];
          for(const doc of found.docs){const snap=await read(doc.ref);if(snap.exists)docs.push(snap);}
          return toQuery(docs);
        }
        if(!reads.has(ref.path))reads.set(ref.path,toDoc(await native.get(sdk.doc(database,physical(ref.path)))));
        check();return reads.get(ref.path);
      };
      const tx={get:read,set:(ref,value)=>writes.push({method:'set',ref,value}),update:(ref,value)=>writes.push({method:'update',ref,value}),create:(ref,value)=>writes.push({method:'create',ref,value}),delete:ref=>writes.push({method:'delete',ref})};
      const result=await callback(tx);check();
      if(!writes.length)return result;
      const roots=[...new Set(writes.map(w=>rootOf(w.ref.path)).filter(Boolean))];
      if(roots.length!==1)throw Error('A CRM transaction must target one workspace.');
      const root=roots[0],snapshot=await read(new Document(root));
      const stamp={writtenBy:user.uid,writtenAt:sdk.serverTimestamp()};
      const rootWrite=writes.find(w=>w.ref.path===root);
      if(rootWrite){rootWrite.value={...rootWrite.value,writeRevision:(snapshot.exists?snapshot.data().writeRevision||0:0)+1,...stamp};}
      else writes.push({method:'update',ref:new Document(root),value:{writeRevision:(snapshot.data().writeRevision||0)+1,...stamp}});
      // All reads are complete before the first SDK write.
      for(const w of writes){
        const ref=sdk.doc(database,physical(w.ref.path));
        if(w.method==='create'&&reads.get(w.ref.path)?.exists)throw Error('Record already exists.');
        if(w.method==='delete')native.delete(ref);
        else if(w.method==='update')native.update(ref,{...w.value,...stamp});
        else native.set(ref,{...w.value,...stamp});
      }
      check();return result;
    });
  }
  const collections=['agencies','customers','policies','households','followups','communications','imports','posterTemplates','audit','communicationGuards'];
  async function purgeCollection(path,nested=[]) {
    for(;;){check();const page=await new Collection(path).limit(40).get();if(page.empty)return;
      for(const item of page.docs)for(const sub of nested)await purgeCollection(item.ref.path+'/'+sub);
      const batch=sdk.writeBatch(database);for(const item of page.docs)batch.delete(sdk.doc(database,physical(item.ref.path)));check();await batch.commit();
    }
  }
  async function recursiveDelete(ref) {
    for(const name of collections)await purgeCollection(ref.path+'/'+name,name==='policies'?['history','receipts']:name==='followups'?['history']:name==='imports'?['reports']:[]);
    await ref.delete();
  }
  return {collection:path=>new Collection(path),doc:path=>new Document(path),runTransaction,recursiveDelete};
}
