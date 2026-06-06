import { describe, it, expect } from "vitest";
import { PHASES } from "../src/data/maps";
import { Grid, key } from "../src/battle/grid";
import { reachable } from "../src/battle/pathfinding";

/**
 * Every battle must be playable: from the player's deployment zone, the army can
 * actually reach the foes and any objective tile. We flood from the spawn cluster
 * with the conservative jump of 2 (knights/mages — the lowest), so if a tile is
 * reachable here, every class can get there. Catches walled-off enemies / goals.
 */
describe("map reachability", () => {
  const EMPTY = new Set<string>();
  PHASES.forEach((map) => {
    it(`${map.id}: every enemy and objective tile is reachable from spawns`, () => {
      const grid = new Grid(map);
      const reached = new Set<string>();
      for (const s of map.playerSpawns) {
        // Big move budget = full multi-turn connectivity; jump 2 = lowest class jump.
        const r = reachable(grid, s, 999, 2, EMPTY);
        for (const k of r.costs.keys()) reached.add(k);
      }
      for (const e of map.enemies) {
        expect(reached.has(key(e.pos)), `enemy ${e.name} @${e.pos.x},${e.pos.y} unreachable`).toBe(true);
      }
      const o = map.objective;
      if (o && (o.kind === "seize" || o.kind === "defend" || o.kind === "escort")) {
        expect(reached.has(`${o.x},${o.y}`), `objective tile ${o.x},${o.y} unreachable`).toBe(true);
      }
    });
  });
});
