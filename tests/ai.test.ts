import { describe, it, expect } from "vitest";
import type { MapDef, Point } from "../src/core/types";
import { Grid, manhattan } from "../src/battle/grid";
import { planEnemyTurn } from "../src/battle/ai";
import { createUnit } from "../src/core/unit";

/**
 * Build a minimal flat (all-height-0, fully walkable) rectangular map.
 * Flat terrain means `jump` never blocks movement, so BFS reachability is
 * purely a function of `move` and unit occupancy — easy to reason about.
 */
function flatMap(width: number, height: number): MapDef {
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

function flatGrid(width = 12, height = 12): Grid {
  return new Grid(flatMap(width, height));
}

function samePt(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

describe("planEnemyTurn: plan shape & path invariants", () => {
  it("returns a path that starts at the unit's position", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 8, y: 8 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.path.length).toBeGreaterThan(0);
    expect(samePt(plan.path[0], me.pos)).toBe(true);
  });

  it("returns a path whose last tile is the destination", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 9, y: 9 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    const last = plan.path[plan.path.length - 1];
    expect(samePt(last, plan.destination)).toBe(true);
  });

  it("destination is reachable: never farther than the unit's move range", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 10, y: 10 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    // On a flat, unobstructed grid the cheapest path cost equals manhattan distance.
    expect(manhattan(me.pos, plan.destination)).toBeLessThanOrEqual(me.stats.move);
  });

  it("destination stays in bounds", () => {
    const grid = flatGrid(6, 6);
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "archer", pos: { x: 0, y: 0 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 5, y: 5 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.destination.x).toBeGreaterThanOrEqual(0);
    expect(plan.destination.y).toBeGreaterThanOrEqual(0);
    expect(plan.destination.x).toBeLessThan(6);
    expect(plan.destination.y).toBeLessThan(6);
  });

  it("every step in the path is orthogonally adjacent to the previous one", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 10, y: 1 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    for (let i = 1; i < plan.path.length; i++) {
      expect(manhattan(plan.path[i - 1], plan.path[i])).toBe(1);
    }
  });
});

describe("planEnemyTurn: attacking in-range foes", () => {
  it("attacks an adjacent enemy, targeting that enemy's tile", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 3, y: 3 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 4, y: 3 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("attack");
    expect(plan.action.targetTile).toBeDefined();
    expect(samePt(plan.action.targetTile!, foe.pos)).toBe(true);
  });

  it("attacks without moving when already adjacent (destination is its own tile)", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 3, y: 3 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 3, y: 4 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("attack");
    expect(samePt(plan.destination, me.pos)).toBe(true);
  });

  it("a ranged enemy attacks a foe within weapon range without closing in", () => {
    const grid = flatGrid();
    // Archer with default short bow (range 3). Foe is 3 tiles away — in range, not adjacent.
    const me = createUnit({ name: "Sniper", team: "enemy", classId: "archer", pos: { x: 2, y: 2 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 5, y: 2 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("attack");
    expect(samePt(plan.action.targetTile!, foe.pos)).toBe(true);
  });

  it("moves into weapon range then attacks when a foe is just outside range but reachable", () => {
    const grid = flatGrid();
    // Knight (move 4, melee range 1). Foe is 4 tiles away: out of attack range from
    // start, but the AI can step to an adjacent tile and strike.
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 5, y: 1 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("attack");
    expect(samePt(plan.action.targetTile!, foe.pos)).toBe(true);
    // It had to move adjacent to the foe.
    expect(manhattan(plan.destination, foe.pos)).toBe(1);
  });

  it("targets the lower-HP foe when two are equally reachable", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 3, y: 3 } });
    const healthy = createUnit({ name: "Healthy", team: "player", classId: "knight", pos: { x: 2, y: 3 } });
    const wounded = createUnit({ name: "Wounded", team: "player", classId: "knight", pos: { x: 4, y: 3 } });
    // Both adjacent. Wound the second one so it is the more valuable target.
    wounded.stats.hp = 5;

    const plan = planEnemyTurn(me, [me, healthy, wounded], grid);

    expect(plan.action.kind).toBe("attack");
    expect(samePt(plan.action.targetTile!, wounded.pos)).toBe(true);
  });
});

