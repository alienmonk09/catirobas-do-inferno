import { describe, it, expect } from "vitest";
import { isPan } from "../src/engine/input";

describe("isPan (drag vs tap disambiguation)", () => {
  it("tap: small movement is a click", () => {
    expect(isPan({ x: 100, y: 100 }, { x: 103, y: 101 })).toBe(false);
  });
  it("pan: movement past threshold is a drag", () => {
    expect(isPan({ x: 100, y: 100 }, { x: 100, y: 120 })).toBe(true);
  });
  it("exactly at threshold counts as a pan", () => {
    expect(isPan({ x: 100, y: 100 }, { x: 105, y: 100 })).toBe(true);
  });
  it("returns to origin still counts as pan when peak exceeded (caller tracks peak)", () => {
    expect(isPan({ x: 100, y: 100 }, { x: 100, y: 100 }, 20)).toBe(true);
  });
  it("peak below threshold is a tap even if it wobbled", () => {
    expect(isPan({ x: 100, y: 100 }, { x: 100, y: 100 }, 3)).toBe(false);
  });
});
