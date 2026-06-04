import type { ClassId, Point, Stats, Team, Unit } from "./types";
import { getClass } from "../data/classes";
import { getWeapon } from "../data/weapons";

let idCounter = 0;
export function nextUnitId(prefix = "u"): string {
  idCounter += 1;
  return `${prefix}${idCounter}`;
}

/** XP needed to reach the next level (flat-ish curve). */
export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 40;
}

/** Compute the stat block for a class at a given level. */
export function statsForLevel(classId: ClassId, level: number): Stats {
  const c = getClass(classId);
  const lv = level - 1;
  const g = c.growth;
  const maxHp = Math.round(c.base.hp + g.hp * lv);
  const maxMp = Math.round(c.base.mp + g.mp * lv);
  return {
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    atk: Math.round(c.base.atk + g.atk * lv),
    def: Math.round(c.base.def + g.def * lv),
    mag: Math.round(c.base.mag + g.mag * lv),
    res: Math.round(c.base.res + g.res * lv),
    spd: Math.round(c.base.spd + g.spd * lv),
    move: c.base.move,
    jump: c.base.jump,
  };
}

export interface CreateUnitOpts {
  name: string;
  team: Team;
  classId: ClassId;
  level?: number;
  pos: Point;
  weaponId?: string;
  /** Skills already learned; defaults to none. */
  learnedSkillIds?: string[];
  id?: string;
}

export function createUnit(opts: CreateUnitOpts): Unit {
  const level = opts.level ?? 1;
  const c = getClass(opts.classId);
  const weaponId = opts.weaponId ?? c.weaponIds[0];
  // Validate weapon belongs to class; fall back to class default.
  const w = getWeapon(weaponId);
  const finalWeapon = w.classes.includes(opts.classId) ? weaponId : c.weaponIds[0];
  return {
    id: opts.id ?? nextUnitId(opts.team === "player" ? "p" : "e"),
    name: opts.name,
    team: opts.team,
    classId: opts.classId,
    level,
    xp: 0,
    jp: 0,
    learnedSkillIds: [...(opts.learnedSkillIds ?? [])],
    weaponId: finalWeapon,
    pos: { ...opts.pos },
    ct: 0,
    stats: statsForLevel(opts.classId, level),
    statuses: [],
    alive: true,
  };
}

/**
 * Grant XP to a unit, applying any level ups. Preserves the ratio of current
 * to max HP/MP across a level up so a wounded unit stays wounded.
 * Returns the number of levels gained.
 */
export function grantXp(unit: Unit, amount: number): number {
  unit.xp += amount;
  let gained = 0;
  while (unit.xp >= xpForLevel(unit.level)) {
    unit.xp -= xpForLevel(unit.level);
    const hpRatio = unit.stats.maxHp > 0 ? unit.stats.hp / unit.stats.maxHp : 1;
    const mpRatio = unit.stats.maxMp > 0 ? unit.stats.mp / unit.stats.maxMp : 1;
    unit.level += 1;
    const next = statsForLevel(unit.classId, unit.level);
    unit.stats = next;
    unit.stats.hp = Math.max(1, Math.round(next.maxHp * hpRatio));
    unit.stats.mp = Math.round(next.maxMp * mpRatio);
    gained += 1;
  }
  return gained;
}

/** Grant JP toward learning skills. */
export function grantJp(unit: Unit, amount: number): void {
  unit.jp += amount;
}

/** The next skill the unit can learn for its class, or null if all learned. */
export function nextLearnableSkill(unit: Unit): string | null {
  const c = getClass(unit.classId);
  for (const id of c.skillIds) {
    if (!unit.learnedSkillIds.includes(id)) return id;
  }
  return null;
}

/**
 * Try to learn the next skill in class order, spending JP.
 * Returns the learned skill id or null if it can't be learned.
 */
export function learnNextSkill(unit: Unit, jpCost: number): string | null {
  const next = nextLearnableSkill(unit);
  if (!next) return null;
  if (unit.jp < jpCost) return null;
  unit.jp -= jpCost;
  unit.learnedSkillIds.push(next);
  return next;
}
