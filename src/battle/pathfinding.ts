import type { Point } from "../core/types";
import { Grid, key } from "./grid";

const DIRS: Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export interface ReachResult {
  /** tile key -> step cost from start. */
  costs: Map<string, number>;
  /** tile key -> previous tile key (for path reconstruction). */
  prev: Map<string, string | null>;
}

/**
 * BFS over walkable tiles within `move` steps. A step is allowed when the
 * destination is in bounds, not blocked terrain, not occupied, and the height
 * difference does not exceed `jump`.
 */
export function reachable(
  grid: Grid,
  start: Point,
  move: number,
  jump: number,
  occupied: Set<string>,
): ReachResult {
  const costs = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const startKey = key(start);
  costs.set(startKey, 0);
  prev.set(startKey, null);

  let frontier: Point[] = [start];
  let cost = 0;
  while (frontier.length > 0 && cost < move) {
    const next: Point[] = [];
    for (const cur of frontier) {
      const curH = grid.heightAt(cur.x, cur.y);
      for (const d of DIRS) {
        const nx = cur.x + d.x;
        const ny = cur.y + d.y;
        if (!grid.inBounds(nx, ny)) continue;
        if (grid.isBlocked(nx, ny)) continue;
        const k = `${nx},${ny}`;
        if (costs.has(k)) continue;
        if (occupied.has(k)) continue;
        if (Math.abs(grid.heightAt(nx, ny) - curH) > jump) continue;
        costs.set(k, cost + 1);
        prev.set(k, key(cur));
        next.push({ x: nx, y: ny });
      }
    }
    frontier = next;
    cost += 1;
  }
  return { costs, prev };
}

/** Reconstruct the path of points from start to `target` using a ReachResult. */
export function pathTo(result: ReachResult, target: Point): Point[] | null {
  const targetKey = key(target);
  if (!result.costs.has(targetKey)) return null;
  const path: Point[] = [];
  let cur: string | null = targetKey;
  while (cur) {
    const [x, y] = cur.split(",").map(Number);
    path.push({ x, y });
    cur = result.prev.get(cur) ?? null;
  }
  return path.reverse();
}
