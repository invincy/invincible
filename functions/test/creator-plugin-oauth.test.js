const test=require('node:test');
const assert=require('node:assert/strict');
const oauth=require('../src/creator/plugin-oauth');
const plugin=require('../src/creator/plugin-cloud');

test('plugin OAuth accepts only supported ChatGPT redirect hosts',()=>{
 assert.equal(oauth.allowedRedirectUri('https://chatgpt.com/connector/callback'),true);
 assert.equal(oauth.allowedRedirectUri('https://sub.openai.com/oauth/callback'),true);
 assert.equal(oauth.allowedRedirectUri('http://127.0.0.1:49152/callback'),true);
 assert.equal(oauth.allowedRedirectUri('http://[::1]:49152/callback'),true);
 assert.equal(oauth.allowedRedirectUri('https://chatgpt.com.evil.example/callback'),false);
 assert.equal(oauth.allowedRedirectUri('http://chatgpt.com/callback'),false);
});

test('plugin OAuth requires exact resource, redirect and PKCE S256',()=>{
 const client={redirectUris:['https://chatgpt.com/callback']},resource='https://example.test/mcp',codeChallenge='A'.repeat(43);
 const valid=oauth.validateAuthorizationRequest({response_type:'code',client_id:'client',redirect_uri:client.redirectUris[0],state:'state',code_challenge:codeChallenge,code_challenge_method:'S256',resource,scope:'creator.read creator.compile'},{client,resourceUrl:resource});
 assert.equal(valid.resource,resource);
 const request={response_type:'code',client_id:'client',redirect_uri:client.redirectUris[0],state:'state',code_challenge:codeChallenge,code_challenge_method:'S256',resource,scope:'creator.read creator.compile'};
 assert.throws(()=>oauth.validateAuthorizationRequest({...request,code_challenge_method:'plain'},{client,resourceUrl:resource}),/PKCE/);
 assert.throws(()=>oauth.validateAuthorizationRequest({...request,resource:'https://evil.test/mcp'},{client,resourceUrl:resource}),/resource/);
});

test('plugin OAuth metadata advertises authorization code with refresh and PKCE',()=>{
 const metadata=oauth.authorizationServerMetadata('https://auth.example.test');
 assert.deepEqual(metadata.grant_types_supported,['authorization_code','refresh_token']);
 assert.deepEqual(metadata.code_challenge_methods_supported,['S256']);
 assert.deepEqual(metadata.scopes_supported,['creator.read','creator.compile','creator.write']);
 assert.equal(metadata.authorization_response_iss_parameter_supported,true);
});

test('plugin apply requires explicit confirmation and preserves compiled timing',()=>{
 assert.throws(()=>plugin.applyInput.parse({}),/Invalid input/);
 const scenes=plugin.creatorScenes({creatorStudio:{scenes:[{id:'scene-1',startSeconds:0,endSeconds:.8,durationSeconds:.8,voiceoverTimestamp:'0.000-0.800s'}]}});
 assert.equal(scenes[0].startSeconds,0);assert.equal(scenes[0].endSeconds,.8);assert.equal(scenes[0].voiceoverTimestamp,'0.000-0.800s');assert.equal(scenes[0].duration,1);
});

test('plugin scene patches replace only matching timed scenes',()=>{
 const existing=[
  {id:'scene-1',sourceSegmentIds:['segment-1'],visual:'old one'},
  {id:'scene-2',sourceSegmentIds:['segment-2'],visual:'old two'},
  {id:'scene-3',sourceSegmentIds:['segment-3'],visual:'old three'}
 ];
 const patch=[{id:'scene-1',sourceSegmentIds:['segment-1'],visual:'new one'}];
 const merged=plugin.mergeScenePatch(existing,patch);
 assert.deepEqual(merged.map(scene=>scene.visual),['new one','old two','old three']);
 assert.throws(()=>plugin.mergeScenePatch(existing,[{id:'scene-9',sourceSegmentIds:['segment-9']}]),/not present/);
 const transcript={duration:3,segments:[{id:'segment-1',start:0,end:1,text:'one'},{id:'segment-2',start:1,end:2,text:'two'},{id:'segment-3',start:2,end:3,text:'three'}]};
 const partial=plugin.transcriptForPlan(transcript,{scenes:[{sourceSegmentId:'segment-1'}]});
 assert.deepEqual(partial.segments.map(segment=>segment.id),['segment-1']);
});

