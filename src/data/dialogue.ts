export interface DialogueLine {
  speaker: string;
  text: string;
}

export const PHASE_DIALOGUE: Record<string, DialogueLine[]> = {
  tavernaDoLamento: [
    { speaker: "—", text: "A Taverna do Lamento. Tudo começou aqui — ou talvez nada." },
    { speaker: "Boleto", text: "Cara, as mulheres não entendem. Eu sou literalmente perfeito!" },
    { speaker: "Caveira", text: "Você tem literalmente metade da sua espada partida." },
    { speaker: "Boleto", text: "Isso é estilo vintage, meu." },
    { speaker: "Porquinho", text: "...vocês acham que se eu aprender mais magia?" },
    { speaker: "Meleca", text: "Uma vez uma menina não saiu correndo. Acho que foi amor." },
    { speaker: "Caveira", text: "Ela estava paralisada de horror." },
    { speaker: "Meleca", text: "Detalhe..." },
    { speaker: "Zezé", text: "E aí galera, sou Zezé. Tipo... a mina do universo não quer saber de vocês." },
    { speaker: "Boleto", text: "MAS EU SOU---" },
    { speaker: "Zezé", text: "Sim sim, muito quente. Vocês tão sozinhos porque são meio... chatos." },
    { speaker: "Caveira", text: "Pelo menos isso é honesto." },
    { speaker: "Zezé", text: "Mas tipo, existe um Fogo Primordial que pode restaurar a MACHEZA. Vocês tem que levá-" },
    { speaker: "Porquinho", text: "Por que ele faria diferença???" },
    { speaker: "Zezé", text: "Né? Boa pergunta. Mas vocês vão mesmo assim porque são MUITO burro---digo, corajosos." },
    { speaker: "Meleca", text: "Como é que tira essa coragem?" },
    { speaker: "Zezé", text: "Mano, vocês tá no inferno mesmo. Vai lá." },
    { speaker: "Boleto", text: "Bora! Vamos restaurar a MACHEZA!" },
    { speaker: "—", text: "[Todos suspiram existencialmente]" },
  ],
  florestaDaRejeicao: [
    { speaker: "—", text: "Árvores com rostos que riem de você. Bem-vindo à Floresta da Rejeição." },
    { speaker: "Meleca", text: "As árvores tão rindo da gente. Será que sabem daquela vez?" },
    { speaker: "Boleto", text: "Todo mundo sabe daquela vez, Meleca." },
    { speaker: "Caveira", text: "Menos rejeição, mais combate. Olha lá — uns Nice Guys encomodando o bartender." },
    { speaker: "Boleto", text: "Deixa comigo. Eu sou perfeito, lembra?" },
    { speaker: "Porquinho", text: "Será que tem cerveja depois?" },
    { speaker: "Caveira", text: "Focus, pessoal. O Homem Árvore tá na frente." },
    { speaker: "Meleca", text: "E ele tá rindo. Igual todo mundo." },
  ],
  desertoDoEsquecimento: [
    { speaker: "—", text: "Areia, calor, e solidão absoluta. Até os heróis se esquecem quem são." },
    { speaker: "Porquinho", text: "Tá quente demais pra pensar. Tá quente demais pra existir." },
    { speaker: "Boleto", text: "A gente se esqueceu de novo ou já tava esquecido?" },
    { speaker: "Meleca", text: "Não sei, mas a miragem tá linda. Será que ela me ignora também?" },
    { speaker: "Boleto", text: "Olá bela dama! Eu sou---" },
    { speaker: "Mulher", text: "Não." },
    { speaker: "Boleto", text: "Mas você nem me ouviu!" },
    { speaker: "Mulher", text: "Ouvi. Entendi tudo. Não." },
    { speaker: "Caveira", text: "Tem até uma eficiência em rejeitar gente." },
    { speaker: "Meleca", text: "Uma mulher que rejeita rápido? Talvez ela goste de..." },
    { speaker: "Mulher", text: "Não." },
    { speaker: "Porquinho", text: "Por que sempre não?" },
    { speaker: "Zezé", text: "Porque vocês sai falando 'eu sou' o tempo todo. Tipo, tenta... escutar?" },
    { speaker: "Caveira", text: "Escutar? Nós? Ousadia." },
  ],
  cavernaDoConstrangimento: [
    { speaker: "—", text: "Uma caverna que ecoa flashbacks. Cada passo lembra algo que ninguém quer lembrar." },
    { speaker: "Caveira", text: "Isso é... uma ex-namorada imaginária minha?" },
    { speaker: "Boleto", text: "Caveira, você nunca teve namorada. Imaginária ou não." },
    { speaker: "Meleca", text: "Eu também não. Mas pelo menos eu admito." },
    { speaker: "Porquinho", text: "A caverna tá mostrando aquela vez que eu tentei magia na festa..." },
    { speaker: "Boleto", text: "Você conjurou uma cerveja morna. Na cabeça do cara." },
    { speaker: "Caveira", text: "A cerveja estava morna antes ou depois do impacto?" },
    { speaker: "Meleca", text: "Importante: o cara era o crush do Porquinho." },
    { speaker: "Porquinho", text: "Eu não disse que era crush. Eu disse que era... interessante." },
    { speaker: "—", text: "A caverna ecoa. Os heróis encaram o próprio reflexo — ligeiramente mais atraente." },
    { speaker: "Caveira", text: "Tá. Chega de flashbacks. Vamos bater em nós mesmos e seguir." },
  ],
  vulcaoDaVerdade: [
    { speaker: "—", text: "O Vulcão da Verdade. O fogo brilha, tudo é quente, e nada se esconde." },
    { speaker: "Boleto", text: "Tá quente. Tá MUITO quente. Alguém traz cerveja?" },
    { speaker: "Zezé", text: "Mano, vocês achava que tava tudo errado com as mina? Tipo... eu vou ser honesto. Problema é vocês." },
    { speaker: "Caveira", text: "Zezé, agora sério? No meio do vulcão?" },
    { speaker: "Zezé", text: "Mas sabe o que? Vocês ainda tá aqui tentando. Isso é meio de macheza mesmo. Não essa coisa de bravata, mas tipo... coragem de ser burro e continuar." },
    { speaker: "Boleto", text: "Zezé, isso foi quase profundo. Quase." },
    { speaker: "Porquinho", text: "Ele tá certo, né? A gente tá aqui. No vulcão. Ainda tentando." },
    { speaker: "Meleca", text: "É. Tipo, se a gente tá fracassando, tamo fracassando em equipe." },
    { speaker: "Caveira", text: "A Manifestação da Realidade tá na frente. Vamos." },
  ],
  monteMacheza: [
    { speaker: "—", text: "O topo do Monte Macheza. O Fogo Primordial existe — ou não." },
    { speaker: "Boleto", text: "Conseguimos! O Fogo Primordial!" },
    { speaker: "Porquinho", text: "Espera... é só um balde de combustível?" },
    { speaker: "Caveira", text: "Uma metáfora muito óbvia." },
    { speaker: "Meleca", text: "Mas... ele tá brilhando?" },
    { speaker: "Zezé", text: "Mano... vocês querendo que eu explique a metáfora ou vocês quer de verdade salvar o mundo?" },
    { speaker: "Boleto", text: "VAMOS USAR O PODER DA MACHEZA!" },
    { speaker: "Zezé", text: "Tá bom. Mais uma chance ao universo." },
    { speaker: "Senhora Razão", text: "Vocês pensam que fogo muda o que vocês são?" },
    { speaker: "Caveira", text: "Ah, agora ela fala." },
    { speaker: "Senhora Razão", text: "Vocês estão aqui porque recusam ver a si mesmos." },
    { speaker: "Porquinho", text: "Será que... ela tá certa?" },
    { speaker: "Boleto", text: "NÃO! VAMOS LUTAR PORQUE... PORQUE..." },
    { speaker: "Caveira", text: "Porque não temos alternativa melhor?" },
    { speaker: "Meleca", text: "Pelo menos estamos juntos pra fracassar?" },
    { speaker: "Senhora Razão", text: "Exatamente. E isso é quase bonito." },
    { speaker: "Zezé", text: "Sabia que vocês iam entender no final." },
  ],
};

