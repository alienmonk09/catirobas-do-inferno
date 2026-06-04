import type { Unit } from "../core/types";
import { createUnit } from "../core/unit";
import { getClass } from "./classes";

/** The fixed starting party. Five units, one per class, at a gentle level 3. */
export function createStartingParty(): Unit[] {
  const roster: Array<{ name: string; classId: Unit["classId"] }> = [
    { name: "Garan", classId: "knight" },
    { name: "Lyra", classId: "archer" },
    { name: "Vex", classId: "blackMage" },
    { name: "Mira", classId: "whiteMage" },
    { name: "Bron", classId: "monk" },
  ];

  return roster.map((r) => {
    const c = getClass(r.classId);
    const unit = createUnit({
      name: r.name,
      team: "player",
      classId: r.classId,
      level: 3,
      pos: { x: 0, y: 0 },
      // Start knowing the first skill of the class; JP banked toward the next.
      learnedSkillIds: c.skillIds.slice(0, 1),
    });
    unit.jp = 100;
    return unit;
  });
}
