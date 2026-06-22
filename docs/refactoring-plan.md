# Catirobas do Inferno — Plano de Refatoração & Roadmap

> Fork do engine Ashen Banner (`/Users/jader/dev/catirobas`) para uma nova pele narrativa.
> Gênero preservado: tactics isométrico estilo Final Fantasy Tactics.
> Engine preservado: TypeScript + HTML5 Canvas 2D + Vite + Vitest, sem deps de runtime.
> Narrativa substituída: GDD "Catirobas do Inferno" — história, 4 heróis, 6 biomas, diálogos satíricos PT-BR.

---

## 1. Resumo Executivo

O fork mantém o engine tactics isométrico FFT-style funcional e testado — CT turn order, movimento em grid, facing/back-attacks, elevação, LOS, efeitos de terreno, classes, raças, equipamentos, shop, save/load, IA, reações, knockback, ZoC, e a suite Vitest completa (~1.600 testes) — e troca a pele narrativa para o GDD *Catirobas do Inferno*. O elenco de 10 heróis pick-from-roster vira os 4 heróis fixos (Boleto, Porquinho, Meleca, Caveira). Os 17 mapas de campanha do Ashen Banner são substituídos pelos 6 biomas do GDD. Classes, raças, itens, skills, armas e equipamentos são reskinados para a comédia absurda dos anos 80. O sistema de Affinity/combos, Reputação, achievements e endings ramificados do GDD viram novos subsistemas. Assets permanecem code-defined `SpriteDef` na v1 para evitar adicionar image loader ou deps de runtime. O entregável é uma campanha de 6 biomas totalmente jogável com 4 endings, passando a suite de testes inteira.

---

## 2. Decisão de Gênero

**Decisão: MANTER tactics isométrico FFT-style.**

O engine existente é um sistema FFT funcional e testado:
- `src/battle/turnManager.ts` implementa CT charge-time turns.
- `src/battle/grid.ts`, `src/battle/pathfinding.ts`, `src/battle/combat.ts` implementam movimento em grid, LOS, elevação, facing, e combate orientado a status.
- `src/scenes/battleScene.ts` é uma state machine de turnos de ~1.675 linhas que já cuida de Move/Attack/Skill/Item/Wait/Recruit.
- `src/engine/renderer.ts` renderiza tiles iso e sprites code-art.
- A suite de testes (`tests/`, ~1.600 testes em 67 arquivos) inclui uma simulação AI-vs-AI completa.

Abandonar isso para seguir o GDD (Dragon Quest/RPG Maker menu combat) significaria reconstruir a camada de batalha inteira do zero. Em vez disso, o conteúdo do GDD é adaptado ao gênero existente:

- O party de 4 heróis deploya em um grid.
- Os 6 biomas do GDD viram `MapDef` grid maps com heights, spawns, inimigos, chests, e objetivos.
- Bosses viram grid units com IA multi-fase ou objetivos `defeat`.
- Zezé vira um guest ally recorrente / escort VIP e speaker de diálogo em vez de NPC free-roaming.
- Os 4 endings viram variantes de battle-outcome resolvidos no final de `monteMacheza`.

---

## 3. Matriz de Transplantação

