// Navigation data and mobile-tab preferences shared by React and standalone pages.
export const APP_BASE='/invincible/';
export const navigationPages=[
 {id:'dashboard',label:'Dashboard',short:'Home',href:APP_BASE,icon:'⌂'},
 {id:'ai',label:'Invincible AI',short:'AI',href:APP_BASE+'ai/',icon:'✦'},
 {id:'journal',label:'Journal',href:APP_BASE+'journal/',icon:'▤'},
 {id:'finance',label:'Finance',href:APP_BASE+'journal/finance.html',icon:'⌁'},
 {id:'garage',label:'Garage',href:APP_BASE+'garage/',icon:'◇'},
 {id:'creator',label:'Creator Studio',short:'Creator',href:APP_BASE+'creator/',icon:'▷'},
 {id:'workday',label:'Workday',href:APP_BASE+'workday/',icon:'▣'},
 {id:'lic',label:'LIC',href:APP_BASE+'lic/',icon:'♢'},
 {id:'reminders',label:'Reminders',href:APP_BASE+'reminders/',icon:'♧'},
 {id:'portfolio',label:'Portfolio',href:APP_BASE+'portfolio.html',icon:'▣'}
];
export const mobilePages=navigationPages.filter(page=>!page.external&&page.id!=='dashboard');
export const MOBILE_TABS_KEY='invincible.mobileTabs.v1';
export const DEFAULT_MOBILE_TABS=['ai','workday','journal'];
export function readMobileTabs(storage){
 try{
  const value=JSON.parse((storage||globalThis.localStorage).getItem(MOBILE_TABS_KEY)),valid=new Set(mobilePages.map(page=>page.id));
  if(Array.isArray(value)&&value.length===3&&new Set(value).size===3&&value.every(id=>valid.has(id)))return value;
 }catch{}
 return [...DEFAULT_MOBILE_TABS];
}
export function isActivePage(page,pathname){
 if(page.external)return false;
 const path=pathname.replace(/index\.html$/,''),target=page.href;
 return page.id==='dashboard'||page.id==='journal'?path===target:path.startsWith(target);
}

const taskPage={id:'task',label:'Task Workspace',href:APP_BASE+'task/'};
export function pageForPath(pathname){
 if(pathname.replace(/index\.html$/,'').startsWith(taskPage.href))return taskPage;
 return navigationPages.find(page=>isActivePage(page,pathname))||navigationPages[0];
}

// Desktop spatial order. Keep destinations in the shared navigation registry.
const spatialExtras=[
 {id:'workspace',label:'My Workspace',href:APP_BASE+'#workspace',icon:'▦'},
 {id:'voiceover',label:'Voiceover',href:APP_BASE+'creator/tts.html',icon:'♫'},
 {id:'images',label:'Images',href:APP_BASE+'creator/images.html',icon:'▧'}
];
export const desktopSpaces=['portfolio','lic','garage','workday','reminders','journal','finance','dashboard','workspace','creator','voiceover','images','ai'].map(id=>{
 const page=[...navigationPages,...spatialExtras].find(item=>item.id===id);
 return {...page,label:id==='dashboard'?'Main Dashboard':page.label,number:id==='dashboard'?'01':id==='workspace'?'02':''};
});
export function spatialDestination(href,base='https://invincy.github.io'+APP_BASE){
 let url;try{url=new URL(href,base);}catch{return null;}
 if(url.origin!==new URL(base).origin)return null;
 const path=url.pathname.replace(/index\.html$/,'');
 if(path===APP_BASE&&url.hash==='#workspace')return desktopSpaces.find(page=>page.id==='workspace');
 if(path===APP_BASE||path===APP_BASE+'v2/')return desktopSpaces.find(page=>page.id==='dashboard');
 if(path===APP_BASE+'creator/tts.html')return desktopSpaces.find(page=>page.id==='voiceover');
 if(path===APP_BASE+'creator/images.html')return desktopSpaces.find(page=>page.id==='images');
 if(path===APP_BASE+'journal/finance.html')return desktopSpaces.find(page=>page.id==='finance');
 return desktopSpaces.find(page=>!['dashboard','workspace','voiceover','images','finance'].includes(page.id)&&isActivePage(page,path))||null;
}
