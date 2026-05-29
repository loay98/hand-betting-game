# Hand Betting Game

A web‑based Mahjong‑style tile betting game built with **React**, **TypeScript**, **Vite**, **Zustand**, **Tailwind CSS**, and **Radix UI**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Core Concepts](#architecture--core-concepts)
3. [Game Rules & Edge‑Case Logic](#game-rules--edge‑case-logic)
4. [Setup & Development Workflow](#setup--development-workflow)
5. [Dependencies](#dependencies)
6. [Implementation Details](#implementation-details)
7. [Assumptions & Limitations](#assumptions--limitations)
8. [Contributing](#contributing)

---

## Project Overview

The game presents a hand of Mahjong tiles. The player bets whether the **next** hand will have a **higher** or **lower** total value. After each round the honor tiles (winds & dragons) shift their values based on the outcome, influencing future rounds. A leaderboard is persisted in the browser’s `localStorage`.

---

## Architecture & Core Concepts

* **React components** – UI is split into reusable components under `src/components/` (e.g., `GameView`, `HandPreview`, `TileCard`).
* **State management** – Global game state lives in a **Zustand** store (`src/store/gameStore.ts`). All game actions (start, bet, reshuffle, exit, etc.) are dispatched through a reducer‑style `reduceGameState` function.
* **Game engine** – Pure‑logic functions in `src/game/engine.ts` handle deck creation, hand drawing, outcome evaluation, honor‑value updates and round resolution.
* **Persistence** – Settings and the leaderboard are saved to `window.localStorage` via `src/game/persistence.ts`.
* **Styling** – Tailwind CSS utilities together with `tailwind-merge` for class composition; UI primitives from **Radix UI** (toast, slot) are used for accessibility.
* **Build tooling** – Vite provides fast development server and production bundling; TypeScript ensures type safety.

---

## Game Rules & Edge‑Case Logic

1. **Betting** – The player chooses **higher** or **lower**. The next hand is drawn and its total compared to the current hand.
2. **Honor tile value shift** – After a win, each honor tile’s value is increased by 1; after a loss it is decreased by 1. Number tiles keep their face value.
3. **Score calculation** – When the player wins, the round score equals the **sum of all honor tile values** (not the hand total). This is calculated by `calculateHonorValuesTotal`.
4. **Tie handling** – If the current hand and the next hand have the **same total points**, the round is considered a tie and is **skipped** (no points awarded, no honor shift). The implementation currently treats a tie as a loss, but the intended rule is documented here for future improvement.
5. **Automatic reshuffle & round skip** – If the draw pile contains **fewer tiles than the configured hand size**, the deck is automatically reshuffled (combining the discard pile and a fresh deck) and the round is **skipped**. This logic lives in `autoSkipShortRounds`.
6. **Game end conditions** – The game ends when a tile value reaches **0 or 10** (tile limit) or after **three deck exhaustions** (deck limit).

---

## Setup & Development Workflow

### Prerequisites

* Node.js ≥ 18
* npm (comes with Node)

### Installation

```bash
git clone <repo‑url>
cd hand-betting-game
npm install
```

### Running the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Building for production

```bash
npm run build
```

The compiled assets are emitted to the `dist/` folder.

### Linting / Type‑checking

The project uses TypeScript’s strict mode. Run:

```bash
npx tsc --noEmit
```

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| **react** / **react-dom** | UI library |
| **zustand** | Global state management |
| **tailwindcss** | Utility‑first CSS framework |
| **tailwind-merge** | Intelligent class merging |
| **@radix-ui/react-slot** | Slot primitive for composability |
| **@radix-ui/react-toast** | Accessible toast notifications |
| **clsx** | Conditional class name concatenation |
| **framer-motion** | Simple animations |
| **autoprefixer**, **postcss**, **@tailwindcss/postcss** | CSS processing pipeline |
| **vite**, **@vitejs/plugin-react** | Development server & bundler |
| **typescript** | Static typing |

---

## Implementation Details

* **Deck creation** – `createFreshDeck` builds a full set of tiles based on configurable copies per category (numbers, winds, dragons). Tiles are shuffled with `shuffleTiles`.
* **Honor values** – Stored in a map (`honorValues`) keyed by `"kind:label"`. `applyHonorValuesToHand` injects the current honor values into a hand for rendering.
* **Round resolution** – `resolveRound` draws the next hand, evaluates the bet, updates honor values, calculates points, and determines whether a reshuffle or game‑over condition occurred.
* **Automatic short‑round skip** – Implemented in `autoSkipShortRounds`. When the draw pile is too small, the deck is reshuffled, the round counter is incremented, and a toast informs the player.
* **Leaderboard persistence** – Stored as JSON under the key `hand-betting-game.leaderboard` in `localStorage`. The top 5 scores are kept.
* **Settings persistence** – Hand size and copies per category are saved under `hand-betting-game.settings`.
* **UI components** – `HonorPill`, `TileCard`, `SectionHeading`, etc., are thin wrappers that apply Tailwind classes and optional Radix UI primitives.

---

## Assumptions & Limitations

* The game assumes a **fixed hand size** (default 4) but can be changed via the settings panel.
* Honor tile values are bounded between **0 and 10**; reaching either bound ends the game.
* Currently a **tie** (equal hand totals) is treated as a loss; the documented rule to skip the round on a tie is a planned improvement.
* All persistence is client‑side; no backend or multiplayer support.
* The UI is designed for desktop browsers; touch‑specific optimisations are minimal.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Install dependencies and run the dev server.
4. Ensure TypeScript compiles without errors.
5. Submit a pull request with a clear description of the change.

---

## License

This project is licensed under the MIT License.