| Elemento do GDD | Alvo no Engine | Ação | Risco |
|---|---|---|---|
| História 3 atos + 4 endings | `src/data/dialogue.ts`, novo `src/scenes/endingResolver.ts` | Adaptar / Novo | Médio |
| 4 heróis (Boleto, Porquinho, Meleca, Caveira) | `src/data/party.ts` | Adaptar | Baixo |
| Zezé (sábio maconheiro) | `src/data/dialogue.ts`, `src/data/maps/*.ts` `allies`, sprites | Adaptar | Baixo |
| Senhora Razão (boss final) | `src/data/maps/monteMacheza.ts`, ending resolver | Adaptar / Novo | Médio |
| 4 inimigos menores (Nice Guy, Troll Incel, Homem Caverna, Corporate Bro) | `src/data/classes.ts`, `src/data/races.ts`, sprites | Adaptar | Baixo |
| 5 bosses de bioma | `src/data/maps/*.ts`, `src/battle/ai.ts` hooks de fase | Adaptar | Médio |
| 6 biomas | `src/data/maps/*.ts`, `src/data/maps/index.ts` `PHASES` | Adaptar / Novo | Médio |
| 8 itens | `src/data/items.ts`, `src/core/types.ts` | Adaptar | Médio |
| 4 magias + combos | `src/data/skills/*.ts`, novo `src/core/affinity.ts`, `src/battle/comboAttacks.ts` | Adaptar / Novo | Médio |
| Sistema de Affinity | `src/core/affinity.ts`, `src/battle/comboAttacks.ts` | Novo | Alto |
| Sistema de Reputação | `src/core/reputation.ts`, `src/scenes/partyScene.ts` hooks de shop | Novo | Médio |
| Achievements irônicos | `src/core/achievements.ts`, `src/scenes/battleScene.ts` hooks | Novo | Baixo |
| Endings A/B/C/D | `src/scenes/endingResolver.ts` | Novo | Médio |
| Dificuldade: Easy / Normal / Hard / Irônico | `src/core/types.ts`, `src/core/state.ts` | Adaptar | Baixo |
| Dano passivo Vulcão (2-3 HP/turno) | `MapDef.biomeRules` + `src/scenes/battleScene.ts` | Novo | Médio |
| Confusão Deserto a cada 3 turnos | `MapDef.biomeRules` + `src/scenes/battleScene.ts` | Novo | Médio |
| Msg de save "Gravado. Pelo menos vocês tentaram." | `src/core/state.ts` | Adaptar | Baixo |
| Settings: velocidade de diálogo, legenda | `src/core/config.ts`, UI de settings | Adaptar | Baixo |
| Asset pipeline (pixel art Tex Avery anos 80) | `src/data/sprites/*.ts` code-art SpriteDefs v1 | Adaptar | Alto |

---

## 4. Decisões Arquiteturais Chave

### (A) Asset Pipeline: Code-Art SpriteDefs vs. PNG Loader

**Recomendação:** v1 usa **pixel art code-defined** via `src/engine/sprite.ts` `SpriteDef` objects.

**Rationale:**
- O README declara explicitamente "no art assets — every sprite is code-defined pixel art" (`README.md:5`).
- `CONTRIBUTING.md:3-5` reforça "no asset pipeline."
- Adicionar PNG loading exigiria um image loader async, hosting de assets, novos paths de render, e possivelmente mudanças no engine. Isso é trabalho de v2.
- Os prompts de `pixel-art-sprite-prompts.md` e `mapa-grafico-assets.md` target Phaser 3.87/4 PNG sheets, mas o renderer existente não usa Phaser. Traduzir os prompts em paletas+rows de `SpriteDef` mantém o engine intacto.

**v2 futuro:** Adicionar PNG/image loader e gerar sprite sheets compatíveis com Phaser se animação de maior fidelidade for necessária.

### (B) Party Roster: Fixo de 4 com growth por recrutamento

**Decisão do usuário:** Os 4 heróis do GDD (Boleto, Porquinho, Meleca, Caveira) são o núcleo fixo e permanente. O sistema de party-size progression do engine (3→4→5→6 via `partyCapForPhase`) é mantido, mas a base inicial sobe para 4 e os slots extras que se abrem durante a campanha são preenchidos por **inimigos recrutáveis** (mecânica de recruit existente — unidade inimiga a ≤25% HP vira aliada permanentemente) e **guest allies** (Zezé como escort VIP em mapas específicos via `MapDef.allies`).

**Implementação:**
- `src/data/party.ts`: `ROSTER` vira exatamente os 4 heróis; `PARTY_SIZE = 4`; `partyCapForPhase` reescrita para crescer 4→5→6 ao longo da campanha, mas o roster base nunca muda — slots extras só se preenchem via recruit ou guest allies.
- `src/core/state.ts`: estado de save inclui `recruitedUnits: Unit[]` (já existe via recruit system); carrega os 4 heróis fixos + qualquer recrutado/guest acumulado.
- Zezé aparece como guest ally (não recrutável permanentemente) em mapas onde o GDD prevê sua aparição.

