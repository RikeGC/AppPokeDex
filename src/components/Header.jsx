import { Icon } from './Icon.jsx';

export function Header({
  screen,
  selectedGame,
  selectedPokemon,
  installPrompt,
  theme,
  onThemeToggle,
  onInstall,
  onHome,
  onBack,
  onGoToGames,
  onOpenSettings,
  onBackToPokemon
}) {
  const title =
    screen === 'home'
      ? 'Pokédex'
      : screen === 'games'
        ? 'Escolha um jogo oficial'
        : screen === 'all-pokemon'
          ? 'Todos os Pokémon'
          : screen === 'pokemon'
            ? `Pokémon em ${selectedGame.label}`
            : screen === 'settings'
              ? 'Configurações'
              : selectedPokemon.label;

  const description =
    screen === 'home'
      ? 'Sua central para consultar Pokémon, jogos oficiais, evoluções, capturas e moves.'
      : screen === 'games'
        ? 'Selecione uma versão para ver os Pokémon disponíveis na Pokédex daquele jogo.'
        : screen === 'all-pokemon'
          ? 'Navegue pela National Dex completa e abra qualquer espécie para ver dados gerais e evolução.'
          : screen === 'pokemon'
            ? 'Pesquise ou escolha um Pokémon para ver evolução e golpes disponíveis nessa versão.'
            : screen === 'settings'
              ? 'Ajuste aparência, pacotes offline e informações do app.'
              : selectedGame
                ? `Evoluções e moves compatíveis com ${selectedGame.label}.`
                : 'Dados gerais, tipos e árvore de evolução.';

  const canGoBack = screen !== 'home';

  return (
    <header className={installPrompt ? 'hero has-install' : 'hero'}>
      <div className="app-header-bar">
        {canGoBack ? (
          <button
            className="icon-button back-button"
            onClick={onBack || onBackToPokemon}
            type="button"
            title="Voltar"
            aria-label="Voltar"
          >
            <Icon name="caret-left" />
          </button>
        ) : (
          <button
            className="icon-button back-button is-placeholder"
            type="button"
            disabled
            aria-hidden="true"
            tabIndex={-1}
          >
            <Icon name="caret-left" />
          </button>
        )}

        <button className="brand-button" onClick={onHome} type="button" aria-label="Ir para o início">
          <span className="brand-icon">
            <Icon name="circle-notch" weight="fill" />
          </span>
          <span className="brand-text">
            <strong>Pokédex</strong>
            <small>RGC</small>
          </span>
        </button>

        <div className="hero-actions">
          <button
            className="icon-button settings-button"
            onClick={onOpenSettings}
            type="button"
            title="Configurações"
            aria-label="Configurações"
          >
            <Icon name="gear-six" />
          </button>
          {installPrompt && (
            <button
              className="icon-button install-button"
              onClick={onInstall}
              type="button"
              title="Instalar app"
              aria-label="Instalar app"
            >
              <Icon name="download-simple" />
            </button>
          )}
        </div>
      </div>

      <nav className="breadcrumbs" aria-label="Navegação atual">
        {[
          { key: 'home', label: 'Início', onClick: onHome },
          ...(screen === 'games' || screen === 'pokemon' || (screen === 'details' && selectedGame)
            ? [{ key: 'games', label: 'Jogos', onClick: onGoToGames || onBack }]
            : []),
          ...(screen === 'all-pokemon' || (screen === 'details' && !selectedGame)
            ? [{ key: 'all-pokemon', label: 'Todos os Pokémon', onClick: onBack }]
            : []),
          ...(screen === 'settings'
            ? [{ key: 'settings', label: 'Configurações' }]
            : []),
          ...(screen === 'pokemon' && selectedGame
            ? [{ key: 'game', label: selectedGame.label, onClick: onBackToPokemon }]
            : []),
          ...(screen === 'details' && selectedGame
            ? [{ key: 'game', label: selectedGame.label, onClick: onBackToPokemon }]
            : []),
          ...(screen === 'details' && selectedPokemon
            ? [{ key: 'pokemon', label: selectedPokemon.label }]
            : [])
        ].map((item, index, items) => {
          const isCurrent = index === items.length - 1;

          return isCurrent ? (
            <span key={item.key} className="breadcrumb-item is-current" aria-current="page">
              {item.label}
            </span>
          ) : (
            <button key={item.key} className="breadcrumb-item breadcrumb-link" onClick={item.onClick} type="button">
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="hero-content">
        <span className="hero-eyebrow">Pokédex interativa</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
