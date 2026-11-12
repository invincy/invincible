import {useState} from 'react';

function Section({title,meta,action,children,className=''}) {
  return <section className={`finance-flat-section ${className}`.trim()}>
    <header className="finance-flat-heading"><div><h3>{title}</h3>{meta&&<span>{meta}</span>}</div>{action}</header>
    {children}
  </section>;
}
function Empty({children}) { return <p className="finance-compact-empty">{children}</p>; }

export default function FinanceDesktop({totals,accounts,bills,transactions,checklist,money,categoryOf,categories,onAccount,onBill,onTransaction,onRemove,onToggleBill,onToggleCheck,onAddCheck,onImport,onReconcile,canResetCarriedBills,onResetCarriedBills,wealthTrend}) {
  const [checkTitle,setCheckTitle]=useState('');
  const cashAccounts=accounts.filter(account=>categoryOf(account)==='cash');
  const wealthAccounts=accounts.filter(account=>categoryOf(account)!=='cash');
  const sortedTransactions=[...transactions].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const paid=bills.filter(bill=>bill.paid).length,checked=checklist.filter(item=>item.done).length;
  const accountRow=account=>{const category=categoryOf(account);return <article className="finance-compact-row" key={account.id}><div className="finance-row-copy"><strong title={account.name}>{account.name}</strong><small>{categories[category]?.label||'Asset'}</small></div><b title={money(account.balance)}>{money(account.balance)}</b>{account.linked?<a className="finance-row-icon" href="/invincible/portfolio.html" title="Open Portfolio" aria-label={'Open '+account.name+' in Portfolio'}>↗</a>:<button type="button" className="finance-row-icon" aria-label={'Update '+account.name} title="Update balance" onClick={()=>onAccount(account)}>✎</button>}</article>};
  return <main className="finance-desktop-panels" aria-label="Finance workspace">
    <section className="finance-desktop-card finance-cockpit" aria-label="This month">
      <header><h2>This month</h2></header>
      <Section title="Position" meta="Where you stand now">
        <div className="finance-compact-totals">
          {[['Current cash',totals.cash,'cash'],['Net worth',totals.netWorth,'wealth'],['Still due',totals.cardBills-totals.paidBills,'bills'],['Investments',totals.assets-totals.cash,'investments']].map(([label,value,kind])=><article key={kind} data-kind={kind}><span>{label}</span><strong title={money(value)}>{money(value)}</strong></article>)}
        </div>
      </Section>
      <Section title="Cash flow" meta="This month">
        <div className="finance-cash-summary"><div><span>Income</span><b className="income">+{money(totals.income)}</b></div><div><span>Money out</span><b>−{money(totals.paidBills+totals.cashOutflow)}</b></div><div><span>Investment transfers</span><b>{money(totals.investmentTransfers)}</b></div>{totals.hasOpening&&<div><span>Opening cash</span><b>{money(totals.openingCash)}</b></div>}</div>
        {totals.hasOpening&&Math.abs(totals.untracked)>.009&&<button className="finance-compact-reconcile" type="button" onClick={onReconcile}>Explain {money(Math.abs(totals.untracked))} bank movement ↗</button>}
      </Section>
      <Section title="Activity" meta={`${transactions.length} entries`} action={<button type="button" title="Add entry" aria-label="Add entry" onClick={()=>onTransaction()}>+</button>}>
        <div className="finance-compact-list">{sortedTransactions.map(item=><article key={item.id} className="finance-compact-row"><div className="finance-row-copy"><strong title={item.description}>{item.description}</strong><small>{item.date} · {item.type}</small></div><b className={item.type}>{item.type==='income'?'+':'−'}{money(item.amount)}</b><button className="finance-row-icon" type="button" title="Update entry" aria-label={'Update '+item.description} onClick={()=>onTransaction(item.type,item.description,item)}>✎</button></article>)}{!transactions.length&&<Empty>No cash-flow activity this month.</Empty>}</div>
      </Section>
      <Section title="Wealth trend" meta="12-month view" className="finance-inline-trend">{wealthTrend}</Section>
    </section>

    <section className="finance-desktop-card" aria-label="Accounts and wealth">
      <header><h2>Accounts & wealth</h2><div><button type="button" className="finance-import-button" onClick={onImport} title="Import month" aria-label="Import month">Import</button><button type="button" onClick={()=>onAccount()} title="Add account" aria-label="Add account">+</button></div></header>
      <Section title="Bank accounts" meta={`${cashAccounts.length} accounts`}>
        <div className="finance-compact-list">{cashAccounts.map(accountRow)}{!cashAccounts.length&&<Empty>Add your first bank account.</Empty>}</div>
      </Section>
      <Section title="Investments & debt" meta={`${wealthAccounts.length} accounts`}>
        <div className="finance-compact-list">{wealthAccounts.map(accountRow)}{!wealthAccounts.length&&<Empty>No investments or debt added yet.</Empty>}</div>
      </Section>
      <footer><span>Total assets <b>{money(totals.assets)}</b></span><a href="/invincible/portfolio.html">Portfolio ↗</a></footer>
    </section>

    <section className="finance-desktop-card" aria-label="Bills and checklist">
      <header><h2>Bills & checklist</h2></header>
      <Section title="Credit cards" meta={`${paid}/${bills.length} paid`} action={<button type="button" title="Add card" aria-label="Add card" onClick={()=>onBill()}>+</button>}>
        <div className="finance-compact-list">{bills.map(bill=><article className={'finance-compact-row'+(bill.paid?' is-paid':'')} key={bill.id}><button type="button" className="finance-compact-check" aria-label={(bill.paid?'Mark unpaid ':'Mark paid ')+bill.name} aria-pressed={bill.paid} onClick={()=>onToggleBill(bill.id)}>{bill.paid?'✓':'○'}</button><div className="finance-row-copy"><strong title={bill.name}>{bill.name}</strong><small>{bill.last4?'•••• '+bill.last4+' · ':''}{bill.paid?'Paid':'Due'}</small></div><b title={money(bill.amount,2)}>{money(bill.amount,2)}</b><button type="button" className="finance-row-icon" title="Update card" aria-label={'Update '+bill.name} onClick={()=>onBill(bill)}>✎</button></article>)}{!bills.length&&<Empty>Add your first credit card.</Empty>}</div>
        {canResetCarriedBills&&<button type="button" className="finance-reset-carried" onClick={onResetCarriedBills}>Clear carried amounts</button>}
      </Section>
      <Section title="Checklist" meta={`${checked}/${checklist.length} complete`}>
        <div className="finance-compact-list">{checklist.map(item=><article key={item.id} className={'finance-compact-row'+(item.done?' is-paid':'')}><label><input type="checkbox" checked={item.done} onChange={()=>onToggleCheck(item.id)}/><span>{item.label}</span></label><button className="finance-row-icon" type="button" title="Remove" aria-label={'Remove '+item.label} onClick={()=>onRemove('checklist',item.id)}>×</button></article>)}{!checklist.length&&<Empty>Your checklist is clear.</Empty>}</div>
        <form className="finance-compact-add" onSubmit={async event=>{event.preventDefault();if(checkTitle.trim()&&await onAddCheck(checkTitle.trim()))setCheckTitle('');}}><input aria-label="New checklist item" placeholder="Add a bill or reminder" value={checkTitle} maxLength={80} onChange={event=>setCheckTitle(event.target.value)}/><button type="submit" disabled={!checkTitle.trim()} aria-label="Add checklist item">+</button></form>
      </Section>
      <footer><span>{money(totals.cardBills-totals.paidBills)} still due</span><b>{bills.length} cards · {checklist.length} tasks</b></footer>
    </section>
  </main>;
}
