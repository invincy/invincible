import{AuthProvider}from'./AuthContext';
import{AppShell}from'./AppShell';
import{RemindersPage}from'./RemindersPage';
import{WorkdayPage}from'./WorkdayPage';
import{DashboardPage}from'./DashboardPage';
import{FinancePage}from'./FinancePage';
import{TaskPage}from'./TaskPage';
import{InvincibleAiPage}from'./features/invincible-ai/InvincibleAiPage';
import{AppErrorBoundary}from'./AppErrorBoundary';
import{InvincibleAiDock}from'./features/invincible-ai/InvincibleAiDock';
import'./app-shell.css';
import{navigationPages,pageForPath}from'../../shared/navigation';
const reactPages={dashboard:DashboardPage,ai:InvincibleAiPage,workday:WorkdayPage,reminders:RemindersPage,finance:FinancePage,task:TaskPage};
export default function App(){
 const search=new URLSearchParams(location.search),widget=search.get('widget')==='1';
 if(widget){document.body.classList.add('ai-widget-body');return <AuthProvider><InvincibleAiDock pageTitle={search.get('page')||'Invincible'} embedded/></AuthProvider>}
 const requested=pageForPath(location.pathname),page=reactPages[requested.id]?requested:navigationPages[0],title=page.label,Page=reactPages[page.id];
 return <AppErrorBoundary><AuthProvider><AppShell pageTitle={title}><Page/></AppShell></AuthProvider></AppErrorBoundary>
}
