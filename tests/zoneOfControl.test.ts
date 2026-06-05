import { describe, it, expect } from "vitest";
import type { MapDef, Unit } from "../src/core/types";
import { Grid, zoneOfControl } from "../src/battle/grid";
import { reachable } from "../src/battle/pathfinding";
import { createUnit } from "../src/core/unit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMap(width = 7, height = 7): MapDef {
  return {
    id: "test",
    name: "Test",
    intro: "",
    width,
    height,
    heights: Array.from({ length: height }, () => Array(width).fill(0)),
    playerSpawns: [],
    enemies: [],
  };
}

function makePlayer(id: string, x: number, y: number): Unit {
  return createUnit({ id, name: id, team: "player", classId: "knight", pos: { x, y } });
}

function makeEnemy(id: string, x: number, y: number): Unit {
  return createUnit({ id, name: id, team: "enemy", classId: "knight", pos: { x, y } });
}

const NO_BLOCKERS = new Set<string>();

// ---------------------------------------------------------------------------
// zoneOfControl helper
// ---------------------------------------------------------------------------

describe("zoneOfControl", () => {
  it("returns the 4 orthogonal neighbours of a single enemy unit", () => {
    const enemy = makeEnemy("e1", 3, 3);
    const zoc = zoneOfControl([enemy], "player");
    expect(zoc.has("4,3")).toBe(true);
    expect(zoc.has("2,3")).toBe(true);
    expect(zoc.has("3,4")).toBe(true);
    expect(zoc.has("3,2")).toBe(true);
    // Does not include the enemy's own tile.
    expect(zoc.has("3,3")).toBe(false);
  });

  it("covers neighbours of multiple enemy units", () => {
    const e1 = makeEnemy("e1", 1, 1);
    const e2 = makeEnemy("e2", 5, 5);
    const zoc = zoneOfControl([e1, e2], "player");
    // e1 neighbours
    expect(zoc.has("2,1")).toBe(true);
    expect(zoc.has("0,1")).toBe(true);
    // e2 neighbours
    expect(zoc.has("6,5")).toBe(true);
    expect(zoc.has("4,5")).toBe(true);
  });

  it("excludes allies of the mover team from contributing ZoC", () => {
    const ally = makePlayer("p1", 3, 3);
    const zoc = zoneOfControl([ally], "player");
    // An ally cannot exert ZoC against the mover.
    expect(zoc.size).toBe(0);
  });

  it("excludes dead units", () => {
    const enemy = makeEnemy("e1", 3, 3);
    enemy.alive = false;
    const zoc = zoneOfControl([enemy], "player");
    expect(zoc.size).toBe(0);
  });

  it("covers from the enemy team's perspective (moverTeam enemy)", () => {
    const player = makePlayer("p1", 3, 3);
    const zoc = zoneOfControl([player], "enemy");
    expect(zoc.has("4,3")).toBe(true);
    expect(zoc.has("2,3")).toBe(true);
    expect(zoc.has("3,4")).toBe(true);
    expect(zoc.has("3,2")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// reachable with ZoC
// ---------------------------------------------------------------------------

describe("reachable — zone of control", () => {
  it("the ZoC tile itself is reachable and in destinations", () => {
    // Mover at (0,3); enemy at (3,3) → ZoC tile (2,3) is one step before it.
    const grid = new Grid(makeMap());
    const start = { x: 0, y: 3 };
    const enemy = makeEnemy("e1", 3, 3);
    const zoc = zoneOfControl([enemy], "player");

    const { destinations } = reachable(grid, start, 5, 1, NO_BLOCKERS, NO_BLOCKERS, zoc);
    expect(destinations.has("2,3")).toBe(true);
  });

  it("movement cannot continue beyond a ZoC tile", () => {
    // Mover at (0,3) with move 5; enemy at (3,3) creates ZoC at (2,3).
    // Without ZoC, (4,3) and (5,3) would both be reachable with move 5.
    // With ZoC, (4,3) must not appear because we stopped at (2,3).
    const grid = new Grid(makeMap());
    const start = { x: 0, y: 3 };
    const enemy = makeEnemy("e1", 3, 3);
    const zoc = zoneOfControl([enemy], "player");

    const { destinations } = reachable(grid, start, 5, 1, NO_BLOCKERS, NO_BLOCKERS, zoc);
    // (3,3) is the enemy tile — treated as solid by callers; skip that check here.
    // (4,3) is two steps past the ZoC tile — must be blocked.
    expect(destinations.has("4,3")).toBe(false);
  });

  it("a unit that starts on a ZoC tile can still move out", () => {
    // Mover begins at (2,3) which is in the ZoC of enemy at (3,3).
    // It should be able to move away (e.g. to (1,3)).
    const grid = new Grid(makeMap());
    const start = { x: 2, y: 3 };
    const enemy = makeEnemy("e1", 3, 3);
    const zoc = zoneOfControl([enemy], "player");

    const { destinations } = reachable(grid, start, 3, 1, NO_BLOCKERS, NO_BLOCKERS, zoc);
    // Mover can reach tiles away from the enemy.
    expect(destinations.has("1,3")).toBe(true);
    expect(destinations.has("0,3")).toBe(true);
  });

  it("with an empty ZoC the result is identical to a plain reachable call", () => {
    const grid = new Grid(makeMap());
    const start = { x: 2, y: 2 };

    const plain = reachable(grid, start, 3, 1, NO_BLOCKERS);
    const withEmpty = reachable(grid, start, 3, 1, NO_BLOCKERS, NO_BLOCKERS, new Set<string>());

    expect([...withEmpty.destinations].sort()).toEqual([...plain.destinations].sort());
    expect(withEmpty.costs.size).toBe(plain.costs.size);
  });

  it("ZoC does not block movement in perpendicular directions past the enemy", () => {
    // Enemy at (3,3); ZoC covers (2,3), (4,3), (3,2), (3,4).
    // Moving from (0,0) vertically along x=0 should be unaffected.
    const grid = new Grid(makeMap());
    const start = { x: 0, y: 0 };
    const enemy = makeEnemy("e1", 3, 3);
    const zoc = zoneOfControl([enemy], "player");

    const { destinations } = reachable(grid, start, 5, 1, NO_BLOCKERS, NO_BLOCKERS, zoc);
    // (0,4) is distance 4 down the far side — not a ZoC tile, freely reachable.
    expect(destinations.has("0,4")).toBe(true);
  });
});
