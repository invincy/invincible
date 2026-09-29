const {initializeApp}=require('firebase-admin/app');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineSecret,defineString}=require('firebase-functions/params');
const {logger}=require('firebase-functions');
const {createAiProvider}=require('./ai/openai-provider');
const {InvincibleRepository}=require('./data/invincible-repository');
const {definitions,executeInvincibleTool}=require('./tools/invincible-tools');

initializeApp();
const db=getFirestore(),openAiApiKey=defineSecret('OPENAI_API_KEY'),aiModel=defineString('OPENAI_MODEL',{default:'gpt-5.6'}),aiProvider=defineString('AI_PROVIDER',{default:'openai'});
const conversationPattern=/^[a-zA-Z0-9_-]{8,80}$/;

async function recentMessages(uid,conversationId){
 const ref=db.collection('users').doc(uid).collection('aiConversations').doc(conversationId).collection('messages'),snapshot=await ref.orderBy('createdAt','desc').limit(12).get();
 return snapshot.docs.reverse().map(doc=>{const data=doc.data();return{role:data.role==='assistant'?'assistant':'user',content:String(data.content||'').slice(0,6000)};});
}

async function saveMessage(uid,conversationId,role,content,metadata={}){
 const conversation=db.collection('users').doc(uid).collection('aiConversations').doc(conversationId),message=conversation.collection('messages').doc();
 const batch=db.batch();batch.set(conversation,{updatedAt:FieldValue.serverTimestamp(),lastMessage:String(content).slice(0,240)},{merge:true});batch.set(message,{role,content:String(content).slice(0,8000),...metadata,createdAt:FieldValue.serverTimestamp()});await batch.commit();
}

exports.invincibleAiChat=onCall({region:'asia-south1',secrets:[openAiApiKey],timeoutSeconds:120,memory:'512MiB'},async request=>{
 if(!request.auth)throw new HttpsError('unauthenticated','Sign in to Invincible first.');
 const message=String(request.data?.message||'').trim(),conversationId=String(request.data?.conversationId||'');
 if(!message||message.length>4000)throw new HttpsError('invalid-argument','Message must be between 1 and 4,000 characters.');
 if(!conversationPattern.test(conversationId))throw new HttpsError('invalid-argument','Invalid conversation ID.');
 const uid=request.auth.uid,email=request.auth.token.email||'',repository=new InvincibleRepository(db,uid,email);
 try{
  const [history,context]=await Promise.all([recentMessages(uid,conversationId),repository.contextSnapshot()]);
  await saveMessage(uid,conversationId,'user',message);
  const provider=createAiProvider({provider:aiProvider.value(),apiKey:openAiApiKey.value(),model:aiModel.value()});
  const output=await provider.run({messages:[...history,{role:'user',content:message}],context,tools:definitions,executeTool:(name,args)=>executeInvincibleTool(repository,name,args)});
  await saveMessage(uid,conversationId,'assistant',output.text,{actions:output.actions});
  return output;
 }catch(error){
  logger.error('Invincible AI request failed',{uid,error:error?.stack||String(error)});
  if(error instanceof HttpsError)throw error;
  throw new HttpsError('internal','Invincible AI could not complete that request. No unconfirmed change should be assumed.');
 }
});
