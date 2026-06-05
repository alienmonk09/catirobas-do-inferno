import { describe, it, expect } from "vitest";
import { createUnit } from "../src/core/unit";
import { fallDamage } from "../src/battle/combat";
import type { Unit } from "../src/core/types";

function knight(): Unit {
  return createUnit({ name: "K", team: "enemy", classId: "knight", pos: { x: 0, y: 0 } });
}

describe("fallDamage", () => {
  it("does nothing for a drop below the threshold", () => {
    const u = knight();
    expect(fallDamage(u, 0)).toBeNull();
    expect(fallDamage(u, 1)).toBeNull();
    expect(u.stats.hp).toBe(u.stats.maxHp);
  });

  it("hurts on a drop of two levels or more, scaling with the drop", () => {
    const u = knight();
    const max = u.stats.maxHp;
    const r2 = fallDamage(u, 2);
    expect(r2).not.toBeNull();
    expect(r2!.kind).toBe("damage");
    expect(r2!.amount).toBe(Math.round(max * 0.08 * 2));
    expect(u.stats.hp).toBe(max - r2!.amount);

    // A deeper drop hits harder (compare on a fresh unit).
    const v = knight();
    const r4 = fallDamage(v, 4);
    expect(r4!.amount).toBeGreaterThan(r2!.amount);
  });

  it("can be lethal and flips the unit down", () => {
    const u = knight();
    u.stats.hp = 1;
    const r = fallDamage(u, 5);
    expect(r!.killed).toBe(true);
    expect(u.alive).toBe(false);
    expect(u.stats.hp).toBe(0);
  });

  it("never acts on a downed unit", () => {
    const u = knight();
    u.alive = false;
    expect(fallDamage(u, 5)).toBeNull();
  });
});
