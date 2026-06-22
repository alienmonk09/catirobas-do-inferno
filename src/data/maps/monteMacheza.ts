import type { MapDef, TerrainType } from "../../core/types";

const R: TerrainType = "rock";
const G: TerrainType = "grass";
const D: TerrainType = "dirt";
const W: TerrainType = "water";

const heights: number[][] = [
  [4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4],
  [3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 4, 3],
  [3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
  [2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 2],
  [2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2],
  [1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1],
  [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
  [0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const terrain: TerrainType[][] = heights.map((row) => row.map(() => G));
// Snowcaps at the peak
for (let x = 5; x <= 10; x++) {
  terrain[0][x] = R;
  terrain[1][x] = R;
}
// Scree slopes
for (let y = 2; y < 6; y++) {
  for (let x = 4; x < 12; x++) {
    terrain[y][x] = D;
  }
}
// Water melt channels at the base corners (not on spawn tiles)
terrain[16][0] = W; terrain[16][1] = W;
terrain[17][0] = W; terrain[17][1] = W;
terrain[16][14] = W; terrain[16][15] = W;
terrain[17][14] = W; terrain[17][15] = W;

const blocked: boolean[][] = heights.map((row) => row.map(() => false));
// Two chasm bands flanking the final approach — funnel up the center.
for (let y = 7; y <= 10; y++) {
  blocked[y][2] = true;
  blocked[y][3] = true;
  blocked[y][12] = true;
  blocked[y][13] = true;
}
blocked[8][0] = true; blocked[8][1] = true;
blocked[8][14] = true; blocked[8][15] = true;
blocked[16][0] = true; blocked[16][1] = true;
blocked[17][0] = true; blocked[17][1] = true;
blocked[16][14] = true; blocked[16][15] = true;
blocked[17][14] = true; blocked[17][15] = true;

export const monteMacheza: MapDef = {
  id: "monteMacheza",
  name: "Monte Macheza",
  intro:
    "O pico montanhoso onde o Fogo Primordial existe — ou talvez não. Subindo pelo funil central entre dois abismos, os heróis enfrentam o último desafio. No topo, a Senhora Razão manifesta para o diálogo filosófico final. A macheza real estava dentro de vocês o tempo todo — ou não, depende.",
  objective: { kind: "defeat", targetName: "Senhora Razão" },
  width: 16,
  height: 18,
  heights,
  blocked,
  terrain,
  playerSpawns: [
    { x: 5, y: 17 },
    { x: 6, y: 17 },
    { x: 7, y: 17 },
    { x: 8, y: 17 },
    { x: 9, y: 17 },
    { x: 10, y: 17 },
    { x: 7, y: 16 },
    { x: 8, y: 16 },
  ],
  enemies: [
    { name: "Senhora Razão", classId: "whiteMage", level: 14, weaponId: "staff", skillIds: ["cure", "cura", "raise", "protect", "haste", "abracadabrumSexicus", "incantumConfusus"], pos: { x: 8, y: 0 }, raceId: "human" },
    { name: "Guardião da Macheza", classId: "knight", level: 13, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 6, y: 1 }, raceId: "orc", personality: "aggressive" },
    { name: "Profeta do Fogo Primordial", classId: "blackMage", level: 13, weaponId: "rod", skillIds: ["fire", "fireball", "bolt", "poison", "stop"], pos: { x: 10, y: 1 }, raceId: "sylph" },
    { name: "Cavaleiro da Razão", classId: "paladin", level: 12, weaponId: "mace", skillIds: ["smite", "layOnHands", "holyLance"], pos: { x: 7, y: 3 }, raceId: "halfling" },
    { name: "Berserker Macheza", classId: "berserker", level: 12, weaponId: "axe", skillIds: ["rampage", "cleave", "crushingBlow"], pos: { x: 9, y: 3 }, raceId: "orc", personality: "aggressive" },
    { name: "Arqueiro da Cordilheira", classId: "archer", level: 12, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 11, y: 2 }, raceId: "sylph" },
    { name: "Monge do Pico", classId: "monk", level: 12, weaponId: "knuckles", skillIds: ["palmStrike", "earthShake", "chakra"], pos: { x: 5, y: 2 }, raceId: "halfling" },
    { name: "Ninja da Neblina", classId: "ninja", level: 12, weaponId: "katana", skillIds: ["shadowStrike", "throwFlame"], pos: { x: 8, y: 5 }, raceId: "sylph", personality: "aggressive" },
    { name: "Lorde dos Ecos", classId: "summoner", level: 11, weaponId: "grimoire", skillIds: ["callIfrit", "callRamuh"], pos: { x: 4, y: 6 }, raceId: "human" },
    { name: "Sentinela do Abismo", classId: "knight", level: 11, weaponId: "sword", skillIds: ["powerStrike", "guard"], pos: { x: 11, y: 6 }, raceId: "orc" },
    { name: "Clérigo do Cume", classId: "whiteMage", level: 11, weaponId: "staff", skillIds: ["cure", "cura", "raise", "protect", "haste"], pos: { x: 7, y: 7 }, raceId: "human", personality: "support" },
  ],
  chests: [
    { pos: { x: 0, y: 13 }, loot: { gold: 120, items: ["xPotion"] } },
    { pos: { x: 15, y: 13 }, loot: { gold: 150, items: ["megaPhoenix"] } },
  ],
};