**Rationale:**
- A comédia do GDD depende da dinâmica entre os 4 heróis fixos — nunca trocamos nenhum deles.
- O growth de party dá a sensação de "o grupo vai crescendo em aliados improváveis" (inimigos convertidos, Zezé em certas missões), o que é comicamente coerente com o tom do GDD.
- A mecânica de recruit existente (inimigo ≤25% HP vira aliado) é perfeita para o tom: "convertemos um Nice Guy ao nosso lado… de certa forma."

### (C) Classes: 4 Primárias Locked + Sub-Jobs

**Decisão do usuário:** Os 4 heróis têm classes primárias fixas (Boleto=Cavaleiro/DPS, Porquinho=Mago/Suporte, Meleca=Tanque/Defesa, Caveira=Assassino/Crítico). As ~10 classes restantes do engine existem apenas como **sub-job** — o herói pode equipar uma segunda classe no camp para ganhar suas skills, mas a primária nunca muda.

**Implementação:**
- `src/data/party.ts`: cada HeroDef carrega `classId` fixo (cavaleiro, mago, tanque, assassino). O sistema de `subJobId` existente em `src/core/types.ts` permite equipar a segunda classe.
- `src/data/classes.ts`: reskinar os 14 nomes para nomes GDD-flavored, mas marcar 4 como "primárias dos heróis" (não retrainable) e 10 como "sub-jobs disponíveis no camp".
- `src/scenes/partyScene.ts`: a UI de class-change é desabilitada para a primária; só o seletor de sub-job fica ativo.

**Mapeamento primário:**
| Herói | Classe Primária | Reskin do engine |
|---|---|---|
| Boleto | Cavaleiro (DPS, espada) | `knight`-family com skills de `archer`/`berserker` |
| Porquinho | Mago (suporte, magia) | `whiteMage` + `blackMage` skills de support |
| Meleca | Tanque (defesa, absorver dano) | `knight` tank-family + `monk` HP |
| Caveira | Assassino (crítico, agilidade) | `thief` + `ninja` crit family |

**Sub-jobs disponíveis (10):** Mestre do Mulet, Mago de Latim Errado, Slime Lord, Emo Necromante, Druida do Mato, Mago do Tempo, Invocador de Falácias, Geomante do Deserto, Lanceiro Mítico, Paladino da Macheza, Berserker Rejeitado, Ninja das Sombras.

**Rationale:**
- Mantém o sub-job system FFT que é o coração da profundidade tática do engine.
- Os 4 heróis nunca perdem sua identidade narrativa (primária fixa), mas ganham flexibilidade tática via sub-job.
- O GDD só define 4 magias para Porquinho, mas com sub-jobs o jogador pode dar a qualquer herói acesso a skills adicionais — ampliando a variedade sem quebrar a narrativa.

### (D) Raças: Manter 8 Fantasy Races vs. Espécies do GDD

**Recomendação:** **Substituir por 4 espécies de herói + 4 espécies de inimigo.**

**Rationale:**
- O GDD não tem elves/dwarves/orcs. Espécies carregam stat mods e affinidades elementais, preservando as mecânicas de damage-forecast existentes.
- Espécies de herói: Cavalo, Porco, Slime, Esqueleto.
- Espécies de inimigo: Nice Guy, Troll Incel, Homem Caverna, Corporate Bro.

### (E) Sistema de Affinity / Combos

**Recomendação:** Novo `src/core/affinity.ts` para affinity persistente do party, plus `src/battle/comboAttacks.ts` para skills de combo em batalha.

**Rationale:**
- Esse subsistema não existe no engine. Precisa ser construído do zero e testado.
- Affinity cresce via kills compartilhados e escolhas de diálogo específicas.
- Skills de combo aparecem no action menu quando dois heróis adjacentes atingem 100% affinity:
  - Boleto + Porquinho → "Soco Mágico Brilhoso"
  - Meleca + Caveira → "Abraço Mortal"
  - Todos 4 → "Formação Macheza Final"

### (F) Endings Ramificados

**Recomendação:** Novo `src/scenes/endingResolver.ts` lê flags de campanha no final de `monteMacheza`.

**Rationale:**
- Endings dependem de *como* o jogador chegou ao boss final:
  - A: final hit foi ataque físico (Coragem da Burrice).
  - B: final hit foi magia ou item (Sabedoria da Aceitação).
  - C: o party perdeu a batalha (Final Honesto).
  - D: Zezé foi encontrado 10 vezes (Pirueta Absurda — secreto).
