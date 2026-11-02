import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {LAYOUT_ID,readLayout,starterLayout,vacantPosition,intersects,anchor,hitStroke,strokeBounds,writingPage,arrangeWritingPage} from '../journal/layout-model.mjs';

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
 const rawSave=row=>{calls.push(['save',row.id]);rows.set(row.id,{...rows.get(row.id),...structuredClone(row)});},rawRemove=id=>{calls.push(['remove',id]);rows.delete(id);};
 const api={context:()=>({uid:account,dateKey:date}),strokes:()=>[...rows.values()],rawSave,rawRemove};
 const sandbox={structuredClone,Map,JSON,setTimeout:()=>1,clearTimeout:()=>{},window:{__journalApi:api,addEventListener:()=>{}},document:{addEventListener:(name,fn)=>listeners.set(name,fn)}};
 vm.runInNewContext(await fs.readFile(new URL('../journal/edit-history.js',import.meta.url),'utf8'),sandbox);const history=sandbox.window.__journalHistory;
 const save=value=>history.record('save',value,api.strokes(),()=>rawSave(value));
 save({id:'ink',tool:'pen',points:[{x:20,y:30}]});history.flush();save({id:LAYOUT_ID,tool:'canvas-layout',points:[],cards:[{id:'mood',mood:4,text:'retained'}]});history.flush();
 history.undo();assert.ok(rows.has('ink'));assert.ok(!rows.has(LAYOUT_ID));history.redo();assert.equal(rows.get(LAYOUT_ID).cards[0].mood,4);
 save({...rows.get(LAYOUT_ID),cards:[{id:'mood',mood:5,text:'new writing'}]});history.flush();history.undo();assert.equal(rows.get(LAYOUT_ID).cards[0].text,'retained');history.redo();assert.equal(rows.get(LAYOUT_ID).cards[0].text,'new writing');
 history.undo();history.undo();history.undo();assert.equal(rows.size,0);history.redo();assert.ok(rows.has('ink'));history.redo();assert.ok(rows.has(LAYOUT_ID));
 date='2026-11-02';rows.clear();history.undo();assert.equal(rows.size,0);save({id:'new-day',tool:'pen',points:[{x:4,y:5}]});history.flush();account='other';rows.clear();history.redo();history.undo();assert.equal(rows.size,0);assert.ok(calls.length>8);
 save({id:LAYOUT_ID,tool:'canvas-layout',cards:[],points:[]});history.flush();save({id:LAYOUT_ID,tool:'canvas-layout',cards:[],points:[],page:{x:24,y:80,width:752,height:1150},writingPageVersion:1});history.flush();history.undo();assert.equal(rows.get(LAYOUT_ID).page,null,'Undo clears a newly added paper frame even with merge writes');assert.equal(rows.get(LAYOUT_ID).writingPageVersion,0);
});

test('daily defaults preserve existing cards, hidden choices and stable IDs without duplicate additions',()=>{
 const existing={id:LAYOUT_ID,cards:[{id:'mood',kind:'mood',title:'My mood',mood:4,hidden:true,x:11,y:22,width:260,height:130},{id:'old-notes',title:'Personal notes',text:'Keep this',x:50,y:40,width:300,height:220}],connections:[{id:'link',from:{type:'card',id:'mood'},to:{type:'card',id:'old-notes'}}],customField:{keep:true}};
 const next=starterLayout([],800,1280,existing);assert.deepEqual(next.cards.slice(0,2),existing.cards);assert.deepEqual(next.connections,existing.connections);assert.deepEqual(next.customField,existing.customField);assert.equal(next.cards.length,5);assert.deepEqual(next.cards.filter(c=>c.kind==='mood'),[existing.cards[0]]);assert.deepEqual(starterLayout([],800,1280,next),next);assert.equal(existing.cards.length,2);
 assert.deepEqual(starterLayout([],800,1280).cards.map(c=>c.title),['Daily Journal','To-Do',"Today's Idea","Today's Mood"]);
});
test('tablet writing page has generous, varied ruled sections inside a portrait sheet',()=>{
 const design=writingPage(800,1280),{planner,todo,ideas,mood}=design.cards;assert.equal(planner.writingRole,'journal');
 assert.ok(planner.width>=680&&planner.height>=640);assert.ok(todo.width>=320&&todo.height>=180&&todo.height<=260);assert.ok(ideas.height>todo.height&&ideas.height<=400&&ideas.width>=320);assert.ok(mood.height<180);assert.ok(design.page.height>design.page.width*1.4);
 for(const card of Object.values(design.cards)){assert.ok(card.x>=design.page.x&&card.x+card.width<=design.page.x+design.page.width);assert.ok(card.y>=design.page.y&&card.y+card.height<=design.page.y+design.page.height);}
 const cards=Object.values(design.cards);for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++)assert.equal(intersects(cards[i],cards[j],0),false);
 const phone=writingPage(393,852);assert.ok(phone.page.height>852);assert.ok(phone.cards.planner.height>=640&&phone.cards.todo.height>=180&&phone.cards.todo.height<=260,'Small screens pan a real writing page instead of shrinking handwriting cards');
});
test('ink-free daily pages upgrade without clearing text, checklists or mood; ink pages keep saved geometry',()=>{
 const record={cards:[{id:'planner',kind:'planner',x:28,y:70,width:300,height:150,text:'Saved plan'},{id:'todo',kind:'todo',x:24,y:248,width:280,height:150,items:[{id:'one',text:'Keep task',done:true}]},{id:'ideas',kind:'ideas',x:24,y:426,width:300,height:150,text:'Saved thought'},{id:'mood',kind:'mood',x:24,y:604,width:260,height:130,mood:4}]};
 const upgraded=starterLayout([],800,1280,record);assert.equal(upgraded.cards[0].text,'Saved plan');assert.deepEqual(upgraded.cards[1].items,record.cards[1].items);assert.equal(upgraded.cards[3].mood,4);assert.ok(upgraded.cards[0].width>600);
 const ink=[{id:'ink',points:[{x:40,y:100},{x:180,y:100}]}],preserved=starterLayout(ink,800,1280,record);assert.deepEqual(preserved.cards,record.cards);assert.equal(preserved.page,undefined);
 const explicit=arrangeWritingPage(preserved,800,1280);assert.equal(explicit.cards[2].text,'Saved thought');assert.equal(record.cards[0].width,300);
});

test('daily journal rename and version-two proportions preserve ink and custom titles',()=>{
 const record={writingPageVersion:1,cards:[{id:'planner',kind:'planner',title:'Daily Planner',x:50,y:100,width:600,height:350,text:'Keep reflection'},{id:'todo',kind:'todo',x:50,y:480,width:300,height:400,items:[]},{id:'ideas',kind:'ideas',x:400,y:480,width:300,height:600},{id:'mood',kind:'mood',x:50,y:920,width:300,height:148}]};
 const ink=[{id:'ink',tool:'pen',points:[{x:80,y:150},{x:200,y:170}]}];const preserved=starterLayout(ink,800,1280,record);assert.equal(preserved.cards[0].title,'Daily Journal');for(const key of ['x','y','width','height'])assert.equal(preserved.cards[0][key],record.cards[0][key]);assert.equal(preserved.cards[0].text,'Keep reflection');
 const upgraded=starterLayout([],800,1280,record);assert.equal(upgraded.writingPageVersion,2);assert.ok(upgraded.cards[0].height>640);assert.equal(upgraded.cards[0].title,'Daily Journal');record.cards[0].title='My own heading';assert.equal(starterLayout([],800,1280,record).cards[0].title,'My own heading');
});
