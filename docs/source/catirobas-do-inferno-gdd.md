# GAME DESIGN DOCUMENT
# Catirobas do Inferno

> Fonte: extraido de `Catirobas_do_Inferno_GDD.pdf`.
> Adaptacao de planejamento: a diretiva original de HTML5 single-file foi removida. O projeto alvo passa a ser HTML5 modular com Phaser 4, TypeScript e Vite.

Versão: 1.0
Data: Janeiro 2026
Status: Design Completo para Desenvolvimento
Plataforma: HTML5 modular (Phaser 4 + TypeScript + Vite)
Gênero: RPG Temático Cômica/Aventura



1. VISÃO GERAL DO JOGO
1.1 Conceito Principal
“Catirobas do Inferno” é um RPG estilo RPG Maker que satiriza a masculin-
idade tóxica através de uma narrativa absurda onde quatro heróis rejeitados
pelas mulheres precisam salvar o mundo devolvendo a “macheza” e o estilo dos
anos 80.

1.2 Resumo Executivo
O mundo perdeu sua “diversão” porque as mulheres se recusaram a interagir
com os protagonistas. O único jeito de restaurar a diversão e salvar o reino é
levar o Fogo Primordial (símbolo da masculinidade dos anos 80) ao topo do
Monte Macheza. Junto ao caminho, um sábio preguiçoso maconheiro oferece
dicas hilariantes.

1.3 Pilares de Design
  • Humor Absurdo: Piadas machistas, constrangimento e ironia
  • Narrativa Temática: Crítica social envolvida em diversão
  • Mecânica Simples: Turn-based combat estilo RPG Maker clássico
  • Personagens Memoráveis: Cada um com personalidade exagerada



2. HISTÓRIA E NARRATIVA
2.1 Sinopse Geral
No reino de Testosteria, tudo era diversão até que as mulheres se cansaram.
Elas simplesmente pararam de interagir com os homens da região. O mundo
entrou em depressão. Lendas antigas falam do Fogo Primordial, uma chama
mística que queimava com a essência da masculinidade destemida dos anos 80.
Se o fogo for levado ao topo do Monte Macheza, a “macheza” será restaurada
e as mulheres voltarão a tolerar—digo, gostar—deles.



                                      1
2.2 Ato 1: O Chamado Irrecusável
A história começa em Taverna do Lamento, onde nossos heróis estão bebendo
cerveja enquanto reclamam de “não entender mulheres”. Um oráculo aparece
(ele fuma maconha) e revela a verdade: “Vocês estão sozinhos porque são chatos.
Mas ei, existem lendas… talvez isso seja coisa de macho mesmo!”

2.3 Ato 2: A Jornada Humilhante
Os heróis viajam por várias biomas temáticas: - Floresta da Rejeição: Ár-
vores que riem deles - Deserto do Esquecimento: Ninguém se lembra deles
- Caverna do Constrangimento: Situações cada vez mais constrangedoras -
Vulcão da Verdade: Onde eles começam a entender que talvez o problema
seja deles

2.4 Ato 3: O Confronto Final
No topo do Monte Macheza, nossos heróis descobrem que o “Fogo Primordial”
não existe. Ou existe? Na verdade, a macheza verdadeira é amizade… NÃO É!
É pura coragem estúpida. Eles vão devolver o fogo de qualquer forma.

2.5 Temas Subjacentes
   • Sátira de masculinidade tóxica
   • Autoaceitação através da ridículo
   • Amizade apesar de tudo
   • “Você é o problema, meu amigo”



3. PERSONAGENS E DESIGN
3.1 PERSONAGEM 1: BOLETO
Tipo: Cavalo Antropomórfico (Cavaleiro)
Rol: Líder Physical (DPS)
Arma: Espada de Madeira que ele pensa ser de ouro
APARÊNCIA ASCII:
     /\_/\
    ( o.o )
     > ^ <
    /|   |\
     |   |
    _|   |_
Características: - Sempre fala em gírias dos anos 80 - Acredita ser irresistivel-
mente atraente (não é) - Usa roupas brilhosas ridículas - Taxa de Hit: 80% |
Ataque: 18-24 | HP: 120


                                       2
Personalidade: Egocêntrico, acredita que as mulheres estão perdendo ouro
por não querer sair com ele
Diálogos Memoráveis: - “Rapaziada, eu sou tipo… muito quente, sabe?” -
“Essa espada é de ouro puro! Custou… nada. Encontrei na lixeira” - “As minas
é que tá perdendo, viu?”



3.2 PERSONAGEM 2: PORQUINHO
Tipo: Porco Antropomórfico (Mago)
Rol: Suporte Mágico
Arma: Varinha feita de galho de árvore
APARÊNCIA ASCII:
     ^___^
     (o o)
    <(    )>
     / | \
       / \
Características: - Acredita saber magia porque viu um vídeo na internet - Seus
“feitiços” são basicamente palavras em latim errado - Extremamente ansioso
socialmente - Taxa de Hit: 60% | Ataque: 10-15 | Magia: 20-28 | HP: 85
Personalidade: Introvertido, tenta demais, nunca consegue
Diálogos Memoráveis: - “ABRACADABRUM SEXICUS! …não funcionou de
novo…” - “Ela só… andou para longe enquanto eu explicava minha coleção de
mangá” - “Talvez se eu soubesse MAIS latim errado…”



