import test from 'node:test';
import assert from 'node:assert/strict';
import {copyProjectForWrite} from '../creator/project-persistence.js';

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
