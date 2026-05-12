import { useEffect, useMemo, useState } from 'react';
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
import { AllPokemonView } from './components/AllPokemonView.jsx';
import { DetailsView } from './components/DetailsView.jsx';
import { GamesView } from './components/GamesView.jsx';
import { Header } from './components/Header.jsx';
import { HomeView } from './components/HomeView.jsx';
import { PokemonView } from './components/PokemonView.jsx';
import { Settings } from './components/Settings.jsx';
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
  const [homeShowcase, setHomeShowcase] = useState([]);
  const [allPokemonTotal, setAllPokemonTotal] = useState(0);
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [offlinePackage, setOfflinePackage] = useState(null);
  const [offlinePackages, setOfflinePackages] = useState([]);
  const [offlineProgress, setOfflineProgress] = useState(null);
  const [offlineMessage, setOfflineMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('pokedex-theme') || 'light');

  useEffect(() => {
    loadGames();
    loadPokemonTotal();
    loadHomeShowcase();

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
    if (screen !== 'settings') return;
    refreshOfflinePackages();
  }, [screen]);

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

  function randomOffsets(total, count) {
    const offsets = new Set();
    while (offsets.size < Math.min(count, total)) {
      offsets.add(Math.floor(Math.random() * total));
    }
    return Array.from(offsets);
  }

  async function loadHomeShowcase() {
    try {
      const summary = await apiGet('/pokemon-species?limit=1');
      const offsets = randomOffsets(summary.count || 0, 4);
      const entries = await Promise.all(offsets.map(async (offset) => {
        const data = await apiGet(`/pokemon-species?limit=1&offset=${offset}`);
        return data.results[0];
      }));
      setHomeShowcase(entries
        .filter(Boolean)
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
        .filter((pokemon) => Number.isFinite(pokemon.id)));
    } catch (err) {
      setHomeShowcase([]);
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
      const { group, list: regionalList } = await loadRegionalPokemonForGame(game);
      setVersionGroup(group);
      setRegionalPokemonList(regionalList);
      setPokemonList(regionalList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function loadRegionalPokemonForGame(game) {
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

    return {
      group,
      list: Array.from(entries.values()).sort((a, b) => a.entryNumber - b.entryNumber || a.id - b.id)
    };
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

  async function refreshOfflinePackages() {
    setOfflinePackages((await getAllPackageMeta()).sort((a, b) => b.downloadedAt - a.downloadedAt));
  }

  async function downloadOfflinePackage() {
    if (!selectedGame || !versionGroup || pokemonList.length === 0 || offlineProgress) return;
    await downloadOfflinePackageForGame(selectedGame, dexMode, versionGroup, pokemonList);
  }

  async function downloadOfflinePackageForGame(game, mode = 'regional', group = null, list = []) {
    if (!game || offlineProgress) return;

    let packageGroup = group;
    let packageList = list;
    const urls = new Set();
    const assetUrls = new Set();
    const startedAt = Date.now();
    setOfflineMessage('');
    setOfflineProgress({ done: 0, total: packageList.length || 1, label: 'Preparando pacote offline...' });

    try {
      urls.add(normalizeApiUrl('/version?limit=200'));
      urls.add(normalizeApiUrl(game.url));
      if (game.cover && !game.cover.startsWith('data:')) assetUrls.add(game.cover);

      if (!packageGroup || packageList.length === 0) {
        const regionalData = await loadRegionalPokemonForGame(game);
        packageGroup = regionalData.group;
        packageList = regionalData.list;
      }

      if (mode === 'national') {
        const generationId = idFromUrl(packageGroup.generation.url);
        for (let index = 1; index <= generationId; index += 1) {
          urls.add(normalizeApiUrl(`/generation/${index}`));
          await apiGet(`/generation/${index}`);
        }
        packageList = await loadNationalDexUntilGeneration(packageGroup);
      }

      setOfflineProgress({ done: 0, total: packageList.length, label: 'Preparando pacote offline...' });

      const version = await apiGet(game.url);
      urls.add(normalizeApiUrl(version.version_group.url));
      const group = await apiGet(version.version_group.url);
      await Promise.all(group.pokedexes.map(async (pokedex) => {
        urls.add(normalizeApiUrl(pokedex.url));
        await apiGet(pokedex.url);
      }));

      for (let index = 0; index < packageList.length; index += 1) {
        const item = packageList[index];
        setOfflineProgress({ done: index, total: packageList.length, label: `Baixando ${item.label}...` });

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
        id: packageKey(game.name, mode),
        gameName: game.name,
        gameLabel: game.label,
        dexMode: mode,
        count: packageList.length,
        urls: Array.from(urls),
        assets: Array.from(assetUrls),
        downloadedAt: Date.now(),
        elapsedMs: Date.now() - startedAt
      };
      await savePackageMeta(meta);
      if (selectedGame?.name === game.name && dexMode === mode) setOfflinePackage(meta);
      await refreshOfflinePackages();
      setOfflineMessage(`${game.label} (${mode === 'regional' ? 'Regional' : 'National Dex'}) salvo para offline.`);
    } catch (err) {
      setOfflineMessage('Não foi possível concluir o download offline. Confira a conexão e tente novamente.');
    } finally {
      setOfflineProgress(null);
    }
  }

  async function removeOfflinePackage() {
    if (!offlinePackage) return;
    await removeOfflinePackageByMeta(offlinePackage);
  }

  async function removeOfflinePackageByMeta(packageMeta) {
    if (!packageMeta || offlineProgress) return;

    setOfflineMessage('Removendo pacote offline...');
    await deleteOfflinePackage(packageMeta);
    if (offlinePackage?.id === packageMeta.id) setOfflinePackage(null);
    await refreshOfflinePackages();
    setOfflineMessage('Pacote offline removido.');
  }

  async function removeOfflinePackagesForGame(game) {
    if (!game || offlineProgress) return;

    const gamePackages = (await getAllPackageMeta()).filter((item) => item.gameName === game.name);
    if (gamePackages.length === 0) return;

    setOfflineMessage('Removendo pacote offline...');
    for (const packageMeta of gamePackages) {
      await deleteOfflinePackage(packageMeta);
    }
    if (gamePackages.some((item) => item.id === offlinePackage?.id)) setOfflinePackage(null);
    await refreshOfflinePackages();
    setOfflineMessage('Pacote offline removido.');
  }

  async function deleteOfflinePackage(packageMeta) {
    const otherPackages = (await getAllPackageMeta()).filter((item) => item.id !== packageMeta.id);
    const sharedUrls = new Set(otherPackages.flatMap((item) => item.urls || []));
    const sharedAssets = new Set(otherPackages.flatMap((item) => item.assets || []));
    await deleteStoredResponses((packageMeta.urls || []).filter((url) => !sharedUrls.has(url)));
    await deleteCachedAssets((packageMeta.assets || []).filter((url) => !sharedAssets.has(url)));
    await deletePackageMeta(packageMeta.gameName, packageMeta.dexMode);
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
    if (screen === 'all-pokemon' || screen === 'games' || screen === 'settings') {
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

  function goToGames() {
    setSelectedGame(null);
    setVersionGroup(null);
    setSelectedPokemon(null);
    setPokemonDetails(null);
    setQuery('');
    setScreen('games');
  }

  function openSettings() {
    setScreen('settings');
  }

  return (
    <main className="app-shell">
      <Header
        screen={screen}
        selectedGame={selectedGame}
        selectedPokemon={selectedPokemon}
        installPrompt={installPrompt}
        theme={theme}
        onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        onInstall={installApp}
        onHome={goHome}
        onBack={goBack}
        onGoToGames={goToGames}
        onOpenSettings={openSettings}
        onBackToPokemon={() => setScreen('pokemon')}
      />
      {error && <section className="status error">{error}</section>}
      {loading && <section className="status">{loading}</section>}
      {screen === 'home' && (
        <HomeView
          pokemon={homeShowcase}
          gamesCount={games.length}
          allPokemonCount={allPokemonTotal || allPokemonList.length}
          onOpenAllPokemon={openAllPokemon}
          onOpenGames={() => {
            setSelectedGame(null);
            setSelectedPokemon(null);
            setPokemonDetails(null);
            setQuery('');
            setScreen('games');
          }}
        />
      )}
      {screen === 'games' && <GamesView games={games} onOpenGame={openGame} />}
      {screen === 'all-pokemon' && (
        <AllPokemonView
          pokemon={filteredAllPokemon}
          totalCount={allPokemonTotal || allPokemonList.length}
          query={query}
          onQuery={setQuery}
          onOpenPokemon={openPokemon}
        />
      )}
      {screen === 'pokemon' && (
        <PokemonView
          game={selectedGame}
          versionGroup={versionGroup}
          dexMode={dexMode}
          pokemon={filteredPokemon}
          query={query}
          onQuery={setQuery}
          onDexModeChange={changeDexMode}
          onOpenPokemon={openPokemon}
        />
      )}
      {screen === 'settings' && (
        <Settings
          theme={theme}
          onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          games={games}
          offlinePackages={offlinePackages}
          offlineProgress={offlineProgress}
          offlineMessage={offlineMessage}
          onDownloadOfflineGame={(game) => downloadOfflinePackageForGame(game)}
          onRemoveOfflineGame={removeOfflinePackagesForGame}
        />
      )}
      {screen === 'details' && (
        <DetailsView
          game={selectedGame}
          pokemon={selectedPokemon}
          details={pokemonDetails}
          onOpenPokemon={openPokemon}
        />
      )}
    </main>
  );
}
