import { describe, it, expect } from "vitest";
import { PHASES } from "../src/data/maps";
import { CLASSES } from "../src/data/classes";
import { WEAPONS } from "../src/data/weapons";
import { SKILLS } from "../src/data/skills";

describe("map data invariants", () => {
  for (const map of PHASES) {
    describe(map.id, () => {
      it("has rectangular heights matching width/height", () => {
        expect(map.heights.length).toBe(map.height);
        for (const row of map.heights) {
          expect(row.length).toBe(map.width);
          for (const z of row) expect(z).toBeGreaterThanOrEqual(0);
        }
      });

      it("has a blocked mask matching dims when present", () => {
        if (!map.blocked) return;
        expect(map.blocked.length).toBe(map.height);
        for (const row of map.blocked) expect(row.length).toBe(map.width);
      });

      it("has exactly 5 in-bounds, non-blocked, distinct player spawns", () => {
        expect(map.playerSpawns.length).toBe(5);
        const seen = new Set<string>();
        for (const s of map.playerSpawns) {
          expect(s.x).toBeGreaterThanOrEqual(0);
          expect(s.y).toBeGreaterThanOrEqual(0);
          expect(s.x).toBeLessThan(map.width);
          expect(s.y).toBeLessThan(map.height);
          expect(map.blocked?.[s.y][s.x] ?? false).toBe(false);
          const k = `${s.x},${s.y}`;
          expect(seen.has(k)).toBe(false);
          seen.add(k);
        }
      });

      it("has valid, in-bounds, non-blocked, non-overlapping enemies", () => {
        const seen = new Set<string>(map.playerSpawns.map((s) => `${s.x},${s.y}`));
        expect(map.enemies.length).toBeGreaterThanOrEqual(2);
        for (const e of map.enemies) {
          expect(CLASSES[e.classId]).toBeDefined();
          expect(WEAPONS[e.weaponId]).toBeDefined();
          // weapon must belong to the class
          expect(CLASSES[e.classId].weaponIds).toContain(e.weaponId);
          for (const sid of e.skillIds ?? []) {
            expect(SKILLS[sid]).toBeDefined();
            expect(CLASSES[e.classId].skillIds).toContain(sid);
          }
          expect(e.pos.x).toBeGreaterThanOrEqual(0);
          expect(e.pos.y).toBeGreaterThanOrEqual(0);
          expect(e.pos.x).toBeLessThan(map.width);
          expect(e.pos.y).toBeLessThan(map.height);
          expect(map.blocked?.[e.pos.y][e.pos.x] ?? false).toBe(false);
          const k = `${e.pos.x},${e.pos.y}`;
          expect(seen.has(k)).toBe(false);
          seen.add(k);
        }
      });
    });
  }
});
