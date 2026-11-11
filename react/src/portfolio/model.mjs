export const emptyPortfolio=()=>({version:1,revision:0,holdings:[],sips:[],events:[],snapshots:[],asOf:''});
export const todayIST=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const num=(v,label)=>{if(v===''||v==null||!Number.isFinite(Number(v))||Number(v)<0)throw Error(`Invalid ${label}`);return Number(v)};
export function holding(input){
 const id=String(input.id||input.isin||input.symbol||input.name||'').trim();
 if(!id||!String(input.name||input.symbol||'').trim())throw Error('Holding needs a name and identifier');
 const kind=input.kind==='mf'?'mf':'equity';
 const units=num(input.units,'units'),cost=num(input.cost,'cost'),price=num(input.price,'price');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.priceDate||''))throw Error('Choose a valuation date');
 if(num(input.pledged??0,'pledged quantity')>units)throw Error('Pledged units exceed total units');
 return {id,name:String(input.name||input.symbol).trim(),symbol:String(input.symbol||''),kind,units,cost,price,priceDate:input.priceDate,pledged:num(input.pledged??0,'pledged quantity')};
}
export function totals(rows){return rows.reduce((s,h)=>{s.cost+=h.cost;s.value+=h.units*h.price;s.gain=s.value-s.cost;return s},{cost:0,value:0,gain:0})}
export function importKite(rows){
 const header=rows.findIndex(r=>r.includes('Symbol')&&r.includes('ISIN'));if(header<0)throw Error('Kite Equity sheet headers not found');
 const headings=rows[header],col=n=>headings.indexOf(n),date=rows.flat().map(String).join(' ').match(/as on (\d{4}-\d{2}-\d{2})/)?.[1];
 if(!date)throw Error('Statement date not found');
 const result=rows.slice(header+1).filter(r=>r[col('ISIN')]).map(r=>{
 const get=n=>r[col(n)];const pledged=num(get('Quantity Pledged (Margin)')||0,'pledged')+num(get('Quantity Pledged (Loan)')||0,'pledged');
 const units=num(get('Quantity Available')||0,'quantity')+pledged;
 if(Number(get('Quantity Discrepant')||0)!==0)throw Error('Discrepant quantities require broker reconciliation');
 const price=num(get('Previous Closing Price'),'closing price'),pnl=num(Math.abs(Number(get('Unrealized P&L'))),'profit/loss')*Math.sign(Number(get('Unrealized P&L')));
 return holding({id:get('ISIN'),name:get('Symbol'),symbol:get('Symbol'),units,price,cost:units*price-pnl,pledged,priceDate:date});
 });
 if(!result.length)throw Error('No holdings found');
 const summary=label=>rows.find(r=>r.includes(label))?.[colSummary(rows,label)];
 function colSummary(rs,label){const row=rs.find(r=>r.includes(label));return row?row.indexOf(label)+1:-1}
 const t=totals(result);
 for(const [label,value] of [['Invested Value',t.cost],['Present Value',t.value]])if(!Number.isFinite(Number(summary(label)))||Math.abs(Number(summary(label))-value)>.1)throw Error(`${label} does not reconcile with statement totals`);
 if(new Set(result.map(h=>h.id)).size!==result.length)throw Error('Duplicate ISIN in statement');
 return {holdings:result,asOf:date};
}
export function recordSnapshot(state,date){
 const snapshot={date,equity:totals(state.holdings.filter(h=>h.kind==='equity')),mf:totals(state.holdings.filter(h=>h.kind==='mf'))};
 return {...state,asOf:date,snapshots:[...state.snapshots.filter(s=>s.date!==date),snapshot].sort((a,b)=>a.date.localeCompare(b.date)).slice(-730)};
}
export function replaceEquity(state,rows,date){
 if(rows.some(h=>h.kind!=='equity'))throw Error('Expected equity holdings');
 return recordSnapshot({...state,holdings:[...state.holdings.filter(h=>h.kind!=='equity'),...rows]},date);
}
export function trade(state,{id,type,units,price,date,eventId}){
 const h=state.holdings.find(h=>h.id===id);if(!h)throw Error('Select a holding');
 if(state.events.some(e=>e.id===eventId))return state;
 units=num(units,'units');price=num(price,'price');if(!units||!price)throw Error('Units and price must be positive');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Choose a trade date');
 if(type==='sell'&&units>h.units)throw Error('Sale exceeds held units');
 if(type==='sell'&&units>h.units-h.pledged)throw Error('Release pledged units before recording this sale');
 const costRemoved=type==='sell'?h.cost*units/h.units:0;
 const next={...h,units:h.units+(type==='sell'?-units:units),cost:h.cost+(type==='sell'?-costRemoved:units*price)};
 const event={id:eventId,holdingId:id,name:h.name,type,units,price,date,costRemoved,realised:type==='sell'?units*price-costRemoved:0};
 return recordSnapshot({...state,holdings:state.holdings.map(row=>row.id===id?next:row),events:[...state.events,event]},todayIST());
}
export function dueSips(state,today){
 return state.sips.flatMap(s=>{
 const result=[];let date=new Date(`${s.start.slice(0,7)}-01T00:00:00Z`);let count=0;
 while(date.toISOString().slice(0,7)<=today.slice(0,7)&&count++<120){
 const month=date.toISOString().slice(0,7),last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate(),day=`${month}-${String(Math.min(s.day,last)).padStart(2,'0')}`,id=`sip:${s.id}:${day}`;
 if(day>=s.start&&day<=today&&!state.events.some(e=>e.id===id))result.push({...s,date:day,eventId:id});
 date.setUTCMonth(date.getUTCMonth()+1);
 }return result;
 });
}
export function financeAccounts(accounts,state){
 if(!state?.holdings?.length)return accounts;
 const linked=['equity','mf'].filter(kind=>state.holdings.some(h=>h.kind===kind));
 const categories=linked.map(k=>k==='mf'?'mutualFunds':'portfolio');
 const category=a=>a.category||(a.type==='liability'?'liabilities':/portfolio|stock|share|zerodha|kite/i.test(a.name||'')?'portfolio':'cash');
 return [...accounts.filter(a=>!categories.includes(category(a))),...linked.map(kind=>({id:`linked-${kind}`,name:kind==='mf'?'Portfolio · mutual funds':'Portfolio · equity',category:kind==='mf'?'mutualFunds':'portfolio',type:'asset',balance:totals(state.holdings.filter(h=>h.kind===kind)).value,linked:true}))];
}
// Estimates require a quote explicitly dated to the instalment, never today's NAV for an old SIP.
export function estimateDueSips(state,today){
 let next=state;
 for(const s of dueSips(state,today)){
 const h=next.holdings.find(h=>h.id===s.holdingId);
 if(!h||h.priceDate!==s.date||h.price<=0)continue;
 next=trade(next,{id:h.id,type:'buy',units:s.amount/h.price,price:h.price,date:s.date,eventId:s.eventId});
 next={...next,events:next.events.map(e=>e.id===s.eventId?{...e,estimated:true,scheduledAmount:s.amount}:e)};
 }return next;
}
