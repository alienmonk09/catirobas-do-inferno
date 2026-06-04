# Pixel Sprite System — Design

Date: 2026-06-04

## Goal

Replace procedural placeholder art with hand-authored pixel-art sprites for
characters, weapons, items, and magic/skill effects. Keep the project
self-contained (no binary assets), deterministic, and testable.

## Approach

Sprites are defined in code as `{ palette, rows }`: each row is a string, each
character maps to a CSS color via the palette, `.` means transparent. A tiny
engine bakes a `SpriteDef` to an offscreen `<canvas>` once (nearest-neighbor,
integer scale) and caches it; the same canvas serves the isometric battle scene,
and `toDataURL()` serves DOM menu icons. No external dependencies.

Rejected alternatives: external asset pack (adds binaries + licensing + atlas
work, breaks self-containment) and procedural generation (classes not
distinctly readable).

## Components

### `engine/sprite.ts` (the engine — hand-written)
- `SpriteDef { palette: Record<string,string>; rows: string[] }`
- `AnimDef { frames: SpriteDef[]; frameDur: number }` for multi-frame VFX
- `validateSprite(def): string[]` — rectangular rows, every non-`.` char in
  palette, `.` not in palette. Returns problems (empty = valid). Pure; testable.
- `bakeSprite(def, scale=4): HTMLCanvasElement` — cached per (def, scale).
- `spriteToDataURL(def, scale): string` — for `<img>` icons in the DOM UI.

### `data/sprites/*.ts` (the art — authored via workflow, reviewed by hand)
- `characters.ts` — `Record<ClassId, SpriteDef>`, 16×20, front-facing chibi.
- `weapons.ts` — `Record<weaponId, SpriteDef>`, 14×14 icons.
- `items.ts` — `Record<itemId, SpriteDef>`, 14×14 icons.
- `skills.ts` — `Record<skillId, SpriteDef>`, 14×14 icons.
- `vfx.ts` — `Record<vfxKey, AnimDef>`, 16×16×3 frames.
- `index.ts` — barrel + lookups with fallbacks: `vfxKeyForSkill`,
  `vfxKeyForWeapon`. VFX keys: physical, arcane, fire, bolt, holy, heal,
  revive, status.

## Integration

- `renderer.drawUnit`: draw the class sprite as a billboard (feet at tile
  center, scaled to ~52px tall), team-colored ground ring, fade when dead.
  Keep shadow, HP bar, status pips, active arrow.
- `renderer`: new VFX layer. `BattleView.effects: ActiveEffect[]` (tile, anim,
  age); drawn after units, before damage popups. Cosmetic, non-blocking.
- `battleScene`: on weapon attack / skill resolve (player and AI), push an
  effect at the target tile(s); age and cull in `update()`.
- `battleUI`: skill/item submenu rows get an icon; weapon line gets an icon;
  turn-order chips show the class portrait.
- `partyScene`: class portrait + weapon/skill icons.
- `styles.ts`: `.icon { image-rendering: pixelated }`.

## Testing

`tests/sprites.test.ts` (pure, no canvas):
- every `SpriteDef` passes `validateSprite` (rectangular, palette-covered);
- every class/weapon/item/skill id has a sprite; every `vfxKey` has an anim;
- `vfxKeyForSkill`/`vfxKeyForWeapon` resolve for all skills/weapons.

Baking is browser-only (`document`), so it is excluded from the node test run.

## Scope (KISS / YAGNI)

- No directional facings, no walk-cycle frames (reuse the existing move tween
  and active-unit bob).
- One VFX family per element/effect, not per skill.
- Terrain/tiles unchanged — the goal covers entities, not the map.
