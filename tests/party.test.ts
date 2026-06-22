import { describe, it, expect } from "vitest";
import {
  ROSTER,
  PARTY_SIZE,
  MAX_PARTY,
  createParty,
  createStartingParty,
  getHero,
  partyCapForPhase,
  recruitableHeroes,
  recruitHero,
} from "../src/data/party";
import { CLASSES, getClass } from "../src/data/classes";
import { RACES } from "../src/data/races";
import { xpForLevel } from "../src/core/unit";

describe("hero roster", () => {
  it("has unique ids and resolvable class + race for every hero", () => {
    const ids = new Set<string>();
    for (const h of ROSTER) {
      expect(ids.has(h.id)).toBe(false);
      ids.add(h.id);
      expect(CLASSES[h.classId]).toBeDefined();
      expect(RACES[h.raceId]).toBeDefined();
      expect(h.name.length).toBeGreaterThan(0);
    }
    expect(ROSTER.length).toBeGreaterThanOrEqual(PARTY_SIZE);
  });

  it("grows the party cap across the 6-phase campaign without exceeding the roster", () => {
    expect(partyCapForPhase(0)).toBe(PARTY_SIZE); // start: four-strong
    expect(partyCapForPhase(1)).toBe(PARTY_SIZE);
    expect(partyCapForPhase(2)).toBe(5); // fifth slot opens at Deserto
    expect(partyCapForPhase(3)).toBe(5);
    expect(partyCapForPhase(4)).toBe(6); // sixth slot opens at Vulcão
    expect(partyCapForPhase(5)).toBe(6); // finale (Monte Macheza) at full company
    expect(partyCapForPhase(5)).toBeLessThanOrEqual(MAX_PARTY);
    expect(partyCapForPhase(5)).toBeGreaterThan(partyCapForPhase(0));
    for (let p = 1; p <= 5; p++) {
      expect(partyCapForPhase(p)).toBeGreaterThanOrEqual(partyCapForPhase(p - 1));
    }
  });

  it("offers only un-recruited roster heroes as reinforcements", () => {
    const party = createStartingParty(); // first PARTY_SIZE heroes
    const recruits = recruitableHeroes(party);
    expect(recruits.length).toBe(ROSTER.length - PARTY_SIZE);
    const partyIds = new Set(party.map((u) => u.id));
    for (const r of recruits) expect(partyIds.has(r.id)).toBe(false);
  });

  it("recruits a reinforcement at the requested level (floored at 1) with the right identity", () => {
    const caveira = getHero("caveira")!;
    const unit = recruitHero(caveira, 6);
    expect(unit.id).toBe("caveira");
    expect(unit.classId).toBe("thief");
    expect(unit.level).toBe(6);
    expect(unit.team).toBe("player");
    expect(unit.learnedSkillIds.length).toBeGreaterThanOrEqual(1);
    expect(recruitHero(caveira, 1).level).toBe(1);
  });

  it("seeds a mid-campaign recruit with partial XP so it lands on the party curve, not a full level behind", () => {
    const caveira = getHero("caveira")!;
    const unit = recruitHero(caveira, 6);
    const need = xpForLevel(6);
    expect(unit.xp).toBe(Math.floor(need * 0.5));
    expect(unit.xp).toBeGreaterThan(0);
    expect(unit.xp).toBeLessThan(need);
    expect(recruitHero(caveira, 6).xp).toBe(unit.xp);
  });

  it("keeps a level-1 recruit at 0 XP (fresh-start feel)", () => {
    const caveira = getHero("caveira")!;
    expect(recruitHero(caveira, 1).xp).toBe(0);
  });

  it("includes Caveira the Assassino and Porquinho the Mago", () => {
    const caveira = getHero("caveira");
    const porquinho = getHero("porquinho");
    expect(caveira).toMatchObject({ name: "Caveira", classId: "thief" });
    expect(porquinho).toMatchObject({ name: "Porquinho", classId: "whiteMage" });
  });
});

describe("createParty", () => {
  it("builds a level-1 unit per hero, with the first class skill and banked SP", () => {
    const party = createParty(["caveira", "porquinho"]);
    expect(party).toHaveLength(2);
    const caveira = party[0];
    expect(caveira.name).toBe("Caveira");
    expect(caveira.classId).toBe("thief");
    expect(caveira.raceId).toBe("elf");
    expect(caveira.team).toBe("player");
    expect(caveira.level).toBe(1);
    expect(caveira.sp).toBe(100);
    expect(caveira.learnedSkillIds).toEqual([getClass("thief").skillIds[0]]);
    expect(caveira.alive).toBe(true);
  });

  it("skips unknown hero ids", () => {
    const party = createParty(["caveira", "nobody", "porquinho"]);
    expect(party.map((u) => u.name)).toEqual(["Caveira", "Porquinho"]);
  });

  it("gives every unit a distinct id", () => {
    const party = createParty(ROSTER.map((h) => h.id));
    const ids = new Set(party.map((u) => u.id));
    expect(ids.size).toBe(ROSTER.length);
  });
});

describe("createStartingParty", () => {
  it("returns the four canonical roster heroes with fixed class/race", () => {
    const party = createStartingParty();
    expect(party).toHaveLength(PARTY_SIZE);
    expect(party.map((u) => ({ id: u.id, classId: u.classId, raceId: u.raceId }))).toEqual(
      ROSTER.slice(0, PARTY_SIZE).map((h) => ({ id: h.id, classId: h.classId, raceId: h.raceId })),
    );
    for (const u of party) {
      expect(u.team).toBe("player");
      expect(u.level).toBe(1);
      expect(RACES[u.raceId]).toBeDefined();
    }
  });
});