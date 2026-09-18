import{AuthProvider}from'./AuthContext';
import{AppShell}from'./AppShell';
import{RemindersPage}from'./RemindersPage';
import{WorkdayPage}from'./WorkdayPage';
import'./app-shell.css';
export default function App(){
 const workday=location.pathname.startsWith('/invincible/workday');
 return <AuthProvider><AppShell pageTitle={workday?'Workday':'Reminders'}>{workday?<WorkdayPage/>:<RemindersPage/>}</AppShell></AuthProvider>
}
