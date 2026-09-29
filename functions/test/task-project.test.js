const test=require('node:test');
const assert=require('node:assert/strict');
const {addStage,buildProjectTask,focusTask,setNextAction}=require('../src/domain/task-project');

test('creates a project with ordered stages and Research active',()=>{
 const project=buildProjectTask({title:'Chandrayaan-3 Research',description:'',stages:['Research','Script','3D Scenes','Voiceover','Edit','Publish'],currentStage:'Research'});
 assert.equal(project.status,'Today');assert.equal(project.steps.length,6);assert.equal(project.steps[0].title,'Research');assert.equal(project.steps[0].status,'Working');assert.equal(project.activeStepId,project.steps[0].id);assert.deepEqual(project.subtasks.map(step=>step.text),project.steps.map(step=>step.title));
});

test('finishes Research and makes Script the next action',()=>{
 const project=buildProjectTask({title:'Chandrayaan-3 Research',stages:['Research','Script','Publish'],currentStage:'Research'}),updated=setNextAction(project,'Script',true);
 assert.equal(updated.steps[0].status,'Done');assert.equal(updated.steps[0].done,true);assert.equal(updated.steps[1].status,'Working');assert.equal(updated.activeStepId,updated.steps[1].id);assert.equal(updated.status,'Today');
});

test('adds a stage after a named stage',()=>{
 const project=buildProjectTask({title:'Video',stages:['Research','Publish'],currentStage:'Research'}),updated=addStage(project,'Script','Research');assert.deepEqual(updated.steps.map(step=>step.title),['Research','Script','Publish']);
});

test('uses the same Today-first focus rule as Dashboard',()=>{
 const focus=focusTask([{id:'a',status:'In Progress',steps:[]},{id:'b',status:'Today',steps:[]},{id:'c',status:'Done',steps:[]}]);assert.equal(focus.id,'b');
});
