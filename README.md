# Catirobas do Inferno

Um RPG tático isométrico estilo Final Fantasy Tactics: batalhas em grid
turn-based com progressão de classes, magia, armas e itens. Construído em
**TypeScript + HTML5 Canvas 2D**, sem game engine, sem art assets — cada sprite
é pixel art definida em código.

> *No reino de Testosteria, tudo era diversão até que as mulheres se cansaram.
> Quatro heróis rejeitados precisam salvar o mundo devolvendo a "macheza" e o
> estilo dos anos 80. Sátira de masculinidade tóxica com humor absurdo.* —
> História completa → **[STORY.md](STORY.md)**.

Quatro heróis fixos (Boleto, Porquinho, Meleca, Caveira) com classes primárias
travadas e sub-jobs equipáveis, seis biomas temáticos, sistema de turnos por
charge-time, e uma IA que cura, foca, flanqueia e persegue. O party cresce
durante a campanha via recrutamento de inimigos e aliados convidados.

## Rodar

```bash
npm install
npm run dev        # abre a URL localhost impressa
```

Outros scripts:

```bash
npm run build      # typecheck + build de produção para dist/
npm test           # roda a suite Vitest
```

## Como jogar

- **New Game** começa o jogo com os 4 heróis fixos (Boleto, Porquinho, Meleca,
  Caveira), cada um com classe primária travada.
- No turno da sua unidade, use o menu de ação (aparece ao lado da unidade ativa):
  - **Mover** — clique em um tile destacado (azul). O preview do caminho
    (amarelo) mostra a rota; movimento respeita alcance, altura do terreno, e
    Jump da unidade. Pode mover **através** de aliados, mas não parar em tile
    ocupado; inimigos bloqueiam o caminho.
  - **Atacar** — clique em um inimigo dentro do alcance da arma (vermelho).
  - **Skill** — escolha uma skill aprendida (custa MP); clique em um tile alvo.
    Skills de área mostram preview da AoE (laranja). Skills de suporte podem
    alar aliados ou você mesmo.
  - **Item** — use um consumível compartilhado (Cerveja, Pizza Fria, Doritos,
    Energético Misterioso, Foto do Boleto, Espelho Quebrado, Manual de
    Conversação, Maconha de Zezé).
  - **Aguardar** — encerra o turno.
- **Botão direito** cancela de volta ao menu. **Enter** / **E** encerra o turno.
- **Rotacionar a câmera** para ver o mapa de outro ângulo: botões **⟲ / ⟳**
  (canto superior direito) ou teclas **,** / **.** giram o tabuleiro em passos
  de 90°. Funciona a qualquer momento, inclusive no turno inimigo.
- Ordem de turnos (barra superior) é guiada por Speed (sistema de charge-time).
- **Posição importa.** Atacar pelo flanco ou pela retaguarda, ou de terreno
  mais alto, causa mais dano e crítica mais frequente. Ataques à distância e
  magias ofensivas precisam de **linha de visão** — paredes e terreno alto
  bloqueiam o tiro.
- **Reações.** Cavaleiro e Tanque contra-atacam inimigos adjacentes que os
  atingem em melee.
- Cada batalha mostra seu **objetivo** (topo centro). A maioria é vencida
  derrotando todos os inimigos, mas algumas diferem — a final é vencida
  **derrotando a Senhora Razão**. Entre fases, a **Taverna do Lamento** permite
  trocar sub-jobs, trocar armas, gastar Skill Points para aprender novas
  skills, e **recrutar reforços** (inimigos recrutáveis e aliados convidados
  como Zezé) conforme a campanha abre slots de deploy. Progresso é salvo
  automaticamente (localStorage); **Continue** resume da taverna.

## Classes

Os 4 heróis têm classes primárias fixas. As ~10 classes restantes existem
como sub-jobs equipáveis na Taverna.

| Classe Primária | Herói | Role | Skills |
|-----------------|-------|------|--------|
| Cavaleiro | Boleto | DPS físico | Golpe Brilhoso, Guarda |
| Mago | Porquinho | Suporte mágico | Abracadabrum Sexicus (cura), Incantum Confusus (confund), Magicus Ridiculum (debuff), Levitatus Penosos (escape) |
| Tanque | Meleca | Defesa / absorver dano | Soco Viscoso, Abraço Mortal |
| Assassino | Caveira | Crítico / agilidade | Apunhalar, Crítico frequente |

Sub-jobs disponíveis (equipáveis na Taverna): Mestre do Mulet, Mago de Latim
Errado, Slime Lord, Emo Necromante, e mais — cada uma com seu próprio kit de
skills, armas, e sprite.

### Espécies

Cada herói tem uma espécie, aplicando modificadores flat de stats **e uma
afinidade elemental** (fraqueza ×1.5 / resistência ×0.5 para spells daquele
elemento): **Cavalo** (Boleto), **Porco** (Porquinho), **Slime** (Meleca),
**Esqueleto** (Caveira). Inimigos têm suas próprias espécies: Nice Guy, Troll
Incel, Homem Caverna, Corporate Bro.

## A campanha

Seis biomas de dificuldade crescente, da taverna ao topo do Monte Macheza.
Veja **[STORY.md](STORY.md)** para a narrativa completa.

| # | Bioma | Cenário |
|---|-------|---------|
| 1 | Taverna do Lamento | Casa base — tutorial, shop, save, descansar |
| 2 | Floresta da Rejeição | Árvores que riem — primeiras batalhas, Nice Guys |
| 3 | Deserto do Esquecimento | Calor e esquecimento — confusão a cada 3 turnos |
| 4 | Caverna do Constrangimento | Flashbacks constrangedores — tutorial de magia |
| 5 | Vulcão da Verdade | Dano passivo por temperatura — todos os inimigos |
| 6 | Monte Macheza | Topo — Senhora Razão, endings múltiplos |

## Endings

Quatro endings baseados em como o jogador chegou ao boss final:
- **A — Coragem da Burrice:** Derrotou Senhora Razão com ataque físico.
- **B — Sabedoria da Aceitação:** Derrotou com magia/itens.
- **C — Final Honesto:** Perdeu a batalha final.
- **D — Pirueta Absurda (secreto):** Encontrou Zezé 10 vezes.

## Layout do projeto

```
src/
  core/     types, game state + save/load, RNG, unit/progression math
  battle/   grid, BFS pathfinding, targeting/AoE, combat, turn manager, AI
  engine/   isometric projection + picking, canvas renderer, input, loop, animator
  ui/       DOM battle HUD, menus, party screen styles
  scenes/   battle scene (turn state machine), party camp, title/victory
  data/     classes, skills, weapons, items, party, maps/ (seis biomas), sprites
tests/      unit tests per module + a full AI-vs-AI battle simulation
docs/      design spec + refactoring plan
```

## Tests

`npm test` roda a suite Vitest: testes unitários por módulo (RNG, pathfinding,
targeting, combat, facing/back-attacks, line of sight, elevation / status /
elemental / counter modifiers, turn order, AI, grid, movement/pass-through,
iso projection, save/load, races, hero roster & reinforcements) mais
invariantes de mapa e uma **simulação de batalha completa** que auto-joga
todos os biomas até um vencedor decisivo enquanto asserta invariantes de
HP/stat todo turno.

## Tech stack

TypeScript (strict), Vite 5, Vitest 2, Canvas 2D. Sem dependências de runtime.

## Roadmap

Veja **[docs/refactoring-plan.md](docs/refactoring-plan.md)** para o plano de
refatoração do fork Ashen Banner → Catirobas do Inferno.