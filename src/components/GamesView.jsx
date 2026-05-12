import { fallbackCover } from '../data/gameCovers.js';

export function GamesView({ games, onOpenGame }) {
  return (
    <section className="grid-list games-grid">
      {games.map((game) => (
        <button key={game.name} className="game-card" onClick={() => onOpenGame(game)}>
          <span className="game-cover-wrap">
            <img
              className="game-cover"
              src={game.cover}
              alt={`Capa de ${game.label}`}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = fallbackCover(game.name);
              }}
            />
          </span>
          <span className="game-card-body">
            <span className="kicker">{`#${String(game.id).padStart(2, '0')}`}</span>
            <strong>{game.label}</strong>
            <span>Abrir Pokédex</span>
          </span>
        </button>
      ))}
    </section>
  );
}
