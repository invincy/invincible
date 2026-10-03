import {lazy,Suspense} from 'react';
import{AuthProvider}from'./AuthContext';
import{AppShell}from'./AppShell';
const RemindersPage=lazy(()=>import('./RemindersPage').then(module=>({default:module.RemindersPage})));
const WorkdayPage=lazy(()=>import('./WorkdayPage').then(module=>({default:module.WorkdayPage})));
const DashboardPage=lazy(()=>import('./DashboardPage').then(module=>({default:module.DashboardPage})));
const FinancePage=lazy(()=>import('./FinancePage').then(module=>({default:module.FinancePage})));
const TaskPage=lazy(()=>import('./TaskPage').then(module=>({default:module.TaskPage})));
const InvincibleAiPage=lazy(()=>import('./features/invincible-ai/InvincibleAiPage').then(module=>({default:module.InvincibleAiPage})));
import{AppErrorBoundary}from'./AppErrorBoundary';
import{InvincibleAiDock}from'./features/invincible-ai/InvincibleAiDock';
import'./app-shell.css';
import{navigationPages,pageForPath}from'../../shared/navigation';
const reactPages={dashboard:DashboardPage,ai:InvincibleAiPage,workday:WorkdayPage,reminders:RemindersPage,finance:FinancePage,task:TaskPage};
export default function App(){
 const search=new URLSearchParams(location.search),widget=search.get('widget')==='1';
 if(widget){document.body.classList.add('ai-widget-body');return <AuthProvider><InvincibleAiDock pageTitle={search.get('page')||'Invincible'} embedded/></AuthProvider>}
 const requested=pageForPath(location.pathname),page=reactPages[requested.id]?requested:navigationPages[0],title=page.label,Page=reactPages[page.id];
 return <AppErrorBoundary><AuthProvider><AppShell pageTitle={title}><Suspense fallback={<div className="route-loading" role="status" aria-label="Loading page"><span/><span/><span/></div>}><Page/></Suspense></AppShell></AuthProvider></AppErrorBoundary>
}
