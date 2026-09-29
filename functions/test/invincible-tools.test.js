const test=require('node:test');
const assert=require('node:assert/strict');
const {executeInvincibleTool}=require('../src/tools/invincible-tools');

test('create_project reaches only the repository project adapter',async()=>{
 let received=null;const repository={createProject:async args=>{received=args;return{id:'project_1',title:args.title,steps:args.stages.map((title,index)=>({id:String(index),title}))}}};
 const output=await executeInvincibleTool(repository,'create_project',{title:'Chandrayaan-3 Research',description:null,stages:['Research','Script','3D Scenes','Voiceover','Edit','Publish'],current_stage:'Research'});
 assert.equal(received.title,'Chandrayaan-3 Research');assert.equal(received.currentStage,'Research');assert.equal(output.action.status,'completed');assert.match(output.action.summary,/6 stages/);
});

test('set_next_action passes explicit completion intent',async()=>{
 let received=null;const repository={setNextAction:async(...args)=>{received=args;return{id:'project_1',title:'Chandrayaan-3 Research',activeStepId:'script',steps:[{id:'research',title:'Research',done:true},{id:'script',title:'Script',done:false}]}}};
 const output=await executeInvincibleTool(repository,'set_next_action',{project_id:'project_1',stage_title:'Script',complete_current:true});
 assert.deepEqual(received,['project_1','Script',true]);assert.match(output.action.summary,/Script/);
});

test('rejects arbitrary extra write fields',async()=>{
 await assert.rejects(()=>executeInvincibleTool({},'update_task',{task_id:'task_1',title:'Safe',description:null,status:null,firestore_path:'users/other'}),/Unrecognized key/);
});
