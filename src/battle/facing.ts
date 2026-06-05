import type { Direction, Point } from "../core/types";

/** Unit vector for each cardinal facing (grid space: n=-y, s=+y, e=+x, w=-x). */
const VEC: Record<Direction, Point> = {
  n: { x: 0, y: -1 },
  e: { x: 1, y: 0 },
  s: { x: 0, y: 1 },
  w: { x: -1, y: 0 },
};

export function dirVector(d: Direction): Point {
  return VEC[d];
}

/**
 * Cardinal direction pointing from `from` toward `to`. The dominant axis wins;
 * exact diagonals favor the horizontal axis. Returns "s" when the points
 * coincide (callers that care guard against that case).
 */
export function directionTo(from: Point, to: Point): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx > 0) return "e";
    if (dx < 0) return "w";
  }
  if (dy > 0) return "s";
  if (dy < 0) return "n";
  return "s";
}

export type AttackAngle = "front" | "flank" | "rear";

/**
 * Where an attack originating at `attackerPos` lands relative to a defender at
 * `targetPos` who faces `facing`. Uses the dot product of the defender's facing
 * vector with the bearing to the attacker: positive = front, negative = rear,
 * zero = flank (perpendicular).
 */
export function attackAngle(attackerPos: Point, targetPos: Point, facing: Direction): AttackAngle {
  const fv = VEC[facing];
  const dx = attackerPos.x - targetPos.x;
  const dy = attackerPos.y - targetPos.y;
  const dot = dx * fv.x + dy * fv.y;
  if (dot > 0) return "front";
  if (dot < 0) return "rear";
  return "flank";
}
