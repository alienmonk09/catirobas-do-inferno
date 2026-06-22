import type { ClassId, RaceId, Unit } from "../core/types";
import { createUnit, xpForLevel } from "../core/unit";
import { getClass } from "./classes";

export interface HeroDef {
  /** Stable roster id (used by party selection + save). */
  id: string;
  name: string;
  classId: ClassId;
  raceId: RaceId;
}

/**
 * The roster of named heroes who carry the Catirobas do Inferno. Fixed party of 4.
 * Each hero has a locked primary class; sub-jobs are equipable at the Party Camp.
 */
export const ROSTER: HeroDef[] = [
  { id: "boleto", name: "Boleto", classId: "knight", raceId: "dwarf" },
  { id: "porquinho", name: "Porquinho", classId: "whiteMage", raceId: "gnome" },
  { id: "meleca", name: "Meleca", classId: "monk", raceId: "saurian" },
  { id: "caveira", name: "Caveira", classId: "thief", raceId: "elf" },
];

/** How many heroes you deploy at the start of a new game. */
export const PARTY_SIZE = 4;

/**
 * Hard ceiling on party size. The 4 fixed heroes plus up to 2 slots for
 * recruited enemies and guest allies (e.g. Zezé).
 */
export const MAX_PARTY = 6;

/**
 * Deployment / recruit cap for a chapter (0-based phase index). The party starts
 * at four and earns a slot twice across the 6-bioma campaign — five from the
 * Deserto onward, and a six-strong company for the Vulcão and Monte Macheza —
 * so reinforcements arrive at a readable pace.
 * Maps must offer at least this many spawns.
 */
export function partyCapForPhase(phaseIndex: number): number {
  // 6-phase campaign (indices 0–5): four at the start, five through the mid-game,
  // and six for the final stretch — reinforcements (recruited enemies, Zezé)
  // arrive at a steady pace instead of maxing out early.
  if (phaseIndex >= 4) return Math.min(6, MAX_PARTY);
  if (phaseIndex >= 2) return 5;
  return PARTY_SIZE;
}

export function getHero(id: string): HeroDef | undefined {
  return ROSTER.find((h) => h.id === id);
}

function buildHero(hero: HeroDef, level = 1): Unit {
  const c = getClass(hero.classId);
  // Learn one class skill per 3 levels so a recruit joining mid-campaign isn't
  // a blank slate (lv1-3→1 skill, lv6→2, lv9→3); the Math.max(1,…) floor
  // guarantees even a level-1 starter knows at least one skill. SP banks toward the next.
  const skillCount = Math.max(1, Math.floor(level / 3));
  const unit = createUnit({
    // Use the roster id as the unit id so the renderer/menus resolve the hero's
    // unique sprite (HERO_SPRITES is keyed by roster id). Roster ids are unique.
    id: hero.id,
    name: hero.name,
    team: "player",
    classId: hero.classId,
    raceId: hero.raceId,
    level,
    pos: { x: 0, y: 0 },
    learnedSkillIds: c.skillIds.slice(0, skillCount),
  });
  unit.sp = 100;
  // Seed a mid-campaign recruit ~halfway into its current level so it lands on
  // the team's XP curve instead of a full level behind (createUnit starts at 0).
  // Deterministic, always below the next-level threshold (50% < 100%), and a
  // fresh level-1 starter keeps 0 XP for the clean new-game feel.
  if (level > 1) unit.xp = Math.floor(xpForLevel(level) * 0.5);
  return unit;
}

/** Build a party from a list of roster hero ids (unknown ids are skipped). */
export function createParty(heroIds: string[]): Unit[] {
  return heroIds.map(getHero).filter((h): h is HeroDef => Boolean(h)).map((h) => buildHero(h));
}

/** Default party: the first PARTY_SIZE heroes of the roster, at level 1. */
export function createStartingParty(): Unit[] {
  return createParty(ROSTER.slice(0, PARTY_SIZE).map((h) => h.id));
}

/** Roster heroes not yet in the party (by id) — candidates for reinforcement. */
export function recruitableHeroes(party: Unit[]): HeroDef[] {
  const have = new Set(party.map((u) => u.id));
  return ROSTER.filter((h) => !have.has(h.id));
}

/** Build a reinforcement at the given level (the party average, floored at 1 to
 *  match the level-1 start) to join the party. */
export function recruitHero(hero: HeroDef, level: number): Unit {
  return buildHero(hero, Math.max(1, Math.round(level)));
}