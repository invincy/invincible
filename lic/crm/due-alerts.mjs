import {indiaToday,premiumSchedule,addMonths} from './domain.mjs';
// A calendar month, anchored to the due day; short months clamp to month-end.
export function reminderStart(due){return addMonths(due,-1);}
// Derived while the page is open. No timers, scheduler, messages, or writes.
export function dueAlerts(policies,day=indiaToday(),offsets=[-7,0,7]) {
  const from=new Date(Date.parse(day+'T12:00:00Z')-366*86400000).toISOString().slice(0,10);
  const before=Math.max(0,...offsets.filter(Number.isFinite).map(n=>Math.max(0,-n)));
  const customEnd=new Date(Date.parse(day+'T12:00:00Z')+before*86400000).toISOString().slice(0,10);
  // Look far enough to include e.g. 31 March becoming visible on 28 February.
  const to=[addMonths(day,2),customEnd].sort().at(-1);
  return policies.flatMap(p=>premiumSchedule(p,from,to,p.payments)
    .filter(e=>e.status!=='Confirmed paid'&&(e.due<=day||reminderStart(e.due)<=day||e.due<=customEnd))
    .map(e=>({id:e.id,policyId:p.id,customerId:p.customerId||null,due:e.due,reminderStart:reminderStart(e.due),amount:e.amount,kind:e.due<=day?'Verify payment status':'Upcoming premium',resolved:false,projected:true})))
    .sort((a,b)=>a.due.localeCompare(b.due));
}
