import type { ClassId, Point, SkillDef, Unit } from "../core/types";
import { grantXp, recomputeStats, xpForLevel } from "../core/unit";
import { CLASSES, getClass } from "../data/classes";
import type { BattleScene } from "./battleScene";

type Winner = "player" | "enemy";

/** The slice of BattleScene internals the dev cheats reach into. BattleScene's
 *  members are `private`, so we view them through this structural interface (a
 *  runtime no-op cast) instead of widening their visibility for a dev-only tool. */
interface DevScene {
  phase: string;
  units: Unit[];
  active: Unit | null;
  ctx: { state: { gold: number } };
  ui: {
    showDevBar(buttons: Array<{ label: string; title?: string; onClick: () => void }>): void;
    toast(msg: string): void;
    setActiveUnit(u: Unit): void;
    hideSubmenu(): void;
  };
  endBattle(winner: Winner): void;
  outcome(): Winner | null;
  pushLog(msg: string): void;
  refreshTurnBar(): void;
  refreshMenu(): void;
  readonly playerInControl: boolean;
  selectedSkill: SkillDef | null;
  selectedItemId: string | null;
  rangeTiles: Point[];
}

/** A living player unit to target with dev actions — the active one, else the first. */
function devTargetUnit(s: DevScene): Unit | null {
  if (s.active?.team === "player" && s.active.alive) return s.active;
  return s.units.find((u) => u.team === "player" && u.alive) ?? null;
}

function devKillEnemy(s: DevScene): void {
  if (s.phase === "over") return;
  const foe = s.units.find((u) => u.alive && u.team === "enemy");
  if (!foe) return;
  foe.stats.hp = 0;
  foe.alive = false;
  foe.statuses = [];
  s.pushLog(`[dev] removed ${foe.name}`);
  s.refreshTurnBar();
  const winner = s.outcome();
  if (winner) s.endBattle(winner);
}

function devLevelUp(s: DevScene): void {
  if (s.phase === "over") return;
  const u = devTargetUnit(s);
  if (!u) return;
  grantXp(u, Math.max(1, xpForLevel(u.level) - u.xp));
  s.ui.toast(`${u.name} → Lv ${u.level}`);
  if (s.active === u) s.ui.setActiveUnit(u);
}

function devCycleClass(s: DevScene): void {
  if (s.phase === "over") return;
  const u = devTargetUnit(s);
  if (!u) return;
  const ids = Object.keys(CLASSES) as ClassId[];
  const next = ids[(ids.indexOf(u.classId) + 1) % ids.length];
  const c = getClass(next);
  u.classId = next;
  u.subClassId = undefined;
  u.weaponId = c.weaponIds[0];
  u.learnedSkillIds = c.skillIds.slice(0, 1);
  recomputeStats(u, true);
  s.ui.toast(`${u.name} → ${c.name}`);
  if (s.active === u) {
    s.ui.setActiveUnit(u);
    // The old class's skill selection / open submenu / target highlights are now
    // stale — drop them and return to a clean action menu while in player control
    // (covers menu AND the *Target sub-phases, not just "menu").
    if (s.playerInControl) {
      s.selectedSkill = null;
      s.selectedItemId = null;
      s.rangeTiles = [];
      s.ui.hideSubmenu();
      s.phase = "menu";
      s.refreshMenu();
    }
  }
}

function devHealParty(s: DevScene): void {
  if (s.phase === "over") return;
  for (const u of s.units) {
    if (u.team === "player" && u.alive) {
      u.stats.hp = u.stats.maxHp;
      u.stats.mp = u.stats.maxMp;
    }
  }
  if (s.active) s.ui.setActiveUnit(s.active);
  s.ui.toast("Party fully restored");
}

/**
 * Wire up the developer cheat bar for rapid playtesting. This whole module is
 * loaded via a dynamic `import()` guarded by `import.meta.env.DEV` in
 * BattleScene, so Vite tree-shakes it out of the production build entirely — the
 * cheats never ship to players, only to the local dev server.
 */
export function setupDevBar(scene: BattleScene): void {
  const s = scene as unknown as DevScene;
  s.ui.showDevBar([
    { label: "Win", title: "Win this battle instantly", onClick: () => { if (s.phase !== "over") s.endBattle("player"); } },
    { label: "Lose", title: "Lose this battle instantly", onClick: () => { if (s.phase !== "over") s.endBattle("enemy"); } },
    { label: "Kill foe", title: "Remove one living enemy", onClick: () => devKillEnemy(s) },
    { label: "+Lvl", title: "Level up the active/first hero", onClick: () => devLevelUp(s) },
    { label: "Class▸", title: "Cycle the active/first hero's class", onClick: () => devCycleClass(s) },
    { label: "+500g", title: "Add 500 gold", onClick: () => { s.ctx.state.gold += 500; s.ui.toast(`Gold: ${s.ctx.state.gold}`); } },
    { label: "Heal", title: "Fully restore the party", onClick: () => devHealParty(s) },
  ]);
}
