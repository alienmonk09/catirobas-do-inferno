import { describe, it, expect } from "vitest";
import type {
  EndingId,
  AttackKind,
  StatusKind,
  BattleRewards,
} from "../src/core/types";

describe("W4 type extensions", () => {
  it("EndingId is the union of A/B/C/D", () => {
    const a: EndingId = "a";
    const b: EndingId = "b";
    const c: EndingId = "c";
    const d: EndingId = "d";
    expect([a, b, c, d]).toEqual(["a", "b", "c", "d"]);
  });

  it("AttackKind covers physical, magical, item", () => {
    const phys: AttackKind = "physical";
    const mag: AttackKind = "magical";
    const item: AttackKind = "item";
    expect([phys, mag, item]).toEqual(["physical", "magical", "item"]);
  });

  it("StatusKind includes atkUp and defDown", () => {
    const atkUp: StatusKind = "atkUp";
    const defDown: StatusKind = "defDown";
    expect([atkUp, defDown]).toEqual(["atkUp", "defDown"]);
  });

  it("BattleRewards has optional endingId", () => {
    const rewards: BattleRewards = {
      gold: 100,
      items: [],
      heroes: [],
    };
    expect(rewards.endingId).toBeUndefined();
    const withEnding: BattleRewards = {
      gold: 100,
      items: [],
      heroes: [],
      endingId: "a",
    };
    expect(withEnding.endingId).toBe("a");
  });
});