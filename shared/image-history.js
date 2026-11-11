let database;
function openHistory() {
  database ||= new Promise((resolve, reject) => {
    const request = indexedDB.open('invincible-image-history', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('entries', { keyPath: ['scope', 'id'] }).createIndex('scope', 'scope');
      request.result.createObjectStore('images');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch(error => { database = undefined; throw error; });
  return database;
}

export function imageHistory(scope) {
  async function transact(stores, mode, operation) {
    const db = await openHistory();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(stores, mode);
      transaction.onabort = () => reject(transaction.error);
      const request = operation(transaction);
      transaction.oncomplete = () => resolve(request?.result);
    });
  }
  return {
    list: () => transact('entries', 'readonly', tx => tx.objectStore('entries').index('scope').getAll(scope)),
    image: id => transact('images', 'readonly', tx => tx.objectStore('images').get([scope, id])),
    save: (entry, png) => transact(['entries', 'images'], 'readwrite', tx => {
      tx.objectStore('entries').put({ ...entry, scope });
      tx.objectStore('images').put(png, [scope, entry.id]);
    }),
    remove: id => transact(['entries', 'images'], 'readwrite', tx => {
      tx.objectStore('entries').delete([scope, id]);
      tx.objectStore('images').delete([scope, id]);
    }),
  };
}
