import{observeAuth}from'../shared/firebase-client.js';
import{mountConnectedImageGenerator}from'./image-generator.js?v=2026111204';
import{callImageRelay}from'../shared/firebase-image-relay.js';
const host=document.getElementById('creator-image-studio'),status=document.getElementById('image-account-status');
let account=null,panel;
observeAuth(user=>{
 panel?.destroy();panel=null;host.replaceChildren();account=user;
 status.textContent=user?'Images are generated on your Invincible laptop.':'Sign in to Invincible to create images. No project is needed.';
 if(!user)return;
 const getAccountId=()=>account?.uid||null;
 panel=mountConnectedImageGenerator(host,{getAccountId,callRelay:callImageRelay});
}).catch(()=>{status.textContent='Could not restore your account. Refresh to try again.';});
