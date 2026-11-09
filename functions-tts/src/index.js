const {initializeApp}=require('firebase-admin/app');
initializeApp();
const {creatorTtsVoices,creatorTtsGenerate}=require('./tts-callables');
Object.assign(exports,{creatorTtsVoices,creatorTtsGenerate});
