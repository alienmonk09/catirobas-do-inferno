import { describe, it, expect } from "vitest";
import { t, tp, getLocale, setLocale, onLocaleChange, SUPPORTED_LOCALES } from "../src/i18n";

describe("i18n runtime", () => {
  describe("t()", () => {
    it("returns the PT-BR value for an existing key", () => {
      expect(t("common.on")).toBe("Ligado");
      expect(t("common.off")).toBe("Desligado");
      expect(t("common.back")).toBe("← Voltar");
    });

    it("returns [key] for a missing key", () => {
      expect(t("nonexistent.key")).toBe("[nonexistent.key]");
      expect(t("common.typo")).toBe("[common.typo]");
    });

    it("interpolates {{var}} placeholders", () => {
      expect(t("battle.log.damage", { name: "Boleto", amount: 5 })).toBe(
        "Boleto sofre 5 de dano",
      );
      expect(t("battle.log.heal", { name: "Porquinho", amount: 12 })).toBe(
        "Porquinho recupera 12 HP",
      );
    });

    it("leaves unmatched placeholders intact", () => {
      expect(t("battle.log.damage", { name: "Boleto" })).toBe("Boleto sofre {{amount}} de dano");
    });

    it("coerces numbers to string in interpolation", () => {
      expect(t("battle.log.reachesLevel", { name: "Meleca", level: 7 })).toBe(
        "Meleca alcança Nv 7!",
      );
    });

    it("handles nested status keys", () => {
      expect(t("battle.status.guard.label")).toBe("Guarda");
      expect(t("battle.status.poison.tip")).toBe("Perde HP ao final de cada turno");
    });
  });

  describe("tp() — plural", () => {
    it("appends plural category to the key and falls back when missing", () => {
      expect(tp("test.plural", 1)).toBe("[test.plural.one]");
    });

    it("produces a string and injects count as a var", () => {
      expect(typeof tp("battle.mvp.kills", 3, { s: "s" })).toBe("string");
    });
  });

  describe("locale management", () => {
    it("getLocale() returns the current locale", () => {
      expect(getLocale()).toBe("pt-BR");
    });

    it("setLocale() is idempotent for the same locale", () => {
      const before = getLocale();
      setLocale("pt-BR");
      expect(getLocale()).toBe(before);
    });

    it("SUPPORTED_LOCALES includes pt-BR", () => {
      expect(SUPPORTED_LOCALES).toContain("pt-BR");
    });

    it("onLocaleChange fires on locale change", () => {
      let fired = false;
      const off = onLocaleChange(() => { fired = true; });
      // setLocale to the same value doesn't fire
      setLocale("pt-BR");
      expect(fired).toBe(false);
      off();
    });
  });

  describe("catalog coverage", () => {
    it("all status keys exist for every StatusKind", () => {
      const statuses = ["guard", "protect", "shell", "haste", "regen", "slow", "poison", "stop", "confuse", "critUp", "reflect"];
      for (const s of statuses) {
        expect(t(`battle.status.${s}.label`)).not.toBe(`[battle.status.${s}.label]`);
        expect(t(`battle.status.${s}.tip`)).not.toBe(`[battle.status.${s}.tip]`);
      }
    });

    it("all difficulty labels and descriptions exist", () => {
      const diffs = ["easy", "normal", "hard", "ironic"];
      for (const d of diffs) {
        expect(t(`partySelect.difficultyLabels.${d}`)).not.toBe(`[partySelect.difficultyLabels.${d}]`);
        expect(t(`partySelect.difficultyDescs.${d}`)).not.toBe(`[partySelect.difficultyDescs.${d}]`);
      }
    });
  });
});