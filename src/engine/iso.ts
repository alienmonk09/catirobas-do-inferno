import type { Point } from "../core/types";
import type { Grid } from "../battle/grid";

// Isometric tile dimensions (2:1 diamond) and per-level height in pixels.
export const TILE_W = 64;
export const TILE_H = 32;
export const TILE_Z = 16;

export interface ScreenPoint {
  sx: number;
  sy: number;
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
 * actual height and returns the front-most match (largest x+y, then height),
 * so taller/closer tiles win — correct with elevation.
 */
export function screenToTile(px: number, py: number, grid: Grid, origin: ScreenPoint): Point | null {
  let best: Point | null = null;
  let bestRank = -Infinity;
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const z = grid.heightAt(x, y);
      const center = worldToScreen(x, y, z, origin);
      if (!pointInDiamond(px, py, center)) continue;
      const rank = (x + y) * 10 + z;
      if (rank > bestRank) {
        bestRank = rank;
        best = { x, y };
      }
    }
  }
  return best;
}

/** Draw order key: back-to-front by depth (x+y) then height. */
export function depthKey(x: number, y: number, z: number): number {
  return (x + y) * 100 + z;
}