- Flags são registrados durante a batalha final em `src/scenes/battleScene.ts`.

### (G) Mecânicas de Bioma

**Recomendação:** Adicionar um campo opcional `biomeRules?: BiomeRules` ao `MapDef` em `src/core/types.ts`, aplicado por um hook por-turno em `src/scenes/battleScene.ts`.

**Rationale:**
- Mantém comportamento específico de mapa data-driven e testável.
- Vulcão: todos os heróis vivos perdem 2-3 HP no turn start.
- Deserto: a cada 3º turno, 30% chance de infligir `confused` em um herói aleatório.
- Estes reusam o sistema de status existente; apenas a trigger logic é nova.

### (H) Diálogo e PT-BR Completo

**Decisão do usuário:** O jogo inteiro é portado para PT-BR com diálogos satíricos — não apenas as falas dos personagens, mas toda a UI, menus, battle log, settings, nomes de itens, skills, classes, tooltips, achievement descriptions, e textos de ending.

**Implementação:**
- Substituir `src/data/dialogue.ts` `PHASE_DIALOGUE` e `PHASE_OUTRO` pelos scripts verbatim do GDD keyed pelos novos map ids.
- Varredura i18n em toda a UI DOM (`src/ui/`, `src/scenes/`): todo texto hardcoded em inglês vira PT-BR. Cobre: botões (Move→Mover, Attack→Atacar, Skill→Skill, Item→Item, Wait→Aguardar, Escape→Fugir), menus (Party Camp tabs, settings, title, victory), battle log, tooltips, level-up card, spoils screen, shop labels.
- `DIALOGUE_ENABLED` em `src/core/config.ts` muda de `false` para `true` (o conteúdo agora existe).
- Ranges de linhas do GDD para importar:
  - Abertura taverna: linhas 395-418 do GDD
  - Vitória em combate: linhas 421-433
  - Encontro com mulher: linhas 436-446
  - Pré-final: linhas 452-471
  - Descrições de bioma/boss: linhas 720-778
  - Diálogos de status effect: linhas 1044-1058
  - NPC reactions: linhas 1028-1042
  - Diálogos cansados no mapa: linhas 1004-1026

**Rationale:**
- A comédia do GDD vive no texto. Traduzir só os diálogos e deixar a UI em inglês quebra a imersão cômica.
- PT-BR é a língua do GDD e do público-alvo. Tudo vira PT-BR: do "Game Over" ao "Gravado. Pelo menos vocês tentaram."

---

## 5. Plano de Fases (Waves)

### W0 — Rename + Brand Scaffold

**Goal:** Rebrand de superfície sem mudanças de gameplay.

**Tasks:**
- `package.json`: mudar `name` para `catirobas-do-inferno`.
- `README.md`: título, intro, tabela de campanha.
- `index.html`: `<title>` se presente.
- Substituir `STORY.md` por um resumo de Catirobas.
- Atualizar labels hardcoded "Ashen Banner" nas scenes de title/victory.

**Depende de:** Nada
**Risco:** Baixo
**Verificação:** `npm run build && npm test` passam inalterados.

---

### W1 — Transplante de Dados

**Goal:** Substituir a camada de conteúdo Ashen Banner por conteúdo Catirobas.

**Tasks:**
- `src/data/party.ts`: substituir `ROSTER` por Boleto, Porquinho, Meleca, Caveira; `PARTY_SIZE = 4`; `partyCapForPhase` reescrita para crescer 4→5→6 ao longo da campanha (slots extras preenchidos por inimigos recrutáveis e guest allies como Zezé).
- `src/data/classes.ts`: reskinar nomes/descrições/cores para GDD; marcar 4 classes como primárias locked (Cavaleiro, Mago, Tanque, Assassino) e ~10 como sub-jobs equipáveis no camp.
- `src/data/races.ts`: substituir por 4 espécies de herói (Cavalo, Porco, Slime, Esqueleto) + 4 espécies de inimigo (Nice Guy, Troll Incel, Homem Caverna, Corporate Bro).
- `src/data/items.ts`: implementar 8 itens do GDD (Cerveja, Pizza Fria, Doritos, Energético Misterioso, Foto do Boleto, Espelho Quebrado, Manual de Conversação, Maconha de Zezé); estender `ItemEffect` em `src/core/types.ts` se necessário.
- `src/data/weapons.ts`: reskinar armas iniciais e tiers (espada de madeira, varinha de galho, punhos viscosos, punhais ósseos, + tiers superiores GDD-flavored).
- `src/data/equipment.ts`: reskinar armor/accessories para itens GDD-flavored.
- `src/data/skills/*.ts` + barrel: adicionar 4 magias do GDD (Abracadabrum Sexicus, Incantum Confusus, Magicus Ridiculum, Levitatus Penosos); reskinar skills existentes para PT-BR.
- `src/scenes/partyScene.ts`: desabilitar class-change para primária; manter seletor de sub-job ativo.

