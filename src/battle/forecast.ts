import type { SkillDef, Unit, WeaponDef } from "../core/types";
import { effectiveDef } from "./combat";

export interface Forecast {
  kind: "damage" | "heal" | "revive" | "status";
  /** Expected (no-variance) magnitude. */
  amount: number;
  /** True if the expected hit would drop the target to 0 HP. */
  lethal: boolean;
}

/**
 * No-variance expected results, mirroring combat.ts resolution minus the RNG
 * roll. Single source of truth for both the UI damage preview and the AI.
 */
export function forecastWeapon(attacker: Unit, target: Unit, weapon: WeaponDef): Forecast {
  const stat = weapon.kind === "magical" ? attacker.stats.mag : attacker.stats.atk;
  const amount = Math.max(1, Math.round(stat + weapon.power - effectiveDef(target)));
  return { kind: "damage", amount, lethal: amount >= target.stats.hp };
}

export function forecastSkill(caster: Unit, target: Unit, skill: SkillDef): Forecast {
  const power = skill.scaling === "magical" ? caster.stats.mag : caster.stats.atk;
  switch (skill.effect) {
    case "damage": {
      const base = (power * skill.power) / 10 - (skill.scaling === "magical" ? target.stats.res : effectiveDef(target));
      const amount = Math.max(1, Math.round(base));
      return { kind: "damage", amount, lethal: amount >= target.stats.hp };
    }
    case "heal": {
      const amount = Math.max(1, Math.round((power * skill.power) / 10));
      return { kind: "heal", amount, lethal: false };
    }
    case "revive": {
      const amount = Math.max(1, Math.round((power * skill.power) / 20));
      return { kind: "revive", amount, lethal: false };
    }
    default:
      return { kind: "status", amount: 0, lethal: false };
  }
}
