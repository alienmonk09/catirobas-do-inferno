import {
  TILE_W, TILE_H, TILE_Z, tileScreen, rotateTile, rotatedDims,
  type Rotation, type ScreenPoint,
} from "./iso";
import type { Grid } from "../battle/grid";
import type { Point } from "../core/types";

const FRAME_NUDGE = 40;
const TAU = 0.12;
const EASE_EPSILON = 0.5;
const CLAMP_MARGIN = 48;

type TileScreenPoint = ScreenPoint;

const clampNum = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Navigable battle camera. Pure (no canvas/DOM) → node-unit-testable. Owns the
 *  transform math generalized from SP1's Renderer.computeCamera. */
export class Camera {
  private vw: number;
  private vh: number;
  private map!: Grid;
  private rot: Rotation = 0;
  private zoom = 1;
  private center: TileScreenPoint = { sx: 0, sy: 0 };
  private target: TileScreenPoint = { sx: 0, sy: 0 };

  constructor(viewport: { w: number; h: number }) {
    this.vw = viewport.w;
    this.vh = viewport.h;
  }

  // ---- cached-state geometry (use this.map/this.rot/this.vw/this.vh) ----
  private dims() { return rotatedDims(this.rot, this.map.width, this.map.height); }
  private pxW() { const d = this.dims(); return (d.w + d.h) * (TILE_W / 2); }
  private pxH() { const d = this.dims(); return (d.w + d.h) * (TILE_H / 2) + this.map.maxHeight() * TILE_Z; }
  private fitScale() { return Math.min(1, (this.vw * 0.98) / this.pxW(), (this.vh * 0.94) / this.pxH()); }
  private fitCenter(): TileScreenPoint {
    const d = this.dims();
    const mid = tileScreen((d.w - 1) / 2, (d.h - 1) / 2, 0);
    return { sx: mid.sx, sy: mid.sy + FRAME_NUDGE };
  }
  private bbox() {
    const d = this.dims();
    const mh = this.map.maxHeight();
    return {
      minX: -(d.h - 1) * (TILE_W / 2) - TILE_W / 2,
      maxX: (d.w - 1) * (TILE_W / 2) + TILE_W / 2,
      minY: -mh * TILE_Z - TILE_H / 2,
      maxY: (d.w + d.h - 2) * (TILE_H / 2) + TILE_H / 2,
    };
  }

  /** Keep the viewport inside the map bbox (+CLAMP_MARGIN overscroll); pin to
   *  fitCenter on an axis where the (rotated, scaled) map fits the viewport — so
   *  the boot FRAME_NUDGE headroom survives any clamp. Per axis. Spec §2: the
   *  regime is chosen by `span·zoom ≤ viewport` (fits), NOT by an empty
   *  keep-region — those differ in the [vp−2·margin, vp] band, and using the
   *  latter would pull center off fitCenter (a visible jump) on a near-fitting map. */
  private clamp(): void {
    const b = this.bbox();
    const fit = this.fitCenter();
    const kx = (this.vw / 2 - CLAMP_MARGIN) / this.zoom;
    const ky = (this.vh / 2 - CLAMP_MARGIN) / this.zoom;
    const fitsX = this.pxW() * this.zoom <= this.vw;
    const fitsY = this.pxH() * this.zoom <= this.vh;
    this.center = {
      sx: fitsX ? fit.sx : clampNum(this.center.sx, b.minX + kx, b.maxX - kx),
      sy: fitsY ? fit.sy : clampNum(this.center.sy, b.minY + ky, b.maxY - ky),
    };
  }

  // ---- framing ----
  reset(map: Grid, rot: Rotation): void {
    this.map = map; this.rot = rot;
    this.zoom = this.fitScale();
    this.center = this.fitCenter();
    this.target = { ...this.center };
  }
  setViewport(w: number, h: number): void {
    this.vw = w; this.vh = h;
    this.zoom = clampNum(this.zoom, this.fitScale(), 1);
    this.clamp();
  }
  reframeForRotation(map: Grid, toRot: Rotation, focusTile: Point | null): void {
    this.map = map; this.rot = toRot;
    this.zoom = clampNum(this.zoom, this.fitScale(), 1);
    if (focusTile) {
      const v = rotateTile(focusTile.x, focusTile.y, toRot, map.width, map.height);
      this.center = tileScreen(v.x, v.y, map.heightAt(focusTile.x, focusTile.y));
    } else {
      this.center = this.fitCenter();
    }
    this.target = { ...this.center };
    this.clamp();
  }

  // ---- manual (each clamps) ----
  panBy(dx: number, dy: number): void {
    this.center = { sx: this.center.sx - dx / this.zoom, sy: this.center.sy - dy / this.zoom };
    this.clamp();
    this.target = { ...this.center };
  }
  zoomAt(factor: number, cursorX: number, cursorY: number): void {
    if (!(factor > 0)) throw new Error("zoomAt factor must be > 0");
    const z0 = this.zoom;
    const z1 = clampNum(z0 * factor, this.fitScale(), 1);
    const k = 1 / z0 - 1 / z1;
    this.center = {
      sx: this.center.sx + (cursorX - this.vw / 2) * k,
      sy: this.center.sy + (cursorY - this.vh / 2) * k,
    };
    this.zoom = z1;
    this.clamp();
    this.target = { ...this.center };
  }

  // ---- follow ----
  followTo(to: TileScreenPoint): void { this.target = { ...to }; }
  snapTo(to: TileScreenPoint): void { this.center = { ...to }; this.target = { ...to }; this.clamp(); }
  recenterFit(): void { this.center = this.fitCenter(); this.target = { ...this.center }; this.clamp(); }
  update(dt: number): void {
    const c0 = this.center;
    const dx = this.target.sx - c0.sx, dy = this.target.sy - c0.sy;
    if (dx * dx + dy * dy <= EASE_EPSILON * EASE_EPSILON) return; // settled (per-frame compare)
    const k = 1 - Math.exp(-dt / TAU);
    this.center = { sx: c0.sx + dx * k, sy: c0.sy + dy * k };
    this.clamp();
    // Spec §2 condition 2: if clamp pinned the eased center straight back to c0, the
    // target sits outside the clamp region (e.g. a unit hugging a map edge) and can't
    // be advanced toward — it's settled this frame. A per-frame comparison, not a
    // sticky flag, so a fresh followTo/snapTo/panBy/zoomAt re-arms the ease next frame.
  }

  // ---- outputs ----
  get origin(): ScreenPoint {
    return { sx: this.vw / 2 / this.zoom - this.center.sx, sy: this.vh / 2 / this.zoom - this.center.sy };
  }
  get scale(): number { return this.zoom; }

  // test-only convenience: jump zoom to a value within [fitScale..1]
  zoomTo(z: number): void { this.zoom = clampNum(z, this.fitScale(), 1); this.clamp(); }
}
