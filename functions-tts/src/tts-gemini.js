// Gemini uses the same authenticated Cloud TTS endpoint, with separate text and prompt fields.
const MODELS=['gemini-2.5-flash-tts','gemini-2.5-pro-tts'];
const LANGUAGES=['hi-IN','en-IN','en-US','gu-IN'];
const SPEAKERS=[['Charon','MALE'],['Fenrir','MALE'],['Puck','MALE'],['Kore','FEMALE'],['Aoede','FEMALE'],['Leda','FEMALE']];
const DELIVERY={
 natural:'Speak naturally, conversationally and clearly.',
 sales:'Use a warm, confident, persuasive sales presentation delivery. Sound trustworthy and engaging.',
 energetic:'Sound excited, enthusiastic and lively, with expressive intonation.',
 documentary:'Use a clear, measured documentary narration with authority and curiosity.',
 dramatic:'Use a dramatic storytelling delivery with suspense and deliberate emphasis.',
 calm:'Use a calm, reassuring and gentle delivery.'
};
function geminiVoices(){return LANGUAGES.flatMap(languageCode=>SPEAKERS.map(([speaker,gender])=>({
 name:languageCode+'-Gemini-'+speaker,languageCodes:[languageCode],gender,family:'Gemini',speaker,
 capabilities:{supported:true,ssml:false,pitch:false,speed:true,emphasis:false,direction:true}
})));}
function parseGemini(data){
 const modelName=data.modelName??MODELS[0],delivery=data.delivery??'natural',direction=data.direction??'';
 if(!MODELS.includes(modelName))throw Error('Choose a supported Gemini TTS model.');
 if(!Object.hasOwn(DELIVERY,delivery))throw Error('Choose a supported delivery style.');
 if(typeof direction!=='string'||Buffer.byteLength(direction,'utf8')>2000)throw Error('Voice direction must be at most 2,000 UTF-8 bytes.');
 return {modelName,delivery,direction};
}
function geminiPrompt(input){
 return [
  'Read only the supplied narration, preserving its words and language switches. Do not read these performance instructions aloud.',
  DELIVERY[input.delivery],
  input.speed===1?'Use a natural speaking pace.':'Speak at approximately '+input.speed+' times your normal pace, keeping pronunciation clear.',
  input.direction.trim()
 ].filter(Boolean).join('\n');
}
module.exports={geminiVoices,parseGemini,geminiPrompt};
