const OFFLINE_ASSETS_CACHE = 'pokedex-offline-assets-v1';

export async function cacheAssets(urls) {
  if (!('caches' in window)) return;
  const cache = await caches.open(OFFLINE_ASSETS_CACHE);
  await Promise.all((urls || []).map((url) => cache.add(url).catch(() => {})));
}

export async function deleteCachedAssets(urls) {
  if (!('caches' in window)) return;
  const cache = await caches.open(OFFLINE_ASSETS_CACHE);
  await Promise.all((urls || []).map((url) => cache.delete(url).catch(() => {})));
}
