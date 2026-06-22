import { describe, it, expect } from "vitest";
import {
  REPUTATION_MIN,
  REPUTATION_MAX,
  REPUTATION_START,
  REPUTATION_VICTORY_GAIN,
  REPUTATION_DEFEAT_LOSS,
  adjustReputation,
  canShop,
  reputationPriceMult,
  effectivePrice,
} from "../src/core/reputation";

describe("reputation", () => {
  it("constants match GDD: -20..20, start -10, +1 victory, -2 defeat", () => {
    expect(REPUTATION_MIN).toBe(-20);
    expect(REPUTATION_MAX).toBe(20);
    expect(REPUTATION_START).toBe(-10);
    expect(REPUTATION_VICTORY_GAIN).toBe(1);
    expect(REPUTATION_DEFEAT_LOSS).toBe(-2);
  });

  it("adjustReputation clamps to range", () => {
    expect(adjustReputation(0, 100)).toBe(20);
    expect(adjustReputation(0, -100)).toBe(-20);
    expect(adjustReputation(0, 5)).toBe(5);
    expect(adjustReputation(10, -3)).toBe(7);
  });

  it("canShop returns false at min, true otherwise", () => {
    expect(canShop(-20)).toBe(false);
    expect(canShop(-19)).toBe(true);
    expect(canShop(0)).toBe(true);
    expect(canShop(20)).toBe(true);
  });

  it("reputationPriceMult gives 20% discount at +20", () => {
    expect(reputationPriceMult(20)).toBe(0.8);
  });

  it("reputationPriceMult gives 1.0 at neutral", () => {
    expect(reputationPriceMult(0)).toBe(1.0);
    expect(reputationPriceMult(-10)).toBe(1.0);
    expect(reputationPriceMult(19)).toBe(1.0);
  });

  it("reputationPriceMult gives Infinity at -20 (shop refuses)", () => {
    expect(reputationPriceMult(-20)).toBe(Infinity);
  });

  it("effectivePrice applies discount at max reputation", () => {
    expect(effectivePrice(100, 20)).toBe(80);
  });

  it("effectivePrice returns -1 when shop refuses", () => {
    expect(effectivePrice(100, -20)).toBe(-1);
  });

  it("effectivePrice rounds up", () => {
    expect(effectivePrice(101, 20)).toBe(81);
  });
});