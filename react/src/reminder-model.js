// Calendar dates are local: advancing a day preserves the scheduled wall-clock time across DST.
export const asDate = value => value?.toDate ? value.toDate() : new Date(value);
export const dateKey = (date = new Date()) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export function groupReminders(items, now = new Date()) {
  const todayKey = dateKey(now), overdue = [], today = [], upcoming = {};
  for (const item of items) {
    if (item.completed) continue;
    const due = asDate(item.dueAt);
    if (!Number.isFinite(due.getTime())) continue;
    const key = dateKey(due);
    if (key < todayKey) overdue.push(item);
    else if (key === todayKey) today.push(item);
    else (upcoming[key] ||= []).push(item);
  }
  return {overdue, today, upcoming: Object.fromEntries(Object.entries(upcoming).sort(([a], [b]) => a.localeCompare(b)))};
}
export function nextDailyDue(value, now = new Date()) {
  const next = asDate(value);
  next.setDate(next.getDate() + 1);
  if (dateKey(next) <= dateKey(now)) {
    next.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    next.setDate(next.getDate() + 1);
  }
  return next;
}
// Read fresh data inside the transaction. Both writes commit together, and a completed
// source is a no-op even if a second device or a retried request completes it again.
export async function completeReminder(api, uid, id, now = new Date()) {
  const {db, doc, runTransaction, Timestamp, serverTimestamp} = api;
  const source = doc(db, 'users', uid, 'reminders', id);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(source);
    if (!snapshot.exists() || snapshot.data().completed) return false;
    const current = snapshot.data();
    if (current.repeat === 'daily') {
      const due = nextDailyDue(current.dueAt, now), seriesId = current.seriesId || id;
      const next = doc(db, 'users', uid, 'reminders', `daily_${seriesId}_${due.getTime()}`);
      const nextSnapshot = await transaction.get(next);
      if (!nextSnapshot.exists()) transaction.set(next, {
        title: current.title, dueAt: Timestamp.fromDate(due), seriesId,
        repeat: 'daily', completed: false, snoozed: false,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
    }
    transaction.update(source, {completed: true, completedAt: serverTimestamp(), updatedAt: serverTimestamp()});
    return true;
  });
}
