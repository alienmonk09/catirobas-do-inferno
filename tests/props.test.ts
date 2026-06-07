import { describe, it, expect } from "vitest";
import type { MapDef } from "../src/core/types";
import { Grid } from "../src/battle/grid";
import { PROPS, scatterProps } from "../src/data/props";
import { PROP_SPRITES } from "../src/data/sprites/props";
import { validateSprite } from "../src/engine/sprite";

const baseMap = (over: Partial<MapDef> = {}): MapDef => ({
  id: "t", name: "t", intro: "",
  width: 6, height: 6,
  heights: Array.from({ length: 6 }, () => Array(6).fill(0)),
  terrain: Array.from({ length: 6 }, () => Array(6).fill("grass")),
  playerSpawns: [{ x: 0, y: 5 }],
  enemies: [{ name: "E", classId: "knight", level: 1, weaponId: "ironSword", pos: { x: 5, y: 0 } }],
  ...over,
});

describe("prop catalog", () => {
  it("every PropDef sprite is valid and every catalog entry has a sprite", () => {
    for (const id of Object.keys(PROPS)) {
      expect(PROP_SPRITES[id as keyof typeof PROP_SPRITES]).toBeDefined();
      expect(validateSprite(PROPS[id].sprite)).toEqual([]);
    }
  });
  it("cosmetic scatter props are never solid", () => {
    for (const id of Object.keys(PROPS)) {
      if (PROPS[id].scatter) expect(PROPS[id].solid ?? false).toBe(false);
    }
  });
});

describe("scatterProps", () => {
  it("is deterministic for the same map", () => {
    const m = baseMap();
    const g = new Grid(m);
    const a = scatterProps(m, g);
    const b = scatterProps(m, g);
    expect(a).toEqual(b);
  });
  it("never places on a spawn, enemy, blocked, or decor tile", () => {
    const m = baseMap({
      blocked: Array.from({ length: 6 }, (_, y) => Array.from({ length: 6 }, (_, x) => x === 2 && y === 2)),
      decor: [{ pos: { x: 3, y: 3 }, propId: "tree" }],
    });
    const g = new Grid(m);
    const forbidden = new Set(["0,5", "5,0", "2,2", "3,3"]);
    for (const pl of scatterProps(m, g)) {
      expect(forbidden.has(`${pl.pos.x},${pl.pos.y}`)).toBe(false);
      expect(PROPS[pl.propId].solid ?? false).toBe(false); // scatter only places cosmetic props
    }
  });
  it("places nothing on a terrain with no scatter weights", () => {
    const m = baseMap({ terrain: Array.from({ length: 6 }, () => Array(6).fill("lava")) });
    expect(scatterProps(m, new Grid(m))).toEqual([]);
  });
});
