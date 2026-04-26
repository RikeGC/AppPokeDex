import { h } from '../lib/react.js';

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
  onBackToPokemon
}) {
  const title =
    screen === 'games'
      ? 'Escolha um jogo oficial'
      : screen === 'pokemon'
        ? `Pokémon em ${selectedGame.label}`
        : selectedPokemon.label;

  const description =
    screen === 'games'
      ? 'Selecione uma versão para ver os Pokémon disponíveis na Pokédex daquele jogo.'
      : screen === 'pokemon'
        ? 'Pesquise ou escolha um Pokémon para ver evolução e golpes disponíveis nessa versão.'
        : `Evoluções e moves compatíveis com ${selectedGame.label}.`;

  const currentStep =
    screen === 'games'
      ? 'Jogos'
      : screen === 'pokemon'
        ? 'Pokémon'
        : 'Detalhes';

  const canGoBack = screen !== 'games';

  return h('header', { className: installPrompt ? 'hero has-install' : 'hero' },
    h('div', { className: 'app-header-bar' },
      canGoBack
        ? h('button', {
            className: 'icon-button back-button',
            onClick: onBack || onBackToPokemon,
            type: 'button',
            title: 'Voltar',
            'aria-label': 'Voltar'
          }, h('span', { 'aria-hidden': 'true' }, '‹'))
        : h('button', {
            className: 'icon-button back-button is-placeholder',
            type: 'button',
            disabled: true,
            'aria-hidden': 'true',
            tabIndex: -1
          }, h('span', { 'aria-hidden': 'true' }, '‹')),

      h('button', { className: 'brand-button', onClick: onHome, type: 'button', 'aria-label': 'Ir para o início' },
        h('span', { className: 'brand-icon' }, '◓'),
        h('span', { className: 'brand-text' },
          h('strong', null, 'Pokédex'),
          h('small', null, 'PWA')
        )
      ),

      h('div', { className: 'hero-actions' },
        h('button', {
          className: 'icon-button theme-button',
          onClick: onThemeToggle,
          type: 'button',
          title: theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro',
          'aria-label': theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'
        }, h('span', { 'aria-hidden': 'true' }, theme === 'dark' ? '☀' : '☾')),
        installPrompt &&
          h('button', {
            className: 'icon-button install-button',
            onClick: onInstall,
            type: 'button',
            title: 'Instalar app',
            'aria-label': 'Instalar app'
          }, h('span', { 'aria-hidden': 'true' }, '↓'))
      )
    ),

    h('nav', { className: 'breadcrumbs', 'aria-label': 'Navegação atual' },
      h('span', { className: 'breadcrumb-item is-current' }, currentStep),
      selectedGame && h('span', { className: 'breadcrumb-item' }, selectedGame.label),
      selectedPokemon && screen === 'details' &&
        h('span', { className: 'breadcrumb-item' }, selectedPokemon.label)
    ),

    h('div', { className: 'hero-content' },
      h('span', { className: 'hero-eyebrow' }, 'Pokédex interativa'),
      h('h1', null, title),
      h('p', null, description)
    )
  );
}
