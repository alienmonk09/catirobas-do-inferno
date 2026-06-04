// Shared types for the Tactics MVP.

export type Team = "player" | "enemy";

export interface Point {
  x: number;
  y: number;
}

/** Mutable stat block for a unit. */
export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  mag: number;
  res: number;
  spd: number;
  move: number;
  jump: number;
}

export type ClassId = "knight" | "archer" | "blackMage" | "whiteMage" | "monk" | "thief" | "druid";

export type RaceId = "human" | "elf" | "dwarf" | "halfling" | "orc";

/** Flat stat deltas a race applies on top of class stats (omitted = 0). */
export type RaceMod = Partial<Pick<Stats, "hp" | "mp" | "atk" | "def" | "mag" | "res" | "spd" | "move" | "jump">>;

export interface RaceDef {
  id: RaceId;
  name: string;
  description: string;
  /** Additive modifiers applied to every level's stat block. */
  mod: RaceMod;
}

/** Per-level stat growth applied on level up. */
export interface StatGrowth {
  hp: number;
  mp: number;
  atk: number;
  def: number;
  mag: number;
  res: number;
  spd: number;
}

/** Level-1 base stats for a class (no current/max split — derived per level). */
export interface BaseStats {
  hp: number;
  mp: number;
  atk: number;
  def: number;
  mag: number;
  res: number;
  spd: number;
  move: number;
  jump: number;
}

export interface ClassDef {
  id: ClassId;
  name: string;
  description: string;
  base: BaseStats;
  growth: StatGrowth;
  /** Skills in unlock order. JP spent learns the next one. */
  skillIds: string[];
  /** Weapon ids this class can equip. */
  weaponIds: string[];
  /** Color used to tint the unit token. */
  color: string;
}

export type Element = "none" | "fire" | "ice" | "bolt" | "holy" | "nature";

export type AoeShape = "single" | "cross" | "square3";

export type SkillEffect = "damage" | "heal" | "buff" | "debuff" | "revive";

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  jpCost: number;
  range: number;
  aoe: AoeShape;
  power: number;
  element: Element;
  effect: SkillEffect;
  /** physical skills scale on ATK, magical on MAG. */
  scaling: "physical" | "magical";
  /** For buff/debuff: which stat and amount + duration. */
  statusKind?: StatusKind;
}

export type WeaponKind = "physical" | "magical";

export interface WeaponDef {
  id: string;
  name: string;
  power: number;
  range: number;
  kind: WeaponKind;
  classes: ClassId[];
}

export type ItemEffect = "healHp" | "healMp" | "revive";

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  effect: ItemEffect;
  amount: number;
  range: number;
}

export type StatusKind = "guard" | "slow" | "haste";

export interface ActiveStatus {
  kind: StatusKind;
  turnsLeft: number;
}

export interface Unit {
  id: string;
  name: string;
  team: Team;
  classId: ClassId;
  raceId: RaceId;
  level: number;
  xp: number;
  jp: number;
  learnedSkillIds: string[];
  weaponId: string;
  pos: Point;
  ct: number;
  stats: Stats;
  statuses: ActiveStatus[];
  /** false once HP hits 0; can be revived. */
  alive: boolean;
}

export interface Tile {
  x: number;
  y: number;
  z: number;
  walkable: boolean;
}

export interface MapDef {
  id: string;
  name: string;
  intro: string;
  width: number;
  height: number;
  /** Height per tile, row-major [y][x]. */
  heights: number[][];
  /** Optional unwalkable mask [y][x]; true = blocked. */
  blocked?: boolean[][];
  playerSpawns: Point[];
  enemies: EnemySpawn[];
}

export interface EnemySpawn {
  name: string;
  classId: ClassId;
  level: number;
  weaponId: string;
  pos: Point;
  /** Skills this enemy knows (subset of class skills). */
  skillIds?: string[];
}

export const CT_THRESHOLD = 100;
