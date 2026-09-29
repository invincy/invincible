import{AuthProvider}from'./AuthContext';
import{AppShell}from'./AppShell';
import{RemindersPage}from'./RemindersPage';
import{WorkdayPage}from'./WorkdayPage';
import{DashboardPage}from'./DashboardPage';
import{FinancePage}from'./FinancePage';
import{TaskPage}from'./TaskPage';
import{InvincibleAiPage}from'./features/invincible-ai/InvincibleAiPage';
import'./app-shell.css';
export default function App(){
 const path=location.pathname;
 const title=path.startsWith('/invincible/ai')?'Invincible AI':path.startsWith('/invincible/workday')?'Workday':path.startsWith('/invincible/reminders')?'Reminders':path.startsWith('/invincible/journal/finance')?'Finance':path.startsWith('/invincible/task')?'Task Workspace':'Dashboard';
 const Page=title==='Invincible AI'?InvincibleAiPage:title==='Workday'?WorkdayPage:title==='Reminders'?RemindersPage:title==='Finance'?FinancePage:title==='Task Workspace'?TaskPage:DashboardPage;
 return <AuthProvider><AppShell pageTitle={title}><Page/></AppShell></AuthProvider>
}
