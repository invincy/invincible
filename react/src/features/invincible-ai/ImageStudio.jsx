import{useEffect,useRef}from'react';
import{mountConnectedImageGenerator}from'../../../../creator/image-generator.js';
import{createLocalImageClient}from'../../../../shared/local-image-client.js';
import{httpsCallable}from'firebase/functions';
import{functions}from'../../firebase';
import'../../../../creator/image-generator.css';

const relay=httpsCallable(functions,'invincibleImageRelay');
const callRelay=async data=>(await relay(data)).data;

export function ImageStudio({accountId,clientFactory=createLocalImageClient}){
 const host=useRef(null),account=useRef(accountId);account.current=accountId;
 useEffect(()=>{
  if(!accountId||!host.current)return;
  const getAccountId=()=>account.current;
  const panel=mountConnectedImageGenerator(host.current,{clientFactory,getAccountId,callRelay});
  return()=>panel.destroy();
 },[accountId,clientFactory]);
 return <section className="ai-image-studio" aria-label="Personal image studio"><header className="ai-image-intro"><h2>Create an image of your own</h2><p>Describe it, choose a frame, and download the PNG. Images are generated on your Invincible laptop.</p></header>{accountId?<div key={accountId} ref={host}/>:<p role="status">Sign in to create and download your own images.</p>}</section>;
}
