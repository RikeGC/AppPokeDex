import { useState } from 'react';
import { formatLocationName, formatName, idFromUrl, spriteForSpecies } from '../utils/format.js';
import { formatEvolutionDetails, groupMovesByMethod } from '../utils/pokemonData.js';

export function DetailsView({ game, pokemon, details, onOpenPokemon }) {
  const [spriteMode, setSpriteMode] = useState('normal');
  if (!details) return <section className="details-grid" />;

  const normalSprite = details.pokemon.sprites.front_default || spriteForSpecies(pokemon.id);
  const shinySprite = details.pokemon.sprites.front_shiny || normalSprite;
  const currentSprite = spriteMode === 'shiny' ? shinySprite : normalSprite;
  const bestStat = details.pokemon.stats
    .slice()
    .sort((a, b) => b.base_stat - a.base_stat)[0];

  return (
    <section className="details-grid">
      <article className="panel profile-panel">
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
                <span key={slot.type.name} className="badge">
                  {formatName(slot.type.name)}
                </span>
              ))}
            </div>
          </div>
          <div className="pokemon-facts">
            <div className="fact-card highlight">
              <span>Melhor atributo</span>
              <strong>{`${formatName(bestStat.stat.name)} ${bestStat.base_stat}`}</strong>
            </div>
          </div>
        </div>
      </article>
      <article className="panel evolution-panel">
        <div className="section-title">
          <h2>Árvore de evolução</h2>
          <span>Condições principais</span>
        </div>
        <div className="evolution-tree">
          <EvolutionNode node={details.evolutionChain.chain} onOpenPokemon={onOpenPokemon} />
        </div>
      </article>
      <article className="panel encounters-panel">
        <div className="section-title">
          <h2>{game ? 'Onde capturar' : 'Captura por jogo'}</h2>
          <span>{game ? `${details.encounters.length} local(is)` : 'Escolha um jogo para ver rotas'}</span>
        </div>
        {game ? (
          <EncountersList encounters={details.encounters} />
        ) : (
          <p className="muted">
            A lista completa mostra dados gerais. Para locais de captura, entre pela tela de jogos e escolha uma versão.
          </p>
        )}
      </article>
      <article className="panel moves-panel">
        <div className="section-title">
          <h2>{game ? 'Moves disponíveis' : 'Moves por versão'}</h2>
          <span>{game ? `${details.moves.length} registros` : 'Disponível ao abrir por jogo'}</span>
        </div>
        {game ? (
          <MovesTable moves={details.moves} />
        ) : (
          <p className="muted">
            Os moves mudam conforme a versão. Abra um jogo oficial para consultar os métodos de aprendizado corretos.
          </p>
        )}
      </article>
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

function EvolutionNode({ node, onOpenPokemon }) {
  const speciesId = idFromUrl(node.species.url);
  const pokemon = {
    id: speciesId,
    name: node.species.name,
    label: formatName(node.species.name),
    entryNumber: speciesId,
    speciesUrl: node.species.url
  };

  return (
    <div className="evolution-node">
      <div className="evolution-stage">
        <button className="evolution-card" onClick={() => onOpenPokemon(pokemon)} type="button">
          <img
            src={spriteForSpecies(node.species)}
            alt={formatName(node.species.name)}
            loading="lazy"
            width={72}
            height={72}
          />
          <strong>{formatName(node.species.name)}</strong>
        </button>
        {node.evolves_to.length > 0 && (
          <div className="evolution-condition-list">
            {node.evolves_to.map((child) => (
              <span key={child.species.name} className="evolution-condition">
                {node.evolves_to.length > 1
                  ? `${formatName(child.species.name)}: ${formatEvolutionDetails(child.evolution_details)}`
                  : formatEvolutionDetails(child.evolution_details)}
              </span>
            ))}
          </div>
        )}
      </div>
      {node.evolves_to.length > 0 && (
        <div className="evolution-children">
          {node.evolves_to.map((child) => (
            <div key={child.species.name} className="evolution-branch">
              <EvolutionNode node={child} onOpenPokemon={onOpenPokemon} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MovesTable({ moves }) {
  const [activeTab, setActiveTab] = useState('level-up');
  if (moves.length === 0) return <p className="muted">Nenhum move encontrado para essa versão.</p>;

  const groups = groupMovesByMethod(moves);
  const tabs = [
    { key: 'level-up', label: 'Level Up', moves: groups.levelUp },
    { key: 'machine', label: 'Máquinas', moves: groups.machine },
    { key: 'other', label: 'Outros', moves: groups.other }
  ].filter((tab) => tab.moves.length > 0);
  const selectedTab = tabs.some((tab) => tab.key === activeTab) ? activeTab : tabs[0].key;
  const selectedMoves = tabs.find((tab) => tab.key === selectedTab).moves;

  return (
    <div className="table-wrap">
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
            {`${tab.label} (${tab.moves.length})`}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>Move</th>
            <th>{selectedTab === 'level-up' ? 'Nível' : 'Como aprende'}</th>
          </tr>
        </thead>
        <tbody>
          {selectedMoves.map((move) => (
            <tr key={`${move.name}-${move.method}-${move.level}`}>
              <td>
                <strong>{formatName(move.name)}</strong>
              </td>
              <td>{selectedTab === 'level-up' ? move.level : formatName(move.method)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
