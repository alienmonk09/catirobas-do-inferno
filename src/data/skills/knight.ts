import type { SkillDef } from "../../core/types";

/** Knight skills. */
export const KNIGHT_SKILLS: Record<string, SkillDef> = {
  powerStrike: {
    id: "powerStrike",
    name: "Power Strike",
    description: "A heavy melee blow.",
    mpCost: 4,
    spCost: 100,
    range: 1,
    aoe: "single",
    power: 18,
    element: "none",
    effect: "damage",
    scaling: "physical",
    knockback: 1,
  },
  guard: {
    id: "guard",
    name: "Guard",
    description: "Raise own defense for 2 turns.",
    mpCost: 3,
    spCost: 150,
    range: 0,
    aoe: "single",
    power: 0,
    element: "none",
    effect: "buff",
    scaling: "physical",
    statusKind: "guard",
  },
};
