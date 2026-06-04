import { describe, it, expect } from "vitest";
import { RNG } from "../src/core/rng";

const SEEDS = [0, 1, 42, 1337, 0x9e3779b9, 0xffffffff, 123456789];
const SAMPLES = 5000;

describe("RNG", () => {
  describe("determinism", () => {
    it("produces the same next() sequence for the same seed", () => {
      for (const seed of SEEDS) {
        const a = new RNG(seed);
        const b = new RNG(seed);
        for (let i = 0; i < 100; i++) {
          expect(a.next()).toBe(b.next());
        }
      }
    });

    it("produces different sequences for different seeds", () => {
      const a = new RNG(1);
      const b = new RNG(2);
      // Collect first values; they should not be identical across the run.
      let anyDifferent = false;
      for (let i = 0; i < 20; i++) {
        if (a.next() !== b.next()) anyDifferent = true;
      }
      expect(anyDifferent).toBe(true);
    });

    it("uses the default seed when none is provided and is reproducible", () => {
      const a = new RNG();
      const b = new RNG();
      for (let i = 0; i < 50; i++) {
        expect(a.next()).toBe(b.next());
      }
    });

    it("matches a fresh instance after consuming values (replayable)", () => {
      const a = new RNG(42);
      const consumed: number[] = [];
      for (let i = 0; i < 10; i++) consumed.push(a.next());

      const b = new RNG(42);
      for (let i = 0; i < 10; i++) {
        expect(b.next()).toBe(consumed[i]);
      }
    });

    it("makes int() deterministic for a fixed seed", () => {
      const a = new RNG(1337);
      const b = new RNG(1337);
      for (let i = 0; i < 100; i++) {
        expect(a.int(1, 100)).toBe(b.int(1, 100));
      }
    });

    it("makes chance() deterministic for a fixed seed", () => {
      const a = new RNG(1337);
      const b = new RNG(1337);
      for (let i = 0; i < 100; i++) {
        expect(a.chance(0.5)).toBe(b.chance(0.5));
      }
    });
  });

  describe("next()", () => {
    it("always returns a value in [0, 1)", () => {
      for (const seed of SEEDS) {
        const rng = new RNG(seed);
        for (let i = 0; i < SAMPLES; i++) {
          const v = rng.next();
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThan(1);
        }
      }
    });

    it("returns finite numbers", () => {
      const rng = new RNG(42);
      for (let i = 0; i < SAMPLES; i++) {
        expect(Number.isFinite(rng.next())).toBe(true);
      }
    });

    it("advances state so consecutive draws are not all identical", () => {
      const rng = new RNG(42);
      const first = rng.next();
      let changed = false;
      for (let i = 0; i < 20; i++) {
        if (rng.next() !== first) changed = true;
      }
      expect(changed).toBe(true);
    });

    it("spreads values across the unit interval", () => {
      const rng = new RNG(42);
      let low = false;
      let high = false;
      for (let i = 0; i < SAMPLES; i++) {
        const v = rng.next();
        if (v < 0.25) low = true;
        if (v >= 0.75) high = true;
      }
      expect(low).toBe(true);
      expect(high).toBe(true);
    });
  });

  describe("int(min, max)", () => {
    it("always returns integers within the inclusive range", () => {
      const rng = new RNG(42);
      for (let i = 0; i < SAMPLES; i++) {
        const v = rng.int(1, 6);
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(6);
      }
    });

    it("can hit both inclusive bounds over many samples", () => {
      const rng = new RNG(42);
      let sawMin = false;
      let sawMax = false;
      for (let i = 0; i < SAMPLES; i++) {
        const v = rng.int(1, 6);
        if (v === 1) sawMin = true;
        if (v === 6) sawMax = true;
        if (sawMin && sawMax) break;
      }
      expect(sawMin).toBe(true);
      expect(sawMax).toBe(true);
    });

    it("returns the single value when min === max", () => {
      const rng = new RNG(7);
      for (let i = 0; i < 100; i++) {
        expect(rng.int(5, 5)).toBe(5);
      }
    });

    it("handles negative ranges and stays within inclusive bounds", () => {
      const rng = new RNG(99);
      let sawMin = false;
      let sawMax = false;
      for (let i = 0; i < SAMPLES; i++) {
        const v = rng.int(-3, 3);
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(-3);
        expect(v).toBeLessThanOrEqual(3);
        if (v === -3) sawMin = true;
        if (v === 3) sawMax = true;
      }
      expect(sawMin).toBe(true);
      expect(sawMax).toBe(true);
    });

    it("never exceeds max because next() is < 1 (boundary)", () => {
      // Even if next() were near its supremum, floor keeps int() <= max.
      const rng = new RNG(0xffffffff);
      for (let i = 0; i < SAMPLES; i++) {
        expect(rng.int(0, 1)).toBeLessThanOrEqual(1);
      }
    });

    it("covers every value in a small range over many samples", () => {
      const rng = new RNG(2024);
      const seen = new Set<number>();
      for (let i = 0; i < SAMPLES; i++) {
        seen.add(rng.int(0, 9));
      }
      for (let n = 0; n <= 9; n++) {
        expect(seen.has(n)).toBe(true);
      }
    });
  });

  describe("chance(p)", () => {
    it("never returns true when p = 0", () => {
      const rng = new RNG(42);
      for (let i = 0; i < SAMPLES; i++) {
        expect(rng.chance(0)).toBe(false);
      }
    });

    it("always returns true when p = 1", () => {
      const rng = new RNG(42);
      for (let i = 0; i < SAMPLES; i++) {
        expect(rng.chance(1)).toBe(true);
      }
    });

    it("returns both true and false for an intermediate probability", () => {
      const rng = new RNG(42);
      let trues = 0;
      let falses = 0;
      for (let i = 0; i < SAMPLES; i++) {
        if (rng.chance(0.5)) trues++;
        else falses++;
      }
      expect(trues).toBeGreaterThan(0);
      expect(falses).toBeGreaterThan(0);
    });

    it("roughly tracks the requested probability over many samples", () => {
      const rng = new RNG(12345);
      let hits = 0;
      for (let i = 0; i < SAMPLES; i++) {
        if (rng.chance(0.3)) hits++;
      }
      const rate = hits / SAMPLES;
      // Generous band; just guarding against a wildly broken distribution.
      expect(rate).toBeGreaterThan(0.2);
      expect(rate).toBeLessThan(0.4);
    });

    it("is monotonic-ish: higher p yields at least as many hits on the same stream", () => {
      const lowRng = new RNG(555);
      const highRng = new RNG(555);
      let lowHits = 0;
      let highHits = 0;
      for (let i = 0; i < SAMPLES; i++) {
        // Same underlying draw because identical seed + same call order.
        if (lowRng.chance(0.1)) lowHits++;
        if (highRng.chance(0.9)) highHits++;
      }
      expect(highHits).toBeGreaterThanOrEqual(lowHits);
    });
  });
});
