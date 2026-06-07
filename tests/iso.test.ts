import { describe, it, expect } from "vitest";
import type { MapDef } from "../src/core/types";
import { Grid } from "../src/battle/grid";
import {
  worldToScreen,
  screenToTile,
  rotateTile,
  rotatedDims,
  depthKey,
  type Rotation,
} from "../src/engine/iso";

const ROTS: Rotation[] = [0, 1, 2, 3];

/** Flat (all z=0) grid of the given dimensions — picking is unambiguous on it. */
function flatGrid(width: number, height: number): Grid {
  const map: MapDef = {
    id: "flat",
    name: "Flat",
    intro: "",
    width,
    height,
    heights: Array.from({ length: height }, () => Array(width).fill(0)),
    blocked: undefined,
    playerSpawns: [],
    enemies: [],
  };
  return new Grid(map);
}

describe("rotateTile", () => {
  it("is the identity at rotation 0", () => {
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 7; x++) expect(rotateTile(x, y, 0, 7, 5)).toEqual({ x, y });
  });

  it("maps the four corners correctly on a 4x3 grid", () => {
    // 90° clockwise: top-left -> bottom-left of the (now 3x4) view, etc.
    expect(rotateTile(0, 0, 1, 4, 3)).toEqual({ x: 0, y: 3 });
    expect(rotateTile(3, 0, 1, 4, 3)).toEqual({ x: 0, y: 0 });
    // 180°: opposite corner.
    expect(rotateTile(0, 0, 2, 4, 3)).toEqual({ x: 3, y: 2 });
    expect(rotateTile(3, 2, 2, 4, 3)).toEqual({ x: 0, y: 0 });
    // 270°.
    expect(rotateTile(0, 0, 3, 4, 3)).toEqual({ x: 2, y: 0 });
  });

  it("is a bijection onto the rotated-dimension rectangle for every rotation", () => {
    const w = 4;
    const h = 3;
    for (const rot of ROTS) {
      const dims = rotatedDims(rot, w, h);
      const seen = new Set<string>();
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const v = rotateTile(x, y, rot, w, h);
          expect(v.x).toBeGreaterThanOrEqual(0);
          expect(v.y).toBeGreaterThanOrEqual(0);
          expect(v.x).toBeLessThan(dims.w);
          expect(v.y).toBeLessThan(dims.h);
          seen.add(`${v.x},${v.y}`);
        }
      }
      expect(seen.size).toBe(w * h); // no two tiles collide
    }
  });

  it("supports fractional coordinates (for in-flight animation)", () => {
    expect(rotateTile(1.5, 0, 1, 4, 3)).toEqual({ x: 0, y: 1.5 });
  });
});

describe("rotatedDims", () => {
  it("keeps dimensions on 0°/180° and swaps them on 90°/270°", () => {
    expect(rotatedDims(0, 10, 8)).toEqual({ w: 10, h: 8 });
    expect(rotatedDims(2, 10, 8)).toEqual({ w: 10, h: 8 });
    expect(rotatedDims(1, 10, 8)).toEqual({ w: 8, h: 10 });
    expect(rotatedDims(3, 10, 8)).toEqual({ w: 8, h: 10 });
  });
});

describe("depthKey (rotation-aware draw order)", () => {
  it("orders nearer (larger rotated x+y) tiles after farther ones", () => {
    const back = depthKey(0, 0, 0, 0, 4, 3);
    const front = depthKey(3, 2, 0, 0, 4, 3);
    expect(front).toBeGreaterThan(back);
  });

  it("ranks the same logical tile differently across rotations", () => {
    // The back corner at 0° is no longer the back corner once rotated.
    const at0 = depthKey(0, 0, 0, 0, 4, 3);
    const at2 = depthKey(0, 0, 0, 2, 4, 3);
    expect(at0).not.toBe(at2);
  });

  it("breaks depth ties by height (taller draws later)", () => {
    expect(depthKey(1, 1, 2, 0, 4, 4)).toBeGreaterThan(depthKey(1, 1, 0, 0, 4, 4));
  });
});

describe("screenToTile round-trips through rotation", () => {
  it("picks back the exact logical tile after projecting its center, for every rotation", () => {
    const grid = flatGrid(4, 3); // non-square, to catch width/height-swap bugs
    const origin = { sx: 137, sy: 91 };
    for (const rot of ROTS) {
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const v = rotateTile(x, y, rot, grid.width, grid.height);
          const c = worldToScreen(v.x, v.y, 0, origin);
          const picked = screenToTile(c.sx, c.sy, grid, origin, rot);
          expect(picked).toEqual({ x, y });
        }
      }
    }
  });

  it("round-trips when the scene is drawn at a fit scale < 1", () => {
    const grid = flatGrid(4, 3);
    const origin = { sx: 137, sy: 91 };
    const scale = 0.5;
    for (const rot of ROTS) {
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const v = rotateTile(x, y, rot, grid.width, grid.height);
          const c = worldToScreen(v.x, v.y, 0, origin); // unscaled tile-space center
          const picked = screenToTile(c.sx * scale, c.sy * scale, grid, origin, rot, scale);
          expect(picked).toEqual({ x, y });
        }
      }
    }
  });

  it("maps a fixed screen point to different logical tiles under different rotations", () => {
    const grid = flatGrid(5, 5);
    const origin = { sx: 200, sy: 120 };
    // A point offset from the map center resolves to a different tile depending
    // on how the board is turned — i.e. rotation genuinely changes the view.
    const px = origin.sx + 64;
    const py = origin.sy + 16;
    const picks = ROTS.map((rot) => screenToTile(px, py, grid, origin, rot));
    const distinct = new Set(picks.map((p) => (p ? `${p.x},${p.y}` : "null")));
    expect(distinct.size).toBeGreaterThan(1);
  });
});
