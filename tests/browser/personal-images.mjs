import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {createLocalAgentServer} from '../../local-ai/agent-server.mjs';
import {fakeGpu} from '../fixtures/imagegen-service.mjs';
const root=path.resolve(import.meta.dirname,'../..'),directory=await fs.mkdtemp(path.join(process.env.INVINCIBLE_IMAGE_TEST_ROOT||os.tmpdir(),'invincible-personal-images-'));
const gpu=fakeGpu({ollamaOffline:true}),service=await createLocalAgentServer({ownerUid:'test-owner',port:18891,workspaceRoot:directory,fetchImpl:gpu.fetchImpl,workerOptions:{pollMs:20}});
const fixtures={
 tasks:"export const useTasks=()=>({tasks:[]});",
 auth:"export const useAuth=()=>({user:{uid:'test-owner'}});",
 conversation:"import{useState}from'react';export function useAiConversation(){const [provider,setProvider]=useState('cloud');return {messages:[],actions:[],sending:false,send:()=>{throw Error('Chat must not be used to generate an image')},newConversation:()=>{},provider,setProvider};}",
 service:"export const PROVIDERS={cloud:'cloud',local:'local'},isLocalAiAvailable=true,mobileLaptop=location.search.includes('mobile=1');export async function draftRemoteImagePrompt(){throw Error('Use the real local prompt drafting endpoint');}export async function checkLaptopConnection(){window.connectionChecks=(window.connectionChecks||0)+1;return window.connectionChecks>1;}export const connectThisLaptop=()=>{throw Error('Use the real image connection')},createLocalAgentPairing=async()=>{window.replacementKeys=(window.replacementKeys||0)+1;return {token:'fixture-only-key'};};"
};
const compiled=await build({absWorkingDir:path.join(root,'react'),stdin:{contents:"import React from 'react';import{createRoot}from'react-dom/client';import{InvincibleAiPage}from'./src/features/invincible-ai/InvincibleAiPage.jsx';createRoot(document.getElementById('root')).render(<InvincibleAiPage/>);",resolveDir:path.join(root,'react'),loader:'jsx'},bundle:true,write:false,outdir:'fixture',jsx:'automatic',plugins:[{name:'isolated-app-state',setup(b){b.onResolve({filter:/(useTasks|AuthContext|useAiConversation|aiService)$/},args=>({path:args.path.includes('useTasks')?'tasks':args.path.includes('AuthContext')?'auth':args.path.includes('useAiConversation')?'conversation':'service',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:fixtures[args.path],loader:'js',resolveDir:path.join(root,'react')}));}}]});
let browser;
try{
 await service.listen();browser=await chromium.launch({headless:true});const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route(url=>url.origin===service.origin&&url.pathname==='/personal-images',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width"><div id="root"></div><link rel="stylesheet" href="/personal.css"><script>window.__INVINCIBLE_LOCAL_AI_ORIGIN__=location.origin;sessionStorage.setItem('invincible.local-worker.'+location.origin,${JSON.stringify(service.token)});</script><script type="module" src="/personal.js"></script>`}));
 for(const extension of ['js','css'])await page.route(service.origin+'/personal.'+extension,route=>route.fulfill({contentType:extension==='js'?'text/javascript':'text/css',body:compiled.outputFiles.find(file=>file.path.endsWith('.'+extension)).text}));
 await page.goto(service.origin+'/personal-images');
 await page.getByRole('tab',{name:'Images',exact:true}).click();assert.equal(await page.getByRole('tabpanel',{name:'Chat',exact:true}).isVisible(),false);
 await page.getByRole('textbox',{name:'Prompt',exact:true}).fill('A personal illustration without a video project');await page.getByRole('button',{name:'Generate',exact:true}).click();await page.getByText(/^Completed ·/).waitFor();
 assert.equal(await page.getByRole('button',{name:'Attach to current project',exact:true}).isVisible(),false,'Personal images do not need a project');
 assert.ok(await page.getByRole('img',{name:'Generated image',exact:true}).evaluate(image=>image.complete&&image.naturalWidth===512));
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download PNG',exact:true}).click();assert.ok((await fs.stat(await(await event).path())).size>100);
 await page.getByRole('tab',{name:'Chat',exact:true}).click();await page.getByRole('tab',{name:'Chat',exact:true}).press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Images',exact:true}).getAttribute('aria-selected'),'true');assert.ok(await page.getByRole('img',{name:'Generated image',exact:true}).isVisible(),'Tab switches retain the completed image');
 for(const width of [320,393,820,1440]){await page.setViewportSize({width,height:950});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No personal studio overflow at '+width);}
 assert.equal(gpu.loads,1);
 await page.goto(service.origin+'/personal-images?mobile=1');
 await page.getByRole('combobox',{name:'AI provider'}).selectOption('local');
 const laptopStatus=page.locator('.ai-laptop-connection').getByRole('status');
 await laptopStatus.filter({hasText:/^Laptop offline$/}).waitFor();
 await page.getByRole('button',{name:'Refresh laptop connection'}).click();
 await laptopStatus.filter({hasText:/^Laptop online$/}).waitFor();
 assert.equal(await page.getByText('Laptop settings',{exact:true}).count(),0);
 assert.equal(await page.evaluate(()=>window.replacementKeys||0),0);
 await page.goto(service.origin+'/personal-images');
 await page.getByRole('combobox',{name:'AI provider'}).selectOption('local');
 await page.getByText('Laptop settings',{exact:true}).click();
 const replace=page.getByRole('button',{name:'Replace remote key'});
 const dismiss=async dialog=>{assert.match(dialog.message(),/disables the saved remote key/);await dialog.dismiss();};
 page.once('dialog',dismiss);
 await replace.click();
 assert.equal(await page.evaluate(()=>window.replacementKeys||0),0);
 page.once('dialog',dialog=>dialog.accept());
 await replace.click();
 await page.getByText('New remote key',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>window.replacementKeys),1);
 await page.route(/\/(?:creator\/[^?]+\.(?:html|css|js)|site-nav\.(?:js|css)|shared\/firebase-client\.js)(?:\?.*)?$/,async route=>{
  const name=new URL(route.request().url()).pathname.slice(1);
  if(name==='site-nav.js'||name==='creator/creator.js')return route.fulfill({contentType:'text/javascript',body:''});
  if(name==='shared/firebase-client.js')return route.fulfill({contentType:'text/javascript',body:"window.__INVINCIBLE_LOCAL_AI_ORIGIN__=location.origin;export async function observeAuth(fn){fn({uid:'test-owner'});window.fixtureSignOut=()=>fn(null);return()=>{};}"});
  const file=path.resolve(root,name);assert.ok(file.startsWith(root+path.sep));return route.fulfill({contentType:name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':'text/javascript',body:await fs.readFile(file)});
 });
 await page.goto(service.origin+'/creator/index.html');const voiceover=page.getByRole('link',{name:'Voiceover',exact:true});assert.equal(await voiceover.evaluate(link=>link.nextElementSibling?.textContent),'Image generator','Image generator is directly beside the requested Voiceover button');
 await page.getByRole('link',{name:'Image generator',exact:true}).click();await page.getByRole('button',{name:'Generate',exact:true}).waitFor();
 assert.match(page.url(),/\/creator\/images\.html$/,'Creator image tool stays in Creator');assert.equal(await page.getByRole('link',{name:'Voiceover',exact:true}).getAttribute('href'),'tts.html');
 await page.getByRole('textbox',{name:'Prompt',exact:true}).fill('An independent Creator image');await page.getByRole('button',{name:'Generate',exact:true}).click();await page.getByText(/^Completed ·/).waitFor();
 assert.equal(await page.getByRole('button',{name:'Attach to current project',exact:true}).isVisible(),false);assert.equal(gpu.loads,2);
 for(const width of [320,1440]){await page.setViewportSize({width,height:950});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No Creator image page overflow at '+width);}
 await page.evaluate(()=>window.fixtureSignOut());await page.getByText('Sign in to Invincible to create images. No project is needed.').waitFor();assert.equal(await page.getByRole('img',{name:'Generated image',exact:true}).count(),0,'Signing out removes the prior owner image');
 assert.deepEqual(errors,[]);console.log('PASS: personal Images, adjacent Creator Voiceover/Image generator entry, real Creator tool page, project-free downloads, signed-out clearing, keyboard navigation and responsive layout.');
}finally{await browser?.close();await service.close();await fs.rm(directory,{recursive:true,force:true,maxRetries:3});}
