import { describe, it, expect } from "vitest";
import {
  createUnit,
  hasMasteredClass,
  masteredClasses,
  masteryBonus,
  statsForUnit,
  statsForLevel,
  grantXp,
  MASTERY_HP_BONUS,
  MASTERY_SPD_BONUS,
} from "../src/core/unit";
import { getClass } from "../src/data/classes";
import type { Unit } from "../src/core/types";

// Knight has 2 skills: "powerStrike", "guard".
// Archer has 2 skills: "aimedShot", "cripple".
const KNIGHT_SKILLS = getClass("knight").skillIds; // ["powerStrike", "guard"]
const ARCHER_SKILLS = getClass("archer").skillIds; // ["aimedShot", "cripple"]

function freshKnight(learnedSkillIds: string[] = []): Unit {
  return createUnit({
    name: "T",
    team: "player",
    classId: "knight",
    pos: { x: 0, y: 0 },
    learnedSkillIds,
  });
}

// ── hasMasteredClass ──────────────────────────────────────────────────────────

describe("hasMasteredClass", () => {
  it("returns true when the unit knows every skill of a class", () => {
    const u = freshKnight(KNIGHT_SKILLS);
    expect(hasMasteredClass(u, "knight")).toBe(true);
  });

  it("returns false when the unit is missing one skill", () => {
    const u = freshKnight([KNIGHT_SKILLS[0]]); // only first skill
    expect(hasMasteredClass(u, "knight")).toBe(false);
  });

  it("returns false when the unit knows no skills of that class", () => {
    const u = freshKnight([]);
    expect(hasMasteredClass(u, "knight")).toBe(false);
  });

  it("returns true for another class the unit has fully learned, regardless of current class", () => {
    // Unit is a Knight but has all Archer skills learned too.
    const u = freshKnight(ARCHER_SKILLS);
    expect(hasMasteredClass(u, "archer")).toBe(true);
    expect(hasMasteredClass(u, "knight")).toBe(false);
  });
});

// ── masteredClasses / masteryBonus ────────────────────────────────────────────

describe("masteredClasses", () => {
  it("returns an empty list when no class is mastered", () => {
    const u = freshKnight([]);
    expect(masteredClasses(u)).toEqual([]);
  });

  it("returns the correct list when one class is mastered", () => {
    const u = freshKnight(KNIGHT_SKILLS);
    const list = masteredClasses(u);
    expect(list).toContain("knight");
    expect(list.length).toBe(1);
  });

  it("returns both classes when two are mastered", () => {
    const u = freshKnight([...KNIGHT_SKILLS, ...ARCHER_SKILLS]);
    const list = masteredClasses(u);
    expect(list).toContain("knight");
    expect(list).toContain("archer");
    expect(list.length).toBe(2);
  });
});

describe("masteryBonus", () => {
  it("is 0 when nothing is mastered", () => {
    expect(masteryBonus(freshKnight([]))).toBe(0);
  });

  it("equals the count of mastered classes", () => {
    const u = freshKnight([...KNIGHT_SKILLS, ...ARCHER_SKILLS]);
    expect(masteryBonus(u)).toBe(2);
  });
});

// ── statsForUnit: mastery bonus applied ──────────────────────────────────────

describe("statsForUnit - mastery bonus", () => {
  it("a unit with no mastery has no bonus over the raw level stats", () => {
    const u = freshKnight([]);
    const base = statsForLevel("knight", 1, "human");
    const full = statsForUnit(u);
    expect(full.maxHp).toBe(base.maxHp);
    expect(full.spd).toBe(base.spd);
  });

  it("mastering 1 class adds +4 maxHp and +1 spd", () => {
    const noMastery = freshKnight([]);
    const withMastery = freshKnight(KNIGHT_SKILLS);
    const baseStats = statsForUnit(noMastery);
    const bonusStats = statsForUnit(withMastery);
    expect(bonusStats.maxHp).toBe(baseStats.maxHp + MASTERY_HP_BONUS);
    expect(bonusStats.spd).toBe(baseStats.spd + MASTERY_SPD_BONUS);
    // hp (current) also gets the bump on a full-HP unit
    expect(bonusStats.hp).toBe(baseStats.hp + MASTERY_HP_BONUS);
  });

  it("mastering 2 classes adds +8 maxHp and +2 spd", () => {
    const noMastery = freshKnight([]);
    const withMastery = freshKnight([...KNIGHT_SKILLS, ...ARCHER_SKILLS]);
    const base = statsForUnit(noMastery);
    const full = statsForUnit(withMastery);
    expect(full.maxHp).toBe(base.maxHp + 2 * MASTERY_HP_BONUS);
    expect(full.spd).toBe(base.spd + 2 * MASTERY_SPD_BONUS);
  });

  it("the bonus scales linearly with MASTERY_HP_BONUS and MASTERY_SPD_BONUS constants", () => {
    expect(MASTERY_HP_BONUS).toBe(4);
    expect(MASTERY_SPD_BONUS).toBe(1);
  });
});

// ── bonus survives level-up (grantXp) ────────────────────────────────────────

describe("mastery bonus survives level-up", () => {
  it("mastery HP/SPD bonus is still present after a level-up", () => {
    const u = freshKnight(KNIGHT_SKILLS);
    const baseBeforeLevel = statsForLevel("knight", u.level, u.raceId);
    // Level up.
    grantXp(u, 100); // lv1 threshold = 100
    expect(u.level).toBe(2);
    const baseAtLv2 = statsForLevel("knight", 2, "human");
    // The mastery bonus must still be present on top of the new base.
    expect(u.stats.maxHp).toBe(baseAtLv2.maxHp + MASTERY_HP_BONUS);
    expect(u.stats.spd).toBe(baseAtLv2.spd + MASTERY_SPD_BONUS);
    void baseBeforeLevel;
  });
});

// ── bonus persists across class change (learnedSkillIds carries over) ─────────

describe("mastery bonus persists across class change", () => {
  it("mastering Knight still boosts the unit after switching to Archer", () => {
    // Unit mastered Knight, then switches to Archer.
    const u = freshKnight(KNIGHT_SKILLS);
    const statsAsKnight = statsForUnit(u);
    expect(statsAsKnight.maxHp).toBeGreaterThan(statsForLevel("knight", 1, "human").maxHp);

    // Simulate class change (as partyScene.changeClass does it).
    u.classId = "archer";
    if (!u.learnedSkillIds.includes(getClass("archer").skillIds[0])) {
      u.learnedSkillIds.push(getClass("archer").skillIds[0]);
    }

    const statsAsArcher = statsForUnit(u);
    const archerBase = statsForLevel("archer", 1, "human");
    // Knight mastery bonus still applies on top of Archer base.
    expect(statsAsArcher.maxHp).toBe(archerBase.maxHp + MASTERY_HP_BONUS);
    expect(statsAsArcher.spd).toBe(archerBase.spd + MASTERY_SPD_BONUS);
  });
});
