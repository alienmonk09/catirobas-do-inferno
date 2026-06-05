import type { ClassId, Difficulty, RaceId, Unit } from "./types";
import { createStartingParty } from "../data/party";
import { startingInventory } from "../data/items";
import { CLASSES } from "../data/classes";
import { RACES } from "../data/races";
import { WEAPONS } from "../data/weapons";
import { EQUIPMENT } from "../data/equipment";

export interface GameState {
  /** Persistent player units carried across phases. */
  party: Unit[];
  /** Shared consumable inventory: item id -> count. */
  inventory: Record<string, number>;
  /** 0-based index of the current phase. */
  phaseIndex: number;
  /** Selected difficulty; scales enemy levels. */
  difficulty: Difficulty;
}

export function createGameState(): GameState {
  return {
    party: createStartingParty(),
    inventory: startingInventory(),
    phaseIndex: 0,
    difficulty: "normal",
  };
}

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

/**
 * Adjust an enemy's authored level by the selected difficulty.
 * easy  → level - 1 (floored at 1)
 * normal → unchanged
 * hard  → level + 2
 */
export function enemyLevelFor(baseLevel: number, difficulty: Difficulty): number {
  if (difficulty === "easy") return Math.max(1, baseLevel - 1);
  if (difficulty === "hard") return baseLevel + 2;
  return baseLevel;
}

const SAVE_KEY = "tactics-mvp-save";

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // ignore (private mode / no storage)
  }
}

/** Shape-check a parsed save so a corrupt/incompatible blob can't crash the game. */
function isValidSave(data: unknown): data is GameState {
  if (!data || typeof data !== "object") return false;
  const s = data as Partial<GameState>;
  if (typeof s.phaseIndex !== "number" || s.phaseIndex < 0) return false;
  if (!s.inventory || typeof s.inventory !== "object") return false;
  if (!Array.isArray(s.party) || s.party.length === 0) return false;
  for (const u of s.party) {
    if (!u || typeof u !== "object") return false;
    if (!CLASSES[u.classId as ClassId]) return false;
    if (u.subClassId !== undefined && !CLASSES[u.subClassId as ClassId]) return false;
    if (!RACES[u.raceId as RaceId]) return false;
    if (!WEAPONS[u.weaponId]) return false;
    if (u.armorId !== undefined && (!EQUIPMENT[u.armorId] || EQUIPMENT[u.armorId].slot !== "armor")) return false;
    if (u.accessoryId !== undefined && (!EQUIPMENT[u.accessoryId] || EQUIPMENT[u.accessoryId].slot !== "accessory")) return false;
    if (!u.stats || typeof u.stats.maxHp !== "number") return false;
    if (typeof u.level !== "number" || !Array.isArray(u.learnedSkillIds)) return false;
    if (!u.pos || typeof u.pos.x !== "number" || typeof u.pos.y !== "number") return false;
  }
  return true;
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSave(parsed)) {
      clearSave();
      return null;
    }
    // Back-compat: old saves lack `difficulty`; normalise any missing/invalid value.
    if (!VALID_DIFFICULTIES.includes(parsed.difficulty as Difficulty)) {
      parsed.difficulty = "normal" as Difficulty;
    }
    return parsed;
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
