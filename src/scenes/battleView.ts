import type { MapDef, Point, SkillDef, Unit } from "../core/types";
import { Grid, manhattan, moveBlockers, samePoint, zoneOfControl } from "../battle/grid";
import { pathTo, reachable } from "../battle/pathfinding";
import { aoeTiles, leapLanding } from "../battle/targeting";
import { forecastSkill, forecastWeapon } from "../battle/forecast";
import type { AttackContext } from "../battle/combat";
import { getWeapon } from "../data/weapons";
import { getItem } from "../data/items";
import type { Rotation, ScreenPoint } from "../engine/iso";
import type { ActiveEffect, BattleView, FloatingText, ForecastTag, OverlaySet } from "../engine/renderer";
import type { BattleScene } from "./battleScene";

/** Floating-text palette shared by the popup spawners and the hover forecast. */
export const POPUP_COLORS = {
  damage: "#ff7a7a",
  crit: "#ffd34d",
  heal: "#7fe39a",
  mp: "#7fb0ff",
  revive: "#ffffff",
  status: "#ffd34d",
};

/** Seconds a hit-shake / attack-lunge animation lasts. */
export const SHAKE_DUR = 0.22;
export const LUNGE_DUR = 0.18;

/**
 * The slice of BattleScene state the per-frame view builder reads. These
 * functions are pure projections of scene state into a renderable BattleView —
 * they never mutate gameplay — so we view the scene through this structural
 * interface (a runtime no-op cast) rather than coupling to the class directly.
 */
interface ViewScene {
  grid: Grid;
  units: Unit[];
  active: Unit | null;
  phase: string;
  rot: Rotation;
  rangeTiles: Point[];
  hoverTile: Point | null;
  selectedSkill: SkillDef | null;
  selectedItemId: string | null;
  popups: FloatingText[];
  effects: ActiveEffect[];
  deaths: Map<string, number>;
  hitShake: Map<string, number>;
  lunge: { id: string; tx: number; ty: number; age: number } | null;
  time: number;
  map: MapDef;
  ctx: { animator: { animPos: BattleView["animPos"] } };
  inRangeTiles(tile: Point): boolean;
  posCtx(targetPos: Point): AttackContext;
  projectTile(x: number, y: number, z: number): ScreenPoint;
}

/** Target tiles to highlight permanently for seize/defend/escort objectives. */
function objectiveTiles(s: ViewScene): Point[] {
  const obj = s.map.objective;
  if (!obj) return [];
  if (obj.kind === "seize" || obj.kind === "defend" || obj.kind === "escort") return [{ x: obj.x, y: obj.y }];
  return [];
}

/** Assemble the full render snapshot for the current frame. */
export function buildView(scene: BattleScene, origin: ScreenPoint): BattleView {
  const s = scene as unknown as ViewScene;
  const overlays: OverlaySet = { move: [], attack: [], aoe: [], path: [], objective: objectiveTiles(s) };
  if (s.phase === "move") {
    overlays.move = s.rangeTiles;
    if (s.hoverTile && s.inRangeTiles(s.hoverTile) && s.active) {
      const { solid, passThrough } = moveBlockers(s.units, s.active);
      const zoc = zoneOfControl(s.units, s.active.team);
      const reach = reachable(s.grid, s.active.pos, s.active.stats.move, s.active.stats.jump, solid, passThrough, zoc);
      overlays.path = pathTo(reach, s.hoverTile) ?? [];
    }
  } else if (s.phase === "attackTarget" || s.phase === "itemTarget" || s.phase === "recruitTarget") {
    overlays.attack = s.rangeTiles;
  } else if (s.phase === "skillTarget") {
    overlays.attack = s.rangeTiles;
    if (s.hoverTile && s.selectedSkill && s.inRangeTiles(s.hoverTile)) {
      overlays.aoe = aoeTiles(s.grid, s.hoverTile, s.selectedSkill.aoe);
    }
  }
  let forecast: ForecastTag | null = null;
  if (s.active && s.hoverTile && s.inRangeTiles(s.hoverTile)) {
    forecast = computeForecast(s, s.hoverTile);
  }

  return {
    grid: s.grid,
    units: s.units,
    origin,
    rot: s.rot,
    activeUnitId: s.active?.id ?? null,
    hoverTile: s.hoverTile,
    overlays,
    popups: s.popups,
    animPos: s.ctx.animator.animPos,
    effects: s.effects,
    unitOffsets: computeUnitOffsets(s),
    deathFade: s.deaths,
    forecast,
    time: s.time,
  };
}

