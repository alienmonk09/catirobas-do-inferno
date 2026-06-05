import { describe, it, expect } from "vitest";
import { forecastWeapon, forecastSkill } from "../src/battle/forecast";
import { addStatus } from "../src/battle/combat";
import type { SkillDef, Unit, WeaponDef } from "../src/core/types";

function mkUnit(over: Partial<Unit["stats"]> = {}): Unit {
  return {
    id: "u",
    name: "U",
    team: "player",
    classId: "knight",
    raceId: "human",
    level: 1,
    xp: 0,
    jp: 0,
    weaponId: "sword",
    learnedSkillIds: [],
    ct: 0,
    alive: true,
    statuses: [],
    pos: { x: 0, y: 0 },
    facing: "s",
    stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50, atk: 20, def: 5, mag: 16, res: 10, spd: 10, move: 4, jump: 2, ...over },
  } as Unit;
}

const physWeapon: WeaponDef = { id: "w", name: "W", power: 6, range: 1, kind: "physical", classes: ["knight"] };
const magWeapon: WeaponDef = { id: "m", name: "M", power: 3, range: 1, kind: "magical", classes: ["blackMage"] };

function skill(over: Partial<SkillDef>): SkillDef {
  return {
    id: "s", name: "S", description: "", mpCost: 0, jpCost: 0, range: 1, aoe: "single",
    power: 10, element: "none", effect: "damage", scaling: "magical", ...over,
  };
}

describe("forecast", () => {
  it("physical weapon = atk + power - def", () => {
    const f = forecastWeapon(mkUnit({ atk: 20 }), mkUnit({ def: 5 }), physWeapon);
    expect(f.amount).toBe(21); // 20 + 6 - 5
    expect(f.kind).toBe("damage");
  });

  it("magical weapon uses mag, still subtracts def", () => {
    const f = forecastWeapon(mkUnit({ mag: 16 }), mkUnit({ def: 5 }), magWeapon);
    expect(f.amount).toBe(14); // 16 + 3 - 5
  });

  it("guard raises the target's effective defense", () => {
    const target = mkUnit({ def: 5 });
    addStatus(target, { kind: "guard", turnsLeft: 2 });
    const f = forecastWeapon(mkUnit({ atk: 20 }), target, physWeapon);
    expect(f.amount).toBe(18); // 20 + 6 - round(5*1.5=7.5 -> 8)
  });

  it("flags a lethal hit", () => {
    const f = forecastWeapon(mkUnit({ atk: 20 }), mkUnit({ def: 5, hp: 10 }), physWeapon);
    expect(f.lethal).toBe(true);
  });

  it("magical damage skill = mag*power/10 - res", () => {
    const f = forecastSkill(mkUnit({ mag: 16 }), mkUnit({ res: 10 }), skill({ power: 16, effect: "damage", scaling: "magical" }));
    expect(f.amount).toBe(16); // round(16*16/10 - 10) = round(15.6)
  });

  it("physical damage skill subtracts def", () => {
    const f = forecastSkill(mkUnit({ atk: 20 }), mkUnit({ def: 5 }), skill({ power: 18, effect: "damage", scaling: "physical" }));
    expect(f.amount).toBe(31); // round(20*18/10 - 5) = round(36-5)
  });

  it("heal = stat*power/10, never lethal", () => {
    const f = forecastSkill(mkUnit({ mag: 14 }), mkUnit(), skill({ power: 22, effect: "heal", scaling: "magical" }));
    expect(f.kind).toBe("heal");
    expect(f.amount).toBe(31); // round(14*22/10)
    expect(f.lethal).toBe(false);
  });

  it("revive = stat*power/20", () => {
    const f = forecastSkill(mkUnit({ mag: 20 }), mkUnit(), skill({ power: 20, effect: "revive", scaling: "magical" }));
    expect(f.kind).toBe("revive");
    expect(f.amount).toBe(20); // round(20*20/20)
  });
});
