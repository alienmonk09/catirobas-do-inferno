import { describe, it, expect } from "vitest";
import { canRecruit, RECRUIT_HP_FRACTION } from "../src/battle/combat";
import { createUnit } from "../src/core/unit";
import type { Unit } from "../src/core/types";

// ---- helpers ---------------------------------------------------------------

function makeUnit(
  team: "player" | "enemy",
  pos: { x: number; y: number },
  hpFrac = 1.0,
  alive = true,
): Unit {
  const u = createUnit({
    name: team === "player" ? "Hero" : "Grunt",
    team,
    classId: "knight",
    pos,
  });
  // Set HP to the requested fraction of maxHp.
  u.stats.hp = Math.round(u.stats.maxHp * hpFrac);
  u.alive = alive;
  return u;
}

// ---- RECRUIT_HP_FRACTION ---------------------------------------------------

describe("RECRUIT_HP_FRACTION", () => {
  it("is 0.25", () => {
    expect(RECRUIT_HP_FRACTION).toBe(0.25);
  });
});

// ---- canRecruit ------------------------------------------------------------

describe("canRecruit", () => {
  it("returns true for an adjacent enemy at exactly 25% HP", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 });
    const target = makeUnit("enemy", { x: 1, y: 0 }, RECRUIT_HP_FRACTION);
    expect(canRecruit(recruiter, target)).toBe(true);
  });

  it("returns true for an adjacent enemy below 25% HP", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 });
    const target = makeUnit("enemy", { x: 0, y: 1 }, 0.1);
    expect(canRecruit(recruiter, target)).toBe(true);
  });

  it("returns false when the target is above the HP threshold", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 });
    const target = makeUnit("enemy", { x: 1, y: 0 }, 0.5);
    expect(canRecruit(recruiter, target)).toBe(false);
  });

  it("returns false when the target is not adjacent (distance 2)", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 });
    const target = makeUnit("enemy", { x: 2, y: 0 }, 0.1);
    expect(canRecruit(recruiter, target)).toBe(false);
  });

  it("returns false when the target is diagonal (manhattan > 1)", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 });
    const target = makeUnit("enemy", { x: 1, y: 1 }, 0.1);
    expect(canRecruit(recruiter, target)).toBe(false);
  });

  it("returns false when both units are on the same team", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 });
    const target = makeUnit("player", { x: 1, y: 0 }, 0.1);
    expect(canRecruit(recruiter, target)).toBe(false);
  });

  it("returns false when enemy-team unit tries to recruit a player unit", () => {
    const recruiter = makeUnit("enemy", { x: 0, y: 0 });
    const target = makeUnit("enemy", { x: 1, y: 0 }, 0.1);
    expect(canRecruit(recruiter, target)).toBe(false);
  });

  it("returns false when the recruiter is dead", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 }, 1.0, false);
    const target = makeUnit("enemy", { x: 1, y: 0 }, 0.1);
    expect(canRecruit(recruiter, target)).toBe(false);
  });

  it("returns false when the target is dead", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 });
    const target = makeUnit("enemy", { x: 1, y: 0 }, 0.1, false);
    expect(canRecruit(recruiter, target)).toBe(false);
  });

  it("returns false when the target is at exactly 26% HP (just above threshold)", () => {
    const recruiter = makeUnit("player", { x: 0, y: 0 });
    const target = makeUnit("enemy", { x: 1, y: 0 });
    // Set HP to 26% manually (one point above the rounded threshold).
    target.stats.hp = Math.ceil(target.stats.maxHp * 0.26);
    expect(canRecruit(recruiter, target)).toBe(false);
  });
});