test('Motion Studio scene patch merge preserves stable IDs and rejects unsafe array replacement',()=>{
 const base={id:'scene-6',overlays:[{id:'hemу',assetId:'cloud-a'.padEnd(71,'0')},{id:'terrain',assetId:'cloud-b'.padEnd(71,'0')}],visual:{camera:'top'}};
 const merged=plugin.mergeDraftValue(base,{visual:{camera:'isometric'},overlays:[{id:'hemу',opacity:.9}]});
 assert.equal(merged.id,base.id);
 assert.equal(merged.visual.camera,'isometric');
 assert.equal(merged.overlays.length,2);
 assert.equal(merged.overlays[0].opacity,.9);
 assert.throws(()=>plugin.mergeDraftValue(base,{overlays:[{assetId:'cloud-new'}]}),/use \{\$replace/);
 assert.throws(()=>plugin.mergeDraftValue(base,JSON.parse('{"__proto__":{"polluted":true}}')),/Unsafe patch key/);
});

test('Motion Studio manifest validation protects timing and asset references',()=>{
 const manifest={schemaVersion:1,assets:[{id:'cloud-'+ 'a'.repeat(64)}],scenes:[{id:'scene-1',engineType:'battlefield',startSeconds:0,durationSeconds:2,overlays:[{assetId:'cloud-'+ 'a'.repeat(64)}]}]};
 assert.equal(plugin.validateVideoManifest(manifest),manifest);
 assert.throws(()=>plugin.validateVideoManifest({...manifest,scenes:[{...manifest.scenes[0],overlays:[{assetId:'missing'}]}]}),/missing asset/);
 assert.throws(()=>plugin.validateVideoManifest({...manifest,scenes:[{...manifest.scenes[0],startSeconds:-1}]}),/timing/);
});

test('plugin reads a resolved map scene and edits only that scene',()=>{
 const manifest={schemaVersion:2,assets:[],mapSources:[{id:'india-map',project:{camera:{zoom:4},visual:{layers:[{id:'rain-band',opacity:.4}]}}}],scenes:[
  {id:'scene-1',engineType:'map',startSeconds:0,durationSeconds:2,engineData:{sourceId:'india-map'},overlays:[{id:'title',type:'text',text:'Rain'}]},
  {id:'scene-2',engineType:'map',startSeconds:2,durationSeconds:2,engineData:{sourceId:'india-map'},overlays:[]}
 ]};
 const read=plugin.resolvedScene(manifest,'scene-1');
 assert.equal(read.mapSource.id,'india-map');
 assert.equal(read.resolvedMapProject.camera.zoom,4);
 const patched=plugin.patchVideoScene(manifest,'scene-1',{engineData:{project:{camera:{zoom:5}}},overlays:[{id:'title',text:'Heavy rain'}]});
 assert.equal(patched.scenes[0].engineData.project.camera.zoom,5);
 assert.equal(patched.scenes[0].engineData.project.visual.layers[0].opacity,.4);
 assert.equal(patched.scenes[0].engineData.sourceId,undefined);
 assert.equal(patched.scenes[1].engineData.sourceId,'india-map');
 assert.equal(patched.mapSources[0].project.camera.zoom,4);
 assert.equal(patched.scenes[0].overlays[0].text,'Heavy rain');
 assert.equal(manifest.scenes[0].overlays[0].text,'Rain');
 assert.throws(()=>plugin.patchVideoScene(manifest,'scene-1',{id:'changed'}),/cannot change its ID/);
 assert.throws(()=>plugin.resolvedScene(manifest,'missing'),/does not exist/);
});

test('plugin validates built-in and user visual styling presets without scene downgrade',()=>{
 const manifest={schemaVersion:2,assets:[],visualStylePresetId:'history-archive-gold',visualStylePresets:[{id:'user-archive-blue',name:'Archive blue',category:'History',description:'A saved historical variation.',baseId:'history-archive-gold',tokens:{palette:{accent:'#65B7E6'},map:{contrast:.28,labelStyle:'card'}}}],scenes:[{id:'scene-1',engineType:'map',startSeconds:0,durationSeconds:2,visualStylePresetId:'user-archive-blue',engineData:{},overlays:[]}]};
 assert.equal(plugin.validateVideoManifest(manifest).scenes[0].engineType,'map');
 assert.equal(plugin.visualStyleList(manifest).length,5);
 assert.equal(plugin.savedVisualStyleSchema.parse(manifest.visualStylePresets[0]).baseId,'history-archive-gold');
 assert.throws(()=>plugin.validateVideoManifest({...manifest,visualStylePresetId:'invented-style'}),/Unknown video visual preset/);
 assert.throws(()=>plugin.savedVisualStyleSchema.parse({...manifest.visualStylePresets[0],tokens:{map:{contrast:2}}}),/Too big|<=1/);
});

test('plugin validates complete project briefs and reports resumable workflow phases',()=>{
 const brief=plugin.createProjectInput.parse({title:'ITCZ test',narration:'भारत के Monsoon का रास्ता कौन बदलता है?',creativeInstructions:'Show India and the Indian Ocean.',aspectRatio:'9:16',format:'Short',idempotencyKey:'itcz-test-001'});
 assert.equal(brief.title,'ITCZ test');
 assert.throws(()=>plugin.createProjectInput.parse({...brief,narration:''}),/too_small|Too small/);
 const audio=plugin.workflowStatus('project-1',{script:brief.narration,notes:brief.creativeInstructions,scenes:[]},null);
 assert.equal(audio.nextAction,'generate_mp3_and_run_local_whisper');
 assert.equal(audio.localCheckpointRequired,true);
 assert.equal(audio.costPolicy.localWhisper,'free');
 const storedAudio=plugin.workflowStatus('project-1',{script:brief.narration,notes:brief.creativeInstructions,scriptWorkspace:{audio:{cloudAssetId:'cloud-'+'a'.repeat(64)}},scenes:[]},null);
 assert.equal(storedAudio.nextAction,'start_private_local_whisper');
 assert.equal(storedAudio.localCheckpointRequired,false);
 const transcript={duration:2,segments:[{id:'segment-1',start:0,end:2,text:brief.narration}]};
 const planning=plugin.workflowStatus('project-1',{script:brief.narration,notes:brief.creativeInstructions,scenes:[]},transcript);
 assert.equal(planning.nextAction,'compile_and_apply_scene_plan');
 assert.equal(planning.localCheckpointRequired,false);
 const exportPhase=plugin.workflowStatus('project-1',{script:brief.narration,notes:brief.creativeInstructions,scenes:[{id:'scene-1'}]},transcript);
 assert.equal(exportPhase.nextAction,'review_maps_preview_and_export');
});

test('plugin exposes OAuth tool metadata before sign-in and returns a linking challenge',async()=>{
 const server=plugin.createServer(null),profile=server._registeredTools.get_my_profile,apply=server._registeredTools.apply_creator_scene_patch,draft=server._registeredTools.get_creator_video_draft,scene=server._registeredTools.get_creator_resolved_scene,jpg=server._registeredTools.request_creator_scene_jpg,jpgStatus=server._registeredTools.get_creator_scene_jpg_status,resume=server._registeredTools.get_creator_workflow_status,styles=server._registeredTools.list_creator_style_presets,applyStyle=server._registeredTools.apply_creator_style_preset,updateStyle=server._registeredTools.update_creator_style_preset;
 assert.deepEqual(profile._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read']}]);
 assert.deepEqual(apply._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read','creator.compile','creator.write']}]);
 assert.deepEqual(draft._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read']}]);
 assert.deepEqual(scene._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read']}]);
 assert.deepEqual(jpg._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read','creator.compile','creator.write']}]);
 assert.deepEqual(jpgStatus._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read']}]);
 assert.deepEqual(resume._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read']}]);
 assert.deepEqual(styles._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read']}]);
 assert.deepEqual(applyStyle._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read','creator.compile','creator.write']}]);
 assert.deepEqual(updateStyle._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read','creator.compile','creator.write']}]);
 assert.equal(server._registeredTools.create_creator_project,undefined);
 assert.equal(server._registeredTools.apply_creator_plan,undefined);
 assert.equal(server._registeredTools.start_creator_local_timing,undefined);
 assert.equal(server._registeredTools.get_creator_local_timing_status,undefined);
 const result=await profile.handler({});
 assert.equal(result.isError,true);
 assert.match(result._meta['mcp/www_authenticate'][0],/resource_metadata=/);
 assert.match(result._meta['mcp/www_authenticate'][0],/creator\.read/);
});
