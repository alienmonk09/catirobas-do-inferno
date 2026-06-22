import { describe, it, expect, beforeEach } from "vitest";
import { createGameState, enemyLevelFor, saveGame, loadGame } from "../src/core/state";

const SAVE_KEY = "tactics-mvp-save";

/** Minimal in-memory localStorage for node env. Mirrors state.test.ts approach. */
class MemoryStorage {
  private store = new Map<string, string>();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
  removeItem(key: string): void { this.store.delete(key); }
  key(index: number): string | null { return [...this.store.keys()][index] ?? null; }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
});

function store(value: unknown): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// enemyLevelFor
// ---------------------------------------------------------------------------

describe("enemyLevelFor (party-relative)", () => {
  // signature: enemyLevelFor(partyAvgLevel, offset, difficulty, ngPlus)
  it("normal sits one level below the party average", () => {
    expect(enemyLevelFor(5, 0, "normal")).toBe(4);
    expect(enemyLevelFor(8, 0, "normal")).toBe(7);
  });

  it("easy is two below the party, hard matches it", () => {
    expect(enemyLevelFor(5, 0, "easy")).toBe(3);
    expect(enemyLevelFor(5, 0, "hard")).toBe(5);
  });

  it("ironic is three below the party (very easy story mode)", () => {
    expect(enemyLevelFor(5, 0, "ironic")).toBe(2);
    expect(enemyLevelFor(10, 0, "ironic")).toBe(7);
  });

  it("the per-enemy tier offset raises that foe within the band", () => {
    expect(enemyLevelFor(5, 1, "normal")).toBe(5); // an elite: party-1 + 1 = party
    expect(enemyLevelFor(5, 1, "hard")).toBe(6);
  });

  it("floors at 1 for a low-level party", () => {
    expect(enemyLevelFor(1, 0, "easy")).toBe(1); // 1-2 -> floored
    expect(enemyLevelFor(1, 0, "normal")).toBe(1); // 1-1 = 0 -> floored
    expect(enemyLevelFor(2, 0, "easy")).toBe(1); // 2-2 = 0 -> floored
  });

  it("tracks the party as it levels up", () => {
    expect(enemyLevelFor(3, 0, "normal")).toBe(2);
    expect(enemyLevelFor(10, 0, "normal")).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// createGameState defaults
// ---------------------------------------------------------------------------

describe("createGameState", () => {
  it('has difficulty "normal" by default', () => {
    expect(createGameState().difficulty).toBe("normal");
  });
});

// ---------------------------------------------------------------------------
// save / load round-trips
// ---------------------------------------------------------------------------

describe("difficulty - save/load round-trip", () => {
  it("round-trips difficulty: easy", () => {
    const state = createGameState();
    state.difficulty = "easy";
    saveGame(state);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.difficulty).toBe("easy");
  });

  it("round-trips difficulty: hard", () => {
    const state = createGameState();
    state.difficulty = "hard";
    saveGame(state);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.difficulty).toBe("hard");
  });
});

// ---------------------------------------------------------------------------
// back-compat: old save without difficulty field
// ---------------------------------------------------------------------------

describe("difficulty - back-compat with old saves", () => {
  it('normalises missing difficulty to "normal"', () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    delete raw.difficulty;
    store(raw);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.difficulty).toBe("normal");
  });

  it('normalises a garbage difficulty value to "normal"', () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    raw.difficulty = "legendary";
    store(raw);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.difficulty).toBe("normal");
  });

  it("a save without difficulty is still valid (not rejected)", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    delete raw.difficulty;
    store(raw);
    expect(loadGame()).not.toBeNull();
  });
});
