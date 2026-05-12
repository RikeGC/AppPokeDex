import packageInfo from '../../package.json';
import { formatDate } from '../utils/format.js';
import { Icon } from './Icon.jsx';

export function Settings({
  theme,
  onThemeToggle,
  games,
  offlinePackages,
  offlineProgress,
  offlineMessage,
  onDownloadOfflineGame,
  onRemoveOfflineGame
}) {
  const cachedByGame = new Map(offlinePackages.map((item) => [item.gameName, item]));

  return (
    <section className="content-stack settings-screen">
      <section className="panel settings-panel">
        <h2>Aparência</h2>
        <div className="settings-row">
          <div>
            <strong>Modo de cor</strong>
            <span className="muted">Controle principal para alternar entre claro e escuro.</span>
          </div>
          <button className="ghost-button settings-theme-button" onClick={onThemeToggle} type="button">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
          </button>
        </div>
      </section>

      <section className="panel settings-panel">
        <h2>Dados offline</h2>
        <p className="muted">Dados offline permitem abrir o app sem consultar a API toda vez.</p>

        <div className="settings-game-list">
          {games.map((game) => {
            const cachedPackage = cachedByGame.get(game.name);

            return (
              <div className="settings-game-item" key={game.name}>
                <div>
                  <strong>{game.label}</strong>
                  {cachedPackage && (
                    <span className="muted">
                      {`${cachedPackage.dexMode === 'regional' ? 'Regional' : 'National Dex'} · ${cachedPackage.count} Pokémon · ${formatDate(cachedPackage.downloadedAt)}`}
                    </span>
                  )}
                </div>
                <button
                  className="ghost-button"
                  disabled={Boolean(offlineProgress)}
                  onClick={() => cachedPackage ? onRemoveOfflineGame(game) : onDownloadOfflineGame(game)}
                  type="button"
                >
                  {cachedPackage ? 'Remover' : 'Baixar'}
                </button>
              </div>
            );
          })}
        </div>

        {offlineProgress && (
          <div className="offline-progress settings-progress">
            <span>{offlineProgress.label}</span>
            <progress value={offlineProgress.done} max={offlineProgress.total} />
          </div>
        )}

        {offlineMessage && <p className="muted offline-message">{offlineMessage}</p>}
      </section>

      <section className="panel settings-panel">
        <h2>Sobre</h2>
        <div className="settings-meta">
          <span>Pokédex RGC</span>
          <span>{`Versão ${packageInfo.version}`}</span>
          <span>Repositório não informado</span>
        </div>
      </section>
    </section>
  );
}
