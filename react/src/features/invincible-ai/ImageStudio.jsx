import{useEffect,useRef}from'react';
import{mountConnectedImageGenerator}from'../../../../creator/image-generator.js';
import{createLocalImageClient}from'../../../../shared/local-image-client.js';
import{httpsCallable}from'firebase/functions';
import{functions}from'../../firebase';
import{draftRemoteImagePrompt}from'./services/aiService';
import'../../../../creator/image-generator.css';

const relay=httpsCallable(functions,'invincibleImageRelay');
const callRelay=async data=>(await relay(data)).data;

export function ImageStudio({accountId,connectionRef,onConnectionChange,clientFactory=createLocalImageClient}){
 const host=useRef(null),account=useRef(accountId);account.current=accountId;
 useEffect(()=>{
  if(!accountId||!host.current)return;
  const getAccountId=()=>account.current;
  const panel=mountConnectedImageGenerator(host.current,{clientFactory,getAccountId,callRelay,draftPrompt:draftRemoteImagePrompt,statusOnlyConnection:true,onConnectionChange});
  connectionRef.current=panel;
  return()=>{connectionRef.current=null;panel.destroy()};
 },[accountId,clientFactory,connectionRef,onConnectionChange]);
 return <section className="ai-image-studio" aria-label="Image Studio">{accountId?<div key={accountId} ref={host}/>:<p role="status">Sign in to create images.</p>}</section>;
}
