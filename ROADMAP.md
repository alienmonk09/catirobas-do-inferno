# Ashen Banner — Roadmap

Where the game is and where it's going. This is a living document; items move as
priorities shift. Status legend: ✅ done · 🚧 in progress · ⏳ planned · 💭 idea.

## v0.1 — Playable MVP ✅ *(current)*

The complete core loop ships and is covered by the test suite (404 tests, 17
files), including a full AI-vs-AI battle simulation that auto-plays all five
phases to a decisive result.

- ✅ Isometric Canvas 2D renderer — elevation, depth-sorting, tile picking, DPR scaling
- ✅ **Camera rotation** — view the map from 4 angles (90° steps), via on-screen
  buttons or `,` / `.`; rendering and tile-picking stay correct at every angle
- ✅ Charge-time (CT) turn order driven by Speed
- ✅ Movement: BFS pathfinding with move/jump, terrain height, blocked tiles
- ✅ **Pass-through movement** — cross allied tiles, never finish on an occupied
  one; enemies block. Symmetric for player and AI.
- ✅ Actions: Move / Attack / Skill / Item / Wait, with **near-click action menu**
- ✅ 5 classes (Knight, Archer, Black Mage, White Mage, Monk), 16 skills, 8 weapons, 4 items
- ✅ Combat: physical/magical damage, crits, ±15% variance, AoE shapes (single/cross/3×3)
- ✅ Status effects: Guard, Slow *(Haste defined but not yet granted by any skill)*
- ✅ Damage/heal **forecast** preview (shared by UI and AI)
- ✅ Enemy AI: heal-priority, damage maximization, pursuit
- ✅ Progression: XP/leveling, JP skill unlocks, free class change, weapon swap
- ✅ 5-phase campaign + Party Camp interstitial, with title/victory flow
- ✅ Save/load to localStorage (with shape validation)
- ✅ Code-defined pixel-art sprites (no asset pipeline) + VFX + combat juice

## v0.2 — Tactics depth 🚧/⏳

Make the grid fights deeper without new content pipelines.

- ⏳ **Facing & back-attacks** — directional facing; flank/rear damage and hit bonuses
- ⏳ **Line of sight** — ranged attacks and spells respect walls/elevation
- ⏳ **Elevation combat modifiers** — high-ground hit/damage advantage
- ⏳ **Haste, in practice** — skills/items that grant the already-defined Haste status
- ⏳ Expanded status kit (poison, stop, protect/shell, regen) with UI pips
- 💭 Knockback / forced movement and reaction abilities (counter, cover)

## v0.3 — Content & systems ⏳

Widen the build with more to play and more ways to build a party.

- ✅ **Choose your party** — pick four heroes from a roster of seven at New Game
- ✅ **Races** — Human/Elf/Dwarf/Halfling/Orc, each with flat stat modifiers
- ✅ **Two more classes** — Thief (Enzo) and Druid (Penelope), with skills & weapons
- ⏳ **Secondary job / ability pool** — equip a second class's skill set (FFT-style)
- ⏳ More classes (e.g. Lancer, Time Mage, Summoner) and the skills/weapons to match
- ⏳ Elemental affinities — fire/ice/bolt/holy/nature weaknesses & resistances that matter
- ⏳ More maps / chapters beyond the current five; optional skirmishes
- 💭 Terrain hazards & special tiles (lava, water, traps, destructible cover)
- 💭 Armor & accessory equipment slots

## v0.4 — Narrative & presentation ⏳

Put the [story](STORY.md) on screen.

- ⏳ In-engine dialogue / cutscene system; per-chapter story beats
- ⏳ Character portraits and named-enemy intros
- ⏳ **Audio** — music per phase, combat SFX (no audio in the build yet)
- 💭 Light overworld / chapter-select map framing the campaign

## v1.0 — Release polish 💭

- 💭 Difficulty options & rebalanced enemy curves
- 💭 New Game+ / post-campaign content & unlockables
- 💭 Accessibility pass (color-blind palettes, input remap, text scaling)
- 💭 Settings/options menu, run-time save slots
- 💭 Performance pass for large maps

## Project hygiene (ongoing)

- ⏳ Add a license (currently unlicensed — all rights reserved by default)
- ⏳ CI: run `npm run build` + `npm test` on push/PR
- ⏳ CONTRIBUTING guide and issue templates
- 💭 Playable build published via GitHub Pages

---

Known minor limitations are listed in the [README](README.md#known-minor-limitations).
Have an idea or found a bug? Open an issue.
