# Contributing to Ashen Banner

Thanks for your interest. This is a TypeScript + Canvas 2D tactics game with
**no asset pipeline** — every sprite, sound, and bit of "art" is defined in code.
Keep that constraint in mind: new content is data + code, not image/audio files.

## Setup

```bash
npm ci          # install (uses the committed lockfile)
npm run dev     # Vite dev server (http://localhost:5173, falls back to 5174)
npm test        # full Vitest suite (Node env — no DOM/canvas)
npm run build   # tsc --noEmit (strict) + vite build
```

`npm run build` **and** `npm test` must both pass before a change lands — CI
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs both on every push
and PR.

## Ground rules

- **TypeScript strict.** No `any` escapes, no build errors.
- **Match the surrounding style** — comment density, naming, idioms. Read the
  neighbours before adding code.
- **Tests are Node-env** (`vite.config` sets `test.environment: "node"`), so
  `document`/`canvas`/`window` don't exist in tests. Test pure data + logic;
  guard any browser API behind `typeof window !== "undefined"`. Sprite-baking and
  the renderer can't run in the suite — verify those in a real browser.
- **The shared core files** — `src/core/types.ts`, `src/battle/combat.ts`,
  `src/scenes/battleScene.ts`, `src/battle/ai.ts`, `src/battle/forecast.ts` — are
  touched by almost everything. Prefer one focused change at a time.
- **The damage forecast must stay honest.** `src/battle/forecast.ts` mirrors
  `src/battle/combat.ts` (minus the RNG roll) and feeds both the UI preview and
  the AI. If you change a damage rule in combat, change it in forecast too.
- **The stat pipeline is fragile.** `statsForUnit()` in `src/core/unit.ts` is the
  single source of truth (class + level + race + equipment + mastery). Anything
  that recomputes stats (level-up, class change, equip) funnels through it — add
  derived bonuses there, not in scattered call sites.
- The **AI-vs-AI sim** (`tests/battleSim.test.ts`) auto-plays full battles; keep
  it converging (e.g. the AI skips charged skills so it never stalls).

## Adding content (the patterns)

- **A class:** add to the `ClassId` union (`types.ts`), `CLASSES` + skill list
  (`data/classes.ts`), skills (`data/skills.ts`), a 16×20 sprite
  (`data/sprites/characters.ts`) + 14×14 skill icons (`data/sprites/skills.ts`),
  and a weapon if needed (`data/weapons.ts`). Follow the Summoner/Geomancer
  entries. `tests/sprites.test.ts` auto-validates sprite dimensions.
- **A skill:** `SkillDef` in `data/skills.ts` + an icon; add its id to a class's
  `skillIds`. Flags like `knockback`/`pull`/`throwOver`/`leap`/`chargeTime` opt
  into the corresponding battle mechanic.
- **A map:** a `MapDef` under `data/maps/` (heights, blocked mask, optional
  `terrain` grid, spawns, enemies, objective), registered in `data/maps/index.ts`.
  Maps must seat at least `partyCapForPhase(index)` player spawns.
- **A persisted setting / save field:** add it to `GameState` (`core/state.ts`),
  default it in `createGameState`, normalize it for old saves in `loadGame`, and
  **copy it in all three of** `menuScenes.applyLoaded`/`resetState` and
  `partySelectScene.begin` — forgetting one is the classic bug.

## Verifying gameplay in a browser

The suite can't render. To check UI/rendering, drive the dev server headlessly:
`npm i puppeteer-core --no-save` in a temp dir and point `executablePath` at an
installed Chromium/Edge/Brave. Use `npm run dev` (not `preview` — `preview` serves
under a `/ashen-banner/` base and 404s at `/`).

## Commits

Keep messages clear and scoped (`feat(area): …` / `fix: …`). One finished change
per commit. Open a PR against `main`.