describe("planEnemyTurn: waiting / advancing when no target is reachable", () => {
  it("returns a wait action when the nearest foe is unreachable and out of range", () => {
    const grid = flatGrid(20, 20);
    // Knight move 4 + melee range 1 = can threaten at most 5 manhattan away.
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 18, y: 18 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("wait");
  });

  it("advancing toward a foe does not increase distance to the nearest foe", () => {
    const grid = flatGrid(20, 20);
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 18, y: 18 } });

    const startDist = manhattan(me.pos, foe.pos);
    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("wait");
    expect(manhattan(plan.destination, foe.pos)).toBeLessThanOrEqual(startDist);
  });

  it("advancing actually decreases distance when a closer tile is reachable", () => {
    const grid = flatGrid(20, 20);
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 18, y: 18 } });

    const startDist = manhattan(me.pos, foe.pos);
    const plan = planEnemyTurn(me, [me, foe], grid);

    // With open ground and move 4, it should close in by its full move budget.
    expect(manhattan(plan.destination, foe.pos)).toBeLessThan(startDist);
    expect(manhattan(me.pos, plan.destination)).toBeLessThanOrEqual(me.stats.move);
  });

  it("waits in place with no movement when there are no enemies at all", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 3, y: 3 } });
    const ally = createUnit({ name: "Brute", team: "enemy", classId: "knight", pos: { x: 4, y: 4 } });

    const plan = planEnemyTurn(me, [me, ally], grid);

    expect(plan.action.kind).toBe("wait");
    expect(samePt(plan.destination, me.pos)).toBe(true);
    expect(plan.path.length).toBe(1);
    expect(samePt(plan.path[0], me.pos)).toBe(true);
  });

  it("ignores dead foes when deciding whether to advance", () => {
    const grid = flatGrid(20, 20);
    const me = createUnit({ name: "Goblin", team: "enemy", classId: "knight", pos: { x: 1, y: 1 } });
    const nearDead = createUnit({ name: "Corpse", team: "player", classId: "knight", pos: { x: 2, y: 1 } });
    const farAlive = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 18, y: 18 } });
    // The adjacent foe is dead, so it should be skipped entirely.
    nearDead.alive = false;
    nearDead.stats.hp = 0;

    const plan = planEnemyTurn(me, [me, nearDead, farAlive], grid);

    expect(plan.action.kind).toBe("wait");
    // Advances toward the only living foe, never toward the corpse.
    expect(manhattan(plan.destination, farAlive.pos)).toBeLessThanOrEqual(manhattan(me.pos, farAlive.pos));
  });
});

/** A grid from an explicit height map (optionally with a blocked mask). */
function gridFrom(heights: number[][], blocked?: boolean[][]): Grid {
  const h = heights.length;
  const w = heights[0].length;
  return new Grid({
    id: "t",
    name: "T",
    intro: "",
    width: w,
    height: h,
    heights,
    blocked,
    playerSpawns: [],
    enemies: [],
  });
}

