/** Variables for string interpolation. Values are coerced to string at render time. */
export type TVars = Record<string, string | number>;

/** Supported locale identifiers. Only PT-BR exists now; future locales extend this. */
export type Locale = "pt-BR";