import type { ClassId, RaceId, Unit } from "../core/types";
import { createUnit } from "../core/unit";
import { getClass } from "./classes";

export interface HeroDef {
  /** Stable roster id (used by party selection + save). */
  id: string;
  name: string;
  classId: ClassId;
  raceId: RaceId;
}

/** The roster of named heroes who can carry the Ashen Banner. Pick 4. */
export const ROSTER: HeroDef[] = [
  { id: "garan", name: "Garan", classId: "knight", raceId: "dwarf" },
  { id: "lyra", name: "Lyra", classId: "archer", raceId: "elf" },
  { id: "vex", name: "Vex", classId: "blackMage", raceId: "human" },
  { id: "mira", name: "Mira", classId: "whiteMage", raceId: "human" },
  { id: "bron", name: "Bron", classId: "monk", raceId: "orc" },
  { id: "enzo", name: "Enzo", classId: "thief", raceId: "halfling" },
  { id: "penelope", name: "Penelope", classId: "druid", raceId: "elf" },
];

/** How many heroes make up a party. */
export const PARTY_SIZE = 4;

export function getHero(id: string): HeroDef | undefined {
  return ROSTER.find((h) => h.id === id);
}

function buildHero(hero: HeroDef): Unit {
  const c = getClass(hero.classId);
  const unit = createUnit({
    name: hero.name,
    team: "player",
    classId: hero.classId,
    raceId: hero.raceId,
    level: 3,
    pos: { x: 0, y: 0 },
    // Start knowing the first skill of the class; JP banked toward the next.
    learnedSkillIds: c.skillIds.slice(0, 1),
  });
  unit.jp = 100;
  return unit;
}

/** Build a party from a list of roster hero ids (unknown ids are skipped). */
export function createParty(heroIds: string[]): Unit[] {
  return heroIds.map(getHero).filter((h): h is HeroDef => Boolean(h)).map(buildHero);
}

/** Default party: the first PARTY_SIZE heroes of the roster (level 3). */
export function createStartingParty(): Unit[] {
  return createParty(ROSTER.slice(0, PARTY_SIZE).map((h) => h.id));
}
