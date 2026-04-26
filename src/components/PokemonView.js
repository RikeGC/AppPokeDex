import { h } from '../lib/react.js';
import { formatDate, formatName, spriteForSpecies } from '../utils/format.js';

export function PokemonView({
  game,
  versionGroup,
  dexMode,
  pokemon,
  query,
  offlinePackage,
  offlineProgress,
  offlineMessage,
  onQuery,
  onDexModeChange,
  onDownloadOffline,
  onRemoveOffline,
  onOpenPokemon
}) {
  return h('section', { className: 'content-stack' },
    h('div', { className: 'toolbar' },
      h('div', null,
        h('strong', null, `${pokemon.length} Pokémon listados`),
        h('span', null, dexMode === 'regional'
          ? `Pokédex regional · ${versionGroup ? formatName(versionGroup.name) : game.label}`
          : `National Dex até ${versionGroup ? formatName(versionGroup.generation.name) : 'a geração do jogo'}`)
      ),
      h('div', { className: 'segmented-control', role: 'group', 'aria-label': 'Modo da Pokédex' },
        h('button', {
          className: dexMode === 'regional' ? 'is-active' : '',
          onClick: () => onDexModeChange('regional'),
          type: 'button'
        }, 'Regional'),
        h('button', {
          className: dexMode === 'national' ? 'is-active' : '',
          onClick: () => onDexModeChange('national'),
          type: 'button'
        }, 'National Dex')
      ),
      h('input', { value: query, onChange: (event) => onQuery(event.target.value), placeholder: 'Buscar Pokémon' })
    ),
    h('div', { className: 'offline-panel' },
      h('div', null,
        h('strong', null, offlinePackage ? 'Disponível offline' : 'Dados offline'),
        h('span', null, offlinePackage
          ? `${offlinePackage.count} Pokémon salvos · ${formatDate(offlinePackage.downloadedAt)}`
          : 'Baixe este jogo para abrir sem consultar a API toda vez.')
      ),
      offlineProgress && h('div', { className: 'offline-progress' },
        h('span', null, offlineProgress.label),
        h('progress', { value: offlineProgress.done, max: offlineProgress.total })
      ),
      h('div', { className: 'offline-actions' },
        h('button', {
          className: 'primary-button',
          disabled: Boolean(offlineProgress),
          onClick: onDownloadOffline,
          type: 'button'
        }, offlinePackage ? 'Atualizar offline' : 'Baixar offline'),
        offlinePackage && h('button', {
          className: 'ghost-button',
          disabled: Boolean(offlineProgress),
          onClick: onRemoveOffline,
          type: 'button'
        }, 'Remover')
      ),
      offlineMessage && h('p', { className: 'muted offline-message' }, offlineMessage)
    ),
    h('div', { className: 'grid-list pokemon-grid' },
      pokemon.map((item) => h('button', { key: item.name, className: 'pokemon-card', onClick: () => onOpenPokemon(item) },
        h('img', { src: spriteForSpecies(item.id), alt: item.label, loading: 'lazy', width: 72, height: 72 }),
        h('span', { className: 'kicker' }, `#${String(item.entryNumber).padStart(3, '0')}`),
        h('strong', null, item.label)
      ))
    )
  );
}

