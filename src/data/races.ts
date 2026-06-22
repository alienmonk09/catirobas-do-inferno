import type { RaceDef, RaceId } from "../core/types";

/**
 * Espécies do Catirobas do Inferno. 4 espécies de herói (Cavalo, Porco, Slime,
 * Esqueleto) + 4 espécies de inimigo (Nice Guy, Troll Incel, Homem Caverna,
 * Corporate Bro). Modificadores flat de stats e afinidades elementais.
 *
 * Mapeamento interno (IDs estáveis → espécie GDD):
 *   dwarf   → Cavalo    (Boleto)   — resistente, lento, resiste fogo
 *   gnome   → Porco     (Porquinho) — mágico, frágil, resiste raio
 *   saurian → Slime     (Meleca)   — muito HP, físico, resiste fogo
 *   elf     → Esqueleto (Caveira)  — rápido, frágil, resiste natureza
 *   human   → Nice Guy   (inimigo) — neutro, sem forças nem fraquezas
 *   orc     → Troll Incel (inimigo) — forte, durão, mau em magia
 *   halfling→ Homem Caverna (inimigo) — ágil, pequeno
 *   sylph   → Corporate Bro (inimigo) — rápido, frágil
 */
export const RACES: Record<RaceId, RaceDef> = {
  human: {
    id: "human",
    name: "Nice Guy",
    description: "Adaptável e sem qualidades — sem forças, sem fraquezas. O inimigo genérico.",
    mod: {},
  },
  elf: {
    id: "elf",
    name: "Esqueleto",
    description: "Ossos rápidos e frágeis. Ágil e mágico, mas quebra fácil. Fogo o derrete; floresta o acolhe.",
    mod: { hp: -8, mag: 3, res: 2, spd: 2 },
    weak: ["fire"],
    resist: ["nature"],
  },
  dwarf: {
    id: "dwarf",
    name: "Cavalo",
    description: "Cavalo bípede teimoso e blindado, mas lento. Forjado na ferraria — fogo resborda; natureza o sufoca.",
    mod: { hp: 12, def: 3, spd: -2 },
    weak: ["nature"],
    resist: ["fire"],
  },
  halfling: {
    id: "halfling",
    name: "Homem Caverna",
    description: "Skirmisher ágil — veloz e seguro nos pés, leve em músculo. Desvia de faíscas, mas pega fogo fácil.",
    mod: { hp: -6, atk: -2, spd: 3, move: 1, jump: 1 },
    weak: ["fire"],
    resist: ["bolt"],
  },
  orc: {
    id: "orc",
    name: "Troll Incel",
    description: "Brutal e durão, com pouca aptidão mágica. Resistente a toxinas, mas raio o derruba — e luz santa sangra seu sangue negro.",
    mod: { hp: 10, atk: 3, mag: -3, res: -2 },
    weak: ["bolt", "holy"],
    resist: ["nature"],
  },
  gnome: {
    id: "gnome",
    name: "Porco",
    description: "Porquinho mágico e ansioso — mana profunda e wits afiados, mas corpo pequeno. Isolado contra raios; uma faísca e a oficina pega fogo.",
    mod: { mp: 10, mag: 3, res: 2, hp: -6, atk: -1 },
    weak: ["fire"],
    resist: ["bolt"],
  },
  saurian: {
    id: "saurian",
    name: "Slime",
    description: "Gosma translúcida e fria — muito HP e força física, lento e burro em magia. Fogo resborda; frio o deixa torpe.",
    mod: { hp: 14, atk: 3, def: 1, spd: -2, mag: -3 },
    weak: ["ice"],
    resist: ["fire"],
  },
  sylph: {
    id: "sylph",
    name: "Corporate Bro",
    description: "Bro enxuto e rápido — veloz, casting rápido, leve como pena, mas mal lá pra um golpe sólido. O vento-grounda a fúria da tempestade; bosques o embalam.",
    mod: { spd: 3, mag: 2, move: 1, hp: -10, def: -2 },
    weak: ["bolt"],
    resist: ["nature"],
  },
};

export function getRace(id: RaceId): RaceDef {
  return RACES[id];
}