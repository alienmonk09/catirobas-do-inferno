import type { MapDef, Point, TerrainType } from "../core/types";
import type { SpriteDef } from "../engine/sprite";
import type { Grid } from "../battle/grid";
import { PROP_SPRITES, type PropSpriteId } from "./sprites/props";

export interface PropDef {
  id: PropSpriteId;
  sprite: SpriteDef;
  /** Extra z added to LOS occlusion when present on a tile (0/absent = none). */
  sightBlock?: number;
  /** True ⇒ implies an impassable tile; only valid hand-authored on a blocked tile. */
  solid?: boolean;
  /** Per-terrain scatter probability (0..1). Absent ⇒ never scattered (authored only). */
  scatter?: Partial<Record<TerrainType, number>>;
}

export interface PlacedProp {
  pos: Point;
  propId: PropSpriteId;
}

const def = (id: PropSpriteId, extra: Omit<PropDef, "id" | "sprite">): PropDef => ({
  id,
  sprite: PROP_SPRITES[id],
  ...extra,
});

export const PROPS: Record<string, PropDef> = {
  // Cosmetic — procedurally scattered, never solid.
  grassTuft: def("grassTuft", { scatter: { grass: 0.16, mire: 0.06 } }),
  flowerCluster: def("flowerCluster", { scatter: { grass: 0.05 } }),
  pebbles: def("pebbles", { scatter: { dirt: 0.12, rock: 0.16, sand: 0.08 } }),
  rubble: def("rubble", { scatter: { rock: 0.1, dirt: 0.06 } }),
  reeds: def("reeds", { scatter: { mire: 0.18 } }),
  cattail: def("cattail", { scatter: { mire: 0.08 } }),
  mushroom: def("mushroom", { scatter: { mire: 0.08, grass: 0.02 } }),
  // Structural — hand-authored accents (MapDef.decor). Can block.
  tree: def("tree", { solid: true, sightBlock: 2 }),
  pineTree: def("pineTree", { solid: true, sightBlock: 2 }),
  boulder: def("boulder", { solid: true, sightBlock: 1 }),
  stump: def("stump", {}),
  deadTree: def("deadTree", { sightBlock: 1 }),
  wallSegment: def("wallSegment", { solid: true, sightBlock: 2 }),
};

/** Deterministic 0..1 hash from a map id + tile coords + channel. */
function hash01(id: string, x: number, y: number, ch: number): number {
  let h = 2166136261 >>> 0;
  const s = `${id}:${x}:${y}:${ch}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h % 100000) / 100000;
}

/**
 * Deterministically scatter cosmetic props across a map's walkable tiles. Never
 * places on a spawn, enemy, ally, chest, objective, blocked, or hand-decorated
 * tile, and never places a `solid` prop. Same map ⇒ same layout (no RNG).
 */
export function scatterProps(map: MapDef, grid: Grid): PlacedProp[] {
  const taken = new Set<string>();
  for (const s of map.playerSpawns) taken.add(`${s.x},${s.y}`);
  for (const e of map.enemies) taken.add(`${e.pos.x},${e.pos.y}`);
  for (const a of map.allies ?? []) taken.add(`${a.pos.x},${a.pos.y}`);
  for (const c of map.chests ?? []) taken.add(`${c.pos.x},${c.pos.y}`);
  for (const d of map.decor ?? []) taken.add(`${d.pos.x},${d.pos.y}`);
  const o = map.objective;
  if (o && (o.kind === "seize" || o.kind === "defend" || o.kind === "escort")) taken.add(`${o.x},${o.y}`);

  // Cosmetic props eligible per terrain, in stable id order.
  const cosmetic = Object.values(PROPS).filter((p) => p.scatter);

  const placed: PlacedProp[] = [];
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (taken.has(`${x},${y}`)) continue;
      if (grid.isBlocked(x, y)) continue;
      const terrain = grid.terrainAt(x, y);
      const eligible = cosmetic.filter((p) => (p.scatter?.[terrain] ?? 0) > 0);
      if (eligible.length === 0) continue;
      const total = eligible.reduce((sum, p) => sum + (p.scatter?.[terrain] ?? 0), 0);
      if (hash01(map.id, x, y, 0) >= total) continue; // no prop on this tile
      // Pick which eligible prop, weighted by its terrain probability.
      let roll = hash01(map.id, x, y, 1) * total;
      for (const p of eligible) {
        roll -= p.scatter?.[terrain] ?? 0;
        if (roll <= 0) { placed.push({ pos: { x, y }, propId: p.id }); break; }
      }
    }
  }
  return placed;
}
