import { h, useState } from '../lib/react.js';
import { formatLocationName, formatName, idFromUrl, spriteForSpecies } from '../utils/format.js';
import { formatEvolutionDetails, groupMovesByMethod } from '../utils/pokemonData.js';

export function DetailsView({ pokemon, details, onOpenPokemon }) {
  const [spriteMode, setSpriteMode] = useState('normal');
  if (!details) return h('section', { className: 'details-grid' });

  const normalSprite = details.pokemon.sprites.front_default || spriteForSpecies(pokemon.id);
  const shinySprite = details.pokemon.sprites.front_shiny || normalSprite;
  const currentSprite = spriteMode === 'shiny' ? shinySprite : normalSprite;
  const bestStat = details.pokemon.stats
    .slice()
    .sort((a, b) => b.base_stat - a.base_stat)[0];

  return h('section', { className: 'details-grid' },
    h('article', { className: 'panel profile-panel' },
      h('div', { className: 'profile-media' },
        h('div', { className: 'sprite-preview' },
          h('img', { src: currentSprite, alt: `${pokemon.label} ${spriteMode === 'shiny' ? 'shiny' : 'normal'}`, width: 160, height: 160 })
        ),
        h('div', { className: 'segmented-control sprite-toggle', role: 'group', 'aria-label': 'Visualização do sprite' },
          h('button', {
            className: spriteMode === 'normal' ? 'is-active' : '',
            onClick: () => setSpriteMode('normal'),
            type: 'button',
            title: 'Sprite normal',
            'aria-label': 'Mostrar sprite normal'
          }, h('span', { className: 'sprite-icon sprite-icon-normal', 'aria-hidden': 'true' })),
          h('button', {
            className: spriteMode === 'shiny' ? 'is-active' : '',
            onClick: () => setSpriteMode('shiny'),
            type: 'button',
            disabled: !details.pokemon.sprites.front_shiny,
            title: 'Sprite shiny',
            'aria-label': 'Mostrar sprite shiny'
          }, h('span', { className: 'sprite-icon sprite-icon-shiny', 'aria-hidden': 'true' }))
        )
      ),
      h('div', { className: 'profile-info' },
        h('div', { className: 'profile-heading' },
          h('span', { className: 'kicker' }, `National #${String(details.pokemon.id).padStart(3, '0')}`),
          h('h2', null, pokemon.label),
          h('div', { className: 'badge-row' }, details.pokemon.types.map((slot) => h('span', { key: slot.type.name, className: 'badge' }, formatName(slot.type.name))))
        ),
        h('div', { className: 'pokemon-facts' },
          h('div', { className: 'fact-card highlight' },
            h('span', null, 'Melhor atributo'),
            h('strong', null, `${formatName(bestStat.stat.name)} ${bestStat.base_stat}`)
          )
        )
      ),
    ),
    h('article', { className: 'panel evolution-panel' },
      h('div', { className: 'section-title' },
        h('h2', null, 'Árvore de evolução'),
        h('span', null, 'Condições principais')
      ),
      h('div', { className: 'evolution-tree' },
        h(EvolutionNode, { node: details.evolutionChain.chain, onOpenPokemon })
      )
    ),
    h('article', { className: 'panel encounters-panel' },
      h('div', { className: 'section-title' },
        h('h2', null, 'Onde capturar'),
        h('span', null, `${details.encounters.length} local(is)`)
      ),
      h(EncountersList, { encounters: details.encounters })
    ),
    h('article', { className: 'panel moves-panel' },
      h('div', { className: 'section-title' },
        h('h2', null, 'Moves disponíveis'),
        h('span', null, `${details.moves.length} registros`)
      ),
      h(MovesTable, { moves: details.moves })
    )
  );
}

function EncountersList({ encounters }) {
  if (encounters.length === 0) {
    return h('p', { className: 'muted' }, 'Nenhum local de captura selvagem registrado para essa versão. Pode depender de evolução, troca, presente, evento ou transferência.');
  }

  return h('div', { className: 'encounter-list' },
    encounters.map((encounter) => h('div', { key: encounter.location, className: 'encounter-card' },
      h('div', null,
        h('strong', null, formatLocationName(encounter.location)),
        h('span', null, `Chance máxima: ${encounter.maxChance}%`)
      ),
      h('div', { className: 'encounter-methods' },
        encounter.methods.map((method) => h('span', { key: method }, method))
      )
    ))
  );
}

function EvolutionNode({ node, onOpenPokemon }) {
  const speciesId = idFromUrl(node.species.url);
  const pokemon = {
    id: speciesId,
    name: node.species.name,
    label: formatName(node.species.name),
    entryNumber: speciesId,
    speciesUrl: node.species.url
  };

  return h('div', { className: 'evolution-node' },
    h('div', { className: 'evolution-stage' },
      h('button', { className: 'evolution-card', onClick: () => onOpenPokemon(pokemon), type: 'button' },
        h('img', { src: spriteForSpecies(node.species), alt: formatName(node.species.name), loading: 'lazy', width: 72, height: 72 }),
        h('strong', null, formatName(node.species.name))
      ),
      node.evolves_to.length > 0 && h('div', { className: 'evolution-condition-list' },
        node.evolves_to.map((child) => h('span', { key: child.species.name, className: 'evolution-condition' },
          node.evolves_to.length > 1
            ? `${formatName(child.species.name)}: ${formatEvolutionDetails(child.evolution_details)}`
            : formatEvolutionDetails(child.evolution_details)
        ))
      )
    ),
    node.evolves_to.length > 0 && h('div', { className: 'evolution-children' },
      node.evolves_to.map((child) => h('div', { key: child.species.name, className: 'evolution-branch' },
        h(EvolutionNode, { node: child, onOpenPokemon })
      ))
    )
  );
}

function MovesTable({ moves }) {
  const [activeTab, setActiveTab] = useState('level-up');
  if (moves.length === 0) return h('p', { className: 'muted' }, 'Nenhum move encontrado para essa versão.');

  const groups = groupMovesByMethod(moves);
  const tabs = [
    { key: 'level-up', label: 'Level Up', moves: groups.levelUp },
    { key: 'machine', label: 'Máquinas', moves: groups.machine },
    { key: 'other', label: 'Outros', moves: groups.other }
  ].filter((tab) => tab.moves.length > 0);
  const selectedTab = tabs.some((tab) => tab.key === activeTab) ? activeTab : tabs[0].key;
  const selectedMoves = tabs.find((tab) => tab.key === selectedTab).moves;

  return h('div', { className: 'table-wrap' },
    h('div', { className: 'move-tabs', role: 'tablist', 'aria-label': 'Métodos de aprendizado' },
      tabs.map((tab) => h('button', {
        key: tab.key,
        className: selectedTab === tab.key ? 'is-active' : '',
        onClick: () => setActiveTab(tab.key),
        role: 'tab',
        type: 'button',
        'aria-selected': selectedTab === tab.key
      }, `${tab.label} (${tab.moves.length})`))
    ),
    h('table', null,
      h('thead', null,
        h('tr', null,
          h('th', null, 'Move'),
          h('th', null, selectedTab === 'level-up' ? 'Nível' : 'Como aprende')
        )
      ),
      h('tbody', null,
        selectedMoves.map((move) => h('tr', { key: `${move.name}-${move.method}-${move.level}` },
          h('td', null, h('strong', null, formatName(move.name))),
          h('td', null, selectedTab === 'level-up' ? move.level : formatName(move.method))
        ))
      )
    )
  );
}

