import { describe, it, expect } from "vitest";
import { validateSprite } from "../src/engine/sprite";
import { CHARACTER_SPRITES } from "../src/data/sprites/characters";
import { WEAPON_SPRITES } from "../src/data/sprites/weapons";
import { ITEM_SPRITES } from "../src/data/sprites/items";
import { SKILL_SPRITES } from "../src/data/sprites/skills";
import { VFX } from "../src/data/sprites/vfx";
import { vfxKeyForSkill, vfxKeyForWeapon } from "../src/data/sprites";
import { CLASSES } from "../src/data/classes";
import { WEAPONS } from "../src/data/weapons";
import { ITEMS } from "../src/data/items";
import { SKILLS } from "../src/data/skills";

describe("sprite data", () => {
  const allStatic = {
    ...CHARACTER_SPRITES,
    ...WEAPON_SPRITES,
    ...ITEM_SPRITES,
    ...SKILL_SPRITES,
  };

  for (const [id, def] of Object.entries(allStatic)) {
    it(`${id} is a valid sprite (rectangular, palette-covered)`, () => {
      expect(validateSprite(def)).toEqual([]);
    });
  }

  for (const [key, anim] of Object.entries(VFX)) {
    it(`vfx ${key} has valid frames`, () => {
      expect(anim.frames.length).toBeGreaterThan(0);
      for (const f of anim.frames) expect(validateSprite(f)).toEqual([]);
      expect(anim.frameDur).toBeGreaterThan(0);
    });
  }

  it("every class/weapon/item/skill id has a sprite", () => {
    const chars: Record<string, unknown> = CHARACTER_SPRITES;
    for (const id of Object.keys(CLASSES)) expect(chars[id]).toBeTruthy();
    for (const id of Object.keys(WEAPONS)) expect(WEAPON_SPRITES[id]).toBeTruthy();
    for (const id of Object.keys(ITEMS)) expect(ITEM_SPRITES[id]).toBeTruthy();
    for (const id of Object.keys(SKILLS)) expect(SKILL_SPRITES[id]).toBeTruthy();
  });

  it("every skill and weapon resolves to an existing VFX family", () => {
    for (const s of Object.values(SKILLS)) expect(VFX[vfxKeyForSkill(s)]).toBeTruthy();
    for (const w of Object.values(WEAPONS)) expect(VFX[vfxKeyForWeapon(w)]).toBeTruthy();
  });
});