export function dialogueFor(mapId: string): DialogueLine[] {
  return PHASE_DIALOGUE[mapId] ?? [];
}

export const PHASE_OUTRO: Record<string, DialogueLine[]> = {
  tavernaDoLamento: [
    { speaker: "Boleto", text: "Outro vencido!" },
    { speaker: "Caveira", text: "Ele só... permaneceu inerte. Nem era um combate." },
    { speaker: "Boleto", text: "Mas EU ganhei!" },
    { speaker: "Porquinho", text: "Seria legal se a gente tivesse evitado essa luta..." },
    { speaker: "Meleca", text: "Sempre a mesma coisa. Nem sinto nada quando ganho." },
    { speaker: "—", text: "Os heróis sobreviveram à taverna. Será o começo de algo grande ou apenas patético?" },
  ],
  florestaDaRejeicao: [
    { speaker: "Meleca", text: "As árvores pararam de rir. Acho que morreram de tanto rir da gente." },
    { speaker: "Caveira", text: "Homem Árvore derrotado. Ninguém ri da Caveira." },
    { speaker: "Boleto", text: "Derrotamos um cara que era literalmente uma árvore. É progresso." },
    { speaker: "Porquinho", text: "As folhas já tão caindo. Ou eram lágrimas?" },
    { speaker: "—", text: "A Floresta da Rejeição está silenciosa — pela primeira vez." },
  ],
  desertoDoEsquecimento: [
    { speaker: "Boleto", text: "A miragem desapareceu quando percebemos que era ilusão. Igual tudo na vida." },
    { speaker: "Porquinho", text: "Ainda tô com areia na cueca." },
    { speaker: "Caveira", text: "A mulher do deserto já foi embora. Nem olhou pra trás." },
    { speaker: "Meleca", text: "Ela foi rápida demais. Igual todas." },
    { speaker: "—", text: "O deserto esqueceu dos heróis — e eles esqueceram dele." },
  ],
  cavernaDoConstrangimento: [
    { speaker: "Caveira", text: "Derrotei meu reflexo. Ele era mais bonito, mas eu sou mais burro — e isso vence." },
    { speaker: "Meleca", text: "A caverna parou de ecoar. Acho que nossos segredos ficaram aqui." },
    { speaker: "Porquinho", text: "A cerveja morna nunca saiu da minha cabeça. Literalmente." },
    { speaker: "Boleto", text: "Pelo menos agora eu sei que sou constrangedor. Antes era só suspeita." },
    { speaker: "—", text: "A Caverna do Constrangimento engoliu a vergonha — e devolveu calma." },
  ],
  vulcaoDaVerdade: [
    { speaker: "Zezé", text: "Vocês ainda tá aqui tentando. Isso é meio de macheza mesmo. Não essa coisa de bravata — coragem de ser burro e continuar." },
    { speaker: "Boleto", text: "Zezé, isso foi quase profundo. Quase." },
    { speaker: "Caveira", text: "A Manifestação da Realidade se dissipou ao aceitar que era manifestação. O vulcão esfria." },
    { speaker: "Porquinho", text: "Ainda tô suando. Mas agora é suor de vitória. Acho." },
    { speaker: "Meleca", text: "Viu, Caveira? Suor emocional." },
  ],
  monteMacheza: [
    { speaker: "—", text: "A Senhora Razão se foi. O Fogo Primordial brilha — ou talvez não. Depende." },
    { speaker: "Boleto", text: "A gente conseguiu. Será que as minas ainda tão ignorando a gente?" },
    { speaker: "Porquinho", text: "Provavelmente. Mas pelo menos a gente parou de tentar." },
    { speaker: "Caveira", text: "E isso é quase sabedoria." },
    { speaker: "Meleca", text: "Quase. Mas é mais do que tínhamos ontem." },
  ],
};

