const {randomUUID}=require('node:crypto');

const TASK_STATUSES=['Backlog','Today','In Progress','Done'];
const STEP_STATUSES=['Not Started','Working','Blocked','Done'];

function compactText(value,max=240){
 return String(value||'').trim().slice(0,max);
}

function createId(prefix){
 return `${prefix}_${randomUUID()}`;
}

function cleanStep(step,index=0){
 const status=STEP_STATUSES.includes(step?.status)?step.status:(step?.done?'Done':'Not Started');
 return{id:compactText(step?.id,120)||createId('s'),title:compactText(step?.title||step?.text||`Stage ${index+1}`,120),notes:compactText(step?.notes,2000),status,done:status==='Done'||Boolean(step?.done)};
}

function mirrorSteps(steps){
 const normalized=steps.map(cleanStep);
 return{steps:normalized,subtasks:normalized.map(step=>({text:step.title,done:step.done}))};
}

function buildProjectTask({title,description='',stages,currentStage=null}){
 const stageSteps=stages.map((stage,index)=>cleanStep({title:stage},index));
 const wanted=compactText(currentStage,120).toLowerCase();
 let active=stageSteps.find(step=>step.title.toLowerCase()===wanted)||stageSteps[0]||null;
 const steps=stageSteps.map(step=>step.id===active?.id?{...step,status:'Working'}:step);
 return{
  id:createId('project'),
  title:compactText(title,120),
  description:compactText(description,2000),
  kind:'project',
  source:'invincible-ai',
  status:active?'Today':'Backlog',
  ...mirrorSteps(steps),
  activeStepId:active?.id||null
 };
}

function addStage(task,title,afterStage=null){
 const steps=(task.steps||task.subtasks||[]).map(cleanStep),stage=cleanStep({title},steps.length);
 const after=compactText(afterStage,120).toLowerCase(),index=after?steps.findIndex(item=>item.title.toLowerCase()===after):-1;
 const next=index>=0?[...steps.slice(0,index+1),stage,...steps.slice(index+1)]:[...steps,stage];
 return{...mirrorSteps(next),activeStepId:task.activeStepId||stage.id};
}

function setNextAction(task,stageTitle,completeCurrent=true){
 const steps=(task.steps||task.subtasks||[]).map(cleanStep),wanted=compactText(stageTitle,120).toLowerCase(),target=steps.find(step=>step.title.toLowerCase()===wanted);
 if(!target)throw Error(`Stage “${stageTitle}” was not found.`);
 const next=steps.map(step=>{
  if(step.id===target.id)return{...step,status:'Working',done:false};
  if(completeCurrent&&step.id===task.activeStepId)return{...step,status:'Done',done:true};
  return step.status==='Working'?{...step,status:'Not Started'}:step;
 });
 return{...mirrorSteps(next),activeStepId:target.id,status:'Today'};
}

function completeTask(task){
 const steps=(task.steps||task.subtasks||[]).map((step,index)=>({...cleanStep(step,index),status:'Done',done:true}));
 return{status:'Done',completedAt:new Date(),...mirrorSteps(steps)};
}

function taskProgress(task){
 const steps=(task.steps||task.subtasks||[]).map(cleanStep),done=steps.filter(step=>step.done).length;
 return{done,total:steps.length,percent:steps.length?Math.round(done/steps.length*100):0};
}

function focusTask(tasks){
 const weight={Today:3,'In Progress':2,Backlog:1};
 return tasks.filter(task=>task.status!=='Done').sort((a,b)=>(weight[b.status]||0)-(weight[a.status]||0)||taskProgress(b).percent-taskProgress(a).percent||Number(b.updatedAtMs||0)-Number(a.updatedAtMs||0))[0]||null;
}

module.exports={TASK_STATUSES,STEP_STATUSES,addStage,buildProjectTask,cleanStep,compactText,completeTask,createId,focusTask,mirrorSteps,setNextAction,taskProgress};
