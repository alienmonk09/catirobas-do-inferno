import type { Reaction, SkillDef, StatusKind, Unit } from "../core/types";
import { REACTIONS } from "../data/reactions";
import { el } from "./dom";

/** A one-line summary of a skill's range/shape/effect for inline lists. */
export function describeSkill(s: SkillDef): string {
  const shape = s.aoe === "single" ? "" : s.aoe === "cross" ? " +cross" : " 3x3";
  const verb =
    s.effect === "heal" ? "heal" : s.effect === "revive" ? "revive" : s.effect === "damage" ? "dmg" : s.effect;
  return `rng ${s.range}${shape} · ${verb}`;
}

/** A summary line of the unit's reaction abilities (class-innate + the one
 *  equipped at camp): a short hint inline, the full explanation on hover. */
export function reactionLine(unit: Unit, classReactions: Reaction[] | undefined): HTMLElement {
  const reactions = [...new Set([...(classReactions ?? []), ...(unit.reactionId ? [unit.reactionId] : [])])];
  if (reactions.length === 0) return el("div", { className: "skills-line" });
  return el("div", {
    className: "skills-line",
    attrs: {
      style: "opacity:0.7",
      title: reactions.map((r) => `${REACTIONS[r].name}: ${REACTIONS[r].description}`).join("\n"),
    },
    text: "Reactions: " + reactions.map((r) => `${REACTIONS[r].name} (${REACTIONS[r].short})`).join(", "),
  });
}

const STATUS_INFO: Record<StatusKind, { label: string; tip: string; cls: string }> = {
  guard: { label: "Guard", tip: "Raised defense (takes less physical damage)", cls: "st-buff" },
  protect: { label: "Protect", tip: "Takes 25% less physical damage", cls: "st-buff" },
  shell: { label: "Shell", tip: "Takes 25% less magic damage", cls: "st-buff" },
  haste: { label: "Haste", tip: "Acts more often (turn speed ×1.5)", cls: "st-buff" },
  regen: { label: "Regen", tip: "Recovers HP at the end of each of its turns", cls: "st-buff" },
  slow: { label: "Slow", tip: "Acts less often (turn speed ×0.5)", cls: "st-debuff" },
  poison: { label: "Poison", tip: "Loses HP at the end of each of its turns", cls: "st-debuff" },
  stop: { label: "Stop", tip: "Frozen — forfeits its turns until it wears off", cls: "st-debuff" },
};

/** A row of readable status chips (with hover tooltips) for the info panels. */
export function statusChips(unit: Unit): HTMLElement {
  const row = el("div", { className: "statuses" });
  for (const s of unit.statuses) {
    const info = STATUS_INFO[s.kind];
    row.appendChild(
      el("span", {
        className: `st-chip ${info.cls}`,
        text: `${info.label} ${s.turnsLeft}`,
        attrs: { title: info.tip },
      }),
    );
  }
  return row;
}

/** Compact, color-coded tags describing a skill for the cast menu. */
export function skillTags(s: SkillDef): Array<{ text: string; cls: string }> {
  const tags: Array<{ text: string; cls: string }> = [];
  if (s.effect === "damage") tags.push({ text: `${s.power} pow · ${s.scaling === "magical" ? "MAG" : "ATK"}`, cls: "t-dmg" });
  else if (s.effect === "heal") tags.push({ text: `${s.power} pow heal`, cls: "t-heal" });
  else if (s.effect === "revive") tags.push({ text: "revive", cls: "t-heal" });
  else if (s.statusKind) {
    const info = STATUS_INFO[s.statusKind];
    tags.push({ text: `${info.label}${s.statusDuration ? ` ${s.statusDuration}t` : ""}`, cls: s.effect === "buff" ? "t-buff" : "t-debuff" });
  }
  tags.push({ text: s.range === 0 ? "self" : `rng ${s.range}`, cls: "t-meta" });
  if (s.aoe !== "single") tags.push({ text: s.aoe === "cross" ? "cross" : "3×3", cls: "t-meta" });
  if (s.knockback) tags.push({ text: `knockback ${s.knockback}`, cls: "t-meta" });
  if (s.element !== "none") tags.push({ text: s.element, cls: `t-elem t-${s.element}` });
  return tags;
}