**Depende de:** W0
**Risco:** Baixo
**Verificação:** `createStartingParty()` retorna os 4 heróis do GDD; todos itens/spells existem; testes passam.

---

### W2 — Transplante de Mapas ✅ COMPLETE

**Goal:** Criar 6 biomas do GDD como `MapDef` grid maps.

**Tasks:**
- Criar:
  - `src/data/maps/tavernaDoLamento.ts` (tutorial/shop/save)
  - `src/data/maps/florestaDaRejeicao.ts`
  - `src/data/maps/desertoDoEsquecimento.ts`
  - `src/data/maps/cavernaDoConstrangimento.ts`
  - `src/data/maps/vulcaoDaVerdade.ts`
  - `src/data/maps/monteMacheza.ts`
- Atualizar `src/data/maps/index.ts` `PHASES` para os 6 mapas.
- Adicionar `biomeRules?: BiomeRules` ao `MapDef` em `src/core/types.ts`.
- Definir `biomeRules` para Deserto (confusão) e Vulcão (dano passivo).

**Depende de:** W1
**Risco:** Médio
**Verificação:** Testes de invariante de mapa passam; sim de IA vence todo mapa.

---

### W3 — Diálogo + PT-BR Completo + Story Scenes

**Goal:** Portar o jogo inteiro para PT-BR e importar os scripts completos de diálogo satírico do GDD.

**Tasks:**
- Substituir `src/data/dialogue.ts` `PHASE_DIALOGUE` e `PHASE_OUTRO` pelos scripts do GDD keyed pelos novos map ids (ranges: linhas 395-418 abertura, 421-433 combate, 436-446 mulher, 452-471 pré-final, 720-778 biomas, 1004-1026 cansados, 1028-1042 NPCs, 1044-1058 status).
- Adicionar handling de speaker Zezé em `src/data/sprites/index.ts` `speakerSprite` se necessário.
- Adicionar linhas de diálogo de ending keyed por ending id (A/B/C/D do GDD linhas 798-819).
- Habilitar `DIALOGUE_ENABLED` em `src/core/config.ts` (mudar de `false` para `true`).
- **Varredura PT-BR em toda a UI DOM:** traduzir todo texto hardcoded em inglês para PT-BR nos arquivos:
  - `src/ui/` (botões: Move→Mover, Attack→Atacar, Skill→Skill, Item→Item, Wait→Aguardar, Escape→Fugir; menus; HUD labels).
  - `src/scenes/` (title, victory, party camp tabs, settings, level-up card, spoils screen, shop labels).
  - `src/scenes/battleScene.ts` (battle log strings, objective text, turn announcements).
  - `src/data/` (item names, skill names, class names, race names, weapon names, equipment names, achievement descriptions, reaction descriptions).
  - Settings menu (volume, mute, dialogue speed, subtitles toggle).
- Mensagem de save: "Gravado. Pelo menos vocês tentaram."
- Mensagem de game over: "Vocês morreram. Isso resume vocês?"

**Depende de:** W2
**Risco:** Baixo (textos), Médio (cobertura completa PT-BR sem deixar string para trás)
**Verificação:** Todo mapa tem diálogo de intro em PT-BR; toda UI está em PT-BR; grep por strings em inglês hardcoded retorna vazio nos arquivos de UI; testes passam.

---

### W4 — Sistemas Novos