export function outroFor(mapId: string): DialogueLine[] {
  return PHASE_OUTRO[mapId] ?? [];
}

export const ENDING_DIALOGUE: Record<string, DialogueLine[]> = {
  a: [
    { speaker: "—", text: "A Coragem da Burrice" },
    { speaker: "Boleto", text: "VITÓRIA! A macheza foi restaurada!" },
    { speaker: "Caveira", text: "As mulheres ainda ignoram a gente." },
    { speaker: "Porquinho", text: "Mas a gente tá feliz. Junto. Na taverna." },
    { speaker: "Meleca", text: "A macheza real foi a amizade que fizemos no caminho." },
    { speaker: "Boleto", text: "Que desastre." },
    { speaker: "—", text: "Cena final: Taverna, bebendo cerveja. A macheza real foi a amizade que fizemos no caminho. (Que desastre)" },
  ],
  b: [
    { speaker: "—", text: "A Sabedoria da Aceitação" },
    { speaker: "Porquinho", text: "O fogo curou o mundo. Metaforicamente." },
    { speaker: "Caveira", text: "Mundo voltou ao normal. Heróis recebem agradecimento. Suspeito." },
    { speaker: "Boleto", text: "Ela tá acenando de longe. É ambíguo." },
    { speaker: "Meleca", text: "Talvez se a gente parasse de tentar, conseguisse." },
    { speaker: "—", text: "Mensagem: Talvez se vocês parassem de tentar, conseguissem." },
  ],
  c: [
    { speaker: "—", text: "O Final Honesto" },
    { speaker: "Zezé", text: "Vocês sabem que isso não ia funcionar, né?" },
    { speaker: "Boleto", text: "Mas... a gente tentou..." },
    { speaker: "Caveira", text: "Às vezes o vilão é você." },
    { speaker: "—", text: "Mensagem: Às vezes o vilão é você." },
  ],
  d: [
    { speaker: "—", text: "A Pirueta Absurda (Secreto)" },
    { speaker: "Zezé", text: "Plot twist: vocês SEMPRE souberam disso." },
    { speaker: "Boleto", text: "Sabido o quê?" },
    { speaker: "Zezé", text: "Tudo é simulação. Vocês estão em reality TV do universo." },
    { speaker: "Caveira", text: "Câmeras? Onde?" },
    { speaker: "—", text: "Câmeras ficam visíveis. Plateia invisível ri deles." },
    { speaker: "Porquinho", text: "A quarta parede foi destruída pela própria incompetência." },
    { speaker: "Meleca", text: "Achei que era sonho. Era transmissão ao vivo." },
  ],
};

