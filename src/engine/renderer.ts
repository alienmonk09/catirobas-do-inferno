import type { Point, Unit } from "../core/types";
import type { Grid } from "../battle/grid";
import { bakeSprite, type AnimDef } from "./sprite";
import { getCharacterSprite } from "../data/sprites";
import {
  TILE_W,
  TILE_H,
  TILE_Z,
  worldToScreen,
  diamondCorners,
  depthKey,
  type ScreenPoint,
} from "./iso";

/** Integer upscale for baked sprites in the battle scene. */
const CHAR_SCALE = 3;
const VFX_SCALE = 3;
/** Seconds for a slain unit to fade from full to ghosted. */
const DEATH_FADE = 0.45;

export interface FloatingText {
  /** Anchor tile. */
  tile: Point;
  text: string;
  color: string;
  /** seconds elapsed. */
  age: number;
  ttl: number;
}

export interface OverlaySet {
  move: Point[];
  attack: Point[];
  aoe: Point[];
  path: Point[];
}

/** A transient spell/skill effect animation playing over a tile. */
export interface ActiveEffect {
  tile: Point;
  anim: AnimDef;
  /** Seconds elapsed. */
  age: number;
}

/** A damage/heal preview shown over the hovered target while choosing a target. */
export interface ForecastTag {
  tile: Point;
  text: string;
  color: string;
  /** Emphasize (e.g. a lethal hit). */
  strong: boolean;
}

export interface BattleView {
  grid: Grid;
  units: Unit[];
  origin: ScreenPoint;
  activeUnitId: string | null;
  hoverTile: Point | null;
  overlays: OverlaySet;
  popups: FloatingText[];
  /** Override drawn position (fractional tile coords) for animating units. */
  animPos: Map<string, Point>;
  /** Active spell/skill effect animations. */
  effects: ActiveEffect[];
  /** Per-unit pixel offsets for juice (hit shake, attack lunge). */
  unitOffsets: Map<string, { dx: number; dy: number }>;
  /** Seconds since a unit died, for the death fade-out. */
  deathFade: Map<string, number>;
  /** Damage/heal preview over the hovered target, if any. */
  forecast: ForecastTag | null;
  /** Bob phase for the active-unit indicator (seconds accumulator). */
  time: number;
}

const COLOR = {
  move: "rgba(80,150,235,0.40)",
  attack: "rgba(230,80,80,0.40)",
  aoe: "rgba(245,150,40,0.55)",
  path: "rgba(245,225,90,0.65)",
  hover: "rgba(255,255,255,0.22)",
  gridLine: "rgba(0,0,0,0.18)",
};

function key(p: Point): string {
  return `${p.x},${p.y}`;
}