**Goal:** Implementar Affinity, combos, Reputação, achievements, endings, e mecânicas de bioma.

**Tasks:**
- `src/core/affinity.ts`: estado de affinity persistente por par de heróis; ganhos via kills compartilhados/diálogo.
- `src/battle/comboAttacks.ts`: definições de skills de combo e injeção no menu.
- `src/core/reputation.ts`: scores de opinion de NPC; hook na lógica de desconto de shop em `src/scenes/partyScene.ts`.
- `src/core/achievements.ts`: cinco achievements irônicos; hooks em `src/scenes/battleScene.ts`.
- `src/scenes/endingResolver.ts`: lógica de endings A/B/C/D.
- `src/scenes/battleScene.ts`: aplicar `map.biomeRules` no turn start; registrar flags da batalha final.

**Depende de:** W2, W3
**Risco:** Alto
**Verificação:** Cada subsistema tem testes passando; ending resolver cobre os 4 endings.

---

### W5 — Asset Pipeline v1

**Goal:** Traduzir prompts de pixel art do GDD em code-art `SpriteDef`s.

**Tasks:**
- `src/data/sprites/heroes.ts`: Boleto, Porquinho, Meleca, Caveira.
- `src/data/sprites/characters.ts`: 4 inimigos + 5 bosses.
- `src/data/sprites/items.ts`: 8 ícones de itens.
- `src/data/sprites/skills.ts`: 4 ícones de spells.
- `src/data/sprites/vfx.ts`: VFX abstrato para Senhora Razão.
- Manter grids 24×30 hero / 16×20 enemy existentes.

**Depende de:** W1
**Risco:** Alto
**Verificação:** Testes de validação de sprite passam; nenhum sprite grey-box em nenhum mapa.

---

### W6 — Reskin de Áudio

**Goal:** Substituir SFX e temas de música para match com 80s/jazz/synthwave/desert/vulcão/hair-metal.

**Tasks:**
- `src/engine/audio.ts`: reskinar SFX (ataque cômico, magia patética fail, critical ding, victory irônico, game over Windows-95).
- `src/engine/music.ts`: adicionar temas por bioma; atualizar `battleThemeForPhase`.

**Depende de:** W2
**Risco:** Baixo
**Verificação:** Música/SFX tocam por bioma; settings de mute/volume funcionam.

---

### W7 — Polish + Testing

**Goal:** Rebalancear para party de 4 heróis com growth (4→5→6 via recruta), adaptar testes, e verificar a campanha completa.

**Tasks:**
- Rebalancear níveis/quantidades de inimigos nos 6 mapas para um party que começa com 4 e cresce via recrutamento.
- Adicionar `"ironic"` como quarta opção ao union `Difficulty` e ao scaling (Easy/Normal/Hard/Irônico).
- Adaptar todos os testes de data-name para novos ids (Boleto/Porquinho/Meleca/Caveira, novos map ids, novos item ids).
- Adaptar testes de `partyCapForPhase` para o novo growth 4→5→6.
- Rodar a simulação AI-vs-AI pelos 6 mapas (convergência obrigatória).
- Browser-verify todos os 6 biomas e os 4 endings.
- Verificar que nenhuma string em inglês permanece na UI (grep final PT-BR).

**Depende de:** W4, W5, W6
**Risco:** Médio
**Verificação:** `npm test` e `npm run build` passam; sim de IA converge; manual QA completa.

---

## 6. Roadmap Temporal & Dependências

```
W0 (0.5d) ──► W1 (3d) ──► W2 (4d) ──► W3 (3d) ──┐
                                                   ▼
W5 (4d) ═══════════════════════════════════════ W4 (5d) ──► W7 (4d)
                                                   ▲
W6 (2d) ══════════════════════════════════════════┘
```

| Wave | Duração | Cumulativo | Paralelo com |
|---|---:|---:|---|
| W0 | 0.5 dias | 0.5 dias | — |
| W1 | 3 dias | 3.5 dias | — |
| W2 | 4 dias | 7.5 dias | W5 |
| W3 | 3 dias | 10.5 dias | W6 |
| W4 | 5 dias | 15.5 dias | W6 |
| W5 | 4 dias | 19.5 dias | — |
| W6 | 2 dias | 21.5 dias | — |
| W7 | 4 dias | 25.5 dias | — |