export function endingDialogue(endingId: string): DialogueLine[] {
  return ENDING_DIALOGUE[endingId] ?? [];
}

export const TIRED_DIALOGUE: DialogueLine[][] = [
  [
    { speaker: "Boleto", text: "Vocês acham que a gente vai conseguir?" },
    { speaker: "Caveira", text: "Tecnicamente a gente já tá perdido desde o começo." },
    { speaker: "Porquinho", text: "Mas... pelo menos tamo junto?" },
    { speaker: "Meleca", text: "É. Tipo, se a gente tá fracassando, tamo fracassando em equipe." },
  ],
  [
    { speaker: "Boleto", text: "Como a gente explica pra alguém porque a gente tá levando fogo pra montanha?" },
    { speaker: "Caveira", text: "Você não explica. Você apenas... faz. E espera morte rápida." },
    { speaker: "Porquinho", text: "A parte 'morte rápida' assusta." },
    { speaker: "Meleca", text: "A morte rápida seria uma melhora." },
  ],
  [
    { speaker: "Caveira", text: "Zezé aparece toda hora, não é?" },
    { speaker: "Porquinho", text: "Deve ser parte do código da realidade." },
    { speaker: "Boleto", text: "Código?" },
    { speaker: "Caveira", text: "Entenda como queira. O ponto é que o universo não gosta de gente que pensa muito." },
  ],
  [
    { speaker: "Meleca", text: "Uma vez eu sonhei que uma garota não saiu correndo." },
    { speaker: "Boleto", text: "Isso é otimismo." },
    { speaker: "Meleca", text: "Não, era um pesadelo. Ela desmaiou de horror." },
    { speaker: "Caveira", text: "Ainda era um ending melhor." },
  ],
];

export function tiredDialogue(): DialogueLine[] {
  if (TIRED_DIALOGUE.length === 0) return [];
  return TIRED_DIALOGUE[Math.floor(Math.random() * TIRED_DIALOGUE.length)];
}

export const NPC_REACTIONS: Record<string, DialogueLine> = {
  womanApproach: { speaker: "Mulher", text: "Não." },
  vendorApproach: { speaker: "Vendedor", text: "Vocês têm dinheiro? Pois é. Não é suficiente pra vocês comprarem DIGNIDADE." },
  adventurerApproach: { speaker: "Aventureiro", text: "Vocês é quem tá nessa jornada louca? Boa sorte. Vocês vai precisar." },
  returnAfterDefeat: { speaker: "NPC", text: "Vocês perdeu de novo? Impressionante. Não de forma positiva." },
  returnAfterVictory: { speaker: "NPC", text: "Vocês ganhou? Como? Por acaso?" },
};

export function npcReaction(key: string): DialogueLine | null {
  return NPC_REACTIONS[key] ?? null;
}

export const STATUS_DIALOGUE: Record<string, Record<string, DialogueLine[]>> = {
  confuse: {
    Boleto: [
      { speaker: "Boleto", text: "EU AMO AS MINAS! [ataca aliado]" },
      { speaker: "Caveira", text: "Isso provavelmente resume você." },
    ],
  },
  stop: {
    Porquinho: [
      { speaker: "Porquinho", text: "Eu tô congelado! Que pena. [bip bip]" },
    ],
  },
  poison: {
    Meleca: [
      { speaker: "Meleca", text: "Já tava nojento antes, então..." },
    ],
  },
  dying: {
    Caveira: [
      { speaker: "Caveira", text: "Finalmente..." },
      { speaker: "NPC", text: "Espera mais um pouco, você vai conseguir perder mais." },
    ],
  },
};

export function statusDialogue(status: string, heroName: string): DialogueLine[] {
  const heroKey = heroName.charAt(0).toUpperCase() + heroName.slice(1);
  return STATUS_DIALOGUE[status]?.[heroKey] ?? [];
}