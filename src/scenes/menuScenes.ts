import { createStartingParty } from "../data/party";
import { startingInventory } from "../data/items";
import { clearSave, loadGame, type GameState } from "../core/state";
import { el } from "../ui/dom";
import type { GameContext, Scene } from "./sceneManager";

function resetState(state: GameState): void {
  state.party = createStartingParty();
  state.inventory = startingInventory();
  state.phaseIndex = 0;
}

function applyLoaded(state: GameState, loaded: GameState): void {
  state.party = loaded.party;
  state.inventory = loaded.inventory;
  state.phaseIndex = loaded.phaseIndex;
}

/** A simple full-screen menu built from a banner card. */
class BannerScene implements Scene {
  protected root: HTMLDivElement;

  constructor(protected ctx: GameContext) {
    this.ctx.renderer.clear();
    this.root = el("div", { className: "ui-layer" });
    ctx.uiParent.appendChild(this.root);
  }

  protected showCard(title: string, body: string, buttons: Array<{ label: string; onClick: () => void }>): void {
    const banner = el("div", { className: "banner" });
    const card = el("div", { className: "banner-card" });
    card.appendChild(el("h1", { text: title }));
    card.appendChild(el("p", { text: body }));
    const row = el("div", { attrs: { style: "display:flex;gap:10px;justify-content:center;flex-wrap:wrap" } });
    for (const b of buttons) row.appendChild(el("button", { className: "btn", text: b.label, onClick: b.onClick }));
    card.appendChild(row);
    banner.appendChild(card);
    this.root.appendChild(banner);
  }

  update(_dt: number): void {}

  dispose(): void {
    this.root.remove();
  }
}

export class TitleScene extends BannerScene {
  constructor(ctx: GameContext) {
    super(ctx);
    const buttons: Array<{ label: string; onClick: () => void }> = [
      {
        label: "New Game",
        onClick: () => {
          resetState(this.ctx.state);
          clearSave();
          this.ctx.nav.toBattle(0);
        },
      },
    ];
    const save = loadGame();
    if (save) {
      buttons.push({
        label: `Continue (Phase ${save.phaseIndex + 1})`,
        onClick: () => {
          applyLoaded(this.ctx.state, save);
          this.ctx.nav.toParty();
        },
      });
    }
    this.showCard(
      "TACTICS",
      "An isometric, turn-based tactics campaign. Lead five heroes — knight, archer, black mage, white mage, and monk — through five battles of rising peril. Move, strike, cast, and grow.",
      buttons,
    );
  }
}

export class VictoryScene extends BannerScene {
  constructor(ctx: GameContext) {
    super(ctx);
    clearSave();
    const survivors = ctx.state.party.filter((u) => u.alive).length;
    const maxLevel = Math.max(...ctx.state.party.map((u) => u.level));
    this.showCard(
      "Campaign Complete",
      `The tyrant is undone and the realm breathes free. Your party reached level ${maxLevel}, with ${survivors} heroes standing at the end. Thank you for playing.`,
      [
        {
          label: "Play Again",
          onClick: () => {
            resetState(this.ctx.state);
            this.ctx.nav.toTitle();
          },
        },
      ],
    );
  }
}
