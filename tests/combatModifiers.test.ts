import { describe, it, expect } from "vitest";
import {
  positionalDamageMult,
  positionalCritBonus,
  defenseDamageMult,
  elementAffinity,
  elementDamageMult,
  hasStatus,
  isStopped,
  tickStatuses,
  addStatus,
  type AttackContext,
} from "../src/battle/combat";
import { forecastWeapon, forecastSkill } from "../src/battle/forecast";
import { createUnit } from "../src/core/unit";
import type { Unit } from "../src/core/types";
import { getWeapon } from "../src/data/weapons";
import { getSkill } from "../src/data/skills";

function mk(over: { pos?: { x: number; y: number }; team?: "player" | "enemy" } = {}): Unit {
  return createUnit({
    name: "U",
    team: over.team ?? "player",
    classId: "knight",
    pos: over.pos ?? { x: 0, y: 0 },
  });
}

describe("positionalDamageMult", () => {
  it("is 1 without context", () => {
    const a = mk({ pos: { x: 0, y: 5 } });
    const t = mk({ pos: { x: 0, y: 0 } });
    expect(positionalDamageMult(a, t, "physical")).toBe(1);
  });

  it("rewards flank and rear for physical attacks", () => {
    const t = mk({ pos: { x: 5, y: 5 } }); // faces south by default
    const a = mk();
    const rear: AttackContext = { fromPos: { x: 5, y: 3 } };
    const flank: AttackContext = { fromPos: { x: 7, y: 5 } };
    const front: AttackContext = { fromPos: { x: 5, y: 7 } };
    expect(positionalDamageMult(a, t, "physical", front)).toBeCloseTo(1.0);
    expect(positionalDamageMult(a, t, "physical", flank)).toBeCloseTo(1.1);
    expect(positionalDamageMult(a, t, "physical", rear)).toBeCloseTo(1.25);
  });

  it("ignores facing for magical attacks", () => {
    const t = mk({ pos: { x: 5, y: 5 } });
    const a = mk();
    expect(positionalDamageMult(a, t, "magical", { fromPos: { x: 5, y: 3 } })).toBe(1);
  });

  it("scales with the elevation gap (clamped)", () => {
    const t = mk({ pos: { x: 5, y: 5 } });
    const a = mk();
    const front = { x: 5, y: 7 };
    expect(positionalDamageMult(a, t, "physical", { fromPos: front, heightDelta: 1 })).toBeCloseTo(1.07);
    expect(positionalDamageMult(a, t, "physical", { fromPos: front, heightDelta: -1 })).toBeCloseTo(0.93);
    // clamped at ±2 levels
    expect(positionalDamageMult(a, t, "physical", { fromPos: front, heightDelta: 9 })).toBeCloseTo(1.14);
  });
});

describe("positionalCritBonus", () => {
  it("is 0 without context or for magic", () => {
    const t = mk({ pos: { x: 5, y: 5 } });
    const a = mk();
    expect(positionalCritBonus(a, t, "physical")).toBe(0);
    expect(positionalCritBonus(a, t, "magical", { fromPos: { x: 5, y: 3 } })).toBe(0);
  });

  it("adds a rear and high-ground crit edge", () => {
    const t = mk({ pos: { x: 5, y: 5 } });
    const a = mk();
    expect(positionalCritBonus(a, t, "physical", { fromPos: { x: 5, y: 3 } })).toBeCloseTo(0.2);
    expect(positionalCritBonus(a, t, "physical", { fromPos: { x: 5, y: 3 }, heightDelta: 2 })).toBeCloseTo(0.25);
  });
});

describe("defenseDamageMult (Protect / Shell)", () => {
  it("Protect cuts physical only", () => {
    const t = mk();
    addStatus(t, { kind: "protect", turnsLeft: 3 });
    expect(defenseDamageMult(t, "physical")).toBeCloseTo(0.75);
    expect(defenseDamageMult(t, "magical")).toBe(1);
  });

  it("Shell cuts magical only", () => {
    const t = mk();
    addStatus(t, { kind: "shell", turnsLeft: 3 });
    expect(defenseDamageMult(t, "magical")).toBeCloseTo(0.75);
    expect(defenseDamageMult(t, "physical")).toBe(1);
  });
});

describe("forecastWeapon honors position and protection", () => {
  it("a rear strike forecasts more than a frontal one", () => {
    const a = mk();
    a.stats.atk = 100;
    const t = mk({ pos: { x: 5, y: 5 }, team: "enemy" });
    t.stats.def = 0;
    const sword = getWeapon("sword");
    const front = forecastWeapon(a, t, sword, { fromPos: { x: 5, y: 7 } });
    const rear = forecastWeapon(a, t, sword, { fromPos: { x: 5, y: 3 } });
    expect(rear.amount).toBeGreaterThan(front.amount);
    expect(rear.amount / front.amount).toBeCloseTo(1.25, 1);
  });

  it("Protect lowers the physical forecast by ~25%", () => {
    const a = mk();
    a.stats.atk = 100;
    const plain = mk({ pos: { x: 5, y: 5 }, team: "enemy" });
    plain.stats.def = 0;
    const guarded = mk({ pos: { x: 5, y: 5 }, team: "enemy" });
    guarded.stats.def = 0;
    addStatus(guarded, { kind: "protect", turnsLeft: 3 });
    const sword = getWeapon("sword");
    const a1 = forecastWeapon(a, plain, sword, { fromPos: { x: 5, y: 7 } });
    const a2 = forecastWeapon(a, guarded, sword, { fromPos: { x: 5, y: 7 } });
    expect(a2.amount).toBeLessThan(a1.amount);
    expect(a2.amount / a1.amount).toBeCloseTo(0.75, 1);
  });
});

