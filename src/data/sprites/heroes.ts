import type { SpriteDef } from "../../engine/sprite";
import { boleto } from "./heroes/boleto";
import { porquinho } from "./heroes/porquinho";
import { meleca } from "./heroes/meleca";
import { caveira } from "./heroes/caveira";

export const HERO_SPRITES: Record<string, SpriteDef> = {
  boleto,
  porquinho,
  meleca,
  caveira,
};
