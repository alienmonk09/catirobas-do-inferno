# Visual Overhaul — design

Goal: higher-resolution sprites, weapons shown on characters, unique player
sprites (distinct from enemy classes), varied/pleasant terrain, occlusion behind
elevated terrain, and a confirmed save system. KISS throughout.

## 1. Sprite resolution + unique heroes (reqs 1, 3)

- New `HERO_SPRITES: Record<HeroId, SpriteDef>` authored at **24×30** (vs the
  16×20 class sprites). Rendered at integer scale `round(60 / height)` → heroes
  bake at scale 2 (≈60px tall), class sprites at scale 3 (≈60px tall). Same
  on-screen footprint, ~1.5× finer pixels for heroes.
- Players render their **hero** sprite; enemies keep the existing **class**
  sprites. This satisfies "unique players, different from enemy classes" and
  keeps the art budget sane. Mixed resolution is acceptable — heroes read as the
  detailed, named protagonists.
- Party units carry their roster id as `Unit.id` (via `buildHero({ id }))`), so
  the renderer/menus pick the hero sprite with `getUnitSprite(unit)`.

## 2. Weapons on characters (req 2)

- Baked into each hero sprite (sword+shield for Garan, bow for Lyra, rod for Vex,
  staff for Mira, knuckles for Bron, dagger for Enzo, heartwood for Penelope).
  Baked (not composited) for the best look; heroes have a fixed default weapon.

## 3. Special hero features (reqs 4, 5)

- Enzo: bright blue eyes. Penelope: voluminous bust + curvy figure. Encoded in
  their sprite art.

## 4. Save system (req 6)

- Already implemented and wired: `saveGame` checkpoints on entering the party
  screen, `loadGame`/Continue on the title, `clearSave` on new game/victory.
  Verify end-to-end; harden `isValidSave` only if a gap appears. No rewrite.

## 5. Terrain (req 7)

- New `TerrainType = "grass" | "dirt" | "rock" | "sand" | "water" | "wood"`.
- `MapDef.terrain?: TerrainType[][]` (optional, row-major). When absent, derive:
  blocked → "water", else "grass" (back-compat with existing maps).
- Renderer colors each tile's top + cliff walls from a per-type palette, keeps
  height-based brightness, and adds a cheap deterministic 2-tone speckle for
  texture. Maps get hand-set terrain for variety.

## 6. Occlusion behind elevation (req 8)

- Renderer draws tiles and units in a **single depth-sorted pass** (merge the two
  streams) so a taller tile in front of a unit overdraws the unit's lower body.
- Unit depth = `depthKey(pos) + 0.5` so a unit draws just after its own tile top
  but before any closer/higher tile. Tile overlays (move/attack/path/hover) are
  painted per-tile within the pass so units stand on top of their own tile's
  highlight. Effects/forecast/popups stay as a final on-top layer.

## Testing

- `validateSprite` over all hero sprites (added to sprites.test).
- Terrain: a unit-test that `terrainAt` falls back correctly when no terrain map.
- Existing suites stay green; browser-verify the battle scene by eye.
