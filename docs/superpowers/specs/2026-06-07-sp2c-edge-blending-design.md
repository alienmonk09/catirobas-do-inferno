# SP2c — Terrain Edge/Transition Blending (design)

**Goal:** Soften the hard per-tile terrain seams. Where two terrain types meet, draw a
fringe of the neighbor's color along the shared edge so transitions read as natural
(sand→grass fringe, water shoreline, etc.) instead of a checkerboard.

## Approach (keep the bake cache)

The renderer bakes each tile's static art keyed by `terrain|z|ao|propId`. Edge blending
makes a tile's appearance depend on its 4 orthogonal neighbors' terrain, so:

1. **Pure, testable helper** `edgeSignature(grid, x, y): EdgeSig` in a new
   `src/engine/terrainEdges.ts` (or in `data/terrain.ts`) — returns, per orthogonal
   neighbor (N/E/S/W), the neighbor terrain type *iff* it differs from this tile and
   should blend over it (priority order so e.g. water always fringes onto land, not
   vice-versa). Deterministic, unit-tested.
2. **Encode the signature into the bake cache key** so tiles with different neighbor
   contexts bake distinctly: `terrain|z|ao|propId|sig`.
3. **Draw the fringe** in `bakeTile`/`drawTileTop`: for each blending neighbor, fill a
   thin band of the neighbor's terrain color along that diamond edge (with the same
   height/ao lightness math), optionally dithered/feathered, under the grid line.

## Blend priority

A simple total order over terrain types decides who fringes onto whom (lower rank gets
overdrawn by higher): e.g. `water/lava/spring (liquids) > mire > sand > dirt > wood >
grass > rock`. Only the higher-priority neighbor paints a fringe onto the lower tile, so
each seam blends once and consistently (no double-fringe shimmer).

## Constraints

- Cosmetic only — **zero gameplay/movement/LOS impact**. Heights, blocked, terrainEffect
  untouched.
- Must stay performant: still baked + cached (no per-frame cost for static tiles).
  Animated terrain (water/lava/spring) already draws live — fringe there draws live too.
- No regressions: existing renderer/terrain tests stay green; add tests for
  `edgeSignature` + the cache-key change.

## Execution

Single coherent writer (TDD the pure helper first), then adversarial review fan-out
(rendering-correctness / cache-coherence / perf lenses). Browser-verify the fringe
visually. Branch `feat/sp2c-edge-blending`. No push without asking.
