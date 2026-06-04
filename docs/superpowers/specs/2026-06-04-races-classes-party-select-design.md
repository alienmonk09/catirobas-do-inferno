# Design — Races, Thief & Druid classes, and party-of-4 selection

Date: 2026-06-04 · Status: approved-to-build (autonomous goal)

## Goal

Three additions to Ashen Banner:
1. **Races** — a new identity axis applying flat stat modifiers.
2. **Two new classes** — Thief (hero **Enzo**) and Druid (hero **Penelope**).
3. **Party selection** — on New Game, the player chooses **4 heroes** from a roster
   of 7, instead of being handed a fixed party of 5.

## Design decisions (KISS)

### Races = flat stat modifiers + flavor
A `RaceId` union with a `RACES` record. Each race carries a partial stat delta
(`RaceMod`) added on top of the class's per-level stats. No new abilities, no
LoS/pathfinding hooks — that would be over-engineering for "add races".

| Race | Modifiers | Feel |
|------|-----------|------|
| Human | (none) | Adaptable, no weaknesses |
| Elf | −8 HP, +3 MAG, +2 RES, +2 SPD | Keen, frail |
| Dwarf | +12 HP, +3 DEF, −2 SPD | Stalwart, slow |
| Halfling | −6 HP, −2 ATK, +3 SPD, +1 MOVE, +1 JUMP | Nimble skirmisher |
| Orc | +10 HP, +3 ATK, −3 MAG, −2 RES | Brutal bruiser |

Modifiers are **flat and modest** so they flavor the unit without overriding
class identity. They are applied inside `statsForLevel(classId, level, raceId?)`
so they survive level-ups and class changes (which recompute stats). Every stat
floors at 1.

### Two new classes, following the existing `ClassDef` pattern

**Thief** — fastest unit in the game, hits hard, fragile.
- base `{ hp 82, mp 28, atk 13, def 7, mag 5, res 7, spd 14, move 5, jump 3 }`
- skills: **Backstab** (pow 20 single melee — a real upgrade over the basic, per
  the earlier balance review), **Hamstring** (Slow debuff), **Fan of Knives**
  (cross AoE).
- weapons: Dagger (pow 4), Rapier (pow 7).

**Druid** — nature hybrid: heals, nature damage, control. Sturdier than a mage.
- base `{ hp 88, mp 50, atk 7, def 7, mag 13, res 11, spd 10, move 4, jump 2 }`
- skills: **Regrowth** (single heal), **Thorn Lash** (nature single damage),
  **Entangle** (Slow debuff at range).
- weapon: Heartwood Staff (magical, pow 3).

A new `Element = "nature"` is added (flavor only today; `vfxKeyForSkill` maps
nature damage → the existing "arcane" VFX, nature heal → "heal", nature
debuff → "status", so no new VFX asset is required).

### Roster of 7 named heroes, fixed class + race; pick 4

The heroes have fixed identities (Enzo *is* the thief). Selection is about *who
marches*, not building characters.

| id | Name | Class | Race |
|----|------|-------|------|
| garan | Garan | Knight | Dwarf |
| lyra | Lyra | Archer | Elf |
| vex | Vex | Black Mage | Human |
| mira | Mira | White Mage | Human |
| bron | Bron | Monk | Orc |
| enzo | **Enzo** | **Thief** | Halfling |
| penelope | **Penelope** | **Druid** | Elf |

`data/party.ts` gains a `ROSTER` constant and `createParty(heroIds)`. Heroes
start at level 3 with 100 JP and the first class skill, matching the prior
starting party. `createStartingParty()` becomes "first 4 of the roster" — used as
the default for the phase-jump test buttons and `createGameState()`.

### Party selection scene

New `PartySelectScene` shown when the player hits **New Game**:
- A grid of 7 hero cards (sprite, name, class, race, role blurb, key stats).
- Click toggles selection; cap at 4; a counter shows "Chosen N/4".
- **Begin Campaign** is enabled only at exactly 4 → builds the party via
  `createParty`, resets inventory, clears any save, and enters Phase I.
- `Navigation` gains `toPartySelect()`, wired in `main.ts`; Title's New Game now
  routes there. Phase-jump test buttons keep using the default 4 (unchanged flow).

Maps keep their 5 player spawns (a test invariant); `buildUnits` already maps
each party member to `playerSpawns[i]` and guards missing spawns, so a 4-unit
party simply uses the first four.

### Save/load
`Unit` gains `raceId: RaceId`. `isValidSave` validates `RACES[u.raceId]` exists.
Enemies built in `battleScene` default to `human` (no mods).

## Touch list
- `core/types.ts` — ClassId (+thief,+druid), Element (+nature), `RaceId`,
  `RaceMod`, `RaceDef`, `Unit.raceId`.
- `data/races.ts` (new) — `RACES`, `getRace`.
- `data/classes.ts` — thief, druid `ClassDef`s.
- `data/weapons.ts` — dagger, rapier, heartwood.
- `data/skills.ts` — 6 new skills.
- `core/unit.ts` — `statsForLevel(classId, level, raceId?)` applies race mods;
  `createUnit` takes `raceId`.
- `data/party.ts` — `ROSTER`, `createParty`, `createStartingParty` (first 4).
- `core/state.ts` — validate `raceId`.
- `data/sprites/{characters,weapons,skills}.ts` — 11 new sprites.
- `data/sprites/index.ts` — `vfxKeyForSkill` nature mapping.
- `scenes/partySelectScene.ts` (new) + `sceneManager.ts` nav + `main.ts` wiring +
  `menuScenes.ts` Title routing + blurb.
- `scenes/partyScene.ts` — show race in the unit card.

## Tests
- `races.test.ts` — RACES well-formed; `statsForLevel` applies mods and floors at 1.
- `party.test.ts` — ROSTER valid (classes/races resolve); `createParty` builds N
  valid level-3 units; selection of 4 yields 4 distinct heroes.
- `state.test.ts` — add `raceId` to the malformed-blob table.
- existing `sprites.test.ts` / data invariants — guard the new sprites & classes.

## Out of scope (YAGNI)
No elemental affinities/resistances yet (nature is flavor). No race-specific
abilities. No new enemies of the new classes. No new maps.
