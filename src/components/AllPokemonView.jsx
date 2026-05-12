import { spriteForSpecies } from '../utils/format.js';

export function AllPokemonView({ pokemon, totalCount, query, onQuery, onOpenPokemon }) {
  return (
    <section className="content-stack">
      <div className="toolbar">
        <div>
          <strong>{`${pokemon.length} Pokémon listados`}</strong>
          <span>{totalCount ? `National Dex completa · ${totalCount} espécies carregadas` : 'National Dex completa'}</span>
        </div>
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Buscar Pokémon" />
      </div>
      <div className="grid-list pokemon-grid">
        {pokemon.map((item) => (
          <button key={item.name} className="pokemon-card" onClick={() => onOpenPokemon(item)} type="button">
            <img src={spriteForSpecies(item.id)} alt={item.label} loading="lazy" width={72} height={72} />
            <span className="kicker">{`#${String(item.entryNumber).padStart(3, '0')}`}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
