const test=require('node:test'),assert=require('node:assert/strict');
const {DOMParser}=require('@xmldom/xmldom');
const {capabilities,normalizeVoices,parseInput,splitText,splitSsml,prepareRequests,readWav,makeWav,CHUNK_BYTES}=require('../src/tts-model');
const {generate,encodeMp3,GoogleTtsError,googleRequest}=require('../src/tts-service');
const {assertAccount}=require('../src/tts-callables');
const voice=normalizeVoices([{name:'hi-IN-Neural2-B',languageCodes:['hi-IN'],ssmlGender:'MALE'}])[0];
const input={text:'पानीपत की कहानी। Military Strategy!',voiceName:voice.name,languageCode:'hi-IN'};
const {geminiVoices}=require('../src/tts-gemini');
const gemini=geminiVoices().find(v=>v.name==='hi-IN-Gemini-Charon');
test('Gemini sends performance instructions separately on every Unicode-safe chunk',async()=>{
 const text='हिंदी English 🚀 '.repeat(700),seen=[];
 const data={...input,voiceName:gemini.name,text,engine:'gemini',modelName:'gemini-2.5-flash-tts',delivery:'sales',direction:'Emphasize the opening question.',speed:1.35};
 await generate(data,{voices:[gemini],request:async(route,body)=>{seen.push(body);return {audioContent:makeWav([Buffer.alloc(4800)]).toString('base64')};},encoder:async()=>Buffer.from('fixture')});
 assert.ok(seen.length>1);assert.equal(seen.map(r=>r.input.text).join(''),text);
 for(const body of seen){
  assert.ok(Buffer.byteLength(body.input.text)<=4000);assert.ok(Buffer.byteLength(body.input.prompt)<=4000);
  assert.match(body.input.prompt,/persuasive sales/);assert.match(body.input.prompt,/1.35/);assert.match(body.input.prompt,/Emphasize the opening question/);
  assert.equal(body.voice.name,'Charon');assert.equal(body.voice.modelName,'gemini-2.5-flash-tts');
  assert.equal(body.audioConfig.speakingRate,undefined);assert.equal(body.audioConfig.pitch,undefined);
 }
});
test('Gemini rejects unsupported controls, model and oversized instructions before a request',async()=>{
 const data={...input,voiceName:gemini.name};let count=0;
 for(const invalid of [{modelName:'arbitrary-model'},{delivery:'fake'},{direction:'अ'.repeat(700)},{mode:'ssml'},{pitch:1},{paragraphPause:500},{engine:'classic'},{direction:42}]){
  await assert.rejects(()=>generate({...data,...invalid},{voices:[gemini],request:async()=>{count++;}}));
 }
 assert.equal(count,0);
 assert.throws(()=>parseInput({...input,direction:'excited'},voice),/Gemini/);
 assert.equal(parseInput({...data,modelName:'gemini-2.5-pro-tts'},gemini).modelName,'gemini-2.5-pro-tts');
});
test('requires authentication and the configured account',()=>{
 assert.throws(()=>assertAccount({},'owner'),/Sign in/);
 assert.throws(()=>assertAccount({auth:{uid:'owner'}},''),/not activated/);
 assert.throws(()=>assertAccount({auth:{uid:'other'}},'owner'),/not enabled/);
 assert.doesNotThrow(()=>assertAccount({auth:{uid:'owner'}},'owner'));
});
test('preserves Unicode content when text crosses byte limits',()=>{
 const source=('हिंदी narration 🚀 '.repeat(1000))+'end';
 const chunks=splitText(source);assert.equal(chunks.join(''),source);
 assert.ok(chunks.length>1);assert.ok(chunks.every(c=>Buffer.byteLength(c)<=CHUNK_BYTES));
 assert.equal(splitText('🚀'.repeat(2000)).join(''),'🚀'.repeat(2000));
});
test('splits nested SSML into valid requests, keeping text and pause ordering',()=>{
 const first='लंबी कहानी '.repeat(700),source='<speak><p><prosody rate="slow">'+first+'</prosody><break time="750ms"/>अंत।</p></speak>';
 const parts=splitSsml(source,voice);assert.ok(parts.length>1);
 const text=parts.map(p=>new DOMParser().parseFromString(p.ssml,'application/xml').documentElement.textContent).join('');
 assert.equal(text,first+'अंत।');assert.ok(parts.every(p=>Buffer.byteLength(p.ssml)<=CHUNK_BYTES));
 assert.equal(parts.filter(p=>p.ssml.includes('750ms')).length,1);
});
test('rejects malformed, external and unsupported SSML before synthesis',()=>{
 for(const source of ['<speak><p>broken</speak>','<!DOCTYPE speak><speak>x</speak>','<speak><audio src="https://example.com/x"/></speak>','<speak><voice name="x">x</voice></speak>','<speak><break time="100s"/>x</speak>']){
  assert.throws(()=>splitSsml(source,voice));
 }
 const chirp={name:'hi-IN-Chirp3-HD-Charon',capabilities:capabilities('hi-IN-Chirp3-HD-Charon')};
 assert.throws(()=>splitSsml('<speak><emphasis level="strong">x</emphasis></speak>',chirp),/emphasis/);
 assert.throws(()=>parseInput({...input,pitch:2},{...voice,...chirp}),/Pitch control/);
});
test('checks voice, language, size and finite numeric settings',()=>{
 assert.throws(()=>parseInput(input,undefined),/not supported/);
 assert.throws(()=>parseInput({...input,speed:3},voice),/Speed/);
 assert.throws(()=>parseInput({...input,volume:Infinity},voice),/Volume/);
 assert.throws(()=>parseInput({...input,languageCode:'en-US'},voice),/language/);
 assert.throws(()=>parseInput({...input,text:'अ'.repeat(11000)},voice),/30,000/);
 assert.equal(parseInput({...input,title:'../private/key'},voice).filename,'..privatekey.mp3');
});
test('plain text escapes markup only when adding paragraph pauses',()=>{
 const parsed=parseInput({...input,text:'A & B\n\nC < D',paragraphPause:500},voice),parts=prepareRequests(parsed,voice);
 assert.match(parts[0].ssml,/A &amp; B/);assert.match(parts[0].ssml,/break time="500ms"/);assert.match(parts[0].ssml,/C &lt; D/);
 assert.deepEqual(prepareRequests(parseInput({...input,text:'A & B'},voice),voice),[{text:'A & B'}]);
});
test('rejects truncated and mismatched WAV chunks',()=>{
 const good=makeWav([Buffer.alloc(48000)]);assert.equal(readWav(good).length,48000);
 assert.throws(()=>readWav(good.subarray(0,100)),/Truncated/);
 const wrong=Buffer.from(good);wrong.writeUInt32LE(48000,24);assert.throws(()=>readWav(wrong),/Unexpected PCM/);
});
test('joins lossless chunks and passes the chosen voice/settings to Google',async()=>{
 const seen=[],text='x '.repeat(3500),wav=makeWav([Buffer.alloc(4800)]);
 const result=await generate({...input,text,speed:1.15,pitch:-2,volume:3},{voices:[voice],request:async(route,body)=>{seen.push(body);return{audioContent:wav.toString('base64')};},encoder:async buffer=>{assert.equal(readWav(buffer).length,seen.length*4800);return Buffer.from('encoded fixture');}});
 assert.equal(result.requests,seen.length);assert.ok(seen.length>1);
 assert.equal(seen.map(r=>r.input.text).join(''),text);
 assert.equal(seen[0].voice.name,voice.name);assert.equal(seen[0].audioConfig.speakingRate,1.15);
 assert.equal(seen[0].audioConfig.pitch,-2);assert.equal(seen[0].audioConfig.volumeGainDb,3);
 assert.equal(result.durationSeconds,seen.length*.1);
});
test('does not retry Google failures or print upstream response details',async()=>{
 let count=0;
 await assert.rejects(()=>googleRequest('text:synthesize',{},{
  credential:{getAccessToken:async()=>({access_token:'test-token'})},
  fetcher:async()=>{count++;return{ok:false,status:403};}
 }),e=>e instanceof GoogleTtsError&&e.status===403&&!e.message.includes('token'));
 assert.equal(count,1);
});
test('real MP3 encoder produces a nonempty, fully decodable recording',async()=>{
 const pcm=Buffer.alloc(48000);for(let i=0;i<24000;i++)pcm.writeInt16LE(Math.round(3000*Math.sin(2*Math.PI*440*i/24000)),i*2);
 const result=await encodeMp3(makeWav([pcm]));assert.ok(result.length>10000);
});
