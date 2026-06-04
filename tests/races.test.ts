import { describe, it, expect } from "vitest";
import { RACES, getRace } from "../src/data/races";
import { CLASSES } from "../src/data/classes";
import { statsForLevel } from "../src/core/unit";
import type { ClassId, RaceId } from "../src/core/types";

const RACE_IDS: RaceId[] = ["human", "elf", "dwarf", "halfling", "orc"];
const STAT_KEYS = ["hp", "mp", "atk", "def", "mag", "res", "spd", "move", "jump"];

describe("race data", () => {
  it("defines every RaceId with a matching id and non-empty name", () => {
    for (const id of RACE_IDS) {
      const r = RACES[id];
      expect(r).toBeDefined();
      expect(r.id).toBe(id);
      expect(r.name.length).toBeGreaterThan(0);
    }
  });

  it("only modifies known stat keys", () => {
    for (const r of Object.values(RACES)) {
      for (const key of Object.keys(r.mod)) expect(STAT_KEYS).toContain(key);
    }
  });

  it("human is the no-modifier baseline", () => {
    expect(getRace("human").mod).toEqual({});
  });
});

describe("statsForLevel - race modifiers", () => {
  it("adds race deltas on top of class stats (dwarf: +HP, +DEF, -SPD)", () => {
    const base = statsForLevel("knight", 3, "human");
    const dwarf = statsForLevel("knight", 3, "dwarf");
    expect(dwarf.maxHp).toBe(base.maxHp + 12);
    expect(dwarf.def).toBe(base.def + 3);
    expect(dwarf.spd).toBe(base.spd - 2);
    expect(dwarf.atk).toBe(base.atk); // untouched stat unchanged
  });

  it("applies elf and halfling movement/speed deltas", () => {
    const base = statsForLevel("archer", 5, "human");
    const elf = statsForLevel("archer", 5, "elf");
    expect(elf.mag).toBe(base.mag + 3);
    expect(elf.spd).toBe(base.spd + 2);
    expect(elf.maxHp).toBe(base.maxHp - 8);

    const hbase = statsForLevel("thief", 5, "human");
    const hob = statsForLevel("thief", 5, "halfling");
    expect(hob.spd).toBe(hbase.spd + 3);
    expect(hob.move).toBe(hbase.move + 1);
    expect(hob.jump).toBe(hbase.jump + 1);
    expect(hob.atk).toBe(hbase.atk - 2);
  });

  it("omitting raceId yields the unmodified class block (back-compat)", () => {
    expect(statsForLevel("knight", 4)).toEqual(statsForLevel("knight", 4, "human"));
  });

  it("never produces a stat below 1 for any class/race at level 1", () => {
    for (const classId of Object.keys(CLASSES) as ClassId[]) {
      for (const raceId of RACE_IDS) {
        const s = statsForLevel(classId, 1, raceId);
        for (const key of STAT_KEYS) {
          expect(s[key as keyof typeof s]).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});
