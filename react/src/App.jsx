import{AuthProvider}from'./AuthContext';
import{AppShell}from'./AppShell';
import{RemindersPage}from'./RemindersPage';
import'./app-shell.css';
export default function App(){return <AuthProvider><AppShell><RemindersPage/></AppShell></AuthProvider>}
