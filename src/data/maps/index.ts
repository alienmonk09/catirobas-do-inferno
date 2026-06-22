import type { MapDef } from "../../core/types";
import { tavernaDoLamento } from "./tavernaDoLamento";
import { florestaDaRejeicao } from "./florestaDaRejeicao";
import { desertoDoEsquecimento } from "./desertoDoEsquecimento";
import { cavernaDoConstrangimento } from "./cavernaDoConstrangimento";
import { vulcaoDaVerdade } from "./vulcaoDaVerdade";
import { monteMacheza } from "./monteMacheza";

/**
 * Os 6 biomas do Catirobas do Inferno em ordem de jogabilidade. Da taverna ao
 * topo do Monte Macheza, dificuldade crescente com mecânicas de bioma ativas no
 * Deserto (confusão a cada 3 turnos) e Vulcão (dano passivo por temperatura).
 */
export const PHASES: MapDef[] = [
  tavernaDoLamento,
  florestaDaRejeicao,
  desertoDoEsquecimento,
  cavernaDoConstrangimento,
  vulcaoDaVerdade,
  monteMacheza,
];