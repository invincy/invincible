import{observeAuth}from'../shared/firebase-client.js';
import{mountImageGenerator}from'./image-generator.js';
import{createLocalImageClient}from'../shared/local-image-client.js';
const host=document.getElementById('creator-image-studio'),status=document.getElementById('image-account-status');
let account=null,panel;
observeAuth(user=>{
 panel?.destroy();panel=null;host.replaceChildren();account=user;
 status.textContent=user?'Generated privately on this laptop.':'Sign in to Invincible to create images. No project is needed.';
 if(!user)return;
 const getAccountId=()=>account?.uid||null;
 panel=mountImageGenerator(host,{client:createLocalImageClient({getAccountId,requireAccount:true}),getAccountId});
}).catch(()=>{status.textContent='Could not restore your account. Refresh to try again.';});
