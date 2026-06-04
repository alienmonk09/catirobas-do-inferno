import { describe, it, expect, beforeEach } from "vitest";
import { createGameState, saveGame, loadGame, clearSave, refreshForBattle } from "../src/core/state";

// Must match the SAVE_KEY constant in src/core/state.ts (it isn't exported, but
// it's a stable persistence contract — pinning it here is intentional).
const SAVE_KEY = "tactics-mvp-save";

/** Minimal in-memory localStorage so the node-env suite can exercise save/load. */
class MemoryStorage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
});

/** A deep-cloned, known-valid save blob we can corrupt one field at a time. */
function validRaw(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(createGameState()));
}

function store(value: unknown): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(value));
}

describe("state - save/load round-trip", () => {
  it("loadGame returns null when nothing is saved", () => {
    expect(loadGame()).toBeNull();
  });

  it("round-trips a fresh game state through save -> load", () => {
    const state = createGameState();
    saveGame(state);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded).toEqual(state);
  });

  it("clearSave removes a stored save", () => {
    saveGame(createGameState());
    expect(loadGame()).not.toBeNull();
    clearSave();
    expect(loadGame()).toBeNull();
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it("the freshly-created game is itself a valid save", () => {
    store(createGameState());
    expect(loadGame()).not.toBeNull();
  });
});

describe("state - corrupt save rejection", () => {
  it("returns null on non-JSON garbage without throwing", () => {
    localStorage.setItem(SAVE_KEY, "{ not valid json");
    expect(loadGame()).toBeNull();
  });

  // Each malformed blob must be rejected AND the bad key cleared so a corrupt
  // save can't wedge the game into reloading the same broken state forever.
  const malformed: Array<[string, unknown]> = [
    ["null", null],
    ["a number", 42],
    ["an empty object", {}],
    ["negative phaseIndex", { ...validRaw(), phaseIndex: -1 }],
    ["non-number phaseIndex", { ...validRaw(), phaseIndex: "x" }],
    ["null inventory", { ...validRaw(), inventory: null }],
    ["empty party", { ...validRaw(), party: [] }],
    ["non-array party", { ...validRaw(), party: "nope" }],
    ["unknown classId", corruptFirstUnit({ classId: "wizard" })],
    ["unknown raceId", corruptFirstUnit({ raceId: "goblin" })],
    ["unknown weaponId", corruptFirstUnit({ weaponId: "spork" })],
    ["missing stats.maxHp", corruptFirstUnit({ stats: { hp: 10 } })],
    ["non-array learnedSkillIds", corruptFirstUnit({ learnedSkillIds: "fireball" })],
    ["missing pos", corruptFirstUnit({ pos: undefined })],
    ["non-number pos.x", corruptFirstUnit({ pos: { x: "a", y: 0 } })],
  ];

  for (const [label, blob] of malformed) {
    it(`rejects and clears: ${label}`, () => {
      store(blob);
      expect(loadGame()).toBeNull();
      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    });
  }
});

describe("state - refreshForBattle", () => {
  it("fully restores HP/MP and clears volatile battle state", () => {
    const state = createGameState();
    const unit = state.party[0];
    unit.stats.hp = 1;
    unit.stats.mp = 0;
    unit.ct = 77;
    unit.alive = false;
    unit.statuses = [{ kind: "slow", turnsLeft: 2 }];

    refreshForBattle(unit);

    expect(unit.stats.hp).toBe(unit.stats.maxHp);
    expect(unit.stats.mp).toBe(unit.stats.maxMp);
    expect(unit.ct).toBe(0);
    expect(unit.alive).toBe(true);
    expect(unit.statuses).toEqual([]);
  });
});

/** Build an otherwise-valid save whose first party unit has overridden fields. */
function corruptFirstUnit(patch: Record<string, unknown>): Record<string, unknown> {
  const raw = validRaw();
  const party = raw.party as Array<Record<string, unknown>>;
  party[0] = { ...party[0], ...patch };
  return raw;
}
