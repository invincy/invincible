import{AuthProvider}from'./AuthContext';
import{AppShell}from'./AppShell';
import{RemindersPage}from'./RemindersPage';
import{WorkdayPage}from'./WorkdayPage';
import{DashboardPage}from'./DashboardPage';
import{TaskPage}from'./TaskPage';
import'./app-shell.css';
export default function App(){
 const path=location.pathname;
 const title=path.startsWith('/invincible/workday')?'Workday':path.startsWith('/invincible/reminders')?'Reminders':path.startsWith('/invincible/task')?'Task Workspace':'Dashboard';
 const Page=title==='Workday'?WorkdayPage:title==='Reminders'?RemindersPage:title==='Task Workspace'?TaskPage:DashboardPage;
 return <AuthProvider><AppShell pageTitle={title}><Page/></AppShell></AuthProvider>
}
