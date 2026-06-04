import { describe, it, expect } from "vitest";
import { defaultTerrain } from "../src/data/terrain";
import { Grid } from "../src/battle/grid";
import type { MapDef } from "../src/core/types";

describe("defaultTerrain", () => {
  it("derives variety from height + blocked", () => {
    expect(defaultTerrain(false, 0)).toBe("grass");
    expect(defaultTerrain(false, 1)).toBe("dirt");
    expect(defaultTerrain(false, 2)).toBe("rock");
    expect(defaultTerrain(false, 3)).toBe("rock");
    expect(defaultTerrain(true, 0)).toBe("water"); // river / chasm
    expect(defaultTerrain(true, 2)).toBe("rock"); // blocked cliff / pillar
  });
});

function mapOf(over: Partial<MapDef>): MapDef {
  return {
    id: "t",
    name: "T",
    intro: "",
    width: 2,
    height: 2,
    heights: [
      [0, 1],
      [2, 0],
    ],
    playerSpawns: [{ x: 0, y: 0 }],
    enemies: [],
    ...over,
  };
}

describe("Grid.terrainAt", () => {
  it("falls back to the height/blocked derivation when no terrain map", () => {
    const g = new Grid(mapOf({}));
    expect(g.terrainAt(0, 0)).toBe("grass");
    expect(g.terrainAt(1, 0)).toBe("dirt");
    expect(g.terrainAt(0, 1)).toBe("rock");
  });

  it("honors an explicit terrain map and leaves gaps to the default", () => {
    const g = new Grid(
      mapOf({
        // Sparse: only (1,1) set; the rest fall through to the derived default.
        terrain: [[], [undefined as never, "sand"]],
      }),
    );
    expect(g.terrainAt(1, 1)).toBe("sand");
    expect(g.terrainAt(0, 0)).toBe("grass");
  });

  it("returns grass out of bounds", () => {
    const g = new Grid(mapOf({}));
    expect(g.terrainAt(-1, 9)).toBe("grass");
  });
});
