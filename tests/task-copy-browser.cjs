// Task workspace copy action against controlled task data; no account writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, '.test-output');
const esbuild = require(path.join(root, 'react/node_modules/esbuild'));
const notes = 'First instruction\n\n  Keep indentation\nFinal line\n';
const testRunsNotes = 'Test Runs\nRun the exact checks listed here.\nWait for approval.';

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const mocks = {
    './AuthContext': `export const useAuth=()=>({user:{uid:'fixture'},logout:async()=>{}});`,
    './firebase': `export const db={};`,
    './useTasks': `const tasks=[{id:'task',title:'Copy fixture',status:'Backlog',steps:[{id:'first',title:'First step',notes:${JSON.stringify(notes)},status:'Not Started',done:false},{id:'test-runs',title:'Test Runs',notes:${JSON.stringify(testRunsNotes)},status:'Not Started',done:false}],activeStepId:'first'}];window.saved=[];export const useTasks=()=>({tasks,ready:true,error:'',saveTask:async(id,patch)=>window.saved.push({id,patch}),deleteTask:async()=>{}});`,
    './features/today-plan/useTodayPlan': `export const useTodayPlan=()=>({items:[],addItem:async()=>{window.addedToToday=true}});`,
    './TaskSketch': `export const TaskSketch=()=>null;`,
    './TaskDialog': `export const TaskDialog=()=>null;`,
    'firebase/firestore': `export const collection=()=>({});export const query=x=>x;export const orderBy=()=>({});export const onSnapshot=(_,callback)=>{callback({docs:[]});return()=>{}};export const addDoc=async()=>{};export const deleteDoc=async()=>{};export const doc=()=>({});export const serverTimestamp=()=>0;export const setDoc=async()=>{};`
  };
  await esbuild.build({
    stdin: { contents: `import React from 'react';import{createRoot}from'react-dom/client';import{TaskPage}from'./TaskPage';createRoot(document.getElementById('root')).render(<TaskPage/>);`, resolveDir: path.join(root, 'react/src'), loader: 'jsx' },
    bundle: true, outfile: path.join(output, 'task-copy.js'), jsx: 'automatic',
    plugins: [{ name: 'controlled-task', setup(build) {
      build.onResolve({ filter: /.*/ }, args => Object.hasOwn(mocks, args.path) ? { path: args.path, namespace: 'fixture' } : null);
      build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: mocks[args.path], loader: 'js', resolveDir: path.join(root, 'react/src') }));
    } }]
  });
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/fixture') {
      res.setHeader('Content-Type', 'text/html');
      res.end('<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/task/task.css"><div id="root"></div><script src="/.test-output/task-copy.js"></script>');
      return;
    }
    try {
      const file = path.join(root, url.pathname);
      res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/css');
      res.end(fs.readFileSync(file));
    } catch {
      res.statusCode = 404;
      res.end('Missing');
    }
  });
  await new Promise(resolve => server.listen(8770, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || '/root/.cache/ms-playwright/chromium_headless_shell-1161/chrome-linux/headless_shell', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1160, height: 600 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => {
      if (window.blockCopy) throw Error('Clipboard blocked');
      window.copied = text;
    } } }));
    await page.goto('http://127.0.0.1:8770/fixture?id=task');
    const copy = page.getByRole('button', { name: 'Copy', exact: false });
    await copy.waitFor();
    const today = await page.getByRole('button', { name: /Add to today/ }).boundingBox();
    const copyBox = await copy.boundingBox();
    assert.ok(copyBox.x > today.x && Math.abs(copyBox.y - today.y) < 2, 'Copy sits beside Add to today');
    await copy.click();
    assert.equal(await page.evaluate(() => window.copied), notes);
    assert.equal(await page.getByRole('status').innerText(), 'Copied ✓');
    assert.deepEqual(await page.evaluate(() => window.saved), []);
    for (const width of [393, 320]) {
      await page.setViewportSize({ width, height: 700 });
      const mobileToday = await page.getByRole('button', { name: /Add to today/ }).boundingBox();
      const mobileCopy = await copy.boundingBox();
      assert.ok(mobileCopy.x > mobileToday.x && Math.abs(mobileCopy.y - mobileToday.y) < 2, `${width}px: Copy stays beside Add to today`);
      assert.ok(mobileCopy.x + mobileCopy.width <= width, `${width}px: Copy stays in viewport`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${width}px: no horizontal overflow`);
      await copy.click();
      assert.equal(await page.evaluate(() => window.copied), notes);
    }
    await page.getByRole('button', { name: /Test Runs/ }).click();
    await page.getByText('Synced', { exact: true }).waitFor();
    const savesAfterSelection = await page.evaluate(() => window.saved.length);
    await copy.click();
    assert.equal(await page.evaluate(() => window.copied), testRunsNotes);
    assert.equal(await page.locator('#active-step-notes').inputValue(), testRunsNotes);
    await page.evaluate(() => { window.blockCopy = true; window.copied = null; });
    await copy.click();
    assert.equal(await page.evaluate(() => window.copied), null);
    assert.equal(await page.getByRole('status').innerText(), 'Could not copy notes.');
    assert.equal(await page.evaluate(() => window.saved.length), savesAfterSelection);
    assert.equal(await page.getByRole('combobox', { name: 'Current step status' }).inputValue(), 'Not Started');
    assert.deepEqual(errors, []);
    console.log('Desktop and phone Copy button placement, verbatim multiline notes, step switching, failure feedback and unchanged task state passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
