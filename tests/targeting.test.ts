import { describe, it, expect } from "vitest";
import type { MapDef, Point } from "../src/core/types";
import { Grid, key } from "../src/battle/grid";
import { tilesInRange, aoeTiles, inRange } from "../src/battle/targeting";

/** Build a minimal w×h Grid (all heights 0, nothing blocked). */
function makeGrid(width: number, height: number): Grid {
  const map: MapDef = {
    id: "test",
    name: "Test",
    intro: "",
    width,
    height,
    heights: Array.from({ length: height }, () => Array(width).fill(0)),
    playerSpawns: [],
    enemies: [],
  };
  return new Grid(map);
}

/** Stable, order-independent set of "x,y" keys for comparing tile lists. */
function keys(points: Point[]): Set<string> {
  return new Set(points.map(key));
}

describe("tilesInRange", () => {
  it("excludes the origin by default", () => {
    const grid = makeGrid(10, 10);
    const tiles = tilesInRange(grid, { x: 5, y: 5 }, 1);
    expect(keys(tiles).has("5,5")).toBe(false);
  });

  it("includes the origin when includeSelf is true", () => {
    const grid = makeGrid(10, 10);
    const tiles = tilesInRange(grid, { x: 5, y: 5 }, 1, true);
    expect(keys(tiles).has("5,5")).toBe(true);
  });

  it("returns the 4 orthogonal neighbors for range 1 (origin excluded)", () => {
    const grid = makeGrid(10, 10);
    const tiles = tilesInRange(grid, { x: 5, y: 5 }, 1);
    expect(tiles.length).toBe(4);
    expect(keys(tiles)).toEqual(new Set(["6,5", "4,5", "5,6", "5,4"]));
  });

  it("returns origin + 4 neighbors for range 1 with includeSelf", () => {
    const grid = makeGrid(10, 10);
    const tiles = tilesInRange(grid, { x: 5, y: 5 }, 1, true);
    expect(tiles.length).toBe(5);
    expect(keys(tiles)).toEqual(
      new Set(["5,5", "6,5", "4,5", "5,6", "5,4"]),
    );
  });

  it("is manhattan-bounded: excludes diagonals at range 1", () => {
    const grid = makeGrid(10, 10);
    const k = keys(tilesInRange(grid, { x: 5, y: 5 }, 1, true));
    // diagonals are distance 2, must not appear
    expect(k.has("6,6")).toBe(false);
    expect(k.has("4,4")).toBe(false);
    expect(k.has("6,4")).toBe(false);
    expect(k.has("4,6")).toBe(false);
  });

  it("produces a diamond (manhattan) shape for range 2", () => {
    const grid = makeGrid(20, 20);
    const tiles = tilesInRange(grid, { x: 10, y: 10 }, 2, true);
    // Every returned tile must be within manhattan distance 2.
    for (const t of tiles) {
      expect(Math.abs(t.x - 10) + Math.abs(t.y - 10)).toBeLessThanOrEqual(2);
    }
    // The diamond of radius 2 has 13 cells (including center).
    expect(tiles.length).toBe(13);
    // A diagonal-2 corner (distance 4) is excluded, an edge-2 tile is included.
    expect(keys(tiles).has("12,12")).toBe(false);
    expect(keys(tiles).has("12,10")).toBe(true);
    expect(keys(tiles).has("11,11")).toBe(true);
  });

  it("returns only the origin for range 0 with includeSelf", () => {
    const grid = makeGrid(10, 10);
    const tiles = tilesInRange(grid, { x: 3, y: 4 }, 0, true);
    expect(tiles).toEqual([{ x: 3, y: 4 }]);
  });

  it("returns nothing for range 0 without includeSelf", () => {
    const grid = makeGrid(10, 10);
    const tiles = tilesInRange(grid, { x: 3, y: 4 }, 0);
    expect(tiles).toEqual([]);
  });

  it("clips to grid bounds at a corner", () => {
    const grid = makeGrid(10, 10);
    const tiles = tilesInRange(grid, { x: 0, y: 0 }, 1, true);
    // (-1,0) and (0,-1) are out of bounds and dropped.
    expect(keys(tiles)).toEqual(new Set(["0,0", "1,0", "0,1"]));
  });

  it("clips to grid bounds at the opposite corner", () => {
    const grid = makeGrid(10, 10);
    const tiles = tilesInRange(grid, { x: 9, y: 9 }, 1, true);
    expect(keys(tiles)).toEqual(new Set(["9,9", "8,9", "9,8"]));
  });

  it("never returns out-of-bounds tiles even with a large range", () => {
    const grid = makeGrid(4, 4);
    const tiles = tilesInRange(grid, { x: 0, y: 0 }, 100, true);
    for (const t of tiles) {
      expect(grid.inBounds(t.x, t.y)).toBe(true);
    }
    // A range of 100 covers the whole 4x4 grid (max manhattan = 6).
    expect(tiles.length).toBe(16);
  });

  it("returns no out-of-bounds tiles on a 1x1 grid", () => {
    const grid = makeGrid(1, 1);
    expect(tilesInRange(grid, { x: 0, y: 0 }, 3)).toEqual([]);
    expect(tilesInRange(grid, { x: 0, y: 0 }, 3, true)).toEqual([
      { x: 0, y: 0 },
    ]);
  });
});

