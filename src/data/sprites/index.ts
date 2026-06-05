import type { ClassId, SkillDef, Unit, WeaponDef } from "../../core/types";
import type { AnimDef, SpriteDef } from "../../engine/sprite";
import { CHARACTER_SPRITES } from "./characters";
import { HERO_SPRITES } from "./heroes";
import { WEAPON_SPRITES } from "./weapons";
import { ITEM_SPRITES } from "./items";
import { SKILL_SPRITES } from "./skills";
import { EQUIPMENT_SPRITES } from "./equipment";
import { VFX } from "./vfx";
import { ROSTER } from "../party";
import { SKILLS } from "../skills";
import { WEAPONS } from "../weapons";
import { ITEMS } from "../items";

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
/** A roster hero's unique sprite, or undefined if none is defined for that id. */
export function getHeroSprite(id: string): SpriteDef | undefined {
  return HERO_SPRITES[id];
}

/**
 * Resolve a dialogue speaker name to their portrait sprite.
 * Matches ROSTER heroes case-insensitively. Returns null for the narrator ("—"),
 * unknown speakers (e.g. "Maldrath"), or heroes with no sprite defined.
 */
export function speakerSprite(name: string): SpriteDef | null {
  const lower = name.toLowerCase();
  const hero = ROSTER.find((h) => h.name.toLowerCase() === lower);
  if (!hero) return null;
  return HERO_SPRITES[hero.id] ?? null;
}
/**
 * The sprite to draw for a unit. Player units carry their roster id, so they get
 * their unique hero sprite; everyone else (enemies) uses the generic class art.
 */
export function getUnitSprite(unit: Unit): SpriteDef {
  if (unit.team === "player") {
    const hero = HERO_SPRITES[unit.id];
    if (hero) return hero;
  }
  return getCharacterSprite(unit.classId);
}
export function getWeaponSprite(id: string): SpriteDef {
  const hit = WEAPON_SPRITES[id];
  if (hit) return hit;
  // No dedicated icon: borrow a representative of the same kind so newer
  // weapons read correctly in the shop / unit panel instead of a grey box.
  const def = WEAPONS[id];
  if (def) return WEAPON_SPRITES[def.kind === "magical" ? "rod" : "sword"] ?? MISSING;
  return MISSING;
}
export function getItemSprite(id: string): SpriteDef {
  const hit = ITEM_SPRITES[id];
  if (hit) return hit;
  // No dedicated icon: borrow a representative of the same effect family so new
  // consumable variants (e.g. X-Potion) read correctly instead of a grey box.
  const def = ITEMS[id];
  if (def) {
    const rep = def.effect === "healMp" ? "ether"
      : def.effect === "revive" ? "phoenixDown"
      : def.effect === "buff" ? "hourglass"
      : "potion";
    return ITEM_SPRITES[rep] ?? MISSING;
  }
  return MISSING;
}
export function getSkillSprite(id: string): SpriteDef {
  const hit = SKILL_SPRITES[id];
  if (hit) return hit;
  // No dedicated icon: fall back to a representative sprite of the same
  // effect/element family so new skills get a sensible icon for free.
  const def = SKILLS[id];
  return def ? (SKILL_SPRITES[fallbackSkillSpriteId(def)] ?? MISSING) : MISSING;
}

/** Pick an existing skill sprite that matches a skill's effect/element family. */
function fallbackSkillSpriteId(def: SkillDef): string {
  switch (def.effect) {
    case "heal":
      return "cure";
    case "revive":
      return "raise";
    case "buff":
      return def.statusKind === "haste" ? "haste"
        : def.statusKind === "protect" ? "protect"
        : def.statusKind === "shell" ? "shell"
        : def.statusKind === "regen" ? "rejuvenate"
        : def.statusKind === "guard" ? "guard"
        : "haste";
    case "debuff":
      return def.statusKind === "poison" ? "poison"
        : def.statusKind === "stop" ? "stop"
        : "timeSlow";
    case "damage":
    default:
      switch (def.element) {
        case "fire": return "fire";
        case "bolt": return "bolt";
        case "ice": return "callShiva";
        case "nature": return "thornLash";
        default: return def.scaling === "magical" ? "comet" : "powerStrike";
      }
  }
}
export function getEquipmentSprite(idOrSlot: string): SpriteDef {
  return EQUIPMENT_SPRITES[idOrSlot] ?? MISSING;
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
  if (skill.element === "nature") {
    if (skill.effect === "revive") return "revive";
    if (skill.effect === "heal") return "heal";
    if (skill.effect === "buff" || skill.effect === "debuff") return "status";
    return "arcane";
  }
  // element "none"
  if (skill.effect === "heal") return "heal";
  if (skill.effect === "revive") return "revive";
  if (skill.effect === "buff" || skill.effect === "debuff") return "status";
  // Non-elemental magic damage (e.g. Time Mage's Comet) reads as arcane.
  if (skill.scaling === "magical") return "arcane";
  return "physical";
}

/** Map a basic weapon attack to its hit-effect family. */
export function vfxKeyForWeapon(weapon: WeaponDef): VfxKey {
  return weapon.kind === "magical" ? "arcane" : "physical";
}

export {
  CHARACTER_SPRITES,
  HERO_SPRITES,
  WEAPON_SPRITES,
  ITEM_SPRITES,
  SKILL_SPRITES,
  EQUIPMENT_SPRITES,
  VFX,
};
export type { SpriteDef, AnimDef };
