import test from 'node:test';
import assert from 'node:assert/strict';
import {makeScene} from '../creator/storyboard-model.js';
import {parseProductionImport,inspectImport,uniqueScenes,methodsOf,queueScenes,setTask,taskFor,canComplete,sceneComplete,sceneState,projectProgress,canonicalScript,scriptReview,filterScenes,productionReadiness} from '../creator/production-model.js';
const header='Voiceover\tVisual / Animation\tAssets Required\tTimeline';
const storyboard=header+'\n'+Array.from({length:16},(_,i)=>'भारत का मिशन '+(i+1)+'!\tRocket visual '+i+'\tLVM3 model\t'+(i*4)+'–'+(i*4+4)+'s').join('\n');
test('16-scene Gaganyaan TSV preserves exact order, Hindi, punctuation and timeline',()=>{
 const scenes=parseProductionImport(storyboard);
 assert.equal(scenes.length,16);assert.equal(scenes[15].voiceover,'भारत का मिशन 16!');
 assert.equal(scenes.reduce((n,s)=>n+s.duration,0),64);
 assert.equal(scenes[0].timeline,'0–4s');assert.equal(scenes[15].timeline,'60–64s');
});
test('quoted multiline TSV and Markdown six-column import preserve narration and prompts',()=>{
 const a=parseProductionImport(header+'\n"First\nSecond ""quoted"" | voice"\t"Pan\tleft"\tmodel\t7')[0];
 assert.equal(a.voiceover,'First\nSecond "quoted" | voice');assert.equal(a.visual,'Pan\tleft');
 const b=parseProductionImport('| Scene | Duration | Voiceover | Character Prompt | Image Prompt | Video Prompt |\n|---|---|---|---|---|---|\n| 1 | 8 sec | भारत!<br>Space \\| moon | Astronaut | Image | Motion |')[0];
 assert.equal(b.voiceover,'भारत!\nSpace | moon');assert.equal(b.videoPrompt,'Motion');assert.equal(b.duration,8);
});
test('richer columns import mixed methods, groups and Blender prompts without completing scenes',()=>{
 const scene=parseProductionImport(header+'\tProduction Method\tStatus\tAnimation Group\tBlender Prompt\nLine\tPan\tModel\t4\tBlender; AI Video\tCompleted\tUpper assembly\tCreate animation')[0];
 assert.deepEqual(scene.productionMethods,['Blender','AI Video']);assert.equal(scene.animationGroup,'Upper assembly');
 assert.equal(scene.blenderPrompt,'Create animation');assert.equal(scene.completed,false);assert.equal(scene.importedStatus,'Completed');
 assert.deepEqual(methodsOf({productionMethod:'Mixed'}),['Blender','AI Video','Editing']);
});
test('column mapping and voiceover-only imports work without AI; malformed imports are atomic',()=>{
 const input='Words\tView\tResources\tTiming\nExact\tPan\tModel\t6';
 assert.equal(inspectImport(input).rows.length,1);
 assert.equal(parseProductionImport(input,['voiceover','visual','assets','duration'])[0].voiceover,'Exact');
 assert.equal(parseProductionImport('Plain Hindi narration\nअगला दृश्य।').length,2);
 for(const value of [header+'\nshort\trow',header+'\nLine\tPan\tModel\tbad',header+'\n"unclosed'])assert.throws(()=>parseProductionImport(value));
 assert.throws(()=>parseProductionImport(input,['voiceover','voiceover','assets','duration']));
});
test('duplicate prevention skips existing and repeated incoming rows while retaining different visual plans',()=>{
 const scenes=parseProductionImport(storyboard),again=parseProductionImport(storyboard);
 assert.equal(uniqueScenes(scenes,again).duplicates,16);
 const result=uniqueScenes([], [scenes[0],scenes[0],{...scenes[0],visual:'different'}]);assert.equal(result.scenes.length,2);
 assert.equal(uniqueScenes([scenes[0]],[{...scenes[0],assets:'Different required model'}]).scenes.length,1);
 assert.equal(uniqueScenes([scenes[0]],[{...scenes[0],blenderPrompt:'Different animation prompt'}]).scenes.length,1);
});
test('workflow queues share scene identities and mixed scenes appear in all relevant workspaces',()=>{
 const a=makeScene({productionMethods:['Blender','AI Video']}),b=makeScene({productionMethods:['AI Video']});
 const project={scenes:[a,b]};
 assert.deepEqual(queueScenes(project,'Blender'),[a]);assert.deepEqual(queueScenes(project,'AI Video'),[a,b]);
 assert.deepEqual(queueScenes(project,'Editing'),[a,b]);assert.equal(queueScenes(project,'All').length,2);
});
test('animation projects share Blender tasks, while scene completion stays independent',()=>{
 const a=makeScene({animationGroupId:'g',productionMethods:['Blender'],sceneState:'Planned'}),b=makeScene({animationGroupId:'g',productionMethods:['Blender'],sceneState:'Planned'});
 const project={scenes:[a,b],animationGroups:[{id:'g',production:{}}]};
 for(const phase of ['started','modeling','animation','rendering','ready']){setTask(project,a,'Blender',{[phase]:true});assert.equal(taskFor(project,b,'Blender')[phase],true);assert.equal(a.completed,false);}
 assert.equal(canComplete(project,a),false);
 a.voiceoverReady=true;a.editingDone=true;assert.equal(canComplete(project,a),true);
 assert.equal(canComplete(project,b),false);a.completed=true;assert.equal(sceneState(project,a),'Completed');
 assert.equal(sceneState(project,b),'Assets Ready');assert.ok(projectProgress(project)>0&&projectProgress(project)<100);
});
test('registered shared assets and production checklists are required for completion',()=>{
 const scene=makeScene({productionMethods:['AI Video'],voiceoverReady:true,editingDone:true,checklist:[{text:'Check audio',done:false}]});
 const project={scenes:[scene],assets:[{id:'asset',name:'Clip',sceneIds:[scene.id],status:'In Progress'}]};
 setTask(project,scene,'AI Video',{ready:true});assert.equal(canComplete(project,scene),false);
 scene.checklist[0].done=true;project.assets[0].status='Ready';assert.equal(canComplete(project,scene),true);
 scene.completed=true;assert.equal(projectProgress(project),100);setTask(project,scene,'AI Video',{ready:false});assert.equal(sceneComplete(project,scene),false);
});
test('canonical script is chronological and synchronization creates a review without mutating scenes',()=>{
 const scenes=parseProductionImport(storyboard).slice(0,2),project={scenes,script:'Manual draft'};
 const before=scenes[0].voiceover;assert.equal(canonicalScript(project),scenes.map(s=>s.voiceover).join('\n\n'));
 const review=scriptReview(project,'Changed first\n\nChanged second');assert.equal(review[0].changed,true);assert.equal(scenes[0].voiceover,before);
 assert.throws(()=>scriptReview(project,'One paragraph'));assert.equal(project.script,'Manual draft');
});
test('legacy scenes, unknown metadata, local Windows references and progress survive JSON round trip',()=>{
 const scene=makeScene({id:'old',voiceover:'Exact',completed:true,imageDone:true,imageAssetUrl:'https://example.com/image',custom:{keep:1}});
 assert.equal(sceneComplete({scenes:[scene]},scene),true);
 const project={notes:'Keep',hook:'Hook',assets:[{path:'E:\\3D\\MY\\Gaganyaan\\upper.blend'}],scenes:[scene]};
 const restored=JSON.parse(JSON.stringify(project));assert.equal(restored.scenes[0].custom.keep,1);assert.equal(restored.assets[0].path,project.assets[0].path);
});

