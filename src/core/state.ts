import type { Unit } from "./types";
import { createStartingParty } from "../data/party";
import { startingInventory } from "../data/items";

export interface GameState {
  /** Persistent player units carried across phases. */
  party: Unit[];
  /** Shared consumable inventory: item id -> count. */
  inventory: Record<string, number>;
  /** 0-based index of the current phase. */
  phaseIndex: number;
}

export function createGameState(): GameState {
  return {
    party: createStartingParty(),
    inventory: startingInventory(),
    phaseIndex: 0,
  };
}

const SAVE_KEY = "tactics-mvp-save";

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // ignore (private mode / no storage)
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

/** Reset a unit's per-battle volatile state (full restore, clear CT/statuses). */
export function refreshForBattle(unit: Unit): void {
  unit.stats.hp = unit.stats.maxHp;
  unit.stats.mp = unit.stats.maxMp;
  unit.ct = 0;
  unit.statuses = [];
  unit.alive = true;
}
