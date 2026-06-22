/**
 * Portuguese (Brazil) translation catalog — the canonical/source locale.
 *
 * Keys are dot-separated paths (e.g. `"common.back"`). Values are PT-BR strings
 * that may contain `{{var}}` interpolation placeholders.
 *
 * To add a new locale:
 *   1. Copy this file to `en-us.ts` (or similar).
 *   2. Translate the leaf strings.
 *   3. Import it in `../index.ts` and add to the `catalogs` map.
 *   4. Extend the `Locale` union in `../types.ts`.
 */
export const ptBr = {
  // ── Shared / common ──────────────────────────────────────────────
  common: {
    on: "Ligado",
    off: "Desligado",
    back: "← Voltar",
    continue: "Continuar",
    buy: "Comprar",
    sell: "Vender",
    gold: "ouro",
    owned: "adquirido",
    empty: "vazio",
    none: "— nenhum —",
    noMods: "sem mods",
    magical: "mágico",
    // Stat abbreviations — kept as-is (universal gamer shorthand)
    hp: "HP",
    mp: "MP",
    atk: "ATK",
    def: "DEF",
    mag: "MAG",
    res: "RES",
    spd: "SPD",
    mov: "MOV",
    jmp: "JMP",
    sp: "SP",
    xp: "XP",
    lv: "Nv",
    pow: "pow",
    rng: "alcance",
  },

  // ── Keybinding action labels ─────────────────────────────────────
  controls: {
    move: "Mover",
    attack: "Atacar",
    skill: "Habilidade",
    item: "Item",
    endTurn: "Encerrar Turno",
    cancel: "Cancelar",
    rotateLeft: "Girar à Esquerda",
    rotateRight: "Girar à Direita",
    recenter: "Recentralizar",
  },

  // ── Battle UI ────────────────────────────────────────────────────
  battle: {
    battleLog: "Registro de Batalha",
    turnOrder: "Ordem de Turnos",
    ally: "Aliado",
    enemy: "Inimigo",
    nextUp: "próximo",
    newSkillReady: "★ Nova habilidade pronta: {{name}}",

    actionMenu: {
      move: "Mover",
      moveTip: "Caminhe até um tile destacado (respeita alcance, terreno e salto) — pressione M",
      undoMove: "Desfazer Movimento",
      undoMoveTip: "Desfaça seu movimento — redefine a posição para mover de novo ou escolher outra ação",
      attack: "Atacar",
      attackTip: "Ataque um inimigo no alcance da arma — flanque ou atinja pelas costas para dano extra — pressione A",
      skill: "Habilidade",
      skillTip: "Use uma habilidade de classe aprendida (custa MP) — pressione S",
      item: "Item",
      itemTip: "Use um consumível compartilhado — pressione I",
      recruit: "Recrutar",
      recruitTip: "Recrute um inimigo enfraquecido adjacente — ele se junta à sua causa e segue em batalhas futuras",
      endTurn: "Encerrar Turno",
      endTurnTip: "Finaliza o turno desta unidade (Enter / E)",
    },

    submenu: {
      skills: "Habilidades — {{mp}}/{{maxMp}} MP",
      noSkills: "Nenhuma habilidade aprendida. Gaste Pontos de Habilidade no Acampamento.",
      notEnoughMP: "MP insuficiente — faltam {{amount}}",
      noItems: "Sem itens.",
      back: "← Voltar",
    },

    dialogue: {
      skip: "Pular",
      next: "Próximo ▸",
      begin: "Começar ▸",
    },

    levelUp: {
      title: "SUBIU DE NÍVEL!",
      newSkill: "Nova habilidade pronta: {{name}}",
      nextMore: "Próximo ({{count}} mais) ▸",
      continue: "Continuar",
    },

    rewards: {
      title: "Despojos de Batalha",
      gold: "Ouro",
      items: "Itens",
      partyXp: "XP do Grupo",
      mvp: "MVP: {{name}} — {{reason}}",
      continue: "Continuar",
    },

    rotate: {
      zoomIn: "Aproximar (+ / roda do mouse) — aproxime para mover o mapa",
      zoomOut: "Afastar (- / roda do mouse)",
      rotateLeft: "Girar vista à esquerda (,)",
      rotateRight: "Girar vista à direita (.)",
      recenter: "Recentralizar na unidade ativa (c)",
      toggleSound: "Alternar som de combate",
      mute: "Silenciar som de combate",
      unmute: "Ativar som de combate",
    },

    unitPanel: {
      xp: "XP {{xp}}/{{need}}",
      weapon: "{{name}} (pow {{power}}, alcance {{range}})",
      skills: "Habilidades: {{skills}}",
      reactions: "Reações: {{reactions}}",
    },

    status: {
      guard: { label: "Guarda", tip: "Defesa aumentada (sofre menos dano físico)" },
      protect: { label: "Proteção", tip: "Sofre 25% menos dano físico" },
      shell: { label: "Escudo", tip: "Sofre 25% menos dano mágico" },
      haste: { label: "Acelera", tip: "Age mais frequentemente (velocidade ×1.5)" },
      regen: { label: "Regen", tip: "Recupera HP ao final de cada turno" },
      slow: { label: "Lento", tip: "Age menos frequentemente (velocidade ×0.5)" },
      poison: { label: "Veneno", tip: "Perde HP ao final de cada turno" },
      stop: { label: "Parado", tip: "Congelado — perde turnos até passar" },
      confuse: { label: "Confuso", tip: "Pode atacar aliados em vez de inimigos" },
      critUp: { label: "Crit+", tip: "Chance de acerto crítico aumentada" },
      reflect: { label: "Refletir", tip: "Reflete um ataque mágico de volta ao conjurador" },
    },

    log: {
      damage: "{{name}} sofre {{amount}} de dano",
      damageCrit: " (crítico!)",
      ko: " — Nocauteado!",
      heal: "{{name}} recupera {{amount}} HP",
      mp: "{{name}} recupera {{amount}} MP",
      revive: "{{name}} foi revivido",
      cured: "{{name}} foi curado de debuffs",
      statusApplied: {
        poison: "{{name}} foi envenenado",
        slow: "{{name}} está lento",
        stop: "{{name}} está parado",
        guard: "{{name}} está em guarda",
        haste: "{{name}} está acelerado",
        regen: "{{name}} está regenerando",
        protect: "{{name}} está protegido",
        shell: "{{name}} está com escudo",
        confuse: "{{name}} está confuso",
        critUp: "{{name}} está com crit+",
        reflect: "{{name}} está com reflexo",
      },
      turnHeader: "— turno de {{name}} —",
      stop: "Parado",
      charging: "Carregando…",
      chargingSkill: "Carregando {{name}}…",
      skillCrashes: "O {{skill}} de {{name}} despenca!",
      beginsCharging: "{{name}} começa a carregar {{skill}}!",
      joinedCatirobas: "{{name}} se juntou ao Catirobas permanentemente!",
      joinedCause: "{{name}} se vira e luta pelo Catirobas!",
      reachesLevel: "{{name}} alcança Nv {{level}}!",
      droppedItem: "{{name}} dropou {{item}}.",
      opensChest: "{{opener}} abre um baú: {{contents}}.",
      chestEmpty: "vazio",
      treasure: "Tesouro!",
      someone: "Alguém",
    },

    objectives: {
      defeat: "Objetivo: derrotar {{target}}",
      survive: "Objetivo: sobreviver {{current}}/{{total}} turnos",
      seize: "Objetivo: capturar o tile marcado",
      defend: "Objetivo: segurar o tile marcado — {{current}}/{{total}} turnos",
      escort: "Objetivo: escoltar {{vip}} até o tile marcado{{hp}}",
      rout: "Objetivo: derrotar todos os inimigos",
    },

    banners: {
      phaseTitle: "Fase {{index}}: {{name}}",
      beginBattle: "Começar Batalha",
      victory: "Vitória!",
      victoryLast: "A Senhora Razão cai. O topo é seu — e com isso, talvez paz.",
      victoryCleared: "{{name}} concluído. Seu grupo se reagrupa e fica mais forte.",
      seeSpoils: "Ver Despojos",
      defeat: "Derrota",
      defeatBody: "Seu grupo caiu. Se reforce e tente novamente.",
      retryPhase: "Tentar Fase",
    },

    hints: {
      keyboardHint: "M Mover · A Atacar · S Habilidade · I Item · Enter/{{endTurn}} encerrar turno · Botão direito/{{cancel}} cancelar · {{rotateLeft}}/{{rotateRight}} girar · ＋/－/roda zoom (aproxime para mover) · {{recenter}} recentralizar",
      move: "Clique em um tile destacado para mover.",
      attack: "Ataque (alcance {{range}}). Clique em um inimigo no alcance.",
      skill: "Escolha uma habilidade.",
      skillTarget: "{{name}}: clique em um tile alvo no alcance.",
      item: "Escolha um item.",
      itemTarget: "{{name}}: clique em um aliado no alcance (ou em você).",
      recruit: "Recrutar: clique em um inimigo enfraquecido adjacente para trazê-lo para seu lado.",
    },

    toasts: {
      covers: "{{actual}} protege {{target}}!",
      noValidTarget: "Sem alvo válido ali.",
      noRoomToLand: "Sem espaço para pousar ao lado do alvo.",
      noEffect: "Isso não tem efeito aqui.",
      treasure: "Tesouro: {{contents}}",
      recruitJoin: "{{name}} se junta à sua causa!",
    },

    popups: {
      revive: "Reviver +{{amount}}",
      mpGain: "+{{amount}} MP",
      cure: "Cura",
    },

    recruitHints: {
      ready: "✦ Recrutamento pronto — use Recrutar para converter este inimigo.",
      recruitable: "✦ Recrutável — aproxime-se e use Recrutar.",
      wornDown: "✦ Pode ser recrutado ao chegar a ≤{{percent}}% HP e adjacente.",
    },

    mvp: {
      kills: "{{count}} abate{{s}}",
      heals: "{{count}} HP curado",
      damage: "{{count}} de dano",
    },

    charging: "Carregando {{name}} — {{turns}} turno(s) restante(s)",

    skillTags: {
      powMag: "{{power}} pow · MAG",
      powAtk: "{{power}} pow · ATK",
      powHeal: "{{power}} pow cura",
      healVerb: "cura",
      damageVerb: "dano",
      revive: "reviver",
      self: "self",
      rng: "alcance {{range}}",
      cross: "cruz",
      area: "3×3",
      knockback: "recuo {{amount}}",
    },

    forecast: {
      flank: "flanco",
      rear: "retaguarda",
      high: "alto",
      low: "baixo",
      weak: "fraco",
      resist: "resiste",
      ko: "KO",
      revive: "Reviver",
      cure: "Cura",
    },
  },

  // ── Menu scenes ──────────────────────────────────────────────────
  menu: {
    title: {
      name: "Catirobas do Inferno",
      tagline: "O Fogo Primordial apagou. A macheza sumiu. E sobrou pra vocês.",
      description: "Uma jornada tática isométrica de pura testosterona (e muita vergonha alheia). Guie quatro perdedores rejeitados pelo reino de Testosteria, lute contra Nice Guys e Trolls Incel, e tente restaurar a glória dos anos 80 antes que a Senhora Razão acabe com a festa.",
      continue: "Continuar",
      newGame: "Novo Jogo",
      settings: "Configurações",
      savedCampaigns: "Campanhas Salvas",
      slotPhase: "Slot {{slot}} — Fase {{phase}} · {{heroes}} heróis",
      slotEmpty: "Slot {{slot}} — vazio",
      jumpToPhase: "Pular para fase (dev):",
      phaseTitle: "Fase {{index}}: {{name}}",
    },
    settings: {
      title: "Configurações",
      sound: "Som",
      music: "Música",
      volume: "Volume",
      textSize: "Tamanho do texto",
      textSizeNormal: "Normal",
      textSizeLarge: "Grande",
      textSizeLarger: "Maior",
      highContrast: "Alto contraste",
      reducedMotion: "Movimento reduzido",
      controls: "Controles",
      resetToDefaults: "Restaurar padrões",
      back: "Voltar",
      pressKey: "…pressione uma tecla",
      volumePercent: "{{value}} por cento",
    },
    victory: {
      campaignComplete: "Campanha Concluída",
      body: "A tirana caiu e o realm respira livre. Seu grupo alcançou nível {{level}}, com {{survivors}} heróis de pé no final. New Game+ disponível — mantenha seu grupo nivelado e enfrente inimigos {{levels}} níveis mais fortes. Obrigado por jogar.",
      ngPlus: "New Game+",
      ngPlusCycle: "New Game+ (ciclo {{cycle}})",
      playAgain: "Jogar Novamente",
    },
  },

  // ── Party camp ───────────────────────────────────────────────────
  party: {
    camp: {
      title: "Acampamento do Grupo",
      classicMode: "⚑ Modo Clássico — heróis caídos são perdidos para sempre.",
      next: "Próxima: Fase {{index}} — {{name}}. As unidades são totalmente restauradas antes de cada batalha.",
      gold: "Ouro: {{amount}}",
      march: "Marchar para Fase {{index}} →",
      tabs: {
        party: "Grupo",
        reinforcements: "Reforços",
        shop: "Loja",
      },
      reinforcements: {
        title: "Reforços — {{open}} slot(s) aberto(s)",
        desc: "A palavra do estandarte se espalha. Escolha um herói para se juntar à sua marcha.",
        joinsAt: "se junha no Nv {{level}}",
      },
      shop: {
        inventory: "Inventário: {{items}}",
        campSupply: "Suprimentos do Acampamento",
        gearShop: "Loja de Equipamentos",
        weaponShop: "Loja de Armas",
        buyEquipment: "Compre equipamento uma vez — qualquer unidade pode equipá-lo.",
        buyWeapons: "Compre armas de melhoria — travadas por classe; uma unidade nunca fica desarmada.",
        sellValue: "Vender +{{value}}",
        armor: "Armadura",
        accessory: "Acessório",
        weaponFormat: "{{name}} (pow {{power}}, alcance {{range}}{{kindTag}}){{deltaTag}}",
        weaponDesc: "POW {{power}}, RNG {{range}} — {{classes}}",
        equipFormat: "{{name}} ({{slot}})",
        equipModDesc: "{{modHint}} — {{description}}",
      },
      unitCard: {
        classLocked: "Classe (travada)",
        classLabel: "Classe",
        classLockedDesc: "{{name}} — classe primária fixa de {{hero}}. Troque via Sub-job abaixo.",
        subJob: "Sub-job (segundo conjunto de skills)",
        subJobCasts: "Usa skills de {{subClass}} junto com {{primary}} — gaste SP em ambos abaixo.",
        subJobPick: "Escolha uma segunda classe para aprender e usar suas skills junto com as suas.",
        reaction: "Reação ({{innate}})",
        innateReactions: "Inata: {{reactions}}",
        noInnateReactions: "Sem reações inatas",
        weapon: "Arma",
        armor: "Armadura",
        accessory: "Acessório",
        skillsLabel: "Habilidades: {{skills}}",
        skillPoints: "◆ {{amount}} Pontos de Habilidade",
        skillsTitle: "Habilidades",
        subTitle: "Sub: {{name}}",
        learn: "{{prefix}}Aprender {{name}} ({{cost}} SP)",
        remaining: "{{count}} restantes",
        needMore: "faltam {{amount}} SP",
        allLearned: "{{prefix}}tudo aprendido ✓",
        gear: "Equipamento {{mods}}",
      },
      characterSheet: {
        experience: "Experiência",
        affinities: "Afinidades",
        growth: "Crescimento / nível",
        mastery: "Maestria",
        mastered: "{{count}} dominadas → +{{hp}} HP, +{{spd}} SPD",
      },
    },
  },

  // ── Party select ─────────────────────────────────────────────────
  partySelect: {
    title: "Escolha Seu Grupo",
    intro: "Quatro heróis rejeitados pelo mundo. Os 4 são fixos — cada um com sua classe primária. Seu grupo cresce conforme a campanha avança via recrutamento.",
    difficulty: "Dificuldade",
    classicMode: "Modo Clássico (morte permanente)",
    classicDesc: "Heróis caídos são perdidos para sempre.",
    saveSlot: "Slot de Save",
    slot: "Slot {{n}}",
    chosen: "Escolhidos {{selected}}/{{size}}",
    begin: "Começar Campanha →",
    permadeathOff: "Desligado",
    permadeathOn: "Ligado",
    difficultyLabels: {
      easy: "Fácil",
      normal: "Normal",
      hard: "Difícil",
      ironic: "Irônico",
    },
    difficultyDescs: {
      easy: "Fácil — inimigos estão dois níveis abaixo",
      normal: "Normal — como projetado",
      hard: "Difícil — inimigos estão no mesmo nível e mais resistentes",
      ironic: "Irônico — inimigos bem mais fracos; para curtir a história sem preocupação",
    },
  },

  // ── Endings ──────────────────────────────────────────────────────
  endings: {
    a: {
      title: "A Coragem da Burrice",
      text: "A macheza real foi a amizade que fizemos no caminho. (Que desastre)",
    },
    b: {
      title: "A Sabedoria da Aceitação",
      text: "Talvez se vocês parassem de tentar, conseguissem.",
    },
    c: {
      title: "O Final Honesto",
      text: "Às vezes o vilão é você.",
    },
    d: {
      title: "A Pirueta Absurda",
      text: "A quarta parede foi destruída pela própria incompetência.",
    },
    retry: "Tentar de Novovo",
    accept: "Aceitar a Derrota",
    screen: "Fim de Jogo",
  },

  // ── Affinity ─────────────────────────────────────────────────────
  affinity: {
    label: "Afinidade",
    unlocked: "Combo Desbloqueado!",
    progress: "{{a}} + {{b}}: {{value}}/{{max}}",
    victoryGain: "+{{amount}} afinidade (vitória)",
    defeatLoss: "-{{amount}} afinidade (derrota)",
  },

  // ── Combos ───────────────────────────────────────────────────────
  combos: {
    socoMagicoBrilhoso: "Soco Mágico Brilhoso",
    abracoMortalDuplo: "Abraço Mortal Duplo",
    formacaoMachezaFinal: "Formação Macheza Final",
    failed: "A falhou! (Typical.)",
    comboMenuLabel: "Combo",
  },

  // ── Reputation ────────────────────────────────────────────────────
  reputation: {
    label: "Reputação",
    refused: "Recusam vender pra vocês.",
    discount: "20% de desconto — malandros simpáticos.",
    neutral: "Neutro",
    low: "Baixa",
    high: "Alta",
  },

  // ── Achievements ──────────────────────────────────────────────────
  achievements: {
    label: "Conquistas",
    unlocked: "Desbloqueada!",
    foramRejeitados: "Foram Rejeitados",
    aindaAqui: "Ainda Aqui?",
    morteHonrosa: "Morte Honrosa",
    quaseCompreensao: "Quase Compreensão",
    finalSecreto: "Final Secreto",
    foramRejeitadosDesc: "Perder para um Nice Guy pela primeira vez.",
    aindaAquiDesc: "Jogar por 30 minutos.",
    morteHonrosaDesc: "Morrer 10 vezes contra o mesmo boss.",
    quaseCompreensaoDesc: "Chegar no final entendendo a piada.",
    finalSecretoDesc: "Derrubar a Senhora Razão com amor (impossível).",
  },

  // ── Save toast ────────────────────────────────────────────────────
  save: {
    toast: "Gravado. Pelo menos vocês tentaram.",
  },
} as const;