import { readStoredResponse, writeStoredResponse } from './offlineDb.js';

export const API = 'https://pokeapi.co/api/v2';
const apiCache = new Map();

export function normalizeApiUrl(url) {
  return url.startsWith('http') ? url : `${API}${url}`;
}

export function apiGet(url) {
  const target = normalizeApiUrl(url);
  if (!apiCache.has(target)) {
    apiCache.set(target, fetch(target)
      .then(async (response) => {
        if (!response.ok) throw new Error('Não foi possível carregar dados da PokéAPI.');
        const data = await response.json();
        await writeStoredResponse(target, data);
        return data;
      })
      .catch(async (error) => {
        const stored = await readStoredResponse(target);
        if (stored) return stored.data;
        throw error;
      }));
  }
  return apiCache.get(target);
}
