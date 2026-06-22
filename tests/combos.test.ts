import { describe, it, expect } from "vitest";
import { COMBO_SKILLS, COMBO_REQUIREMENTS, COMBO_FAIL_CHANCES, getComboSkill } from "../src/data/skills/combos";

describe("combo skills", () => {
  it("defines 3 combo skills", () => {
    expect(Object.keys(COMBO_SKILLS)).toHaveLength(3);
    expect(COMBO_SKILLS.socoMagicoBrilhoso).toBeDefined();
    expect(COMBO_SKILLS.abracoMortalDuplo).toBeDefined();
    expect(COMBO_SKILLS.formacaoMachezaFinal).toBeDefined();
  });

  it("socoMagicoBrilhoso is physical damage with high power (2x)", () => {
    const s = COMBO_SKILLS.socoMagicoBrilhoso;
    expect(s.effect).toBe("damage");
    expect(s.scaling).toBe("physical");
    expect(s.power).toBeGreaterThanOrEqual(30);
    expect(s.mpCost).toBeGreaterThan(0);
  });

  it("abracoMortalDuplo applies defDown", () => {
    const s = COMBO_SKILLS.abracoMortalDuplo;
    expect(s.effect).toBe("debuff");
    expect(s.statusKind).toBe("defDown");
  });

  it("formacaoMachezaFinal applies atkUp buff", () => {
    const s = COMBO_SKILLS.formacaoMachezaFinal;
    expect(s.effect).toBe("buff");
    expect(s.statusKind).toBe("atkUp");
  });

  it("COMBO_REQUIREMENTS maps each combo to required heroes", () => {
    expect(COMBO_REQUIREMENTS.socoMagicoBrilhoso).toEqual(["boleto", "porquinho"]);
    expect(COMBO_REQUIREMENTS.abracoMortalDuplo).toEqual(["meleca", "caveira"]);
    expect(COMBO_REQUIREMENTS.formacaoMachezaFinal).toHaveLength(4);
  });

  it("COMBO_FAIL_CHANCES gives formacaoMachezaFinal 0.2 fail chance", () => {
    expect(COMBO_FAIL_CHANCES.formacaoMachezaFinal).toBe(0.2);
  });

  it("getComboSkill returns the skill def", () => {
    const s = getComboSkill("socoMagicoBrilhoso");
    expect(s.id).toBe("socoMagicoBrilhoso");
  });

  it("getComboSkill throws for unknown combo", () => {
    expect(() => getComboSkill("unknown")).toThrow();
  });
});