import type { SkillDef } from "../../core/types";

export const COMBO_SKILLS: Record<string, SkillDef> = {
  socoMagicoBrilhoso: {
    id: "socoMagicoBrilhoso",
    name: "Soco Mágico Brilhoso",
    description: "Combo Boleto+Porquinho. Soco físico dobrado por mágica.",
    mpCost: 12,
    spCost: 0,
    range: 1,
    aoe: "single",
    power: 36,
    element: "none",
    effect: "damage",
    scaling: "physical",
    knockback: 2,
  },
  abracoMortalDuplo: {
    id: "abracoMortalDuplo",
    name: "Abraço Mortal Duplo",
    description: "Combo Meleca+Caveira. DEF down no inimigo + ATK up em si.",
    mpCost: 10,
    spCost: 0,
    range: 1,
    aoe: "single",
    power: 20,
    element: "none",
    effect: "debuff",
    scaling: "physical",
    statusKind: "defDown",
    statusDuration: 3,
    knockback: 1,
  },
  formacaoMachezaFinal: {
    id: "formacaoMachezaFinal",
    name: "Formação Macheza Final",
    description: "Combo dos 4 heróis. ATK +50%, mas falha 20% das vezes.",
    mpCost: 20,
    spCost: 0,
    range: 0,
    aoe: "square3",
    power: 0,
    element: "none",
    effect: "buff",
    scaling: "physical",
    statusKind: "atkUp",
    statusDuration: 3,
  },
};

export const COMBO_REQUIREMENTS: Record<string, string[]> = {
  socoMagicoBrilhoso: ["boleto", "porquinho"],
  abracoMortalDuplo: ["meleca", "caveira"],
  formacaoMachezaFinal: ["boleto", "porquinho", "meleca", "caveira"],
};

export const COMBO_FAIL_CHANCES: Record<string, number> = {
  socoMagicoBrilhoso: 0,
  abracoMortalDuplo: 0,
  formacaoMachezaFinal: 0.2,
};

export function getComboSkill(id: string): SkillDef {
  const s = COMBO_SKILLS[id];
  if (!s) throw new Error(`Unknown combo skill: ${id}`);
  return s;
}