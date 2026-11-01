import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {LAYOUT_ID,readLayout,starterLayout,vacantPosition,intersects,anchor,hitStroke,strokeBounds} from '../journal/layout-model.mjs';

test('layout reading preserves legacy writing, positions, extra fields and rows without migration',()=>{
 const legacy={id:LAYOUT_ID,schemaVersion:1,futureProperty:{retained:true},cards:Array.from({length:95},(_,i)=>({id:'old-'+i,x:i*20,y:17,width:310,height:240,colour:'rose',text:'Saved '+i,unknown:{preserve:i}}))};
 const layout=readLayout(legacy);assert.deepEqual(layout.cards,legacy.cards);assert.deepEqual(layout.futureProperty,legacy.futureProperty);layout.cards[0].text='Changed';assert.equal(legacy.cards[0].text,'Saved 0');
});
test('daily starter supplies four cards on every screen and never covers existing ink',()=>{
 const ink={id:'ink',points:[{x:35,y:70},{x:550,y:800}],width:4};assert.equal(starterLayout([ink],800,1280).cards.length,4);assert.equal(starterLayout([],393,852).cards.length,4);assert.equal(starterLayout([],800,1280).cards.length,4);for(const card of starterLayout([ink],800,1280).cards)assert.equal(intersects(card,strokeBounds(ink)),false);
 const layout=readLayout(),position=vacantPosition({x:28,y:110},{width:310,height:290},layout,[ink]);assert.equal(intersects({...position,width:310,height:290},strokeBounds(ink)),false);assert.deepEqual(ink.points,[{x:35,y:70},{x:550,y:800}]);
});
test('connections follow moved cards, icons and transformed handwriting without rewriting ink',()=>{
 const layout=readLayout({cards:[{id:'c',x:30,y:40,width:300,height:200}],icons:[{id:'i',x:500,y:300,size:64}]}),ink={id:'s',points:[{x:100,y:200},{x:300,y:400}],width:2};
 assert.deepEqual(anchor({type:'card',id:'c'},layout,[ink]),{x:180,y:140});layout.cards[0].x+=80;assert.deepEqual(anchor({type:'card',id:'c'},layout,[ink]),{x:260,y:140});assert.deepEqual(anchor({type:'icon',id:'i'},layout,[ink]),{x:532,y:332});assert.deepEqual(anchor({type:'stroke',id:'s'},layout,[ink]),{x:200,y:300});ink.points.forEach(p=>p.x+=20);assert.equal(anchor({type:'stroke',id:'s'},layout,[ink]).x,220);layout.cards[0].hidden=true;assert.equal(anchor({type:'card',id:'c'},layout,[ink]),null);assert.equal(anchor({type:'stroke',id:'missing'},layout,[ink]),null);
 assert.equal(hitStroke({x:200,y:280},[ink],30)?.id,'s');assert.equal(hitStroke({x:900,y:900},[ink]),null);
});
test('new cards prefer unused visible paper before extending the world',()=>{
 const layout=readLayout({cards:[{id:'diary',x:28,y:110,width:310,height:290}]}),position=vacantPosition({x:28,y:110},{width:280,height:240},layout,[],{x:0,y:0,width:800,height:1200});
 assert.ok(position.x+280<=800&&position.y+240<=1200);assert.equal(intersects({...position,width:280,height:240},layout.cards[0]),false);
});
test('edit timeline undoes mixed ink/layout groups, retries through the same API and isolates dates/accounts',async()=>{
 const rows=new Map(),calls=[],listeners=new Map();let account='owner',date='2026-11-01';
 const rawSave=row=>{calls.push(['save',row.id]);rows.set(row.id,structuredClone(row));},rawRemove=id=>{calls.push(['remove',id]);rows.delete(id);};
 const api={context:()=>({uid:account,dateKey:date}),strokes:()=>[...rows.values()],rawSave,rawRemove};
 const sandbox={structuredClone,Map,JSON,setTimeout:()=>1,clearTimeout:()=>{},window:{__journalApi:api,addEventListener:()=>{}},document:{addEventListener:(name,fn)=>listeners.set(name,fn)}};
 vm.runInNewContext(await fs.readFile(new URL('../journal/edit-history.js',import.meta.url),'utf8'),sandbox);const history=sandbox.window.__journalHistory;
 const save=value=>history.record('save',value,api.strokes(),()=>rawSave(value));
 save({id:'ink',tool:'pen',points:[{x:20,y:30}]});history.flush();save({id:LAYOUT_ID,tool:'canvas-layout',points:[],cards:[{id:'mood',mood:4,text:'retained'}]});history.flush();
 history.undo();assert.ok(rows.has('ink'));assert.ok(!rows.has(LAYOUT_ID));history.redo();assert.equal(rows.get(LAYOUT_ID).cards[0].mood,4);
 save({...rows.get(LAYOUT_ID),cards:[{id:'mood',mood:5,text:'new writing'}]});history.flush();history.undo();assert.equal(rows.get(LAYOUT_ID).cards[0].text,'retained');history.redo();assert.equal(rows.get(LAYOUT_ID).cards[0].text,'new writing');
 history.undo();history.undo();history.undo();assert.equal(rows.size,0);history.redo();assert.ok(rows.has('ink'));history.redo();assert.ok(rows.has(LAYOUT_ID));
 date='2026-11-02';rows.clear();history.undo();assert.equal(rows.size,0);save({id:'new-day',tool:'pen',points:[{x:4,y:5}]});history.flush();account='other';rows.clear();history.redo();history.undo();assert.equal(rows.size,0);assert.ok(calls.length>8);
});

test('daily defaults preserve existing cards, hidden choices and stable IDs without duplicate additions',()=>{
 const existing={id:LAYOUT_ID,cards:[{id:'mood',kind:'mood',title:'My mood',mood:4,hidden:true,x:11,y:22,width:260,height:130},{id:'old-notes',title:'Personal notes',text:'Keep this',x:50,y:40,width:300,height:220}],connections:[{id:'link',from:{type:'card',id:'mood'},to:{type:'card',id:'old-notes'}}],customField:{keep:true}};
 const next=starterLayout([],800,1280,existing);assert.deepEqual(next.cards.slice(0,2),existing.cards);assert.deepEqual(next.connections,existing.connections);assert.deepEqual(next.customField,existing.customField);assert.equal(next.cards.length,5);assert.deepEqual(next.cards.filter(c=>c.kind==='mood'),[existing.cards[0]]);assert.deepEqual(starterLayout([],800,1280,next),next);assert.equal(existing.cards.length,2);
 assert.deepEqual(starterLayout([],800,1280).cards.map(c=>c.title),['Daily Planner','To-Do',"Today's Idea","Today's Mood"]);
});
