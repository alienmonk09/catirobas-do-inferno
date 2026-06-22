import { describe, it, expect } from "vitest";
import {
  AFFINITY_PAIRS,
  AFFINITY_THRESHOLD,
  AFFINITY_VICTORY_GAIN,
  AFFINITY_DEFEAT_LOSS,
  pairKey,
  getAffinity,
  adjustAffinity,
  isPairUnlocked,
  getAvailableCombos,
} from "../src/data/affinity";

describe("affinity", () => {
  it("defines two pairs", () => {
    expect(AFFINITY_PAIRS).toHaveLength(2);
    expect(AFFINITY_PAIRS[0].heroA).toBe("boleto");
    expect(AFFINITY_PAIRS[0].heroB).toBe("porquinho");
    expect(AFFINITY_PAIRS[1].heroA).toBe("meleca");
    expect(AFFINITY_PAIRS[1].heroB).toBe("caveira");
  });

  it("threshold is 100, +10 victory, -5 defeat", () => {
    expect(AFFINITY_THRESHOLD).toBe(100);
    expect(AFFINITY_VICTORY_GAIN).toBe(10);
    expect(AFFINITY_DEFEAT_LOSS).toBe(5);
  });

  it("pairKey sorts hero ids alphabetically", () => {
    expect(pairKey("boleto", "porquinho")).toBe("boleto:porquinho");
    expect(pairKey("porquinho", "boleto")).toBe("boleto:porquinho");
  });

  it("getAffinity returns 0 for empty progress", () => {
    expect(getAffinity({}, "boleto", "porquinho")).toBe(0);
  });

  it("adjustAffinity adds and clamps at 100", () => {
    const p: Record<string, number> = {};
    adjustAffinity(p, "boleto", "porquinho", 10);
    expect(getAffinity(p, "boleto", "porquinho")).toBe(10);
    adjustAffinity(p, "boleto", "porquinho", 95);
    expect(getAffinity(p, "boleto", "porquinho")).toBe(100);
    adjustAffinity(p, "boleto", "porquinho", 10);
    expect(getAffinity(p, "boleto", "porquinho")).toBe(100);
  });

  it("adjustAffinity clamps at 0 on negative", () => {
    const p: Record<string, number> = {};
    adjustAffinity(p, "boleto", "porquinho", -100);
    expect(getAffinity(p, "boleto", "porquinho")).toBe(0);
  });

  it("isPairUnlocked returns true at threshold", () => {
    const p: Record<string, number> = {};
    expect(isPairUnlocked(p, "boleto", "porquinho")).toBe(false);
    adjustAffinity(p, "boleto", "porquinho", 100);
    expect(isPairUnlocked(p, "boleto", "porquinho")).toBe(true);
  });

  it("getAvailableCombos returns nothing when nothing unlocked", () => {
    expect(getAvailableCombos({}, ["boleto", "porquinho", "meleca", "caveira"])).toEqual([]);
  });

  it("getAvailableCombos returns socoMagicoBrilhoso when pair 1 unlocked + both alive", () => {
    const p: Record<string, number> = {};
    adjustAffinity(p, "boleto", "porquinho", 100);
    expect(getAvailableCombos(p, ["boleto", "porquinho", "meleca", "caveira"])).toEqual(["socoMagicoBrilhoso"]);
  });

  it("getAvailableCombos returns abracoMortalDuplo when pair 2 unlocked + both alive", () => {
    const p: Record<string, number> = {};
    adjustAffinity(p, "meleca", "caveira", 100);
    expect(getAvailableCombos(p, ["boleto", "porquinho", "meleca", "caveira"])).toEqual(["abracoMortalDuplo"]);
  });

  it("getAvailableCombos returns formacaoMachezaFinal when both pairs unlocked + 4 alive", () => {
    const p: Record<string, number> = {};
    adjustAffinity(p, "boleto", "porquinho", 100);
    adjustAffinity(p, "meleca", "caveira", 100);
    const combos = getAvailableCombos(p, ["boleto", "porquinho", "meleca", "caveira"]);
    expect(combos).toContain("socoMagicoBrilhoso");
    expect(combos).toContain("abracoMortalDuplo");
    expect(combos).toContain("formacaoMachezaFinal");
  });

  it("getAvailableCombos does not return formacaoMachezaFinal with only 3 alive", () => {
    const p: Record<string, number> = {};
    adjustAffinity(p, "boleto", "porquinho", 100);
    adjustAffinity(p, "meleca", "caveira", 100);
    const combos = getAvailableCombos(p, ["boleto", "porquinho", "meleca"]);
    expect(combos).toContain("socoMagicoBrilhoso");
    expect(combos).not.toContain("formacaoMachezaFinal");
  });

  it("getAvailableCombos does not return pair combo when one hero dead", () => {
    const p: Record<string, number> = {};
    adjustAffinity(p, "boleto", "porquinho", 100);
    expect(getAvailableCombos(p, ["boleto", "meleca", "caveira"])).toEqual([]);
  });
});