import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Settings = {
  handSize: number;
  copiesPerCategory: { numbers: number; winds: number; dragons: number };
};

interface Props {
  settings: Settings;
  onChange: (next: Settings) => void;
}

export function SettingsPanel({ settings, onChange }: Props) {
  const [handSizeStr, setHandSizeStr] = useState(String(settings.handSize));
  const [numbersStr, setNumbersStr] = useState(String(settings.copiesPerCategory.numbers));
  const [windsStr, setWindsStr] = useState(String(settings.copiesPerCategory.winds));
  const [dragonsStr, setDragonsStr] = useState(String(settings.copiesPerCategory.dragons));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  // toast is shown in the top-right corner; no per-input anchoring needed

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

  useEffect(() => () => { clearToastTimer(); }, []);

  function clampInt(valueStr: string, min: number, max: number) {
    const parsed = parseInt(valueStr, 10);
    const fallback = isNaN(parsed) ? min : parsed;
    const clamped = Math.max(min, Math.min(max, fallback));
    return { value: clamped, adjusted: String(clamped) !== String(valueStr) };
  }

  function applyChanges() {
    const hsRes = clampInt(handSizeStr, 4, 9);
    const numsRes = clampInt(numbersStr, 1, 12);
    const windsRes = clampInt(windsStr, 1, 12);
    const dragonsRes = clampInt(dragonsStr, 1, 12);

    const messages: string[] = [];
    if (hsRes.adjusted) messages.push(`Hand size adjusted to ${hsRes.value} (allowed 4–9)`);
    if (numsRes.adjusted) messages.push(`Number tiles copies adjusted to ${numsRes.value} (allowed 1–12)`);
    if (windsRes.adjusted) messages.push(`Wind tiles copies adjusted to ${windsRes.value} (allowed 1–12)`);
    if (dragonsRes.adjusted) messages.push(`Dragon tiles copies adjusted to ${dragonsRes.value} (allowed 1–12)`);

    // Update inputs to adjusted values so user sees the correction
    setHandSizeStr(String(hsRes.value));
    setNumbersStr(String(numsRes.value));
    setWindsStr(String(windsRes.value));
    setDragonsStr(String(dragonsRes.value));

      // Notify via toast if any adjustments were made (fixed top-right)
      if (messages.length > 0) {
        setToastMessage(messages.join(' — '));
        clearToastTimer();
        toastTimer.current = window.setTimeout(() => { setToastMessage(null); toastTimer.current = null; }, 3000);
      }

    onChange({
      handSize: hsRes.value,
      copiesPerCategory: { numbers: numsRes.value, winds: windsRes.value, dragons: dragonsRes.value },
    });
  }

  const onKeyApply = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applyChanges();
  };

  // validation now auto-corrects on apply; inline error boxes removed in favor of transient toast notifications

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
      {toastMessage && typeof document !== 'undefined' && createPortal(
        <div className="toast" role="status">{toastMessage}</div>,
        document.body,
      )}
    </div>
  );
}

export default SettingsPanel;
