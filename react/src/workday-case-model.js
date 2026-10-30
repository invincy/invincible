export const caseStatuses={todo:'To do',progress:'In progress',pending:'Pending',done:'Completed'};
export const casePriorities={high:'High',normal:'Normal',low:'Low'};
export const emptyCase=()=>({title:'',policyNumber:'',policyName:'',description:'',priority:'normal',status:'todo',dueDate:''});
export function caseLabel(item){return item.title||item.policyName||(item.policyNumber?`Policy ${item.policyNumber}`:'Office task')}
export function casePatch(value){
 const text=(key,max)=>String(value[key]||'').trim().slice(0,max);
 return {title:text('title',200),policyNumber:text('policyNumber',80),policyName:text('policyName',200),description:text('description',12000),priority:Object.hasOwn(casePriorities,value.priority)?value.priority:'normal',status:Object.hasOwn(caseStatuses,value.status)?value.status:'todo',dueDate:/^\d{4}-\d{2}-\d{2}$/.test(value.dueDate||'')?value.dueDate:''};
}
export function filterCases(items,{search='',status='open',priority='all'}={}){
 const needle=search.trim().toLowerCase(),rank={high:0,normal:1,low:2};
 return items.filter(item=>!item.archived&&(status==='all'||(status==='open'?item.status!=='done':item.status===status))&&(priority==='all'||item.priority===priority)&&(!needle||[item.title,item.policyNumber,item.policyName,item.description].some(value=>String(value||'').toLowerCase().includes(needle))))
 .sort((a,b)=>(rank[a.priority]??1)-(rank[b.priority]??1)||(a.dueDate||'9999').localeCompare(b.dueDate||'9999')||(b.updatedAtMs||0)-(a.updatedAtMs||0));
}
