import{httpsCallable}from'firebase/functions';
import{functions}from'../../../firebase';

const chat=httpsCallable(functions,'invincibleAiChat',{timeout:120000});

export async function sendInvincibleAiMessage({conversationId,message}){
 const response=await chat({conversationId,message});
 return response.data;
}
