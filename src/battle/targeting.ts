import type { AoeShape, Point, Unit } from "../core/types";
import { Grid, key, manhattan, samePoint } from "./grid";
import { directionTo, dirVector } from "./facing";

/** All in-bounds tiles within manhattan `range` of origin (excludes origin for range>0 attacks if requested). */
export function tilesInRange(
  grid: Grid,
  origin: Point,
  range: number,
  includeSelf = false,
): Point[] {
  const out: Point[] = [];
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist > range) continue;
      if (dist === 0 && !includeSelf) continue;
      const x = origin.x + dx;
      const y = origin.y + dy;
      if (!grid.inBounds(x, y)) continue;
      out.push({ x, y });
    }
  }
  return out;
}

/** Tiles affected by an AoE shape centered at `center`. */
export function aoeTiles(grid: Grid, center: Point, shape: AoeShape): Point[] {
  const out: Point[] = [];
  const push = (x: number, y: number) => {
    if (grid.inBounds(x, y)) out.push({ x, y });
  };
  switch (shape) {
    case "single":
      push(center.x, center.y);
      break;
    case "cross":
      push(center.x, center.y);
      push(center.x + 1, center.y);
      push(center.x - 1, center.y);
      push(center.x, center.y + 1);
      push(center.x, center.y - 1);
      break;
    case "square3":
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          push(center.x + dx, center.y + dy);
        }
      }
      break;
  }
  return out;
}

export function inRange(origin: Point, target: Point, range: number): boolean {
  return manhattan(origin, target) <= range && manhattan(origin, target) > 0;
}

/**
 * Compute the landing tile when a unit at `target` is shoved `distance` tiles
 * directly away from `caster`. Steps are blocked by the grid edge, blocked
 * tiles, and tiles occupied by other living units. Returns the last valid tile
 * (may equal `target` if every step is blocked).
 */
export function knockbackTo(
  grid: Grid,
  units: Unit[],
  caster: Point,
  target: Point,
  distance: number,
): Point {
  const dir = directionTo(caster, target);
  const step = dirVector(dir);
  // Occupancy of all living units except the unit being shoved.
  const occ = new Set(
    units.filter((u) => u.alive && !samePoint(u.pos, target)).map((u) => key(u.pos)),
  );
  let cur = { ...target };
  for (let i = 0; i < distance; i++) {
    const nx = cur.x + step.x;
    const ny = cur.y + step.y;
    if (!grid.inBounds(nx, ny)) break;
    if (grid.isBlocked(nx, ny)) break;
    if (occ.has(key({ x: nx, y: ny }))) break;
    cur = { x: nx, y: ny };
  }
  return cur;
}
