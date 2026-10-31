export const caseId=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),value=>value.toString(16).padStart(2,'0')).join('');
export const caseStatuses={open:'Open',progress:'In progress',waiting:'Waiting',done:'Completed'};
export const casePriorities={high:'High',normal:'Normal',low:'Low'};
export const caseTypes=['General task','D/C form','NEFT rejection','Claim query','Other'];
export const blankCase=()=>({title:'',policyNo:'',name:'',type:'General task',priority:'normal',status:'open'});
export function caseMatches(item,search='',status='active',priority='all'){
 const statusMatch=status==='all'||(status==='active'?item.status!=='done':item.status===status);
 return statusMatch&&(priority==='all'||item.priority===priority)&&[item.title,item.policyNo,item.name,item.type,item.latestNote].join(' ').toLowerCase().includes(search.trim().toLowerCase());
}
export function sortCases(a,b){return({high:0,normal:1,low:2}[a.priority]??1)-({high:0,normal:1,low:2}[b.priority]??1)||(b.updatedAtMs||0)-(a.updatedAtMs||0)}
export function buildCaseChange(current,draft,{operationId,note='',photos=[],now=Date.now(),expectedRevision=null}){
 if(current?.lastOperationId===operationId)return null;
 if(current&&expectedRevision===null)throw Object.assign(new Error('This case already exists. Reopen it before making changes.'),{code:'case-conflict'});
 if(current&&expectedRevision!==null&&(current.revision||0)!==expectedRevision)throw Object.assign(new Error('This case changed elsewhere. Reopen it to load the latest version; your draft is kept.'),{code:'case-conflict'});
 if(!current&&expectedRevision!==null)throw new Error('This case no longer exists. Your draft is kept.');
 const text=note.trim(),next={...current,...Object.fromEntries(Object.keys(blankCase()).map(key=>[key,String(draft[key]??current?.[key]??blankCase()[key]).trim()]))};
 if(!next.title)next.title=next.policyNo?`Policy ${next.policyNo}`:next.name||text.split('\n')[0].slice(0,200)||(photos.length?'Document follow-up':'');
 if(!next.title)throw new Error('Add a task, policy reference, note or photo.');
 if(!Object.hasOwn(caseStatuses,next.status)||!Object.hasOwn(casePriorities,next.priority)||!caseTypes.includes(next.type))throw new Error('Choose a valid status, priority and case type.');
 if(next.title.length>200||next.policyNo.length>80||next.name.length>160||text.length>10000)throw new Error('One of the fields is too long.');
 return{...next,revision:(current?.revision||0)+1,createdAtMs:current?(current.createdAtMs??0):now,updatedAtMs:now,lastOperationId:operationId,latestNote:text||current?.latestNote||'',photoCount:(current?.photoCount||0)+photos.length};
}

export function caseTimestamp(value,fallback=0){
 const remote=typeof value?.toMillis==='function'?value.toMillis():typeof value?.seconds==='number'?value.seconds*1000+(value.nanoseconds||0)/1e6:typeof value==='number'?value:0;
 if(Number.isFinite(remote)&&remote>0)return remote;
 const local=Number(fallback);return Number.isFinite(local)&&local>0?local:0;
}
export function caseHistory(entries,item){
 const history=[...entries],created=caseTimestamp(item.createdAt,item.createdAtMs);
 if(created&&!history.some(entry=>entry.kind==='activity'&&entry.action==='created'))history.push({id:'recorded-creation',kind:'activity',action:'created',text:'Case created',createdAtMs:created});
 return history.sort((a,b)=>caseTimestamp(b.createdAt,b.createdAtMs)-caseTimestamp(a.createdAt,a.createdAtMs));
}
