import type { Point } from "../core/types";
import type { Grid } from "../battle/grid";

// Isometric tile dimensions (2:1 diamond) and per-level height in pixels.
export const TILE_W = 96;
export const TILE_H = 48;
export const TILE_Z = 24;

export interface ScreenPoint {
  sx: number;
  sy: number;
}

/** Camera orientation in clockwise quarter-turns: 0=0°, 1=90°, 2=180°, 3=270°. */
export type Rotation = 0 | 1 | 2 | 3;

/**
 * Map a logical grid tile (x, y) — possibly fractional, for animation — into
 * view space for the given rotation, so the iso projection draws the map spun
 * by 90° steps. `w`/`h` are the LOGICAL grid dimensions. This is the single
 * source of truth shared by rendering, picking, and depth sorting.
 */
export function rotateTile(x: number, y: number, rot: Rotation, w: number, h: number): { x: number; y: number } {
  switch (rot & 3) {
    case 1:
      return { x: y, y: w - 1 - x };
    case 2:
      return { x: w - 1 - x, y: h - 1 - y };
    case 3:
      return { x: h - 1 - y, y: x };
    default:
      return { x, y };
  }
}

/** View-space grid dimensions after rotation (width/height swap on 90°/270°). */
export function rotatedDims(rot: Rotation, w: number, h: number): { w: number; h: number } {
  return rot & 1 ? { w: h, h: w } : { w, h };
}

/** World tile (x, y) at height z -> screen center of its top face. */
export function worldToScreen(x: number, y: number, z: number, origin: ScreenPoint): ScreenPoint {
  return {
    sx: (x - y) * (TILE_W / 2) + origin.sx,
    sy: (x + y) * (TILE_H / 2) - z * TILE_Z + origin.sy,
  };
}

/** Four corner points of a tile's top-face diamond, given its screen center. */
export function diamondCorners(center: ScreenPoint): ScreenPoint[] {
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  return [
    { sx: center.sx, sy: center.sy - hh }, // top
    { sx: center.sx + hw, sy: center.sy }, // right
    { sx: center.sx, sy: center.sy + hh }, // bottom
    { sx: center.sx - hw, sy: center.sy }, // left
  ];
}

function pointInDiamond(px: number, py: number, center: ScreenPoint): boolean {
  const dx = Math.abs(px - center.sx) / (TILE_W / 2);
  const dy = Math.abs(py - center.sy) / (TILE_H / 2);
  return dx + dy <= 1;
}

/**
 * Pick the tile under a screen point. Tests every tile's top-face diamond at its
 * actual (rotated) screen position and returns the front-most match, so
 * taller/closer tiles win — correct with elevation and any rotation. Returns
 * the LOGICAL tile coordinates (what the game logic operates on).
 */
export function screenToTile(
  px: number,
  py: number,
  grid: Grid,
  origin: ScreenPoint,
  rot: Rotation = 0,
  scale = 1,
): Point | null {
  // Pointer arrives in CSS px; the scene draws under ctx.scale(scale), so invert
  // it back into the unscaled tile space the diamond test operates in.
  px /= scale;
  py /= scale;
  let best: Point | null = null;
  let bestRank = -Infinity;
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const z = grid.heightAt(x, y);
      const v = rotateTile(x, y, rot, grid.width, grid.height);
      const center = worldToScreen(v.x, v.y, z, origin);
      if (!pointInDiamond(px, py, center)) continue;
      const rank = (v.x + v.y) * 10 + z;
      if (rank > bestRank) {
        bestRank = rank;
        best = { x, y };
      }
    }
  }
  return best;
}

/** Draw order key: back-to-front by view depth (rotated x+y) then height. */
export function depthKey(x: number, y: number, z: number, rot: Rotation = 0, w = 0, h = 0): number {
  const v = rotateTile(x, y, rot, w, h);
  return (v.x + v.y) * 100 + z;
}