export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  width = 0;
  height = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    this.ctx = ctx;
  }

  resize(cssWidth: number, cssHeight: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(cssWidth * dpr);
    this.canvas.height = Math.floor(cssHeight * dpr);
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = cssWidth;
    this.height = cssHeight;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /** Center the camera so the map's middle sits at the screen middle. */
  computeOrigin(grid: Grid): ScreenPoint {
    const midX = (grid.width - 1) / 2;
    const midY = (grid.height - 1) / 2;
    const center = worldToScreen(midX, midY, 0, { sx: 0, sy: 0 });
    return { sx: this.width / 2 - center.sx, sy: this.height / 2 - center.sy - 40 };
  }

  render(view: BattleView): void {
    this.clear();
    this.drawTiles(view);
    this.drawOverlays(view);
    this.drawUnitsAndCursor(view);
    this.drawEffects(view);
    this.drawPopups(view);
    this.drawForecast(view);
  }

  private drawForecast(view: BattleView): void {
    const f = view.forecast;
    if (!f) return;
    const ctx = this.ctx;
    const z = view.grid.heightAt(f.tile.x, f.tile.y);
    const center = worldToScreen(f.tile.x, f.tile.y, z, view.origin);
    const x = center.sx;
    const y = center.sy - 64;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = f.strong ? "bold 18px system-ui" : "bold 15px system-ui";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.strokeText(f.text, x, y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, x, y);
  }

  private drawEffects(view: BattleView): void {
    const ctx = this.ctx;
    for (const e of view.effects) {
      const frames = e.anim.frames;
      const idx = Math.min(Math.floor(e.age / e.anim.frameDur), frames.length - 1);
      if (idx < 0) continue;
      const canvas = bakeSprite(frames[idx], VFX_SCALE);
      const z = view.grid.heightAt(e.tile.x, e.tile.y);
      const center = worldToScreen(e.tile.x, e.tile.y, z, view.origin);
      ctx.drawImage(
        canvas,
        Math.round(center.sx - canvas.width / 2),
        Math.round(center.sy - 26 - canvas.height / 2),
      );
    }
  }

  private drawTiles(view: BattleView): void {
    const { grid, origin } = view;
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const z = grid.heightAt(x, y);
        const blocked = grid.isBlocked(x, y);
        const center = worldToScreen(x, y, z, origin);
        this.drawTileWalls(center, z, blocked);
        this.drawTileTop(center, z, blocked);
      }
    }
  }

  private drawTileWalls(center: ScreenPoint, z: number, blocked: boolean): void {
    if (z <= 0) return;
    const ctx = this.ctx;
    const corners = diamondCorners(center);
    const wallH = z * TILE_Z;
    const baseHue = blocked ? 210 : 110;
    // Left face (from bottom corner to left corner).
    ctx.fillStyle = `hsl(${baseHue}, 30%, ${blocked ? 14 : 18}%)`;
    ctx.beginPath();
    ctx.moveTo(corners[3].sx, corners[3].sy);
    ctx.lineTo(corners[2].sx, corners[2].sy);
    ctx.lineTo(corners[2].sx, corners[2].sy + wallH);
    ctx.lineTo(corners[3].sx, corners[3].sy + wallH);
    ctx.closePath();
    ctx.fill();
    // Right face (from bottom corner to right corner).
    ctx.fillStyle = `hsl(${baseHue}, 30%, ${blocked ? 22 : 27}%)`;
    ctx.beginPath();
    ctx.moveTo(corners[1].sx, corners[1].sy);
    ctx.lineTo(corners[2].sx, corners[2].sy);
    ctx.lineTo(corners[2].sx, corners[2].sy + wallH);
    ctx.lineTo(corners[1].sx, corners[1].sy + wallH);
    ctx.closePath();
    ctx.fill();
  }

  private drawTileTop(center: ScreenPoint, z: number, blocked: boolean): void {
    const ctx = this.ctx;
    const corners = diamondCorners(center);
    if (blocked) {
      ctx.fillStyle = `hsl(205, 55%, ${30 + z * 6}%)`;
    } else {
      ctx.fillStyle = `hsl(110, 32%, ${30 + z * 9}%)`;
    }
    ctx.beginPath();
    ctx.moveTo(corners[0].sx, corners[0].sy);
    for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].sx, corners[i].sy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLOR.gridLine;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private fillTile(view: BattleView, tile: Point, color: string): void {
    const z = view.grid.heightAt(tile.x, tile.y);
    const center = worldToScreen(tile.x, tile.y, z, view.origin);
    const corners = diamondCorners(center);
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(corners[0].sx, corners[0].sy);
    for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].sx, corners[i].sy);
    ctx.closePath();
    ctx.fill();
  }

  private drawOverlays(view: BattleView): void {
    for (const t of view.overlays.move) this.fillTile(view, t, COLOR.move);
    for (const t of view.overlays.attack) this.fillTile(view, t, COLOR.attack);
    for (const t of view.overlays.path) this.fillTile(view, t, COLOR.path);
    for (const t of view.overlays.aoe) this.fillTile(view, t, COLOR.aoe);
    if (view.hoverTile) this.fillTile(view, view.hoverTile, COLOR.hover);
  }

  private drawUnitsAndCursor(view: BattleView): void {
    // Sort by depth so nearer units draw on top. Use animated pos when present.
    const drawList = view.units
      .filter((u) => u.alive || true) // dead drawn faded
      .map((u) => {
        const ap = view.animPos.get(u.id) ?? u.pos;
        return { unit: u, dx: ap.x, dy: ap.y };
      })
      .sort((a, b) => {
        const za = view.grid.heightAt(Math.round(a.dx), Math.round(a.dy));
        const zb = view.grid.heightAt(Math.round(b.dx), Math.round(b.dy));
        return depthKey(a.dx, a.dy, za) - depthKey(b.dx, b.dy, zb);
      });

    for (const { unit, dx, dy } of drawList) {
      const z = view.grid.heightAt(Math.round(dx), Math.round(dy));
      const center = worldToScreen(dx, dy, z, view.origin);
      const off = view.unitOffsets.get(unit.id);
      if (off) {
        center.sx += off.dx;
        center.sy += off.dy;
      }
      this.drawUnit(unit, center, unit.id === view.activeUnitId, view.time, view.deathFade.get(unit.id));
    }
  }

  private drawUnit(
    unit: Unit,
    center: ScreenPoint,
    active: boolean,
    time: number,
    deathAge: number | undefined,
  ): void {
    const ctx = this.ctx;
    const canvas = bakeSprite(getCharacterSprite(unit.classId), CHAR_SCALE);
    const w = canvas.width;
    const h = canvas.height;
    const bob = active ? Math.sin(time * 6) * 2 : 0;
    const drawX = Math.round(center.sx - w / 2);
    const feetY = center.sy + 4; // a touch below the tile-top center
    const drawY = Math.round(feetY - h + bob);

    // Shadow.
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.beginPath();
    ctx.ellipse(center.sx, center.sy + 2, TILE_W * 0.26, TILE_H * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!unit.alive) {
      const a = deathAge === undefined ? 0.3 : Math.max(0.3, 1 - (deathAge / DEATH_FADE) * 0.7);
      ctx.globalAlpha = a;
      ctx.drawImage(canvas, drawX, drawY);
      ctx.globalAlpha = 1;
      return;
    }

    // Team-colored ground ring.
    ctx.strokeStyle = unit.team === "player" ? "#5fe3ff" : "#ff5a5a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(center.sx, center.sy + 2, TILE_W * 0.28, TILE_H * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.drawImage(canvas, drawX, drawY);

    const topY = drawY;
    // HP bar.
    const barW = 28;
    const barX = center.sx - barW / 2;
    const barY = topY - 8;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(barX - 1, barY - 1, barW + 2, 5);
    const hpFrac = unit.stats.hp / unit.stats.maxHp;
    ctx.fillStyle = hpFrac > 0.5 ? "#5fbf72" : hpFrac > 0.25 ? "#d6cf5f" : "#d65f5f";
    ctx.fillRect(barX, barY, barW * hpFrac, 3);

    // Status pips.
    if (unit.statuses.length > 0) {
      ctx.font = "9px system-ui";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(unit.statuses.map((s) => s.kind[0].toUpperCase()).join(""), center.sx, barY - 6);
    }

    // Active indicator: bobbing arrow above the sprite.
    if (active) {
      const ab = Math.sin(time * 6) * 3;
      ctx.fillStyle = "#ffd34d";
      ctx.beginPath();
      ctx.moveTo(center.sx, topY - 10 + ab);
      ctx.lineTo(center.sx - 6, topY - 18 + ab);
      ctx.lineTo(center.sx + 6, topY - 18 + ab);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawPopups(view: BattleView): void {
    const ctx = this.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of view.popups) {
      const z = view.grid.heightAt(p.tile.x, p.tile.y);
      const center = worldToScreen(p.tile.x, p.tile.y, z, view.origin);
      const t = p.age / p.ttl;
      const yOff = -40 - t * 24;
      ctx.globalAlpha = Math.max(0, 1 - t);
      ctx.font = "bold 16px system-ui";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.strokeText(p.text, center.sx, center.sy + yOff);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, center.sx, center.sy + yOff);
      ctx.globalAlpha = 1;
    }
  }
}

export { key as tileKey };