describe("planEnemyTurn: status & line of sight", () => {
  it("a stopped unit forfeits its turn even with a foe adjacent", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Frozen", team: "enemy", classId: "knight", pos: { x: 3, y: 3 } });
    me.statuses.push({ kind: "stop", turnsLeft: 2 });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 4, y: 3 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("wait");
    expect(samePt(plan.destination, me.pos)).toBe(true);
    expect(plan.path.length).toBe(1);
  });

  it("does not fire a ranged shot through a tall wall (no line of sight)", () => {
    // 1-row map; an impassable height-9 wall at x=2 sits between archer and foe.
    const heights = [[0, 0, 9, 0, 0]];
    const blocked = [[false, false, true, false, false]];
    const grid = gridFrom(heights, blocked);
    const me = createUnit({ name: "Sniper", team: "enemy", classId: "archer", pos: { x: 0, y: 0 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 3, y: 0 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    // The foe is within bow range but blocked by the wall — no attack is possible.
    expect(plan.action.kind).not.toBe("attack");
  });

  it("does fire when the wall is removed (control for the LOS test)", () => {
    const grid = gridFrom([[0, 0, 0, 0, 0]]);
    const me = createUnit({ name: "Sniper", team: "enemy", classId: "archer", pos: { x: 0, y: 0 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 3, y: 0 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("attack");
    expect(samePt(plan.action.targetTile!, foe.pos)).toBe(true);
  });

  it("casts a debuff (Poison) on an in-range foe when it has nothing better", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Hexer", team: "enemy", classId: "blackMage", learnedSkillIds: ["poison"], pos: { x: 3, y: 5 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 3, y: 3 } });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).toBe("skill");
    expect(plan.action.skillId).toBe("poison");
    expect(samePt(plan.action.targetTile!, foe.pos)).toBe(true);
  });

  it("does not re-apply a debuff a foe already carries", () => {
    const grid = flatGrid();
    const me = createUnit({ name: "Hexer", team: "enemy", classId: "blackMage", learnedSkillIds: ["poison"], pos: { x: 3, y: 5 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 3, y: 3 } });
    foe.statuses.push({ kind: "poison", turnsLeft: 2 });

    const plan = planEnemyTurn(me, [me, foe], grid);

    expect(plan.action.kind).not.toBe("skill");
  });

  it("grants a buff (Haste) to an ally when no attack is available", () => {
    const grid = flatGrid(20, 20);
    const me = createUnit({ name: "Chanter", team: "enemy", classId: "whiteMage", learnedSkillIds: ["haste"], pos: { x: 3, y: 3 } });
    const ally = createUnit({ name: "Brute", team: "enemy", classId: "knight", pos: { x: 3, y: 4 } });
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 18, y: 18 } });

    const plan = planEnemyTurn(me, [me, ally, foe], grid);

    expect(plan.action.kind).toBe("skill");
    expect(plan.action.skillId).toBe("haste");
  });
});

describe("planEnemyTurn: healer behavior", () => {
  it("a White Mage knowing Cure heals a hurt ally instead of attacking", () => {
    const grid = flatGrid();
    const healer = createUnit({
      name: "Cleric",
      team: "enemy",
      classId: "whiteMage",
      learnedSkillIds: ["cure"],
      pos: { x: 3, y: 3 },
    });
    // Hurt ally below 50% HP, within Cure's range (3).
    const ally = createUnit({ name: "Brute", team: "enemy", classId: "knight", pos: { x: 3, y: 5 } });
    ally.stats.hp = Math.floor(ally.stats.maxHp * 0.2);
    // A foe adjacent so that attacking is also a live option — heal must still win.
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 2, y: 3 } });

    const plan = planEnemyTurn(healer, [healer, ally, foe], grid);

    expect(plan.action.kind).toBe("skill");
    expect(plan.action.skillId).toBe("cure");
    expect(plan.action.targetTile).toBeDefined();
    expect(samePt(plan.action.targetTile!, ally.pos)).toBe(true);
  });

  it("does not waste a heal on a full-HP ally and falls back to attacking", () => {
    const grid = flatGrid();
    const healer = createUnit({
      name: "Cleric",
      team: "enemy",
      classId: "whiteMage",
      learnedSkillIds: ["cure"],
      pos: { x: 3, y: 3 },
    });
    // Ally is at full HP (not "hurt"), so heal is not a candidate.
    const ally = createUnit({ name: "Brute", team: "enemy", classId: "knight", pos: { x: 3, y: 5 } });
    // Adjacent foe — staff range 1 lets the mage attack it.
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 2, y: 3 } });

    const plan = planEnemyTurn(healer, [healer, ally, foe], grid);

    expect(plan.action.kind).toBe("attack");
    expect(samePt(plan.action.targetTile!, foe.pos)).toBe(true);
  });

  it("requires MP: a healer without enough MP for Cure attacks instead of healing", () => {
    const grid = flatGrid();
    const healer = createUnit({
      name: "Cleric",
      team: "enemy",
      classId: "whiteMage",
      learnedSkillIds: ["cure"],
      pos: { x: 3, y: 3 },
    });
    // Cure costs 5 MP; drain the mage so it cannot afford it.
    healer.stats.mp = 0;
    const ally = createUnit({ name: "Brute", team: "enemy", classId: "knight", pos: { x: 3, y: 5 } });
    ally.stats.hp = Math.floor(ally.stats.maxHp * 0.2);
    const foe = createUnit({ name: "Hero", team: "player", classId: "knight", pos: { x: 2, y: 3 } });

    const plan = planEnemyTurn(healer, [healer, ally, foe], grid);

    expect(plan.action.kind).not.toBe("skill");
    expect(plan.action.kind).toBe("attack");
  });

  it("moves into Cure range when the hurt ally starts out of reach", () => {
    const grid = flatGrid();
    const healer = createUnit({
      name: "Cleric",
      team: "enemy",
      classId: "whiteMage",
      learnedSkillIds: ["cure"],
      pos: { x: 1, y: 1 },
    });
    // Ally is 5 tiles away (Cure range is 3); mage has move 3 so it can close
    // the gap enough to bring the ally within range.
    const ally = createUnit({ name: "Brute", team: "enemy", classId: "knight", pos: { x: 6, y: 1 } });
    ally.stats.hp = 1;

    const plan = planEnemyTurn(healer, [healer, ally], grid);

    expect(plan.action.kind).toBe("skill");
    expect(plan.action.skillId).toBe("cure");
    expect(samePt(plan.action.targetTile!, ally.pos)).toBe(true);
    // Stand tile must be within Cure's range of the ally.
    expect(manhattan(plan.destination, ally.pos)).toBeLessThanOrEqual(3);
  });
});
