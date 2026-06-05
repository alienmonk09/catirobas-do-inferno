import type { ItemDef } from "../core/types";

export const ITEMS: Record<string, ItemDef> = {
  potion: {
    id: "potion",
    name: "Potion",
    description: "Restore 30 HP to an ally.",
    effect: "healHp",
    amount: 30,
    range: 1,
    price: 25,
  },
  hiPotion: {
    id: "hiPotion",
    name: "Hi-Potion",
    description: "Restore 70 HP to an ally.",
    effect: "healHp",
    amount: 70,
    range: 1,
    price: 60,
  },
  ether: {
    id: "ether",
    name: "Ether",
    description: "Restore 20 MP to an ally.",
    effect: "healMp",
    amount: 20,
    range: 1,
    price: 40,
  },
  phoenixDown: {
    id: "phoenixDown",
    name: "Phoenix Down",
    description: "Revive a fallen ally with 20 HP.",
    effect: "revive",
    amount: 20,
    range: 1,
    price: 120,
  },
  hourglass: {
    id: "hourglass",
    name: "Hourglass",
    description: "Hasten an ally, speeding its turns for a few rounds.",
    effect: "buff",
    amount: 0,
    range: 1,
    price: 50,
    statusKind: "haste",
    statusDuration: 3,
  },
};

export function getItem(id: string): ItemDef {
  const i = ITEMS[id];
  if (!i) throw new Error(`Unknown item: ${id}`);
  return i;
}

/** Default shared party inventory: id -> count. */
export function startingInventory(): Record<string, number> {
  return { potion: 5, hiPotion: 2, ether: 2, phoenixDown: 1, hourglass: 2 };
}
