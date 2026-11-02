import {db,auth} from '../../shared/firebase-client.js';
import * as firestore from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {createFirestoreDriver,crmWorkspacePath} from './firestore-driver.mjs';
import {createCrmRepository} from './operations.mjs';
export async function executeCrm(payload,isCurrent) {
  const user=auth.currentUser;if(!user)throw Error('Open Dashboard to restore your Invincible session.');
  const valid=()=>isCurrent()&&auth.currentUser?.uid===user.uid;
  const repository=createCrmRepository(createFirestoreDriver(db,user,valid,firestore));
  return repository({uid:user.uid,token:{email:user.email||'',email_verified:user.emailVerified===true,name:user.displayName||''}},payload);
}
export function watchWorkspace(id,changed,failed) {
  return firestore.onSnapshot(firestore.doc(db,crmWorkspacePath(auth.currentUser.uid,id)),snapshot=>changed(snapshot.exists()?snapshot.data():null),failed);
}
