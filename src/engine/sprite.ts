// Code-defined pixel sprites. A SpriteDef is a tiny palette plus rows of
// single-char pixels ('.' = transparent). The engine bakes a def to an
// offscreen canvas once (nearest-neighbor, integer scale) and caches it, so the
// same art serves both the isometric battle scene and DOM menu icons. No assets.

export interface SpriteDef {
  /** Single-char key -> CSS color. '.' is reserved for transparent. */
  palette: Record<string, string>;
  /** Equal-length rows; each char indexes the palette, '.' = transparent. */
  rows: string[];
}

export interface AnimDef {
  frames: SpriteDef[];
  /** Seconds per frame. */
  frameDur: number;
}

const TRANSPARENT = ".";

/** Problems with a sprite def; empty array = valid. Pure (no canvas). */
export function validateSprite(def: SpriteDef): string[] {
  const errs: string[] = [];
  if (!def.rows || def.rows.length === 0) {
    errs.push("no rows");
    return errs;
  }
  const w = def.rows[0].length;
  if (w === 0) errs.push("zero-width rows");
  def.rows.forEach((row, i) => {
    if (row.length !== w) errs.push(`row ${i}: width ${row.length} != ${w}`);
    for (const ch of row) {
      if (ch === TRANSPARENT) continue;
      if (!(ch in def.palette)) errs.push(`row ${i}: char '${ch}' not in palette`);
    }
  });
  if (TRANSPARENT in def.palette) errs.push("'.' must stay transparent (remove it from palette)");
  return errs;
}

export function spriteWidth(def: SpriteDef): number {
  return def.rows[0]?.length ?? 0;
}

export function spriteHeight(def: SpriteDef): number {
  return def.rows.length;
}

const cache = new WeakMap<SpriteDef, Map<number, HTMLCanvasElement>>();

/** Bake a sprite to an offscreen canvas (nearest-neighbor, integer scale). Cached. */
export function bakeSprite(def: SpriteDef, scale = 4): HTMLCanvasElement {
  let byScale = cache.get(def);
  if (!byScale) {
    byScale = new Map();
    cache.set(def, byScale);
  }
  const hit = byScale.get(scale);
  if (hit) return hit;

  const w = spriteWidth(def);
  const h = spriteHeight(def);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, w * scale);
  canvas.height = Math.max(1, h * scale);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < h; y++) {
      const row = def.rows[y];
      for (let x = 0; x < w; x++) {
        const ch = row[x];
        if (ch === TRANSPARENT) continue;
        const color = def.palette[ch];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  byScale.set(scale, canvas);
  return canvas;
}

/** Data URL of a baked sprite — for <img>/CSS in the DOM UI. */
export function spriteToDataURL(def: SpriteDef, scale = 4): string {
  return bakeSprite(def, scale).toDataURL();
}
