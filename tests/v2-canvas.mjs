import test from 'node:test';
import assert from 'node:assert/strict';
import {canvasView,zoomCanvas,selectionBox,validateIdea} from '../react/v2/canvas-model.js';
test('dashboard camera supports signed positions without a hard edge and bounded zoom',()=>{
 assert.deepEqual(canvasView({x:-900000,y:700000,zoom:.6}),{x:-900000,y:700000,zoom:.6});
 assert.deepEqual(canvasView({x:Infinity,y:NaN,zoom:5}),{x:0,y:0,zoom:2});
 const view={x:-500,y:150,zoom:.8},point={x:310,y:230},next=zoomCanvas(view,1.5,point);
 assert.equal((point.x-view.x)/view.zoom,(point.x-next.x)/next.zoom);
 assert.equal((point.y-view.y)/view.zoom,(point.y-next.y)/next.zoom);
});
test('canvas selections work in every drag direction and idea payloads are bounded',()=>{
 assert.deepEqual(selectionBox({x:500,y:400},{x:20,y:30}),{x:20,y:30,width:480,height:370});
 const idea={id:'one',title:'  Rocket story  ',category:'YouTube idea',notes:'Keep this angle',image:'data:image/webp;base64,AAAA',view:{x:-100,y:200,zoom:.5}};
 assert.equal(validateIdea(idea).title,'Rocket story');
 assert.deepEqual(validateIdea(idea).view,idea.view);
 assert.throws(()=>validateIdea({...idea,title:''}));
 assert.throws(()=>validateIdea({...idea,image:'https://example.com/image'}));
 assert.throws(()=>validateIdea({...idea,image:'data:image/webp;base64,'+'A'.repeat(180000)}));
 assert.equal(validateIdea({...idea,category:'My custom category'}).category,'My custom category');
});
