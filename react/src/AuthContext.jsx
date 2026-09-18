import{createContext,useContext,useEffect,useMemo,useState}from'react';
import{loginWithGoogle,logout,observeAuth}from'./firebase';
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const[user,setUser]=useState(null),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let cancelled=false,stop=()=>{};observeAuth(current=>{if(!cancelled){setUser(current);setReady(true)}}).then(fn=>{if(cancelled)fn();else stop=fn}).catch(err=>{if(cancelled)return;console.error(err);setError('Could not restore your Invincible login.');setReady(true)});return()=>{cancelled=true;stop()}},[]);
 const value=useMemo(()=>({user,ready,error,login:async()=>{setError('');try{await loginWithGoogle()}catch(err){console.error(err);setError('Google sign-in did not complete.')}},logout}),[user,ready,error]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
