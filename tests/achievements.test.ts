import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  unlockAchievement,
  isAchievementUnlocked,
} from "../src/data/achievements";

describe("achievements", () => {
  it("defines 5 ironic achievements", () => {
    expect(Object.keys(ACHIEVEMENTS)).toHaveLength(5);
    expect(ACHIEVEMENTS.foramRejeitados).toBeDefined();
    expect(ACHIEVEMENTS.aindaAqui).toBeDefined();
    expect(ACHIEVEMENTS.morteHonrosa).toBeDefined();
    expect(ACHIEVEMENTS.quaseCompreensao).toBeDefined();
    expect(ACHIEVEMENTS.finalSecreto).toBeDefined();
  });

  it("each achievement has id, name, description in PT-BR", () => {
    for (const a of Object.values(ACHIEVEMENTS)) {
      expect(a.id).toBeTruthy();
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
    }
  });

  it("unlockAchievement adds id and returns true on first unlock", () => {
    const unlocked: string[] = [];
    expect(unlockAchievement(unlocked, "foramRejeitados")).toBe(true);
    expect(unlocked).toContain("foramRejeitados");
  });

  it("unlockAchievement returns false on duplicate", () => {
    const unlocked: string[] = ["foramRejeitados"];
    expect(unlockAchievement(unlocked, "foramRejeitados")).toBe(false);
    expect(unlocked).toHaveLength(1);
  });

  it("isAchievementUnlocked checks membership", () => {
    const unlocked: string[] = ["aindaAqui"];
    expect(isAchievementUnlocked(unlocked, "aindaAqui")).toBe(true);
    expect(isAchievementUnlocked(unlocked, "morteHonrosa")).toBe(false);
  });
});