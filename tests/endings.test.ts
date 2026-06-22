import { describe, it, expect } from "vitest";
import { resolveEnding, type FinalBattleResult } from "../src/data/endings";

describe("endings", () => {
  it("returns C when player loses", () => {
    const result: FinalBattleResult = {
      playerWon: false,
      zezeEncounters: 0,
    };
    expect(resolveEnding(result)).toBe("c");
  });

  it("returns A when player wins with physical kill", () => {
    const result: FinalBattleResult = {
      playerWon: true,
      lastAttackKind: "physical",
      zezeEncounters: 0,
    };
    expect(resolveEnding(result)).toBe("a");
  });

  it("returns B when player wins with magical kill", () => {
    const result: FinalBattleResult = {
      playerWon: true,
      lastAttackKind: "magical",
      zezeEncounters: 0,
    };
    expect(resolveEnding(result)).toBe("b");
  });

  it("returns B when player wins with item kill", () => {
    const result: FinalBattleResult = {
      playerWon: true,
      lastAttackKind: "item",
      zezeEncounters: 0,
    };
    expect(resolveEnding(result)).toBe("b");
  });

  it("returns D when zezeEncounters >= 10, overriding A/B (player won)", () => {
    const result: FinalBattleResult = {
      playerWon: true,
      lastAttackKind: "physical",
      zezeEncounters: 10,
    };
    expect(resolveEnding(result)).toBe("d");
  });

  it("returns D when zezeEncounters >= 10, overriding A/B (magical kill)", () => {
    const result: FinalBattleResult = {
      playerWon: true,
      lastAttackKind: "magical",
      zezeEncounters: 15,
    };
    expect(resolveEnding(result)).toBe("d");
  });

  it("D does not override C (player lost)", () => {
    const result: FinalBattleResult = {
      playerWon: false,
      zezeEncounters: 10,
    };
    expect(resolveEnding(result)).toBe("c");
  });

  it("returns B when lastAttackKind is undefined (default to non-physical)", () => {
    const result: FinalBattleResult = {
      playerWon: true,
      zezeEncounters: 0,
    };
    expect(resolveEnding(result)).toBe("b");
  });

  it("9 Zezé encounters is not enough for D", () => {
    const result: FinalBattleResult = {
      playerWon: true,
      lastAttackKind: "physical",
      zezeEncounters: 9,
    };
    expect(resolveEnding(result)).toBe("a");
  });
});