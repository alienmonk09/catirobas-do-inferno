import type { MapDef, TerrainType } from "../../core/types";

const R: TerrainType = "rock";
const D: TerrainType = "dirt";
const G: TerrainType = "grass";

const terrain: TerrainType[][] = [
  [R, R, R, R, R, R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R, R, R, R, R, R],
  [D, D, D, D, D, D, D, D, D, D, D, D],
  [D, D, D, D, D, D, D, D, D, D, D, D],
  [D, D, D, D, D, D, D, D, D, D, D, D],
  [D, D, D, D, D, D, D, D, D, D, D, D],
  [D, D, D, D, D, D, D, D, D, D, D, D],
  [D, D, D, D, D, D, D, D, D, D, D, D],
  [G, G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G, G],
];

export const cavernaDoConstrangimento: MapDef = {
  id: "cavernaDoConstrangimento",
  name: "Caverna do Constrangimento",
  intro:
    "Uma caverna que ecoa flashbacks constrangedores. Stalactites pingam, paredes sussurram. Homens Caverna primitivos guardam a passagem, e no fundo da gruta, Seu Reflexo Ligeiramente Mais Atraente aguarda — igual a você, mas melhor em tudo.",
  objective: { kind: "seize", x: 6, y: 0 },
  width: 12,
  height: 14,
  heights: [
    [3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3],
    [2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2],
    [2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2],
    [1, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 1],
    [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1],
    [0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0],
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
  playerSpawns: [
    { x: 3, y: 13 },
    { x: 4, y: 13 },
    { x: 5, y: 13 },
    { x: 6, y: 13 },
    { x: 7, y: 13 },
    { x: 5, y: 12 },
  ],
  enemies: [
    { name: "Homem Caverna Bruto", classId: "knight", level: 8, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 5, y: 1 }, raceId: "halfling" },
    { name: "Homem Caverna Sombrio", classId: "ninja", level: 9, weaponId: "katana", skillIds: ["shadowStrike", "throwFlame"], pos: { x: 8, y: 2 }, raceId: "halfling", personality: "aggressive" },
    { name: "Nice Guy Avengeance", classId: "blackMage", level: 8, weaponId: "rod", skillIds: ["fire", "bolt", "poison"], pos: { x: 3, y: 2 }, raceId: "human" },
    { name: "Homem Caverna Troglodita", classId: "monk", level: 8, weaponId: "knuckles", skillIds: ["palmStrike", "earthShake"], pos: { x: 6, y: 4 }, raceId: "halfling" },
    { name: "Nice Guy Resentimento", classId: "whiteMage", level: 8, weaponId: "staff", skillIds: ["cure", "cura", "protect"], pos: { x: 2, y: 5 }, raceId: "human", personality: "support" },
    { name: "Homem Caverna Ferrão", classId: "archer", level: 9, weaponId: "longbow", skillIds: ["aimedShot", "cripple"], pos: { x: 9, y: 5 }, raceId: "halfling" },
    { name: "Seu Reflexo Ligeiramente Mais Atraente", classId: "knight", level: 10, weaponId: "greatsword", skillIds: ["powerStrike", "guard"], pos: { x: 5, y: 0 }, raceId: "human" },
  ],
  chests: [
    { pos: { x: 1, y: 9 }, loot: { gold: 55, items: ["hiPotion"] } },
    { pos: { x: 10, y: 9 }, loot: { gold: 50, items: ["phoenixDown"] } },
  ],
};