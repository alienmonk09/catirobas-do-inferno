# SP2b — Bigger Maps + Rebalance (design)

**Goal:** Now that SP2a's camera pans/zooms past the viewport, re-author the campaign
maps at larger dimensions so battles have room to maneuver, flank, and use elevation —
the primary consumer of the new camera. Keep density and balance sane.

## Scope decision

- **Tutorial ramp stays small (deliberate):** `phase1` (8×8), `phase2` (9×9), `phase3`
  (9×9) are the onboarding ramp — left untouched. Small is correct pedagogy here.
- **Enlarge the 14 campaign maps** (PHASES indices 3–16): cinderFields, phase4,
  outerRamparts, frostspirePass, sunkenCauseway, emberfallQuarry, howlingSteppe,
  gravewatchHollow, verdantRuins, ironholdGate, saltflatMirage, drownedVault,
  maldrathsApproach, phase5.

## Target dimensions (larger dim ~+40–50%)

| map | now | target |
|-----|-----|--------|
| cinderFields | 13×11 | 18×15 |
| phase4 (escort) | 10×10 | 16×14 |
| outerRamparts | 12×12 | 18×16 |
| frostspirePass | 14×14 | 20×18 |
| sunkenCauseway | 15×13 | 20×17 |
| emberfallQuarry | 14×16 | 19×22 |
| howlingSteppe | 16×14 | 22×18 |
| gravewatchHollow | 14×14 | 20×18 |
| verdantRuins | 15×15 | 21×21 |
| ironholdGate | 14×14 | 20×18 |
| saltflatMirage | 16×13 | 22×18 |
| drownedVault | 14×15 | 19×20 |
| maldrathsApproach | 15×15 | 21×21 |
| phase5 (finale) | 10×10 | 18×18 |

## Rebalance rules

- **Enemy count ≈ proportional to area growth** (`round(originalCount × areaRatio)`),
  clamped to **original .. original+6** so density stays ~constant (more room, not a
  meat-grinder). Enemy `level` values keep the original spread (actual levels are
  party-relative via `enemyLevelFor` — the authored numbers are just the template).
- **Spawns: keep 6–8**, all in-bounds, non-blocked, distinct, clustered in a sensible
  deployment zone.
- Preserve `id`, `name`, objective `kind`, theme, terrain palette, chest/decor intent.
  Extend `intro` only lightly if at all.

## Hard invariants (tests enforce — must stay green)

`tests/maps.test.ts` + `tests/mapsReach.test.ts`:
- `heights`, `blocked`, `terrain` are **rectangular** `height × width` (row-major `[y][x]`).
- spawns: `cap..8`, in-bounds, non-blocked, distinct (cap = `partyCapForPhase(index)`;
  index ≥11 ⇒ 6, 6–10 ⇒ 5, 2–5 ⇒ 4).
- enemies ≥2, valid class/weapon(belongs to class)/skill(in class), in-bounds,
  non-blocked, no overlap with spawns/each-other.
- **Every enemy ≥4 Manhattan tiles from nearest player spawn.**
- `defeat` objective: exactly one enemy whose name === `targetName`.
- chests: in-bounds, walkable, not water/lava, no overlap, loot items real.
- seize/defend/escort goal tile: in-bounds, not water/lava, **reachable** (BFS jump 2).
- decor: in-bounds, `solid` prop only on blocked tile, no overlap.
- **Reachability:** every enemy + objective tile reachable from spawns (BFS, jump 2).

## Execution

One agent per map (parallel workflow). Each returns the full `MapDef` TS file content.
Main thread writes all, runs `tsc + npm test + build`, re-queues any failing map with
its exact error. Branch `feat/sp2b-bigger-maps`. Browser-verify a sample, then commit.
No push without asking.
