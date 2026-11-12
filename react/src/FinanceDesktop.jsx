import {useEffect,useLayoutEffect,useRef,useState} from 'react';

function Pages({items,label,children,empty}) {
  const host=useRef(null),[capacity,setCapacity]=useState(4),[page,setPage]=useState(0);
  useLayoutEffect(()=>{
    const measure=()=>setCapacity(Math.max(1,Math.floor((host.current.clientHeight-48)/84)));
    const observer=new ResizeObserver(measure);observer.observe(host.current);measure();return()=>observer.disconnect();
  },[]);
  const count=Math.max(1,Math.ceil(items.length/capacity)),current=Math.min(page,count-1);
  useEffect(()=>setPage(0),[label]);
  return <div className="finance-paged" ref={host}>
    <div className="finance-compact-list" aria-label={label}>{items.length?items.slice(current*capacity,(current+1)*capacity).map(children):<p className="finance-compact-empty">{empty}</p>}</div>
    <nav className="finance-pagination" aria-label={label+' pages'}><span>{items.length?`${current*capacity+1}–${Math.min((current+1)*capacity,items.length)} of ${items.length}`:'0 items'}</span><button type="button" disabled={!current} aria-label={'Previous '+label} onClick={()=>setPage(current-1)}>←</button><button type="button" disabled={current>=count-1} aria-label={'Next '+label} onClick={()=>setPage(current+1)}>→</button></nav>
  </div>;
}
function Tabs({value,onChange,items,label}) {
  return <div className="finance-compact-tabs" role="group" aria-label={label}>{items.map(([key,title])=><button type="button" key={key} aria-pressed={value===key} onClick={()=>onChange(key)}>{title}</button>)}</div>;
}
export default function FinanceDesktop({totals,accounts,bills,transactions,checklist,money,categoryOf,categories,onAccount,onBill,onTransaction,onRemove,onToggleBill,onToggleCheck,onAddCheck,onImport,onTrend,onReconcile}) {
  const [overviewTab,setOverviewTab]=useState('summary'),[accountTab,setAccountTab]=useState('cash'),[paymentTab,setPaymentTab]=useState('cards'),[checkTitle,setCheckTitle]=useState('');
  const selectedAccounts=accounts.filter(account=>accountTab==='all'||(accountTab==='cash'?categoryOf(account)==='cash':categoryOf(account)!=='cash'));
  const paid=bills.filter(bill=>bill.paid).length,checked=checklist.filter(item=>item.done).length;
  return <main className="finance-desktop-panels" aria-label="Finance workspace">
    <section className="finance-desktop-card finance-cockpit" aria-label="This month">
      <header><h2>This month</h2><div><button type="button" onClick={onTrend} title="Wealth trend" aria-label="Open wealth trend">↗</button>{overviewTab==='activity'&&<button type="button" title="Add entry" aria-label="Add entry" onClick={()=>onTransaction()}>+</button>}</div></header>
      <Tabs label="This month sections" value={overviewTab} onChange={setOverviewTab} items={[["summary","Position"],["flow","Cash flow"],["activity","Activity"]]}/>
      {overviewTab==='summary'&&<div className="finance-compact-totals">
        {[['Current cash',totals.cash,'cash'],['Net worth',totals.netWorth,'wealth'],['Still due',totals.cardBills-totals.paidBills,'bills'],['Investments',totals.assets-totals.cash,'investments']].map(([label,value,kind])=><article key={kind} data-kind={kind}><span>{label}</span><strong title={money(value)}>{money(value)}</strong></article>)}
      </div>}
      {overviewTab==='flow'&&<><div className="finance-cash-summary"><h3>Cash flow</h3><div><span>Income</span><b className="income">+{money(totals.income)}</b></div><div><span>Money out</span><b>−{money(totals.paidBills+totals.cashOutflow)}</b></div><div><span>Investment transfers</span><b>{money(totals.investmentTransfers)}</b></div>{totals.hasOpening&&<div><span>Opening cash</span><b>{money(totals.openingCash)}</b></div>}</div>
      {totals.hasOpening&&Math.abs(totals.untracked)>.009&&<button className="finance-compact-reconcile" type="button" onClick={onReconcile}>Explain {money(Math.abs(totals.untracked))} bank movement ↗</button>}</>}
      {overviewTab==='activity'&&<Pages items={[...transactions].sort((a,b)=>String(b.date).localeCompare(String(a.date)))} label="transactions" empty="No cash-flow activity this month.">{item=><article key={item.id} className="finance-compact-row"><div className="finance-row-copy"><strong title={item.description}>{item.description}</strong><small>{item.date} · {item.type}</small></div><b className={item.type}>{item.type==='income'?'+':'−'}{money(item.amount)}</b><button className="finance-row-icon" type="button" title="Update entry" aria-label={'Update '+item.description} onClick={()=>onTransaction(item.type,item.description,item)}>✎</button></article>}</Pages>}
      <div className="finance-overview-bottom"><span>{paid}/{bills.length} cards paid · {checked}/{checklist.length} checklist</span><button type="button" onClick={onTrend}>Wealth trend →</button></div>
    </section>
    <section className="finance-desktop-card" aria-label="Accounts">
      <header><h2>Accounts & wealth</h2><div><button type="button" className="finance-import-button" onClick={onImport} title="Import month" aria-label="Import month">Import</button><button type="button" onClick={()=>onAccount()} title="Add account" aria-label="Add account">+</button></div></header>
      <Tabs label="Account categories" value={accountTab} onChange={setAccountTab} items={[["cash","Banks"],["wealth","Investments & debt"],["all","All"]]}/>
      <Pages items={selectedAccounts} label={accountTab+' accounts'} empty="Add your first account.">{account=>{
        const category=categoryOf(account);
        return <article className="finance-compact-row" key={account.id}><div className="finance-row-copy"><strong title={account.name}>{account.name}</strong><small>{categories[category]?.label||'Asset'}</small></div><b title={money(account.balance)}>{money(account.balance)}</b>{account.linked?<a className="finance-row-icon" href="/invincible/portfolio.html" title="Open Portfolio" aria-label={'Open '+account.name+' in Portfolio'}>↗</a>:<button type="button" className="finance-row-icon" aria-label={'Update '+account.name} title="Update balance" onClick={()=>onAccount(account)}>✎</button>}</article>;
      }}</Pages>
      <footer><span>Total assets <b>{money(totals.assets)}</b></span><a href="/invincible/portfolio.html">Portfolio ↗</a></footer>
    </section>
    <section className="finance-desktop-card" aria-label="Bills and checklist">
      <header><h2>Bills & checklist</h2>{paymentTab==='cards'&&<button type="button" title="Add card" aria-label="Add card" onClick={()=>onBill()}>+</button>}</header>
      <Tabs label="Bills sections" value={paymentTab} onChange={setPaymentTab} items={[["cards",`Cards · ${bills.length}`],["checklist",`Checklist · ${checklist.length-checked}`]]}/>
      {paymentTab==='cards'&&<Pages items={bills} label="credit cards" empty="Add your first credit card.">{bill=><article className={'finance-compact-row'+(bill.paid?' is-paid':'')} key={bill.id}><button type="button" className="finance-compact-check" aria-label={(bill.paid?'Mark unpaid ':'Mark paid ')+bill.name} aria-pressed={bill.paid} onClick={()=>onToggleBill(bill.id)}>{bill.paid?'✓':'○'}</button><div className="finance-row-copy"><strong title={bill.name}>{bill.name}</strong><small>{bill.last4?'•••• '+bill.last4+' · ':''}{bill.paid?'Paid':'Due'}</small></div><b title={money(bill.amount,2)}>{money(bill.amount,2)}</b><button type="button" className="finance-row-icon" title="Update card" aria-label={'Update '+bill.name} onClick={()=>onBill(bill)}>✎</button></article>}</Pages>}
      {paymentTab==='checklist'&&<><Pages items={checklist} label="checklist" empty="Your checklist is clear.">{item=><article key={item.id} className={'finance-compact-row'+(item.done?' is-paid':'')}><label><input type="checkbox" checked={item.done} onChange={()=>onToggleCheck(item.id)}/><span>{item.label}</span></label><button className="finance-row-icon" type="button" title="Remove" aria-label={'Remove '+item.label} onClick={()=>onRemove('checklist',item.id)}>×</button></article>}</Pages><form className="finance-compact-add" onSubmit={async event=>{event.preventDefault();if(checkTitle.trim()&&await onAddCheck(checkTitle.trim()))setCheckTitle('');}}><input aria-label="New checklist item" placeholder="Add a bill or reminder" value={checkTitle} maxLength={80} onChange={event=>setCheckTitle(event.target.value)}/><button type="submit" disabled={!checkTitle.trim()} aria-label="Add checklist item">+</button></form></>}
      <footer><span>{paymentTab==='cards'?`${paid}/${bills.length} paid`:`${checked}/${checklist.length} complete`}</span><b>{paymentTab==='cards'?money(totals.cardBills-totals.paidBills)+' due':''}</b></footer>
    </section>
  </main>;
}
