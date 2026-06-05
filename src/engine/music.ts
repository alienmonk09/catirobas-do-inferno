/**
 * Music engine — gentle WebAudio pads, no audio files.
 *
 * Architecture:
 *  • Shares the AudioContext and master GainNode from audio.ts.
 *  • Routes all music through a dedicated `musicGain` (value 0.12) that
 *    feeds into master, so music sits well under SFX.
 *  • Each theme is a short chord/note progression (pure data) that loops.
 *  • A look-ahead scheduler fires ~0.2 s before the end of each loop
 *    iteration so the next round of oscillators is scheduled with no gap.
 *  • Stopping cancels the timer and lets current voices decay naturally.
 *  • Every public export is a safe no-op in Node / test environments where
 *    window / AudioContext are unavailable.
 */

import { getAudioContext, getMasterGain, isMuted } from "./audio";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One beat-group in a theme: simultaneous notes plus how many beats it lasts. */
export interface BeatGroup {
  /** Frequencies (Hz) played in parallel. */
  notes: number[];
  /** Duration in beats (resolved against the theme's BPM). */
  durBeats: number;
}

export interface ThemeDef {
  id: string;
  /** Beats per minute — kept low for a gentle feel. */
  bpm: number;
  loop: boolean;
  groups: BeatGroup[];
}

// ---------------------------------------------------------------------------
// Theme data — A-minor / C-major family, slow pads
// ---------------------------------------------------------------------------

/**
 * Convert beats → seconds given a BPM.
 * Exported so tests can verify the calculation without any audio context.
 */
export function beatsToSeconds(beats: number, bpm: number): number {
  return (beats / bpm) * 60;
}

/**
 * Total duration in seconds for a theme definition.
 * Exported for tests.
 */
export function themeDuration(theme: ThemeDef): number {
  return theme.groups.reduce((sum, g) => sum + beatsToSeconds(g.durBeats, theme.bpm), 0);
}

// Helper: note → frequency (A4 = 440 Hz).  Duplicated here so music.ts has
// no circular dependency risk; the formula is trivially correct.
function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

// MIDI note numbers for common pitches used in the themes.
// A minor / C major — all consonant, no tritones.
const N = {
  A3: 57, C4: 60, E4: 64, G4: 67,
  A4: 69, C5: 72, E5: 76, G5: 79,
  D4: 62, F4: 65, B3: 59, B4: 71,
  F3: 53, D5: 74,
};

/** Theme: "battle" — slow, slightly tense Am pad. 8 beats @ 44 BPM ≈ 10.9 s. */
export const THEME_BATTLE: ThemeDef = {
  id: "battle",
  bpm: 44,
  loop: true,
  groups: [
    // Am (i)
    { notes: [midiToHz(N.A3), midiToHz(N.E4), midiToHz(N.A4)], durBeats: 2 },
    // G (VII)
    { notes: [midiToHz(N.G4), midiToHz(N.D4), midiToHz(N.B3)], durBeats: 2 },
    // F (VI)
    { notes: [midiToHz(N.F3), midiToHz(N.C4), midiToHz(N.A4)], durBeats: 2 },
    // Em (v) — leads back to Am
    { notes: [midiToHz(N.E4), midiToHz(N.B3), midiToHz(N.G4)], durBeats: 2 },
  ],
};

/** Theme: "camp" — warm, calm C-major pad. 8 beats @ 40 BPM ≈ 12 s. */
export const THEME_CAMP: ThemeDef = {
  id: "camp",
  bpm: 40,
  loop: true,
  groups: [
    // C (I)
    { notes: [midiToHz(N.C4), midiToHz(N.E4), midiToHz(N.G4)], durBeats: 2 },
    // Am (vi)
    { notes: [midiToHz(N.A3), midiToHz(N.C4), midiToHz(N.E4)], durBeats: 2 },
    // F (IV)
    { notes: [midiToHz(N.F3), midiToHz(N.A3), midiToHz(N.C4)], durBeats: 2 },
    // G (V)
    { notes: [midiToHz(N.G4), midiToHz(N.B3), midiToHz(N.D4)], durBeats: 2 },
  ],
};

/** Theme: "victory" — bright short C-major cadence, non-looping. ~6 s. */
export const THEME_VICTORY: ThemeDef = {
  id: "victory",
  bpm: 76,
  loop: false,
  groups: [
    // C
    { notes: [midiToHz(N.C4), midiToHz(N.E4), midiToHz(N.G4)], durBeats: 1.5 },
    // F
    { notes: [midiToHz(N.F3), midiToHz(N.A3), midiToHz(N.C4)], durBeats: 1.5 },
    // G
    { notes: [midiToHz(N.G4), midiToHz(N.B3), midiToHz(N.D5)], durBeats: 1.5 },
    // C high — resolution
    { notes: [midiToHz(N.C5), midiToHz(N.E5), midiToHz(N.G5)], durBeats: 2.5 },
  ],
};

const THEMES: Record<string, ThemeDef> = {
  battle: THEME_BATTLE,
  camp: THEME_CAMP,
  victory: THEME_VICTORY,
};

export type ThemeId = "battle" | "camp" | "victory";

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** Dedicated gain for music — feeds into master. Value kept very low. */
const MUSIC_GAIN = 0.12;

/** Per-note gain so each voice is soft and never clips. */
const VOICE_GAIN = 0.018;

