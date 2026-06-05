import type { SkillDef } from "../../core/types";

/** Time Mage skills. */
export const TIME_MAGE_SKILLS: Record<string, SkillDef> = {
  comet: {
    id: "comet",
    name: "Comet",
    description: "Call down a shard of non-elemental star-stuff (ignores resistances).",
    mpCost: 6,
    jpCost: 100,
    range: 4,
    aoe: "single",
    power: 17,
    element: "none",
    effect: "damage",
    scaling: "magical",
  },
  timeSlow: {
    id: "timeSlow",
    name: "Slow",
    description: "Drag a foe out of step with time, halving its turn speed.",
    mpCost: 6,
    jpCost: 150,
    range: 4,
    aoe: "single",
    power: 0,
    element: "none",
    effect: "debuff",
    scaling: "magical",
    statusKind: "slow",
    statusDuration: 3,
  },
};
