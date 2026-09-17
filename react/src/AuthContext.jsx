import{createContext,useContext,useEffect,useMemo,useState}from'react';
import{loginWithGoogle,logout,observeAuth}from'./firebase';
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const[user,setUser]=useState(null),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let stop=()=>{};observeAuth(current=>{setUser(current);setReady(true)}).then(fn=>{stop=fn}).catch(err=>{console.error(err);setError('Could not restore your Invincible login.');setReady(true)});return()=>stop()},[]);
 const value=useMemo(()=>({user,ready,error,login:async()=>{setError('');try{await loginWithGoogle()}catch(err){console.error(err);setError('Google sign-in did not complete.')}},logout}),[user,ready,error]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
