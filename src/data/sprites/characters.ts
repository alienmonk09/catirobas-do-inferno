import type { ClassId } from "../../core/types";
import type { SpriteDef } from "../../engine/sprite";

import { knight } from "./classes/knight";
import { archer } from "./classes/archer";
import { blackMage } from "./classes/blackMage";
import { whiteMage } from "./classes/whiteMage";
import { monk } from "./classes/monk";
import { thief } from "./classes/thief";
import { druid } from "./classes/druid";
import { timeMage } from "./classes/timeMage";
import { summoner } from "./classes/summoner";
import { geomancer } from "./classes/geomancer";
import { lancer } from "./classes/lancer";
import { paladin } from "./classes/paladin";
import { berserker } from "./classes/berserker";
import { ninja } from "./classes/ninja";

// 38x50 front-facing sprites, one per class.
export const CHARACTER_SPRITES: Record<ClassId, SpriteDef> = {
  knight,
  archer,
  blackMage,
  whiteMage,
  monk,
  thief,
  druid,
  timeMage,
  summoner,
  geomancer,
  lancer,
  paladin,
  berserker,
  ninja,
};
