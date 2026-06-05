import type { SkillDef } from "../../core/types";

/** Archer skills. */
export const ARCHER_SKILLS: Record<string, SkillDef> = {
  aimedShot: {
    id: "aimedShot",
    name: "Aimed Shot",
    description: "A precise ranged shot with bonus damage.",
    mpCost: 3,
    jpCost: 100,
    range: 4,
    aoe: "single",
    power: 14,
    element: "none",
    effect: "damage",
    scaling: "physical",
  },
  cripple: {
    id: "cripple",
    name: "Cripple",
    description: "Slow a target, lowering its turn speed.",
    mpCost: 5,
    jpCost: 150,
    range: 4,
    aoe: "single",
    power: 0,
    element: "none",
    effect: "debuff",
    scaling: "physical",
    statusKind: "slow",
  },
};
