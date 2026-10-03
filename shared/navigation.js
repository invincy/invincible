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
 {id:'portfolio',label:'Portfolio',href:'https://script.google.com/macros/s/AKfycbxbdgQqTwHIYw_dS9ko_tTieVM1PAQKNAHsTqy7bFPlVNg2P-9FNoccrZwHgbeXALoY/exec',icon:'▣',external:true}
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
