import type { SpriteDef } from "../engine/sprite";
import { spriteToDataURL, spriteWidth, spriteHeight } from "../engine/sprite";
import { el } from "./dom";

/** A pixel-art <img> icon (nearest-neighbor) for DOM menus. `px` sets the width;
 *  height follows the sprite's aspect so taller hero art isn't squashed square. */
export function iconImg(def: SpriteDef, px = 22): HTMLImageElement {
  const w = spriteWidth(def) || 1;
  const h = spriteHeight(def) || 1;
  const ph = Math.round(px * (h / w));
  return el("img", {
    className: "icon",
    attrs: { src: spriteToDataURL(def, 3), width: String(px), height: String(ph), alt: "" },
  });
}

/** A pixel-art portrait that fills its container (CSS-sized), e.g. turn chips. */
export function portraitImg(def: SpriteDef): HTMLImageElement {
  return el("img", { className: "chip-portrait", attrs: { src: spriteToDataURL(def, 3), alt: "" } });
}
