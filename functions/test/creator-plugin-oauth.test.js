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

test('plugin validates complete project briefs and reports resumable workflow phases',()=>{
 const brief=plugin.createProjectInput.parse({title:'ITCZ test',narration:'भारत के Monsoon का रास्ता कौन बदलता है?',creativeInstructions:'Show India and the Indian Ocean.',aspectRatio:'9:16',format:'Short',idempotencyKey:'itcz-test-001'});
 assert.equal(brief.title,'ITCZ test');
 assert.throws(()=>plugin.createProjectInput.parse({...brief,narration:''}),/too_small|Too small/);
 const audio=plugin.workflowStatus('project-1',{script:brief.narration,notes:brief.creativeInstructions,scenes:[]},null);
 assert.equal(audio.nextAction,'generate_mp3_and_run_local_whisper');
 assert.equal(audio.localCheckpointRequired,true);
 assert.equal(audio.costPolicy.localWhisper,'free');
 const transcript={duration:2,segments:[{id:'segment-1',start:0,end:2,text:brief.narration}]};
 const planning=plugin.workflowStatus('project-1',{script:brief.narration,notes:brief.creativeInstructions,scenes:[]},transcript);
 assert.equal(planning.nextAction,'compile_and_apply_scene_plan');
 assert.equal(planning.localCheckpointRequired,false);
 const exportPhase=plugin.workflowStatus('project-1',{script:brief.narration,notes:brief.creativeInstructions,scenes:[{id:'scene-1'}]},transcript);
 assert.equal(exportPhase.nextAction,'review_maps_preview_and_export');
});

test('plugin exposes OAuth tool metadata before sign-in and returns a linking challenge',async()=>{
 const server=plugin.createServer(null),profile=server._registeredTools.get_my_profile,apply=server._registeredTools.apply_creator_plan,create=server._registeredTools.create_creator_project,resume=server._registeredTools.get_creator_workflow_status;
 assert.deepEqual(profile._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read']}]);
 assert.deepEqual(apply._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read','creator.compile','creator.write']}]);
 assert.deepEqual(create._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read','creator.compile','creator.write']}]);
 assert.deepEqual(resume._meta.securitySchemes,[{type:'oauth2',scopes:['creator.read']}]);
 const result=await profile.handler({});
 assert.equal(result.isError,true);
 assert.match(result._meta['mcp/www_authenticate'][0],/resource_metadata=/);
 assert.match(result._meta['mcp/www_authenticate'][0],/creator\.read/);
});
