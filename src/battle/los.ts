import type { Point } from "../core/types";
import type { Grid } from "./grid";

/**
 * Height (in tile-z levels) of a unit's "eye" above the top of its tile.
 */
const EYE = 0.5;

/**
 * How far (in tile-z levels) bare terrain must rise above the sightline before
 * it counts as cover. A full level of ground above the eyeline is shootable
 * over — you only lose the shot when terrain climbs two or more levels above
 * the line. Props (trees, walls, boulders) are unaffected: anything they add
 * still blocks the moment its top tops the line.
 */
const TERRAIN_COVER = 1;

/**
 * Line of sight between two tiles for ranged attacks/spells. Walks every cell
 * the eye-to-eye segment crosses (including the orthogonal cells either side of
 * a diagonal step, so a thin wall in a diagonal gap still blocks) and reports no
 * sight if any intervening tile's top rises above the interpolated sightline.
 * Same and orthogonally-adjacent tiles always see each other (nothing between);
 * a diagonal adjacency is range-2 and still vets its two grazed corner tiles.
 * The high ground gets a clearer view (its eye sits higher, so the line clears
 * nearer terrain).
 */
export function hasLineOfSight(grid: Grid, from: Point, to: Point): boolean {
  if (from.x === to.x && from.y === to.y) return true;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Orthogonal adjacency has no tile between the two — fast true. A *diagonal*
  // adjacency (|dx|==|dy|==1) is Chebyshev-near but range-2: the eye-to-eye
  // segment grazes the two orthogonal corner tiles, so a tall prop there must
  // still occlude. Only the orthogonal case may short-circuit.
  if (Math.abs(dx) + Math.abs(dy) <= 1) return true; // nothing in between
  const z0 = grid.heightAt(from.x, from.y) + EYE;
  const z1 = grid.heightAt(to.x, to.y) + EYE;

  const blocks = (cx: number, cy: number, t: number): boolean => {
    if (!grid.inBounds(cx, cy)) return false;
    if ((cx === from.x && cy === from.y) || (cx === to.x && cy === to.y)) return false;
    const lineZ = z0 + (z1 - z0) * t;
    const terrain = grid.heightAt(cx, cy);
    const prop = grid.sightBlockAt(cx, cy);
    // A prop blocks as soon as its top clears the line. Bare terrain gets a
    // full level of slack: one level of ground above the eyeline is shootable
    // over, only two-plus levels become cover.
    if (prop > 0) return terrain + prop > lineZ + 1e-6;
    return terrain > lineZ + TERRAIN_COVER + 1e-6;
  };

  const steps = Math.max(2, Math.ceil(Math.hypot(dx, dy) * 4));
  let prevX = from.x;
  let prevY = from.y;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const cx = Math.round(from.x + dx * t);
    const cy = Math.round(from.y + dy * t);
    if (cx === prevX && cy === prevY) continue;
    // A diagonal step skips two orthogonal cells the segment grazes — vet both so
    // a sightline can't squeeze through a 1-wide wall sitting in a diagonal gap.
    if (cx !== prevX && cy !== prevY) {
      const tMid = (i - 0.5) / steps;
      if (blocks(prevX, cy, tMid) || blocks(cx, prevY, tMid)) return false;
    }
    if (blocks(cx, cy, t)) return false;
    prevX = cx;
    prevY = cy;
  }
  return true;
}
