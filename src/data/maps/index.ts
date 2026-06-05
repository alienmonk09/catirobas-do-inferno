import type { MapDef } from "../../core/types";
import { phase1 } from "./phase1";
import { phase2 } from "./phase2";
import { phase3 } from "./phase3";
import { cinderFields } from "./cinderFields";
import { phase4 } from "./phase4";
import { outerRamparts } from "./outerRamparts";
import { phase5 } from "./phase5";

/**
 * All phases in play order. The two large-terrain chapters (Cinder Fields, Outer
 * Ramparts) slot into the march to the keep; Maldrath's stand stays the finale.
 */
export const PHASES: MapDef[] = [phase1, phase2, phase3, cinderFields, phase4, outerRamparts, phase5];
