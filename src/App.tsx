import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { useGameController } from './game/useGameController';
import { LandingPage } from './components/LandingPage';
import { GameView } from './components/GameView';
import { GameOverScreen } from './components/GameOverScreen';

const SETTINGS_KEY = 'hand-betting-game.settings';

export default function App() {
  const [storedSettings, setStoredSettings] = useState(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { handSize: 4, copiesPerCategory: { numbers: 4, winds: 4, dragons: 4 } };
      const parsed = JSON.parse(raw);
      // migrate old shape if necessary
      if (parsed && typeof parsed.copiesPerCategory === 'object') return parsed;
      // if old shape had copiesPerTile, convert it
      if (parsed && typeof parsed.copiesPerTile === 'number') {
        return { handSize: parsed.handSize ?? 4, copiesPerCategory: { numbers: parsed.copiesPerTile, winds: parsed.copiesPerTile, dragons: parsed.copiesPerTile } };
      }
      return { handSize: parsed.handSize ?? 4, copiesPerCategory: { numbers: 4, winds: 4, dragons: 4 } };
    } catch {
      return { handSize: 4, copiesPerCategory: { numbers: 4, winds: 4, dragons: 4 } };
    }
  });

  const { state, actions } = useGameController();

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(storedSettings));
    } catch {
      // ignore
    }
  }, [storedSettings]);

  useEffect(() => {
    if (state.toasts.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      actions.clearToasts();
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [actions, state.toasts]);

  const toastViewport = state.toasts.length > 0 && typeof document !== 'undefined'
    ? createPortal(
        <div className="toast-stack" role="status" aria-live="polite">
          {state.toasts.map((message, index) => (
            <div className="toast" key={`${message}-${index}`}>{message}</div>
          ))}
        </div>,
        document.body,
      )
    : null;

  const handleRestart = () => {
    actions.restartGame();
  };

  if (state.status === 'landing') {
    return (
      <>
        <LandingPage
          leaderboard={state.leaderboard}
          onStart={(settings) => actions.startGame(settings)}
          settings={storedSettings}
          onSettingsChange={setStoredSettings}
        />
        {toastViewport}
      </>
    );
  }

  if (state.status === 'gameOver') {
    return (
      <>
        <GameOverScreen state={state} onRestart={handleRestart} onReturnHome={actions.returnHome} />
        {toastViewport}
      </>
    );
  }

  return (
    <>
      <GameView state={state} onBetHigher={actions.betHigher} onBetLower={actions.betLower} onExit={actions.exitGame} />
      {toastViewport}
    </>
  );
}
