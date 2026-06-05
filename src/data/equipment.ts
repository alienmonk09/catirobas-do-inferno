import type { EquipmentDef, EquipSlot } from "../core/types";

export const EQUIPMENT: Record<string, EquipmentDef> = {
  leatherArmor: {
    id: "leatherArmor",
    name: "Leather Armor",
    slot: "armor",
    description: "Hardened hides stitched tight. Light protection, a bit of extra health.",
    mod: { def: 3, hp: 8 },
    price: 90,
  },
  chainmail: {
    id: "chainmail",
    name: "Chainmail",
    slot: "armor",
    description: "Interlocked rings of iron. Sturdy, but the weight shaves a step off your stride.",
    mod: { def: 6, hp: 12, spd: -1 },
    price: 200,
  },
  mageRobe: {
    id: "mageRobe",
    name: "Mage Robe",
    slot: "armor",
    description: "Woven with arcane thread. Thin armor, but bolsters magical resilience and MP.",
    mod: { def: 2, res: 4, mp: 6 },
    price: 110,
  },
  plateArmor: {
    id: "plateArmor",
    name: "Plate Armor",
    slot: "armor",
    description: "Full plate steel. Formidable bulk, but severely hampers movement speed.",
    mod: { def: 9, hp: 18, spd: -2 },
    price: 260,
  },
  ironRing: {
    id: "ironRing",
    name: "Iron Ring",
    slot: "accessory",
    description: "A plain iron band that quietly bolsters the wearer's vitality.",
    mod: { hp: 10 },
    price: 80,
  },
  powerBand: {
    id: "powerBand",
    name: "Power Band",
    slot: "accessory",
    description: "A bracer etched with warrior runes. Sharpens the striking arm.",
    mod: { atk: 2 },
    price: 120,
  },
  magePendant: {
    id: "magePendant",
    name: "Mage Pendant",
    slot: "accessory",
    description: "A crystal amulet that hums with latent arcana. Heightens magical power.",
    mod: { mag: 2 },
    price: 120,
  },
  swiftBoots: {
    id: "swiftBoots",
    name: "Swift Boots",
    slot: "accessory",
    description: "Light enchanted boots that let the wearer act sooner on the battlefield.",
    mod: { spd: 2 },
    price: 100,
  },
  // ── Premium tier — expensive end-game gear ────────────────────────────────
  dragonMail: {
    id: "dragonMail",
    name: "Dragon Mail",
    slot: "armor",
    description: "Scales of a fallen wyrm. Tremendous protection and vitality, but ponderous to move in.",
    mod: { def: 12, hp: 24, spd: -2 },
    price: 480,
  },
  archmagusRobe: {
    id: "archmagusRobe",
    name: "Archmagus Robe",
    slot: "armor",
    description: "Vestments humming with deep arcana. Greatly bolsters magical resilience and reserves.",
    mod: { def: 2, res: 7, mp: 16, mag: 1 },
    price: 420,
  },
  hermesBoots: {
    id: "hermesBoots",
    name: "Hermes Boots",
    slot: "accessory",
    description: "Winged boots that all but carry the wearer — far swifter and more mobile.",
    mod: { spd: 3, move: 1 },
    price: 360,
  },
  giantsBelt: {
    id: "giantsBelt",
    name: "Giant's Belt",
    slot: "accessory",
    description: "A broad girdle of titan leather that swells the wearer's vitality.",
    mod: { hp: 28 },
    price: 280,
  },
  sageCirclet: {
    id: "sageCirclet",
    name: "Sage Circlet",
    slot: "accessory",
    description: "A silver band set with a focusing gem — sharpens magic and deepens the mana pool.",
    mod: { mag: 3, mp: 8 },
    price: 340,
  },
  guardianAmulet: {
    id: "guardianAmulet",
    name: "Guardian Amulet",
    slot: "accessory",
    description: "A warded talisman that turns aside both blade and spell alike.",
    mod: { def: 3, res: 3 },
    price: 300,
  },
};

export function getEquipment(id: string): EquipmentDef {
  const e = EQUIPMENT[id];
  if (!e) throw new Error(`Unknown equipment: ${id}`);
  return e;
}

export function equipmentForSlot(slot: EquipSlot): EquipmentDef[] {
  return Object.values(EQUIPMENT).filter((e) => e.slot === slot);
}
