import { h, useEffect, useMemo, useState } from './lib/react.js';
import { apiGet, normalizeApiUrl } from './api/pokeapi.js';
import {
  deletePackageMeta,
  deleteStoredResponses,
  getAllPackageMeta,
  getPackageMeta,
  packageKey,
  savePackageMeta
} from './api/offlineDb.js';
import { cacheAssets, deleteCachedAssets } from './api/assetsCache.js';
import { coverForGame } from './data/gameCovers.js';
import { AllPokemonView } from './components/AllPokemonView.js';
import { DetailsView } from './components/DetailsView.js';
import { GamesView } from './components/GamesView.js';
import { Header } from './components/Header.js';
import { HomeView } from './components/HomeView.js';
import { PokemonView } from './components/PokemonView.js';
import { formatName, idFromUrl, spriteForSpecies } from './utils/format.js';
import {
  extractEncountersForVersion,
  extractMovesForVersionGroup,
  loadNationalDexUntilGeneration
} from './utils/pokemonData.js';

export function AppRoot() {
  const [screen, setScreen] = useState('home');
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [versionGroup, setVersionGroup] = useState(null);
  const [dexMode, setDexMode] = useState('regional');
  const [regionalPokemonList, setRegionalPokemonList] = useState([]);
  const [nationalPokemonList, setNationalPokemonList] = useState([]);
  const [allPokemonList, setAllPokemonList] = useState([]);
  const [allPokemonTotal, setAllPokemonTotal] = useState(0);
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [offlinePackage, setOfflinePackage] = useState(null);
  const [offlineProgress, setOfflineProgress] = useState(null);
  const [offlineMessage, setOfflineMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('pokedex-theme') || 'light');

  useEffect(() => {
    loadGames();
    loadPokemonTotal();

    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', () => setInstallPrompt(null));

    if ('serviceWorker' in navigator) {
      if (document.readyState === 'complete') {
        navigator.serviceWorker.register('./sw.js');
      } else {
        window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pokedex-theme', theme);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#111827' : '#dc2626');
  }, [theme]);

  useEffect(() => {
    if (!selectedGame || screen !== 'pokemon') return;
    refreshOfflinePackage(selectedGame, dexMode);
  }, [selectedGame, dexMode, screen, pokemonList.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [screen, selectedGame?.name, selectedPokemon?.name]);

  async function loadGames() {
    setLoading('Carregando jogos oficiais...');
    setError('');
    try {
      const data = await apiGet('/version?limit=200');
      setGames(data.results
        .map((game) => ({
          ...game,
          id: idFromUrl(game.url),
          label: formatName(game.name),
          cover: coverForGame(game.name)
        }))
        .sort((a, b) => a.id - b.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function loadPokemonTotal() {
    try {
      const data = await apiGet('/pokemon-species?limit=1');
      setAllPokemonTotal(data.count || 0);
    } catch (err) {
      setAllPokemonTotal(0);
    }
  }

  async function openAllPokemon() {
    setSelectedGame(null);
    setVersionGroup(null);
    setDexMode('national');
    setSelectedPokemon(null);
    setPokemonDetails(null);
    setQuery('');
    setOfflineMessage('');
    setOfflinePackage(null);
    setOfflineProgress(null);
    setScreen('all-pokemon');
    setError('');

    if (allPokemonList.length > 0) return;

    setLoading('Carregando lista completa de Pokémon...');
    try {
      const data = await apiGet('/pokemon-species?limit=2000');
      setAllPokemonTotal(data.count || 0);
      const list = data.results
        .map((species) => {
          const id = idFromUrl(species.url);
          return {
            id,
            name: species.name,
            label: formatName(species.name),
            entryNumber: id,
            speciesUrl: species.url
          };
        })
        .filter((pokemon) => Number.isFinite(pokemon.id))
        .sort((a, b) => a.id - b.id);
      setAllPokemonList(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function openGame(game) {
    setSelectedGame(game);
    setSelectedPokemon(null);
    setPokemonDetails(null);
    setQuery('');
    setDexMode('regional');
    setOfflineMessage('');
    setOfflinePackage(null);
    setOfflineProgress(null);
    setScreen('pokemon');
    setLoading(`Carregando Pokédex de ${game.label}...`);
    setError('');
    setRegionalPokemonList([]);
    setNationalPokemonList([]);
    setPokemonList([]);

    try {
      const version = await apiGet(game.url);
      const group = await apiGet(version.version_group.url);
      const pokedexes = await Promise.all(group.pokedexes.map((pokedex) => apiGet(pokedex.url)));
      const entries = new Map();

      pokedexes.forEach((pokedex) => {
        pokedex.pokemon_entries.forEach((entry) => {
          const species = entry.pokemon_species;
          if (!entries.has(species.name)) {
            entries.set(species.name, {
              id: idFromUrl(species.url),
              name: species.name,
              label: formatName(species.name),
              entryNumber: entry.entry_number,
              speciesUrl: species.url
            });
          }
        });
      });

      const regionalList = Array.from(entries.values()).sort((a, b) => a.entryNumber - b.entryNumber || a.id - b.id);
      setVersionGroup(group);
      setRegionalPokemonList(regionalList);
      setPokemonList(regionalList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function changeDexMode(nextMode) {
    setDexMode(nextMode);
    setQuery('');
    setError('');

    if (nextMode === 'regional') {
      setPokemonList(regionalPokemonList);
      return;
    }

    if (nationalPokemonList.length > 0) {
      setPokemonList(nationalPokemonList);
      return;
    }

    setLoading('Carregando National Dex até a geração do jogo...');

    try {
      const nationalList = await loadNationalDexUntilGeneration(versionGroup);
      setNationalPokemonList(nationalList);
      setPokemonList(nationalList);
    } catch (err) {
      setError(err.message);
      setDexMode('regional');
      setPokemonList(regionalPokemonList);
    } finally {
      setLoading('');
    }
  }

  async function openPokemon(pokemon) {
    setSelectedPokemon(pokemon);
    setPokemonDetails(null);
    setScreen('details');
    setLoading(`Montando dados de ${pokemon.label}...`);
    setError('');

    try {
      const species = await apiGet(pokemon.speciesUrl);
      const pokemonData = await apiGet(`/pokemon/${species.name}`);
      const evolutionChain = await apiGet(species.evolution_chain.url);
      const moves = versionGroup ? extractMovesForVersionGroup(pokemonData.moves, versionGroup.name) : [];
      const encounters = selectedGame
        ? extractEncountersForVersion(await apiGet(pokemonData.location_area_encounters), selectedGame.name)
        : [];
      setPokemonDetails({ species, pokemon: pokemonData, evolutionChain, moves, encounters });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function refreshOfflinePackage(game, mode) {
    setOfflinePackage(await getPackageMeta(game.name, mode));
  }

  async function downloadOfflinePackage() {
    if (!selectedGame || !versionGroup || pokemonList.length === 0 || offlineProgress) return;

    const urls = new Set();
    const assetUrls = new Set();
    const list = pokemonList;
    const startedAt = Date.now();
    setOfflineMessage('');
    setOfflineProgress({ done: 0, total: list.length, label: 'Preparando pacote offline...' });

    try {
      urls.add(normalizeApiUrl('/version?limit=200'));
      urls.add(normalizeApiUrl(selectedGame.url));
      if (selectedGame.cover && !selectedGame.cover.startsWith('data:')) assetUrls.add(selectedGame.cover);

      if (dexMode === 'national') {
        const generationId = idFromUrl(versionGroup.generation.url);
        for (let index = 1; index <= generationId; index += 1) {
          urls.add(normalizeApiUrl(`/generation/${index}`));
          await apiGet(`/generation/${index}`);
        }
      }

      const version = await apiGet(selectedGame.url);
      urls.add(normalizeApiUrl(version.version_group.url));
      const group = await apiGet(version.version_group.url);
      await Promise.all(group.pokedexes.map(async (pokedex) => {
        urls.add(normalizeApiUrl(pokedex.url));
        await apiGet(pokedex.url);
      }));

      for (let index = 0; index < list.length; index += 1) {
        const item = list[index];
        setOfflineProgress({ done: index, total: list.length, label: `Baixando ${item.label}...` });

        urls.add(normalizeApiUrl(item.speciesUrl));
        const species = await apiGet(item.speciesUrl);
        const pokemonUrl = normalizeApiUrl(`/pokemon/${species.name}`);
        urls.add(pokemonUrl);
        const pokemonData = await apiGet(pokemonUrl);
        urls.add(normalizeApiUrl(species.evolution_chain.url));
        await apiGet(species.evolution_chain.url);
        urls.add(normalizeApiUrl(pokemonData.location_area_encounters));
        await apiGet(pokemonData.location_area_encounters);

        [
          pokemonData.sprites.front_default,
          pokemonData.sprites.front_shiny,
          spriteForSpecies(item.id)
        ].filter(Boolean).forEach((url) => assetUrls.add(url));
        await cacheAssets(Array.from(assetUrls).slice(-3));
      }

      await cacheAssets(Array.from(assetUrls));
      const meta = {
        id: packageKey(selectedGame.name, dexMode),
        gameName: selectedGame.name,
        gameLabel: selectedGame.label,
        dexMode,
        count: list.length,
        urls: Array.from(urls),
        assets: Array.from(assetUrls),
        downloadedAt: Date.now(),
        elapsedMs: Date.now() - startedAt
      };
      await savePackageMeta(meta);
      setOfflinePackage(meta);
      setOfflineMessage(`${selectedGame.label} (${dexMode === 'regional' ? 'Regional' : 'National Dex'}) salvo para offline.`);
    } catch (err) {
      setOfflineMessage('Não foi possível concluir o download offline. Confira a conexão e tente novamente.');
    } finally {
      setOfflineProgress(null);
    }
  }

  async function removeOfflinePackage() {
    if (!selectedGame || !offlinePackage || offlineProgress) return;

    setOfflineMessage('Removendo pacote offline...');
    const otherPackages = (await getAllPackageMeta()).filter((item) => item.id !== offlinePackage.id);
    const sharedUrls = new Set(otherPackages.flatMap((item) => item.urls || []));
    const sharedAssets = new Set(otherPackages.flatMap((item) => item.assets || []));
    await deleteStoredResponses((offlinePackage.urls || []).filter((url) => !sharedUrls.has(url)));
    await deleteCachedAssets((offlinePackage.assets || []).filter((url) => !sharedAssets.has(url)));
    await deletePackageMeta(selectedGame.name, dexMode);
    setOfflinePackage(null);
    setOfflineMessage('Pacote offline removido.');
  }

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  const filteredPokemon = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return pokemonList;
    return pokemonList.filter((pokemon) => pokemon.label.toLowerCase().includes(normalized) || pokemon.name.includes(normalized));
  }, [pokemonList, query]);

  const filteredAllPokemon = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allPokemonList;
    return allPokemonList.filter((pokemon) => pokemon.label.toLowerCase().includes(normalized) || pokemon.name.includes(normalized));
  }, [allPokemonList, query]);

  function goBack() {
    if (screen === 'details') {
      setScreen(selectedGame ? 'pokemon' : 'all-pokemon');
      return;
    }
    if (screen === 'pokemon') {
      setScreen('games');
      return;
    }
    if (screen === 'all-pokemon' || screen === 'games') {
      setScreen('home');
    }
  }

  function goHome() {
    setSelectedGame(null);
    setVersionGroup(null);
    setSelectedPokemon(null);
    setPokemonDetails(null);
    setQuery('');
    setOfflineMessage('');
    setOfflinePackage(null);
    setOfflineProgress(null);
    setScreen('home');
  }

  return h('main', { className: 'app-shell' },
    h(Header, {
      screen,
      selectedGame,
      selectedPokemon,
      installPrompt,
      theme,
      onThemeToggle: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
      onInstall: installApp,
      onHome: goHome,
      onBack: goBack,
      onBackToPokemon: () => setScreen('pokemon')
    }),
    error && h('section', { className: 'status error' }, error),
    loading && h('section', { className: 'status' }, loading),
    screen === 'home' && h(HomeView, {
      gamesCount: games.length,
      allPokemonCount: allPokemonTotal || allPokemonList.length,
      onOpenAllPokemon: openAllPokemon,
      onOpenGames: () => {
        setSelectedGame(null);
        setSelectedPokemon(null);
        setPokemonDetails(null);
        setQuery('');
        setScreen('games');
      }
    }),
    screen === 'games' && h(GamesView, { games, onOpenGame: openGame }),
    screen === 'all-pokemon' && h(AllPokemonView, {
      pokemon: filteredAllPokemon,
      totalCount: allPokemonTotal || allPokemonList.length,
      query,
      onQuery: setQuery,
      onOpenPokemon: openPokemon
    }),
    screen === 'pokemon' && h(PokemonView, {
      game: selectedGame,
      versionGroup,
      dexMode,
      pokemon: filteredPokemon,
      query,
      offlinePackage,
      offlineProgress,
      offlineMessage,
      onQuery: setQuery,
      onDexModeChange: changeDexMode,
      onDownloadOffline: downloadOfflinePackage,
      onRemoveOffline: removeOfflinePackage,
      onOpenPokemon: openPokemon
    }),
    screen === 'details' && h(DetailsView, {
      game: selectedGame,
      pokemon: selectedPokemon,
      details: pokemonDetails,
      onOpenPokemon: openPokemon
    })
  );
}
