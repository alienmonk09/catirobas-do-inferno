import { describe, it, expect } from "vitest";
import { validateSprite, spriteWidth, spriteHeight } from "../src/engine/sprite";
import { CHARACTER_SPRITES } from "../src/data/sprites/characters";
import { HERO_SPRITES } from "../src/data/sprites/heroes";
import { WEAPON_SPRITES } from "../src/data/sprites/weapons";
import { ITEM_SPRITES } from "../src/data/sprites/items";
import { SKILL_SPRITES } from "../src/data/sprites/skills";
import { VFX } from "../src/data/sprites/vfx";
import { vfxKeyForSkill, vfxKeyForWeapon, getWeaponSprite, getSkillSprite, getItemSprite } from "../src/data/sprites";
import { CLASSES } from "../src/data/classes";
import { WEAPONS } from "../src/data/weapons";
import { ITEMS } from "../src/data/items";
import { SKILLS } from "../src/data/skills";
import { ROSTER } from "../src/data/party";

describe("sprite data", () => {
  const allStatic = {
    ...CHARACTER_SPRITES,
    ...HERO_SPRITES,
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

  it("every class id has a dedicated sprite", () => {
    const chars: Record<string, unknown> = CHARACTER_SPRITES;
    for (const id of Object.keys(CLASSES)) expect(chars[id]).toBeTruthy();
  });

  it("every weapon/item/skill id resolves to a real sprite (dedicated or same-family fallback)", () => {
    // Weapons, items & skills may borrow a same-family authored icon via the
    // resolver (e.g. a new fire skill reuses the Fire icon) — never the grey box.
    const weaponSprites = Object.values(WEAPON_SPRITES);
    for (const id of Object.keys(WEAPONS)) expect(weaponSprites).toContain(getWeaponSprite(id));
    const itemSprites = Object.values(ITEM_SPRITES);
    for (const id of Object.keys(ITEMS)) expect(itemSprites).toContain(getItemSprite(id));
    const skillSprites = Object.values(SKILL_SPRITES);
    for (const id of Object.keys(SKILLS)) expect(skillSprites).toContain(getSkillSprite(id));
  });

  it("every skill and weapon resolves to an existing VFX family", () => {
    for (const s of Object.values(SKILLS)) expect(VFX[vfxKeyForSkill(s)]).toBeTruthy();
    for (const w of Object.values(WEAPONS)) expect(VFX[vfxKeyForWeapon(w)]).toBeTruthy();
  });

  it("every roster hero has a unique 38x50 hero sprite", () => {
    for (const h of ROSTER) {
      const def = HERO_SPRITES[h.id];
      expect(def, `missing hero sprite for ${h.id}`).toBeTruthy();
      expect(spriteWidth(def)).toBe(38);
      expect(spriteHeight(def)).toBe(50);
    }
  });
});
