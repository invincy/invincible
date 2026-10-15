export const draftKey = (uid, kind, id = '') => `invincible.v2.draft.${uid}.${kind}.${id}`;
export function readDraft(key) {try {return JSON.parse(localStorage.getItem(key) || 'null');} catch {return null;}}
export function writeDraft(key, value) {try {localStorage.setItem(key, JSON.stringify(value)); return true;} catch {return false;}}
export function clearDraft(key) {try {localStorage.removeItem(key);} catch {}}
