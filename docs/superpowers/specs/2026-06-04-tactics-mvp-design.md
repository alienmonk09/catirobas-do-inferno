# Tactics MVP — Design Spec

**Date:** 2026-06-04
**Goal:** A Final Fantasy Tactics–like game: isometric, turn-based battles, class progression, magic, weapons & items, simple controls, up to 5 playable phases in the MVP, 5 classes. Not a clone — its own small thing — but isometric and fully playable.

## Stack

- **TypeScript + HTML5 Canvas 2D**, no game engine.
- **Vite** for dev server and production build.
- Runs in the browser: `npm run dev`.
- No backend, no persistence beyond in-memory + optional localStorage for party state between phases.

## Isometric Rendering

- Grid of tiles, each with a height `z` (integer levels).
- Projection: world `(x, y, z)` → screen with a 2:1 iso ratio.
  - `screenX = (x - y) * (TILE_W/2) + originX`
  - `screenY = (x + y) * (TILE_H/2) - z * TILE_Z + originY`
- Painter's algorithm: draw tiles and units sorted back-to-front (`x + y`, then `z`) so stacking is correct.
- Tiles rendered as diamonds with a side/wall quad for height.
- Highlight overlays for movement range (blue), attack/skill range (red), AoE preview (orange), path (yellow).

## Core Data Model

- `Stats`: hp, mp, atk, def, mag, res, spd, move, jump (current + max for hp/mp).
- `Unit`: id, name, team (player/enemy), classId, level, xp, jp, learnedSkills[], equippedWeapon, position {x,y}, ct (charge time), stat block, statuses[].
- `Tile`: x, y, z (height), walkable, occupantId|null.
- `GameMap`: width, height, tiles[][], spawn points for player/enemy, win/lose conditions.

## Battle Loop (CT-based turn order)

1. Tick: every unit's `ct += spd` each tick until someone reaches `CT_THRESHOLD` (100). That unit acts.
2. Active turn phases:
   - **Move**: compute reachable tiles via BFS over walkable tiles, cost 1/step, blocked if height diff > jump. Click a tile to walk (animated step path).
   - **Action**: choose Attack / Skill / Item / Wait.
     - Attack: pick target in weapon range → damage resolution.
     - Skill: pick from learned class skills (MP cost) → target/AoE → effect.
     - Item: pick consumable → target ally/self.
     - Wait: end turn (face direction optional, skipped in MVP).
3. After acting, `ct -= 100`. Statuses tick.
4. **Win**: all enemy units dead. **Lose**: all player units dead.

## Combat Formulas

- Physical: `dmg = max(1, (atk + weaponPower) - target.def)` with ±random variance and crit chance.
- Magical: `dmg = max(1, (mag * spellPower / 10) - target.res)`, element multipliers (1.5x weak, 0.5x resist) optional.
- Healing: `heal = mag * healPower / 10`.
- Hit: simplified — melee/ranged in-range always hits in MVP (keeps it readable); crits add variance.

## Classes (5)

| Class | Role | Key stats | Skills |
|-------|------|-----------|--------|
| Knight | Melee tank | high HP/ATK/DEF | Power Strike (heavy dmg), Guard (def buff) |
| Archer | Ranged physical | high SPD, range 3 | Aimed Shot (bonus dmg), Cripple (slow) |
| Black Mage | Offensive magic | high MAG, low DEF | Fire (single), Bolt, Fireball (AoE) |
| White Mage | Support/heal | high MAG/RES | Cure (heal), Cura (AoE heal), Raise (revive) |
| Monk | Melee bruiser | high HP/ATK, self-sustain | Palm Strike (heavy dmg), Chakra (heal), Earth Shake (AoE) |

## Progression

- **XP**: earned per action (attack, kill bonus). At threshold → level up: stats increase per class growth curve.
- **JP**: earned per action. Spend JP to learn the next skill in the class's list.
- **Class change**: allowed between phases in the party screen. Learned skills persist per unit; equip rules by class.
- KISS: linear skill unlock order, no branching tree.

## Magic & Targeting

- Spells: MP cost, range, AoE shape (single, cross, 3x3), power, element, effect type (damage/heal/buff/debuff/revive).
- AoE preview before confirm.

## Weapons & Items

- **Weapons**: each has power + range + allowed classes. Sword(1), Bow(3), Staff(magic, range 1 but boosts MAG), etc. Equipping changes ATK and attack range.
- **Items** (shared party inventory, consumable): Potion (+HP), Hi-Potion, Ether (+MP), Phoenix Down (revive + small HP).

## Phases (5 maps)

A rising difficulty curve, each map teaching/forcing a new consideration:

1. **Tutorial Skirmish** — flat-ish map, 2-3 weak enemies. Teaches move/attack.
2. **Ambush** — height variation, ~4 enemies incl. one mage. Teaches terrain + magic threat.
3. **The Bridge** — chokepoint terrain, mixed melee/ranged. Teaches positioning.
4. **Sorcerer's Court** — enemy mages + AoE pressure, elevation. Teaches spreading out + healing.
5. **Boss** — boss unit + adds, requires using skills/items. Win = boss dead.

- Data-driven maps in `src/data/maps/`.
- Enemy AI: each enemy turn — move toward nearest reachable target, attack if in range; mages prefer weakest/clustered targets; healers heal allies < 50% HP.
- Party carries level/XP/JP/learned skills across phases; party screen between phases for class change, equip, and item use.

## Controls

- **Mouse**: click highlighted tile to move; click enemy in range to attack; click menu buttons for actions.
- **Keyboard**: `Esc`/right-click = cancel/back, `Enter`/`E` = end turn. Camera pan optional with arrows.
- Action menu rendered as on-canvas/DOM buttons near active unit.

## Architecture

```
src/
  engine/
    iso.ts          # projection + inverse (screen->tile picking)
    renderer.ts     # canvas draw: tiles, units, overlays, HUD
    input.ts        # mouse/keyboard events -> intents
    loop.ts         # requestAnimationFrame game loop
  core/
    types.ts        # shared types/interfaces
    state.ts        # GameState container
    rng.ts          # seedable RNG
  battle/
    turnManager.ts  # CT order, turn phases
    pathfinding.ts  # BFS reachable + path
    combat.ts       # damage/heal resolution
    targeting.ts    # range + AoE computation
    ai.ts           # enemy decision making
  data/
    classes.ts
    skills.ts
    items.ts
    weapons.ts
    maps/phase1.ts, phase2.ts, phase3.ts
  ui/
    hud.ts          # HP/MP bars, unit info
    actionMenu.ts   # move/attack/skill/item/wait
    turnOrder.ts    # upcoming turns bar
  scenes/
    battleScene.ts  # orchestrates a single battle
    partyScene.ts   # between-phase: class change, equip, items
    sceneManager.ts
  main.ts           # bootstrap, canvas setup, scene start
index.html
```

## Testing

- Unit tests (Vitest) for pure logic: pathfinding, combat formulas, targeting/AoE, CT turn order, AI target selection, progression thresholds.
- Manual playtest of each phase for win/lose flow.

## Out of Scope (YAGNI for MVP)

- Save/load slots beyond simple localStorage carry-over.
- Animations beyond basic step-move and damage popups.
- Sound (stretch).
- Branching story / dialogue trees (minimal intro text per phase only).
- Facing/back-attack mechanics.
- Multiplayer.