**Caminho Crítico:** W0 → W1 → W2 → W3 → W4 → W7 (~19.5 dias de esforço sequencial, ~25.5 dias de calendário com paralelismo).

---

## 7. Riscos & Mitigações

| # | Risco | Mitigação |
|---|---|---|
| 1 | Party de 4 heróis fixos com growth via recrutamento pode desequilibrar a curva de dificuldade. | `partyCapForPhase` cresce 4→5→6; inimigos recrutáveis têm stats de inimigo (não de herói), então não superpoderam o party; guest allies (Zezé) são temporários por mapa. Validar via AI sim em W7. |
| 2 | 6 biomas do GDD vs 17 mapas existentes encolhe conteúdo. | Arquivar mapas não usados em `src/data/maps/legacy/` e manter apenas os 6 em `PHASES`. Os mapas arquivados ficam disponíveis para skirmishes opcionais futuras. |
| 3 | Tradução code-art do estilo Tex Avery é difícil. | Priorizar silhueta/legibilidade sobre animação; usar fallback `MISSING` para o jogo permanecer jogável durante art WIP. |
| 4 | Tom de comédia pode se diluir em um engine tactics. | Manter humor no diálogo, nomes de itens/skills, strings do battle log, e achievements — não nas mecânicas. |
| 5 | ~1.600 testes referenciam nomes de data Ashen Banner. | Atualizar testes data-driven por wave; manter testes de mecânica inalterados. |
| 6 | Saves existentes de localStorage referenciam ids de heróis antigos. | Bumpar save format version ou mudar o key prefix para `catirobas_`; load-mismatch começa fresh. |
| 7 | Sistema de Affinity pode desequilibrar o party pequeno. | Tunar poder de combo para ~1.5x; fazer Affinity crescer devagar; validar via AI sim. |
| 8 | Fases de boss precisam de IA ou hooks de batalha. | Adicionar transições de fase por HP-threshold em `src/battle/ai.ts` ou `src/scenes/battleScene.ts`. |
| 9 | Regra de confusão do Deserto pode parecer injusta. | Fazê-la determinística (`turnCount % 3 === 0`) e avisar o jogador; deixar `Manual de Conversação` dar imunidade. |
| 10 | Scope creep em direção ao pipeline de PNG/Phaser. | Deferir estritamente PNG generation e image loading para um milestone post-MVP. |
| 11 | Varredura PT-BR incompleta deixa strings em inglês perdidas na UI. | Grep sistemático em W3 e W7 por padrões em inglês (`Move`, `Attack`, `Wait`, `New Game`, `Continue`, `Settings`, etc.); reviewer gate em W7 faz a varredura final. |
| 12 | Classes primárias locked pode limitar a profundidade tática vs o engine original (14 classes retrainable). | Sub-jos compensam: cada herói pode equipar qualquer das ~10 classes como sub-job, mantendo a variedade de skills sem quebrar a identidade narrativa. |

---

## 8. O que NÃO Muda

Os seguintes sistemas de engine permanecem idênticos em implementação; apenas seu conteúdo é reskinado:

- Projeção isométrica, tile picking, camera pan/zoom/follow (`src/engine/iso.ts`, `src/engine/camera.ts`)
- Canvas 2D renderer e pipeline de code-defined `SpriteDef` (`src/engine/sprite.ts`, `src/engine/renderer.ts`)
- CT turn order (`src/battle/turnManager.ts`)
- BFS pathfinding, movimento, jump, regras de pass-through (`src/battle/pathfinding.ts`, `src/battle/grid.ts`)
- Targeting, AoE, line of sight, elevação, facing, back-attacks (`src/battle/targeting.ts`, `src/battle/facing.ts`, `src/battle/los.ts`)
- Resolução de combate, knockback, fall damage, reações, Zone of Control (`src/battle/combat.ts`, `src/data/reactions.ts`)
- Spell charge time (`SkillDef.chargeTime`)
- Shop, buy/sell, own-before-equip, inventário, equipment slots (`src/scenes/partyScene.ts`, `src/core/state.ts`)
- Save slots, undo-move, battle log, NG+, difficulty modes, permadeath (`src/core/state.ts`)
- WebAudio code-synth SFX + music system (`src/engine/audio.ts`, `src/engine/music.ts`)
- AI personalities (`src/battle/ai.ts`)
- Live XP economy, level-up card, spoils screen (`src/core/progression.ts`, `src/scenes/battleScene.ts`)
- Setting de acessibilidade reduced-motion (`src/engine/accessibility.ts`)

