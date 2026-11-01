/* One user-edit timeline over the existing stroke API, never over incoming snapshots. */
(()=>{
 let key='',past=[],future=[],pending=null,gesture=false,timer;
 const context=()=>{const c=window.__journalApi?.context();return c?c.uid+'.'+c.dateKey:'';};
 const clone=value=>value===undefined?null:structuredClone(value);
 function sync(){if(key!==context()){key=context();past=[];future=[];pending=null;gesture=false;clearTimeout(timer);}}
 function flush(){clearTimeout(timer);if(!pending)return;const rows=[...pending.values()].filter(row=>JSON.stringify(row.before)!==JSON.stringify(row.after));pending=null;if(rows.length){past.push(rows);if(past.length>100)past.shift();future=[];}}
 function record(kind,value,rows,apply){sync();const id=kind==='save'?value.id:value,before=rows.find(row=>row.id===id);if(!pending)pending=new Map();if(!pending.has(id))pending.set(id,{id,before:clone(before),after:null});pending.get(id).after=kind==='save'?clone(value):null;clearTimeout(timer);if(!gesture)timer=setTimeout(flush,450);return apply();}
 function replay(rows,side){const api=window.__journalApi;for(const row of rows){const value=row[side];if(value)api.rawSave(structuredClone(value));else api.rawRemove(row.id);}}
 function undo(){sync();flush();const rows=past.pop();if(rows){replay(rows,'before');future.push(rows);return true;}
  // Loaded ink remains undoable; layout metadata is never mistaken for a pen stroke.
  const stroke=window.__journalApi?.strokes().filter(s=>s.tool!=='canvas-layout').at(-1);if(stroke){const rows=[{id:stroke.id,before:clone(stroke),after:null}];window.__journalApi.rawRemove(stroke.id);future.push(rows.map(r=>({id:r.id,before:null,after:r.before})));}return true;
 }
 function redo(){sync();flush();const rows=future.pop();if(rows){replay(rows,'after');past.push(rows);}return true;}
 document.addEventListener('pointerdown',e=>{if(e.target.closest?.('#live-canvas,.journal-selection,.journal-card-move,.journal-card-resize,.journal-canvas-icon')){sync();flush();gesture=true;}},true);
 const end=()=>{if(gesture){gesture=false;setTimeout(flush,32);}};
 document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true);window.addEventListener('blur',()=>{gesture=false;flush();});
 window.__journalHistory={record,undo,redo,flush,reset:sync};
})();
