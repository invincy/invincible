import {indiaToday,premiumSchedule} from './domain.mjs';
// Derived while the page is open. No timers, scheduler, messages, or writes.
export function dueAlerts(policies,day=indiaToday(),offsets=[-7,0,7]) {
  const from=new Date(Date.parse(day+'T12:00:00Z')-366*86400000).toISOString().slice(0,10);
  const to=new Date(Date.parse(day+'T12:00:00Z')+Math.max(7,...offsets.map(n=>Math.max(0,-n)))*86400000).toISOString().slice(0,10);
  return policies.flatMap(p=>premiumSchedule(p,from,to,p.payments).filter(e=>e.status!=='Confirmed paid').map(e=>({id:e.id,policyId:p.id,customerId:p.customerId||null,due:e.due,amount:e.amount,kind:e.due<=day?'Verify payment status':'Upcoming premium',resolved:false,projected:true}))).sort((a,b)=>a.due.localeCompare(b.due));
}
