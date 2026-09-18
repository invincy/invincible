import{useCallback,useEffect,useState}from'react';
import{collection,deleteDoc,doc,getDocs,onSnapshot,serverTimestamp,setDoc,writeBatch}from'firebase/firestore';
import{db}from'./firebase';
import{useAuth}from'./AuthContext';
export function useTasks(){
 const{user}=useAuth();const[tasks,setTasks]=useState([]),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setTasks([]);setReady(false);setError('');if(!user)return;return onSnapshot(collection(db,'users',user.uid,'tasks'),snapshot=>{setTasks(snapshot.docs.map(item=>({...item.data(),id:item.id})));setReady(true);setError('')},err=>{console.error(err);setError('Task sync failed.');setReady(true)})},[user?.uid]);
 const saveTask=useCallback(async(id,patch)=>{if(!user)throw Error('Sign in required');await setDoc(doc(db,'users',user.uid,'tasks',id),{...patch,updatedAt:serverTimestamp()},{merge:true})},[user?.uid]);
 const deleteTask=useCallback(async id=>{if(!user)throw Error('Sign in required');const ref=doc(db,'users',user.uid,'tasks',id),assets=await getDocs(collection(ref,'assets'));for(let start=0;start<assets.docs.length;start+=450){const batch=writeBatch(db);assets.docs.slice(start,start+450).forEach(item=>batch.delete(item.ref));await batch.commit()}await deleteDoc(ref)},[user?.uid]);
 return{tasks,ready,error,saveTask,deleteTask};
}
