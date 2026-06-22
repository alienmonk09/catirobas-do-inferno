import { describe, it, expect, beforeEach } from "vitest";
import { createGameState, loadGame, saveGame, buyItem, buyWeapon, buyEquipment } from "../src/core/state";
import { REPUTATION_START } from "../src/core/reputation";

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

describe("W4 GameState extensions", () => {
  it("createGameState initializes reputation, achievements, zezeEncounters, affinityProgress", () => {
    const s = createGameState();
    expect(s.reputation).toBe(REPUTATION_START);
    expect(s.achievements).toEqual([]);
    expect(s.zezeEncounters).toBe(0);
    expect(s.affinityProgress).toEqual({});
  });

  it("GameState has optional lastAttackKind", () => {
    const s = createGameState();
    expect(s.lastAttackKind).toBeUndefined();
  });

  it("saveGame persists W4 fields (round-trip)", () => {
    const s = createGameState();
    s.reputation = 5;
    s.achievements = ["foramRejeitados"];
    s.zezeEncounters = 3;
    s.affinityProgress = { "boleto:porquinho": 50 };
    saveGame(s);
    const loaded = loadGame(0);
    expect(loaded).not.toBeNull();
    expect(loaded!.reputation).toBe(5);
    expect(loaded!.achievements).toEqual(["foramRejeitados"]);
    expect(loaded!.zezeEncounters).toBe(3);
    expect(loaded!.affinityProgress).toEqual({ "boleto:porquinho": 50 });
  });

  it("loadGame back-compat: old save without W4 fields gets defaults", () => {
    const oldSave = {
      party: [{
        id: "boleto", name: "Boleto", team: "player", classId: "knight", raceId: "dwarf",
        level: 1, xp: 0, sp: 0, learnedSkillIds: [], weaponId: "sword",
        pos: { x: 0, y: 0 }, facing: "down", ct: 0,
        stats: { hp: 30, maxHp: 30, mp: 10, maxMp: 10, atk: 10, def: 8, mag: 5, res: 5, spd: 8, move: 4, jump: 2 },
        statuses: [], alive: true,
      }],
      inventory: {},
      phaseIndex: 0,
      difficulty: "normal",
      gold: 100,
      ownedEquipment: [],
      ownedWeapons: ["sword"],
      slot: 0,
      ngPlus: 0,
      permadeath: false,
    };
    localStorage.setItem("tactics-mvp-save", JSON.stringify(oldSave));
    const loaded = loadGame(0);
    expect(loaded).not.toBeNull();
    expect(loaded!.reputation).toBe(REPUTATION_START);
    expect(loaded!.achievements).toEqual([]);
    expect(loaded!.zezeEncounters).toBe(0);
    expect(loaded!.affinityProgress).toEqual({});
  });

  it("buyItem with reputation refuses at -20", () => {
    const s = createGameState();
    s.reputation = -20;
    s.gold = 1000;
    expect(buyItem(s, "potion")).toBe(false);
  });

  it("buyItem with reputation applies 20% discount at +20", () => {
    const s = createGameState();
    s.reputation = 20;
    s.gold = 24;
    expect(buyItem(s, "potion")).toBe(true);
    expect(s.gold).toBe(0);
  });

  it("buyWeapon with reputation refuses at -20", () => {
    const s = createGameState();
    s.reputation = -20;
    s.gold = 10000;
    expect(buyWeapon(s, "greatsword")).toBe(false);
  });

  it("buyEquipment with reputation refuses at -20", () => {
    const s = createGameState();
    s.reputation = -20;
    s.gold = 10000;
    expect(buyEquipment(s, "leatherArmor")).toBe(false);
  });
});