# Tactics MVP

A Final Fantasy Tactics–style game: isometric, turn-based battles with class
progression, magic, weapons, and items. Built in TypeScript + HTML5 Canvas, no
game engine. Five classes, five playable phases.

## Run it

```bash
npm install
npm run dev        # open the printed localhost URL
```

Other scripts:

```bash
npm run build      # typecheck + production build to dist/
npm test           # run the Vitest suite
```

## How to play

- **New Game** from the title screen drops you into Phase 1.
- On your unit's turn, use the bottom menu:
  - **Move** — click a highlighted tile (blue). The path preview (yellow) shows
    the route; movement respects range, terrain height, and your unit's Jump.
  - **Attack** — click an enemy inside weapon range (red).
  - **Skill** — pick a learned class skill (costs MP); click a target tile.
    Area skills show an AoE preview (orange). Support skills can target allies
    or yourself.
  - **Item** — use a shared consumable (Potion, Hi-Potion, Ether, Phoenix Down).
  - **Wait** — end the turn.
- **Right-click** cancels back to the menu. **Enter** / **E** ends the turn.
- Turn order (top bar) is driven by Speed (a charge-time system).
- Win by defeating all enemies. Between phases, the **Party Camp** screen lets
  you change classes, swap weapons, and spend JP to learn new skills. Progress
  is saved automatically (localStorage); **Continue** resumes from the camp.

## Classes

| Class | Role | Skills |
|-------|------|--------|
| Knight | Melee tank | Power Strike, Guard |
| Archer | Ranged physical | Aimed Shot, Cripple |
| Black Mage | Offensive magic | Fire, Bolt, Fireball (AoE) |
| White Mage | Support / heal | Cure, Cura (AoE), Raise |
| Monk | Melee bruiser | Palm Strike, Chakra (heal), Earth Shake (AoE) |

## Project layout

```
src/
  core/     types, game state + save/load, RNG, unit/progression math
  battle/   grid, BFS pathfinding, targeting/AoE, combat, turn manager, AI
  engine/   isometric projection + picking, canvas renderer, input, loop, animator
  ui/        DOM battle HUD, menus, party screen styles
  scenes/    battle scene (turn state machine), party camp, title/victory
  data/      classes, skills, weapons, items, party, maps/phase1..5
tests/      unit tests per module + a full AI-vs-AI battle simulation
docs/superpowers/specs/  design spec
```

## Tests

`npm test` runs ~290 tests: per-module unit tests (RNG, pathfinding, targeting,
combat, turn order, AI, progression, grid) plus map-data invariants and a
**full battle simulation** that auto-plays all five phases to a decisive winner
while asserting HP/stat invariants every turn.

## Known minor limitations

- The turn-order preview bar snapshots Speed, so it can briefly mispredict the
  order right as a Slow/Haste status expires (cosmetic).
- Tile picking hit-tests tile tops; clicking the vertical face of a tall cliff
  may select the tile behind it. Click the tile's top surface to be precise.
