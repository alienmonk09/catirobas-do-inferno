import type { ClassId, SkillDef, WeaponDef } from "../../core/types";
import type { AnimDef, SpriteDef } from "../../engine/sprite";
import { CHARACTER_SPRITES } from "./characters";
import { WEAPON_SPRITES } from "./weapons";
import { ITEM_SPRITES } from "./items";
import { SKILL_SPRITES } from "./skills";
import { VFX } from "./vfx";

export type VfxKey =
  | "physical"
  | "arcane"
  | "fire"
  | "bolt"
  | "holy"
  | "heal"
  | "revive"
  | "status";

/** Tiny grey box shown if an id ever lacks a sprite (never expected in practice). */
const MISSING: SpriteDef = {
  palette: { o: "#888c99", x: "#cfd3dd" },
  rows: ["oooooo", "oxxxxo", "ox..xo", "oxxxxo", "oooooo"],
};

export function getCharacterSprite(classId: ClassId): SpriteDef {
  return CHARACTER_SPRITES[classId] ?? MISSING;
}
export function getWeaponSprite(id: string): SpriteDef {
  return WEAPON_SPRITES[id] ?? MISSING;
}
export function getItemSprite(id: string): SpriteDef {
  return ITEM_SPRITES[id] ?? MISSING;
}
export function getSkillSprite(id: string): SpriteDef {
  return SKILL_SPRITES[id] ?? MISSING;
}
export function getVfx(key: string): AnimDef | null {
  return VFX[key] ?? null;
}

/** Map a skill to its spell-effect family. */
export function vfxKeyForSkill(skill: SkillDef): VfxKey {
  if (skill.element === "fire") return "fire";
  if (skill.element === "bolt") return "bolt";
  if (skill.element === "holy") {
    if (skill.effect === "revive") return "revive";
    if (skill.effect === "heal") return "heal";
    return "holy";
  }
  // element "none"
  if (skill.effect === "heal") return "heal";
  if (skill.effect === "revive") return "revive";
  if (skill.effect === "buff" || skill.effect === "debuff") return "status";
  return "physical";
}

/** Map a basic weapon attack to its hit-effect family. */
export function vfxKeyForWeapon(weapon: WeaponDef): VfxKey {
  return weapon.kind === "magical" ? "arcane" : "physical";
}

export {
  CHARACTER_SPRITES,
  WEAPON_SPRITES,
  ITEM_SPRITES,
  SKILL_SPRITES,
  VFX,
};
export type { SpriteDef, AnimDef };
