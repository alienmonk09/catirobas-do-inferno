import type { MapDef, TerrainType } from "../../core/types";

const G: TerrainType = "grass";
const D: TerrainType = "dirt";
const W: TerrainType = "wood";

const terrain: TerrainType[][] = [
  [G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G],
  [D, D, D, D, D, D, D, D, D],
  [W, W, W, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W],
  [D, D, D, D, D, D, D, D, D],
  [G, G, G, G, G, G, G, G, G],
];

export const tavernaDoLamento: MapDef = {
  id: "tavernaDoLamento",
  name: "Taverna do Lamento",
  intro:
    "A taverna escura e pegajosa onde tudo começou. O chão de madeira range, o ar cheira a cerveja velha. Alguns Nice Guys resolveram o chatear o bartentoer — hora de aprender o básico da briga.",
  width: 9,
  height: 9,
  heights: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  terrain,
  playerSpawns: [
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
    { x: 4, y: 6 },
  ],
  enemies: [
    { name: "Nice Guy Incomodado", classId: "knight", level: 2, weaponId: "sword", skillIds: ["powerStrike"], pos: { x: 4, y: 1 }, raceId: "human" },
    { name: "Bêbado da Mesa 1", classId: "monk", level: 1, weaponId: "knuckles", skillIds: [], pos: { x: 2, y: 2 }, raceId: "human" },
    { name: "Bêbado da Mesa 2", classId: "archer", level: 1, weaponId: "bow", skillIds: [], pos: { x: 6, y: 2 }, raceId: "halfling" },
  ],
  chests: [
    { pos: { x: 1, y: 4 }, loot: { gold: 25, items: ["potion"] } },
    { pos: { x: 7, y: 4 }, loot: { gold: 20, items: ["ether"] } },
  ],
};