3.3 PERSONAGEM 3: MELECA
Tipo: Criatura Gelatinosa Humanóide (Tanque)
Rol: Defesa/Absorver Dano
Arma: Os próprios punhos viscosos
APARÊNCIA ASCII:
   /~~~~~~~\
   | O   O |
   | \_/ |
   \   ~   /
    \_____/
Características: - Incrivelmente nojento, mas isso é parte do charme dele -
“Faria diferença se eu tomasse banho?” - sempre pergunta - Tem defesa alta por
ser literalmente pegajoso - Taxa de Hit: 50% | Ataque: 16-22 | DEF: 35 | HP:
150


                                      3
Personalidade: Genuinamente confuso sobre por que não consegue namorada
Diálogos Memoráveis: - “Vocês acham que é o cheiro ou o fato de eu ser
literalmente uma mancha?” - “Talvez as mulheres gostassem de alguém mais…
sólido?” - “Uma vez uma garota não correu assim que me viu. Acho que quase
namoramos”



3.4 PERSONAGEM 4: CAVEIRA
Tipo: Esqueleto (Assassino)
Rol: Crítico DPS / Agilidade
Arma: Dois punhais ósseos
APARÊNCIA ASCII:
     .-'''-.
    /   O   \
    | \_/ |
    | === |
     \ ___ /
Características: - Filosoficamente deprimido sobre tudo - “Literalmente já sou
morto por dentro” - Altos críticos porque literalmente não tem nada a perder -
Taxa de Hit: 75% | Ataque: 20-30 | Crítico: 35% | HP: 95
Personalidade: Emo sarcástico, faz piadas sobre morte enquanto quer morrer
Diálogos Memoráveis: - “Nenhuma garota quer namorar alguém sem carne.
Alguém nunca ouviu falar sobre energias?” - “Estou tão vazio por dentro que
é literalmente visível” - “Pelo menos se eu for rejeitado, já estou acostumado a
estar morto”



4. ANTAGONISTAS E NPCS
4.1 ANTAGONISTA FINAL: SENHORA RAZÃO
A força invisível que faz as mulheres evitar os protagonistas. Não é uma criatura,
é um conceito. Ela se manifesta como: - Aparência: Uma silhueta brilhante e
indetectível (porque é invisível) - Habilidades: Lógica irrefutável, senso comum
- Boss Final: Eles lutam contra ela, obviamente perdem a luta de argumentos,
e descobrem que precisam apenas… aceitar que estão errados

4.2 NPC: ZEZÉ (O Sábio Maconheiro)
Aparência ASCII:
  ___
 |ZZZ|


                                        4
 |(_)|
 |   |
Rol: Comic Relief + Dicas do Jogo
Localização: Aparece aleatoriamente em pontos-chave
Diálogos ao fornecer dicas: - “Mano, vocês tentaram… tipo… conversar com
elas normal?” - “Acho que o problema é mais profundo que eu pensava, e eu
sou MUITO profundo, sabe?” - “As vezes a solução tá ali, na sua frente, e
você tá cego de tanta autoestima” - “Isso vai parecer loucura, mas… sejam vocês
mesmos? Tipo, versões melhores?”



4.3 INIMIGOS MENORES
Tipo 1: “Nice Guy” Comum
  • Aparência: Cara com camiseta que diz “I’m Nice”
  • Habilidades: Complaining, Emotional Manipulation
  • Ataque Especial: “Mas eu sou LEGAL! Por que não quer sair comigo?”
  • HP: 30 | ATK: 8-12

Tipo 2: Troll Incel
  • Aparência: Figura pixelada sombria digitando furiosamente
  • Habilidades: Insult, Toxic Comment, Scream into Void
  • HP: 25 | ATK: 10-14 | DEF: 5

Tipo 3: Homem Caverna Rejeitado
  • Aparência: Figura peluda com taco primitivo
  • Habilidades: Grunt, Hit Hard, Reclaim Territory
  • HP: 45 | ATK: 16-20 | DEF: 8

Tipo 4: Corporate Bro
  • Aparência: Terno brilhoso, gel demais no cabelo
  • Habilidades: Flex Money, Mention BMW, Talk About Crypto
  • HP: 35 | ATK: 12-18 | Special: “Money Shower” (dano reduzido, apenas
    constrangimento)



5. SISTEMA DE COMBATE
5.1 Mecânica Base
  • Turn-Based: Clássico estilo Dragon Quest/RPG Maker
  • Turno: Ordem baseada em Velocidade (Speed/Agilidade)


                                      5
  • Menu de Ações: Attack, Magic, Item, Escape

5.2 Ações em Combate
ATAQUE FÍSICO
Fórmula: (ATK + Arma) - (Defesa Inimiga) + RNG(±10%)
Cada personagem tem diferentes animações
Boleto: “Golpe de Espada Brilhosa” - Som de algo quebrando Porquinho:
“Soco Mágico Inseguro” - Som de um bop fraco Meleca: “Soco Viscoso” -
Slap molhado (dano alto, hit baixo) Caveira: “Apunhalar Romanticamente” -
Crítico frequente

MAGIA (Porquinho)
  • Abracadabrum Sexicus (Cura 25-35 HP): “Talvez magia ruim vire ma-
    gia boa?”
  • Incantum Confusus (Confund 1 inimigo): Inimigo ataca aliados
  • Magicus Ridiculum (ATK -2): Inimigos perdem confiança
  • Levitatus Penosos (50% chance de escape): “Se não dá pra vencer,
    flutuamos pra casa?”

ITENS
  • Cerveja (Restaura 30 HP): “Bebida de poder”
  • Pizza Fria (Restaura 20 HP): “Comida de losers”
  • Doritos (Restaura 15 HP, +10% chance crítico por 2 turnos): “Pode me
    comer a senha do WiFi?”
  • Energético “Misterioso” (Restaura MP): Claramente tem coisas estran-
    has
  • Foto do Boleto (Confund inimigo de riso): “Risada controlada”

ESCAPE
  • 50% chance de sucesso em combates normais
  • Falha 100% em combates chefes
  • Mensagem ao falhar: “Vocês não conseguiram correr da própria incom-
    petência”

5.3 Sistema de Crítico
  • Caveira: 35% base
  • Boleto: 15% base
  • Porquinho: 5% base
  • Meleca: 10% base




                                   6
Críticos causam dano 1.5x e às vezes vêm com mensagens sarcásticas: - “Ele
finalmente acertou em algo!” - “Pura sorte” - “Até mesmo uma moeda virada
acerta às vezes”

5.4 Morte e Game Over
  • Quando todos os heróis caem: “Vocês morreram. Isso resume vocês?”
  • Opções: Retry, Load Game, Quit
  • Mensagem especial após 3 mortes no mesmo chefe: “Talvez o problema
    seja a estratégia… ou vocês”

5.5 Experiência e Leveling
  • Cada inimigo derrotado: 50 XP (normal), 100 XP (chefe)
  • Level 1-20 (max)
  • Ganho de stat por level:
      – ATK +2-4
      – DEF +1-2
      – HP +8-12
      – SPD +0-1



6. ESTRUTURA DO JOGO
6.1 Mapa do Mundo
                     [MONTE MACHEZA]
                          |
         [CAVERNA]    [VULCÃO]     [TEMPLO]
            |            |            |
         [FLORESTA]-[TAVERNA]-[DESERTO]
                          |
                    [VILA INICIAL]

6.2 Locais Principais
TAVERNA DO LAMENTO (Casa Base)
  • Onde tudo começa
  • Pode descansar e recuperar HP/MP
  • Zezé aparece aqui algumas vezes
  • Loja de itens básicos
  • Salva aqui automaticamente

FLORESTA DA REJEIÇÃO
  • Primeiras batalhas (Easy)


                                    7
  • Árvores riem quando você passa
  • Encontro com first NPC Woman que ignora completamente
  • Inimigos: Nice Guys (2-3 por batalha)
  • Boss: “Homem Árvore” (Árvore que recusou a dermaabrasão)

DESERTO DO ESQUECIMENTO
  • Batalhas médias
  • Ninguém se lembra dos heróis; até eles esquencem quem são
  • Efeito especial: Alguns turnos os heróis confundem entre si
  • Inimigos: Trolls Incel, Corporate Bros
  • Boss: “O Miragem da Autoestima” (Ilusão que parece perfeita)

CAVERNA DO CONSTRANGIMENTO
  • Momentos de narrativa forçada
  • Tutorial de magia aqui
  • Flashbacks constrangedores dos heróis
  • Inimigos: Homens Caverna, Nice Guys avançados
  • Eventos especiais: Encontram com ex-namoradas imaginárias
  • Boss: “Seu Próprio Reflexo (ligeiramente mais atraente)”

VULCÃO DA VERDADE
  • Batalhas difíceis
  • O fogo primordial está aqui
  • Revelações de verdade
  • Zezé dá uma revelação importante aqui
  • Inimigos: Todos os tipos, combinados
  • Boss: “Manifestação da Realidade” (versão final antes da Senhora Razão)

MONTE MACHEZA (Topo)
  • Cena final
  • Fogo primordial
  • Luta final com Senhora Razão (conceitual)
  • Endings múltiplos baseados em como você chegou lá



7. PROGRESSÃO DE HISTÓRIA
ATOS NARRATIVOS
ATO 1 - O CHAMADO (Taverna → Floresta)
Cutscene: Heróis reclamando
↓
Zezé aparece, revela a verdade


                                    8
↓
Recebem missão (com muito sarcasmo)
↓
Primeiro combate tutorial
Marcos: Saem da Taverna, derrubam Homem Árvore, entendem que tá ruim
mesmo

ATO 2 - A JORNADA (Floresta → Vulcão)
Exploram todos os biomas
↓
Cada bioma tem um "aprendizado"
↓
Batalhas ficam mais difíceis
↓
Piadas pioram
↓
Autossabotagem aumenta
Marcos: - Deserto: Descobrem que querem ser lembrados - Caverna: Con-
frontam seus próprios medos/constrangimentos - Pré-Vulcão: Aceitam que po-
dem estar errados

ATO 3 - A VERDADE (Vulcão → Monte)
Zezé dá revelação final (fumando)
↓
Aceitam que o problema é deles
↓
Decidem continuar de qualquer forma
↓
Luta com Senhora Razão
↓
Endings variados



8. DIÁLOGOS E HUMOR
8.1 Diálogos de Abertura (Taverna)
[BOLETO]: Cara, as mulheres não entendem. Eu sou literalmente perfeito!
[CAVEIRA]: Você tem literalmente metade da sua espada partida.
[BOLETO]: Isso é estilo vintage, meu.
[PORQUINHO]: ...vocês acham que se eu aprender mais magia?
[MELECA]: Uma vez uma menina não saiu correndo. Acho que foi amor.
[CAVEIRA]: Ela estava paralisada de horror.


                                    9
[MELECA]: Detalhe...

[ZEZÉ ENTRA VOANDO DE FORMA IMPOSSÍVEL]:
[ZEZÉ]: E aí galera, sou Zezé. Tipo... a mina do universo não quer saber de vocês.
[BOLETO]: MAS EU SOU---
[ZEZÉ]: Sim sim, muito quente. Vocês tão sozinhos porque são meio... chatos.
[CAVEIRA]: Pelo menos isso é honesto.
[ZEZÉ]: Mas tipo, existe um Fogo Primordial que pode restaurar a MACHEZA. Vocês temque levá-
[PORQUINHO]: Por que ele faria diferença???
[ZEZÉ]: Né? Boa pergunta. Mas vocês vão mesmo assim porque vocês são MUITO burro---digo, cor
[MELECA]: Como é que tira essa coragem?
[ZEZÉ]: Mano, vocês tá no inferno mesmo. Vai lá. [Desaparece em fumaça]

[BOLETO]: Bora! Vamos restaurar a MACHEZA!
[TODOS]: [Suspiram existencialmente]

8.2 Diálogos de Combate (Ao Ganhar)
[Derrotam "Nice Guy" #47]:
[BOLETO]: Outro vencido!
[CAVEIRA]: Ele só... permaneceu inerte. Nem era um combate.
[BOLETO]: Mas EU ganhei!
[PORQUINHO]: Seria legal se a gente tivesse evitado essa luta...
[MELECA]: Sempre a mesma coisa. Nem sinto nada quando ganho.

[Derrotam Corporate Bro]:
[CORPORATE BRO]: Espera... meu BMW... [Desaparece]
[BOLETO]: Derrotamos um homem tão rápido quanto seu carro!
[CAVEIRA]: Nós temos essas piadas ou ele gera automaticamente?
[PORQUINHO]: Isso foi... ofensivo?
[MELECA]: Acho que ninguém ligaria se ele saísse ou não.

8.3 Diálogos de Evento Especial (Encontro com Mulher)
[Encontram uma mulher no Deserto]:
[BOLETO]: Olá bela dama! Eu sou---
[MULHER]: [Sem olhar] Não.
[BOLETO]: Mas você nem me ouviu!
[MULHER]: Ouvi. Entendi tudo. Não.
[CAVEIRA]: Tem até uma eficiência em rejeitar gente.
[MELECA]: Uma mulher que rejeita rápido? Talvez ela goste de...
[MULHER]: Não. [Sai]
[PORQUINHO]: Por que sempre não?
[ZEZÉ APARECE]: Porque vocês sai falando "eu sou" o tempo todo. Tipo, tenta... escutar?
[CAVEIRA]: Escutar? Nós? Ousadia.



                               10
8.4 Diálogos Finais (Antes do Boss Final)
[No topo do Monte Macheza]:
[BOLETO]: Conseguimos! O Fogo Primordial!
[PORQUINHO]: Espera... é só um balde de combustível?
[CAVEIRA]: Uma metáfora muito óbvia.
[MELECA]: Mas... ele tá brilhando?
[ZEZ APARECE, BEM MENOS ANIMADO]:
[ZEZÉ]: Mano... vocês querendo que eu explique a metáfora ou vocês quer de verdade salvar o
[BOLETO]: VAMOS USAR O PODER DA MACHEZA!
[ZEZÉ]: [Suspira] Tá bom. Mais uma chance ao universo.

[Aparece Lady Reason, invisível]:
[LADY REASON]: Vocês pensam que fogo muda o que vocês são?
[CAVEIRA]: Ah, agora ela fala.
[LADY REASON]: Vocês estão aqui porque recusam ver a si mesmos.
[PORQUINHO]: Será que... ela tá certa?
[BOLETO]: NÃO! VAMOS LUTAR PORQUE... PORQUE...
[CAVEIRA]: Porque não temos alternativa melhor?
[MELECA]: Pelo menos estamos juntos pra fracassar?
[LADY REASON]: Exatamente. E isso é quase bonito.
[ZEZÉ]: [Aparece em piscando]: Sabia que vocês iam entender no final.



9. FLUXO DO JOGO
9.1 Game Loop Principal
Explorar Mundo → Encontrar Inimigos → Combate → Ganhar EXP → Level Up → Continuar
                                        ↓
                                   Perder? Game Over → Retry

9.2 Progressão de Dificuldade

Zona       Nível Recomendado     Inimigos              Chefe
Floresta   1-3                   Easy (30 HP)          Homem Árvore (80 HP)
Deserto    4-7                   Medium (50 HP)        Miragem Ego (150 HP)
Caverna    8-11                  Medium+ (70 HP)       Seu Reflexo (200 HP)
Vulcão     12-15                 Hard (100-120 HP)     Manifestação Realidade (300 HP)
Monte      16+                   Insano                Senhora Razão (??? HP)


9.3 Requisitos de Progressão
  • Deve derrotar cada Chefe de Bioma para progredir
  • Não há nível obrigatório, mas vai ficar muito difícil


                                      11
   • Pode andar à vontade depois de cada zona desbloqueada



10. INTERFACE DO JOGO
10.1 Tela Principal
�����������������������������������
�           CATIROBAS DO INFERNO            �
� (Pixel Art: 4 personagens)                �
�                                           �
�           [NEW GAME]                      �
�           [LOAD GAME]                     �
�           [SETTINGS]                      �
�           [QUIT]                          �
�                                           �
�      "A Macheza dos anos 80"              �
�����������������������������������

10.2 HUD do Jogo
�� BOLETO (Level 5) ����������
� HP: ���������� (92/120)      �
� MP: ���������� (0/0)         �
������������������������������
� PORQUINHO (Level 5)                  �
� HP: ���������� (45/85)       �
� MP: ���������� (28/40)       �
������������������������������
� MELECA (Level 4)                     �
� HP: ���������� (75/150)      �
� MP: ���������� (0/0)         �
������������������������������
� CAVEIRA (Level 5)                    �
� HP: ���������� (70/95)       �
� MP: ���������� (0/0)         �
������������������������������

[Taverna do Lamento] [Floresta da Rejeição] >
EXP: 340/500 MOEDAS: 450

10.3 Menu de Combate
�����������������������������
�           ESCOLHA AÇÃO           �
�����������������������������


                                           12
� → ATACAR                      �
�      MAGIA                    �
�      ITEM                     �
�      ESCAPAR                  �
�����������������������������

10.4 Tela de Pausa
����������������������������������
� [CONTINUE]                          �
� [INVENTORY] (Itens: 12/20)          �
� [STATUS] (Ver stats)                �
� [SETTINGS] (Volume, etc)            �
� [SAVE GAME]                         �
� [LOAD GAME]                         �
� [QUIT TO MENU]                      �
����������������������������������



11. ARTE E ESTÉTICA
11.1 Estilo Visual
    • Resolução: 800x600 (retro RPG Maker style)
    • Paleta: Cores vibrantes dos anos 80 com degradação irônica
    • Pixel Art: 16-32px sprites para personagens
    • Tema Visual: Absurdo bem-vindo, piores cenários possíveis estão esteti-
      camente “bonitos”

11.2 Descrição Visual dos Personagens (Pixel Art)
BOLETO - Cavalhorse Sparkly
Sprite caminhando (4 frames):
- Roupas brilhosas de cor-de-rosa neon
- Cabelo grande tipo mullet invertido
- Sorriso permanente
- Ombros amplos
- Pêlo mínimo (cavalo, mas... "quente")
- Cores: Rosa, azul neon, branco brilho
PORQUINHO - Mago Ansioso
Sprite caminhando:
- Roupas de mago roxas pequenas demais
- Varinha frágil e tremendo
- Olhos largos de pânico
- Suor visível (gota animada)


                                     13
- Passos inseguros
- Cores: Roxo, verde água, rosa claro
MELECA - Gelatina Desesperada
Sprite caminhando:
- Corpo vibrante gelatinoso
- Duas bolinhas como olhos
- Mão direita sempre em "por favor"
- Deixa pegadas de babosa
- Tremula levemente mesmo parado
- Cores: Verde musgo, marrom escuro, bege
CAVEIRA - Emo Ósseo
Sprite caminhando:
- Crânio com rachadura estética
- Roupas rotas e pretas
- Dois punhais sempre visíveis
- Aura de desânimo
- Caminhada lenta e pesada
- Cores: Branco osso, preto, roxo escuro

11.3 Design de Inimigos
Nice Guy:
Homem pixelado com camiseta "I'm Nice"
Sempre tem expressão de "Por que não quer sair comigo?"
Cores: Azul claro, branco puro (limpo demais)
Troll Incel:
Silhueta pixelada digitando
Rosto nunca visível (sempre na tela do notebook)
Raios de ódio saem do notebook
Cores: Cinza, neon vermelho, preto
Corporate Bro:
Homem em terno brilhoso
Cabelo com muito gel
Óculos de aviador
BMW ao fundo
Cores: Preto, ouro, cinza metálico




                               14
12. ÁUDIO (Descrição)
12.1 Música Temática
  • Tema Principal: Sons sintetizados dos anos 80 tipo Synthwave retrô
  • Taverna: Jazz lounge deprimido
  • Floresta: Sons naturais com sintetizadores
  • Deserto: Vento solitário + synthwave
  • Vulcão: Drums intensos + synth escalante
  • Boss: Epic 80s hair metal simulado

12.2 Efeitos Sonoros
  • Ataque: “Bop” cômica ou som metálico errado
  • Magia Falha: “Poof” patético
  • Crítico: “Ding!” musical
  • Victory: Fanfarra irónica curta
  • Game Over: Som pior possível (tipo Windows 95 error)



13. MECHANICS ADICIONAIS
13.1 Sistema de Amizade
Cada personagem tem “Aﬀinity” com o outro: - Afinity muda conforme diálogos
- ATÁ AGORA: Aumenta com vitórias juntas - BAIXA: Reduz com derrotas -
Afinity alta = Ataques combinados desbloqueados
Ataques Combinados (Unlocks em Afinity 100%): - Boleto +
Porquinho: “Soco Mágico Brilhoso” (2x ATK do combo) - Meleca +
Caveira: “Abraço Mortal” (DEF down inimigo + ATK up) - Todos 4:
“Formação Macheza Final” (ATK +50%, mas falha 20% das vezes)

13.2 Sistema de Itens
Cerveja (30 HP)
Pizza Fria (20 HP, pode compartilhar meleca)
Doritos Flamin' Hot (15 HP + 10% crítico 2 turnos)
Energético Misterioso (50 MP, efeito colateral desconhecido)
Foto do Boleto (Confund inimigo)
Espelho Quebrado (Reflete 1 ataque mágico)
Manual de Conversação (Reduz dano mental 20%)
Maconha de Zezé (Restaura TUDO mas deixa heróis "confusos" 3 turnos)

13.3 Sistema de Reputação
NPC com quem fala desenvolve “Opinion” sobre os heróis: - Baixa (-20):
Recusam vender/ajudar - Normal (0): Interagem neutro - Alta (+20): De-


                                    15
sconto/dicas extras
Maioria dos NPCs começa em -10 (porque conhecem eles lol)



14. SISTEMAS VARIADOS
14.1 Salvamento
  • Auto-save: Ao entrar em nova área
  • Manual save: Apenas na Taverna ou com item especial
  • Slots: 3 slots de salvamento
  • Mensagem ao salvar: “Gravado. Pelo menos vocês tentaram.”

14.2 Configurações
  • Volume de Música (0-100%)
  • Volume de SFX (0-100%)
  • Velocidade de Diálogo (Rápido, Normal, Lento)
  • Nível de Dificuldade (Normal, Hard, Irônico)
  • Legenda (Ligado/Desligado)

14.3 Achievements (Irônicos)
  • “Foram Rejeitados”: Perder para “Nice Guy” primeira vez
  • “Ainda Aqui?”: Jogar por 30 minutos
  • “Morte Honrosa”: Morrer 10x do mesmo boss
  • “Quase Compreensão”: Chegar no final entendendo a piada
  • “Final Secreto”: Derrubar Lady Reason com amor (impossible)



15. WORLD DESIGN DETALHADO
TAVERNA DO LAMENTO
Descrição: Taverna escura, pegajosa, parece que não foi limpa em anos.
NPCs: - Bartender (vende itens) - Zezé (dicas, aparições aleatórias) - Mulher
ignorando todos (sempre no canto, sempre ignorando)
Eventos: - Cena de abertura aqui - Missão recebida aqui - Retorna aqui para
salvar - Dialógo pré-final aqui
Layout:
[Porta] [Zezé] [Mulher]
[Mesa 1] [Mesa 2] [Bar]
[Mesa 3] [Mesa 4] [Porta traseira]



                                     16
FLORESTA DA REJEIÇÃO
Descrição: Floresta que literalmente ri de você. Árvores tendo faces.
Inimigos: Nice Guys (1-3 por encontro) Encontros Especiais: - Árvore rindo:
Mensagem “-10 PSI (Moral)” - Mulher ignorando: Rejeição automática - Zezé
fumando: Oferece dica
Boss: HOMEM ÁRVORE
Stats:
- HP: 80
- ATK: 12-16
- DEF: 8
- Special: "Raiz Constrangedora" (paralisa random personagem)
Derrota quando tira toda folhagem, fica vago.

DESERTO DO ESQUECIMENTO
Descrição: Areia, calor, absoluta solidão. Até os heróis se esquecem quem são.
Mechânica Especial: A cada 3 turnos de combate, há 30% de chance de heróis
trocarem ataques por confusão
Inimigos: Trolls Incel, Corporate Bros
Boss: MIRAGEM DO EGO
Stats:
- HP: 150
- ATK: 18-24
- DEF: 12
- Special: "Ilusão Perfeita" (cria clones que atacam)
Derrota: Ao perceber que é ilusão, desaparece
Encontro especial: Mulher que também está perdida, mas recusa ajuda deles
por achar melhor sozinha. (“Deixem. Tenho GPS mental.”)

CAVERNA DO CONSTRANGIMENTO
Descrição: Caverna que toca flashbacks dos heróis.
Mechânica Especial: Eventos de diálogo forçados, “relembram” constrangi-
mentos
Diálogos Especiais: - Encontro com “ex-namorada imaginária” de cada um -
Cada um tem um momento sozinho constrangedor - Dialógo final reconfortante
entre eles
Inimigos: Homens Caverna (tipo primitivos), Nice Guys avançados
Boss: SEU REFLEXO LIGEIRAMENTE MAIS ATRAENTE


                                     17
Stats (iguais ao personagem mas +1 em tudo):
Boleto's Reflection: 130 HP, ATK 20-26, DEF mais alto
Especial: Usa mesmos ataques, mira nos inseguros
Derrota: Ao finalmente perceber que está brigando consigo mesmo

VULCÃO DA VERDADE
Descrição: Vulcão literal da verdade onde fogo brilha e tudo é quente.
Mechânica Especial: Temperatura aumenta, heróis tomam dano passivo
baixo (2-3 HP por turno)
Inimigos: Todos os tipos anteriores, combinados
Zezé Revelação: Aqui Zezé aparece e dá monólogo importante: “Mano, vocês
achava que tava tudo errado com as mina? Tipo… eu vou ser honesto. Problema
é vocês. Mas sabe o que? Vocês ainda tá aqui tentando. Isso é meio de macheza
mesmo. Não essa coisa de bravata, mas tipo… coragem de ser burro e continuar.”
Boss: MANIFESTAÇÃO DA REALIDADE
Stats:
- HP: 300
- ATK: 25-35
- DEF: 15
- Fases: 3 (cada fase muda padrão de ataque)
Fase 1: Ataque puro
Fase 2: Ataque + Magia (confusão)
Fase 3: Ataque + Dano Aumento Aliado

Derrota: Ao aceitar que é manifestação, não real

MONTE MACHEZA (Topo)
Descrição: Pico montanhoso onde fogo primordial existe (ou existe metafori-
camente).
O Fogo Primordial: - Existe? Não. - Pode ver? Está aqui. - Funciona?
Talvez. - Salva mundo? Depende.
Cena Final:
[Heróis chegam ao topo]
[Pegam no fogo/luz/alguma coisa]
[Lady Reason manifesta]
[Diálogo filosófico]
[Escolha de Final]




                                     18
16. ENDINGS VARIADOS
ENDING A: “A Coragem da Burrice”
Se derrotou Lady Reason com ataque direto (agressão pura): - Fogo espalha e
“salva” mundo - Mulheres ainda ignoram heróis - Mas heróis estão felizes com
amizade - Cena final: Taverna, bebendo cerveja - Mensagem: “A macheza real
foi a amizade que fizemos no caminho. (Que desastre)”

ENDING B: “A Sabedoria da Aceitação”
Se derrotou Lady Reason com magia/itens (estratégia): - Fogo cura mundo
metaforicamente - Mundo volta ao normal - Heróis recebem agradecimento
(suspeito) - Cena final: Mulher de longe, acenando (ambíguo) - Mensagem:
“Talvez se vocês parassem de tentar, conseguissem”

ENDING C: “O Final Honesto”
Se perdeu para Lady Reason: - Game Over é o ending - Zezé aparece: “Vocês
sabe que isso não ia funcionar, né?” - Opção de Retry (continua jogo) ou Accept
Defeat (fim) - Mensagem: “Às vezes o vilão é você”

ENDING D: “A Pirueta Absurda” (Secreto)
Se encontrar Zezé 10 vezes: - Zezé revela tudo é simulação - Heróis estão em
reality TV do universo - Câmeras ficam visíveis - Plateia invisível ri deles - Zezé:
“Plot twist: vocês SEMPRE souberam disso” - Mensagem: “A quarta parede
foi destruída pela própria incompetência”



17. ASSETS NECESSÁRIOS
17.1 Sprites Personagens
   • Boleto (4 direções × 4 frames de movimento)
   • Porquinho (4 direções × 4 frames)
   • Meleca (4 direções × 4 frames)
   • Caveira (4 direções × 4 frames)
Cada um com: - Sprite normal caminhando - Sprite em combate (parado) -
Sprite atacando - Sprite recebendo dano - Sprite morrendo (dramático)

17.2 Inimigos
   • Nice Guy (sprite único)
   • Troll Incel (sprite único)
   • Homem Caverna (sprite único)
   • Corporate Bro (sprite único)


                                        19
  • Homem Árvore (Boss sprite)
  • Miragem (Boss sprite)
  • Seu Reflexo (Sprite copiado + modificado)
  • Manifestação Realidade (Boss sprite abstrato)
  • Lady Reason (invisível, só efeitos)

17.3 Tilesets
  • Taverna (azulejos, paredes, móveis)
  • Floresta (grama, árvores, facetas)
  • Deserto (areia, rochas, cactus)
  • Caverna (rocha, estalactites, escuro)
  • Vulcão (lava, rocha vermelha, fogo)
  • Monte (neve, pico, vento)

17.4 UI Elements
  • Caixas de diálogo
  • Menu buttons
  • Health bars
  • Experience bars
  • Item icons (20+ itens diferentes)
  • Status icons (confusão, paralisia, etc)
  • Menu backgrounds
  • Battle backgrounds (para cada bioma)

17.5 Animações
  • Ataque (som + sprite)
  • Magia (efeito visual)
  • Crítico (flash + som especial)
  • Morte (fade out + som triste)
  • Victory (animação de dança patética)
  • Level up (efeito visual dourado)



18. FLUXOGRAMA TÉCNICO
BOOT
  ↓
[Tela Inicial]
  �� New Game → Init Game State
  �� Load Game → Load Savefile
  �� Settings → Config Menu
  �� Quit → Exit
      ↓


                                     20
[Taverna do Lamento - Cena Inicial]
  �� Diálogo com Zezé
  �� Tutorial Combate (opcional)
  �� Primeira Missão
      ↓
[World Map]
  �� Pode explorar todas as áreas
  �� Encontros aleatórios no mapa
  �� Diálogos com NPCs
  �� Item shop na Taverna
  �� Save/Load na Taverna
      ↓
[Battle System]
  �� Turn Based Combat Loop
  �� Defeat → Game Over Screen
  �� Victory → EXP/Loot
  �� Escape → Voltar ao Mapa
      ↓
[Boss Encounters]
  �� Floresta: Homem Árvore
  �� Deserto: Miragem Ego
  �� Caverna: Seu Reflexo
  �� Vulcão: Manifestação Realidade
  �� Monte: Lady Reason
      ↓
[Ending Logic]
  �� Check vitória method
  �� Zezé aparição final
  �� Cinematc/Diálogo
  �� Ending Screen + Créditos



19. CHECKLIST DE IMPLEMENTAÇÃO
Core Mechanics (ESSENCIAL)
  □ Turn-based combat system
  □ Party system (4 personagens)
  □ Attack/Magic/Item/Escape actions
  □ Enemy AI (básico, turnos simples)
  □ Level up system
  □ Inventory management
  □ NPC interactions/dialogs
  □ Map navigation
  □ Save/Load system
  □ Battle transitions


                                  21
Conteúdo (IMPORTANTE)
  □ Todos os 4 personagens
  □ Todos os 4 inimigos normais
  □ Todos os 4 bosses
  □ Todos os diálogos principais
  □ Todos os 6 biomas
  □ Zezé e aparições
  □ Lady Reason e cena final

Polish (BOM TER)
  □ Animações de ataque
  □ Efeitos sonoros
  □ Música temática
  □ Achievements
  □ Dificuldade variável
  □ Easter eggs

Nice to Have (LUXO)
  □ Ataques combinados
  □ Sistema de amizade
  □ Sidequest
  □ Loja de items expansiva
  □ Equipamento/loot
  □ Personalizações



20. NOTAS PARA IA DESENVOLVEDORA
Ton geral
  • Humor é sarcástico, nunca genuinamente cruel
  • Piadas são SOBRE masculinidade tóxica, NÃO para humilhar mulheres
  • Zezé é o “greek chorus” que explicita a hipocrisia
  • Mensagem final: “Seu problema é você, mas você tem potencial”

Prioridades de Desenvolvimento
  1. Engine | Core combat loop (60%)
  2. Personagens | Sprites + Animations (70%)
  3. Conteúdo | Diálogos + Bosses (80%)
  4. Polish | SFX + Efeitos visuais (40%)
  5. Variação | Endings + Side content (30%)




                                   22
Desafios Estimados
  • Turn-based combat em HTML: Usualmente 2-4 semanas
  • Sprite management: 1-2 semanas
  • Diálogos + Eventos: 1-2 semanas
  • Polish + Debug: 1 semana
Estimativa Total: 5-11 semanas para versão completa



21. REFERÊNCIAS E INSPIRAÇÃO
Games Similares
  • Dragon Quest: Turn-based combat style
  • Earthbound: Humor absurdo em RPG
  • Undertale: Diálogos memoráveis em indie game
  • Doki Doki Literature Club: Meta-humor e quarta parede
  • Papers, Please: Ironia em gameplay

Artistas/Influências de Tom
  • Bill Burr (comédia stand-up sarcástica)
  • south park (social commentary via absurdo)
  • Psicólogo social comentando masculinidade (dr. k, etc)



22. APÊNDICE: DIÁLOGOS ADICIONAIS
Diálogos Aleatórios no Mapa (Quando cansado)
[BOLETO]: Vocês acham que a gente vai conseguir?
[CAVEIRA]: Tecnicamente a gente já tá perdido desde o começo.
[PORQUINHO]: Mas... pelo menos tamo junto?
[MELECA]: É. Tipo, se a gente tá fracassando, tamo fracassando em equipe.

[BOLETO]: Como a gente explica pra alguém porque a gente tá levando fogo pra montanha?
[CAVEIRA]: Você não explica. Você apenas... faz. E espera morte rápida.
[PORQUINHO]: A parte "morte rápida" assusta.
[MELECA]: A morte rápida seria uma melhora.

[CAVEIRA]: Zezé aparece toda hora, não é?
[PORQUINHO]: Deve ser parte do código da realidade.
[BOLETO]: Código?
[CAVEIRA]: Entenda como queira. O ponto é que o universo não gosta de gente que pensa muito.

[MELECA]: Uma vez eu sonhei que uma garota não saiu correndo.


                                    23
[BOLETO]: Isso é otimismo.
[MELECA]: Não, era um pesadelo. Ela desmaiou de horror.
[CAVEIRA]: Ainda era um ending melhor.

NPC Reactions Aleatórias
[Quando aproximam de NPC Woman]:
"Não."

[Quando abordam um vendedor]:
"Vocês têm dinheiro? Pois é. Não é suficiente pra você comprarem DIGNIDADE."

[Quando falam com outro aventureiro]:
"Vocês é quem tá nessa jornada louca? Boa sorte. Vocês vai precisar."

[Quando retornam após derrota]:
"Vocês perdeu de novo? Impressionante. Não de forma positiva."

[Quando retornam após vitória]:
"Vocês ganhou? Como? Por acaso?"

Diálogos de Status Effect
[Confundido]:
"BOLETO": EU AMO AS MINAS! [ataca aliado]
"CAVEIRA": Isso provavelmente resume você.

[Paralisiado]:
"PORQUINHO": Eu tô congelado! Que pena. [bip bip]

[Poisoned]:
"MELECA": Já tava nojento antes, então...

[Morrendo]:
"CAVEIRA": Finalmente...
[NPC]: Espera mais um pouco, você vai conseguir perder mais.



23. CONCLUSÃO
Este GDD define completamente “Catirobas do Inferno”. Ele é um game design
que combina: - Mecânicas claras: Turn-based combat estilo RPG Maker -
Narrativa forte: Sátira de masculinidade tóxica - Personagens memoráveis:
Cada um com arco próprio - Humor consistente: Tom sarcástico do início ao
fim - Estrutura escalável: Pode ser simples ou complexo



                                   24
Para a IA desenvolvedora: Este documento é suficiente para criar um jogo
funcional. Priorize o core loop de combate, depois personagens, depois diálogos.
O rest é polish.
Bom jogo! �


GDD finalizado.   Pronto para desenvolvimento.     O fogo primordial está es-
perando.



CRÉDITOS FICTÍCIOS
Game Design: Você, Criador Original
Narrativa: Absurdo brasileiro encontra sátira americana
Playtesting: Zezé, Sabichão Maconheiro
Aprovação Final: Ninguém (porque ninguém quer estar associado)
THE END (ou é?)




                                      25
