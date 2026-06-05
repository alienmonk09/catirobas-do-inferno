# Working backlog & session handoff

Living task list for the autonomous build. The roadmap (`ROADMAP.md`) is the
"what"; this file is the "what's next + how we're working + where we left off".

## Working mode
- **Code via subagents; the main thread only coordinates** (verify, integrate, commit).
  Dispatch one feature per subagent (the core files — `combat.ts`, `battleScene.ts`,
  `ai.ts`, `forecast.ts`, `types.ts` — are shared, so parallel edits conflict; go
  sequential, or use worktree isolation if truly independent).
- Every change: keep TS strict happy (`npm run build`), keep `npm test` green, match
  codebase style, and browser-verify UI/gameplay (puppeteer-core recipe below).
- Commit each finished feature on the branch with a clear message + Co-Authored-By.

## Current state (resume point)
- Branch: **`feat/tactics-depth-and-progression`** (off `main`; not merged, not pushed).
- Build: clean. Tests: **499 passing across 21 files**.
- Last commit: `dc7ec4a feat(v0.3): secondary job`. Working tree: only docs
  (README short-roadmap line + this file) pending commit.
- Commits so far: v0.2+v0.3 base → Counter → Time Mage → objective variety → secondary job.

## Done (verified: build + tests + browser)
- **v0.2 Tactics depth** (multi-agent reviewed; 5 findings fixed): facing/back-attacks,
  line of sight, elevation modifiers, full status kit (poison/regen/stop/protect/shell,
  haste in practice), shared combat/forecast damage pipeline, AI buff/debuff+LOS.
- **v0.3**: classic-TBS roadmap; skill-card explanations + status chips; action-menu
  overhaul; party-size progression (recruit at camp, cap 4→5→6); 7 chapters + 2 larger
  maps (Cinder Fields 13×11, Outer Ramparts 12×12); elemental affinities; Time Mage
  (8th class); secondary job (sub-ability pool).
- **v0.4 (partial)**: Counter reaction (Knight/Monk); objective variety (rout / defeat
  Maldrath / survive).

## Next up (prioritized)
1. **Equipment slots** (v0.3) — armor + accessory: flat stat mods (def/res/hp/spd),
   maybe status immunity / elemental affinity. Touches `Unit`, the stat pipeline
   (`statsForLevel`/recompute on level-up & class change & refreshForBattle), camp UI,
   combat (armor def/res), data (armor/accessory defs + sprites), save/load validation.
   Note the stat pipeline is fragile — equipment bonuses must survive level-up/class change.
2. **More classes** (v0.3) — Lancer (Jump: leap-attack ignoring intervening units/height),
   Summoner (big AoE nukes), Geomancer (terrain-themed). Each needs a 16×20 char sprite +
   skills + skill icons; follow the Time Mage pattern. Update `ClassId` union + the two
   `Record<ClassId,…>` (CLASSES, CHARACTER_SPRITES).
3. **Terrain effects** (v0.4) — hazard/healing tiles applying end-of-turn HP deltas
   (handle in battleScene endActiveTurn + battleSim, since `endTurn` has no grid). May add
   a "lava" terrain type (TERRAIN style + defaultTerrain).
4. **Reaction abilities — finish** (v0.4): auto-potion, cover-an-ally; later equippable
   reactions (pairs with equipment).
5. **Audio** (v0.6) — WebAudio code-synth SFX (hit/crit/heal/magic/KO/select) + mute
   toggle; conservative/soft to avoid bad beeps. ⚠ can't verify sound headless — keep low
   volume + muteable. Music loop later.
6. **Objective variety — finish** (v0.4): seize-a-point, escort, defend; a survive map
   to actually use the survive kind.
7. **Skill charge time** (v0.4, FFT casting); **knockback / forced movement**;
   **zone of control**.
8. Later: shop/economy (gil), job mastery, recruitable enemies, difficulty modes,
   dialogue/cutscenes, fog of war. See `ROADMAP.md`.

## Known issues / cleanups
- AI doesn't account for walking into a Counter when scoring attacks (minor; counters
  just punish — acceptable, revisit with reaction depth).
- Optional skirmish maps still planned (more-phases item left them out).

## Browser verify recipe (from memory `browser-verification`)
`npm run dev` (port 5173, bg); temp dir `/tmp/tg-verify`, `npm i puppeteer-core --no-save`;
`.mjs` driver `import puppeteer from "puppeteer-core"`, Edge at
`/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`, `headless:"new"`.
Flow: New Game → `.unit-card.selectable`×4 → "Begin Campaign →" → "Begin Battle".
Camp at phase N: inject `localStorage["tactics-mvp-save"]` (units need `facing`) → "Continue".
Title has a "Jump to phase (test)" `.phase-row`. Cleanup: `pkill -f vite; rm -rf /tmp/tg-verify`.
Favicon 404 in console is benign.
