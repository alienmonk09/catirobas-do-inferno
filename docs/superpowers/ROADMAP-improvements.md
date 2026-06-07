# 50-Improvements Roadmap

Autonomous overnight sweep (ultracode) on branch `feat/improvements-roadmap` (off
`feat/rich-battlefield`). 91 grounded candidates from 10 category scouts → deduped + ranked to 50,
ordered for safe sequential implementation (low-risk + unit-testable + standalone first; same-file
items adjacent). Each is implemented via an implement→adversarial-verify subagent pair, build kept
green (`tsc` + `npm test` + `npm run build`), committed incrementally.

**Status legend:** ⬜ pending · 🔄 in progress · ✅ done · ⚠️ flagged (needs user taste) · ⏭️ skipped

| ID | Title | Area | V/R | Verify | Status |
|----|-------|------|-----|--------|--------|
| R01 | Stopped units should not counterattack | combat | H/L | unit | ⬜ |
| R02 | Slow & haste mutually exclusive | combat | M/L | unit | ⬜ |
| R03 | Net Poison+Regen into one HP delta/tick | combat | M/M | unit | ⬜ |
| R04 | Auto-Potion falls back to X-Potion | combat | M/L | unit | ⬜ |
| R05 | Exhaustiveness guard on resolveSkillOnTarget | combat | M/L | logic | ⬜ |
| R06 | Pin facing×defense×element×crit composition | combat | L/L | unit | ⬜ |
| R07 | Pin Poison+Regen interaction in tests | combat | M/L | unit | ⬜ |
| R08 | coverFor stable tie test | combat | L/L | unit | ⬜ |
| R09 | Fold expected crit into forecast | combat | M/L | unit | ⬜ |
| R10 | Weapon attacks honor elemental affinity | combat | M/L | unit | ⬜ |
| R11 | AI penalizes ending turn on lava/mire | ai | H/L | unit | ⬜ |
| R12 | counterRisk for range-1 damage skills | ai | H/L | unit | ⬜ |
| R13 | AoE friendly-fire penalty scales w/ dmg | ai | H/L | unit | ⬜ |
| R14 | AI stops overvaluing debuffs on near-dead | ai | M/L | unit | ⬜ |
| R15 | Heal triage favors most wounded ally | ai | M/L | unit | ⬜ |
| R16 | AI buffScore recognizes Guard | ai | L/L | unit | ⬜ |
| R17 | AI prefers high ground on equal damage | ai | M/L | unit | ⬜ |
| R18 | AI seeks rear/flank on equal damage | ai | M/L | unit | ⬜ |
| R19 | Ranged enemies stop at firing range | ai | H/M | unit | ⬜ |
| R20 | Low-HP AI units retreat | ai | H/M | unit | ⬜ |
| R21 | Make holy element mechanically active | data | M/L | unit | ⬜ |
| R22 | Time Mage gets a unique skill | data | H/L | unit | ⬜ |
| R23 | Knight gets reach/AoE skill(s) | data | H/L | unit | ⬜ |
| R24 | Archer gets a 3rd/4th skill | data | H/L | unit | ⬜ |
| R25 | Caster weapon upgrade path / gold sink | data | M/M | screenshot | ⬜ |
| R26 | Add Remedy status-cure consumable | data | H/M | unit | ⬜ |
| R27 | Pin consumable economics in tests | data | M/L | unit | ⬜ |
| R28 | Author SP1 props as cover on bare maps | data | H/L | screenshot | ⬜ |
| R29 | Convert frostspirePass rout→seize | data | M/L | unit | ⬜ |
| R30 | Stretch partyCapForPhase to 17 phases | data | M/M | unit | ⬜ |
| R31 | Reject non-finite level/xp in save validation | progression | H/L | unit | ⬜ |
| R32 | survivorsAfterBattle: alive===true | progression | L/L | unit | ⬜ |
| R33 | newSkillName hint checks sub-job | progression | L/L | unit | ⬜ |
| R34 | Recruits seed XP onto party curve | progression | M/L | unit | ⬜ |
| R35 | Test seize/defend/escort outcome branches | standalone | H/L | unit | ⬜ |
| R36 | Test defend boundary at turnsElapsed===N | standalone | M/L | unit | ⬜ |
| R37 | Assert defeat target name unique | standalone | M/L | unit | ⬜ |
| R38 | Objective goal tiles not on lava/water | standalone | M/L | unit | ⬜ |
| R39 | Solid prop not on objective goal tile | standalone | M/L | unit | ⬜ |
| R40 | Spawn-fairness min separation | standalone | M/L | unit | ⬜ |
| R41 | Diagonal knockback direction test | standalone | M/L | unit | ⬜ |
| R42 | LOS sight-block at short range test | standalone | M/M | unit | ⬜ |
| R43 | previewOrder vs advanceToNextActor tie test | standalone | M/L | unit | ⬜ |
| R44 | Reduced-motion settings test | standalone | M/L | unit | ⬜ |
| R45 | Fix page title + canvas aria-label | standalone | M/L | logic | ⬜ |
| R46 | Escape cancels a key-rebind | ui | M/L | logic | ⬜ |
| R47 | Keyboard parity + key hints for action menu | battleScene | H/L | logic | ⬜ |
| R48 | Auto-Potion fires from poison/terrain dmg | battleScene | M/L | unit | ⬜ |
| R49 | Counterattacks honor attacker facing | battleScene | M/L | logic | ⬜ |
| R50 | Camp shop shows item names not ids | partyScene | M/L | screenshot | ⬜ |