test('combined Blender/Ready filters retain original scene identities and independent completion',()=>{
 const a=makeScene({id:'s8',voiceover:'Shared rocket',productionMethods:['Blender','AI Video'],animationGroupId:'g'});
 const b=makeScene({id:'s9',voiceover:'AI shot',productionMethods:['AI Video']});
 const c=makeScene({id:'s11',voiceover:'Shared cutaway',productionMethods:['Blender'],animationGroupId:'g'});
 const project={scenes:[a,b,c],animationGroups:[{id:'g',blenderFile:'E:\\3D\\upper.blend',production:{modeling:true,animation:true,rendering:true,ready:true}}]};
 assert.deepEqual(filterScenes(project,{method:'Blender',assetStatus:'Ready'}).map(scene=>scene.id),['s8','s11']);
 assert.equal(a.completed,false);assert.equal(productionReadiness(project,a,'All'),'In Progress');
 assert.equal(filterScenes(project,{method:'AI Video',assetStatus:'Ready'}).length,0);
 assert.equal(filterScenes(project,{method:'Blender',assetStatus:'Ready',query:'upper.blend'}).length,2);
 assert.equal(filterScenes(project,{method:'Blender',assetStatus:'Ready',completion:'Completed'}).length,0);
});
test('the unified importer preserves JSON scene-array support',()=>{
 const [scene]=parseProductionImport(JSON.stringify({scenes:[{voiceover:'Exact Hindi भारत।',duration:8,imagePrompt:'Still',videoPrompt:'Motion',productionMethods:['Blender','AI Video']}]}));
 assert.equal(scene.voiceover,'Exact Hindi भारत।');assert.equal(scene.videoPrompt,'Motion');assert.deepEqual(scene.productionMethods,['Blender','AI Video']);
});

