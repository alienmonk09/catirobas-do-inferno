import type { MapDef } from "../../../core/types";

// Outer Ramparts — the keep's fortified outer wall, the last line before the
// throne. A raised stone rampart (height 2-3) walls off the courtyard; the face
// is impassable except a central gate, so the approach is a real chokepoint with
// archers and a mage firing down from the wall. The wider wall now sweeps the
// whole crown, with side stairs at the ends rewarding a flank over a gate rush.
const heights: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 2, 1, 0],
  [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Merlons on the wall top and the wall face are solid stone; the only break is
// the central gate (row 3, columns 7-10) and the height-1 stair ends.
const blocked: boolean[][] = heights.map((row) => row.map(() => false));
for (const [y, x] of [
  [1, 1], [1, 2], [1, 15], [1, 16],
  [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
  [3, 11], [3, 12], [3, 13], [3, 14], [3, 15],
]) {
  blocked[y][x] = true;
}

export const outerRamparts: MapDef = {
  id: "outerRamparts",
  name: "The Outer Ramparts",
  intro:
    "The keep's outer wall rears up out of the ash — merlons manned, a single gate yawning at its center. Maldrath's garrison holds the high stone and rains shafts and fire on the courtyard below. The rampart runs wide now, stairs climbing at either end. Force the gate or scale the flanks and seize the gatehouse at the wall's crown to break the garrison's hold.",
  objective: { kind: "seize", x: 8, y: 0 },
  width: 18,
  height: 16,
  heights,
  blocked,
  playerSpawns: [
    { x: 6, y: 15 },
    { x: 7, y: 15 },
    { x: 8, y: 15 },
    { x: 9, y: 15 },
    { x: 10, y: 15 },
    { x: 11, y: 15 },
    { x: 7, y: 14 },
    { x: 10, y: 14 },
  ],
  enemies: [
    { name: "Rampart Captain", classId: "knight", level: 10, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 4, y: 1 }, personality: "aggressive", raceId: "dwarf" },
    { name: "Wall Knight", classId: "knight", level: 10, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 13, y: 1 }, personality: "aggressive", raceId: "dwarf" },
    { name: "Siege Mage", classId: "blackMage", level: 10, weaponId: "rod", skillIds: ["fire", "bolt", "stop"], pos: { x: 7, y: 1 }, raceId: "gnome" },
    { name: "Storm Mage", classId: "blackMage", level: 10, weaponId: "rod", skillIds: ["fire", "bolt", "stop"], pos: { x: 10, y: 1 }, raceId: "gnome" },
    { name: "Wall Sentry", classId: "archer", level: 9, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 12, y: 2 }, personality: "defensive", raceId: "halfling" },
    { name: "Wall Watcher", classId: "archer", level: 9, weaponId: "bow", skillIds: ["aimedShot"], pos: { x: 5, y: 2 }, personality: "defensive", raceId: "halfling" },
    { name: "Crown Archer", classId: "archer", level: 9, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 2, y: 0 }, personality: "defensive", raceId: "halfling" },
    { name: "Flank Archer", classId: "archer", level: 9, weaponId: "bow", skillIds: ["aimedShot"], pos: { x: 16, y: 2 }, personality: "defensive", raceId: "halfling" },
    { name: "Gate Cleric", classId: "whiteMage", level: 9, weaponId: "staff", skillIds: ["cure", "protect", "haste"], pos: { x: 9, y: 2 }, personality: "support", raceId: "human" },
    { name: "Wall Cleric", classId: "whiteMage", level: 9, weaponId: "staff", skillIds: ["cure", "protect", "haste"], pos: { x: 15, y: 0 }, personality: "support", raceId: "human" },
    { name: "Gate Breaker", classId: "berserker", level: 10, weaponId: "warAxe", skillIds: ["rampage", "cleave"], pos: { x: 8, y: 4 }, personality: "aggressive", raceId: "saurian" },
    { name: "Gate Mauler", classId: "berserker", level: 10, weaponId: "warAxe", skillIds: ["rampage", "cleave"], pos: { x: 9, y: 5 }, personality: "aggressive", raceId: "saurian" },
  ],
  // Stashed near the wall ends, rewarding a flank rather than a straight gate rush.
  chests: [
    { pos: { x: 2, y: 7 }, loot: { gold: 60, items: ["hiPotion"] } },
    { pos: { x: 15, y: 7 }, loot: { gold: 70, items: ["phoenixDown"] } },
  ],
};
