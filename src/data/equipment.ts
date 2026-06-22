import type { EquipmentDef, EquipSlot } from "../core/types";

export const EQUIPMENT: Record<string, EquipmentDef> = {
  leatherArmor: {
    id: "leatherArmor",
    name: "Armadura de Couro",
    slot: "armor",
    description: "Couro endurecido costurado. Proteção leve, um pouco de HP extra.",
    mod: { def: 3, hp: 8 },
    price: 90,
  },
  chainmail: {
    id: "chainmail",
    name: "Cota de Malha",
    slot: "armor",
    description: "Anéis de ferro entrelaçados. Resistente, mas o peso reduz sua velocidade.",
    mod: { def: 6, hp: 12, spd: -1 },
    price: 200,
  },
  mageRobe: {
    id: "mageRobe",
    name: "Túnica de Mago",
    slot: "armor",
    description: "Tecida com fios arcanos. Armadura fina, mas bolstera resiliência mágica e MP.",
    mod: { def: 2, res: 4, mp: 6 },
    price: 110,
  },
  plateArmor: {
    id: "plateArmor",
    name: "Armadura de Placas",
    slot: "armor",
    description: "Placas de aço completo. Bulk formidável, mas prejudica muito a velocidade.",
    mod: { def: 9, hp: 18, spd: -2 },
    price: 260,
  },
  ironRing: {
    id: "ironRing",
    name: "Anel de Ferro",
    slot: "accessory",
    description: "Uma banda de ferro simples que bolstera a vitalidade do portador.",
    mod: { hp: 10 },
    price: 80,
  },
  powerBand: {
    id: "powerBand",
    name: "Bracelete de Poder",
    slot: "accessory",
    description: "Um bracelete gravado com runas guerreiras. Afiada o braço de ataque.",
    mod: { atk: 2 },
    price: 120,
  },
  magePendant: {
    id: "magePendant",
    name: "Pingente Mágico",
    slot: "accessory",
    description: "Um amuleto de cristal que zumbi com arcana latente. Aumenta poder mágico.",
    mod: { mag: 2 },
    price: 120,
  },
  swiftBoots: {
    id: "swiftBoots",
    name: "Botas Velozes",
    slot: "accessory",
    description: "Botas encantadas leves que deixam o portador agir mais cedo na batalha.",
    mod: { spd: 2 },
    price: 100,
  },
  dragonMail: {
    id: "dragonMail",
    name: "Armadura de Dragão",
    slot: "armor",
    description: "Escamas de um wyrm caído. Proteção tremenda e vitalidade, mas lenta.",
    mod: { def: 12, hp: 24, spd: -2 },
    price: 480,
  },
  archmagusRobe: {
    id: "archmagusRobe",
    name: "Túnica de Arquimago",
    slot: "armor",
    description: "Vestes que zumbi com arcana profunda. bolstera muito resiliência mágica e reserves.",
    mod: { def: 2, res: 7, mp: 16, mag: 1 },
    price: 420,
  },
  hermesBoots: {
    id: "hermesBoots",
    name: "Botas de Hermes",
    slot: "accessory",
    description: "Botas aladas que quase carregam o portador — muito mais veloz e móvel.",
    mod: { spd: 3, move: 1 },
    price: 360,
  },
  giantsBelt: {
    id: "giantsBelt",
    name: "Cinto de Gigante",
    slot: "accessory",
    description: "Um cinto largo de couro de titã que swell a vitalidade do portador.",
    mod: { hp: 28 },
    price: 280,
  },
  sageCirclet: {
    id: "sageCirclet",
    name: "Diadema do Sábio",
    slot: "accessory",
    description: "Uma banda de prata com gema de foco — afia magia e deepena o pool de mana.",
    mod: { mag: 3, mp: 8 },
    price: 340,
  },
  guardianAmulet: {
    id: "guardianAmulet",
    name: "Amuleto Guardião",
    slot: "accessory",
    description: "Um talismã warded que desvia tanto lâmina quanto feitiço.",
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