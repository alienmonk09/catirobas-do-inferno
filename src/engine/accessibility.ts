const STORAGE_KEY_TEXT_SCALE = "ashen-text-scale";
const STORAGE_KEY_HIGH_CONTRAST = "ashen-high-contrast";

export type TextScale = "normal" | "large" | "larger";

const TEXT_SCALE_FACTORS: Record<TextScale, number> = {
  normal: 1.0,
  large: 1.15,
  larger: 1.3,
};

const VALID_SCALES: TextScale[] = ["normal", "large", "larger"];

let textScale: TextScale = readStoredTextScale();
let highContrast: boolean = readStoredHighContrast();

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

/** Apply both settings. Call once at startup so saved preferences take effect. */
export function applyAccessibility(): void {
  applyTextScale();
  applyHighContrast();
}
