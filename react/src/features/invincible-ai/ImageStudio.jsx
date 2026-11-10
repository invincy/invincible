import{useEffect,useRef}from'react';
import{mountImageGenerator}from'../../../../creator/image-generator.js';
import{createLocalImageClient}from'../../../../shared/local-image-client.js';
import'../../../../creator/image-generator.css';

export function ImageStudio({accountId,clientFactory=createLocalImageClient}){
 const host=useRef(null),account=useRef(accountId);account.current=accountId;
 useEffect(()=>{
  if(!accountId||!host.current)return;
  const getAccountId=()=>account.current;
  const panel=mountImageGenerator(host.current,{client:clientFactory({getAccountId,requireAccount:true}),getAccountId});
  return()=>panel.destroy();
 },[accountId,clientFactory]);
 return <section className="ai-image-studio" aria-label="Personal image studio"><header className="ai-image-intro"><span className="ai-eyebrow">YOUR IDEAS, MADE VISIBLE</span><h2>Create an image of your own</h2><p>Describe it, choose a frame, and make it yours. Download the PNG—no video project needed.</p><small>Generated privately on this laptop.</small></header>{accountId?<div key={accountId} ref={host}/>:<p role="status">Sign in to create and download your own images.</p>}</section>;
}
