import {useEffect, useState} from 'react';
import {collection, doc, onSnapshot} from 'firebase/firestore';
import {db} from '../src/firebase';
import {subscribeWorkspace} from './read-source';
import {localDayKey} from './model';
const adapter = {
  tasks: (uid, next, error) => onSnapshot(collection(db, 'users', uid, 'tasks'), {includeMetadataChanges: true}, next, error),
  plan: (uid, day, next, error) => onSnapshot(doc(db, 'users', uid, 'dailyPlans', day), {includeMetadataChanges: true}, next, error),
};
export function useWorkspaceData(uid) {
  const [day, setDay] = useState(localDayKey);
  const [data, setData] = useState({tasks: [], plan: null});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const update = () => setDay(localDayKey());
    const clock = setInterval(update, 15000);
    window.addEventListener('focus', update);
    return () => { clearInterval(clock); window.removeEventListener('focus', update); };
  }, []);
  useEffect(() => subscribeWorkspace(adapter, uid, day, setData), [uid, day, attempt]);
  return {...data, retry: () => setAttempt(value => value+1)};
}
