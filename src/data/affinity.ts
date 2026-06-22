export interface AffinityPair {
  heroA: string;
  heroB: string;
  comboSkillId: string;
}

export const AFFINITY_PAIRS: AffinityPair[] = [
  { heroA: "boleto", heroB: "porquinho", comboSkillId: "socoMagicoBrilhoso" },
  { heroA: "meleca", heroB: "caveira", comboSkillId: "abracoMortalDuplo" },
];

export const ALL_HEROES_COMBO = "formacaoMachezaFinal";

export const AFFINITY_THRESHOLD = 100;
export const AFFINITY_VICTORY_GAIN = 10;
export const AFFINITY_DEFEAT_LOSS = 5;

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

export function getAffinity(
  progress: Record<string, number>,
  a: string,
  b: string,
): number {
  return progress[pairKey(a, b)] ?? 0;
}

export function adjustAffinity(
  progress: Record<string, number>,
  a: string,
  b: string,
  delta: number,
): void {
  const key = pairKey(a, b);
  const current = progress[key] ?? 0;
  progress[key] = Math.max(0, Math.min(AFFINITY_THRESHOLD, current + delta));
}

export function isPairUnlocked(
  progress: Record<string, number>,
  a: string,
  b: string,
): boolean {
  return getAffinity(progress, a, b) >= AFFINITY_THRESHOLD;
}

export function getAvailableCombos(
  progress: Record<string, number>,
  aliveHeroIds: string[],
): string[] {
  const combos: string[] = [];
  const alive = new Set(aliveHeroIds);

  for (const pair of AFFINITY_PAIRS) {
    if (
      isPairUnlocked(progress, pair.heroA, pair.heroB) &&
      alive.has(pair.heroA) &&
      alive.has(pair.heroB)
    ) {
      combos.push(pair.comboSkillId);
    }
  }

  const allPairsUnlocked = AFFINITY_PAIRS.every((p) =>
    isPairUnlocked(progress, p.heroA, p.heroB),
  );
  const allAlive = AFFINITY_PAIRS.flatMap((p) => [p.heroA, p.heroB]).every((h) =>
    alive.has(h),
  );
  if (allPairsUnlocked && allAlive) {
    combos.push(ALL_HEROES_COMBO);
  }

  return combos;
}