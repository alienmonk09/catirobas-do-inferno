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
// Music-only mute — persisted separately from the global master mute.
// ---------------------------------------------------------------------------

const STORAGE_KEY_MUSIC_MUTED = "catirobas-music-muted";

function musicStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readStoredMusicMuted(): boolean {
  try {
    return musicStorage()?.getItem(STORAGE_KEY_MUSIC_MUTED) === "true";
  } catch {
    return false;
  }
}

function writeStoredMusicMuted(value: boolean): void {
  try {
    musicStorage()?.setItem(STORAGE_KEY_MUSIC_MUTED, value ? "true" : "false");
  } catch {
    // localStorage can be unavailable in private mode; in-memory state still works.
  }
}

let musicMuted = readStoredMusicMuted();

export function isMusicMuted(): boolean {
  return musicMuted;
}

export function setMusicMuted(value: boolean): void {
  musicMuted = value;
  writeStoredMusicMuted(value);
  if (value && running) {
    stopMusic();
  }
}

export function toggleMusicMuted(): boolean {
  setMusicMuted(!musicMuted);
  return musicMuted;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One beat-group in a theme: simultaneous notes plus how many beats it lasts. */
export interface BeatGroup {
  /** Frequencies (Hz) played in parallel. */
  notes: number[];
  /** Duration in beats (resolved against the theme's BPM). */
  durBeats: number;
  /** Oscillator type — defaults to "sine" when omitted. */
  waveType?: OscillatorType;
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
// A minor / C major / D minor family — all consonant, no tritones.
const N = {
  A3: 57, C4: 60, E4: 64, G4: 67,
  A4: 69, C5: 72, E5: 76, G5: 79,
  D4: 62, F4: 65, B3: 59, B4: 71,
  F3: 53, D5: 74,
  D3: 50, F2: 41, A2: 45, C3: 48, E3: 52, G3: 55,
  G2: 43,
  // Jazz extensions for camp theme
  Bb3: 58, D4_: 62, F4_: 65, A3_: 57,
  Bb4: 70, Eb4: 63, B2: 47, E2: 40,
  // Synthwave highs for title + desert
  C6: 84, D6: 86, E6: 88, G6: 91, A5: 81, B5: 83,
  // Low bass for dark/volcano theme
  C2: 36, D2: 38, E2b: 39, F2_: 41, G2_: 43,
};

/** Theme: "battle" — GDD: "Sons naturais com sintetizadores" (Floresta). 8 beats @ 44 BPM ≈ 10.9 s. */
export const THEME_BATTLE: ThemeDef = {
  id: "battle",
  bpm: 44,
  loop: true,
  groups: [
    { notes: [midiToHz(N.A3), midiToHz(N.E4), midiToHz(N.A4)], durBeats: 2, waveType: "triangle" },
    { notes: [midiToHz(N.G4), midiToHz(N.D4), midiToHz(N.B3)], durBeats: 2, waveType: "sine" },
    { notes: [midiToHz(N.F3), midiToHz(N.C4), midiToHz(N.A4)], durBeats: 2, waveType: "triangle" },
    { notes: [midiToHz(N.E4), midiToHz(N.B3), midiToHz(N.G4)], durBeats: 2, waveType: "sawtooth" },
  ],
};

/**
 * Theme: "battle_driving" — GDD: "Vento solitário + synthwave" (Deserto).
 * 8 beats @ 52 BPM ≈ 9.2 s, looping. Sawtooth chords for synthwave character.
 */
export const THEME_BATTLE_DRIVING: ThemeDef = {
  id: "battle_driving",
  bpm: 52,
  loop: true,
  groups: [
    { notes: [midiToHz(N.D3), midiToHz(N.A3), midiToHz(N.D4)], durBeats: 2, waveType: "sawtooth" },
    { notes: [midiToHz(N.F3), midiToHz(N.C4), midiToHz(N.F4)], durBeats: 2, waveType: "sawtooth" },
    { notes: [midiToHz(N.C3), midiToHz(N.G3), midiToHz(N.E4)], durBeats: 2, waveType: "square" },
    { notes: [midiToHz(N.A2), midiToHz(N.E3), midiToHz(N.A3)], durBeats: 2, waveType: "sawtooth" },
  ],
};

/**
 * Theme: "battle_dark" — GDD: "Drums intensos + synth escalante" (Vulcão) / "Epic 80s hair metal" (Boss).
 * 10 beats @ 38 BPM ≈ 15.8 s, looping. Low square bass + soaring sawtooth leads.
 */
export const THEME_BATTLE_DARK: ThemeDef = {
  id: "battle_dark",
  bpm: 38,
  loop: true,
  groups: [
    { notes: [midiToHz(N.D3), midiToHz(N.F3), midiToHz(N.A3)], durBeats: 3, waveType: "square" },
    { notes: [midiToHz(N.A2), midiToHz(N.D3), midiToHz(N.F3)], durBeats: 2, waveType: "sawtooth" },
    { notes: [midiToHz(N.C3), midiToHz(N.E3), midiToHz(N.G3)], durBeats: 3, waveType: "square" },
    { notes: [midiToHz(N.D3), midiToHz(N.A3), midiToHz(N.D4)], durBeats: 2, waveType: "sawtooth" },
  ],
};

/** Theme: "camp" — GDD: "Jazz lounge deprimido" (Taverna). 8 beats @ 40 BPM ≈ 12 s. */
export const THEME_CAMP: ThemeDef = {
  id: "camp",
  bpm: 40,
  loop: true,
  groups: [
    { notes: [midiToHz(N.C4), midiToHz(N.E4), midiToHz(N.G4)], durBeats: 2, waveType: "sine" },
    { notes: [midiToHz(N.A3), midiToHz(N.C4), midiToHz(N.E4)], durBeats: 2, waveType: "triangle" },
    { notes: [midiToHz(N.F3), midiToHz(N.A3), midiToHz(N.C4)], durBeats: 2, waveType: "sine" },
    { notes: [midiToHz(N.G4), midiToHz(N.B3), midiToHz(N.D4)], durBeats: 2, waveType: "triangle" },
  ],
};

/** Theme: "victory" — GDD: ironic victory stinger. 7 beats @ 76 BPM ≈ 5.5 s, non-looping. */
export const THEME_VICTORY: ThemeDef = {
  id: "victory",
  bpm: 76,
  loop: false,
  groups: [
    { notes: [midiToHz(N.C4), midiToHz(N.E4), midiToHz(N.G4)], durBeats: 1.5, waveType: "triangle" },
    { notes: [midiToHz(N.F3), midiToHz(N.A3), midiToHz(N.C4)], durBeats: 1.5, waveType: "sawtooth" },
    { notes: [midiToHz(N.G4), midiToHz(N.B3), midiToHz(N.D5)], durBeats: 1.5, waveType: "triangle" },
    { notes: [midiToHz(N.C5), midiToHz(N.E5), midiToHz(N.G5)], durBeats: 2.5, waveType: "square" },
  ],
};

/** Theme: "title" — GDD: "Synthwave retrô" (Tema Principal). 8 beats @ 60 BPM ≈ 8 s, looping. */
export const THEME_TITLE: ThemeDef = {
  id: "title",
  bpm: 60,
  loop: true,
  groups: [
    { notes: [midiToHz(N.A3), midiToHz(N.E4), midiToHz(N.A4)], durBeats: 2, waveType: "sawtooth" },
    { notes: [midiToHz(N.F3), midiToHz(N.C4), midiToHz(N.F4)], durBeats: 2, waveType: "sawtooth" },
    { notes: [midiToHz(N.C3), midiToHz(N.G3), midiToHz(N.C4)], durBeats: 2, waveType: "square" },
    { notes: [midiToHz(N.G2), midiToHz(N.D4), midiToHz(N.G4)], durBeats: 2, waveType: "sawtooth" },
  ],
};

const THEMES: Record<string, ThemeDef> = {
  battle: THEME_BATTLE,
  battle_driving: THEME_BATTLE_DRIVING,
  battle_dark: THEME_BATTLE_DARK,
  camp: THEME_CAMP,
  victory: THEME_VICTORY,
  title: THEME_TITLE,
};

export type ThemeId = "battle" | "battle_driving" | "battle_dark" | "camp" | "victory" | "title";

// ---------------------------------------------------------------------------
// Chapter → battle theme resolver
// ---------------------------------------------------------------------------

/**
 * Return the appropriate battle theme for a given phase index (0-based).
 * Pure function — deterministic, no side effects.
 *
 * Phase order (from PHASES in src/data/maps/index.ts):
 *   0 — tavernaDoLamento       (tutorial)
 *   1 — florestaDaRejeicao     (early — forest)
 *   2 — desertoDoEsquecimento  (mid — desert, confusion)
 *   3 — cavernaDoConstrangimento (mid — cave, magic intro)
 *   4 — vulcaoDaVerdade        (late — volcano, high stakes)
 *   5 — monteMacheza           (finale — boss, dark)
 */
export function battleThemeForPhase(phaseIndex: number): ThemeId {
  if (phaseIndex >= 4) return "battle_dark";        // Vulcão + Monte Macheza — dark/heavy
  if (phaseIndex >= 2) return "battle_driving";     // Deserto + Caverna — momentum
  return "battle";                                  // Taverna + Floresta (and default)
}

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
/** Oscillators scheduled by the active loop, so stopMusic can hard-stop them. */
let voices: OscillatorNode[] = [];
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

      osc.type = group.waveType ?? "sine";
      osc.frequency.setValueAtTime(freq, t);

      vGain.gain.setValueAtTime(0.0001, t);
      vGain.gain.linearRampToValueAtTime(VOICE_GAIN, t + attack);
      vGain.gain.setValueAtTime(VOICE_GAIN, sustainEnd);
      vGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(vGain);
      vGain.connect(gain);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      voices.push(osc);
      osc.onended = () => {
        osc.disconnect();
        vGain.disconnect();
        voices = voices.filter((v) => v !== osc);
      };
    }

    t += dur;
  }

  return t; // end time
}

function scheduleLoop(theme: ThemeDef): void {
  if (!running || currentTheme !== theme) return;
  if (isMuted() || isMusicMuted()) {
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
  if (isMuted() || isMusicMuted()) {
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

  // Take the currently-scheduled voices; the new theme (started after this) will
  // push its own, so we only ever stop the OLD ones below.
  const stopping = voices;
  voices = [];
  const stopVoices = () => {
    for (const osc of stopping) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        /* already ended */
      }
    }
  };

  // Soft fade-out of musicGain so in-flight voices don't click, THEN hard-stop the
  // pre-scheduled voices and restore the gain — otherwise queued oscillators ring
  // back audibly when the gain is restored.
  const c = getAudioContext();
  if (c && musicGainNode) {
    musicGainNode.gain.cancelScheduledValues(c.currentTime);
    musicGainNode.gain.setValueAtTime(musicGainNode.gain.value, c.currentTime);
    musicGainNode.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.2);
    setTimeout(() => {
      stopVoices();
      if (musicGainNode) musicGainNode.gain.value = MUSIC_GAIN;
    }, 220);
  } else {
    stopVoices();
  }
}
