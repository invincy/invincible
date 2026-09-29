const assert=require('node:assert/strict');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {InvincibleRepository}=require('../src/data/invincible-repository');
const {executeInvincibleTool}=require('../src/tools/invincible-tools');

async function run(){
 if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('Run this test through the Firestore emulator.');
 const app=initializeApp({projectId:'demo-invincible-ai'},'invincible-ai-flow'),db=getFirestore(app),repository=new InvincibleRepository(db,'test-user','test@example.com');
 const created=await executeInvincibleTool(repository,'create_project',{title:'Chandrayaan-3 Research',description:null,stages:['Research','Script','3D Scenes','Voiceover','Edit','Publish'],current_stage:'Research'});
 const projectId=created.result.id,first=await db.collection('users').doc('test-user').collection('tasks').doc(projectId).get(),firstData=first.data();
 assert.equal(first.exists,true);assert.equal(firstData.status,'Today');assert.equal(firstData.steps.length,6);assert.equal(firstData.steps[0].title,'Research');assert.equal(firstData.steps[0].status,'Working');assert.equal(firstData.activeStepId,firstData.steps[0].id);
 await executeInvincibleTool(repository,'set_next_action',{project_id:projectId,stage_title:'Script',complete_current:true});
 const second=await db.collection('users').doc('test-user').collection('tasks').doc(projectId).get(),secondData=second.data();
 assert.equal(secondData.steps[0].status,'Done');assert.equal(secondData.steps[0].done,true);assert.equal(secondData.steps[1].status,'Working');assert.equal(secondData.activeStepId,secondData.steps[1].id);assert.equal(secondData.status,'Today');
 console.log('Firestore flow passed: create project → complete Research → activate Script');
 await db.terminate();
}

run().catch(error=>{console.error(error);process.exitCode=1});
