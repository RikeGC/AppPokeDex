import { h } from '../lib/react.js';
import { fallbackCover } from '../data/gameCovers.js';

export function GamesView({ games, onOpenGame }) {
  return h('section', { className: 'grid-list games-grid' },
    games.map((game) => h('button', { key: game.name, className: 'game-card', onClick: () => onOpenGame(game) },
      h('span', { className: 'game-cover-wrap' },
        h('img', {
          className: 'game-cover',
          src: game.cover,
          alt: `Capa de ${game.label}`,
          loading: 'lazy',
          onError: (event) => {
            event.currentTarget.src = fallbackCover(game.name);
          }
        })
      ),
      h('span', { className: 'game-card-body' },
        h('span', { className: 'kicker' }, `#${String(game.id).padStart(2, '0')}`),
        h('strong', null, game.label),
        h('span', null, 'Abrir Pokédex')
      )
    ))
  );
}
