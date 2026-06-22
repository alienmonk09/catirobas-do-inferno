import type { MapDef, TerrainType } from "../../core/types";

const G: TerrainType = "grass";
const M: TerrainType = "mire";
const D: TerrainType = "dirt";

const terrain: TerrainType[][] = [
  [G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G],
  [D, M, M, G, G, G, G, G, M, M, D],
  [D, D, M, M, G, G, G, M, M, D, D],
  [G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G],
];

export const florestaDaRejeicao: MapDef = {
  id: "florestaDaRejeicao",
  name: "Floresta da Rejeição",
  intro:
    "Árvores com rostos que riem de você. O chão é pantanoso onde as raízes apodreceram. Nice Guys espreitam entre os troncos, e no centro da clareira algo maior se agita — o Homem Árvore.",
  objective: { kind: "defeat", targetName: "Homem Árvore" },
  width: 11,
  height: 11,
  heights: [
    [2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1],
    [1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
    [1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1],
  ],
  terrain,
  playerSpawns: [
    { x: 2, y: 10 },
    { x: 3, y: 10 },
    { x: 4, y: 10 },
    { x: 6, y: 10 },
    { x: 7, y: 10 },
  ],
  enemies: [
    { name: "Nice Guy das Árvores", classId: "knight", level: 4, weaponId: "sword", skillIds: ["powerStrike", "guard"], pos: { x: 5, y: 0 }, raceId: "human" },
    { name: "Árvore Zombadora", classId: "archer", level: 3, weaponId: "bow", skillIds: ["aimedShot"], pos: { x: 2, y: 2 }, raceId: "halfling" },
    { name: "Nice Guy Folhudo", classId: "monk", level: 3, weaponId: "knuckles", skillIds: ["palmStrike"], pos: { x: 8, y: 2 }, raceId: "human" },
    { name: "Galho Carrancudo", classId: "thief", level: 3, weaponId: "dagger", skillIds: ["backstab"], pos: { x: 4, y: 3 }, raceId: "halfling" },
    { name: "Homem Árvore", classId: "druid", level: 5, weaponId: "heartwood", skillIds: ["entangle", "thornLash"], pos: { x: 5, y: 1 }, raceId: "orc" },
  ],
  chests: [
    { pos: { x: 1, y: 6 }, loot: { gold: 35, items: ["potion"] } },
    { pos: { x: 9, y: 6 }, loot: { gold: 30, items: ["ether"] } },
  ],
};