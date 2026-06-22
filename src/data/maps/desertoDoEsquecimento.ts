import type { MapDef, TerrainType } from "../../core/types";

const S: TerrainType = "sand";
const R: TerrainType = "rock";
const G: TerrainType = "grass";

const terrain: TerrainType[][] = [
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [R, R, S, S, S, S, S, S, S, S, R, R],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [S, S, S, S, S, S, S, S, S, S, S, S],
  [G, G, S, S, S, S, S, S, S, S, G, G],
];

export const desertoDoEsquecimento: MapDef = {
  id: "desertoDoEsquecimento",
  name: "Deserto do Esquecimento",
  intro:
    "Areia, calor, e solidão absoluta. A cada três turnos, heróis podem trocar ataques por confusão — até os heróis se esquecem quem são. Trolls Incel e Corporate Bros patrulham as dunas, e no centro, a Miragem do Ego shimmering.",
  objective: { kind: "defend", x: 6, y: 11, turns: 7 },
  width: 12,
  height: 13,
  heights: [
    [2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2],
    [1, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1],
    [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1],
    [1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    [0, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  terrain,
  blocked: [
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [true, true, false, false, false, false, false, false, false, false, true, true],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
  ],
  playerSpawns: [
    { x: 3, y: 12 },
    { x: 4, y: 12 },
    { x: 5, y: 12 },
    { x: 6, y: 12 },
    { x: 7, y: 12 },
    { x: 5, y: 11 },
  ],
  enemies: [
    { name: "Troll Incel das Dunas", classId: "knight", level: 6, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 4, y: 1 }, raceId: "orc", personality: "aggressive" },
    { name: "Corporate Bro Mirage", classId: "ninja", level: 7, weaponId: "katana", skillIds: ["shadowStrike"], pos: { x: 7, y: 1 }, raceId: "sylph", personality: "aggressive" },
    { name: "Troll Incel Perdido", classId: "monk", level: 6, weaponId: "knuckles", skillIds: ["palmStrike", "chakra"], pos: { x: 2, y: 3 }, raceId: "orc" },
    { name: "Corporate Bro Thirsty", classId: "archer", level: 7, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 9, y: 3 }, raceId: "sylph" },
    { name: "Miragem do Ego", classId: "blackMage", level: 8, weaponId: "rod", skillIds: ["fire", "fireball", "poison", "stop"], pos: { x: 5, y: 0 }, raceId: "sylph" },
    { name: "Troll Incel da Areia", classId: "thief", level: 6, weaponId: "dagger", skillIds: ["backstab", "hamstring"], pos: { x: 6, y: 4 }, raceId: "orc" },
    { name: "Corporate Bro Midlife", classId: "whiteMage", level: 6, weaponId: "staff", skillIds: ["cure", "protect"], pos: { x: 3, y: 5 }, raceId: "sylph", personality: "support" },
  ],
  biomeRules: {
    confusion: { chance: 0.3, interval: 3 },
  },
  chests: [
    { pos: { x: 2, y: 8 }, loot: { gold: 45, items: ["hiPotion"] } },
    { pos: { x: 9, y: 8 }, loot: { gold: 40, items: ["ether"] } },
  ],
};