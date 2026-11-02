const {createRequire}=require('node:module'),path=require('node:path');
const localRequire=createRequire(path.resolve(__dirname,'../react/package.json'));
const sdk=localRequire('firebase/firestore'),appSdk=localRequire('firebase/app');
const projectId='demo-invincible-crm';
function emulatorAddress(){const value=process.env.FIRESTORE_EMULATOR_HOST;if(!value)throw Error('Run this test through the Firestore emulator.');const [host,port]=value.split(':');return {host,port:Number(port)};}
async function context(uid,verified=true){
 const {host,port}=emulatorAddress(),app=appSdk.initializeApp({projectId,apiKey:'emulator-only',appId:'test'},'crm-'+uid+'-'+Math.random());
 const db=sdk.getFirestore(app);sdk.connectFirestoreEmulator(db,host,port,{mockUserToken:{sub:uid,email:uid+'@example.com',email_verified:verified}});
 const {createFirestoreDriver}=await import('../lic/crm/firestore-driver.mjs'),{createCrmRepository}=await import('../lic/crm/operations.mjs');
 const user={uid,email:uid+'@example.com',emailVerified:verified};let active=true;
 const repository=createCrmRepository(createFirestoreDriver(db,user,()=>active,sdk));
 return {db,sdk,user,app,execute:d=>repository({uid,token:{email:user.email,email_verified:verified}},d),invalidate:()=>{active=false;},close:async()=>{await sdk.terminate(db);await appSdk.deleteApp(app);}};
}
async function clear(){const {host,port}=emulatorAddress();const r=await fetch(`http://${host}:${port}/emulator/v1/projects/${projectId}/databases/(default)/documents`,{method:'DELETE'});if(!r.ok)throw Error('Could not reset emulator fixture.');}
module.exports={context,clear,emulatorAddress,projectId,sdk};
