import type { ClassId, Unit } from "../core/types";
import { CLASSES, getClass } from "../data/classes";
import { getWeapon } from "../data/weapons";
import { getSkill } from "../data/skills";
import { statsForLevel, nextLearnableSkill, learnNextSkill, xpForLevel } from "../core/unit";
import { saveGame } from "../core/state";
import { PHASES } from "../data/maps";
import { getCharacterSprite, getSkillSprite, getWeaponSprite } from "../data/sprites";
import { el, clear } from "../ui/dom";
import { iconImg } from "../ui/icons";
import type { GameContext, Scene } from "./sceneManager";

/** Between-phase screen: class change, equipment, and spending JP on skills. */
export class PartyScene implements Scene {
  private root: HTMLDivElement;

  constructor(private ctx: GameContext) {
    saveGame(ctx.state); // checkpoint progress
    this.ctx.renderer.clear();
    this.root = el("div", { className: "ui-layer" });
    ctx.uiParent.appendChild(this.root);
    this.render();
  }

  private changeClass(unit: Unit, classId: ClassId): void {
    if (unit.classId === classId) return;
    unit.classId = classId;
    const cls = getClass(classId);
    // Recompute stats for the new class at the unit's level (full HP/MP).
    unit.stats = statsForLevel(classId, unit.level);
    // Re-equip a weapon this class can use.
    if (!cls.weaponIds.includes(unit.weaponId)) unit.weaponId = cls.weaponIds[0];
    // Ensure at least the first class skill is known so the class is usable.
    if (!unit.learnedSkillIds.includes(cls.skillIds[0])) unit.learnedSkillIds.push(cls.skillIds[0]);
    this.render();
  }

  private equip(unit: Unit, weaponId: string): void {
    unit.weaponId = weaponId;
    this.render();
  }

  private learn(unit: Unit): void {
    const next = nextLearnableSkill(unit);
    if (!next) return;
    const cost = getSkill(next).jpCost;
    if (learnNextSkill(unit, cost)) this.render();
  }

  private unitCard(unit: Unit): HTMLElement {
    const cls = getClass(unit.classId);
    const card = el("div", { className: "unit-card" });
    const head = el("div", { className: "card-head" });
    head.appendChild(iconImg(getCharacterSprite(unit.classId), 44));
    const headText = el("div");
    headText.appendChild(el("h3", { text: unit.name }));
    headText.appendChild(el("div", { className: "role", text: `${cls.name} · Lv ${unit.level}` }));
    head.appendChild(headText);
    card.appendChild(head);
    card.appendChild(
      el("div", { className: "role", attrs: { style: "opacity:0.6;margin-bottom:4px" }, text: cls.description }),
    );
    card.appendChild(
      el("div", {
        attrs: { style: "font-size:12px;opacity:0.85" },
        text: `HP ${unit.stats.maxHp} · MP ${unit.stats.maxMp} · ATK ${unit.stats.atk} · DEF ${unit.stats.def} · MAG ${unit.stats.mag} · RES ${unit.stats.res} · SPD ${unit.stats.spd}`,
      }),
    );
    card.appendChild(
      el("div", {
        attrs: { style: "font-size:12px;opacity:0.7;margin-top:4px" },
        text: `XP ${unit.xp}/${xpForLevel(unit.level)}`,
      }),
    );

    // Class change.
    card.appendChild(el("label", { text: "Class" }));
    const classSel = el("select");
    for (const c of Object.values(CLASSES)) {
      const opt = el("option", { text: c.name, attrs: { value: c.id } });
      if (c.id === unit.classId) opt.selected = true;
      classSel.appendChild(opt);
    }
    classSel.addEventListener("change", () => this.changeClass(unit, classSel.value as ClassId));
    card.appendChild(classSel);

    // Equipment.
    card.appendChild(
      el("label", {
        className: "wlabel",
        children: [el("span", { text: "Weapon" }), iconImg(getWeaponSprite(unit.weaponId), 18)],
      }),
    );
    const wSel = el("select");
    for (const wid of cls.weaponIds) {
      const w = getWeapon(wid);
      const opt = el("option", { text: `${w.name} (pow ${w.power}, rng ${w.range})`, attrs: { value: w.id } });
      if (w.id === unit.weaponId) opt.selected = true;
      wSel.appendChild(opt);
    }
    wSel.addEventListener("change", () => this.equip(unit, wSel.value));
    card.appendChild(wSel);

    // Skills.
    const knownIds = unit.learnedSkillIds.filter((id) => cls.skillIds.includes(id));
    const known = knownIds.map((id) => getSkill(id).name);
    card.appendChild(el("div", { className: "skills", text: `Skills: ${known.length ? known.join(", ") : "—"}` }));
    if (knownIds.length) {
      const srow = el("div", { className: "skill-icons" });
      for (const id of knownIds) srow.appendChild(iconImg(getSkillSprite(id), 20));
      card.appendChild(srow);
    }

    const next = nextLearnableSkill(unit);
    const jpLine = el("div", { className: "jpline" });
    jpLine.appendChild(el("span", { text: `JP: ${unit.jp}`, attrs: { style: "font-size:13px" } }));
    if (next) {
      const skill = getSkill(next);
      const affordable = unit.jp >= skill.jpCost;
      jpLine.appendChild(
        el("button", {
          className: "btn small",
          text: `Learn ${skill.name} (${skill.jpCost} JP)`,
          attrs: affordable ? {} : { disabled: "true" },
          onClick: affordable ? () => this.learn(unit) : undefined,
        }),
      );
    } else {
      jpLine.appendChild(el("span", { text: "All skills learned", attrs: { style: "font-size:12px;opacity:0.6" } }));
    }
    card.appendChild(jpLine);
    return card;
  }

  private render(): void {
    clear(this.root);
    const screen = el("div", { className: "party-screen" });
    const idx = this.ctx.state.phaseIndex;
    const nextMap = PHASES[idx];
    screen.appendChild(el("h1", { text: "Party Camp" }));
    screen.appendChild(
      el("div", {
        className: "sub",
        text: `Prepare your party. Next: Phase ${idx + 1} — ${nextMap.name}. Units are fully restored before each battle.`,
      }),
    );

    const grid = el("div", { className: "party-grid" });
    for (const u of this.ctx.state.party) grid.appendChild(this.unitCard(u));
    screen.appendChild(grid);

    const inv = Object.entries(this.ctx.state.inventory)
      .filter(([, c]) => c > 0)
      .map(([id, c]) => `${id} ×${c}`)
      .join("   ");
    screen.appendChild(el("div", { className: "inv-line", text: `Inventory: ${inv || "empty"}` }));

    const footer = el("div", { className: "party-footer" });
    footer.appendChild(
      el("button", {
        className: "btn",
        text: `March to Phase ${idx + 1} →`,
        onClick: () => this.ctx.nav.toBattle(idx),
      }),
    );
    screen.appendChild(footer);
    this.root.appendChild(screen);
  }

  update(_dt: number): void {
    // Static screen; nothing to animate.
  }

  dispose(): void {
    this.root.remove();
  }
}
