import { useState } from 'react';
import { formatLocationName, formatName, idFromUrl, spriteForSpecies } from '../utils/format.js';
import { extractEncountersForVersion, extractMovesForVersionGroup, formatEvolutionDetails } from '../utils/pokemonData.js';
import { SectionCard } from './SectionCard.jsx';

const TYPE_COLORS = {
  normal: '#9ca3af',
  fire: '#f97316',
  water: '#2563eb',
  electric: '#eab308',
  grass: '#16a34a',
  ice: '#38bdf8',
  fighting: '#dc2626',
  poison: '#9333ea',
  ground: '#ca8a04',
  flying: '#60a5fa',
  psychic: '#ec4899',
  bug: '#65a30d',
  rock: '#78716c',
  ghost: '#7c3aed',
  dragon: '#4f46e5',
  dark: '#374151',
  steel: '#64748b',
  fairy: '#f472b6'
};

const VERSION_GROUP_VERSIONS = {
  'red-blue': ['red', 'blue'],
  yellow: ['yellow'],
  'gold-silver': ['gold', 'silver'],
  crystal: ['crystal'],
  'ruby-sapphire': ['ruby', 'sapphire'],
  emerald: ['emerald'],
  'firered-leafgreen': ['firered', 'leafgreen'],
  'diamond-pearl': ['diamond', 'pearl'],
  platinum: ['platinum'],
  'heartgold-soulsilver': ['heartgold', 'soulsilver'],
  'black-white': ['black', 'white'],
  'black-2-white-2': ['black-2', 'white-2'],
  'x-y': ['x', 'y'],
  'omega-ruby-alpha-sapphire': ['omega-ruby', 'alpha-sapphire'],
  'sun-moon': ['sun', 'moon'],
  'ultra-sun-ultra-moon': ['ultra-sun', 'ultra-moon'],
  'lets-go-pikachu-lets-go-eevee': ['lets-go-pikachu', 'lets-go-eevee'],
  'sword-shield': ['sword', 'shield'],
  'brilliant-diamond-and-shining-pearl': ['brilliant-diamond', 'shining-pearl'],
  'legends-arceus': ['legends-arceus'],
  'scarlet-violet': ['scarlet', 'violet']
};

function typeColor(typeName) {
  return TYPE_COLORS[typeName] || '#dc2626';
}

function TypeBadge({ type }) {
  const name = typeof type === 'string' ? type : type?.type?.name;
  if (!name) return null;

  return (
    <span className="badge type-badge" style={{ '--type-color': typeColor(name) }}>
      {formatName(name)}
    </span>
  );
}

function moveVersionOptions(moves) {
  const versions = new Map();

  moves.forEach((entry) => {
    entry.version_group_details.forEach((detail) => {
      const group = detail.version_group;
      if (!versions.has(group.name)) {
        versions.set(group.name, {
          name: group.name,
          label: formatName(group.name),
          id: idFromUrl(group.url)
        });
      }
    });
  });

  return Array.from(versions.values()).sort((a, b) => a.id - b.id || a.label.localeCompare(b.label));
}

function groupMovesForTabs(moves) {
  return moves.reduce((groups, move) => {
    if (move.method === 'level-up') {
      groups.levelUp.push(move);
    } else if (move.method === 'egg') {
      groups.egg.push(move);
    } else if (['machine', 'tm', 'hm', 'tr'].includes(move.method)) {
      groups.machine.push(move);
    } else if (move.method === 'tutor') {
      groups.tutor.push(move);
    }
    return groups;
  }, { levelUp: [], egg: [], machine: [], tutor: [] });
}

function versionsForGroup(groupName) {
  return VERSION_GROUP_VERSIONS[groupName] || [groupName];
}

function encountersForVersionGroup(encounters, groupName) {
  const byLocation = new Map();

  versionsForGroup(groupName)
    .flatMap((versionName) => extractEncountersForVersion(encounters, versionName))
    .forEach((encounter) => {
      const current = byLocation.get(encounter.location);
      if (!current) {
        byLocation.set(encounter.location, { ...encounter, methods: [...encounter.methods] });
        return;
      }

      current.maxChance = Math.max(current.maxChance, encounter.maxChance);
      current.methods = Array.from(new Set([...current.methods, ...encounter.methods]));
    });

  return Array.from(byLocation.values()).sort((a, b) => a.location.localeCompare(b.location));
}

