const {z}=require('zod');
const {TASK_STATUSES}=require('../domain/task-project');

const nullableString={type:['string','null']};
const emptyParameters={type:'object',properties:{},required:[],additionalProperties:false};
const tool=(name,description,parameters)=>({type:'function',name,description,parameters,strict:true});

const definitions=[
 tool('get_dashboard_state','Get the current Focus item, active Dashboard projects, and monthly Finance completion summary.',emptyParameters),
 tool('get_today_plan','Get today’s cross-project plan and its active sub-task.',emptyParameters),
 tool('get_projects','List active Invincible Dashboard projects and optionally Creator Studio project summaries.',{type:'object',properties:{include_creator:{type:'boolean'}},required:['include_creator'],additionalProperties:false}),
 tool('get_project','Get one project by ID or title. Supply exactly one identifier when possible.',{type:'object',properties:{project_id:nullableString,title:nullableString},required:['project_id','title'],additionalProperties:false}),
 tool('create_project','Create a Dashboard project using the existing Invincible task and steps structure.',{type:'object',properties:{title:{type:'string'},description:nullableString,stages:{type:'array',items:{type:'string'},minItems:1,maxItems:30},current_stage:nullableString},required:['title','description','stages','current_stage'],additionalProperties:false}),
 tool('update_project','Update allow-listed project fields. This cannot delete a project or overwrite its stages.',{type:'object',properties:{project_id:{type:'string'},title:nullableString,description:nullableString,status:{type:['string','null'],enum:[...TASK_STATUSES,null]}},required:['project_id','title','description','status'],additionalProperties:false}),
 tool('create_stage','Add one stage to an existing Dashboard project.',{type:'object',properties:{project_id:{type:'string'},title:{type:'string'},after_stage:nullableString},required:['project_id','title','after_stage'],additionalProperties:false}),
 tool('create_task','Create a normal Dashboard task with optional ordered steps.',{type:'object',properties:{title:{type:'string'},description:nullableString,status:{type:'string',enum:TASK_STATUSES},steps:{type:'array',items:{type:'string'},maxItems:30}},required:['title','description','status','steps'],additionalProperties:false}),
 tool('add_to_today_plan','Add one existing project stage or task to today’s plan. Use a project ID when known; otherwise use its exact title.',{type:'object',properties:{project_id:nullableString,title:nullableString,stage_title:nullableString,make_active:{type:'boolean'}},required:['project_id','title','stage_title','make_active'],additionalProperties:false}),
 tool('update_task','Update allow-listed task fields.',{type:'object',properties:{task_id:{type:'string'},title:nullableString,description:nullableString,status:{type:['string','null'],enum:[...TASK_STATUSES,null]}},required:['task_id','title','description','status'],additionalProperties:false}),
 tool('complete_task','Mark an entire task or project complete.',{type:'object',properties:{task_id:{type:'string'}},required:['task_id'],additionalProperties:false}),
 tool('set_next_action','Activate a project stage and optionally complete the previously active stage. Also makes the project the Dashboard Focus item.',{type:'object',properties:{project_id:{type:'string'},stage_title:{type:'string'},complete_current:{type:'boolean'}},required:['project_id','stage_title','complete_current'],additionalProperties:false}),
 tool('get_current_focus','Get the task currently selected by the same priority rules as the Dashboard.',emptyParameters)
];

