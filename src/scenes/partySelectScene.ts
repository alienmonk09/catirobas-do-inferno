import { ROSTER, PARTY_SIZE, createStartingParty, type HeroDef } from "../data/party";
import { startingInventory } from "../data/items";
import { clearSave, SAVE_SLOTS } from "../core/state";
import type { Difficulty } from "../core/types";
import { getClass } from "../data/classes";
import { getRace } from "../data/races";
import { statsForLevel } from "../core/unit";
import { getHeroSprite, getCharacterSprite } from "../data/sprites";
import { el, clear } from "../ui/dom";
import { iconImg } from "../ui/icons";
import { t } from "../i18n";
import type { GameContext, Scene } from "./sceneManager";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: t("partySelect.difficultyLabels.easy"),
  normal: t("partySelect.difficultyLabels.normal"),
  hard: t("partySelect.difficultyLabels.hard"),
  ironic: t("partySelect.difficultyLabels.ironic"),
};

const DIFFICULTY_DESCS: Record<Difficulty, string> = {
  easy: t("partySelect.difficultyDescs.easy"),
  normal: t("partySelect.difficultyDescs.normal"),
  hard: t("partySelect.difficultyDescs.hard"),
  ironic: t("partySelect.difficultyDescs.ironic"),
};

/** New Game flow: pick PARTY_SIZE heroes from the roster, then march to Phase I. */
export class PartySelectScene implements Scene {
  private root: HTMLDivElement;
  private difficulty: Difficulty = "normal";
  private permadeath = false;
  private slot = 0;

  constructor(private ctx: GameContext) {
    this.ctx.renderer.clear();
    this.root = el("div", { className: "ui-layer" });
    ctx.uiParent.appendChild(this.root);
    this.render();
  }

  private setDifficulty(d: Difficulty): void {
    this.difficulty = d;
    this.render();
  }

  private setPermadeath(on: boolean): void {
    this.permadeath = on;
    this.render();
  }

  private setSlot(s: number): void {
    this.slot = s;
    this.render();
  }

  private begin(): void {
    this.ctx.state.party = createStartingParty();
    this.ctx.state.inventory = startingInventory();
    this.ctx.state.phaseIndex = 0;
    this.ctx.state.difficulty = this.difficulty;
    this.ctx.state.gold = 0;
    this.ctx.state.ownedEquipment = [];
    // Seed ownedWeapons from the starting party's equipped weapons.
    this.ctx.state.ownedWeapons = [...new Set(this.ctx.state.party.map((u) => u.weaponId))];
    this.ctx.state.slot = this.slot;
    this.ctx.state.ngPlus = 0;
    this.ctx.state.permadeath = this.permadeath;
    clearSave(this.slot);
    this.ctx.nav.toBattle(0);
  }

  private heroCard(hero: HeroDef): HTMLElement {
    const cls = getClass(hero.classId);
    const race = getRace(hero.raceId);
    const s = statsForLevel(hero.classId, 3, hero.raceId);
    const card = el("div", { className: "unit-card selected locked" });

    const head = el("div", { className: "card-head" });
    head.appendChild(iconImg(getHeroSprite(hero.id) ?? getCharacterSprite(hero.classId), 44));
    const headText = el("div");
    headText.appendChild(el("h3", { text: hero.name }));
    headText.appendChild(el("div", { className: "role", text: `${cls.name} · ${race.name}` }));
    head.appendChild(headText);
    head.appendChild(el("div", { className: "pick-badge", text: "✓" }));
    card.appendChild(head);

    card.appendChild(
      el("div", { className: "role", attrs: { style: "opacity:0.6;margin-bottom:4px" }, text: cls.description }),
    );
    card.appendChild(
      el("div", { attrs: { style: "font-size:11px;opacity:0.6;margin-bottom:4px" }, text: race.description }),
    );
    card.appendChild(
      el("div", {
        attrs: { style: "font-size:12px;opacity:0.85" },
        text: `HP ${s.maxHp} · MP ${s.maxMp} · ATK ${s.atk} · DEF ${s.def} · MAG ${s.mag} · RES ${s.res} · SPD ${s.spd} · MOV ${s.move}`,
      }),
    );
    return card;
  }