export function DetailsView({ game, pokemon, details, onOpenPokemon }) {
  const [spriteMode, setSpriteMode] = useState('normal');
  const [selectedVersionGroup, setSelectedVersionGroup] = useState('');
  if (!details) return <section className="details-grid" />;

  const normalSprite = details.pokemon.sprites.front_default || spriteForSpecies(pokemon.id);
  const shinySprite = details.pokemon.sprites.front_shiny || normalSprite;
  const currentSprite = spriteMode === 'shiny' ? shinySprite : normalSprite;
  const bestStat = details.pokemon.stats
    .slice()
    .sort((a, b) => b.base_stat - a.base_stat)[0];
  const primaryType = details.pokemon.types[0]?.type.name;
  const bestStatPercent = Math.min(100, Math.round((bestStat.base_stat / 255) * 100));
  const versionOptions = moveVersionOptions(details.pokemon.moves);

  return (
    <section className="details-grid">
      <SectionCard as="article" className="profile-panel">
        <div className="profile-media">
          <div className="sprite-preview">
            <img
              src={currentSprite}
              alt={`${pokemon.label} ${spriteMode === 'shiny' ? 'shiny' : 'normal'}`}
              width={160}
              height={160}
            />
          </div>
          <div className="segmented-control sprite-toggle" role="group" aria-label="Visualização do sprite">
            <button
              className={spriteMode === 'normal' ? 'is-active' : ''}
              onClick={() => setSpriteMode('normal')}
              type="button"
              title="Sprite normal"
              aria-label="Mostrar sprite normal"
            >
              <span className="sprite-icon sprite-icon-normal" aria-hidden="true" />
            </button>
            <button
              className={spriteMode === 'shiny' ? 'is-active' : ''}
              onClick={() => setSpriteMode('shiny')}
              type="button"
              disabled={!details.pokemon.sprites.front_shiny}
              title="Sprite shiny"
              aria-label="Mostrar sprite shiny"
            >
              <span className="sprite-icon sprite-icon-shiny" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-heading">
            <span className="kicker">{`National #${String(details.pokemon.id).padStart(3, '0')}`}</span>
            <h2>{pokemon.label}</h2>
            <div className="badge-row">
              {details.pokemon.types.map((slot) => (
                <TypeBadge key={slot.type.name} type={slot} />
              ))}
            </div>
          </div>
          <div className="pokemon-facts">
            <div className="fact-card highlight best-stat-card" style={{ '--stat-color': typeColor(primaryType) }}>
              <span>Destaque</span>
              <div className="best-stat-heading">
                <strong>{formatName(bestStat.stat.name)}</strong>
                <b>{bestStat.base_stat}</b>
              </div>
              <div className="best-stat-meter" aria-hidden="true">
                <span style={{ width: `${bestStatPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
      <SectionCard as="article" className="evolution-panel" title="Cadeia de Evolução" subtitle="Condições principais">
        <div className="evolution-tree">
          <EvolutionNode
            node={details.evolutionChain.chain}
            currentPokemonName={details.pokemon.name}
            evolutionPokemon={details.evolutionPokemon || {}}
            onOpenPokemon={onOpenPokemon}
          />
        </div>
      </SectionCard>
      <section className="game-data-section">
        <div className="game-data-header">
          <div>
            <h2>Dados por jogo</h2>
            <span>Moves e locais respondem à mesma seleção</span>
          </div>
          <label className="version-select-field">
            <span>Versão / Jogo</span>
            <select
              className="version-select"
              value={selectedVersionGroup}
              onChange={(event) => setSelectedVersionGroup(event.target.value)}
              aria-label="Selecionar jogo para dados por versão"
            >
              <option value="">Selecione o jogo</option>
              {versionOptions.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="game-data-cards">
          <SectionCard as="article" className="moves-panel">
            <VersionMovesSection moves={details.pokemon.moves} selectedVersionGroup={selectedVersionGroup} />
          </SectionCard>
          <SectionCard as="article" className="encounters-panel">
            <VersionEncountersSection
              encounters={details.rawEncounters || []}
              selectedVersionGroup={selectedVersionGroup}
            />
          </SectionCard>
        </div>
      </section>
    </section>
  );
}

function EncountersList({ encounters }) {
  if (encounters.length === 0) {
    return (
      <p className="muted">
        Nenhum local de captura selvagem registrado para essa versão. Pode depender de evolução, troca, presente, evento
        ou transferência.
      </p>
    );
  }

  return (
    <div className="encounter-list">
      {encounters.map((encounter) => (
        <div key={encounter.location} className="encounter-card">
          <div>
            <strong>{formatLocationName(encounter.location)}</strong>
            <span>{`Chance máxima: ${encounter.maxChance}%`}</span>
          </div>
          <div className="encounter-methods">
            {encounter.methods.map((method) => (
              <span key={method}>{method}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EvolutionNode({ node, currentPokemonName, evolutionPokemon, onOpenPokemon, condition = '', depth = 0 }) {
  const speciesId = idFromUrl(node.species.url);
  const evolutionDetails = evolutionPokemon[node.species.name];
  const pokemon = {
    id: speciesId,
    name: node.species.name,
    label: formatName(node.species.name),
    entryNumber: speciesId,
    speciesUrl: node.species.url
  };
  const types = evolutionDetails?.types || [];
  const sprite = evolutionDetails?.sprites?.front_default || spriteForSpecies(node.species);
  const isCurrent = node.species.name === currentPokemonName;

  return (
    <div className="evolution-node" style={{ '--evolution-delay': `${Math.min(depth, 5) * 70}ms` }}>
      <div className="evolution-stage">
        <button
          className={`evolution-card${isCurrent ? ' is-current' : ''}`}
          onClick={() => onOpenPokemon(pokemon)}
          type="button"
          aria-current={isCurrent ? 'true' : undefined}
        >
          <img
            src={sprite}
            alt={formatName(node.species.name)}
            loading="lazy"
            width={72}
            height={72}
          />
          <span className="evolution-card-name">{formatName(node.species.name)}</span>
          <span className="evolution-type-row">
            {types.length > 0 ? types.map((slot) => <TypeBadge key={slot.type.name} type={slot} />) : <TypeBadge type="normal" />}
          </span>
          {condition && <span className="evolution-condition">{condition}</span>}
        </button>
      </div>
      {node.evolves_to.length > 0 && (
        <div className="evolution-children">
          {node.evolves_to.map((child) => (
            <div key={child.species.name} className="evolution-branch">
              <span className="evolution-connector" aria-hidden="true" />
              <EvolutionNode
                node={child}
                currentPokemonName={currentPokemonName}
                evolutionPokemon={evolutionPokemon}
                onOpenPokemon={onOpenPokemon}
                condition={formatEvolutionDetails(child.evolution_details)}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VersionMovesSection({ moves, selectedVersionGroup }) {
  const [activeTab, setActiveTab] = useState('level-up');
  const selectedMoves = selectedVersionGroup ? extractMovesForVersionGroup(moves, selectedVersionGroup) : [];
  const groupedMoves = groupMovesForTabs(selectedMoves);
  const tabs = [
    { key: 'level-up', label: 'Level Up', moves: groupedMoves.levelUp.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)) },
    { key: 'egg', label: 'Egg', moves: groupedMoves.egg.sort((a, b) => a.name.localeCompare(b.name)) },
    { key: 'machine', label: 'TM/HM', moves: groupedMoves.machine.sort((a, b) => a.name.localeCompare(b.name)) },
    { key: 'tutor', label: 'Tutor', moves: groupedMoves.tutor.sort((a, b) => a.name.localeCompare(b.name)) }
  ].filter((tab) => tab.moves.length > 0);
  const selectedTab = tabs.some((tab) => tab.key === activeTab) ? activeTab : tabs[0]?.key;
  const visibleMoves = tabs.find((tab) => tab.key === selectedTab)?.moves || [];

  return (
    <>
      <div className="section-title moves-version-title">
        <div>
          <h2>Moves por versão</h2>
          <span>{selectedVersionGroup ? `${selectedMoves.length} registros` : 'Selecione uma versão'}</span>
        </div>
      </div>

      {!selectedVersionGroup ? (
        <p className="muted">Selecione uma versão para ver os dados.</p>
      ) : selectedMoves.length === 0 ? (
        <p className="muted">Nenhum move encontrado para essa versão.</p>
      ) : tabs.length === 0 ? (
        <p className="muted">Nenhum move encontrado para esses métodos nessa versão.</p>
      ) : (
        <>
          <div className="move-tabs" role="tablist" aria-label="Métodos de aprendizado">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={selectedTab === tab.key ? 'is-active' : ''}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                type="button"
                aria-selected={selectedTab === tab.key}
              >
                {`${tab.label} ${tab.moves.length}`}
              </button>
            ))}
          </div>
          <MovesTable moves={visibleMoves} />
        </>
      )}
    </>
  );
}

function VersionEncountersSection({ encounters, selectedVersionGroup }) {
  const selectedEncounters = selectedVersionGroup ? encountersForVersionGroup(encounters, selectedVersionGroup) : [];

  return (
    <>
      <div className="section-title moves-version-title">
        <div>
          <h2>Onde capturar</h2>
          <span>{selectedVersionGroup ? `${selectedEncounters.length} local(is)` : 'Selecione uma versão'}</span>
        </div>
      </div>
      {!selectedVersionGroup ? (
        <p className="muted">Selecione uma versão para ver os dados.</p>
      ) : (
        <EncountersList encounters={selectedEncounters} />
      )}
    </>
  );
}

function MovesTable({ moves }) {
  return (
    <div className="table-wrap compact-moves-table">
      <table>
        <thead>
          <tr>
            <th>Move</th>
            <th>Nível</th>
            <th>Como aprende</th>
          </tr>
        </thead>
        <tbody>
          {moves.map((move, index) => (
            <tr key={`${move.name}-${move.method}-${move.level}-${index}`}>
              <td>
                <strong>{formatName(move.name)}</strong>
              </td>
              <td>{move.level || '-'}</td>
              <td>{formatName(move.method)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