describe("elemental affinity", () => {
  const raced = (raceId: Unit["raceId"]) =>
    createUnit({ name: "T", team: "enemy", classId: "knight", raceId, pos: { x: 0, y: 0 } });

  it("reads weakness and resistance from the target's race", () => {
    expect(elementAffinity(raced("elf"), "fire")).toBe("weak");
    expect(elementAffinity(raced("elf"), "nature")).toBe("resist");
    expect(elementAffinity(raced("dwarf"), "fire")).toBe("resist");
    expect(elementAffinity(raced("dwarf"), "nature")).toBe("weak");
    expect(elementAffinity(raced("human"), "fire")).toBe("neutral");
  });

  it("treats the non-element as neutral for everyone", () => {
    expect(elementAffinity(raced("elf"), "none")).toBe("neutral");
    expect(elementDamageMult(raced("elf"), "none")).toBe(1);
  });

  it("scales damage ×1.5 on weakness and ×0.5 on resistance", () => {
    expect(elementDamageMult(raced("elf"), "fire")).toBeCloseTo(1.5);
    expect(elementDamageMult(raced("dwarf"), "fire")).toBeCloseTo(0.5);
    expect(elementDamageMult(raced("human"), "fire")).toBe(1);
  });

  it("flows through forecastSkill: fire hurts an Elf more than a Dwarf", () => {
    const caster = createUnit({ name: "BM", team: "player", classId: "blackMage", pos: { x: 0, y: 0 } });
    caster.stats.mag = 40;
    const elf = raced("elf");
    const human = raced("human");
    const dwarf = raced("dwarf");
    for (const u of [elf, human, dwarf]) u.stats.res = 0;
    const fire = getSkill("fire");
    const fElf = forecastSkill(caster, elf, fire);
    const fHuman = forecastSkill(caster, human, fire);
    const fDwarf = forecastSkill(caster, dwarf, fire);
    expect(fElf.amount).toBeGreaterThan(fHuman.amount);
    expect(fHuman.amount).toBeGreaterThan(fDwarf.amount);
    expect(fElf.affinity).toBe("weak");
    expect(fDwarf.affinity).toBe("resist");
    expect(fHuman.affinity).toBe("neutral");
  });
});

describe("status helpers", () => {
  it("hasStatus / isStopped reflect the unit's statuses", () => {
    const u = mk();
    expect(isStopped(u)).toBe(false);
    addStatus(u, { kind: "stop", turnsLeft: 2 });
    expect(hasStatus(u, "stop")).toBe(true);
    expect(isStopped(u)).toBe(true);
  });
});

describe("tickStatuses damage/heal over time", () => {
  it("poison drains ~10% max HP each turn and reports it", () => {
    const u = mk();
    u.stats.maxHp = 100;
    u.stats.hp = 100;
    addStatus(u, { kind: "poison", turnsLeft: 2 });
    const res = tickStatuses(u);
    expect(u.stats.hp).toBe(90);
    expect(res).toHaveLength(1);
    expect(res[0].kind).toBe("damage");
    expect(res[0].amount).toBe(10);
    expect(u.statuses[0].turnsLeft).toBe(1);
  });

  it("poison can kill, clearing statuses and flagging killed", () => {
    const u = mk();
    u.stats.maxHp = 100;
    u.stats.hp = 5;
    addStatus(u, { kind: "poison", turnsLeft: 3 });
    const res = tickStatuses(u);
    expect(u.stats.hp).toBe(0);
    expect(u.alive).toBe(false);
    expect(res[0].killed).toBe(true);
    expect(u.statuses).toEqual([]);
  });

  it("regen restores ~10% max HP up to the cap", () => {
    const u = mk();
    u.stats.maxHp = 100;
    u.stats.hp = 95;
    addStatus(u, { kind: "regen", turnsLeft: 2 });
    const res = tickStatuses(u);
    expect(u.stats.hp).toBe(100); // clamped: only +5 reported
    expect(res[0].kind).toBe("heal");
    expect(res[0].amount).toBe(5);
  });

  it("a full-HP regen target gets no heal result but still ticks down", () => {
    const u = mk();
    u.stats.hp = u.stats.maxHp;
    addStatus(u, { kind: "regen", turnsLeft: 2 });
    const res = tickStatuses(u);
    expect(res).toEqual([]);
    expect(u.statuses[0].turnsLeft).toBe(1);
  });
});
