import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../store/gameStore';

export function SettingsPanel() {
  const settings = useGameStore((state) => state.settings);
  const setSettings = useGameStore((state) => state.setSettings);
  const [handSizeStr, setHandSizeStr] = useState(String(settings.handSize));
  const [numbersStr, setNumbersStr] = useState(String(settings.copiesPerCategory.numbers));
  const [windsStr, setWindsStr] = useState(String(settings.copiesPerCategory.winds));
  const [dragonsStr, setDragonsStr] = useState(String(settings.copiesPerCategory.dragons));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    setHandSizeStr(String(settings.handSize));
    setNumbersStr(String(settings.copiesPerCategory.numbers));
    setWindsStr(String(settings.copiesPerCategory.winds));
    setDragonsStr(String(settings.copiesPerCategory.dragons));
  }, [settings]);

  function clearToastTimer() {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  }

  useEffect(() => () => {
    clearToastTimer();
  }, []);

  const onKeyApply = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      applyChanges();
    }
  };

  function clampInt(valueStr: string, min: number, max: number) {
    const parsed = Number.parseInt(valueStr, 10);
    const fallback = Number.isNaN(parsed) ? min : parsed;
    const clamped = Math.max(min, Math.min(max, fallback));
    return { value: clamped, adjusted: String(clamped) !== String(valueStr) };
  }

  function applyChanges() {
    const handSize = clampInt(handSizeStr, 4, 9);
    const numbers = clampInt(numbersStr, 1, 12);
    const winds = clampInt(windsStr, 1, 12);
    const dragons = clampInt(dragonsStr, 1, 12);

    const messages: string[] = [];
    if (handSize.adjusted) messages.push(`Hand size adjusted to ${handSize.value} (allowed 4-9)`);
    if (numbers.adjusted) messages.push(`Number tiles copies adjusted to ${numbers.value} (allowed 1-12)`);
    if (winds.adjusted) messages.push(`Wind tiles copies adjusted to ${winds.value} (allowed 1-12)`);
    if (dragons.adjusted) messages.push(`Dragon tiles copies adjusted to ${dragons.value} (allowed 1-12)`);

    setHandSizeStr(String(handSize.value));
    setNumbersStr(String(numbers.value));
    setWindsStr(String(winds.value));
    setDragonsStr(String(dragons.value));

    if (messages.length > 0) {
      setToastMessage(messages.join(' - '));
      clearToastTimer();
      toastTimer.current = window.setTimeout(() => {
        setToastMessage(null);
        toastTimer.current = null;
      }, 3000);
    }

    setSettings({
      handSize: handSize.value,
      copiesPerCategory: { numbers: numbers.value, winds: winds.value, dragons: dragons.value },
    });
  }

  return (
    <div className="settings-body">
      <div className="setting-row--group">
        <div className="setting-row">
          <label>
            Hand size
            <span className="input-help" aria-hidden title="Number of tiles in the player's hand. Typical values: 4-5.">i</span>
          </label>
          <input
            type="number"
            min={4}
            max={9}
            value={handSizeStr}
            onChange={(e) => { setHandSizeStr(e.target.value); }}
            onBlur={applyChanges}
            onKeyDown={onKeyApply}
          />
        </div>

        <div className="setting-row">
          <label>
            Number tiles copies
            <span className="input-help" aria-hidden title="How many copies of each number tile (1-9 in 3 suits) exist in the deck. Total number tiles = 27 × this value.">i</span>
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={numbersStr}
            onChange={(e) => { setNumbersStr(e.target.value); }}
            onBlur={applyChanges}
            onKeyDown={onKeyApply}
          />
        </div>

        <div className="setting-row">
          <label>
            Wind tiles copies
            <span className="input-help" aria-hidden title="How many copies of each wind tile (East/South/West/North) exist in the deck.">i</span>
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={windsStr}
            onChange={(e) => { setWindsStr(e.target.value); }}
            onBlur={applyChanges}
            onKeyDown={onKeyApply}
          />
        </div>

        <div className="setting-row">
          <label>
            Dragon tiles copies
            <span className="input-help" aria-hidden title="How many copies of each dragon tile (Red/Green/White) exist in the deck.">i</span>
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={dragonsStr}
            onChange={(e) => { setDragonsStr(e.target.value); }}
            onBlur={applyChanges}
            onKeyDown={onKeyApply}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="ghost-button" type="button" onClick={applyChanges} style={{ minWidth: 128 }}>
          Apply settings
        </button>
      </div>

      {toastMessage && typeof document !== 'undefined'
        ? createPortal(
            <div className="toast" role="status">{toastMessage}</div>,
            document.body,
          )
        : null}
    </div>
  );
}
