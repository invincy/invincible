import{useEffect,useMemo,useState}from'react';
import{useAuth}from'./AuthContext';
const base='/invincible/';
const pages=[
 {id:'dashboard',label:'Dashboard',short:'Home',href:base,icon:'⌂'},
 {id:'journal',label:'Journal',href:base+'journal/',icon:'▤'},
 {id:'finance',label:'Finance',href:base+'journal/finance.html',icon:'⌁'},
 {id:'garage',label:'Garage',href:base+'garage/',icon:'◇'},
 {id:'creator',label:'Creator Studio',href:base+'creator/',icon:'▷'},
 {id:'workday',label:'Workday',href:base+'workday/',icon:'▣'},
 {id:'lic',label:'LIC',href:base+'lic/',icon:'♢'},
 {id:'reminders',label:'Reminders',href:base+'reminders/',icon:'♧'},
 {id:'portfolio',label:'Portfolio',href:'https://script.google.com/macros/s/AKfycbxbdgQqTwHIYw_dS9ko_tTieVM1PAQKNAHsTqy7bFPlVNg2P-9FNoccrZwHgbeXALoY/exec',icon:'▣',external:true}
];
const mobilePages=pages.filter(page=>!page.external&&page.id!=='dashboard');
const storageKey='invincible.mobileTabs.v1',defaults=['workday','reminders','journal'];
function readTabs(){try{const value=JSON.parse(localStorage.getItem(storageKey)),valid=new Set(mobilePages.map(page=>page.id));if(Array.isArray(value)&&value.length===3&&new Set(value).size===3&&value.every(id=>valid.has(id)))return value}catch{}return defaults}
function active(page){return !page.external&&(page.id==='dashboard'?location.pathname===base:page.id==='journal'?location.pathname===page.href:location.pathname.startsWith(page.href))}
function NavLink({page,mobile=false}){return <a className={'react-nav-link'+(active(page)?' active':'')} href={page.href} target={page.external?'_blank':undefined} rel={page.external?'noopener':undefined} aria-current={active(page)?'page':undefined}><span className="react-nav-icon">{page.icon}</span><span>{mobile?page.short||page.label:page.label}</span>{page.external&&<span aria-hidden="true">↗</span>}</a>}
export function AppShell({children,pageTitle}){
 const{user,ready,error,login}=useAuth();
 const[moreOpen,setMoreOpen]=useState(false),[editing,setEditing]=useState(false),[tabs,setTabs]=useState(readTabs),[draft,setDraft]=useState(tabs);
 useEffect(()=>{
  const viewport=window.matchMedia('(max-width: 1024px)');
  const close=()=>{setMoreOpen(false);setEditing(false)};
  const resize=event=>{if(!event.matches)close()};
  const escape=event=>{if(event.key==='Escape')close()};
  viewport.addEventListener('change',resize);
  window.addEventListener('keydown',escape);
  return()=>{viewport.removeEventListener('change',resize);window.removeEventListener('keydown',escape)};
 },[]);
 const selected=useMemo(()=>tabs.map(id=>pages.find(page=>page.id===id)).filter(Boolean),[tabs]);
 const toggle=id=>setDraft(current=>current.includes(id)?current.filter(value=>value!==id):current.length<3?[...current,id]:current);
 const save=()=>{if(draft.length!==3)return;localStorage.setItem(storageKey,JSON.stringify(draft));setTabs(draft);setEditing(false);setMoreOpen(false)};
 if(!ready)return <div className="app-loading"><span>I</span><p>Opening Invincible…</p></div>;
 if(!user)return <div className="app-login"><div className="login-card"><span className="login-mark">I</span><h1>Invincible</h1><p>One account for your complete personal operating system.</p><button onClick={login}>Continue with Google</button>{error&&<small>{error}</small>}</div></div>;
 return <div className="react-app-shell">
  <header className="react-topbar"><a className="react-brand" href={base}><span>I</span><strong>INVINCIBLE</strong></a><nav className="react-desktop-nav" aria-label="Primary navigation">{pages.map(page=><NavLink key={page.id} page={page}/>)}</nav><span className="react-mobile-title">{pageTitle}</span></header>
  <main>{children}</main>
  <nav className="react-mobile-tabs" aria-label="Primary navigation"><NavLink page={pages[0]} mobile/>{selected.map(page=><NavLink key={page.id} page={page} mobile/>)}<button className={!['dashboard',...tabs].some(id=>active(pages.find(page=>page.id===id)))?'active':''} onClick={()=>setMoreOpen(true)}><span className="react-nav-icon">•••</span><span>More</span></button></nav>
  {moreOpen&&<div className="react-more-backdrop" onMouseDown={event=>event.target===event.currentTarget&&setMoreOpen(false)}><section className="react-more-sheet" role="dialog" aria-modal="true" aria-label="More pages"><div className="sheet-grip"/><header><div><small>INVINCIBLE</small><h2>{editing?'Bottom tabs':'More'}</h2></div><button onClick={()=>{setMoreOpen(false);setEditing(false)}}>×</button></header>
   {!editing?<><div className="react-more-grid">{pages.slice(1).map(page=><NavLink key={page.id} page={page}/>)}</div><button className="edit-tabs" onClick={()=>{setDraft(tabs);setEditing(true)}}><strong>Edit bottom tabs</strong><span>Choose the three pages kept one tap away</span></button></>:<><p className="tab-help">Choose exactly three. Home and More stay fixed.</p><div className="tab-picker">{mobilePages.map(page=><button key={page.id} className={draft.includes(page.id)?'selected':''} onClick={()=>toggle(page.id)}><span>{page.icon}</span><strong>{page.label}</strong><b>{draft.includes(page.id)?'✓':'+'}</b></button>)}</div><div className="tab-picker-actions"><span>{draft.length} of 3 selected</span><button onClick={()=>setEditing(false)}>Cancel</button><button disabled={draft.length!==3} onClick={save}>Save</button></div></>}
  </section></div>}
 </div>
}
