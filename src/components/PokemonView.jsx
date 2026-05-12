import { formatName, spriteForSpecies } from '../utils/format.js';

export function PokemonView({
  game,
  versionGroup,
  dexMode,
  pokemon,
  query,
  onQuery,
  onDexModeChange,
  onOpenPokemon
}) {
  return (
    <section className="content-stack">
      <div className="toolbar pokemon-toolbar">
        <div className="dex-toggle-bar">
          <span className="dex-count">{`${pokemon.length} Pokémon listados`}</span>
          <div className="dex-toggle">
            <button
              className={`dex-toggle-btn${dexMode === 'regional' ? ' is-active' : ''}`}
              onClick={() => onDexModeChange('regional')}
              type="button"
            >
              Regional
            </button>
            <button
              className={`dex-toggle-btn${dexMode === 'national' ? ' is-active' : ''}`}
              onClick={() => onDexModeChange('national')}
              type="button"
            >
              National
            </button>
          </div>
        </div>
        <span className="dex-context">
          {dexMode === 'regional'
            ? `Pokédex regional · ${versionGroup ? formatName(versionGroup.name) : game.label}`
            : `National Dex até ${versionGroup ? formatName(versionGroup.generation.name) : 'a geração do jogo'}`}
        </span>
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Buscar Pokémon" />
      </div>
      <div className="grid-list pokemon-grid">
        {pokemon.map((item) => (
          <button key={item.name} className="pokemon-card" onClick={() => onOpenPokemon(item)}>
            <img src={spriteForSpecies(item.id)} alt={item.label} loading="lazy" width={72} height={72} />
            <span className="kicker">{`#${String(item.entryNumber).padStart(3, '0')}`}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