/** Per-unit pixel offsets for hit shake and attack lunge. */
function computeUnitOffsets(s: ViewScene): Map<string, { dx: number; dy: number }> {
  const offsets = new Map<string, { dx: number; dy: number }>();
  for (const [id, remaining] of s.hitShake) {
    const amp = (remaining / SHAKE_DUR) * 3;
    offsets.set(id, { dx: Math.sin(s.time * 70) * amp, dy: 0 });
  }
  if (s.lunge) {
    const att = s.units.find((u) => u.id === s.lunge!.id);
    if (att) {
      const za = s.grid.heightAt(att.pos.x, att.pos.y);
      const a = s.projectTile(att.pos.x, att.pos.y, za);
      const zt = s.grid.heightAt(s.lunge.tx, s.lunge.ty);
      const t = s.projectTile(s.lunge.tx, s.lunge.ty, zt);
      let vx = t.sx - a.sx;
      let vy = t.sy - a.sy;
      const m = Math.hypot(vx, vy) || 1;
      vx /= m;
      vy /= m;
      const f = Math.sin(Math.min(1, s.lunge.age / LUNGE_DUR) * Math.PI) * 7;
      const prev = offsets.get(s.lunge.id) ?? { dx: 0, dy: 0 };
      offsets.set(s.lunge.id, { dx: prev.dx + vx * f, dy: prev.dy + vy * f });
    }
  }
  return offsets;
}

/** Damage/heal preview for the hovered target, given the current action. */
function computeForecast(s: ViewScene, tile: Point): ForecastTag | null {
  if (!s.active) return null;
  const occupants = s.units.filter((u) => samePoint(u.pos, tile));
  const enemy = occupants.find((u) => u.alive && u.team !== s.active!.team);
  const ally = occupants.find((u) => u.alive && u.team === s.active!.team);
  const deadAlly = occupants.find((u) => !u.alive && u.team === s.active!.team);

  if (s.phase === "attackTarget") {
    if (!enemy) return null;
    const f = forecastWeapon(s.active, enemy, getWeapon(s.active.weaponId), s.posCtx(enemy.pos));
    return { tile, text: f.lethal ? `${f.amount} · KO` : `${f.amount}`, color: POPUP_COLORS.damage, strong: f.lethal };
  }

  if (s.phase === "skillTarget" && s.selectedSkill) {
    const sk = s.selectedSkill;
    if (sk.effect === "damage") {
      if (!enemy) return null;
      // A leap skill resolves from the landing tile next to the target, so forecast
      // its flank/elevation from there rather than the caster's current tile.
      let ctx = s.posCtx(enemy.pos);
      if (sk.leap) {
        const adjacent = manhattan(s.active.pos, enemy.pos) <= 1;
        const land = adjacent ? null : leapLanding(s.grid, s.units, s.active, enemy.pos);
        // Boxed-in, non-adjacent leap target: the cast would be rejected ("no room
        // to land"), so don't show a misleading forecast.
        if (!adjacent && !land) return null;
        if (land) {
          ctx = {
            fromPos: { ...land },
            heightDelta: s.grid.heightAt(land.x, land.y) - s.grid.heightAt(enemy.pos.x, enemy.pos.y),
          };
        }
      }
      const f = forecastSkill(s.active, enemy, sk, ctx);
      let text = f.lethal ? `${f.amount} · KO` : `${f.amount}`;
      if (f.affinity === "weak") text += " · weak";
      else if (f.affinity === "resist") text += " · resist";
      return { tile, text, color: POPUP_COLORS.damage, strong: f.lethal || f.affinity === "weak" };
    }
    if (sk.effect === "heal") {
      if (!ally) return null;
      const f = forecastSkill(s.active, ally, sk);
      const real = Math.min(f.amount, ally.stats.maxHp - ally.stats.hp);
      return real > 0 ? { tile, text: `+${real}`, color: POPUP_COLORS.heal, strong: false } : null;
    }
    if (sk.effect === "revive") {
      if (!deadAlly) return null;
      return { tile, text: "Revive", color: POPUP_COLORS.revive, strong: false };
    }
    if (sk.effect === "buff" || sk.effect === "debuff") {
      const t = sk.effect === "buff" ? ally : enemy;
      if (!t || !sk.statusKind) return null;
      return { tile, text: sk.statusKind, color: POPUP_COLORS.status, strong: false };
    }
    return null;
  }

  if (s.phase === "itemTarget" && s.selectedItemId) {
    const item = getItem(s.selectedItemId);
    if (item.effect === "healHp") {
      if (!ally) return null;
      const real = Math.min(item.amount, ally.stats.maxHp - ally.stats.hp);
      return real > 0 ? { tile, text: `+${real}`, color: POPUP_COLORS.heal, strong: false } : null;
    }
    if (item.effect === "healMp") {
      if (!ally) return null;
      const real = Math.min(item.amount, ally.stats.maxMp - ally.stats.mp);
      return real > 0 ? { tile, text: `+${real} MP`, color: POPUP_COLORS.mp, strong: false } : null;
    }
    if (item.effect === "revive") {
      if (!deadAlly) return null;
      return { tile, text: "Revive", color: POPUP_COLORS.revive, strong: false };
    }
    if (item.effect === "buff") {
      if (!ally || !item.statusKind) return null;
      return { tile, text: item.statusKind, color: POPUP_COLORS.status, strong: false };
    }
  }
  return null;
}
