import { h } from '../lib/react.js';
import { Icon } from './Icon.js';
import { spriteForSpecies } from '../utils/format.js';

export function HomeView({ gamesCount, allPokemonCount, onOpenAllPokemon, onOpenGames }) {
  const showcase = [
    { id: 25, name: 'Pikachu' },
    { id: 6, name: 'Charizard' },
    { id: 448, name: 'Lucario' },
    { id: 658, name: 'Greninja' }
  ];

  return h('section', { className: 'home-screen' },
    h('div', { className: 'home-copy' },
      h('span', { className: 'home-kicker' }, 'Pokédex interativa'),
      h('h2', null, 'Explore Pokémon por National Dex ou por jogo oficial'),
      h('p', null, 'Escolha a lista completa para navegar por todas as espécies, ou entre pelos jogos para ver a Pokédex regional, capturas, evoluções e moves daquela versão.'),
      h('div', { className: 'home-actions' },
        h('button', { className: 'primary-button home-action', onClick: onOpenAllPokemon, type: 'button' },
          h(Icon, { name: 'paw-print', weight: 'fill', className: 'action-icon' }),
          h('span', null, 'Ver todos os Pokémon')
        ),
        h('button', { className: 'ghost-button home-action', onClick: onOpenGames, type: 'button' },
          h(Icon, { name: 'game-controller', className: 'action-icon' }),
          h('span', null, 'Ver todos os jogos')
        )
      ),
      h('div', { className: 'home-stats', 'aria-label': 'Resumo da Pokédex' },
        h('span', null,
          h('strong', null, allPokemonCount || '...'),
          h('small', null, 'Pokémon')
        ),
        h('span', null,
          h('strong', null, gamesCount || '...'),
          h('small', null, 'Jogos')
        )
      )
    ),
    h('div', { className: 'home-showcase', 'aria-label': 'Pokémon em destaque' },
      showcase.map((pokemon) => h('span', { key: pokemon.id, className: 'showcase-pokemon' },
        h('img', { src: spriteForSpecies(pokemon.id), alt: pokemon.name, width: 96, height: 96 }),
        h('strong', null, pokemon.name)
      ))
    )
  );
}
