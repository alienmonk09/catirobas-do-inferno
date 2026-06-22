import { describe, it, expect } from "vitest";
import type { Unit } from "../src/core/types";
import { turnChipBadge } from "../src/ui/battleUiHelpers";

function mkUnit(over: Partial<Unit> = {}): Unit {
  return {
    id: "u",
    name: "U",
    team: "player",
    classId: "knight",
    raceId: "human",
    level: 1,
    xp: 0,
    sp: 0,
    weaponId: "sword",
    learnedSkillIds: [],
    ct: 0,
    alive: true,
    statuses: [],
    pos: { x: 0, y: 0 },
    facing: "s",
    stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50, atk: 20, def: 5, mag: 16, res: 10, spd: 10, move: 4, jump: 2 },
    ...over,
  } as Unit;
}

/**
 * The turn-order chip badge surfaces the ONE transient that matters most at a
 * glance, with a strict priority: a pending charge (dictates the next action) >
 * a debuff (threatening) > a buff. A clean unit shows nothing.
 */
describe("turnChipBadge — turn-order legibility", () => {
  it("returns null for a clean unit", () => {
    expect(turnChipBadge(mkUnit())).toBeNull();
  });

  it("flags a pending charge with its turns left, above any status", () => {
    const u = mkUnit({
      charging: { skillId: "fireball", target: { x: 1, y: 1 }, turnsLeft: 2 },
      statuses: [{ kind: "poison", turnsLeft: 3 }],
    });
    const badge = turnChipBadge(u);
    expect(badge?.cls).toBe("charge");
    expect(badge?.text).toContain("2");
  });

  it("surfaces a debuff ahead of a buff", () => {
    const u = mkUnit({
      statuses: [
        { kind: "haste", turnsLeft: 4 }, // buff first in the list…
        { kind: "poison", turnsLeft: 2 }, // …but the debuff wins.
      ],
    });
    const badge = turnChipBadge(u);
    expect(badge?.cls).toBe("debuff");
    expect(badge?.text).toBe("V2"); // first letter of "Veneno" (PT-BR) + turns left
  });

  it("shows a buff when no debuff is present", () => {
    const badge = turnChipBadge(mkUnit({ statuses: [{ kind: "guard", turnsLeft: 1 }] }));
    expect(badge?.cls).toBe("buff");
    expect(badge?.text).toBe("G1");
  });
});