---

## 9. Critérios de Aceitação

| Wave | Check binário "Done" |
|---|---|
| W0 | `npm run build && npm test` passam após rebrand. |
| W1 | `createStartingParty()` retorna exatamente Boleto/Porquinho/Meleca/Caveira; todos 8 itens e magias do GDD existem; testes passam. |
| W2 | `PHASES` tem 6 mapas; testes de invariante de mapa passam; sim de IA vence todo mapa. |
| W3 | Todo mapa tem diálogo de intro; cenas chave do GDD presentes; testes passam. |
| W4 | Affinity/combo, reputação, achievements, endings, e mecânicas de bioma têm testes passando e funcionam em batalha. |
| W5 | Nenhum sprite grey-box nos 6 mapas; validação de sprite passa. |
| W6 | Música por bioma toca; SFX tocam; settings de mute/volume funcionam. |
| W7 | Suite de testes completa passa; sim de IA converge; browser verification de todos biomas e endings completa. |

---

## 10. Decisões do Usuário — RESOLVIDAS

As 6 decisões que bloqueavam W1+ foram respondidas pelo usuário em 21/06/2026:

| # | Decisão | Resolução |
|---|---|---|
| 1 | **Party** | Fixo de 4 heróis (Boleto, Porquinho, Meleca, Caveira) **com possibilidade de aumento de party durante a campanha** via recrutamento de inimigos e guest allies (Zezé). |
| 2 | **Mapas** | Exatamente os 6 biomas do GDD. Os 17 mapas existentes do Ashen Banner são arquivados em `src/data/maps/legacy/`. |
| 3 | **Assets** | Code-art v1 via `SpriteDef`. Sem PNG, sem image loader, sem novas deps de runtime. |
| 4 | **Idioma/Tom** | O jogo **inteiro** é portado para PT-BR com diálogos satíricos — UI, menus, battle log, settings, itens, skills, classes, tooltips, achievements, endings. Tudo em PT-BR. |
| 5 | **Classes** | Os 4 heróis têm classes primárias **locked** (Cavaleiro/Mago/Tanque/Assassino). As ~10 classes restantes existem como **sub-jobs** equipáveis no camp. Primária nunca muda; sub-job é livre. |
| 6 | **Dificuldade** | `"ironic"` (Irônico) é adicionada como **quarta opção** ao lado de Easy/Normal/Hard. |

**Status:** Todas as decisões estão refletidas nas seções 3, 4(B), 4(C), 4(H), 5.W4, e 5.W7 deste documento. W1+ está desbloqueado.

---

## Estratégia de Commits Atômicos

- Um commit atômico por wave. Cada commit deve deixar `npm test` verde.
- W1 e W2 podem ser splitados em commits menores por módulo, mas todo commit deve passar testes.
- Orientação TDD:
  - Escrever ou atualizar um teste falhando que asserta o novo dado/conteúdo esperado antes de mudar o arquivo.
  - Fazer a mudança.
  - Verificar que o teste passa.
  - Guardrails chave: testes de invariante de mapa, testes de validação de sprite, simulação AI-vs-AI.
- Branch: `refactor/catirobas-reskin`.
- Merge final apenas após critérios de aceitação de W7 serem atendidos.

---

## Nota sobre Mismatch GDD/Engine

O GDD (`docs/source/catirobas-do-inferno-gdd.md:10`) originalmente target "HTML5 modular com Phaser 4," e os prompts de asset target Phaser 3.87. O repositório existente é um engine Canvas 2D custom sem asset pipeline (`README.md:5`, `CONTRIBUTING.md:3-5`). Este plano portanto trata o GDD como uma **especificação narrativa e de conteúdo** e transplanta esse conteúdo para o engine existente, em vez de adotar Phaser. PNG/Phaser asset generation é deferido para um milestone v2 post-MVP.