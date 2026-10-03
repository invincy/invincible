const lists=['accounts','bills','transactions','checklist'];
// Apply only this tab's edits to the latest month, preserving other-device additions.
export function mergeFinanceChange(remote,before,after){
 const merged={...remote};
 for(const key of lists){
  const old=new Map((before[key]||[]).map(item=>[item.id,item])),next=new Map((after[key]||[]).map(item=>[item.id,item]));
  const rows=new Map((remote[key]||[]).map(item=>[item.id,item]));
  for(const id of old.keys())if(!next.has(id))rows.delete(id);
  for(const [id,item]of next)if(!old.has(id)||JSON.stringify(old.get(id))!==JSON.stringify(item))rows.set(id,item);
  merged[key]=[...rows.values()];
 }
 if(after.initializedFrom!==before.initializedFrom)merged.initializedFrom=after.initializedFrom||'';
 return merged;
}
