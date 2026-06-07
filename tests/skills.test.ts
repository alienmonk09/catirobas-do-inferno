import { describe, it, expect } from "vitest";
import { CLASSES } from "../src/data/classes";
import { SKILLS, getSkill } from "../src/data/skills";
import { getSkillSprite, vfxKeyForSkill, getVfx } from "../src/data/sprites";

describe("Time Mage unique skill: hasten", () => {
  it("exists in SKILLS", () => {
    const s = SKILLS.hasten;
    expect(s, "missing skill: hasten").toBeTruthy();
    expect(getSkill("hasten").id).toBe("hasten");
  });

  it("is an AoE haste buff (square3, buff, statusKind haste)", () => {
    const s = SKILLS.hasten;
    expect(s.effect).toBe("buff");
    expect(s.scaling).toBe("magical");
    expect(s.aoe).toBe("square3");
    expect(s.statusKind).toBe("haste");
    expect(s.statusDuration ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("is granted by Time Mage and replaces a shared key", () => {
    const ids = CLASSES.timeMage.skillIds;
    expect(ids).toContain("hasten");
    // The point of R22: no longer a byte-identical shared single-target haste.
    expect(ids).not.toContain("haste");
  });

  it("resolves to a sprite and a VFX family (no missing assets)", () => {
    const s = SKILLS.hasten;
    expect(getSkillSprite("hasten")).toBeTruthy();
    expect(getVfx(vfxKeyForSkill(s))).toBeTruthy();
  });
});
