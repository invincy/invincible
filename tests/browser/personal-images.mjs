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
 conversation:"export const useAiConversation=()=>({messages:[],actions:[],sending:false,send:()=>{throw Error('Chat must not be used to generate an image')},newConversation:()=>{},provider:'cloud',setProvider:()=>{}});",
 service:"export const PROVIDERS={cloud:'cloud',local:'local'},isLocalAiAvailable=true;export const connectThisLaptop=()=>{throw Error('Use the real image connection')},createLocalAgentPairing=()=>{throw Error('Remote pairing prohibited')};"
};
const compiled=await build({absWorkingDir:path.join(root,'react'),stdin:{contents:"import React from 'react';import{createRoot}from'react-dom/client';import{InvincibleAiPage}from'./src/features/invincible-ai/InvincibleAiPage.jsx';createRoot(document.getElementById('root')).render(<InvincibleAiPage/>);",resolveDir:path.join(root,'react'),loader:'jsx'},bundle:true,write:false,outdir:'fixture',jsx:'automatic',plugins:[{name:'isolated-app-state',setup(b){b.onResolve({filter:/(useTasks|AuthContext|useAiConversation|aiService)$/},args=>({path:args.path.includes('useTasks')?'tasks':args.path.includes('AuthContext')?'auth':args.path.includes('useAiConversation')?'conversation':'service',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:fixtures[args.path],loader:'js'}));}}]});
let browser;
try{
 await service.listen();browser=await chromium.launch({headless:true});const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route(service.origin+'/personal-images',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width"><div id="root"></div><link rel="stylesheet" href="/personal.css"><script>window.__INVINCIBLE_LOCAL_AI_ORIGIN__=location.origin;sessionStorage.setItem('invincible.local-worker.'+location.origin,${JSON.stringify(service.token)});</script><script type="module" src="/personal.js"></script>`}));
 for(const extension of ['js','css'])await page.route(service.origin+'/personal.'+extension,route=>route.fulfill({contentType:extension==='js'?'text/javascript':'text/css',body:compiled.outputFiles.find(file=>file.path.endsWith('.'+extension)).text}));
 await page.goto(service.origin+'/personal-images');
 await page.getByRole('tab',{name:'Images',exact:true}).click();assert.equal(await page.getByRole('tabpanel',{name:'Chat',exact:true}).isVisible(),false);
 await page.getByRole('textbox',{name:'Prompt',exact:true}).fill('A personal illustration without a video project');await page.getByRole('button',{name:'Generate',exact:true}).click();await page.getByText(/^Completed ·/).waitFor();
 assert.equal(await page.getByRole('button',{name:'Attach to current project',exact:true}).isVisible(),false,'Personal images do not need a project');
 assert.ok(await page.getByRole('img',{name:'Generated image',exact:true}).evaluate(image=>image.complete&&image.naturalWidth===512));
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download PNG',exact:true}).click();assert.ok((await fs.stat(await(await event).path())).size>100);
 await page.getByRole('tab',{name:'Chat',exact:true}).click();await page.getByRole('tab',{name:'Chat',exact:true}).press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Images',exact:true}).getAttribute('aria-selected'),'true');assert.ok(await page.getByRole('img',{name:'Generated image',exact:true}).isVisible(),'Tab switches retain the completed image');
 for(const width of [320,393,820,1440]){await page.setViewportSize({width,height:950});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No personal studio overflow at '+width);}
 assert.equal(gpu.loads,1);assert.deepEqual(errors,[]);console.log('PASS: actual Invincible AI page tabs, project-free image generation with Ollama offline, preview, download, keyboard navigation, retained image and responsive layout.');
}finally{await browser?.close();await service.close();await fs.rm(directory,{recursive:true,force:true,maxRetries:3});}