const optionalText=z.string().trim().max(2000).nullable();
const identifier=z.string().trim().min(1).max(160);
const schemas={
 get_dashboard_state:z.object({}).strict(),
 get_today_plan:z.object({}).strict(),
 get_projects:z.object({include_creator:z.boolean()}).strict(),
 get_project:z.object({project_id:z.string().trim().max(160).nullable(),title:z.string().trim().max(120).nullable()}).strict().refine(value=>value.project_id||value.title,'A project ID or title is required.'),
 create_project:z.object({title:z.string().trim().min(1).max(120),description:optionalText,stages:z.array(z.string().trim().min(1).max(120)).min(1).max(30),current_stage:z.string().trim().max(120).nullable()}).strict(),
 update_project:z.object({project_id:identifier,title:z.string().trim().min(1).max(120).nullable(),description:optionalText,status:z.enum(TASK_STATUSES).nullable()}).strict(),
 create_stage:z.object({project_id:identifier,title:z.string().trim().min(1).max(120),after_stage:z.string().trim().max(120).nullable()}).strict(),
 create_task:z.object({title:z.string().trim().min(1).max(120),description:optionalText,status:z.enum(TASK_STATUSES),steps:z.array(z.string().trim().min(1).max(120)).max(30)}).strict(),
 add_to_today_plan:z.object({project_id:z.string().trim().max(160).nullable(),title:z.string().trim().max(120).nullable(),stage_title:z.string().trim().max(120).nullable(),make_active:z.boolean()}).strict().refine(value=>value.project_id||value.title,'A project ID or title is required.'),
 update_task:z.object({task_id:identifier,title:z.string().trim().min(1).max(120).nullable(),description:optionalText,status:z.enum(TASK_STATUSES).nullable()}).strict(),
 complete_task:z.object({task_id:identifier}).strict(),
 set_next_action:z.object({project_id:identifier,stage_title:z.string().trim().min(1).max(120),complete_current:z.boolean()}).strict(),
 get_current_focus:z.object({}).strict()
};

function summary(name,result){
 if(name==='create_project')return `Created project “${result.title}” with ${result.steps.length} stages.`;
 if(name==='create_task')return `Created task “${result.title}”.`;
 if(name==='add_to_today_plan')return `Added “${result.item.title}” from “${result.item.projectTitle}” to today’s plan${result.active?' and made it active':''}.`;
 if(name==='create_stage')return `Added a stage to “${result.title}”.`;
 if(name==='set_next_action')return `Set “${result.steps.find(step=>step.id===result.activeStepId)?.title}” as the next action for “${result.title}”.`;
 if(name==='complete_task')return `Completed “${result.title}”.`;
 if(name.startsWith('update_'))return `Updated “${result.title}”.`;
 return `Read ${name.replaceAll('_',' ')}.`;
}

async function executeInvincibleTool(repository,name,rawArgs){
 const schema=schemas[name];if(!schema)throw Error(`Unknown tool: ${name}`);const args=schema.parse(rawArgs),read=name.startsWith('get_');let result;
 switch(name){
  case'get_dashboard_state':result=await repository.dashboardState();break;
  case'get_today_plan':result=await repository.todayPlan();break;
  case'get_projects':{const tasks=await repository.listTasks();result={dashboard:tasks.filter(task=>task.status!=='Done').slice(0,25),creator:args.include_creator?(await repository.listCreatorProjects()).slice(0,20):[]};break;}
  case'get_project':result=await repository.getProject(args.project_id||args.title);if(!result)throw Error('Project not found.');break;
  case'create_project':result=await repository.createProject({...args,description:args.description||'',currentStage:args.current_stage});break;
  case'update_project':result=await repository.updateTask(args.project_id,args);break;
  case'create_stage':result=await repository.createStage(args.project_id,args.title,args.after_stage);break;
  case'create_task':result=await repository.createTask({...args,description:args.description||''});break;
  case'add_to_today_plan':result=await repository.addToTodayPlan(args.project_id||args.title,args.stage_title,args.make_active);break;
  case'update_task':result=await repository.updateTask(args.task_id,args);break;
  case'complete_task':result=await repository.completeTask(args.task_id);break;
  case'set_next_action':result=await repository.setNextAction(args.project_id,args.stage_title,args.complete_current);break;
  case'get_current_focus':result=(await repository.dashboardState()).focus;break;
 }
 return{result,action:{tool:name,status:read?'read':'completed',summary:summary(name,result||{})}};
}

module.exports={definitions,executeInvincibleTool,schemas};
