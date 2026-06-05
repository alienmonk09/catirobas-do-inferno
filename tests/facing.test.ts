import { describe, it, expect } from "vitest";
import { attackAngle, directionTo, dirVector } from "../src/battle/facing";

describe("dirVector", () => {
  it("maps cardinals to grid unit vectors", () => {
    expect(dirVector("n")).toEqual({ x: 0, y: -1 });
    expect(dirVector("s")).toEqual({ x: 0, y: 1 });
    expect(dirVector("e")).toEqual({ x: 1, y: 0 });
    expect(dirVector("w")).toEqual({ x: -1, y: 0 });
  });
});

describe("directionTo", () => {
  it("points along the dominant axis", () => {
    expect(directionTo({ x: 0, y: 0 }, { x: 5, y: 1 })).toBe("e");
    expect(directionTo({ x: 5, y: 5 }, { x: 0, y: 4 })).toBe("w");
    expect(directionTo({ x: 0, y: 0 }, { x: 1, y: 5 })).toBe("s");
    expect(directionTo({ x: 0, y: 5 }, { x: 1, y: 0 })).toBe("n");
  });

  it("favors the horizontal axis on an exact diagonal", () => {
    expect(directionTo({ x: 0, y: 0 }, { x: 2, y: 2 })).toBe("e");
    expect(directionTo({ x: 0, y: 0 }, { x: -2, y: 2 })).toBe("w");
  });

  it("returns a stable default when points coincide", () => {
    expect(directionTo({ x: 3, y: 3 }, { x: 3, y: 3 })).toBe("s");
  });

  it("derives a clean cardinal from a single orthogonal step", () => {
    expect(directionTo({ x: 4, y: 4 }, { x: 4, y: 3 })).toBe("n");
    expect(directionTo({ x: 4, y: 4 }, { x: 5, y: 4 })).toBe("e");
  });
});

describe("attackAngle", () => {
  // Defender at (5,5) facing south (toward +y).
  const D = { x: 5, y: 5 };

  it("is front when the attacker stands where the defender looks", () => {
    expect(attackAngle({ x: 5, y: 7 }, D, "s")).toBe("front"); // south of defender
  });

  it("is rear when the attacker is behind the defender", () => {
    expect(attackAngle({ x: 5, y: 3 }, D, "s")).toBe("rear"); // north of a south-facer
  });

  it("is flank when the attacker is perpendicular", () => {
    expect(attackAngle({ x: 7, y: 5 }, D, "s")).toBe("flank"); // due east of a south-facer
    expect(attackAngle({ x: 3, y: 5 }, D, "s")).toBe("flank"); // due west
  });

  it("respects the defender's facing", () => {
    expect(attackAngle({ x: 7, y: 5 }, D, "e")).toBe("front"); // facing east, hit from east
    expect(attackAngle({ x: 3, y: 5 }, D, "e")).toBe("rear"); // facing east, hit from west
    expect(attackAngle({ x: 5, y: 3 }, D, "e")).toBe("flank");
  });

  it("treats a diagonal toward the back hemisphere as rear", () => {
    // Defender faces north; an attacker to the south-east is in the rear hemisphere.
    expect(attackAngle({ x: 6, y: 6 }, D, "n")).toBe("rear");
  });
});
