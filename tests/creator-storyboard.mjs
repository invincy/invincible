import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSceneInput,inspectScenes} from '../creator/scene-tools.js';
import {makeScene,parseStoryboard,storyboardDuration} from '../creator/storyboard-model.js';
const headers='Voiceover\tVisual/Animation\tAssets\tDuration\n';
test('storyboard imports TSV, reordered headers, Unicode, blank cells and literal pipes',()=>{
 const scenes=parseStoryboard('\uFEFF'+headers+'ગુજરાતી voice | one\tPan\tphoto.png\t8 sec\r\nSecond\t\t\t0:09\r\n');
 assert.equal(scenes.length,2);assert.equal(scenes[0].voiceover,'ગુજરાતી voice | one');assert.equal(scenes[1].duration,9);
 assert.equal(scenes[1].assets,'');assert.notEqual(scenes[0].id,scenes[1].id);
 assert.equal(parseStoryboard('Duration\tAssets\tVoiceover\tVisual/Animation\n7\timg\tLine\tZoom')[0].visual,'Zoom');
 assert.equal(parseStoryboard('Line\tPan\t\t')[0].duration,5);
});
test('quoted TSV retains multiline narration, tabs and doubled quotes',()=>{
 const scene=parseStoryboard(headers+'"First\nSecond ""quoted"""\t"Pan\tleft"\t\t6')[0];
 assert.equal(scene.voiceover,'First\nSecond "quoted"');assert.equal(scene.visual,'Pan\tleft');
 const fenced='```tsv\n'+headers+'Line\tPan\t\t6\n```';assert.equal(parseStoryboard(fenced)[0].duration,6);
});
test('malformed table or duration never imports partial or silently truncated rows',()=>{
 for(const value of ['',headers,headers+'one\ttwo',headers+'one\ttwo\tthree\t8\textra',headers+'one\ttwo\tthree\tbad',headers+'one\ttwo\tthree\t0',headers+'"incomplete', 'Voiceover\tAssets\nLine\tfile'])assert.throws(()=>parseStoryboard(value));
 for(const value of ['2-5','1:99','61','-2','Infinity'])assert.throws(()=>storyboardDuration(value));
 assert.equal(storyboardDuration('1:00'),60);assert.equal(storyboardDuration('2.5 sec'),2.5);
});
test('scene normalization preserves legacy fields and additive storyboard data through round trip',()=>{
 const old={id:'original',voiceover:'Exact text',duration:8,imagePrompt:'Existing image prompt',videoPrompt:'Existing motion',completed:true,imageDone:true,imageAssetUrl:'https://example.com/img',custom:{keep:true}};
 const scene=makeScene({...old,visual:'Storyboard direction',assets:'Footage'});
 for(const key of Object.keys(old))assert.deepEqual(scene[key],old[key]);
 const restored=makeScene(JSON.parse(JSON.stringify(scene)));assert.deepEqual(restored,scene);
 assert.equal(makeScene(old).visual,'');assert.equal(makeScene(old).assets,'');
});

test('advanced prompt imports still normalize into the existing production workflow',()=>{
 const scenes=parseSceneInput('| Voiceover | Image Prompt | Video Prompt | Duration |\n|---|---|---|---|\n| Original line | Existing still | Existing motion | 8 |',makeScene);
 assert.deepEqual(inspectScenes(scenes),[]);assert.equal(scenes[0].imagePrompt,'Existing still');assert.equal(scenes[0].visual,'');
});
