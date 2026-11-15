import test from 'node:test';
import assert from 'node:assert/strict';
import {copyProjectForWrite,restoreProjectFromFirestore} from '../creator/project-persistence.js';

test('Creator project writes remove undefined values inside Director drafts',()=>{
 class TimestampLike{toMillis(){return 42;}}
 const timestamp=new TimestampLike(),project={
  id:'director-project',createdAt:timestamp,
  pluginDraft:{creatorStudio:{scenes:[{id:'scene-1',mapAnimation:{layers:[{id:'route',fadeOut:undefined}],optional:undefined}}]}},
  scenes:[undefined,{id:'scene-1',technicalNotes:undefined}]
 };
 const clean=copyProjectForWrite(project);
 assert.equal(clean.createdAt,timestamp,'Firestore Timestamp-like instances remain intact');
 assert.deepEqual(clean.pluginDraft.creatorStudio.scenes[0].mapAnimation.layers,[{id:'route'}]);
 assert.deepEqual(clean.scenes,[{id:'scene-1'}]);
 assert.equal(JSON.stringify(clean).includes('undefined'),false);
});

test('Creator project writes encode nested route arrays and restore them losslessly',()=>{
 const route=[[77.1,28.6],[78.2,27.4],[79.4,26.8]],project={historicalMap:{visual:{layers:[{id:'monsoon-route',points:route}]}}};
 const stored=copyProjectForWrite(project);
 assert.equal(typeof stored.historicalMap.visual.layers[0].points[0].__invincibleSerializedArray,'string');
 assert.deepEqual(restoreProjectFromFirestore(stored),project);
});
