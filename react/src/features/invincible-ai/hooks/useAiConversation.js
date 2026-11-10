import{useEffect,useMemo,useState}from'react';
import{collection,limitToLast,onSnapshot,orderBy,query}from'firebase/firestore';
import{db}from'../../../firebase';
import{useAuth}from'../../../AuthContext';
import{getAiProvider,sendInvincibleAiMessage,setAiProvider}from'../services/aiService';

const makeId=()=>{
 const randomUuid=globalThis.crypto?.randomUUID;
 const value=typeof randomUuid==='function'?randomUuid.call(globalThis.crypto):`${Date.now()}_${Math.random().toString(36).slice(2)}`;
 return`chat_${value}`;
};
const messageText=value=>typeof value==='string'?value:value==null?'':JSON.stringify(value);
const normalizeMessage=item=>{const data=item.data();return{id:item.id,...data,role:data.role==='assistant'?'assistant':'user',content:messageText(data.content),actions:Array.isArray(data.actions)?data.actions.filter(action=>action&&typeof action==='object'):[]}};

export function useAiConversation(){
 const{user}=useAuth(),storageKey=useMemo(()=>user?`invincible.ai.conversation.v1.${user.uid}`:'',[user?.uid]);
 const[conversationId,setConversationId]=useState(''),[messages,setMessages]=useState([]),[pending,setPending]=useState(''),[actions,setActions]=useState([]),[sending,setSending]=useState(false),[error,setError]=useState('');
 const[provider,setProviderState]=useState(()=>getAiProvider());
 useEffect(()=>{if(!storageKey)return;let id=localStorage.getItem(storageKey);if(!id){id=makeId();localStorage.setItem(storageKey,id)}setConversationId(id)},[storageKey]);
 useEffect(()=>{if(!user||!conversationId)return;const messagesRef=collection(db,'users',user.uid,'aiConversations',conversationId,'messages'),messagesQuery=query(messagesRef,orderBy('createdAt','asc'),limitToLast(100));return onSnapshot(messagesQuery,snapshot=>setMessages(snapshot.docs.map(normalizeMessage)),syncError=>{console.error(syncError);setError('Chat history could not sync.')})},[user?.uid,conversationId]);
 const chooseProvider=next=>{const selected=setAiProvider(next);setProviderState(selected);setError('');setActions([])};
 const send=async message=>{const text=message.trim();if(!text||sending)return;setSending(true);setPending(text);setActions([]);setError('');try{const result=await sendInvincibleAiMessage({conversationId,message:text,provider});setActions(result.actions||[]);if(result.local)setMessages(previous=>[...previous,{id:`local-${Date.now()}`,role:'assistant',content:result.text||'Local action completed.',actions:result.actions||[],local:true}])}catch(sendError){console.error(sendError);setError(sendError?.message?.replace(/^Firebase:\s*/,'')||'Invincible AI could not complete that request.')}finally{setSending(false);setPending('')}};
 const newConversation=()=>{const id=makeId();localStorage.setItem(storageKey,id);setMessages([]);setActions([]);setError('');setConversationId(id)};
 return{conversationId,messages,pending,actions,sending,error,send,newConversation,provider,setProvider:chooseProvider};
}
