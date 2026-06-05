import { describe, expect, it } from "vitest";
import {
  startMusic,
  stopMusic,
  beatsToSeconds,
  themeDuration,
  THEME_BATTLE,
  THEME_CAMP,
  THEME_VICTORY,
} from "../src/engine/music";

// All tests run in the node environment (no window / AudioContext available).
// Every music function must be a safe no-op and never throw.

describe("music engine — node-safe no-ops", () => {
  it("startMusic does not throw in node env (no window)", () => {
    expect(() => startMusic("battle")).not.toThrow();
    expect(() => startMusic("camp")).not.toThrow();
    expect(() => startMusic("victory")).not.toThrow();
  });

  it("stopMusic does not throw when nothing is playing", () => {
    expect(() => stopMusic()).not.toThrow();
  });

  it("stopMusic does not throw after startMusic", () => {
    startMusic("battle");
    expect(() => stopMusic()).not.toThrow();
  });

  it("calling startMusic twice in a row does not throw", () => {
    expect(() => {
      startMusic("camp");
      startMusic("battle");
    }).not.toThrow();
  });

  it("calling stopMusic multiple times does not throw", () => {
    expect(() => {
      stopMusic();
      stopMusic();
      stopMusic();
    }).not.toThrow();
  });

  it("arbitrary start/stop sequence does not throw", () => {
    expect(() => {
      startMusic("battle");
      stopMusic();
      startMusic("camp");
      startMusic("victory");
      stopMusic();
      stopMusic();
    }).not.toThrow();
  });
});

describe("beatsToSeconds — pure calculation", () => {
  it("converts 1 beat at 60 bpm to 1 second", () => {
    expect(beatsToSeconds(1, 60)).toBeCloseTo(1, 10);
  });

  it("converts 2 beats at 120 bpm to 1 second", () => {
    expect(beatsToSeconds(2, 120)).toBeCloseTo(1, 10);
  });

  it("converts 4 beats at 44 bpm to ~5.45 seconds", () => {
    expect(beatsToSeconds(4, 44)).toBeCloseTo((4 / 44) * 60, 8);
  });

  it("scales linearly with beat count", () => {
    const bpm = 80;
    expect(beatsToSeconds(2, bpm)).toBeCloseTo(beatsToSeconds(1, bpm) * 2, 10);
  });

  it("scales inversely with bpm", () => {
    const beats = 3;
    expect(beatsToSeconds(beats, 120)).toBeCloseTo(beatsToSeconds(beats, 60) / 2, 10);
  });
});

describe("themeDuration — pure calculation", () => {
  it("THEME_BATTLE total duration is positive", () => {
    expect(themeDuration(THEME_BATTLE)).toBeGreaterThan(0);
  });

  it("THEME_CAMP total duration is positive", () => {
    expect(themeDuration(THEME_CAMP)).toBeGreaterThan(0);
  });

  it("THEME_VICTORY total duration is positive", () => {
    expect(themeDuration(THEME_VICTORY)).toBeGreaterThan(0);
  });

  it("THEME_BATTLE has expected duration (8 beats @ 44 bpm ≈ 10.9 s)", () => {
    const expected = (8 / 44) * 60;
    expect(themeDuration(THEME_BATTLE)).toBeCloseTo(expected, 4);
  });

  it("THEME_CAMP has expected duration (8 beats @ 40 bpm = 12 s)", () => {
    const expected = (8 / 40) * 60;
    expect(themeDuration(THEME_CAMP)).toBeCloseTo(expected, 4);
  });

  it("THEME_VICTORY total beat count sums correctly", () => {
    // Groups: 1.5 + 1.5 + 1.5 + 2.5 = 7 beats @ 76 bpm
    const expected = (7 / 76) * 60;
    expect(themeDuration(THEME_VICTORY)).toBeCloseTo(expected, 4);
  });
});

describe("theme data integrity", () => {
  it("all themes have at least one group", () => {
    expect(THEME_BATTLE.groups.length).toBeGreaterThan(0);
    expect(THEME_CAMP.groups.length).toBeGreaterThan(0);
    expect(THEME_VICTORY.groups.length).toBeGreaterThan(0);
  });

  it("all groups in every theme have at least one note", () => {
    for (const theme of [THEME_BATTLE, THEME_CAMP, THEME_VICTORY]) {
      for (const group of theme.groups) {
        expect(group.notes.length).toBeGreaterThan(0);
      }
    }
  });

  it("all note frequencies are positive finite numbers", () => {
    for (const theme of [THEME_BATTLE, THEME_CAMP, THEME_VICTORY]) {
      for (const group of theme.groups) {
        for (const freq of group.notes) {
          expect(Number.isFinite(freq)).toBe(true);
          expect(freq).toBeGreaterThan(0);
        }
      }
    }
  });

  it("all beat durations are positive", () => {
    for (const theme of [THEME_BATTLE, THEME_CAMP, THEME_VICTORY]) {
      for (const group of theme.groups) {
        expect(group.durBeats).toBeGreaterThan(0);
      }
    }
  });

  it("battle and camp themes loop; victory does not", () => {
    expect(THEME_BATTLE.loop).toBe(true);
    expect(THEME_CAMP.loop).toBe(true);
    expect(THEME_VICTORY.loop).toBe(false);
  });

  it("theme ids match their object property", () => {
    expect(THEME_BATTLE.id).toBe("battle");
    expect(THEME_CAMP.id).toBe("camp");
    expect(THEME_VICTORY.id).toBe("victory");
  });
});
