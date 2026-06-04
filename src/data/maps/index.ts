import type { MapDef } from "../../core/types";
import { phase1 } from "./phase1";
import { phase2 } from "./phase2";
import { phase3 } from "./phase3";
import { phase4 } from "./phase4";
import { phase5 } from "./phase5";

/** All phases in play order. */
export const PHASES: MapDef[] = [phase1, phase2, phase3, phase4, phase5];
