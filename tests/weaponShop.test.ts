import { describe, it, expect, beforeEach } from "vitest";
import { createGameState, saveGame, loadGame, buyWeapon, ownsWeapon, sellWeapon } from "../src/core/state";
import { WEAPONS } from "../src/data/weapons";
import { createUnit } from "../src/core/unit";

const SAVE_KEY = "tactics-mvp-save";

/** Minimal in-memory localStorage for node env. */
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
// createGameState defaults
// ---------------------------------------------------------------------------

describe("createGameState - ownedWeapons", () => {
  it("starts with ownedWeapons seeded from the starting party's equipped weapons", () => {
    const state = createGameState();
    // Every starting unit's weapon must be owned.
    for (const u of state.party) {
      expect(state.ownedWeapons).toContain(u.weaponId);
    }
  });

  it("ownedWeapons is a non-empty array (starting party has weapons)", () => {
    const state = createGameState();
    expect(Array.isArray(state.ownedWeapons)).toBe(true);
    expect(state.ownedWeapons.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// ownsWeapon
// ---------------------------------------------------------------------------

describe("ownsWeapon", () => {
  it("returns false when ownedWeapons is empty", () => {
    const state = createGameState();
    expect(ownsWeapon(state, "greatsword")).toBe(false);
  });

  it("returns true after the id is added to ownedWeapons", () => {
    const state = createGameState();
    state.ownedWeapons.push("greatsword");
    expect(ownsWeapon(state, "greatsword")).toBe(true);
  });

  it("returns false for an id not in ownedWeapons", () => {
    const state = createGameState();
    state.ownedWeapons.push("greatsword");
    expect(ownsWeapon(state, "longbow")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buyWeapon
// ---------------------------------------------------------------------------

describe("buyWeapon", () => {
  it("deducts the price, adds to ownedWeapons, and returns true when affordable and unowned", () => {
    const state = createGameState();
    state.gold = 500;
    const price = WEAPONS.greatsword.price;
    const result = buyWeapon(state, "greatsword");
    expect(result).toBe(true);
    expect(state.gold).toBe(500 - price);
    expect(state.ownedWeapons).toContain("greatsword");
  });

  it("returns false and mutates nothing when gold is insufficient", () => {
    const state = createGameState();
    state.gold = 10; // greatsword costs 200
    const gilBefore = state.gold;
    const ownedBefore = [...state.ownedWeapons];
    const result = buyWeapon(state, "greatsword");
    expect(result).toBe(false);
    expect(state.gold).toBe(gilBefore);
    expect(state.ownedWeapons).toEqual(ownedBefore);
  });

  it("returns false and mutates nothing when weapon is already owned", () => {
    const state = createGameState();
    state.gold = 9999;
    state.ownedWeapons.push("greatsword");
    const gilBefore = state.gold;
    const result = buyWeapon(state, "greatsword");
    expect(result).toBe(false);
    expect(state.gold).toBe(gilBefore);
    expect(state.ownedWeapons.filter((id) => id === "greatsword").length).toBe(1);
  });

  it("returns false for an unknown weapon id", () => {
    const state = createGameState();
    state.gold = 9999;
    const ownedBefore = [...state.ownedWeapons];
    const result = buyWeapon(state, "nonexistent_weapon");
    expect(result).toBe(false);
    expect(state.gold).toBe(9999);
    expect(state.ownedWeapons).toEqual(ownedBefore);
  });

  it("can buy exactly when gold equals the price", () => {
    const state = createGameState();
    state.gold = WEAPONS.longbow.price;
    const result = buyWeapon(state, "longbow");
    expect(result).toBe(true);
    expect(state.gold).toBe(0);
  });

  it("returns false when gold is exactly one short", () => {
    const state = createGameState();
    state.gold = WEAPONS.longbow.price - 1;
    const result = buyWeapon(state, "longbow");
    expect(result).toBe(false);
  });

  it("updates ownsWeapon after a successful purchase", () => {
    const state = createGameState();
    state.gold = 999;
    expect(ownsWeapon(state, "greatsword")).toBe(false);
    buyWeapon(state, "greatsword");
    expect(ownsWeapon(state, "greatsword")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// sellWeapon
// ---------------------------------------------------------------------------

describe("sellWeapon", () => {
  it("removes from ownedWeapons and adds floor(price/2) gold, returns true for unequipped weapon", () => {
    const state = createGameState();
    state.ownedWeapons.push("greatsword");
    state.gold = 0;
    // No unit equipped with greatsword — safe to sell.
    const result = sellWeapon(state, "greatsword");
    expect(result).toBe(true);
    expect(state.ownedWeapons).not.toContain("greatsword");
    expect(state.gold).toBe(Math.floor(WEAPONS.greatsword.price / 2));
  });

  it("refuses (returns false, no mutation) when a party unit has the weapon equipped", () => {
    const state = createGameState();
    state.ownedWeapons.push("greatsword");
    state.gold = 0;
    const unit = createUnit({ name: "Tester", team: "player", classId: "knight", pos: { x: 0, y: 0 }, weaponId: "greatsword" });
    state.party = [unit];
    const result = sellWeapon(state, "greatsword");
    expect(result).toBe(false);
    expect(state.ownedWeapons).toContain("greatsword");
    expect(state.gold).toBe(0);
  });

  it("returns false and mutates nothing when weapon is not owned", () => {
    const state = createGameState();
    state.gold = 100;
    const result = sellWeapon(state, "greatsword");
    expect(result).toBe(false);
    expect(state.gold).toBe(100);
    expect(state.ownedWeapons).not.toContain("greatsword");
  });

  it("returns false and mutates nothing for an unknown weapon id", () => {
    const state = createGameState();
    state.gold = 100;
    const ownedBefore = [...state.ownedWeapons];
    const result = sellWeapon(state, "nonexistent_weapon");
    expect(result).toBe(false);
    expect(state.gold).toBe(100);
    expect(state.ownedWeapons).toEqual(ownedBefore);
  });

  it("does not duplicate gold on repeated calls to sell the same id", () => {
    const state = createGameState();
    state.ownedWeapons.push("rapier");
    state.gold = 0;
    sellWeapon(state, "rapier");
    const gilAfterFirst = state.gold;
    const result = sellWeapon(state, "rapier");
    expect(result).toBe(false);
    expect(state.gold).toBe(gilAfterFirst);
  });

  it("only blocks sell for the equipped unit, allows sell of a different owned weapon", () => {
    const state = createGameState();
    state.ownedWeapons.push("greatsword", "fellKnuckles");
    const unit = createUnit({ name: "Knight", team: "player", classId: "knight", pos: { x: 0, y: 0 }, weaponId: "greatsword" });
    state.party = [unit];
    // greatsword is equipped — refuse
    expect(sellWeapon(state, "greatsword")).toBe(false);
    // fellKnuckles is not equipped — allow
    const result = sellWeapon(state, "fellKnuckles");
    expect(result).toBe(true);
    expect(state.ownedWeapons).not.toContain("fellKnuckles");
  });
});

// ---------------------------------------------------------------------------
// Save round-trip
// ---------------------------------------------------------------------------

describe("ownedWeapons - save/load round-trip", () => {
  it("persists ownedWeapons through save -> load", () => {
    const state = createGameState();
    state.gold = 9999;
    buyWeapon(state, "greatsword");
    buyWeapon(state, "longbow");
    saveGame(state);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.ownedWeapons).toContain("greatsword");
    expect(loaded!.ownedWeapons).toContain("longbow");
  });

  it("normalises missing ownedWeapons to [] (old save back-compat)", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    delete raw.ownedWeapons;
    store(raw);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(Array.isArray(loaded!.ownedWeapons)).toBe(true);
  });

  it("does NOT reject an old save that is missing the ownedWeapons field", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    delete raw.ownedWeapons;
    store(raw);
    expect(loadGame()).not.toBeNull();
  });

  it("migrates each party unit's weaponId into ownedWeapons when loading an old save", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    // Simulate an old save: ownedWeapons missing, but units have weaponIds.
    delete raw.ownedWeapons;
    store(raw);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    // Every party unit's weapon must be in ownedWeapons after migration.
    const state = loaded!;
    for (const u of state.party) {
      expect(state.ownedWeapons).toContain(u.weaponId);
    }
  });

  it("does not duplicate a weaponId already in ownedWeapons during migration", () => {
    const raw: Record<string, unknown> = JSON.parse(JSON.stringify(createGameState()));
    const party = raw.party as Array<Record<string, unknown>>;
    const firstWeaponId = party[0].weaponId as string;
    raw.ownedWeapons = [firstWeaponId];
    store(raw);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.ownedWeapons.filter((id: string) => id === firstWeaponId).length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Every WEAPONS entry has a numeric price >= 0
// ---------------------------------------------------------------------------

describe("WEAPONS price field", () => {
  it("every weapon entry has a numeric price >= 0", () => {
    for (const weapon of Object.values(WEAPONS)) {
      expect(typeof weapon.price, `${weapon.id}.price must be a number`).toBe("number");
      expect(weapon.price, `${weapon.id}.price must be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });
});
