import {useEffect, useState} from 'react';
import {remainingSeconds} from './model';
const fresh = () => ({seconds: 1500, endsAt: null});
export function useFocusSession(uid) {
  // This prototype's timer is device/session state, not a business record.
  // It lives above transient regions and survives navigation and tab reloads.
  const key = 'invincible.v2.focus.'+uid;
  const [timer, setTimer] = useState(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(key));
      if (value && Number.isFinite(value.seconds) && value.seconds >= 0 && value.seconds <= 1500
        && (value.endsAt === null || Number.isFinite(value.endsAt))) return value;
    } catch {}
    return fresh();
  });
  const [now, setNow] = useState(Date.now);
  useEffect(() => { try {sessionStorage.setItem(key, JSON.stringify(timer));} catch {} }, [key, timer]);
  useEffect(() => {
    if (!timer.endsAt) return;
    const tick = () => { const time = Date.now(); setNow(time); if (time >= timer.endsAt) setTimer({seconds: 0, endsAt: null}); };
    tick(); const clock = setInterval(tick, 250);
    return () => clearInterval(clock);
  }, [timer.endsAt]);
  return {
    seconds: remainingSeconds(timer, now), running: Boolean(timer.endsAt),
    start: () => {const time = Date.now(); setNow(time); setTimer(current => ({...current, endsAt: time+(current.seconds || 1500)*1000}));},
    pause: () => setTimer(current => ({seconds: remainingSeconds(current), endsAt: null})),
    reset: () => setTimer(fresh()),
  };
}