/** Look-ahead in seconds: schedule next loop iteration this far before the
 *  current one ends.  Short enough to feel seamless, long enough to avoid
 *  scheduling jitter. */
const LOOKAHEAD_S = 0.25;

let musicGainNode: GainNode | null = null;
let running = false;
let currentTheme: ThemeDef | null = null;
let loopTimer: ReturnType<typeof setTimeout> | null = null;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ensureMusicGain(c: AudioContext): GainNode {
  if (musicGainNode) return musicGainNode;
  const master = getMasterGain();
  if (!master) throw new Error("master gain unavailable");
  const g = c.createGain();
  g.gain.value = MUSIC_GAIN;
  g.connect(master);
  musicGainNode = g;
  return g;
}

/**
 * Schedule one full iteration of `theme` starting at `startTime` (AudioContext time).
 * Returns the absolute end time of this iteration.
 */
function scheduleIteration(c: AudioContext, theme: ThemeDef, startTime: number): number {
  const gain = ensureMusicGain(c);
  let t = startTime;

  for (const group of theme.groups) {
    const dur = beatsToSeconds(group.durBeats, theme.bpm);
    const attack = Math.min(0.08, dur * 0.15);
    const release = Math.min(0.35, dur * 0.4);
    const sustainEnd = t + dur - release;

    for (const freq of group.notes) {
      const osc = c.createOscillator();
      const vGain = c.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      // Soft attack → sustain → release envelope — zero-crossing aware, no clicks.
      vGain.gain.setValueAtTime(0.0001, t);
      vGain.gain.linearRampToValueAtTime(VOICE_GAIN, t + attack);
      vGain.gain.setValueAtTime(VOICE_GAIN, sustainEnd);
      vGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(vGain);
      vGain.connect(gain);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      osc.onended = () => {
        osc.disconnect();
        vGain.disconnect();
      };
    }

    t += dur;
  }

  return t; // end time
}

function scheduleLoop(theme: ThemeDef): void {
  if (!running || currentTheme !== theme) return;
  if (isMuted()) {
    // While muted, check again after the loop period and skip actual scheduling.
    const periodMs = themeDuration(theme) * 1000;
    loopTimer = setTimeout(() => scheduleLoop(theme), periodMs);
    return;
  }

  const c = getAudioContext();
  if (!c) return;
  if (c.state === "suspended") {
    void c.resume().catch(() => undefined);
  }

  const startTime = Math.max(c.currentTime, c.currentTime); // always "now" for first beat
  const endTime = scheduleIteration(c, theme, startTime);
  const loopDurationMs = (endTime - startTime) * 1000;

  if (theme.loop) {
    // Fire the next scheduling call LOOKAHEAD_S before the current iteration ends.
    const delayMs = Math.max(0, loopDurationMs - LOOKAHEAD_S * 1000);
    loopTimer = setTimeout(() => {
      if (!running || currentTheme !== theme) return;
      scheduleNextLoop(theme, endTime);
    }, delayMs);
  }
  // Non-looping themes (victory): no timer, voices play out and stop.
}

/**
 * Called by the look-ahead timer to schedule the *next* iteration.
 * `nextStart` is the AudioContext time at which the next iteration begins.
 */
function scheduleNextLoop(theme: ThemeDef, nextStart: number): void {
  if (!running || currentTheme !== theme) return;
  if (isMuted()) {
    const periodMs = themeDuration(theme) * 1000;
    loopTimer = setTimeout(() => scheduleLoop(theme), periodMs);
    return;
  }

  const c = getAudioContext();
  if (!c) return;
  if (c.state === "suspended") {
    void c.resume().catch(() => undefined);
  }

  const endTime = scheduleIteration(c, theme, nextStart);
  const loopDurationMs = (endTime - nextStart) * 1000;
  const delayMs = Math.max(0, loopDurationMs - LOOKAHEAD_S * 1000);

  loopTimer = setTimeout(() => {
    if (!running || currentTheme !== theme) return;
    scheduleNextLoop(theme, endTime);
  }, delayMs);
}

function clearLoopTimer(): void {
  if (loopTimer !== null) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start the named theme.  Stops any currently playing theme first.
 * Safe no-op when called in a non-browser environment or when AudioContext
 * is unavailable.
 */
export function startMusic(themeId: ThemeId): void {
  if (typeof window === "undefined") return;
  stopMusic();

  const theme = THEMES[themeId];
  if (!theme) return;

  currentTheme = theme;
  running = true;
  scheduleLoop(theme);
}

/**
 * Stop any currently playing music.  Clears scheduled loop timers; current
 * oscillator voices decay via their release envelopes (no abrupt cut).
 * Optionally ramps the musicGain down for a clean fade-out.
 */
export function stopMusic(): void {
  running = false;
  currentTheme = null;
  clearLoopTimer();

  // Soft fade-out of musicGain so in-flight voices don't click.
  const c = getAudioContext();
  if (c && musicGainNode) {
    musicGainNode.gain.cancelScheduledValues(c.currentTime);
    musicGainNode.gain.setValueAtTime(musicGainNode.gain.value, c.currentTime);
    musicGainNode.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.3);
    // Restore gain value for future startMusic calls after the fade.
    setTimeout(() => {
      if (musicGainNode) musicGainNode.gain.value = MUSIC_GAIN;
    }, 400);
  }
}
