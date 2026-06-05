import { describe, it, expect, beforeEach } from "vitest";
import { createGameState, saveGame, loadGame, buyItem, GIL_PER_KILL } from "../src/core/state";
import { ITEMS } from "../src/data/items";

const SAVE_KEY = "tactics-mvp-save";

/** Minimal in-memory localStorage for node env. Mirrors difficulty.test.ts approach. */
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
// GIL_PER_KILL constant
// ---------------------------------------------------------------------------

describe("GIL_PER_KILL", () => {
  it("is a positive number", () => {
    expect(typeof GIL_PER_KILL).toBe("number");
    expect(GIL_PER_KILL).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// createGameState defaults
// ---------------------------------------------------------------------------

describe("createGameState - gil", () => {
  it("starts at 0 gil", () => {
    expect(createGameState().gil).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buyItem
// ---------------------------------------------------------------------------

describe("buyItem", () => {
  it("deducts the item price from gil and adds 1 to inventory, returns true", () => {
    const state = createGameState();
    state.gil = 100;
    const before = state.inventory["potion"] ?? 0;
    const result = buyItem(state, "potion");
    expect(result).toBe(true);
    expect(state.gil).toBe(100 - ITEMS.potion.price);
    expect(state.inventory["potion"]).toBe(before + 1);
  });

  it("returns false and mutates nothing when gil is insufficient", () => {
    const state = createGameState();
    state.gil = 10; // potion costs 25
    const gilBefore = state.gil;
    const inventoryBefore = { ...state.inventory };
    const result = buyItem(state, "potion");
    expect(result).toBe(false);
    expect(state.gil).toBe(gilBefore);
    expect(state.inventory).toEqual(inventoryBefore);
  });

  it("returns false for an unknown item id", () => {
    const state = createGameState();
    state.gil = 9999;
    const result = buyItem(state, "nonexistent_item");
    expect(result).toBe(false);
    expect(state.gil).toBe(9999);
  });

  it("increments from zero when item not yet in inventory", () => {
    const state = createGameState();
    state.gil = 999;
    delete state.inventory["phoenixDown"];
    const result = buyItem(state, "phoenixDown");
    expect(result).toBe(true);
    expect(state.inventory["phoenixDown"]).toBe(1);
  });

  it("can buy exactly when gil equals the price", () => {
    const state = createGameState();
    state.gil = ITEMS.ether.price;
    const result = buyItem(state, "ether");
    expect(result).toBe(true);
    expect(state.gil).toBe(0);
  });

  it("returns false when gil is exactly one short", () => {
    const state = createGameState();
    state.gil = ITEMS.ether.price - 1;
    const result = buyItem(state, "ether");
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Save round-trip with gil
// ---------------------------------------------------------------------------

describe("gil - save/load round-trip", () => {
  it("persists gil through save -> load", () => {
    const state = createGameState();
    state.gil = 360;
    saveGame(state);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.gil).toBe(360);
  });

  it("normalises missing gil field to 0 (old save back-compat)", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    delete raw.gil;
    store(raw);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.gil).toBe(0);
  });

  it("does NOT reject an old save that is missing the gil field", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    delete raw.gil;
    store(raw);
    expect(loadGame()).not.toBeNull();
  });

  it("normalises garbage gil value to 0", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    raw.gil = "lots";
    store(raw);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.gil).toBe(0);
  });

  it("normalises negative gil to 0", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    raw.gil = -50;
    store(raw);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.gil).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Every ITEMS entry has a positive numeric price
// ---------------------------------------------------------------------------

describe("ITEMS price field", () => {
  it("every item has a positive numeric price", () => {
    for (const item of Object.values(ITEMS)) {
      expect(typeof item.price, `${item.id}.price must be a number`).toBe("number");
      expect(item.price, `${item.id}.price must be positive`).toBeGreaterThan(0);
    }
  });
});
