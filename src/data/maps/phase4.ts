import type { MapDef } from "../../core/types";

// Phase 4 — Sorcerer's Court. Tiered platforms, mage-stack + healers.
// An envoy bearing a peace accord must be shepherded through the court's crossfire
// to the sealed archive at the far dais — keep her alive long enough to deliver it.
export const phase4: MapDef = {
  id: "phase4",
  name: "Sorcerer's Court",
  intro:
    "Tiered stone terraces rise to a raised dais where black mages trade volleys of fire and lightning, abbesses weaving healing light from the side ledges. The court has grown — wider terraces, more crossfire, deeper chokes. Spread out, weather the storm, and out-heal the court before the AoE grinds you down. Sable the Envoy carries a sealed accord — she must reach the archive at the far dais alive.",
  objective: { kind: "escort", vipName: "Sable the Envoy", x: 8, y: 1 },
  width: 16,
  height: 14,
  heights: [
    [1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1],
    [1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1],
    [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0],
    [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0],
    [0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    [0, 1, 1, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1, 1, 0],
    [0, 0, 1, 1, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  blocked: [
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [true, true, false, false, false, false, false, false, false, false, false, false, false, false, true, true],
    [true, true, false, false, false, false, false, false, false, false, false, false, false, false, true, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, false, false, false, false, false, false, false, false, false, false, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
  ],
  playerSpawns: [
    { x: 5, y: 13 },
    { x: 6, y: 13 },
    { x: 7, y: 13 },
    { x: 8, y: 13 },
    { x: 9, y: 13 },
    { x: 10, y: 13 },
    { x: 6, y: 12 },
    { x: 9, y: 12 },
  ],
  /** Sable the Envoy — a White Mage escort who starts behind the player line. */
  allies: [
    { name: "Sable the Envoy", classId: "whiteMage", level: 4, weaponId: "staff", skillIds: ["cure"], pos: { x: 8, y: 12 }, raceId: "human" },
  ],
  enemies: [
    { name: "Pyromancer Velis", classId: "blackMage", level: 9, weaponId: "rod", skillIds: ["fire", "fireball", "poison"], pos: { x: 6, y: 2 }, raceId: "elf" },
    { name: "Stormcaller Dane", classId: "blackMage", level: 9, weaponId: "rod", skillIds: ["fire", "bolt", "stop"], pos: { x: 9, y: 2 }, raceId: "elf" },
    { name: "Ashcaller Ruve", classId: "blackMage", level: 8, weaponId: "rod", skillIds: ["fire", "fireball", "poison"], pos: { x: 4, y: 3 }, raceId: "elf" },
    { name: "Voltweaver Senn", classId: "blackMage", level: 8, weaponId: "rod", skillIds: ["fire", "bolt", "stop"], pos: { x: 11, y: 3 }, raceId: "elf" },
    { name: "Abbess Mirelle", classId: "whiteMage", level: 8, weaponId: "staff", skillIds: ["cure", "cura", "protect", "haste"], pos: { x: 2, y: 4 }, raceId: "human" },
    { name: "Sister Veda", classId: "whiteMage", level: 7, weaponId: "staff", skillIds: ["cure", "cura", "protect", "haste"], pos: { x: 13, y: 4 }, raceId: "human" },
    { name: "Court Guard Rolf", classId: "knight", level: 9, weaponId: "sword", skillIds: ["powerStrike", "guard"], pos: { x: 5, y: 5 }, raceId: "dwarf" },
    { name: "Court Guard Bram", classId: "knight", level: 8, weaponId: "sword", skillIds: ["powerStrike", "guard"], pos: { x: 10, y: 5 }, raceId: "dwarf" },
    { name: "Temple Fist Kai", classId: "monk", level: 8, weaponId: "knuckles", skillIds: ["palmStrike", "earthShake"], pos: { x: 7, y: 6 }, raceId: "orc" },
    { name: "Temple Fist Oda", classId: "monk", level: 8, weaponId: "knuckles", skillIds: ["palmStrike", "earthShake"], pos: { x: 9, y: 6 }, raceId: "orc" },
    { name: "Court Guard Hesk", classId: "knight", level: 8, weaponId: "sword", skillIds: ["powerStrike", "guard"], pos: { x: 8, y: 7 }, raceId: "dwarf" },
  ],
};
