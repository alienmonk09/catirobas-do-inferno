import type { SkillDef } from "../../core/types";
import { KNIGHT_SKILLS } from "./knight";
import { ARCHER_SKILLS } from "./archer";
import { BLACK_MAGE_SKILLS } from "./blackMage";
import { WHITE_MAGE_SKILLS } from "./whiteMage";
import { MONK_SKILLS } from "./monk";
import { THIEF_SKILLS } from "./thief";
import { DRUID_SKILLS } from "./druid";
import { TIME_MAGE_SKILLS } from "./timeMage";
import { SUMMONER_SKILLS } from "./summoner";
import { LANCER_SKILLS } from "./lancer";
import { GEOMANCER_SKILLS } from "./geomancer";
import { PALADIN_SKILLS } from "./paladin";
import { BERSERKER_SKILLS } from "./berserker";
import { NINJA_SKILLS } from "./ninja";
import { COMBO_SKILLS } from "./combos";

export const SKILLS: Record<string, SkillDef> = {
  ...KNIGHT_SKILLS,
  ...ARCHER_SKILLS,
  ...BLACK_MAGE_SKILLS,
  ...WHITE_MAGE_SKILLS,
  ...MONK_SKILLS,
  ...THIEF_SKILLS,
  ...DRUID_SKILLS,
  ...TIME_MAGE_SKILLS,
  ...SUMMONER_SKILLS,
  ...LANCER_SKILLS,
  ...GEOMANCER_SKILLS,
  ...PALADIN_SKILLS,
  ...BERSERKER_SKILLS,
  ...NINJA_SKILLS,
  ...COMBO_SKILLS,
};

export function getSkill(id: string): SkillDef {
  const s = SKILLS[id];
  if (!s) throw new Error(`Unknown skill: ${id}`);
  return s;
}