  private render(): void {
    clear(this.root);
    const screen = el("div", { className: "party-screen" });

    // --- Header (fixed) ---
    const head = el("div", { className: "party-head" });
    head.appendChild(el("h1", { text: t("partySelect.title") }));
    head.appendChild(
      el("div", {
        className: "sub",
        text: t("partySelect.intro", { size: PARTY_SIZE }),
      }),
    );
    screen.appendChild(head);

    // --- Body (scrolls): roster grid + campaign config ---
    const body = el("div", { className: "party-body" });
    const grid = el("div", { className: "party-grid" });
    for (const h of ROSTER) grid.appendChild(this.heroCard(h));
    body.appendChild(grid);

    // Difficulty selector
    body.appendChild(el("div", { attrs: { style: "font-size:13px;font-weight:700;opacity:0.7;margin:16px 0 6px;text-align:center" }, text: t("partySelect.difficulty") }));
    const diffRow = el("div", { className: "difficulty-row" });
    for (const d of ["easy", "normal", "hard", "ironic"] as Difficulty[]) {
      const active = this.difficulty === d;
      diffRow.appendChild(
        el("button", {
          className: `diff-btn ${d}${active ? " active" : ""}`,
          text: DIFFICULTY_LABELS[d],
          onClick: () => this.setDifficulty(d),
        }),
      );
    }
    body.appendChild(diffRow);
    body.appendChild(el("div", { className: "diff-desc", text: DIFFICULTY_DESCS[this.difficulty] }));

    // Classic mode (permadeath) toggle
    body.appendChild(el("div", { attrs: { style: "font-size:13px;font-weight:700;opacity:0.7;margin-bottom:6px;margin-top:10px;text-align:center" }, text: t("partySelect.classicMode") }));
    const permaRow = el("div", { className: "difficulty-row" });
    for (const [label, on] of [[t("partySelect.permadeathOff"), false], [t("partySelect.permadeathOn"), true]] as [string, boolean][]) {
      const active = this.permadeath === on;
      permaRow.appendChild(
        el("button", {
          className: `diff-btn${active ? (on ? " active hard" : " active normal") : ""}`,
          text: label,
          onClick: () => this.setPermadeath(on),
        }),
      );
    }
    body.appendChild(permaRow);
    body.appendChild(el("div", { className: "diff-desc", text: t("partySelect.classicDesc") }));

    // Save slot selector
    body.appendChild(el("div", { attrs: { style: "font-size:13px;font-weight:700;opacity:0.7;margin-bottom:6px;margin-top:10px;text-align:center" }, text: t("partySelect.saveSlot") }));
    const slotRow = el("div", { className: "difficulty-row" });
    for (let s = 0; s < SAVE_SLOTS; s++) {
      const active = this.slot === s;
      slotRow.appendChild(
        el("button", {
          className: `diff-btn${active ? " active normal" : ""}`,
          text: t("partySelect.slot", { n: s + 1 }),
          onClick: () => this.setSlot(s),
        }),
      );
    }
    body.appendChild(slotRow);
    screen.appendChild(body);

    // --- Footer (fixed): selection count + the Begin action, always reachable ---
    const footer = el("div", { className: "party-footer" });
    footer.appendChild(
      el("div", {
        attrs: { style: "font-size:14px;margin-bottom:8px;opacity:0.85" },
        text: t("partySelect.chosen", { selected: PARTY_SIZE, size: PARTY_SIZE }),
      }),
    );
    footer.appendChild(
      el("button", {
        className: "btn",
        text: t("partySelect.begin"),
        onClick: () => this.begin(),
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
