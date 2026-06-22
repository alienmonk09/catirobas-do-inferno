export const REPUTATION_MIN = -20;
export const REPUTATION_MAX = 20;
export const REPUTATION_START = -10;
export const REPUTATION_VICTORY_GAIN = 1;
export const REPUTATION_DEFEAT_LOSS = -2;

export function adjustReputation(current: number, delta: number): number {
  return Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, current + delta));
}

export function canShop(reputation: number): boolean {
  return reputation > REPUTATION_MIN;
}

export function reputationPriceMult(reputation: number): number {
  if (reputation <= REPUTATION_MIN) return Infinity;
  if (reputation >= REPUTATION_MAX) return 0.8;
  return 1.0;
}

export function effectivePrice(basePrice: number, reputation: number): number {
  const mult = reputationPriceMult(reputation);
  if (mult === Infinity) return -1;
  return Math.ceil(basePrice * mult);
}