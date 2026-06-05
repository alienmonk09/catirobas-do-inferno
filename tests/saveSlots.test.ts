import { describe, it, expect, beforeEach } from "vitest";
import {
  createGameState,
  saveGame,
  loadGame,
  clearSave,
  listSaves,
  SAVE_KEY,
  SAVE_SLOTS,
} from "../src/core/state";

/** Minimal in-memory localStorage for node-env tests. */
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

describe("saveSlots - slot key scheme", () => {
  it("slot 0 uses the legacy SAVE_KEY (back-compat)", () => {
    const state = createGameState();
    state.slot = 0;
    saveGame(state);
    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull();
    expect(localStorage.getItem(`${SAVE_KEY}-0`)).toBeNull();
  });

  it("slot 1 uses SAVE_KEY-1", () => {
    const state = createGameState();
    state.slot = 1;
    saveGame(state);
    expect(localStorage.getItem(`${SAVE_KEY}-1`)).not.toBeNull();
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it("slot 2 uses SAVE_KEY-2", () => {
    const state = createGameState();
    state.slot = 2;
    saveGame(state);
    expect(localStorage.getItem(`${SAVE_KEY}-2`)).not.toBeNull();
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });
});

describe("saveSlots - round-trip per slot", () => {
  it("saveGame(slot 1) then loadGame(1) round-trips correctly", () => {
    const state = createGameState();
    state.slot = 1;
    state.phaseIndex = 3;
    saveGame(state);
    const loaded = loadGame(1);
    expect(loaded).not.toBeNull();
    expect(loaded!.phaseIndex).toBe(3);
    expect(loaded!.slot).toBe(1);
  });

  it("loadGame(0) is independent of slot 1 data", () => {
    const state = createGameState();
    state.slot = 1;
    state.phaseIndex = 5;
    saveGame(state);
    expect(loadGame(0)).toBeNull();
  });

  it("slots 0 and 1 hold independent saves simultaneously", () => {
    const s0 = createGameState();
    s0.slot = 0;
    s0.phaseIndex = 1;
    saveGame(s0);

    const s1 = createGameState();
    s1.slot = 1;
    s1.phaseIndex = 4;
    saveGame(s1);

    const loaded0 = loadGame(0);
    const loaded1 = loadGame(1);
    expect(loaded0!.phaseIndex).toBe(1);
    expect(loaded1!.phaseIndex).toBe(4);
  });
});

describe("saveSlots - loadGame sets returned state.slot", () => {
  it("loadGame(0) sets slot to 0", () => {
    const state = createGameState();
    state.slot = 0;
    saveGame(state);
    const loaded = loadGame(0);
    expect(loaded!.slot).toBe(0);
  });

  it("loadGame(1) sets slot to 1 even if saved state had slot 0", () => {
    // Write slot 0 data directly under slot-1 key to test normalization.
    const state = createGameState();
    state.slot = 0; // will be overridden by loadGame(1)
    localStorage.setItem(`${SAVE_KEY}-1`, JSON.stringify(state));
    const loaded = loadGame(1);
    expect(loaded!.slot).toBe(1);
  });

  it("loadGame(2) sets slot to 2", () => {
    const state = createGameState();
    state.slot = 2;
    saveGame(state);
    const loaded = loadGame(2);
    expect(loaded!.slot).toBe(2);
  });
});

describe("saveSlots - clearSave(slot)", () => {
  it("clearSave(1) removes only slot 1", () => {
    const s0 = createGameState();
    s0.slot = 0;
    saveGame(s0);
    const s1 = createGameState();
    s1.slot = 1;
    saveGame(s1);

    clearSave(1);

    expect(loadGame(0)).not.toBeNull();
    expect(loadGame(1)).toBeNull();
  });

  it("clearSave(0) removes only slot 0", () => {
    const s0 = createGameState();
    s0.slot = 0;
    saveGame(s0);
    const s1 = createGameState();
    s1.slot = 1;
    saveGame(s1);

    clearSave(0);

    expect(loadGame(0)).toBeNull();
    expect(loadGame(1)).not.toBeNull();
  });
});

describe("saveSlots - listSaves()", () => {
  it("returns SAVE_SLOTS entries, all null when nothing is saved", () => {
    const result = listSaves();
    expect(result).toHaveLength(SAVE_SLOTS);
    expect(result.every((s) => s === null)).toBe(true);
  });

  it("returns a correct summary for a filled slot and null for empty slots", () => {
    const state = createGameState();
    state.slot = 1;
    state.phaseIndex = 2;
    saveGame(state);

    const result = listSaves();
    expect(result).toHaveLength(SAVE_SLOTS);
    expect(result[0]).toBeNull();
    expect(result[1]).not.toBeNull();
    expect(result[1]!.slot).toBe(1);
    expect(result[1]!.phaseIndex).toBe(2);
    expect(result[1]!.partySize).toBe(state.party.length);
    expect(result[2]).toBeNull();
  });

  it("reflects multiple slots filled simultaneously", () => {
    for (let i = 0; i < SAVE_SLOTS; i++) {
      const s = createGameState();
      s.slot = i;
      s.phaseIndex = i * 2;
      saveGame(s);
    }
    const result = listSaves();
    expect(result).toHaveLength(SAVE_SLOTS);
    for (let i = 0; i < SAVE_SLOTS; i++) {
      expect(result[i]).not.toBeNull();
      expect(result[i]!.slot).toBe(i);
      expect(result[i]!.phaseIndex).toBe(i * 2);
    }
  });
});

describe("saveSlots - back-compat: legacy single-key save loads as slot 0", () => {
  it("a save written under SAVE_KEY (no suffix) is readable via loadGame(0)", () => {
    const state = createGameState();
    state.phaseIndex = 3;
    // Simulate an old save: written directly under SAVE_KEY without a slot field.
    const { slot: _slot, ...legacyState } = state;
    localStorage.setItem(SAVE_KEY, JSON.stringify(legacyState));

    const loaded = loadGame(0);
    expect(loaded).not.toBeNull();
    expect(loaded!.phaseIndex).toBe(3);
    expect(loaded!.slot).toBe(0);
  });

  it("legacy save is NOT visible under slot 1", () => {
    const state = createGameState();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    expect(loadGame(1)).toBeNull();
  });
});
