import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
const source=await fs.readFile(new URL('../shared/navigation.js',import.meta.url),'utf8');
const navigation=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('React and standalone navigation share validated tab preferences',()=>{
 const read=value=>navigation.readMobileTabs({getItem:()=>value});
 assert.deepEqual(read('["garage","finance","creator"]'),['garage','finance','creator']);
 for(const value of ['null','bad json','["ai","ai","journal"]','["ai","portfolio","journal"]','["ai"]','["ai","missing","journal"]'])assert.deepEqual(read(value),['ai','workday','journal']);
 assert.deepEqual(navigation.readMobileTabs({getItem:()=>{throw Error('Storage unavailable')}}),['ai','workday','journal']);
 const defaults=read(null);defaults[0]='garage';assert.deepEqual(read(null),['ai','workday','journal']);
});
test('Route matching distinguishes Journal, Finance, Dashboard, and nested LIC',()=>{
 const active=pathname=>navigation.navigationPages.filter(page=>navigation.isActivePage(page,pathname)).map(page=>page.id);
 assert.deepEqual(active('/invincible/index.html'),['dashboard']);
 assert.deepEqual(active('/invincible/journal/index.html'),['journal']);
 assert.deepEqual(active('/invincible/journal/finance.html'),['finance']);
 assert.deepEqual(active('/invincible/lic/bima-platinum/index.html'),['lic']);
 assert.deepEqual(active('/invincible/garage/'),['garage']);
 assert.equal(navigation.pageForPath('/invincible/task/index.html').id,'task');
 assert.equal(navigation.pageForPath('/invincible/journal/finance.html').id,'finance');
 assert.equal(navigation.pageForPath('/unknown/').id,'dashboard');
});
