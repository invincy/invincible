import PageIcon from '../../v2/PageIcon';
import {useAuth} from '../AuthContext';
import {useEffect,useRef,useState} from 'react';
import {usePortfolio} from './usePortfolio';
import {holding,totals,importKite,replaceEquity,recordSnapshot,trade,dueSips,todayIST,estimateDueSips} from './model.mjs';
import './portfolio.css';
const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);
const savedDate=new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',timeZone:'UTC'});
const freshSip=()=>({holdingId:'',amount:'',day:1,start:todayIST()});
const fresh=()=>({id:'',name:'',symbol:'',kind:'mf',units:'',cost:'',price:'',pledged:0,priceDate:todayIST()});
function Chart({snapshots,filter,metric}){
 const points=snapshots.map(s=>({date:s.date,value:(filter==='mf'?0:s.equity[metric])+(filter==='equity'?0:s.mf[metric])}));
 if(points.length<2)return <div className="pf-chart-empty" role="img" aria-label="No valuation history yet"/>;
 const min=Math.min(0,...points.map(p=>p.value)),max=Math.max(1,...points.map(p=>p.value)),first=Date.parse(points[0].date),last=Date.parse(points.at(-1).date),x=p=>50+(Date.parse(p.date)-first)/(last-first)*850,y=p=>210-(p.value-min)/(max-min)*180;
 return <svg className="pf-chart" viewBox="0 0 950 255" role="img" aria-label={`${metric==='value'?'Portfolio value':'Unrealised gain'} history`}><line x1="50" y1={y({value:0})} x2="900" y2={y({value:0})} stroke="var(--pf-line)"/><polyline points={points.map(p=>`${x(p)},${y(p)}`).join(' ')} fill="none" stroke="var(--pf-accent)" strokeWidth="3"/>{points.map(p=><circle key={p.date} cx={x(p)} cy={y(p)} r="4" fill="var(--pf-accent)"><title>{p.date}: {money(p.value)}</title></circle>)}<text x="50" y="245">{points[0].date}</text><text x="900" y="245" textAnchor="end">{points.at(-1).date}</text><text x="50" y="20">{money(max)}</text></svg>;
}
export function PortfolioPage(){const {user}=useAuth();return <PortfolioWorkspace key={user?.uid||'signed-out'}/>;}
function PortfolioWorkspace(){
 const {state,save,undo,error,busy,uid}=usePortfolio();const [filter,setFilter]=useState('all'),[metric,setMetric]=useState('value'),[search,setSearch]=useState(''),[panel,setPanel]=useState(''),[draft,setDraft]=useState(fresh),[preview,setPreview]=useState(null),[message,setMessage]=useState(''),[tradeDraft,setTrade]=useState({}),[sip,setSip]=useState(freshSip),[importing,setImporting]=useState(false);
 const [showHoldings,setShowHoldings]=useState(false);
 const [showSips,setShowSips]=useState(false);
 const [selectedId,setSelectedId]=useState('');
 const dialogRef=useRef(null);
 useEffect(()=>{
   const dialog=dialogRef.current;
   if(panel&&dialog&&!dialog.open)dialog.showModal();
 },[panel]);
 function openPanel(next){setMessage('');setPanel(next);}
 function dismissPanel(){dialogRef.current?.close();setPanel('');}
 function closePanel(){if(!busy)dismissPanel();}
 useEffect(()=>{if(!state||busy||panel)return;const next=estimateDueSips(state,todayIST());if(next!==state)save(next,'Estimated SIP allotment').catch(e=>setMessage(e.message));},[state?.revision,panel]);
 async function commit(next,label){try{await save(next,label);dismissPanel();setPreview(null);setMessage('Saved');return true}catch(e){setMessage(e.message);return false}}
 async function upload(file){if(!file)return;setImporting(true);setMessage('');try{if(file.size>5e6)throw Error('Use a file smaller than 5 MB');if(!file.name.endsWith('.xlsx'))throw Error('Upload a Kite .xlsx statement. Enter screenshot values with Add holding.');const {default:ExcelJS}=await import('exceljs');const w=new ExcelJS.Workbook();await w.xlsx.load(await file.arrayBuffer());const s=w.getWorksheet('Equity');if(!s)throw Error('Kite Equity sheet is missing');const rows=[];s.eachRow({includeEmpty:true},row=>rows.push(Array.from({length:s.columnCount},(_,i)=>{const v=row.getCell(i+1).value;return v&&typeof v==='object'?v.result??v.text??'':v})));setPreview(importKite(rows));setPanel('import')}catch(e){setMessage(e.message)}finally{setImporting(false)}}
 if(!uid)return <div className="pf"><h1>Portfolio</h1><p>Sign in to open your private holdings.</p></div>;
 if(!state)return <div className="pf" role="status">{error||'Opening portfolio…'}</div>;
 const rows=state.holdings.filter(h=>(filter==='all'||h.kind===filter)&&`${h.name} ${h.symbol}`.toLowerCase().includes(search.toLowerCase())),summary=totals(state.holdings.filter(h=>filter==='all'||h.kind===filter)),pending=dueSips(state,todayIST());
 const selectedHolding=state.holdings.find(h=>h.id===selectedId);
 const selectedSip=state.sips.find(s=>s.id===selectedId);
 const sipTotal=state.sips.reduce((sum,s)=>sum+s.amount,0);
 const fundName=id=>state.holdings.find(h=>h.id===id)?.name||'Missing fund';
 function openTrade(h){
   setTrade({id:h.id,type:'buy',units:'',price:'',date:todayIST(),eventId:crypto.randomUUID()});
   openPanel('trade');
 }
 const updateHolding=async e=>{e.preventDefault();try{const h=holding(draft),next={...state,holdings:[...state.holdings.filter(r=>r.id!==h.id),h]};await commit(recordSnapshot(next,todayIST()),'Holding correction')}catch(e){setMessage(e.message)}};
 const exportData=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`portfolio-${todayIST()}.json`;a.click();URL.revokeObjectURL(url)};
 return <main className="pf"><header className="pf-heading"><div><h1>Portfolio</h1><p>{state.asOf&&<time dateTime={state.asOf} title={state.asOf}>Saved {savedDate.format(new Date(state.asOf))}</time>}</p></div><div className="pf-actions"><button disabled={busy||!state.revision} onClick={()=>openPanel('undo')}><i className="fa-solid fa-rotate-left" aria-hidden="true"/>Undo</button><button onClick={exportData}><i className="fa-solid fa-arrow-down-to-line" aria-hidden="true"/>Export</button><label className="pf-primary"><i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"/>{importing?'Reading…':'Import Kite'}<input aria-label="Import Kite statement" type="file" accept=".xlsx" disabled={busy||importing} onChange={e=>{upload(e.target.files[0]);e.target.value=''}}/></label></div></header>
 <div role="status" className="pf-message">{error||message}</div>
 <nav className="pf-switch" aria-label="Asset class">{[['all','All assets'],['equity','Equity'],['mf','Mutual funds']].map(([v,label])=><button aria-pressed={filter===v} className={filter===v?'active':''} key={v} onClick={()=>setFilter(v)}>{label}</button>)}</nav>
 <section className="pf-summary"><div className="pf-balance"><span>Portfolio value</span><strong>{money(summary.value)}</strong><span className="pf-balance-icon"><PageIcon page="portfolio"/></span></div><div><span>Invested</span><strong>{money(summary.cost)}</strong></div><div><span>Unrealised return</span><strong className={summary.gain<0?'pf-down':'pf-up'}>{summary.gain>=0?'+':''}{money(summary.gain)}</strong><small>{summary.cost?`${(summary.gain/summary.cost*100).toFixed(2)}%`:'—'}</small></div></section>
 <section className="pf-surface pf-growth">
   <div className="pf-section-heading">
     <h2>Growth over time</h2>
     <div className="pf-switch">{[['value','Value'],['gain','Gain / loss']].map(([v,label])=><button key={v} aria-pressed={metric===v} onClick={()=>setMetric(v)}>{label}</button>)}</div>
   </div>
   <Chart snapshots={state.snapshots} filter={filter} metric={metric}/>
 </section>
 <div className="pf-columns">
   <section className="pf-surface pf-holdings">
     <div className="pf-section-heading">
       <h2>Holdings <small>{rows.length}</small></h2>
       <button onClick={()=>{setDraft(fresh());openPanel('holding')}}>+ Add</button>
     </div>
     <label className="pf-search"><i className="fa-solid fa-magnifying-glass" aria-hidden="true"/><input aria-label="Search holdings" placeholder="Search holdings" value={search} onChange={e=>setSearch(e.target.value)}/></label>
     <div id="pf-holdings-list" className={`pf-table${showHoldings||search?' pf-expanded':''}`}>
       <div className="pf-table-head"><span>Asset / units</span><span>Invested</span><span>Value / return</span></div>
       {rows.map(h=>{
         const value=h.units*h.price;
         const gain=value-h.cost;
         return <button type="button" className="pf-row" key={h.id} aria-haspopup="dialog" onClick={()=>{setSelectedId(h.id);openPanel('details')}}>
           <span className="pf-asset"><span className={h.kind==='mf'?'pf-asset-icon pf-fund-icon':'pf-asset-icon'}><PageIcon page={h.kind==='mf'?'portfolio':'finance'}/></span><span><b>{h.name}</b><small>{h.units.toLocaleString('en-IN',{maximumFractionDigits:4})} units</small></span></span>
           <span className="pf-cost">{money(h.cost)}</span>
           <span className="pf-row-value"><b>{money(value)}</b><small className={gain<0?'pf-down':'pf-up'}>{gain>=0?'+':''}{money(gain)}</small></span>
         </button>;
       })}
       {!rows.length&&<p className="pf-empty">{search?'No matching holdings':'No holdings yet'}</p>}
     </div>
     {rows.length>4&&!search&&<button className="pf-mobile-more" aria-expanded={showHoldings} aria-controls="pf-holdings-list" onClick={()=>setShowHoldings(!showHoldings)}>{showHoldings?'Show fewer':`View all ${rows.length} holdings`} <span aria-hidden="true">{showHoldings?'↑':'→'}</span></button>}
   </section>
   <aside className="pf-surface pf-sips">
     <div className="pf-section-heading">
       <h2><span className="pf-section-icon"><PageIcon page="workday"/></span>Monthly SIPs</h2>
       <button onClick={()=>{setSip(freshSip());openPanel('sip')}}>+ Add</button>
     </div>
     <button className="pf-sip-toggle" aria-expanded={showSips} aria-controls="pf-sip-list" onClick={()=>setShowSips(!showSips)}><span>{money(sipTotal)} <small>/ month</small></span><span aria-hidden="true">{showSips?'−':'+'}</span></button>
     <div className="pf-sip-total">{money(sipTotal)} <small>/ month</small></div>
     <div id="pf-sip-list" className={showSips?'pf-sip-list pf-expanded':'pf-sip-list'}>
       {state.sips.map(s=><div className="pf-sip" key={s.id}>
         <div><b>{fundName(s.holdingId)}</b><small>{s.day} each month · {money(s.amount)}</small></div>
         <button aria-label={`Remove SIP schedule for ${fundName(s.holdingId)}, ${money(s.amount)} on day ${s.day}`} disabled={busy} onClick={()=>{setSelectedId(s.id);openPanel('removeSip')}}>Remove</button>
       </div>)}
       {pending.length>0&&<p>{pending.length} instalments need allotment details.</p>}
       {pending.map(s=><button className="pf-due" key={s.eventId} onClick={()=>{setTrade({id:s.holdingId,type:'buy',units:'',price:'',date:s.date,eventId:s.eventId,amount:s.amount,name:fundName(s.holdingId)});openPanel('trade')}}>{s.date} · {money(s.amount)} →</button>)}
     </div>
   </aside>
 </div>
 <details className="pf-surface pf-sales"><summary>Sales & “if I had held”</summary>{state.events.filter(e=>e.type==='sell').map(e=>{const h=state.holdings.find(h=>h.id===e.holdingId);return <div className="pf-sale" key={e.id}><b>{e.name} · {e.date}</b><span>Sold {e.units} for {money(e.units*e.price)}</span><span>Realised {money(e.realised)}</span><span>{h?`If held: ${money(e.units*h.price)} · difference ${money(e.units*(h.price-e.price))} as of ${h.priceDate}`:'Current quote unavailable'}</span></div>})}{!state.events.some(e=>e.type==='sell')&&<p>No recorded sales</p>}</details>
 {panel&&<dialog ref={dialogRef} className={`pf-dialog${panel==='import'?' pf-dialog-import':''}`} aria-labelledby="pf-dialog-title" onCancel={e=>{e.preventDefault();closePanel()}} onClick={e=>{if(e.target===e.currentTarget)closePanel()}}>
 <section className="pf-dialog-content">
   <header><h2 id="pf-dialog-title">{({details:selectedHolding?.name||'Holding',holding:'Holding details',trade:'Record transaction',sip:'SIP schedule',import:'Review Kite import',removeSip:'Remove SIP schedule?',undo:'Undo last change?'})[panel]}</h2><button type="button" aria-label="Close" onClick={closePanel}>×</button></header>
   <p role="alert">{error||message}</p>
   {panel==='details'&&selectedHolding&&<><dl className="pf-holding-details">
     <div><dt>Value</dt><dd>{money(selectedHolding.units*selectedHolding.price)}</dd></div>
     <div><dt>Invested</dt><dd>{money(selectedHolding.cost)}</dd></div>
     <div><dt>Units</dt><dd>{selectedHolding.units.toLocaleString('en-IN',{maximumFractionDigits:6})}</dd></div>
     <div><dt>{selectedHolding.kind==='mf'?'NAV':'Price'} · {selectedHolding.priceDate}</dt><dd>₹{selectedHolding.price.toLocaleString('en-IN',{maximumFractionDigits:6})}</dd></div>
     {selectedHolding.pledged>0&&<div><dt>Pledged units</dt><dd>{selectedHolding.pledged}</dd></div>}
   </dl><div className="pf-dialog-actions">
     <button aria-label={`Edit ${selectedHolding.name}`} onClick={()=>{setDraft(selectedHolding);openPanel('holding')}}>Edit</button>
     <button aria-label={`Trade ${selectedHolding.name}`} onClick={()=>openTrade(selectedHolding)}>Trade</button>
   </div></>}
   {panel==='removeSip'&&selectedSip&&<>
     <p>{fundName(selectedSip.holdingId)} · {money(selectedSip.amount)} on day {selectedSip.day} each month</p>
     <div className="pf-dialog-actions"><button onClick={closePanel} autoFocus>Cancel</button><button className="pf-danger" disabled={busy} onClick={()=>commit({...state,sips:state.sips.filter(s=>s.id!==selectedSip.id)},'Remove SIP schedule')}>Remove schedule</button></div>
   </>}
   {panel==='undo'&&<div className="pf-dialog-actions"><button onClick={closePanel} autoFocus>Cancel</button><button className="pf-danger" disabled={busy} onClick={async()=>{try{await undo();dismissPanel();setMessage('Change undone')}catch(e){setMessage(e.message)}}}>Undo change</button></div>}
 {panel==='holding'&&<form onSubmit={updateHolding}><label>Asset type<select value={draft.kind} onChange={e=>setDraft({...draft,kind:e.target.value})}><option value="mf">Mutual fund</option><option value="equity">Equity / ETF</option></select></label>{[['name','Name','text'],['id','ISIN / unique identifier','text'],['units','Units','number'],['cost','Total invested ₹','number'],['price','Price / NAV ₹','number'],['pledged','Pledged units','number'],['priceDate','Valuation date','date']].map(([k,label,type])=><label key={k}>{label}<input required disabled={k==='id'&&state.holdings.some(h=>h.id===draft.id)} type={type} min={type==='number'?0:undefined} step="any" value={draft[k]} onChange={e=>setDraft({...draft,[k]:e.target.value})}/></label>)}<button disabled={busy} className="pf-primary">Save holding</button></form>}
 {panel==='trade'&&<form onSubmit={e=>{e.preventDefault();try{commit(trade(state,tradeDraft),'Record transaction')}catch(e){setMessage(e.message)}}}>{tradeDraft.amount&&<p>Scheduled {money(tradeDraft.amount)}. Enter actual allotted units and NAV.</p>}<label>Type<select value={tradeDraft.type} onChange={e=>setTrade({...tradeDraft,type:e.target.value})}><option value="buy">Buy</option><option value="sell">Sell</option></select></label>{[['units','Units','number'],['price','Execution price / NAV','number'],['date','Transaction date','date']].map(([k,label,type])=><label key={k}>{label}<input required min="0" step="any" type={type} value={tradeDraft[k]} onChange={e=>setTrade({...tradeDraft,[k]:e.target.value})}/></label>)}<button disabled={busy} className="pf-primary">Save transaction</button></form>}
 {panel==='sip'&&<form onSubmit={e=>{e.preventDefault();if(!sip.holdingId||!Number(sip.amount))return;commit({...state,sips:[...state.sips,{...sip,id:crypto.randomUUID(),amount:Number(sip.amount),day:Number(sip.day)}]},'Add SIP schedule')}}><label>Fund<select required value={sip.holdingId} onChange={e=>setSip({...sip,holdingId:e.target.value})}><option value="">Choose fund</option>{state.holdings.filter(h=>h.kind==='mf').map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></label><label>Monthly amount<input required type="number" min="1" value={sip.amount} onChange={e=>setSip({...sip,amount:e.target.value})}/></label><label>Day of month<input required type="number" min="1" max="31" value={sip.day} onChange={e=>setSip({...sip,day:e.target.value})}/></label><label>Track from<input required type="date" value={sip.start} onChange={e=>setSip({...sip,start:e.target.value})}/></label><small>Days beyond month end fall on its last day. Actual allotment may differ.</small><button disabled={busy} className="pf-primary">Save schedule</button></form>}
 {panel==='import'&&preview&&<><p>{preview.holdings.length} holdings · {preview.asOf}</p><p>{money(totals(preview.holdings).value)} value · {money(totals(preview.holdings).cost)} invested</p><p>Replaces the equity snapshot. Mutual funds and transaction history are retained. Missing stocks are removed from current holdings; no sale is inferred.</p><div className="pf-import-rows">{preview.holdings.map(h=><p key={h.id}>{h.name} · {h.units} units · {money(h.units*h.price)}</p>)}</div><button disabled={busy} className="pf-primary" onClick={()=>commit(replaceEquity(state,preview.holdings,preview.asOf),'Kite snapshot import')}>Confirm import</button></>}
 </section></dialog>}
 </main>
}
