import { useGameController } from './game/useGameController';
import { LandingPage } from './components/LandingPage';
import { GameView } from './components/GameView';
import { GameOverScreen } from './components/GameOverScreen';

export default function App() {
  const { state, actions } = useGameController();

  if (state.status === 'landing') {
    return <LandingPage leaderboard={state.leaderboard} onStart={actions.startGame} />;
  }

  if (state.status === 'gameOver') {
    return <GameOverScreen state={state} onRestart={actions.restartGame} onReturnHome={actions.returnHome} />;
  }

  return <GameView state={state} onBetHigher={actions.betHigher} onBetLower={actions.betLower} onExit={actions.exitGame} />;
}
