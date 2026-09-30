const {FieldValue}=require('firebase-admin/firestore');
const {addStage,buildProjectTask,completeTask,createId,focusTask,setNextAction,taskProgress}=require('../domain/task-project');

function millis(value){return value?.toMillis?.()||Number(value)||0;}
function monthKey(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit'}).formatToParts(new Date());
 return `${parts.find(part=>part.type==='year').value}-${parts.find(part=>part.type==='month').value}`;
}
function todayKey(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),part=type=>parts.find(value=>value.type===type).value;
 return `${part('year')}-${part('month')}-${part('day')}`;
}
function publicTask(doc){
 const data=doc.data?doc.data():doc;
 return{id:doc.id||data.id,title:data.title||'Untitled',description:data.description||'',kind:data.kind||'task',status:data.status||'Backlog',activeStepId:data.activeStepId||null,steps:(data.steps||data.subtasks||[]).map((step,index)=>({id:step.id||`legacy_${index}`,title:step.title||step.text||`Step ${index+1}`,status:step.status||(step.done?'Done':'Not Started'),done:Boolean(step.done||step.status==='Done')})),progress:taskProgress(data),updatedAtMs:millis(data.updatedAt)};
}

class InvincibleRepository{
 constructor(db,uid,email=''){this.db=db;this.uid=uid;this.email=String(email||'').toLowerCase();this.userRef=db.collection('users').doc(uid);this.tasksRef=this.userRef.collection('tasks');}
 async listTasks(){const snapshot=await this.tasksRef.get();return snapshot.docs.map(publicTask);}
 async getTaskRecord(identifier){
  const value=String(identifier||'').trim();
  if(value&&!value.includes('/')){const direct=await this.tasksRef.doc(value).get();if(direct.exists)return{id:direct.id,...direct.data()};}
  const snapshot=await this.tasksRef.get(),wanted=value.toLowerCase(),docs=snapshot.docs.map(doc=>({id:doc.id,...doc.data()})),exact=docs.find(task=>String(task.title||'').toLowerCase()===wanted);if(exact)return exact;const partial=docs.filter(task=>String(task.title||'').toLowerCase().includes(wanted));if(partial.length>1)throw Error('Multiple projects match that title. Use the exact project ID.');return partial[0]||null;
 }
 async getTask(identifier){const task=await this.getTaskRecord(identifier);return task?publicTask(task):null;}
 async getProject(identifier){
  const task=await this.getTask(identifier);if(task)return task;const wanted=String(identifier||'').trim().toLowerCase(),projects=await this.listCreatorProjects(),exact=projects.find(project=>project.id===identifier||project.title.toLowerCase()===wanted);if(exact)return exact;const partial=projects.filter(project=>project.title.toLowerCase().includes(wanted));if(partial.length>1)throw Error('Multiple Creator Studio projects match that title. Use the exact project ID.');return partial[0]||null;
 }
 async listCreatorProjects(){
  const owned=this.db.collection('creatorProjects').where('ownerUid','==',this.uid).get(),shared=this.email?this.db.collection('creatorProjects').where('editorEmails','array-contains',this.email).get():Promise.resolve({docs:[]});
  const snapshots=await Promise.all([owned,shared]),merged=new Map();
  snapshots.flatMap(snapshot=>snapshot.docs).forEach(doc=>{const data=doc.data();merged.set(doc.id,{id:doc.id,title:data.title||'Untitled',kind:'creator-project',stage:data.stage||'Ideas',format:data.format||'',sceneCount:Array.isArray(data.scenes)?data.scenes.length:0,completedScenes:Array.isArray(data.scenes)?data.scenes.filter(scene=>scene.completed).length:0,updatedAtMs:millis(data.updatedAt)});});
  return[...merged.values()].sort((a,b)=>b.updatedAtMs-a.updatedAtMs);
 }
 async dashboardState(){
  const [tasks,finance]=await Promise.all([this.listTasks(),this.userRef.collection('finance').doc(monthKey()).get()]),active=[];
  tasks.filter(task=>task.status!=='Done').sort((a,b)=>b.updatedAtMs-a.updatedAtMs).slice(0,20).forEach(task=>active.push(task));
  const focus=focusTask(active),data=finance.exists?finance.data():{},checklist=Array.isArray(data.checklist)?data.checklist:[],bills=Array.isArray(data.bills)?data.bills:[],transactions=Array.isArray(data.transactions)?data.transactions:[],salaryRecorded=transactions.some(item=>item?.type==='income'&&/salary/i.test(String(item?.description||'')));
  return{focus,activeProjects:active,finance:{month:monthKey(),salaryRecorded,checklistDone:checklist.filter(item=>item.done).length,checklistTotal:checklist.length||4,billsPaid:bills.filter(item=>item.paid).length,billsTotal:bills.length}};
 }
 async todayPlan(){
  const dateKey=todayKey(),[snapshot,tasks]=await Promise.all([this.userRef.collection('dailyPlans').doc(dateKey).get(),this.listTasks()]),data=snapshot.exists?snapshot.data():{},references=Array.isArray(data.items)?data.items:[],byId=new Map(tasks.map(task=>[task.id,task]));
  const items=references.map(reference=>{const task=byId.get(reference.taskId),step=reference.stepId?task?.steps.find(value=>value.id===reference.stepId):null,done=reference.stepId?Boolean(step?.done||step?.status==='Done'):task?.status==='Done';return{id:reference.id,taskId:reference.taskId,stepId:reference.stepId||null,title:step?.title||task?.title||'Unavailable item',projectTitle:task?.title||'Missing project',done:Boolean(done),missing:!task||Boolean(reference.stepId&&!step)};});
  const active=items.find(item=>item.id===data.activeItemId&&!item.done&&!item.missing)||items.find(item=>!item.done&&!item.missing)||null;
  return{dateKey,items,activeItem:active};
 }
 async addToTodayPlan(identifier,stageTitle,makeActive=true){
  const task=await this.getTask(identifier);if(!task)throw Error('Project or task not found.');const wanted=String(stageTitle||'').trim().toLowerCase(),available=task.steps.filter(step=>!step.done&&step.status!=='Done');let step=wanted?task.steps.find(value=>value.id===stageTitle||value.title.toLowerCase()===wanted):available[0];if(wanted&&!step)throw Error(`Stage “${stageTitle}” was not found.`);if(step?.done)throw Error(`Stage “${step.title}” is already complete.`);
  const dateKey=todayKey(),ref=this.userRef.collection('dailyPlans').doc(dateKey),id=`${task.id}__${step?.id||'task'}`;await this.db.runTransaction(async transaction=>{const snapshot=await transaction.get(ref),current=snapshot.exists?snapshot.data():{},items=Array.isArray(current.items)?current.items:[],nextItems=items.some(item=>item.id===id)?items:[...items,{id,taskId:task.id,stepId:step?.id||null,addedAt:Date.now()}];transaction.set(ref,{dateKey,initialized:true,items:nextItems,activeItemId:makeActive||!current.activeItemId?id:current.activeItemId,updatedAt:FieldValue.serverTimestamp()},{merge:true})});return{dateKey,item:{id,taskId:task.id,stepId:step?.id||null,title:step?.title||task.title,projectTitle:task.title},active:makeActive};
 }
 async demoteOtherFocus(batch,exceptId){
  const snapshot=await this.tasksRef.where('status','==','Today').get();snapshot.docs.filter(doc=>doc.id!==exceptId).forEach(doc=>batch.set(doc.ref,{status:'In Progress',updatedAt:FieldValue.serverTimestamp()},{merge:true}));
 }
 async createProject(args){
  const task=buildProjectTask(args),ref=this.tasksRef.doc(task.id),batch=this.db.batch();await this.demoteOtherFocus(batch,task.id);batch.set(ref,{...task,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});await batch.commit();return publicTask({id:task.id,data:()=>task});
 }
 async createTask({title,description,status,steps}){
  const current=status==='Today',task=buildProjectTask({title,description,stages:steps,currentStage:current?steps[0]:null});task.id=createId('task');task.kind='task';task.status=status;if(status!=='Today'&&task.steps[0]){task.steps[0].status='Not Started';task.activeStepId=task.steps[0].id;task.subtasks=task.steps.map(step=>({text:step.title,done:step.done}));}
  const batch=this.db.batch();if(current)await this.demoteOtherFocus(batch,task.id);batch.set(this.tasksRef.doc(task.id),{...task,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});await batch.commit();return publicTask({id:task.id,data:()=>task});
 }
 async updateTask(identifier,patch){
  const task=await this.getTask(identifier);if(!task)throw Error('Task or project not found.');const allowed={};for(const key of ['title','description','status'])if(patch[key]!=null)allowed[key]=patch[key];const batch=this.db.batch();if(allowed.status==='Today')await this.demoteOtherFocus(batch,task.id);batch.set(this.tasksRef.doc(task.id),{...allowed,updatedAt:FieldValue.serverTimestamp()},{merge:true});await batch.commit();return{...task,...allowed};
 }
 async createStage(identifier,title,afterStage){
  const task=await this.getTaskRecord(identifier);if(!task)throw Error('Project not found.');const patch=addStage(task,title,afterStage);await this.tasksRef.doc(task.id).set({...patch,updatedAt:FieldValue.serverTimestamp()},{merge:true});return publicTask({...task,...patch});
 }
 async completeTask(identifier){
  const task=await this.getTaskRecord(identifier);if(!task)throw Error('Task not found.');const patch=completeTask(task);await this.tasksRef.doc(task.id).set({...patch,completedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true});return publicTask({...task,...patch});
 }
 async setNextAction(identifier,stageTitle,completeCurrent){
  const task=await this.getTaskRecord(identifier);if(!task)throw Error('Project not found.');const patch=setNextAction(task,stageTitle,completeCurrent),batch=this.db.batch();await this.demoteOtherFocus(batch,task.id);batch.set(this.tasksRef.doc(task.id),{...patch,updatedAt:FieldValue.serverTimestamp()},{merge:true});await batch.commit();return publicTask({...task,...patch});
 }
 async contextSnapshot(){
  const [dashboard,creator,todayPlan]=await Promise.all([this.dashboardState(),this.listCreatorProjects(),this.todayPlan()]);
  return{currentFocus:todayPlan.activeItem||dashboard.focus,todayPlan,activeDashboardProjects:dashboard.activeProjects.slice(0,10),creatorProjects:creator.filter(project=>project.stage!=='Published').slice(0,8),finance:dashboard.finance};
 }
}

module.exports={InvincibleRepository,publicTask};
