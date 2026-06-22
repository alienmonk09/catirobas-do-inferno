import type { HitResult } from "./combat";
import type { StatusKind } from "../core/types";
import { t } from "../i18n";

/**
 * Format a single HitResult into a human-readable battle log line.
 * `nameOf` resolves a unit id to its display name (unknown → "Someone").
 */
export function formatHit(result: HitResult, nameOf: (id: string) => string): string {
  const name = nameOf(result.unitId);
  switch (result.kind) {
    case "damage": {
      let line = t("battle.log.damage", { name, amount: result.amount });
      if (result.crit) line += t("battle.log.damageCrit");
      if (result.killed) line += t("battle.log.ko");
      return line;
    }
    case "heal":
      return t("battle.log.heal", { name, amount: result.amount });
    case "mp":
      return t("battle.log.mp", { name, amount: result.amount });
    case "revive":
      return t("battle.log.revive", { name });
    case "status": {
      const sk = result.status as StatusKind | undefined;
      // No `status` field means a cure (Remedy strips debuffs), not a new status.
      if (!sk) return t("battle.log.cured", { name });
      return t(`battle.log.statusApplied.${sk}`, { name });
    }
  }
}