test('a final Timestamp column preserves recorded voiceover time separately from the planned timeline',()=>{
 const exact='00:31.250–00:40.800';
 const input=header+'\tTimestamp\n"भारत — exact narration!\nHuman-Rated LVM3।"\tRocket reveal\tLVM3\t31–40s\t'+exact;
 const table=inspectImport(input);assert.equal(table.mapping.at(-1),'voiceoverTimestamp');
 const [scene]=parseProductionImport(input);
 assert.equal(scene.voiceoverTimestamp,exact);assert.equal(scene.timeline,'31–40s');assert.equal(scene.duration,9);
 assert.equal(scene.voiceover,'भारत — exact narration!\nHuman-Rated LVM3।');
 assert.equal(canonicalScript({scenes:[scene]}),scene.voiceover);
 assert.equal(makeScene(JSON.parse(JSON.stringify(scene))).voiceoverTimestamp,exact);
 const other={...scene,voiceoverTimestamp:'00:40.800–00:50.350'};
 assert.equal(uniqueScenes([scene],[{...scene},other]).duplicates,1);
 assert.equal(uniqueScenes([scene],[other]).scenes.length,1);
 assert.equal(filterScenes({scenes:[scene]},{query:'00:31.250'}).length,1);
});
test('Markdown prompt tables and headerless five-column TSV accept a final timestamp',()=>{
 const markdown='| Scene | Duration | Voiceover | Character Prompt | Image Prompt | Video Prompt | Timestamp |\n| --- | --- | --- | --- | --- | --- | --- |\n| 1 | 8 | भारत!<br>Space | Person | Moon | Motion | 01:01.345 – 01:09.123 |';
 const [scene]=parseProductionImport(markdown);
 assert.equal(scene.voiceoverTimestamp,'01:01.345 – 01:09.123');assert.equal(scene.duration,8);
 assert.equal(scene.voiceover,'भारत!\nSpace');assert.equal(scene.videoPrompt,'Motion');
 const [positional]=parseProductionImport('Narration\tVisual\tModel\t0–4s\t00:00.120–00:04.480');
 assert.equal(positional.voiceoverTimestamp,'00:00.120–00:04.480');assert.equal(positional.timeline,'0–4s');
});
test('timestamp aliases, manual mapping, old tables and legacy scenes remain compatible',()=>{
 for(const label of ['Timestamp','Timestamps','Voiceover timestamp','Audio timecode','VO timestamp']){
  const [scene]=parseProductionImport('Voiceover\t'+label+'\nExact\t00:03.725');
  assert.equal(scene.voiceoverTimestamp,'00:03.725');
 }
 const custom='Narration\tVisual\tAssets\tLength\tAudio alignment\nExact\tCamera\tModel\t4\t00:00.200–00:04.600';
 const [mapped]=parseProductionImport(custom,['voiceover','visual','assets','duration','voiceoverTimestamp']);
 assert.equal(mapped.voiceoverTimestamp,'00:00.200–00:04.600');
 assert.equal(parseProductionImport(storyboard)[0].voiceoverTimestamp,'');
 const legacy=makeScene({id:'old',voiceover:'Keep',timeline:'0–4s',completed:true,custom:{keep:true}});
 assert.equal(legacy.voiceoverTimestamp,'');assert.equal(legacy.completed,true);assert.equal(legacy.id,'old');assert.equal(legacy.custom.keep,true);
});
