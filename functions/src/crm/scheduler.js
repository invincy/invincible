// Bounded pages; deterministic alert IDs make scheduled retries idempotent.
async function runCrmReminders(db, today) {
 const D=await import('./domain.mjs');today ||= D.indiaToday();let cursor=null;
 do {
  let query=db.collection('licCrmWorkspaces').orderBy('__name__').limit(50);if(cursor)query=query.startAfter(cursor);
  const spaces=await query.get();if(spaces.empty)break;cursor=spaces.docs.at(-1);
  for(const space of spaces.docs){if(space.data().deleting)continue;let pCursor=null;
   do {let pq=space.ref.collection('policies').orderBy('__name__').limit(100);if(pCursor)pq=pq.startAfter(pCursor);const ps=await pq.get();if(ps.empty)break;pCursor=ps.docs.at(-1);
    for(const p of ps.docs)await db.runTransaction(async tx=>{
     const w=await tx.get(space.ref),snap=await tx.get(p.ref);if(!w.exists||w.data().deleting||!snap.exists)return;
     const policy={...snap.data(),id:p.id},from=new Date(Date.parse(today+'T12:00:00Z')-366*86400000).toISOString().slice(0,10),to=new Date(Date.parse(today+'T12:00:00Z')+61*86400000).toISOString().slice(0,10);
     const schedule=D.premiumSchedule(policy,from,to,policy.payments),active=await tx.get(space.ref.collection('alerts').where('policyId','==',p.id).where('resolved','==',false));
     const valid=new Set(schedule.filter(e=>e.status!=='Confirmed paid').map(e=>e.due));
     for(const a of active.docs)if(!valid.has(a.data().due))tx.update(a.ref,{resolved:true,reason:'Schedule or verification changed; no payment inferred.'});
     for(const event of schedule){if(event.status==='Confirmed paid')continue;
      for(const offset of w.data().reminderDays||[-7,0,7]){const day=new Date(Date.parse(event.due+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);if(day!==today)continue;
       const alert=space.ref.collection('alerts').doc(`${p.id}-${event.due}-${offset}`);
       // Repeated jobs overwrite the same deterministic event, never append duplicates.
       tx.set(alert,{policyId:p.id,customerId:policy.customerId||null,due:event.due,reminderDate:day,offset,resolved:false,kind:'Payment verification',amount:event.amount,projected:true});
      }
     }
    });
   }while(true);
  }
 }while(true);
}
module.exports={runCrmReminders};
