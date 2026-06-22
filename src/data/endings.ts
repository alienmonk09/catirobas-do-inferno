import type { EndingId, AttackKind } from "../core/types";

export interface FinalBattleResult {
  playerWon: boolean;
  lastAttackKind?: AttackKind;
  zezeEncounters: number;
}

export const ZEZE_ENDING_THRESHOLD = 10;

export function resolveEnding(result: FinalBattleResult): EndingId {
  if (!result.playerWon) return "c";
  if (result.zezeEncounters >= ZEZE_ENDING_THRESHOLD) return "d";
  if (result.lastAttackKind === "physical") return "a";
  return "b";
}