describe("aoeTiles", () => {
  describe("single", () => {
    it("returns just the center tile", () => {
      const grid = makeGrid(10, 10);
      expect(aoeTiles(grid, { x: 4, y: 6 }, "single")).toEqual([
        { x: 4, y: 6 },
      ]);
    });

    it("drops an out-of-bounds center", () => {
      const grid = makeGrid(10, 10);
      expect(aoeTiles(grid, { x: -1, y: 6 }, "single")).toEqual([]);
      expect(aoeTiles(grid, { x: 10, y: 6 }, "single")).toEqual([]);
    });
  });

  describe("cross", () => {
    it("returns center plus 4 orthogonal tiles", () => {
      const grid = makeGrid(10, 10);
      const tiles = aoeTiles(grid, { x: 5, y: 5 }, "cross");
      expect(tiles.length).toBe(5);
      expect(keys(tiles)).toEqual(
        new Set(["5,5", "6,5", "4,5", "5,6", "5,4"]),
      );
    });

    it("does not include diagonal tiles", () => {
      const grid = makeGrid(10, 10);
      const k = keys(aoeTiles(grid, { x: 5, y: 5 }, "cross"));
      expect(k.has("6,6")).toBe(false);
      expect(k.has("4,4")).toBe(false);
    });

    it("clips arms that fall off the edge", () => {
      const grid = makeGrid(10, 10);
      // top-left corner: only center, right, and down survive.
      const tiles = aoeTiles(grid, { x: 0, y: 0 }, "cross");
      expect(keys(tiles)).toEqual(new Set(["0,0", "1,0", "0,1"]));
    });

    it("clips arms on the far edge", () => {
      const grid = makeGrid(10, 10);
      const tiles = aoeTiles(grid, { x: 9, y: 5 }, "cross");
      // x+1 = 10 is out of bounds.
      expect(keys(tiles)).toEqual(new Set(["9,5", "8,5", "9,6", "9,4"]));
    });
  });

  describe("square3", () => {
    it("returns a full 3x3 block when fully in bounds", () => {
      const grid = makeGrid(10, 10);
      const tiles = aoeTiles(grid, { x: 5, y: 5 }, "square3");
      expect(tiles.length).toBe(9);
      const expected = new Set<string>();
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          expected.add(`${5 + dx},${5 + dy}`);
        }
      }
      expect(keys(tiles)).toEqual(expected);
    });

    it("includes diagonal tiles (unlike cross)", () => {
      const grid = makeGrid(10, 10);
      const k = keys(aoeTiles(grid, { x: 5, y: 5 }, "square3"));
      expect(k.has("6,6")).toBe(true);
      expect(k.has("4,4")).toBe(true);
      expect(k.has("6,4")).toBe(true);
      expect(k.has("4,6")).toBe(true);
    });

    it("clips to a 2x2 block at the corner", () => {
      const grid = makeGrid(10, 10);
      const tiles = aoeTiles(grid, { x: 0, y: 0 }, "square3");
      expect(tiles.length).toBe(4);
      expect(keys(tiles)).toEqual(
        new Set(["0,0", "1,0", "0,1", "1,1"]),
      );
    });

    it("clips to a 2x3 block against a single edge", () => {
      const grid = makeGrid(10, 10);
      const tiles = aoeTiles(grid, { x: 0, y: 5 }, "square3");
      // x-1 = -1 dropped, so 2 columns x 3 rows = 6 tiles.
      expect(tiles.length).toBe(6);
      expect(keys(tiles)).toEqual(
        new Set(["0,4", "0,5", "0,6", "1,4", "1,5", "1,6"]),
      );
    });
  });

  it("never returns out-of-bounds tiles for any shape", () => {
    const grid = makeGrid(3, 3);
    for (const shape of ["single", "cross", "square3"] as const) {
      const tiles = aoeTiles(grid, { x: 0, y: 0 }, shape);
      for (const t of tiles) {
        expect(grid.inBounds(t.x, t.y)).toBe(true);
      }
    }
  });
});

describe("inRange", () => {
  it("is true for an adjacent tile within range 1", () => {
    expect(inRange({ x: 0, y: 0 }, { x: 1, y: 0 }, 1)).toBe(true);
  });

  it("is false for the same tile (distance 0 is excluded)", () => {
    expect(inRange({ x: 2, y: 2 }, { x: 2, y: 2 }, 1)).toBe(false);
  });

  it("is false beyond the range", () => {
    expect(inRange({ x: 0, y: 0 }, { x: 2, y: 0 }, 1)).toBe(false);
  });

  it("is true exactly at the range boundary", () => {
    expect(inRange({ x: 0, y: 0 }, { x: 2, y: 0 }, 2)).toBe(true);
    expect(inRange({ x: 0, y: 0 }, { x: 1, y: 1 }, 2)).toBe(true);
  });

  it("uses manhattan distance, not euclidean (diagonal counts as 2)", () => {
    // Diagonal neighbor is manhattan distance 2.
    expect(inRange({ x: 0, y: 0 }, { x: 1, y: 1 }, 1)).toBe(false);
    expect(inRange({ x: 0, y: 0 }, { x: 1, y: 1 }, 2)).toBe(true);
  });

  it("is symmetric in origin/target", () => {
    const a = { x: 3, y: 7 };
    const b = { x: 5, y: 6 };
    expect(inRange(a, b, 3)).toBe(inRange(b, a, 3));
  });

  it("is false at range 0 even for a distinct adjacent tile", () => {
    expect(inRange({ x: 0, y: 0 }, { x: 1, y: 0 }, 0)).toBe(false);
  });
});
