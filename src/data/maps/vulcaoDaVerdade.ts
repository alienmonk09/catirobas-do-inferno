import type { MapDef, TerrainType } from "../../core/types";

const L: TerrainType = "lava";
const R: TerrainType = "rock";
const D: TerrainType = "dirt";

const heights: number[][] = [
  [3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3],
  [2, 3, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 2],
  [2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2],
  [1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1],
  [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1],
  [0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const terrain: TerrainType[][] = heights.map((row) => row.map(() => D));
// Two lava rivers cutting the battlefield — walkable but painful.
// Left lava river (rows 5-7, columns 1-3)
terrain[5][1] = L; terrain[5][2] = L; terrain[5][3] = L;
terrain[6][1] = L; terrain[6][2] = L;
terrain[7][1] = L; terrain[7][2] = L;
// Right lava river (rows 5-7, columns 11-13)
terrain[5][11] = L; terrain[5][12] = L; terrain[5][13] = L;
terrain[6][12] = L; terrain[6][13] = L;
terrain[7][12] = L; terrain[7][13] = L;
// Central lava pool near the boss (rows 1-2, columns 6-8)
terrain[1][7] = L; terrain[1][8] = L;
terrain[2][7] = L;

const blocked: boolean[][] = heights.map((row) => row.map(() => false));
// Rock pillars around the lava pool for visual cover.
blocked[0][5] = true; terrain[0][5] = R;
blocked[0][9] = true; terrain[0][9] = R;
blocked[3][4] = true; terrain[3][4] = R;
blocked[3][10] = true; terrain[3][10] = R;

export const vulcaoDaVerdade: MapDef = {
  id: "vulcaoDaVerdade",
  name: "Vulcão da Verdade",
  intro:
    "Um vulcão literal da verdade onde o fogo brilha e tudo é quente. A cada turno, heróis tomam dano passivo pelo calor escaldante. Todos os tipos de inimigo surgem aqui — Nice Guys, Trolls Incel, Homens Caverna, Corporate Bros — e no topo arde a Manifestação da Realidade.",
  objective: { kind: "defeat", targetName: "Manifestação da Realidade" },
  width: 15,
  height: 14,
  heights,
  blocked,
  terrain,
  playerSpawns: [
    { x: 4, y: 13 },
    { x: 5, y: 13 },
    { x: 6, y: 13 },
    { x: 8, y: 13 },
    { x: 9, y: 13 },
    { x: 7, y: 12 },
  ],
  enemies: [
    { name: "Manifestação da Realidade", classId: "blackMage", level: 12, weaponId: "rod", skillIds: ["fire", "fireball", "bolt", "poison", "stop"], pos: { x: 7, y: 0 }, raceId: "sylph" },
    { name: "Troll Incel Ígneo", classId: "knight", level: 10, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 5, y: 1 }, raceId: "orc", personality: "aggressive" },
    { name: "Corporate Bro Wellness", classId: "ninja", level: 11, weaponId: "katana", skillIds: ["shadowStrike", "throwFlame"], pos: { x: 9, y: 1 }, raceId: "sylph", personality: "aggressive" },
    { name: "Homem Caverna Magmático", classId: "monk", level: 10, weaponId: "knuckles", skillIds: ["palmStrike", "earthShake"], pos: { x: 3, y: 3 }, raceId: "halfling" },
    { name: "Nice Guy Empoderado", classId: "whiteMage", level: 10, weaponId: "staff", skillIds: ["cure", "cura", "protect", "haste"], pos: { x: 11, y: 3 }, raceId: "human", personality: "support" },
    { name: "Troll Incel Brasado", classId: "berserker", level: 11, weaponId: "axe", skillIds: ["rampage", "cleave"], pos: { x: 6, y: 5 }, raceId: "orc", personality: "aggressive" },
    { name: "Corporate Bro Hustle", classId: "archer", level: 10, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 9, y: 5 }, raceId: "sylph" },
    { name: "Nice Guy Gaslight", classId: "thief", level: 10, weaponId: "dagger", skillIds: ["backstab", "hamstring"], pos: { x: 4, y: 6 }, raceId: "human" },
    { name: "Homem Caverna Vulcânico", classId: "lancer", level: 10, weaponId: "spear", skillIds: ["jump", "lanceThrust"], pos: { x: 10, y: 6 }, raceId: "halfling" },
  ],
  allies: [
    { name: "Zezé Iluminado", classId: "whiteMage", level: 10, weaponId: "staff", skillIds: ["cure", "cura", "protect", "haste"], pos: { x: 6, y: 11 }, raceId: "human" },
  ],
  biomeRules: {
    passiveDamage: { amount: 3 },
  },
  chests: [
    { pos: { x: 0, y: 10 }, loot: { gold: 80, items: ["xPotion"] } },
    { pos: { x: 14, y: 10 }, loot: { gold: 70, items: ["megaPhoenix"] } },
  ],
};