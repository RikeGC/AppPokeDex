import { h } from '../lib/react.js';
import { spriteForSpecies } from '../utils/format.js';

export function AllPokemonView({ pokemon, totalCount, query, onQuery, onOpenPokemon }) {
  return h('section', { className: 'content-stack' },
    h('div', { className: 'toolbar' },
      h('div', null,
        h('strong', null, `${pokemon.length} Pokémon listados`),
        h('span', null, totalCount ? `National Dex completa · ${totalCount} espécies carregadas` : 'National Dex completa')
      ),
      h('input', { value: query, onChange: (event) => onQuery(event.target.value), placeholder: 'Buscar Pokémon' })
    ),
    h('div', { className: 'grid-list pokemon-grid' },
      pokemon.map((item) => h('button', { key: item.name, className: 'pokemon-card', onClick: () => onOpenPokemon(item), type: 'button' },
        h('img', { src: spriteForSpecies(item.id), alt: item.label, loading: 'lazy', width: 72, height: 72 }),
        h('span', { className: 'kicker' }, `#${String(item.entryNumber).padStart(3, '0')}`),
        h('strong', null, item.label)
      ))
    )
  );
}
