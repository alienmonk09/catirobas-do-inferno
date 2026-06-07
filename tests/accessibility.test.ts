import { describe, expect, it, beforeEach } from "vitest";
import {
  getTextScale,
  setTextScale,
  isHighContrast,
  setHighContrast,
  prefersReducedMotion,
  setReducedMotion,
  applyTextScale,
  applyHighContrast,
  applyReducedMotion,
  applyAccessibility,
  type TextScale,
} from "../src/engine/accessibility";

// All tests run in the node environment — no window / document available.
// Every function must be a safe no-op and return sane defaults without throwing.

describe("accessibility — module import", () => {
  it("importing the module does not throw", () => {
    expect(typeof getTextScale).toBe("function");
    expect(typeof setTextScale).toBe("function");
    expect(typeof isHighContrast).toBe("function");
    expect(typeof setHighContrast).toBe("function");
    expect(typeof applyTextScale).toBe("function");
    expect(typeof applyHighContrast).toBe("function");
    expect(typeof applyAccessibility).toBe("function");
  });
});

describe("accessibility — text scale", () => {
  beforeEach(() => {
    setTextScale("normal");
  });

  it("getTextScale default is 'normal'", () => {
    setTextScale("normal");
    expect(getTextScale()).toBe("normal");
  });

  it("setTextScale round-trips 'normal'", () => {
    setTextScale("normal");
    expect(getTextScale()).toBe("normal");
  });

  it("setTextScale round-trips 'large'", () => {
    setTextScale("large");
    expect(getTextScale()).toBe("large");
  });

  it("setTextScale round-trips 'larger'", () => {
    setTextScale("larger");
    expect(getTextScale()).toBe("larger");
  });

  it("setTextScale clamps unknown value to 'normal'", () => {
    setTextScale("huge" as TextScale);
    expect(getTextScale()).toBe("normal");
  });

  it("setTextScale does not throw in node env (no document)", () => {
    expect(() => setTextScale("large")).not.toThrow();
    expect(() => setTextScale("larger")).not.toThrow();
    expect(() => setTextScale("normal")).not.toThrow();
  });

  it("applyTextScale is a safe no-op without a document", () => {
    expect(() => applyTextScale()).not.toThrow();
  });
});

describe("accessibility — high contrast", () => {
  beforeEach(() => {
    setHighContrast(false);
  });

  it("isHighContrast default is false", () => {
    setHighContrast(false);
    expect(isHighContrast()).toBe(false);
  });

  it("setHighContrast round-trips: false → true → false", () => {
    setHighContrast(false);
    expect(isHighContrast()).toBe(false);

    setHighContrast(true);
    expect(isHighContrast()).toBe(true);

    setHighContrast(false);
    expect(isHighContrast()).toBe(false);
  });

  it("setHighContrast does not throw in node env (no document)", () => {
    expect(() => setHighContrast(true)).not.toThrow();
    expect(() => setHighContrast(false)).not.toThrow();
  });

  it("applyHighContrast is a safe no-op without a document", () => {
    expect(() => applyHighContrast()).not.toThrow();
  });
});

describe("accessibility — reduced motion", () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

  it("prefersReducedMotion default is false in node (no matchMedia)", () => {
    setReducedMotion(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("setReducedMotion round-trips: false → true → false", () => {
    setReducedMotion(false);
    expect(prefersReducedMotion()).toBe(false);

    setReducedMotion(true);
    expect(prefersReducedMotion()).toBe(true);

    setReducedMotion(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("setReducedMotion does not throw in node env (no document)", () => {
    expect(() => setReducedMotion(true)).not.toThrow();
    expect(() => setReducedMotion(false)).not.toThrow();
  });

  it("applyReducedMotion is a safe no-op without a document", () => {
    expect(() => applyReducedMotion()).not.toThrow();
  });
});

describe("accessibility — applyAccessibility", () => {
  it("applyAccessibility is a safe no-op without a document", () => {
    expect(() => applyAccessibility()).not.toThrow();
  });

  it("applyAccessibility applies both scale and contrast state without throwing", () => {
    setTextScale("larger");
    setHighContrast(true);
    expect(() => applyAccessibility()).not.toThrow();
    // State survives the call
    expect(getTextScale()).toBe("larger");
    expect(isHighContrast()).toBe(true);
    // Restore
    setTextScale("normal");
    setHighContrast(false);
  });
});
