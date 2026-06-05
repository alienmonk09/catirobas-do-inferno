import { describe, it, expect } from "vitest";
import { CLASSES } from "../src/data/classes";
import { SKILLS } from "../src/data/skills";
import { WEAPONS } from "../src/data/weapons";
import { statsForLevel } from "../src/core/unit";
import { CHARACTER_SPRITES } from "../src/data/sprites/characters";
import { SKILL_SPRITES } from "../src/data/sprites/skills";

const SUMMON_SKILL_IDS = ["callIfrit", "callShiva", "callRamuh", "callTitan"];

describe("Summoner class", () => {
  const def = CLASSES.summoner;

  it("exists in CLASSES", () => {
    expect(def).toBeTruthy();
    expect(def.id).toBe("summoner");
  });

  it("every skillId exists in SKILLS", () => {
    for (const sid of def.skillIds) {
      expect(SKILLS[sid], `missing skill: ${sid}`).toBeTruthy();
    }
  });

  it("every weaponId exists in WEAPONS and lists summoner as a valid class", () => {
    for (const wid of def.weaponIds) {
      const w = WEAPONS[wid];
      expect(w, `missing weapon: ${wid}`).toBeTruthy();
      expect(w.classes).toContain("summoner");
    }
  });

  it("has exactly the 4 summon skill ids in its skillIds", () => {
    for (const sid of SUMMON_SKILL_IDS) {
      expect(def.skillIds).toContain(sid);
    }
    expect(def.skillIds).toHaveLength(SUMMON_SKILL_IDS.length);
  });

  it("has a distinct color", () => {
    expect(def.color).toBeTruthy();
    const otherColors = Object.entries(CLASSES)
      .filter(([id]) => id !== "summoner")
      .map(([, c]) => c.color);
    expect(otherColors).not.toContain(def.color);
  });
});

describe("Summoner summon skills", () => {
  for (const sid of SUMMON_SKILL_IDS) {
    const skill = SKILLS[sid];

    it(`${sid} exists and is a magical AoE damage skill`, () => {
      expect(skill).toBeTruthy();
      expect(skill.effect).toBe("damage");
      expect(skill.scaling).toBe("magical");
      expect(["square3", "cross"]).toContain(skill.aoe);
    });

    it(`${sid} has meaningful power and cost`, () => {
      expect(skill.power).toBeGreaterThanOrEqual(15);
      expect(skill.mpCost).toBeGreaterThanOrEqual(12);
      expect(skill.jpCost).toBeGreaterThanOrEqual(100);
    });
  }

  it("callIfrit is fire element", () => {
    expect(SKILLS.callIfrit.element).toBe("fire");
  });

  it("callShiva is ice element", () => {
    expect(SKILLS.callShiva.element).toBe("ice");
  });

  it("callRamuh is bolt element", () => {
    expect(SKILLS.callRamuh.element).toBe("bolt");
  });

  it("callTitan is nature element", () => {
    expect(SKILLS.callTitan.element).toBe("nature");
  });

  it("skills unlock in ascending JP order", () => {
    const costs = SUMMON_SKILL_IDS.map((sid) => SKILLS[sid].jpCost);
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeGreaterThanOrEqual(costs[i - 1]);
    }
  });
});

describe("statsForLevel(summoner, 5)", () => {
  const s = statsForLevel("summoner", 5);

  it("all stats are positive", () => {
    expect(s.maxHp).toBeGreaterThan(0);
    expect(s.maxMp).toBeGreaterThan(0);
    expect(s.atk).toBeGreaterThan(0);
    expect(s.def).toBeGreaterThan(0);
    expect(s.mag).toBeGreaterThan(0);
    expect(s.res).toBeGreaterThan(0);
    expect(s.spd).toBeGreaterThan(0);
  });

  it("mag is the highest offensive stat", () => {
    expect(s.mag).toBeGreaterThan(s.atk);
  });

  it("mag outpaces def (glass cannon)", () => {
    expect(s.mag).toBeGreaterThan(s.def);
  });

  it("has lower spd than black mage at same level", () => {
    const bm = statsForLevel("blackMage", 5);
    expect(s.spd).toBeLessThan(bm.spd);
  });
});

describe("Summoner sprites", () => {
  it("CHARACTER_SPRITES.summoner has 20 rows each of length 16", () => {
    const sprite = CHARACTER_SPRITES.summoner;
    expect(sprite).toBeTruthy();
    expect(sprite.rows).toHaveLength(20);
    for (const row of sprite.rows) {
      expect(row).toHaveLength(16);
    }
  });

  for (const sid of SUMMON_SKILL_IDS) {
    it(`SKILL_SPRITES has an entry for ${sid}`, () => {
      expect(SKILL_SPRITES[sid]).toBeTruthy();
    });

    it(`SKILL_SPRITES.${sid} has 14 rows each of length 14`, () => {
      const sprite = SKILL_SPRITES[sid];
      expect(sprite.rows).toHaveLength(14);
      for (const row of sprite.rows) {
        expect(row).toHaveLength(14);
      }
    });
  }
});
