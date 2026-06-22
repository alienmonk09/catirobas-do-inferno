export interface AchievementDef {
  id: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  foramRejeitados: {
    id: "foramRejeitados",
    name: "Foram Rejeitados",
    description: "Perder para um Nice Guy pela primeira vez.",
  },
  aindaAqui: {
    id: "aindaAqui",
    name: "Ainda Aqui?",
    description: "Jogar por 30 minutos.",
  },
  morteHonrosa: {
    id: "morteHonrosa",
    name: "Morte Honrosa",
    description: "Morrer 10 vezes contra o mesmo boss.",
  },
  quaseCompreensao: {
    id: "quaseCompreensao",
    name: "Quase Compreensão",
    description: "Chegar no final entendendo a piada.",
  },
  finalSecreto: {
    id: "finalSecreto",
    name: "Final Secreto",
    description: "Derrubar a Senhora Razão com amor (impossível).",
  },
};

export function unlockAchievement(
  unlocked: string[],
  achievementId: string,
): boolean {
  if (unlocked.includes(achievementId)) return false;
  unlocked.push(achievementId);
  return true;
}

export function isAchievementUnlocked(
  unlocked: string[],
  achievementId: string,
): boolean {
  return unlocked.includes(achievementId);
}