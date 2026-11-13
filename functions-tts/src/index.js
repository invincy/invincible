const {initializeApp}=require('firebase-admin/app');
initializeApp();
const {creatorTtsVoices,creatorTtsGenerate,creatorTtsRetime}=require('./tts-callables');
Object.assign(exports,{creatorTtsVoices,creatorTtsGenerate,creatorTtsRetime});
