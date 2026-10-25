import React,{useEffect,useRef,useState} from 'react';
import {collection,doc,limit,onSnapshot,orderBy,query,setDoc,serverTimestamp} from 'firebase/firestore';
import {db} from '../src/firebase';
import {newId} from '../src/task-model';
import {draftKey,readDraft,writeDraft,clearDraft} from './draft-store';
import {validateIdea} from './canvas-model';

export default function CanvasIdeas({uid,capture,onClose,onRestore}) {
  const key=draftKey(uid,'canvas','idea'),[draft,setDraft]=useState(()=>capture?{id:newId('idea'),title:'',category:'Future idea',notes:'',...capture}:readDraft(key));
  const [ideas,setIdeas]=useState([]),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[filter,setFilter]=useState('All'),[detail,setDetail]=useState(null);
  const dialog=useRef(null),focus=useRef(document.activeElement),live=useRef(true);
  useEffect(()=>{live.current=true;dialog.current.showModal();return()=>{live.current=false;focus.current?.focus?.({preventScroll:true});};},[]);
  useEffect(()=>onSnapshot(query(collection(db,'users',uid,'dashboardIdeas'),orderBy('createdAt','desc'),limit(40)),snapshot=>{setIdeas(snapshot.docs.map(item=>({...item.data(),id:item.id})));setReady(true);setError('');},()=>{setReady(true);setError('Saved ideas could not sync. Close and reopen to retry.');}),[uid]);
  useEffect(()=>{if(draft&&!writeDraft(key,draft))setError('This draft could not be kept on this device. Keep this window open until saved.');},[draft,key]);
  const save=async event=>{
    event.preventDefault();setError('');setBusy(true);
    try{const idea=validateIdea(draft);await setDoc(doc(db,'users',uid,'dashboardIdeas',idea.id),{...idea,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});if(!live.current)return;clearDraft(key);setDraft(null);setFilter('All');}
    catch(failure){if(live.current)setError(/permission-denied/.test(failure.code||failure.message||'')?'Saving was denied. Your draft is kept; check your account and retry.':failure.message||'Save could not be confirmed. Your draft is kept. Retry.');}
    finally{if(live.current)setBusy(false);}
  };
  const edit=(field,value)=>setDraft(previous=>({...previous,[field]:value}));
  return <dialog ref={dialog} className="v2-idea-dialog" aria-labelledby="canvas-ideas-title" onCancel={event=>{event.preventDefault();if(!busy)onClose();}}>
    <header><h2 id="canvas-ideas-title">{draft?'Save idea':'Ideas'}</h2><button type="button" aria-label="Close ideas" disabled={busy} onClick={onClose}>×</button></header>
    {error&&<p role="alert">{error}</p>}
    {draft?<form onSubmit={save}>
      <img className="v2-idea-preview" src={draft.image} alt="Selected dashboard area"/>
      <label>Title<input autoFocus aria-label="Idea title" maxLength={160} required disabled={busy} value={draft.title} onChange={event=>edit('title',event.target.value)}/></label>
      <label>Category<input aria-label="Idea category" list="canvas-idea-categories" maxLength={60} required disabled={busy} value={draft.category} onChange={event=>edit('category',event.target.value)}/></label>
      <datalist id="canvas-idea-categories"><option value="Future idea"/><option value="YouTube idea"/>{[...new Set(ideas.map(idea=>idea.category))].filter(value=>!['Future idea','YouTube idea'].includes(value)).map(value=><option key={value} value={value}/>)}</datalist>
      <label>Note<textarea aria-label="Idea note" maxLength={5000} disabled={busy} value={draft.notes} onChange={event=>edit('notes',event.target.value)}/></label>
      <footer><button type="button" disabled={busy} onClick={()=>{clearDraft(key);setDraft(null);}}>Discard draft</button><button type="submit" className="v2-primary" disabled={busy}>{busy?'Saving…':'Save idea'}</button></footer>
    </form>:detail?<article className="v2-idea-detail"><button onClick={()=>setDetail(null)}>← Ideas</button><img className="v2-idea-preview" src={detail.image} alt={detail.title}/><h3>{detail.title}</h3><small>{detail.category}</small><p>{detail.notes}</p><div className="v2-actions"><button onClick={()=>onRestore(detail)}>{detail.source==='journal'?'Open journal area':'Return to canvas area'}</button><a href={detail.image} download={detail.title.replace(/[^a-z0-9-]/gi,'_')+'.webp'}>Download image</a></div></article>:<>
      <label className="v2-idea-filter">Category<select aria-label="Filter ideas" value={filter} onChange={event=>setFilter(event.target.value)}>{['All',...new Set(ideas.map(idea=>idea.category))].map(value=><option key={value}>{value}</option>)}</select></label>
      {!ready?<p role="status">Loading ideas…</p>:ideas.length===0?<p>Select an area of the dashboard to save your first idea.</p>:<div className="v2-idea-grid">{ideas.filter(idea=>filter==='All'||idea.category===filter).map(idea=><button type="button" key={idea.id} onClick={()=>setDetail(idea)}><img src={idea.image} alt="" loading="lazy"/><strong>{idea.title}</strong><small>{idea.category}</small></button>)}</div>}
      <small>Latest 40 saved areas</small>
    </>}
  </dialog>;
}
