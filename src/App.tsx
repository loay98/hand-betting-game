import { GameOverScreen } from './components/GameOverScreen';
import { GameView } from './components/GameView';
import { LandingPage } from './components/LandingPage';
import { Toaster } from './components/ui/toaster';
import { useGameStore } from './store/gameStore';

export default function App() {
  const status = useGameStore((state) => state.status);

  return (
    <>
      {status === 'landing' ? <LandingPage /> : null}
      {status === 'game' ? <GameView /> : null}
      {status === 'gameOver' ? <GameOverScreen /> : null}
      <Toaster />
    </>
  );
}
