import type { Reaction, SkillDef, StatusKind, Unit } from "../core/types";
import { REACTIONS } from "../data/reactions";
import { getSkill } from "../data/skills";
import { t } from "../i18n";
import { el } from "./dom";

const DEBUFFS: ReadonlySet<StatusKind> = new Set(["slow", "poison", "stop", "confuse"]);

function statusInfo(kind: StatusKind): { label: string; tip: string; cls: string } {
  return {
    label: t(`battle.status.${kind}.label`),
    tip: t(`battle.status.${kind}.tip`),
    cls: DEBUFFS.has(kind) ? "st-debuff" : "st-buff",
  };
}

/** A one-line summary of a skill's range/shape/effect for inline lists. */
export function describeSkill(s: SkillDef): string {
  const shape = s.aoe === "single" ? "" : s.aoe === "cross" ? ` +${t("battle.skillTags.cross")}` : ` ${t("battle.skillTags.area")}`;
  const verb =
    s.effect === "heal" ? t("battle.skillTags.healVerb") : s.effect === "revive" ? t("battle.skillTags.revive") : s.effect === "damage" ? t("battle.skillTags.damageVerb") : s.effect;
  return `${t("battle.skillTags.rng", { range: s.range })}${shape} · ${verb}`;
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
    text: t("battle.unitPanel.reactions", { reactions: reactions.map((r) => `${REACTIONS[r].name} (${REACTIONS[r].short})`).join(", ") }),
  });
}

/** A row of readable status chips (with hover tooltips) for the info panels. */
export function statusChips(unit: Unit): HTMLElement {
  const row = el("div", { className: "statuses" });
  for (const s of unit.statuses) {
    const info = statusInfo(s.kind);
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

/**
 * The one transient worth flagging on a unit's turn-order chip: a pending charge
 * (highest priority — it dictates the unit's NEXT action), otherwise its most
 * urgent status by turns-left. Returns null for a clean unit. `cls` is "buff",
 * "debuff", or "charge" for color-coding.
 */
export function turnChipBadge(unit: Unit): { text: string; cls: string } | null {
  if (unit.charging) return { text: `⏳${unit.charging.turnsLeft}`, cls: "charge" };
  // Surface a debuff before a buff (the threatening one matters more at a glance).
  const debuff = unit.statuses.find((s) => statusInfo(s.kind).cls === "st-debuff");
  const shown = debuff ?? unit.statuses[0];
  if (!shown) return null;
  const cls = statusInfo(shown.kind).cls === "st-debuff" ? "debuff" : "buff";
  return { text: `${statusInfo(shown.kind).label[0]}${shown.turnsLeft}`, cls };
}

/** Full hover text for a turn-bar chip: name/class plus every status & charge. */
export function turnChipTitle(unit: Unit, className: string): string {
  const lines = [`${unit.name} (${className})`];
  if (unit.charging) {
    const sk = getSkill(unit.charging.skillId);
    lines.push(t("battle.charging", { name: sk.name, turns: unit.charging.turnsLeft }));
  }
  for (const s of unit.statuses) {
    const info = statusInfo(s.kind);
    lines.push(`${info.label} ${s.turnsLeft}: ${info.tip}`);
  }
  return lines.join("\n");
}

/** Compact, color-coded tags describing a skill for the cast menu. */
export function skillTags(s: SkillDef): Array<{ text: string; cls: string }> {
  const tags: Array<{ text: string; cls: string }> = [];
  if (s.effect === "damage") {
    tags.push({ text: s.scaling === "magical" ? t("battle.skillTags.powMag", { power: s.power }) : t("battle.skillTags.powAtk", { power: s.power }), cls: "t-dmg" });
  } else if (s.effect === "heal") {
    tags.push({ text: t("battle.skillTags.powHeal", { power: s.power }), cls: "t-heal" });
  } else if (s.effect === "revive") {
    tags.push({ text: t("battle.skillTags.revive"), cls: "t-heal" });
  } else if (s.statusKind) {
    const info = statusInfo(s.statusKind);
    tags.push({ text: `${info.label}${s.statusDuration ? ` ${s.statusDuration}t` : ""}`, cls: s.effect === "buff" ? "t-buff" : "t-debuff" });
  }
  tags.push({ text: s.range === 0 ? t("battle.skillTags.self") : t("battle.skillTags.rng", { range: s.range }), cls: "t-meta" });
  if (s.aoe !== "single") tags.push({ text: s.aoe === "cross" ? t("battle.skillTags.cross") : t("battle.skillTags.area"), cls: "t-meta" });
  if (s.knockback) tags.push({ text: t("battle.skillTags.knockback", { amount: s.knockback }), cls: "t-meta" });
  if (s.element !== "none") tags.push({ text: s.element, cls: `t-elem t-${s.element}` });
  return tags;
}