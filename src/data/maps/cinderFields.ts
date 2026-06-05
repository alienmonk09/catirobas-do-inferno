import type { MapDef } from "../../core/types";

// Cinder Fields — a wide, open stretch of burned farmland after the bridge.
// Larger terrain than the early maps: scattered low rises and rubble mounds
// (height-2 blocks read as rock cover) break the sightlines on an open field.
const heights: number[][] = [
  [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 2, 1, 1, 0, 1, 1, 2, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0, 1, 2, 1, 0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Rubble mounds (the height-2 blocks) are impassable cover; everything else open.
const blocked: boolean[][] = heights.map((row) => row.map(() => false));
blocked[1][3] = true;
blocked[1][9] = true;
blocked[5][6] = true;

export const cinderFields: MapDef = {
  id: "cinderFields",
  name: "The Cinder Fields",
  intro:
    "Past the bridge the land opens into a plain of burned farmland — black stubble, broken fences, the husks of barns. There is no chokepoint to hold here; Maldrath's roving company means to surround you on open ground. Use the rubble for cover and don't let them flank.",
  width: 13,
  height: 11,
  heights,
  blocked,
  playerSpawns: [
    { x: 2, y: 10 },
    { x: 4, y: 10 },
    { x: 6, y: 10 },
    { x: 8, y: 10 },
    { x: 10, y: 10 },
    { x: 6, y: 9 },
  ],
  enemies: [
    { name: "Cinder Marauder", classId: "knight", level: 5, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 4, y: 1 } },
    { name: "Ash Archer", classId: "archer", level: 5, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 10, y: 1 } },
    { name: "Scorch Mage", classId: "blackMage", level: 5, weaponId: "rod", skillIds: ["fire", "poison"], pos: { x: 6, y: 0 } },
    { name: "Field Cleric", classId: "whiteMage", level: 4, weaponId: "staff", skillIds: ["cure", "protect"], pos: { x: 2, y: 2 } },
    { name: "Reaver Monk", classId: "monk", level: 5, weaponId: "knuckles", skillIds: ["palmStrike", "earthShake"], pos: { x: 10, y: 2 } },
    { name: "Brigand Lieutenant", classId: "thief", level: 5, weaponId: "dagger", skillIds: ["backstab", "hamstring"], pos: { x: 6, y: 2 } },
  ],
};
