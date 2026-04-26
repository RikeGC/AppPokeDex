const DB_NAME = 'pokedex-offline-db';
const DB_VERSION = 1;

function openOfflineDb() {
  if (!('indexedDB' in window)) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('apiResponses')) {
        db.createObjectStore('apiResponses', { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains('packages')) {
        db.createObjectStore('packages', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(storeName, key) {
  const db = await openOfflineDb();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut(storeName, value) {
  const db = await openOfflineDb();
  if (!db) return;

  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).put(value);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function idbDelete(storeName, key) {
  const db = await openOfflineDb();
  if (!db) return;

  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function idbGetAll(storeName) {
  const db = await openOfflineDb();
  if (!db) return [];

  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export function readStoredResponse(url) {
  return idbGet('apiResponses', url).catch(() => null);
}

export function writeStoredResponse(url, data) {
  return idbPut('apiResponses', { url, data, updatedAt: Date.now() }).catch(() => {});
}

export function deleteStoredResponses(urls) {
  return Promise.all((urls || []).map((url) => idbDelete('apiResponses', url).catch(() => {})));
}

export function packageKey(gameName, dexMode) {
  return `${gameName}:${dexMode}`;
}

export function getPackageMeta(gameName, dexMode) {
  return idbGet('packages', packageKey(gameName, dexMode)).catch(() => null);
}

export function savePackageMeta(meta) {
  return idbPut('packages', meta);
}

export function deletePackageMeta(gameName, dexMode) {
  return idbDelete('packages', packageKey(gameName, dexMode));
}

export function getAllPackageMeta() {
  return idbGetAll('packages').catch(() => []);
}
