import { describe, it, expect } from "vitest";
import { formatHit } from "../src/battle/log";
import type { HitResult } from "../src/battle/combat";

const nameOf = (id: string): string => {
  const map: Record<string, string> = { u1: "Aldric", u2: "Seraphel" };
  return map[id] ?? "Someone";
};

describe("formatHit", () => {
  it("formats plain damage", () => {
    const r: HitResult = { unitId: "u1", kind: "damage", amount: 24, crit: false, killed: false, revived: false };
    expect(formatHit(r, nameOf)).toBe("Aldric sofre 24 de dano");
  });

  it("appends critical wording on crit", () => {
    const r: HitResult = { unitId: "u1", kind: "damage", amount: 36, crit: true, killed: false, revived: false };
    expect(formatHit(r, nameOf)).toBe("Aldric sofre 36 de dano (crítico!)");
  });

  it("appends KO on kill", () => {
    const r: HitResult = { unitId: "u2", kind: "damage", amount: 18, crit: false, killed: true, revived: false };
    expect(formatHit(r, nameOf)).toBe("Seraphel sofre 18 de dano — Nocauteado!");
  });

  it("appends both crit and KO when both are true", () => {
    const r: HitResult = { unitId: "u1", kind: "damage", amount: 50, crit: true, killed: true, revived: false };
    expect(formatHit(r, nameOf)).toBe("Aldric sofre 50 de dano (crítico!) — Nocauteado!");
  });

  it("formats a heal", () => {
    const r: HitResult = { unitId: "u1", kind: "heal", amount: 18, crit: false, killed: false, revived: false };
    expect(formatHit(r, nameOf)).toBe("Aldric recupera 18 HP");
  });

  it("formats MP recovery", () => {
    const r: HitResult = { unitId: "u2", kind: "mp", amount: 8, crit: false, killed: false, revived: false };
    expect(formatHit(r, nameOf)).toBe("Seraphel recupera 8 MP");
  });

  it("formats revive", () => {
    const r: HitResult = { unitId: "u1", kind: "revive", amount: 1, crit: false, killed: false, revived: true };
    expect(formatHit(r, nameOf)).toBe("Aldric foi revivido");
  });

  it("formats a debuff status (poison)", () => {
    const r: HitResult = { unitId: "u2", kind: "status", amount: 0, crit: false, killed: false, revived: false, status: "poison" };
    expect(formatHit(r, nameOf)).toBe("Seraphel foi envenenado");
  });

  it("formats a debuff status (slow)", () => {
    const r: HitResult = { unitId: "u1", kind: "status", amount: 0, crit: false, killed: false, revived: false, status: "slow" };
    expect(formatHit(r, nameOf)).toBe("Aldric está lento");
  });

  it("formats a debuff status (stop)", () => {
    const r: HitResult = { unitId: "u1", kind: "status", amount: 0, crit: false, killed: false, revived: false, status: "stop" };
    expect(formatHit(r, nameOf)).toBe("Aldric está parado");
  });

  it("formats a buff status (haste)", () => {
    const r: HitResult = { unitId: "u2", kind: "status", amount: 0, crit: false, killed: false, revived: false, status: "haste" };
    expect(formatHit(r, nameOf)).toBe("Seraphel está acelerado");
  });

  it("formats a buff status (regen)", () => {
    const r: HitResult = { unitId: "u1", kind: "status", amount: 0, crit: false, killed: false, revived: false, status: "regen" };
    expect(formatHit(r, nameOf)).toBe("Aldric está regenerando");
  });

  it("formats a Remedy cure (status result with no status field)", () => {
    const r: HitResult = { unitId: "u1", kind: "status", amount: 0, crit: false, killed: false, revived: false };
    expect(formatHit(r, nameOf)).toBe("Aldric foi curado de debuffs");
  });

  it("falls back to Someone for an unknown unit id", () => {
    const r: HitResult = { unitId: "unknown-id", kind: "damage", amount: 10, crit: false, killed: false, revived: false };
    expect(formatHit(r, nameOf)).toBe("Someone sofre 10 de dano");
  });

  it("uses the nameOf callback for the real name", () => {
    let called = false;
    const myNameOf = (id: string): string => {
      called = true;
      return id === "u1" ? "Aldric" : "Someone";
    };
    const r: HitResult = { unitId: "u1", kind: "heal", amount: 5, crit: false, killed: false, revived: false };
    formatHit(r, myNameOf);
    expect(called).toBe(true);
  });
});