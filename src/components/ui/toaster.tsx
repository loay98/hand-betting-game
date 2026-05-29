import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export function Toaster() {
  const toasts = useGameStore((state) => state.toasts);
  const clearToasts = useGameStore((state) => state.clearToasts);

  if (toasts.length === 0) {
    return null;
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      clearToasts();
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [clearToasts, toasts]);

  return createPortal(
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((message, index) => (
        <div className="toast" key={`${message}-${index}`}>{message}</div>
      ))}
    </div>,
    document.body,
  );
}
