import { ROSTER, PARTY_SIZE, createParty, type HeroDef } from "../data/party";
import { startingInventory } from "../data/items";
import { clearSave } from "../core/state";
import { getClass } from "../data/classes";
import { getRace } from "../data/races";
import { statsForLevel } from "../core/unit";
import { getCharacterSprite, getHeroSprite } from "../data/sprites";
import { el, clear } from "../ui/dom";
import { iconImg } from "../ui/icons";
import type { GameContext, Scene } from "./sceneManager";

/** New Game flow: pick PARTY_SIZE heroes from the roster, then march to Phase I. */
export class PartySelectScene implements Scene {
  private root: HTMLDivElement;
  private selected = new Set<string>();

  constructor(private ctx: GameContext) {
    this.ctx.renderer.clear();
    this.root = el("div", { className: "ui-layer" });
    ctx.uiParent.appendChild(this.root);
    this.render();
  }

  private toggle(id: string): void {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else if (this.selected.size < PARTY_SIZE) {
      this.selected.add(id);
    }
    this.render();
  }

  private begin(): void {
    if (this.selected.size !== PARTY_SIZE) return;
    const order = ROSTER.filter((h) => this.selected.has(h.id)).map((h) => h.id);
    this.ctx.state.party = createParty(order);
    this.ctx.state.inventory = startingInventory();
    this.ctx.state.phaseIndex = 0;
    clearSave();
    this.ctx.nav.toBattle(0);
  }

  private heroCard(hero: HeroDef): HTMLElement {
    const cls = getClass(hero.classId);
    const race = getRace(hero.raceId);
    const s = statsForLevel(hero.classId, 3, hero.raceId);
    const chosen = this.selected.has(hero.id);
    const card = el("div", {
      className: `unit-card selectable${chosen ? " selected" : ""}`,
      onClick: () => this.toggle(hero.id),
    });

    const head = el("div", { className: "card-head" });
    head.appendChild(iconImg(getHeroSprite(hero.id) ?? getCharacterSprite(hero.classId), 44));
    const headText = el("div");
    headText.appendChild(el("h3", { text: hero.name }));
    headText.appendChild(el("div", { className: "role", text: `${cls.name} · ${race.name}` }));
    head.appendChild(headText);
    if (chosen) head.appendChild(el("div", { className: "pick-badge", text: "✓" }));
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
    screen.appendChild(el("h1", { text: "Choose Your Party" }));
    screen.appendChild(
      el("div", {
        className: "sub",
        text: `Five kingdoms fell; these seven still carry the Ashen Banner. Pick ${PARTY_SIZE} to march.`,
      }),
    );

    const grid = el("div", { className: "party-grid" });
    for (const h of ROSTER) grid.appendChild(this.heroCard(h));
    screen.appendChild(grid);

    const footer = el("div", { className: "party-footer" });
    const ready = this.selected.size === PARTY_SIZE;
    footer.appendChild(
      el("div", {
        attrs: { style: "font-size:14px;margin-bottom:10px;opacity:0.85" },
        text: `Chosen ${this.selected.size}/${PARTY_SIZE}`,
      }),
    );
    footer.appendChild(
      el("button", {
        className: "btn",
        text: "Begin Campaign →",
        attrs: ready ? {} : { disabled: "true" },
        onClick: ready ? () => this.begin() : undefined,
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
