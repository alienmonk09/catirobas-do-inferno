import type { SpriteDef } from "../engine/sprite";
import { spriteToDataURL } from "../engine/sprite";
import { el } from "./dom";

/** A pixel-art <img> icon (nearest-neighbor) for DOM menus. */
export function iconImg(def: SpriteDef, px = 22): HTMLImageElement {
  return el("img", {
    className: "icon",
    attrs: { src: spriteToDataURL(def, 3), width: String(px), height: String(px), alt: "" },
  });
}

/** A pixel-art portrait that fills its container (CSS-sized), e.g. turn chips. */
export function portraitImg(def: SpriteDef): HTMLImageElement {
  return el("img", { className: "chip-portrait", attrs: { src: spriteToDataURL(def, 3), alt: "" } });
}
