import type { MapDef, TerrainType } from "../../core/types";

// Cinder Fields — a wide, open stretch of burned farmland after the bridge.
// Larger terrain than the early maps: scattered low rises and rubble mounds
// (height-2/3 blocks read as rock cover) break the sightlines on an open field,
// while two lava lanes scar the mid-field and funnel any advance into the center.
const heights: number[][] = [
  [2, 1, 1, 2, 1, 1, 2, 3, 2, 2, 3, 2, 1, 1, 2, 1, 1, 2],
  [1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 1, 1, 2, 1, 1, 2, 1, 0, 0, 1, 0, 0, 0],
  [1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 1, 2, 2, 3, 2, 2, 3, 2, 1, 1, 0, 0, 0, 1],
  [0, 0, 0, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Rubble mounds (the height-2/3 blocks) are impassable cover; everything else open.
const blocked: boolean[][] = heights.map((row) => row.map(() => false));
blocked[1][3] = true;
blocked[1][14] = true;
blocked[5][7] = true;
blocked[5][10] = true;
blocked[7][7] = true;
blocked[7][10] = true;

// Default every tile to "dirt" (burned farmland feel), then mark two lava lanes
// cutting across the mid-field. These tiles are all walkable — stepping on them
// costs HP at end of turn.
const G: TerrainType = "dirt";
const L: TerrainType = "lava";
const terrain: TerrainType[][] = heights.map((row) => row.map(() => G));
// Left lava lane (rows 3–5, columns 1–3)
terrain[3][1] = L;
terrain[3][2] = L;
terrain[4][1] = L;
terrain[4][2] = L;
terrain[5][2] = L;
// Right lava lane (rows 3–5, columns 14–16)
terrain[3][15] = L;
terrain[3][16] = L;
terrain[4][15] = L;
terrain[4][16] = L;
terrain[5][14] = L;

// Keep the blocked rubble mounds reading as rocky cover — without this they'd
// inherit "dirt" from the grid above and lose the visual distinction the intro
// leans on ("use the rubble for cover").
const R: TerrainType = "rock";
terrain[1][3] = R;
terrain[1][14] = R;
terrain[5][7] = R;
terrain[5][10] = R;
terrain[7][7] = R;
terrain[7][10] = R;

export const cinderFields: MapDef = {
  id: "cinderFields",
  name: "The Cinder Fields",
  intro:
    "Past the bridge the land opens into a plain of burned farmland — black stubble, broken fences, the husks of barns. Maldrath's roving company means to overrun your position. The field has only widened since the last scouts mapped it: lava seams now scar the flanks and rubble mounds break the open ground. Hold the rally point at the field's center and don't let them seize it — survive long enough and reinforcements will turn the tide.",
  objective: { kind: "defend", x: 8, y: 11, turns: 7 },
  width: 18,
  height: 15,
  heights,
  blocked,
  terrain,
  playerSpawns: [
    { x: 5, y: 14 },
    { x: 7, y: 14 },
    { x: 9, y: 14 },
    { x: 11, y: 14 },
    { x: 13, y: 14 },
    { x: 7, y: 13 },
    { x: 9, y: 13 },
  ],
  enemies: [
    { name: "Cinder Marauder", classId: "knight", level: 6, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 5, y: 1 }, personality: "aggressive", raceId: "orc" },
    { name: "Ash Archer", classId: "archer", level: 7, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 13, y: 1 }, raceId: "halfling" },
    { name: "Scorch Mage", classId: "blackMage", level: 7, weaponId: "rod", skillIds: ["fire", "poison"], pos: { x: 8, y: 0 }, raceId: "elf" },
    { name: "Field Cleric", classId: "whiteMage", level: 6, weaponId: "staff", skillIds: ["cure", "protect"], pos: { x: 3, y: 2 }, personality: "support", raceId: "human" },
    { name: "Cinder Stalker", classId: "ninja", level: 7, weaponId: "katana", skillIds: ["shadowStrike", "throwFlame"], pos: { x: 14, y: 2 }, personality: "aggressive", raceId: "sylph" },
    { name: "Brigand Lieutenant", classId: "thief", level: 6, weaponId: "dagger", skillIds: ["backstab", "hamstring"], pos: { x: 9, y: 2 }, raceId: "halfling" },
    { name: "Cinder Reaver", classId: "knight", level: 6, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 2, y: 2 }, personality: "aggressive", raceId: "orc" },
    { name: "Ash Skirmisher", classId: "archer", level: 6, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 16, y: 2 }, raceId: "halfling" },
    { name: "Ember Acolyte", classId: "whiteMage", level: 6, weaponId: "staff", skillIds: ["cure", "protect"], pos: { x: 1, y: 5 }, personality: "support", raceId: "human" },
    { name: "Soot Knave", classId: "thief", level: 6, weaponId: "dagger", skillIds: ["backstab", "hamstring"], pos: { x: 12, y: 4 }, raceId: "halfling" },
    { name: "Cinder Phantom", classId: "ninja", level: 7, weaponId: "katana", skillIds: ["shadowStrike", "throwFlame"], pos: { x: 6, y: 4 }, personality: "aggressive", raceId: "sylph" },
  ],
  // Dropped supplies on the open flanks, clear of the lava lanes and the rally point.
  chests: [
    { pos: { x: 2, y: 8 }, loot: { gold: 55, items: ["hiPotion"] } },
    { pos: { x: 15, y: 8 }, loot: { gold: 50, items: ["phoenixDown"] } },
  ],
};
