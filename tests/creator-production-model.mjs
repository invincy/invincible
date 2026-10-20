import test from "node:test";
import assert from "node:assert/strict";
import{buildCanonicalScript,findDuplicates,makeProductionScene,normalizeMethods,parseProductionStoryboard,projectProgress,sceneIsComplete}from"../creator/production-model.js";

test("imports the four-column Gaganyaan TSV format with Unicode and timeline order",()=>{
 const header="Voiceover\tVisual / Animation\tAssets Required\tTimeline\n";
 const rows=Array.from({length:16},(_,index)=>'"दृश्य '+(index+1)+'\nSecond line"\tCamera '+(index+1)+'\tLVM3 model\t'+(index*5)+"–"+((index+1)*5)+"s").join("\n");
 const result=parseProductionStoryboard(header+rows);
 assert.equal(result.format,"tsv");assert.equal(result.scenes.length,16);
 assert.equal(result.scenes[0].voiceover,"दृश्य 1\nSecond line");assert.equal(result.scenes[15].timeline,"75–80s");
 assert.equal(result.scenes.reduce((sum,scene)=>sum+scene.duration,0),80);
});

test("imports the six-column Markdown format and richer optional production fields",()=>{
 const table="| Scene | Duration | Voiceover | Character Prompt | Image Prompt | Video Prompt | Production Method | Status | Animation Group | Blender Prompt |\n|---|---|---|---|---|---|---|---|---|---|\n| 8 | 7 sec | Exact narration | — | Technical still | Camera orbit | Blender + Editing | Editing | Upper Assembly | Animate modules |";
 const scene=parseProductionStoryboard(table).scenes[0];
 assert.equal(scene.sourceSceneNumber,"8");assert.equal(scene.duration,7);assert.equal(scene.imagePrompt,"Technical still");assert.deepEqual(scene.productionMethods,["Blender","Editing"]);assert.equal(scene.animationGroup,"Upper Assembly");assert.equal(scene.blenderPrompt,"Animate modules");
});

test("supports manual column mapping and voiceover-only projects",()=>{
 const mapped=parseProductionStoryboard("Words\tSeconds\nHello world\t6",{mapping:{voiceover:0,duration:1}}).scenes[0];
 assert.equal(mapped.voiceover,"Hello world");assert.equal(mapped.duration,6);
 const voice=parseProductionStoryboard("First paragraph.\n\nदूसरा paragraph.");
 assert.equal(voice.format,"voiceover");assert.equal(voice.scenes.length,2);
});

test("normalizes legacy scenes without destroying existing fields",()=>{
 const legacy={id:"old",voiceover:"Keep me",completed:true,imageDone:true,custom:{keep:true}};
 const scene=makeProductionScene(legacy);
 assert.equal(scene.id,"old");assert.equal(scene.sceneStatus,"Completed");assert.equal(scene.imageDone,true);assert.deepEqual(scene.custom,{keep:true});
 assert.equal(buildCanonicalScript([scene,{voiceover:"Next"}]),"Keep me\n\nNext");
});

test("multi-method scenes appear in each workflow and completion remains independent",()=>{
 assert.deepEqual(normalizeMethods("Blender + AI Video + Editing"),["Blender","AI Video","Editing"]);
 const scene=makeProductionScene({productionMethods:["Blender","Editing"],sceneStatus:"Completed",workflowProgress:{Blender:"Ready",Editing:"Rendering"},productionChecklist:{editingComplete:false}});
 assert.equal(sceneIsComplete(scene),false);
 scene.workflowProgress.Editing="Ready";scene.productionChecklist.editingComplete=true;
 assert.equal(sceneIsComplete(scene),true);
});

test("duplicate detection protects append imports and weighted progress uses task state",()=>{
 const existing=[makeProductionScene({voiceover:"Same",timeline:"0–5s",visual:"Rocket"})];
 const incoming=[makeProductionScene({voiceover:"Same",timeline:"0–5s",visual:"Rocket"}),makeProductionScene({voiceover:"New",timeline:"5–10s"})];
 assert.deepEqual(findDuplicates(incoming,existing),[0]);
 const project={scenes:[makeProductionScene({productionMethods:["Blender"],sceneStatus:"Completed",workflowProgress:{Blender:"Ready"}})]};
 assert.equal(projectProgress(project),100);
});
