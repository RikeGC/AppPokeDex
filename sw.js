const CACHE_NAME = 'pokedex-react-v29';
const OFFLINE_ASSETS_CACHE = 'pokedex-offline-assets-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/app.js?v=29',
  './src/main.js',
  './src/AppRoot.js',
  './src/styles.css?v=29',
  './src/styles/tokens.css',
  './src/styles/layout.css',
  './src/styles/home.css',
  './src/styles/lists.css',
  './src/styles/details.css',
  './src/styles/responsive.css',
  './src/api/assetsCache.js',
  './src/api/offlineDb.js',
  './src/api/pokeapi.js',
  './src/components/AllPokemonView.js',
  './src/components/DetailsView.js',
  './src/components/GamesView.js',
  './src/components/Header.js',
  './src/components/HomeView.js',
  './src/components/Icon.js',
  './src/components/PokemonView.js',
  './src/data/gameCovers.js',
  './src/lib/react.js',
  './src/utils/format.js',
  './src/utils/pokemonData.js',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css',
  'https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== OFFLINE_ASSETS_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    try {
      const response = await fetch(request);
      cache.put('./index.html', response.clone());
      return response;
    } catch (error) {
      return cache.match('./index.html');
    }
  }

  if (url.origin === location.origin) {
    const cached = await cache.match(request);
    return cached || fetchAndCache(cache, request);
  }

  if (
    url.hostname === 'pokeapi.co' ||
    url.hostname === 'unpkg.com' ||
    url.hostname === 'archives.bulbagarden.net' ||
    url.hostname === 'raw.githubusercontent.com' ||
    url.hostname.endsWith('githubusercontent.com')
  ) {
    try {
      return await fetchAndCache(cache, request);
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw error;
    }
  }

  return fetch(request);
}

async function fetchAndCache(cache, request) {
  const response = await fetch(request);

  if (response && response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}
