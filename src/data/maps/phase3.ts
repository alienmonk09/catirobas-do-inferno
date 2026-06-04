import type { MapDef } from "../../core/types";

// Phase 3 — The Bridge. A river (blocked band) split by a single-tile bridge.
export const phase3: MapDef = {
  id: "phase3",
  name: "The Bridge",
  intro:
    "A churning river cleaves the valley in two, fordable only by a single narrow stone bridge. Hold the span and the enemy must come one at a time; lose it and they pour across.",
  width: 9,
  height: 9,
  heights: [
    [1, 1, 2, 1, 1, 1, 2, 1, 1],
    [1, 1, 1, 1, 2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2, 1, 1, 1, 1],
    [1, 1, 2, 1, 1, 1, 2, 1, 1],
  ],
  blocked: [
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [true, true, true, true, false, true, true, true, true],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
  ],
  playerSpawns: [
    { x: 1, y: 7 },
    { x: 3, y: 7 },
    { x: 5, y: 7 },
    { x: 7, y: 7 },
    { x: 4, y: 6 },
  ],
  enemies: [
    { name: "Bridge Vanguard", classId: "knight", level: 5, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 4, y: 1 } },
    { name: "River Guard", classId: "knight", level: 4, weaponId: "sword", skillIds: ["guard"], pos: { x: 3, y: 3 } },
    { name: "Far Bank Archer", classId: "archer", level: 5, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 2, y: 2 } },
    { name: "Cliffside Mage", classId: "blackMage", level: 5, weaponId: "rod", skillIds: ["fire", "bolt"], pos: { x: 6, y: 2 } },
    { name: "Wandering Monk", classId: "monk", level: 4, weaponId: "knuckles", skillIds: ["palmStrike", "chakra"], pos: { x: 6, y: 0 } },
  ],
};
