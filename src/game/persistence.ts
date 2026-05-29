import type { GameSettings } from './types';

const SETTINGS_KEY = 'hand-betting-game.settings';

const DEFAULT_SETTINGS: GameSettings = {
  handSize: 4,
  copiesPerCategory: { numbers: 4, winds: 4, dragons: 4 },
};

export function loadStoredSettings(): GameSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<GameSettings> & { copiesPerTile?: number };
    if (parsed && typeof parsed.copiesPerCategory === 'object') {
      return {
        handSize: parsed.handSize ?? DEFAULT_SETTINGS.handSize,
        copiesPerCategory: {
          numbers: parsed.copiesPerCategory.numbers ?? DEFAULT_SETTINGS.copiesPerCategory.numbers,
          winds: parsed.copiesPerCategory.winds ?? DEFAULT_SETTINGS.copiesPerCategory.winds,
          dragons: parsed.copiesPerCategory.dragons ?? DEFAULT_SETTINGS.copiesPerCategory.dragons,
        },
      };
    }

    if (parsed && typeof parsed.copiesPerTile === 'number') {
      return {
        handSize: parsed.handSize ?? DEFAULT_SETTINGS.handSize,
        copiesPerCategory: {
          numbers: parsed.copiesPerTile,
          winds: parsed.copiesPerTile,
          dragons: parsed.copiesPerTile,
        },
      };
    }

    return {
      handSize: parsed?.handSize ?? DEFAULT_SETTINGS.handSize,
      copiesPerCategory: { ...DEFAULT_SETTINGS.copiesPerCategory },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: GameSettings) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