---

## Details

Each entry: **problem** → **change** (files). Verify = how it's checked. Full machine-readable
specs live in the discovery workflow result; this is the human reference.

- **R01** Stopped units counterattack. → `resolveCounterAttack` add `|| isStopped(defender)` early-return. `combat.ts`
- **R02** slow+haste coexist (×0.75). → `addStatus`: adding slow strips haste & vice-versa. `combat.ts`
- **R03** poison/regen = two popups, order-dependent kill. → net delta + single HitResult; doc poison-first. `combat.ts`
- **R04** Auto-Potion ignores xPotion. → fallback chain potion→hiPotion→xPotion in `resolveAutoPotion`. `combat.ts`
- **R05** `resolveSkillOnTarget` switch has no default. → add `default: assertNever(skill.effect)`. `combat.ts`
- **R06** multiplier stack untested. → combat.test pinning facing×defense×element×crit product. `tests/combat.test.ts`
- **R07** poison+regen untested. → net delta, HitResult order, lethal-poison-blocks-regen. `tests/combat.test.ts`
- **R08** coverFor tie untested. → cover.test equal-HP guards, first wins. `tests/cover.test.ts`
- **R09** forecast claims crit but omits it. → ×(1+critChance·(CRIT_MULT−1)) for physical; export crit consts. `forecast.ts`,`combat.ts`
- **R10** weapons ignore element. → optional `WeaponDef.element`; multiply by `elementDamageMult` (data unset). `types.ts`,`combat.ts`,`forecast.ts`
- **R11** AI terrain-blind on stand tile. → `terrainPenalty(grid,stand,unit)` into option scores. `ai.ts`,`terrain.ts`
- **R12** counterRisk only for basic attacks. → apply to range-1 damage skills hitting 1 foe. `ai.ts`
- **R13** AoE friendly-fire flat 40. → scale by accumulated allyDamage + allyKills·120. `ai.ts`
- **R14** debuffs on near-dead foes. → scale stop/slow by HP frac; skip when lethal dmg available. `ai.ts`
- **R15** heal target triage. → + (1−hp/maxHp)·40 so most-wounded wins. `ai.ts`
- **R16** buffScore ignores Guard. → `case "guard": return ~65`. `ai.ts`
- **R17** no high-ground tiebreak. → +min(2,heightDelta)·0.5 sub-point tiebreak. `ai.ts`
- **R18** no rear/flank tiebreak. → +1.0 rear / +0.5 flank sub-point via attackAngle. `ai.ts`,`facing.ts`
- **R19** ranged AI charges to melee. → advance minimizes max(0,dist−reach). `ai.ts`
- **R20** no retreat logic. → low-HP non-aggressive units maximize distance when no kill. `ai.ts`
- **R21** holy element inert. → give 1-2 races holy weak/resist. `races.ts`
- **R22** Time Mage skills are clones. → add a unique time skill (AoE hasten). `skills/timeMage.ts`,`classes.ts`
- **R23** Knight has 2 skills. → add shieldBash / rallyingCry. `skills/knight.ts`,`classes.ts`
- **R24** Archer has 2 skills. → add multishot / pinningShot. `skills/archer.ts`,`classes.ts`
- **R25** casters have no weapon upgrade. → one magical weapon per caster, ~150-200g. `weapons.ts`
- **R26** no status-cure item. → `cureStatus` ItemEffect + Remedy item. `types.ts`,`combat.ts`,`items.ts`
- **R27** economy undertested. → price monotonicity, sell refund, no-op guards. `tests/economy.test.ts`
- **R28** 17/18 maps have no decor cover. → author 3-6 props on blocked tiles of flat maps. `maps/howlingSteppe.ts`,`gravewatchHollow.ts`,`maldrathsApproach.ts`
- **R29** lopsided objectives. → frostspirePass rout→seize (6,1). `maps/frostspirePass.ts`
- **R30** partyCap assumes 7 phases. → restretch ramp to 17 phases. `party.ts`,`tests/party.test.ts`
- **R31** save accepts NaN/neg level, no xp check. → finite/≥1 level, coerce xp. `state.ts`
- **R32** survivors keep alive:undefined. → predicate alive===true. `state.ts`,`tests/permadeath.test.ts`
- **R33** skill hint ignores sub-job. → also check sub-job next learnable. `progression.ts`
- **R34** recruits join at 0 xp. → seed xp proportionally. `party.ts`,`partyScene.ts`
- **R35** seize/defend/escort untested. → turnManager.test branches. `tests/turnManager.test.ts`
- **R36** defend boundary untested. → objectives.test at turnsElapsed===N. `tests/objectives.test.ts`
- **R37** defeat target name maybe non-unique. → maps.test invariant. `tests/maps.test.ts`
- **R38** goal tiles can be lava/water. → maps.test guard. `tests/maps.test.ts`
- **R39** solid prop can block goal tile. → maps.test guard. `tests/maps.test.ts`
- **R40** spawn separation unchecked. → maps.test min manhattan ≥ floor. `tests/maps.test.ts`
- **R41** diagonal knockback untested. → knockback.test diagonal cases. `tests/knockback.test.ts`,`facing.ts`
- **R42** LOS short-range sightblock untested. → los.test adjacent/diagonal prop. `tests/los.test.ts`,`los.ts`
- **R43** previewOrder vs advance untested. → turnManager.test agreement. `tests/turnManager.test.ts`,`turnManager.ts`
- **R44** reduced-motion untested. → accessibility.test round-trip + node no-op. `tests/accessibility.test.ts`
- **R45** stale title, unlabeled canvas. → title 'Ashen Banner' + canvas aria-label. `index.html`
- **R46** rebind binds Escape. → Escape aborts capture. `menuScenes.ts`
- **R47** action menu mouse-only. → m/a/s/i hotkeys + hints + formatKey. `battleScene.ts`,`battleUI.ts`,`menuScenes.ts`
- **R48** Auto-Potion misses poison/lava dmg. → call tryAutoPotion after tick/terrain. `battleScene.ts`
- **R49** counters always 'front'. → set ctx.fromPos = defender.pos. `battleScene.ts`
- **R50** shop shows raw ids. → map ids→getItem(id).name. `partyScene.ts`
