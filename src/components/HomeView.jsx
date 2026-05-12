import { Icon } from './Icon.jsx';
import { spriteForSpecies } from '../utils/format.js';

export function HomeView({ pokemon = [], gamesCount, allPokemonCount, onOpenAllPokemon, onOpenGames }) {
  return (
    <section className="home-screen">
      <div className="home-copy">
        <span className="home-kicker">Pokédex interativa</span>
        <h2>Explore Pokémon por National Dex ou por jogo oficial</h2>
        <p>
          Escolha a lista completa para navegar por todas as espécies, ou entre pelos jogos para ver a Pokédex regional,
          capturas, evoluções e moves daquela versão.
        </p>
        <div className="home-actions">
          <button className="primary-button home-action" onClick={onOpenAllPokemon} type="button">
            <Icon name="paw-print" weight="fill" className="action-icon" />
            <span>Ver todos os Pokémon</span>
          </button>
          <button className="ghost-button home-action" onClick={onOpenGames} type="button">
            <Icon name="game-controller" className="action-icon" />
            <span>Ver todos os jogos</span>
          </button>
        </div>
        <div className="home-stats" aria-label="Resumo da Pokédex">
          <span>
            <strong>{allPokemonCount || '...'}</strong>
            <small>Pokémon</small>
          </span>
          <span>
            <strong>{gamesCount || '...'}</strong>
            <small>Jogos</small>
          </span>
        </div>
      </div>
      <div className="home-showcase" aria-label="Pokémon em destaque">
        {pokemon.map((item) => (
          <span key={item.id} className="showcase-pokemon">
            <img src={spriteForSpecies(item.id)} alt={item.label} width={96} height={96} />
            <strong>{item.label}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}
