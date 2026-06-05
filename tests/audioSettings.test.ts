import { describe, expect, it, beforeEach } from "vitest";
import {
  getVolume,
  setVolume,
  isMuted,
  setMuted,
} from "../src/engine/audio";
import {
  isMusicMuted,
  setMusicMuted,
  toggleMusicMuted,
  startMusic,
  stopMusic,
} from "../src/engine/music";

// All tests run in the node environment — no window / AudioContext available.
// Every function must be a safe no-op and return sane values without throwing.

describe("audio settings — volume", () => {
  beforeEach(() => {
    // Reset to a known state before each test.
    setVolume(0.7);
  });

  it("importing audio module does not throw", () => {
    // The module is already loaded (imported at the top of this file);
    // this test just confirms the module-level code is node-safe.
    expect(typeof getVolume).toBe("function");
    expect(typeof setVolume).toBe("function");
  });

  it("getVolume returns a number in [0, 1]", () => {
    const v = getVolume();
    expect(typeof v).toBe("number");
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  });

  it("getVolume default is 0.7", () => {
    setVolume(0.7);
    expect(getVolume()).toBeCloseTo(0.7, 10);
  });

  it("setVolume round-trips a value within [0, 1]", () => {
    setVolume(0.5);
    expect(getVolume()).toBeCloseTo(0.5, 10);

    setVolume(1.0);
    expect(getVolume()).toBeCloseTo(1.0, 10);

    setVolume(0.0);
    expect(getVolume()).toBeCloseTo(0.0, 10);
  });

  it("setVolume clamps values above 1 to 1", () => {
    setVolume(1.5);
    expect(getVolume()).toBeCloseTo(1.0, 10);
  });

  it("setVolume clamps negative values to 0", () => {
    setVolume(-0.3);
    expect(getVolume()).toBeCloseTo(0.0, 10);
  });

  it("setVolume does not throw in node env (no AudioContext)", () => {
    expect(() => setVolume(0.8)).not.toThrow();
  });
});

describe("audio settings — music mute", () => {
  beforeEach(() => {
    setMusicMuted(false);
  });

  it("isMusicMuted returns a boolean", () => {
    expect(typeof isMusicMuted()).toBe("boolean");
  });

  it("setMusicMuted round-trips: false → true → false", () => {
    setMusicMuted(false);
    expect(isMusicMuted()).toBe(false);

    setMusicMuted(true);
    expect(isMusicMuted()).toBe(true);

    setMusicMuted(false);
    expect(isMusicMuted()).toBe(false);
  });

  it("toggleMusicMuted flips the state and returns new value", () => {
    setMusicMuted(false);
    expect(toggleMusicMuted()).toBe(true);
    expect(isMusicMuted()).toBe(true);

    expect(toggleMusicMuted()).toBe(false);
    expect(isMusicMuted()).toBe(false);
  });

  it("setMusicMuted does not throw in node env", () => {
    expect(() => setMusicMuted(true)).not.toThrow();
    expect(() => setMusicMuted(false)).not.toThrow();
  });

  it("toggleMusicMuted does not throw in node env", () => {
    expect(() => toggleMusicMuted()).not.toThrow();
  });
});

describe("audio settings — node-safe no-ops", () => {
  it("isMuted/setMuted work without window", () => {
    setMuted(false);
    expect(isMuted()).toBe(false);
    setMuted(true);
    expect(isMuted()).toBe(true);
    setMuted(false);
  });

  it("music remains silent (no throw) when master muted", () => {
    setMuted(true);
    expect(() => startMusic("battle")).not.toThrow();
    expect(() => stopMusic()).not.toThrow();
    setMuted(false);
  });

  it("music remains silent (no throw) when music muted", () => {
    setMusicMuted(true);
    expect(() => startMusic("battle")).not.toThrow();
    expect(() => stopMusic()).not.toThrow();
    setMusicMuted(false);
  });

  it("music remains silent (no throw) when both mutes are active", () => {
    setMuted(true);
    setMusicMuted(true);
    expect(() => startMusic("camp")).not.toThrow();
    expect(() => stopMusic()).not.toThrow();
    setMuted(false);
    setMusicMuted(false);
  });
});
