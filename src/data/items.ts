import type { ItemDef } from "../core/types";

/**
 * Itens do Catirobas do Inferno. 8 itens do GDD + 1 Phoenix Down (necessário
 * para o sistema de revive do engine).
 *
 * Mapeamento interno (IDs estáveis → item GDD):
 *   potion       → Cerveja             (healHp 30)
 *   hiPotion     → Pizza Fria          (healHp 20)
 *   ether        → Energético Misterioso (healMp 50)
 *   phoenixDown  → Phoenix Down         (revive 20 — engine item)
 *   hourglass    → Doritos Flamin' Hot  (healHp 15; critUp em W4)
 *   remedy       → Manual de Conversação (cureStatus)
 *   xPotion      → Foto do Boleto       (healHp 45; confuse em W4)
 *   turboEther   → Espelho Quebrado    (buff shell; reflect em W4)
 *   megaPhoenix  → Maconha de Zezé     (revive 80; full heal + confuse em W4)
 */
export const ITEMS: Record<string, ItemDef> = {
  potion: {
    id: "potion",
    name: "Cerveja",
    description: "Restaura 30 HP. Bebida de poder.",
    effect: "healHp",
    amount: 30,
    range: 1,
    price: 30,
  },
  hiPotion: {
    id: "hiPotion",
    name: "Pizza Fria",
    description: "Restaura 20 HP. Comida de losers.",
    effect: "healHp",
    amount: 20,
    range: 1,
    price: 20,
  },
  ether: {
    id: "ether",
    name: "Energético Misterioso",
    description: "Restaura 50 MP. Claramente tem coisas estranhas.",
    effect: "healMp",
    amount: 50,
    range: 1,
    price: 60,
  },
  phoenixDown: {
    id: "phoenixDown",
    name: "Phoenix Down",
    description: "Revive um aliado caído com 20 HP.",
    effect: "revive",
    amount: 20,
    range: 1,
    price: 120,
  },
  hourglass: {
    id: "hourglass",
    name: "Doritos Flamin' Hot",
    description: "Restaura 15 HP. +10% chance crítico por 2 turnos. \"Pode me comer a senha do WiFi?\"",
    effect: "healHp",
    amount: 15,
    range: 1,
    price: 50,
  },
  remedy: {
    id: "remedy",
    name: "Manual de Conversação",
    description: "Cura veneno, lentidão e paralisia de um aliado. Reduz dano mental 20%.",
    effect: "cureStatus",
    amount: 0,
    range: 1,
    price: 45,
  },
  xPotion: {
    id: "xPotion",
    name: "Foto do Boleto",
    description: "Restaura 45 HP. Risada controlada. (Confund inimigo em W4)",
    effect: "healHp",
    amount: 45,
    range: 1,
    price: 90,
  },
  turboEther: {
    id: "turboEther",
    name: "Espelho Quebrado",
    description: "Concede Shell (resistência mágica). Reflete 1 ataque mágico. (Reflect em W4)",
    effect: "buff",
    amount: 0,
    range: 1,
    price: 80,
    statusKind: "shell",
    statusDuration: 3,
  },
  megaPhoenix: {
    id: "megaPhoenix",
    name: "Maconha de Zezé",
    description: "Revive um aliado com 80 HP. Restaura TUDO mas deixa confusos 3 turnos. (Full heal + confuse em W4)",
    effect: "revive",
    amount: 80,
    range: 1,
    price: 200,
  },
};

export function getItem(id: string): ItemDef {
  const i = ITEMS[id];
  if (!i) throw new Error(`Unknown item: ${id}`);
  return i;
}

/** Default shared party inventory: id -> count. */
export function startingInventory(): Record<string, number> {
  return { potion: 4, hiPotion: 3, ether: 2, phoenixDown: 1, hourglass: 2 };
}