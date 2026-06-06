const STORAGE_KEY_TEXT_SCALE = "ashen-text-scale";
const STORAGE_KEY_HIGH_CONTRAST = "ashen-high-contrast";
const STORAGE_KEY_REDUCED_MOTION = "ashen-reduced-motion";

export type TextScale = "normal" | "large" | "larger";

const TEXT_SCALE_FACTORS: Record<TextScale, number> = {
  normal: 1.0,
  large: 1.15,
  larger: 1.3,
};

const VALID_SCALES: TextScale[] = ["normal", "large", "larger"];

let textScale: TextScale = readStoredTextScale();
let highContrast: boolean = readStoredHighContrast();
let reducedMotion: boolean = readStoredReducedMotion();

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readStoredTextScale(): TextScale {
  try {
    const raw = storage()?.getItem(STORAGE_KEY_TEXT_SCALE);
    if (raw && (VALID_SCALES as string[]).includes(raw)) return raw as TextScale;
    return "normal";
  } catch {
    return "normal";
  }
}

function writeStoredTextScale(value: TextScale): void {
  try {
    storage()?.setItem(STORAGE_KEY_TEXT_SCALE, value);
  } catch {
    // localStorage can be unavailable in private mode; in-memory state still works.
  }
}

function readStoredHighContrast(): boolean {
  try {
    return storage()?.getItem(STORAGE_KEY_HIGH_CONTRAST) === "true";
  } catch {
    return false;
  }
}

function writeStoredHighContrast(value: boolean): void {
  try {
    storage()?.setItem(STORAGE_KEY_HIGH_CONTRAST, value ? "true" : "false");
  } catch {
    // localStorage can be unavailable in private mode; in-memory state still works.
  }
}

/** True if the OS asks software to minimize non-essential motion. */
function systemPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function readStoredReducedMotion(): boolean {
  try {
    const raw = storage()?.getItem(STORAGE_KEY_REDUCED_MOTION);
    // No explicit choice yet: honour the OS preference as the default.
    if (raw === null || raw === undefined) return systemPrefersReducedMotion();
    return raw === "true";
  } catch {
    return systemPrefersReducedMotion();
  }
}

function writeStoredReducedMotion(value: boolean): void {
  try {
    storage()?.setItem(STORAGE_KEY_REDUCED_MOTION, value ? "true" : "false");
  } catch {
    // localStorage can be unavailable in private mode; in-memory state still works.
  }
}

export function getTextScale(): TextScale {
  return textScale;
}

export function setTextScale(value: TextScale): void {
  const safe: TextScale = (VALID_SCALES as string[]).includes(value) ? value : "normal";
  textScale = safe;
  writeStoredTextScale(safe);
  applyTextScale();
}

export function applyTextScale(): void {
  if (typeof document === "undefined") return;
  const factor = TEXT_SCALE_FACTORS[textScale];
  document.documentElement.style.setProperty("--ui-scale", String(factor));
}

export function isHighContrast(): boolean {
  return highContrast;
}

export function setHighContrast(value: boolean): void {
  highContrast = value;
  writeStoredHighContrast(value);
  applyHighContrast();
}

export function applyHighContrast(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("high-contrast", highContrast);
}

export function prefersReducedMotion(): boolean {
  return reducedMotion;
}

export function setReducedMotion(value: boolean): void {
  reducedMotion = value;
  writeStoredReducedMotion(value);
  applyReducedMotion();
}

export function applyReducedMotion(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("reduced-motion", reducedMotion);
}

/** Apply both settings. Call once at startup so saved preferences take effect. */
export function applyAccessibility(): void {
  applyTextScale();
  applyHighContrast();
  applyReducedMotion();
}
