import { h } from '../lib/react.js';
import { Icon } from './Icon.js';

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
    screen === 'home'
      ? 'Pokédex'
      : screen === 'games'
        ? 'Escolha um jogo oficial'
        : screen === 'all-pokemon'
          ? 'Todos os Pokémon'
          : screen === 'pokemon'
            ? `Pokémon em ${selectedGame.label}`
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
            : selectedGame
              ? `Evoluções e moves compatíveis com ${selectedGame.label}.`
              : 'Dados gerais, tipos e árvore de evolução.';

  const currentStep =
    screen === 'home'
      ? 'Início'
      : screen === 'games'
        ? 'Jogos'
        : screen === 'all-pokemon'
          ? 'Todos'
          : screen === 'pokemon'
            ? 'Pokémon'
            : 'Detalhes';

  const canGoBack = screen !== 'home';
  const showGameBreadcrumb = selectedGame && (screen === 'pokemon' || screen === 'details');

  return h('header', { className: installPrompt ? 'hero has-install' : 'hero' },
    h('div', { className: 'app-header-bar' },
      canGoBack
        ? h('button', {
            className: 'icon-button back-button',
            onClick: onBack || onBackToPokemon,
            type: 'button',
            title: 'Voltar',
            'aria-label': 'Voltar'
          }, h(Icon, { name: 'caret-left' }))
        : h('button', {
            className: 'icon-button back-button is-placeholder',
            type: 'button',
            disabled: true,
            'aria-hidden': 'true',
            tabIndex: -1
          }, h(Icon, { name: 'caret-left' })),

      h('button', { className: 'brand-button', onClick: onHome, type: 'button', 'aria-label': 'Ir para o início' },
        h('span', { className: 'brand-icon' }, h(Icon, { name: 'circle-notch', weight: 'fill' })),
        h('span', { className: 'brand-text' },
          h('strong', null, 'Pokédex'),
          h('small', null, 'RGC')
        )
      ),

      h('div', { className: 'hero-actions' },
        h('button', {
          className: 'icon-button theme-button',
          onClick: onThemeToggle,
          type: 'button',
          title: theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro',
          'aria-label': theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'
        }, h(Icon, { name: theme === 'dark' ? 'sun' : 'moon' })),
        installPrompt &&
          h('button', {
            className: 'icon-button install-button',
            onClick: onInstall,
            type: 'button',
            title: 'Instalar app',
            'aria-label': 'Instalar app'
          }, h(Icon, { name: 'download-simple' }))
      )
    ),

    h('nav', { className: 'breadcrumbs', 'aria-label': 'Navegação atual' },
      h('span', { className: 'breadcrumb-item is-current' }, currentStep),
      showGameBreadcrumb && h('span', { className: 'breadcrumb-item' }, selectedGame.label),
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
