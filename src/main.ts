import { Renderer } from "./engine/renderer";
import { Input } from "./engine/input";
import { Animator } from "./engine/animator";
import { GameLoop } from "./engine/loop";
import { createGameState } from "./core/state";
import { PHASES } from "./data/maps";
import { injectStyles } from "./ui/styles";
import { SceneManager, type GameContext } from "./scenes/sceneManager";
import { TitleScene, VictoryScene } from "./scenes/menuScenes";
import { BattleScene } from "./scenes/battleScene";
import { PartyScene } from "./scenes/partyScene";
import { PartySelectScene } from "./scenes/partySelectScene";

function boot(): void {
  const app = document.getElementById("app");
  const canvas = document.getElementById("game") as HTMLCanvasElement | null;
  if (!app || !canvas) throw new Error("Missing #app or #game canvas");

  injectStyles();
  const renderer = new Renderer(canvas);
  const input = new Input(canvas);
  const animator = new Animator();
  const state = createGameState();
  const manager = new SceneManager();

  const ctx: GameContext = {
    renderer,
    input,
    animator,
    uiParent: app,
    state,
    nav: {
      toTitle: () => manager.change(new TitleScene(ctx)),
      toPartySelect: () => manager.change(new PartySelectScene(ctx)),
      toBattle: (i: number) => manager.change(new BattleScene(ctx, PHASES[i], i)),
      toParty: () => manager.change(new PartyScene(ctx)),
      toVictory: () => manager.change(new VictoryScene(ctx)),
    },
  };

  const resize = () => {
    renderer.resize(app.clientWidth, app.clientHeight);
    manager.resize();
  };
  resize();
  window.addEventListener("resize", resize);

  ctx.nav.toTitle();

  const loop = new GameLoop((dt) => manager.update(dt));
  loop.start();
}

try {
  boot();
} catch (err) {
  // A throw during boot would otherwise leave the player on a blank dark canvas
  // with the error buried in devtools. Surface a minimal visible fallback.
  console.error("Ashen Banner failed to start:", err);
  const app = document.getElementById("app");
  if (app) {
    app.textContent = "Failed to start. Open the browser console for details.";
    app.style.cssText =
      "display:flex;align-items:center;justify-content:center;height:100%;color:#e8e8f2;font:16px system-ui,sans-serif;text-align:center;padding:24px;";
  }
}
