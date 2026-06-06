import type { MapDef } from "../../core/types";
import { phase1 } from "./phase1";
import { phase2 } from "./phase2";
import { phase3 } from "./phase3";
import { cinderFields } from "./cinderFields";
import { phase4 } from "./phase4";
import { outerRamparts } from "./outerRamparts";
import { phase5 } from "./phase5";
import { frostspirePass } from "./frostspirePass";
import { sunkenCauseway } from "./sunkenCauseway";
import { emberfallQuarry } from "./emberfallQuarry";
import { howlingSteppe } from "./howlingSteppe";
import { gravewatchHollow } from "./gravewatchHollow";
import { verdantRuins } from "./verdantRuins";
import { ironholdGate } from "./ironholdGate";
import { saltflatMirage } from "./saltflatMirage";
import { drownedVault } from "./drownedVault";
import { maldrathsApproach } from "./maldrathsApproach";

/**
 * All phases in play order. The early chapters set the march; ten larger terrain
 * battles (frostspire → Maldrath's approach) extend the long campaign toward the
 * keep, and Maldrath's stand (phase5) stays the finale.
 */
export const PHASES: MapDef[] = [
  phase1,
  phase2,
  phase3,
  cinderFields,
  phase4,
  outerRamparts,
  frostspirePass,
  sunkenCauseway,
  emberfallQuarry,
  howlingSteppe,
  gravewatchHollow,
  verdantRuins,
  ironholdGate,
  saltflatMirage,
  drownedVault,
  maldrathsApproach,
  phase5,
];
