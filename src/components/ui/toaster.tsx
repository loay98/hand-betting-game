import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export function Toaster() {
  const toasts = useGameStore((state) => state.toasts);
  const clearToasts = useGameStore((state) => state.clearToasts);

  // The effect must be declared before any conditional return so that the
  // hook order stays consistent across renders. When there are no toasts we
  // simply skip setting a timer.
  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      clearToasts();
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [clearToasts, toasts]);

  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((message, index) => (
        <div className="toast" key={`${message}-${index}`}>{message}</div>
      ))}
    </div>,
    document.body,
  );
}
