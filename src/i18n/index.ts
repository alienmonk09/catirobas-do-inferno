/**
 * Minimal i18n runtime — zero runtime deps.
 *
 * The PT-BR catalog is the source of truth and the only locale for now.
 * Adding a locale is a 3-step process documented in `locales/pt-br.ts`.
 */

import { ptBr } from "./locales/pt-br";
import type { Locale, TVars } from "./types";

export type { Locale, TVars } from "./types";

export const SUPPORTED_LOCALES: Locale[] = ["pt-BR"];

const STORAGE_KEY = "catirobas-locale";

// Only one catalog for now; the map shape supports future locales.
const catalogs: Record<Locale, unknown> = {
  "pt-BR": ptBr,
};

let currentLocale: Locale = "pt-BR";

// Best-effort restore from localStorage (no-op in Node/test envs).
try {
  const saved = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (saved === "pt-BR") currentLocale = saved;
} catch {
  /* no localStorage available */
}

const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(l: Locale): void {
  if (l === currentLocale) return;
  currentLocale = l;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, l);
  } catch {
    /* no localStorage */
  }
  try {
    if (typeof document !== "undefined") document.documentElement.lang = l;
  } catch {
    /* no document */
  }
  for (const fn of listeners) fn();
}

export function onLocaleChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Walk a dot-separated path into a nested object; returns undefined on miss. */
function resolve(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** Replace `{{var}}` placeholders with values from `vars`. */
function interpolate(text: string, vars?: TVars): string {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
    const v = vars[k];
    return v !== undefined ? String(v) : `{{${k}}}`;
  });
}

/**
 * Translate a key to the current locale's string, interpolating `{{var}}`
 * placeholders from `vars`. Returns `"[key]"` when the key is missing,
 * and logs a dev-only warning so missing keys are caught early.
 */
export function t(key: string, vars?: TVars): string {
  const catalog = catalogs[currentLocale];
  const value = resolve(catalog, key);
  if (typeof value !== "string") {
    if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
      console.warn(`[i18n] missing key: ${key}`);
    }
    return `[${key}]`;
  }
  return interpolate(value, vars);
}

/**
 * Plural-aware translate. Uses `Intl.PluralRules` to select a sub-key
 * (`one` / `other` / etc.) under the given key, and passes `count` as a var.
 *
 * Example keys:
 *   "mvp.kills.one": "{{count}} abate"
 *   "mvp.kills.other": "{{count}} abates"
 */
export function tp(key: string, count: number, vars?: TVars): string {
  const plural = new Intl.PluralRules(currentLocale).select(count);
  const fullKey = `${key}.${plural}`;
  const allVars: TVars = { ...vars, count };
  return t(fullKey, allVars);
}