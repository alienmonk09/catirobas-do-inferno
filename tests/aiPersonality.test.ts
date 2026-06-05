import { describe, it, expect } from "vitest";
import type { MapDef } from "../src/core/types";
import { Grid } from "../src/battle/grid";
import { planEnemyTurn, personalityWeight } from "../src/battle/ai";
import { createUnit } from "../src/core/unit";

function flatMap(width: number, height: number): MapDef {
  return {
    id: "test",
    name: "Test",
    intro: "",
    width,
    height,
    heights: Array.from({ length: height }, () => Array(width).fill(0)),
    playerSpawns: [],
    enemies: [],
  };
}

function flatGrid(width = 12, height = 12): Grid {
  return new Grid(flatMap(width, height));
}

// ---------------------------------------------------------------------------
// personalityWeight unit tests
// ---------------------------------------------------------------------------

describe("personalityWeight: balanced / undefined", () => {
  const kinds = ["damage", "heal", "buff", "debuff", "move"] as const;

  it("balanced returns 1.0 for every action kind", () => {
    for (const k of kinds) {
      expect(personalityWeight("balanced", k)).toBe(1.0);
    }
  });

  it("undefined returns 1.0 for every action kind", () => {
    for (const k of kinds) {
      expect(personalityWeight(undefined, k)).toBe(1.0);
    }
  });
});

describe("personalityWeight: aggressive", () => {
  it("boosts damage above 1", () => {
    expect(personalityWeight("aggressive", "damage")).toBeGreaterThan(1.0);
  });

  it("suppresses heal below 1", () => {
    expect(personalityWeight("aggressive", "heal")).toBeLessThan(1.0);
  });

  it("suppresses buff below damage", () => {
    expect(personalityWeight("aggressive", "buff")).toBeLessThan(
      personalityWeight("aggressive", "damage"),
    );
  });

  it("move weight is > 0 (never zero-out pursuit)", () => {
    expect(personalityWeight("aggressive", "move")).toBeGreaterThan(0);
  });
});

describe("personalityWeight: support", () => {
  it("boosts heal above 1", () => {
    expect(personalityWeight("support", "heal")).toBeGreaterThan(1.0);
  });

  it("boosts buff above 1", () => {
    expect(personalityWeight("support", "buff")).toBeGreaterThan(1.0);
  });

  it("suppresses damage below 1", () => {
    expect(personalityWeight("support", "damage")).toBeLessThan(1.0);
  });

  it("move weight is > 0 (never zero-out pursuit)", () => {
    expect(personalityWeight("support", "move")).toBeGreaterThan(0);
  });
});

describe("personalityWeight: defensive", () => {
  it("boosts buff above 1", () => {
    expect(personalityWeight("defensive", "buff")).toBeGreaterThan(1.0);
  });

  it("move weight is > 0 (never zero-out pursuit)", () => {
    expect(personalityWeight("defensive", "move")).toBeGreaterThan(0);
  });
});

describe("personalityWeight: move always > 0 for all personalities", () => {
  const personalities = ["balanced", "aggressive", "defensive", "support", undefined] as const;

  it("move weight is strictly positive for every personality", () => {
    for (const p of personalities) {
      expect(personalityWeight(p, "move")).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// planEnemyTurn behavioral tests
// ---------------------------------------------------------------------------

/**
 * Scenario: a unit (White Mage with Cure) has BOTH:
 *   - a wounded ally (hp 1) within Cure range (ally at {x:3,y:5}, caster at {x:3,y:3})
 *   - a nearly-dead foe (hp 1) adjacent and in staff range (foe at {x:2,y:3})
 *
 * Without personality ("balanced") the heal score (200+heal) easily beats the
 * weapon-attack score — heal wins. With "aggressive" personality the
 * heal weight is cut to 0.4 and damage weight raised to 1.5, flipping the
 * decision so the attack wins.
 */
describe("planEnemyTurn: personality flips chosen action", () => {
  function makeScenario(personality: "balanced" | "aggressive" | "support" | undefined) {
    const grid = flatGrid();

    // Unit: White Mage with Cure, placed at (3,3).
    const caster = createUnit({
      name: "Cleric",
      team: "enemy",
      classId: "whiteMage",
      learnedSkillIds: ["cure"],
      pos: { x: 3, y: 3 },
      personality,
    });

    // Wounded ally at (3,5) — within Cure range (3), below 50% HP threshold.
    const woundedAlly = createUnit({
      name: "Brute",
      team: "enemy",
      classId: "knight",
      pos: { x: 3, y: 5 },
    });
    woundedAlly.stats.hp = 1; // critically low, well below 50%

    // Nearly-dead foe at (2,3) — adjacent, within staff range (1).
    // hp=1 so a lethal-hit bonus applies and the attack score is meaningful.
    const dyingFoe = createUnit({
      name: "Hero",
      team: "player",
      classId: "knight",
      pos: { x: 2, y: 3 },
    });
    dyingFoe.stats.hp = 1;

    return { grid, caster, woundedAlly, dyingFoe };
  }

  it("balanced unit chooses to heal the wounded ally over attacking", () => {
    const { grid, caster, woundedAlly, dyingFoe } = makeScenario("balanced");
    const plan = planEnemyTurn(caster, [caster, woundedAlly, dyingFoe], grid);

    expect(plan.action.kind).toBe("skill");
    expect(plan.action.skillId).toBe("cure");
    expect(plan.action.targetTile).toBeDefined();
    expect(plan.action.targetTile!.x).toBe(woundedAlly.pos.x);
    expect(plan.action.targetTile!.y).toBe(woundedAlly.pos.y);
  });

  it("aggressive unit attacks the foe instead of healing", () => {
    const { grid, caster, woundedAlly, dyingFoe } = makeScenario("aggressive");
    caster.personality = "aggressive";
    const plan = planEnemyTurn(caster, [caster, woundedAlly, dyingFoe], grid);

    // Personality biases: damage×1.5 and heal×0.4 flip the winner.
    expect(plan.action.kind).toBe("attack");
    expect(plan.action.targetTile).toBeDefined();
    expect(plan.action.targetTile!.x).toBe(dyingFoe.pos.x);
    expect(plan.action.targetTile!.y).toBe(dyingFoe.pos.y);
  });

  it("support unit heals the wounded ally (heal bias reinforces default)", () => {
    const { grid, caster, woundedAlly, dyingFoe } = makeScenario("support");
    const plan = planEnemyTurn(caster, [caster, woundedAlly, dyingFoe], grid);

    expect(plan.action.kind).toBe("skill");
    expect(plan.action.skillId).toBe("cure");
  });

  it("undefined personality behaves identically to balanced", () => {
    const balancedScenario = makeScenario("balanced");
    const undefinedScenario = makeScenario(undefined);

    const planBalanced = planEnemyTurn(
      balancedScenario.caster,
      [balancedScenario.caster, balancedScenario.woundedAlly, balancedScenario.dyingFoe],
      balancedScenario.grid,
    );
    const planUndefined = planEnemyTurn(
      undefinedScenario.caster,
      [undefinedScenario.caster, undefinedScenario.woundedAlly, undefinedScenario.dyingFoe],
      undefinedScenario.grid,
    );

    // Both should pick the same action kind, skill, and target.
    expect(planUndefined.action.kind).toBe(planBalanced.action.kind);
    expect(planUndefined.action.skillId).toBe(planBalanced.action.skillId);
    expect(planUndefined.action.targetTile?.x).toBe(planBalanced.action.targetTile?.x);
    expect(planUndefined.action.targetTile?.y).toBe(planBalanced.action.targetTile?.y);
  });
});
