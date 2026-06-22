# Pixel Art Sprite Prompts — Catirobas do Inferno

> LLM-ready image generation prompts for every sprite needed by the Phaser 3.87 game.
> Style target: 1980s vibrant retro RPG pixel art + Tex Avery exaggerated cartoon poses, limited flat palette, crisp blocky pixels.
> Technical target: PNG-32 with alpha, uniform sprite-sheet grids, 1 px transparent gutters, Phaser 3.87 `load.spritesheet` / `load.image` snippets.

---

## 1. Global Technical Preamble

Paste this block at the start of every prompt you send to the image generator:

```text
Pixel art sprite sheet for "Catirobas do Inferno," a comedic 1980s-style RPG about hopeless losers on a quest to restore their macheza. Render in clean, hand-placed pixel art: crisp blocky pixels with hard edges, zero anti-aliasing, zero sub-pixel blending. Use a strict limited palette of 16 flat colors or fewer. Every color must be a single flat fill with no dithering, no gradients, and no shading ramps. Channel Tex Avery's wildest cartoon exaggeration translated into rigid pixel grids: eyes that pop out as big pixel circles, jaws that stretch an extra tile row, squash-and-stretch in whole-pixel increments, theatrical absurd poses, cranked-to-eleven expressions. The humor is ironic and self-aware. Arrange all frames in a uniform grid on a fully transparent background (PNG-32 with alpha channel). Separate each frame with a 1-pixel transparent gutter. No frame bleeds into another. No anti-aliasing, no gradients, no lighting effects, no photorealism, no anime/chibi, no background fill, no watermarks.
```

### Negative prompt list (append to every call)

- No anti-aliasing, no sub-pixel rendering, no smoothed edges.
- No gradients, ramps, or color transitions within a single surface.
- No dithering patterns.
- No lighting effects, specular highlights, cast shadows, ambient occlusion, rim light.
- No photographic detail, photorealism, painterly textures.
- No soft brushwork, watercolor, oil-paint, pencil sketch.
- No 3D rendering, no isometric projection unless explicitly requested.
- No blurred or feathered outlines.
- No background color or fill behind the sprite; background must be 100% transparent.
- No visible canvas, paper texture, noise grain.
- No floating signatures, watermarks, attribution text.
- No partial transparency on sprite edges (pixel fully opaque or fully transparent).
- No modern UI chrome, rounded-corner overlays, drop shadows on frames.
- No anime, manga, or chibi proportions.
- No realistic human anatomy; all bodies are cartoonishly exaggerated.
- No grimdark or horror realism; tone is absurdist comedy.
- No more than 16 distinct colors per sprite sheet.

### File & naming conventions

- Sprite keys: `hero_<id>`, `enemy_<id>`, `boss_<id>`, `items`, `spell_<id>`, `bg_<zone>`, `tiles_<zone>`, `npc_<id>`, `portraits_heroes`, `ui` (atlas) or per-element sheets.
- Export: PNG-32 with alpha transparency.
- Default gutter: 1 px transparent between frames, 0 px margin on the sheet edge unless noted.
- Power-of-two padding: keep sprite content top-left; pad bottom/right with transparent pixels.

---

## 2. Sprite-Sheet Conventions

| Asset Class | Frame Size | Frame Count | Grid Layout | Raw Sheet (px) | Padded Canvas (px) | Phaser Loader |
|---|---:|---:|---|---|---|---|
| Heroes | 48×48 | 72 | 8 cols × 9 rows | 391×440 | 512×512 | `load.spritesheet('hero_<id>', ..., { frameWidth:48, frameHeight:48, spacing:1 })` |
| Enemies | 48×48 | 14 (+2 empty) | 4 cols × 4 rows | 195×195 | 256×256 | `load.spritesheet('enemy_<id>', ..., { frameWidth:48, frameHeight:48, spacing:1 })` |
| Bosses | 64×64 | 16 (+2 empty) | 3 cols × 6 rows | 194×389 | 256×512 | `load.spritesheet('boss_<id>', ..., { frameWidth:64, frameHeight:64, spacing:1 })` |
| Items | 32×32 | 8 | 4 cols × 2 rows | 131×65 | 256×128 | `load.spritesheet('items', ..., { frameWidth:32, frameHeight:32, spacing:1 })` |
| Spells | 64×64 | 4 | 2 cols × 2 rows | 129×129 | 256×256 | `load.spritesheet('spell_<id>', ..., { frameWidth:64, frameHeight:64, spacing:1 })` |
| NPCs | 48×48 | 4 | 4 cols × 1 row | 195×48 | 256×64 | `load.spritesheet('npc_<id>', ..., { frameWidth:48, frameHeight:48, spacing:1 })` |
| Hero Portraits | 32×32 | 12 | 6 cols × 2 rows | 197×65 | 256×128 | `load.spritesheet('portraits_heroes', ..., { frameWidth:32, frameHeight:32, spacing:1 })` |
| UI Button States | 96×32 | 3 | 1 col × 3 rows | 96×98 | 128×128 | `load.spritesheet('btn_states', ..., { frameWidth:96, frameHeight:32, spacing:1 })` |
| UI Bars | 64×8 | 4 | 1 col × 4 rows | 64×35 | 64×64 | `load.spritesheet('bars', ..., { frameWidth:64, frameHeight:8, spacing:1 })` |
| UI Status Icons | 16×16 | 4 | 4 cols × 1 row | 67×16 | 128×16 | `load.spritesheet('status_icons', ..., { frameWidth:16, frameHeight:16, spacing:1 })` |
| UI Arrows | 16×16 | 4 | 4 cols × 1 row | 67×16 | 128×16 | `load.spritesheet('arrows', ..., { frameWidth:16, frameHeight:16, spacing:1 })` |
| Zone Backgrounds | 800×600 | 1 | 1 col × 1 row | 800×600 | 1024×1024 | `load.image('bg_<zone>', 'assets/bg_<zone>.png')` |
| Zone Tilesets | 16×16 tiles | 225 or 256 | 15×15 or 16×16 | 256×256 | 256×256 | `load.image('tiles_<zone>', 'assets/tiles_<zone>.png'); map.addTilesetImage(...)` |

### Worked grid math example (hero sheet)

For an 8-column × 9-row sheet of 48×48 frames with 1 px spacing:

```text
width  = 8 × 48 + (8 − 1) × 1 = 384 + 7 = 391 px
height = 9 × 48 + (9 − 1) × 1 = 432 + 8 = 440 px
```

Pad to the next power of two: **512×512 px**. Place the 391×440 content in the top-left; the remaining 121 px right and 72 px bottom are transparent.

In Phaser:

```ts
this.load.spritesheet('hero_boleto', 'assets/hero_boleto.png', {
  frameWidth: 48,
  frameHeight: 48,
  spacing: 1,
});
```

Frames are indexed row-major, 0-based. For the hero grid above:

| Animation | Frames |
|---|---|
| walk_down  | 0–3 |
| walk_up    | 4–7 |
| walk_left  | 8–11 |
| walk_right | 12–15 |
| idle_down  | 16–19 |
| idle_up    | 20–23 |
| idle_left  | 24–27 |
| idle_right | 28–31 |
| attack_down  | 32–35 |
| attack_up    | 36–39 |
| attack_left  | 40–43 |
| attack_right | 44–47 |
| hurt_down  | 48–49 |
| hurt_up    | 50–51 |
| hurt_left  | 52–53 |
| hurt_right | 54–55 |
| death_down  | 56–59 |
| death_up    | 60–63 |
| death_left  | 64–67 |
| death_right | 68–71 |

### Phaser 3.87 animation snippet template

```ts
this.anims.create({
  key: 'boleto_walk_down',
  frames: this.anims.generateFrameNumbers('hero_boleto', { start: 0, end: 3 }),
  frameRate: 8,
  repeat: -1,
});
```

For single-frame assets use `load.image` and display with `add.image(x, y, key)`.

---

## 3. Heroes

Shared spec: 48×48 frames, 8 cols × 9 rows = 72 frames, canvas 512×512 px (content 391×440 px), 1 px transparent gutter.

### 3.1 Boleto — Cavaleiro / DPS

- **Sprite key:** `hero_boleto`
- **Canvas:** 512×512 px
- **Frame size:** 48×48 px
- **Grid:** 8 cols × 9 rows (walk down/up/left/right, idle down/up/left/right, attack down/up/left/right, hurt 2 frames each direction, death down/up/left/right)
- **Palette:** hot pink `#ff69b4`, pink shadow `#c2185b`, pink highlight `#ffb3d9`, mullet brown `#6b4423`, mullet highlight `#a0673a`, neon cyan `#00e5ff`, neon magenta `#ff00ff`, neon yellow `#ffea00`, wood sword `#8b5a2b`, wood dark `#5d3a1a`, gold glint `#ffd700`, eye white `#ffffff`, pupil `#1a1a1a`, teeth `#fff8e7`, outline `#1a0a14`, transparent.

**LLM prompt:**

```text
Pixel art sprite sheet for "Catirobas do Inferno," a comedic 1980s-style RPG about hopeless losers on a quest to restore their macheza. Render in clean, hand-placed pixel art: crisp blocky pixels with hard edges, zero anti-aliasing, zero sub-pixel blending. Use a strict limited palette of 16 flat colors or fewer. Every color must be a single flat fill with no dithering, no gradients, and no shading ramps. Channel Tex Avery's wildest cartoon exaggeration translated into rigid pixel grids: eyes that pop out as big pixel circles, jaws that stretch an extra tile row, squash-and-stretch in whole-pixel increments, theatrical absurd poses, cranked-to-eleven expressions. The humor is ironic and self-aware. Arrange all frames in a uniform grid on a fully transparent background (PNG-32 with alpha channel). Separate each frame with a 1-pixel transparent gutter. No frame bleeds into another. No anti-aliasing, no gradients, no lighting effects, no photorealism, no anime/chibi, no background fill, no watermarks.

SUBJECT: Boleto, the Cavaleiro/DPS hero. A bipedal horse with a large 1980s mullet, sparkly neon clothes (cyan and magenta with yellow accents), and a broken wooden sword he genuinely believes is solid gold. Body color hot pink (#ff69b4). Personality: overconfident, smug, lustful, easily confused/insulted when things break.

SHEET LAYOUT: 8 columns × 9 rows, each frame 48×48 px, on a 512×512 canvas with content in the top-left 391×440 area and 1 px transparent gutters between every frame.
Row 1: Walk Down (cols 1-4), Walk Up (cols 5-8) — 4-frame struts, chest out, sword on shoulder.
Row 2: Walk Left (cols 1-4), Walk Right (cols 5-8) — 4-frame struts, smug side glance.
Row 3: Idle Down (cols 1-4), Idle Up (cols 5-8) — 4-frame breathing, eyebrow wiggle, sword polish.
Row 4: Idle Left (cols 1-4), Idle Right (cols 5-8) — 4-frame hair flip, smug grin.
Row 5: Attack Down (cols 1-4), Attack Up (cols 5-8) — 4-frame overhead sword chop, wild take on impact.
Row 6: Attack Left (cols 1-4), Attack Right (cols 5-8) — 4-frame lunge, sword breaks further on frame 4.
Row 7: Hurt Down (cols 1-2), Hurt Up (cols 3-4), Hurt Left (cols 5-6), Hurt Right (cols 7-8) — 2-frame recoil each, insulted/confused expression, eyes pop.
Row 8: Death Down (cols 1-4), Death Up (cols 5-8) — 4-frame collapse, sword shatters, mullet deflates.
Row 9: Death Left (cols 1-4), Death Right (cols 5-8) — 4-frame melt into a sad pink heap.

PALETTE (16 max): #ff69b4 #c2185b #ffb3d9 #6b4423 #a0673a #00e5ff #ff00ff #ffea00 #8b5a2b #5d3a1a #ffd700 #ffffff #1a1a1a #fff8e7 #1a0a14 + transparent.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('hero_boleto', 'assets/hero_boleto.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
```

**Animation snippet:**

```ts
// Boleto animations — copy/paste and replace 'hero_boleto' key if sharing code
['walk', 'idle', 'attack'].forEach((name) => {
  ['down', 'up', 'left', 'right'].forEach((dir, i) => {
    const start = { walk: {down:0,up:4,left:8,right:12}, idle:{down:16,up:20,left:24,right:28}, attack:{down:32,up:36,left:40,right:44} }[name as 'walk'|'idle'|'attack'][dir as 'down'|'up'|'left'|'right'];
    const end = start + (name === 'attack' ? 3 : 3);
    this.anims.create({
      key: `boleto_${name}_${dir}`,
      frames: this.anims.generateFrameNumbers('hero_boleto', { start, end }),
      frameRate: name === 'walk' ? 8 : name === 'idle' ? 4 : 10,
      repeat: name === 'attack' ? 0 : -1,
    });
  });
});
['down','up','left','right'].forEach((dir, i) => {
  this.anims.create({ key: `boleto_hurt_${dir}`, frames: this.anims.generateFrameNumbers('hero_boleto', { start: 48 + i*2, end: 49 + i*2 }), frameRate: 8, repeat: 0 });
  this.anims.create({ key: `boleto_death_${dir}`, frames: this.anims.generateFrameNumbers('hero_boleto', { start: 56 + i*4, end: 59 + i*4 }), frameRate: 8, repeat: 0 });
});
```

### 3.2 Porquinho — Mago / Suporte

- **Sprite key:** `hero_porquinho`
- **Canvas / frame / grid:** same as Boleto
- **Palette:** purple `#9b59b6`, purple shadow `#6a3d8a`, purple highlight `#c39bd3`, robe dark `#4a235a`, pig skin pink `#f8bbd0`, pig skin shadow `#e093b3`, gold trim `#ffd700`, twig wand `#8b5a2b`, wand glow `#fff59d`, sweat drop `#b3e5fc`, eye white `#ffffff`, pupil `#1a1a1a`, tongue `#ef5350`, teeth `#fff8e7`, outline `#2a0a3a`, transparent.

**LLM prompt:**

```text
Pixel art sprite sheet for "Catirobas do Inferno," ... [same global preamble as above]

SUBJECT: Porquinho, the Mago/Suporte hero. A small pig wearing oversized purple wizard robes that drag on the floor, holding a tiny twig as a wand. Body/robe color purple (#9b59b6). Skin pink. Personality: social anxiety, wide panicked eyes, giant cartoon sweat drops, bites his own tongue while casting fake Latin, melts into a puddle of embarrassment when rejected.

SHEET LAYOUT: same 8×9 grid as heroes.
Row 1-2: Walk Down/Up/Left/Right — 4-frame nervous shuffle/tiptoe, robe trailing, sweat drops.
Row 3-4: Idle Down/Up/Left/Right — trembling, wand shakes, anxious glance, biting tongue.
Row 5-6: Attack Down/Up/Left/Right — fake Latin cast, wand sparks, panicked wave, stumbling.
Row 7: Hurt all directions — 2-frame recoil, eyes pop, sweat burst.
Row 8-9: Death all directions — melt into embarrassed puddle, wand droops, puddle spreads.

PALETTE (16 max): #9b59b6 #6a3d8a #c39bd3 #4a235a #f8bbd0 #e093b3 #ffd700 #8b5a2b #fff59d #b3e5fc #ffffff #1a1a1a #ef5350 #fff8e7 #2a0a3a + transparent.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('hero_porquinho', 'assets/hero_porquinho.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
```

**Animation snippet:**

```ts
const heroGrid = {
  walk: { down: 0, up: 4, left: 8, right: 12 },
  idle: { down: 16, up: 20, left: 24, right: 28 },
  attack: { down: 32, up: 36, left: 40, right: 44 },
};
['walk', 'idle', 'attack'].forEach((name) => {
  ['down', 'up', 'left', 'right'].forEach((dir) => {
    const s = heroGrid[name as keyof typeof heroGrid][dir as 'down'|'up'|'left'|'right'];
    this.anims.create({
      key: `porquinho_${name}_${dir}`,
      frames: this.anims.generateFrameNumbers('hero_porquinho', { start: s, end: s + 3 }),
      frameRate: name === 'attack' ? 10 : name === 'walk' ? 8 : 4,
      repeat: name === 'attack' ? 0 : -1,
    });
  });
});
['down','up','left','right'].forEach((dir, i) => {
  this.anims.create({ key: `porquinho_hurt_${dir}`, frames: this.anims.generateFrameNumbers('hero_porquinho', { start: 48 + i*2, end: 49 + i*2 }), frameRate: 8, repeat: 0 });
  this.anims.create({ key: `porquinho_death_${dir}`, frames: this.anims.generateFrameNumbers('hero_porquinho', { start: 56 + i*4, end: 59 + i*4 }), frameRate: 8, repeat: 0 });
});
```

### 3.3 Meleca — Tanque / Defesa

- **Sprite key:** `hero_meleca`
- **Canvas / frame / grid:** same as Boleto
- **Palette:** slime green `#8bc34a`, slime shadow `#5a8a2a`, slime highlight `#c5e1a5`, translucent inner `#aed581`, slug trail `#689f38`, raised hand `#9ccc65`, damage splatter `#7cb342`, mouth dark `#33691e`, mouth sad `#558b2f`, eye white `#ffffff`, eye dot `#1a1a1a`, cheek blush `#ffab91`, slime sheen `#dcedc8`, outline `#2e4d1a`, transparent.

**LLM prompt:**

```text
SUBJECT: Meleca, the Tanque/Defesa hero. A translucent gelatinous green blob with two simple dot eyes, no limbs except a stubby right hand always raised in a polite "please" gesture. Leaves a slug trail. Body color slime green (#8bc34a). Personality: clueless happy vacant stare, sad wobble when ignored, distorted splatter on damage.

SHEET LAYOUT: same 8×9 hero grid.
Row 1-2: Walk all directions — slow oozing roll / side wobble, slug trail appears, hand raised.
Row 3-4: Idle all directions — happy jiggle, vacant smile, drip, blank stare, hand waves politely.
Row 5-6: Attack all directions — body slam, squash then stretch, arm fling, gooey slap.
Row 7: Hurt all directions — 2-frame splatter each, body distorts, eyes pop wide.
Row 8-9: Death all directions — puddle collapse, eyes sink, dissolves into flat green stain.

PALETTE (16 max): #8bc34a #5a8a2a #c5e1a5 #aed581 #689f38 #9ccc65 #7cb342 #33691e #558b2f #ffffff #1a1a1a #ffab91 #dcedc8 #2e4d1a + transparent.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('hero_meleca', 'assets/hero_meleca.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
```

**Animation snippet:**

```ts
const heroGrid = {
  walk: { down: 0, up: 4, left: 8, right: 12 },
  idle: { down: 16, up: 20, left: 24, right: 28 },
  attack: { down: 32, up: 36, left: 40, right: 44 },
};
['walk', 'idle', 'attack'].forEach((name) => {
  ['down', 'up', 'left', 'right'].forEach((dir) => {
    const s = heroGrid[name as keyof typeof heroGrid][dir as 'down'|'up'|'left'|'right'];
    this.anims.create({
      key: `meleca_${name}_${dir}`,
      frames: this.anims.generateFrameNumbers('hero_meleca', { start: s, end: s + 3 }),
      frameRate: name === 'attack' ? 10 : name === 'walk' ? 8 : 4,
      repeat: name === 'attack' ? 0 : -1,
    });
  });
});
['down','up','left','right'].forEach((dir, i) => {
  this.anims.create({ key: `meleca_hurt_${dir}`, frames: this.anims.generateFrameNumbers('hero_meleca', { start: 48 + i*2, end: 49 + i*2 }), frameRate: 8, repeat: 0 });
  this.anims.create({ key: `meleca_death_${dir}`, frames: this.anims.generateFrameNumbers('hero_meleca', { start: 56 + i*4, end: 59 + i*4 }), frameRate: 8, repeat: 0 });
});
```

### 3.4 Caveira — Assassino / Crítico

- **Sprite key:** `hero_caveira`
- **Canvas / frame / grid:** same as Boleto
- **Palette:** bone white `#ecf0f1`, bone shadow `#b0bec5`, bone highlight `#eceff1`, bone crack `#546e7a`, crack dark `#37474f`, black cloth `#1a1a1a`, cloth tear `#424242`, dagger shadow `#90a4ae`, dagger edge `#607d8b`, dust tear `#cfd8dc`, teeth `#ffffff`, eye socket `#000000`, smirk line `#455a64`, deep shadow `#263238`, outline `#1a1a1a`, transparent.

**LLM prompt:**

```text
SUBJECT: Caveira, the Assassino/Crítico hero. A cracked humanoid skull wearing torn black clothes, wielding two bone daggers. Body color bone white (#ecf0f1). Personality: slow heavy walk, deep existential sigh, cries cartoon dust instead of tears, sarcastic smirk, dead-inside.

SHEET LAYOUT: same 8×9 hero grid.
Row 1-2: Walk all directions — slow heavy plod, dragging shuffle, shoulders slumped, skull bowed.
Row 3-4: Idle all directions — deep sigh with dust puff, sarcastic smirk, eye-roll, dagger twirl.
Row 5-6: Attack all directions — dual dagger stab, cross slash, daggers trail, burst of speed.
Row 7: Hurt all directions — 2-frame recoil, skull cracks widen, dust tears spray.
Row 8-9: Death all directions — collapse, skull splits, daggers clatter, pile of bones and cloth.

PALETTE (16 max): #ecf0f1 #b0bec5 #eceff1 #546e7a #37474f #1a1a1a #424242 #90a4ae #607d8b #cfd8dc #ffffff #000000 #455a64 #263238 + transparent.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('hero_caveira', 'assets/hero_caveira.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
```

**Animation snippet:**

```ts
const heroGrid = {
  walk: { down: 0, up: 4, left: 8, right: 12 },
  idle: { down: 16, up: 20, left: 24, right: 28 },
  attack: { down: 32, up: 36, left: 40, right: 44 },
};
['walk', 'idle', 'attack'].forEach((name) => {
  ['down', 'up', 'left', 'right'].forEach((dir) => {
    const s = heroGrid[name as keyof typeof heroGrid][dir as 'down'|'up'|'left'|'right'];
    this.anims.create({
      key: `caveira_${name}_${dir}`,
      frames: this.anims.generateFrameNumbers('hero_caveira', { start: s, end: s + 3 }),
      frameRate: name === 'attack' ? 10 : name === 'walk' ? 8 : 4,
      repeat: name === 'attack' ? 0 : -1,
    });
  });
});
['down','up','left','right'].forEach((dir, i) => {
  this.anims.create({ key: `caveira_hurt_${dir}`, frames: this.anims.generateFrameNumbers('hero_caveira', { start: 48 + i*2, end: 49 + i*2 }), frameRate: 8, repeat: 0 });
  this.anims.create({ key: `caveira_death_${dir}`, frames: this.anims.generateFrameNumbers('hero_caveira', { start: 56 + i*4, end: 59 + i*4 }), frameRate: 8, repeat: 0 });
});
```

---

## 4. Enemies

Shared spec: 48×48 frames, 4 cols × 4 rows = 16 cells (2 empty), canvas 256×256 px (content 195×195 px), 1 px gutter.

### 4.1 niceguy — Nice Guy

- **Sprite key:** `enemy_niceguy`
- **Palette:** sky blue `#87ceeb`, deeper blue `#5f9ea0`, white `#ffffff`, off-white `#f5f5f5`, light gray `#dcdcdc`, near-black `#1a1a1a`, blue vein `#4a90d9`, red flush `#ff6b6b`, gold glint `#ffd700`, brown hair `#8b4513`, dark brown `#5a2d0c`, orange strain `#ff8c00`, silver tear `#c0c0c0`, dim gray `#696969`, dark slate `#2f4f4f`, pure black `#000000`, transparent.

**LLM prompt:**

```text
SUBJECT: "Nice Guy" enemy — a pudgy man in a sky-blue (#87ceeb) "I'M NICE" t-shirt with chunky pixel text across the chest. His skin is the same sky blue. Brown hair (#8b4513). Default expression: fake strained smile with forehead veins (#4a90d9) popping, eyes too wide, teeth gritted white.

FRAME-BY-FRAME (4 cols × 4 rows, 48×48 each):
Row 1 — IDLE (4): standing fake-smile hold, squash-and-stretch breathing, vein pulsing, one frame with a manipulative tear (#c0c0c0).
Row 2 — WALK (4): waddling walk cycle, t-shirt text stretching, arms swinging in "nice guy open door" gesture, strained grin never dropping.
Row 3 — ATTACK (4): tantrum explosion — fists pounding ground, jaw stretched an extra tile row, eyes bugging out (#ff6b6b red flush), screaming "BUT I'M NICE!", then sly sideways glance (#ffd700 glint).
Row 4 — HURT (2) + 2 EMPTY: recoil — body squashed flat, fake smile cracked, tears flying; crumpled defeated heap. Final two cells empty.

PALETTE: #87ceeb #5f9ea0 #ffffff #f5f5f5 #dcdcdc #1a1a1a #4a90d9 #ff6b6b #ffd700 #8b4513 #5a2d0c #ff8c00 #c0c0c0 #696969 #2f4f4f #000000.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('enemy_niceguy', 'assets/enemy_niceguy.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'niceguy_idle', frames: this.anims.generateFrameNumbers('enemy_niceguy', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'niceguy_walk', frames: this.anims.generateFrameNumbers('enemy_niceguy', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
this.anims.create({ key: 'niceguy_attack', frames: this.anims.generateFrameNumbers('enemy_niceguy', { start: 8, end: 11 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'niceguy_hurt', frames: this.anims.generateFrameNumbers('enemy_niceguy', { start: 12, end: 13 }), frameRate: 8, repeat: 0 });
```

### 4.2 trollincel — Troll Incel

- **Sprite key:** `enemy_trollincel`
- **Palette:** dark gray `#555555`, darker gray `#2a2a2a`, near-black `#1a1a1a`, pure black `#000000`, rage red `#ff0000`, dark red `#cc0000`, light red `#ff6b6b`, gold `#ffd700`, amber `#ffae00`, white `#ffffff`, silver `#c0c0c0`, mid gray `#808080`, dark slate `#404040`, toxic green `#00ff00`, blood red `#8b0000`, dim gray `#696969`, transparent.

**LLM prompt:**

```text
SUBJECT: "Troll Incel" enemy — a pixelated shadow figure (#555555) hunched behind a glowing laptop casting a gold (#ffd700) glow upward onto the face. No real anatomy: blocky silhouette with only glowing eyes and a mouth visible. Laptop silver (#c0c0c0) with gray keys (#808080).

FRAME-BY-FRAME:
Row 1 — IDLE (4): hunched silhouette typing, screen glow pulsing (flat color swap), smug pixelated troll grin (#00ff00) forming, one frame with eyes narrowing to slits.
Row 2 — WALK (4): shuffling forward clutching laptop, shadow body squashing, screen flickering, back curved into pixel-perfect arch.
Row 3 — ATTACK (4): "Insult Tóxico" / "Scream into Void" — rage face explodes fully red (#ff0000), steam (#ff6b6b) blowing out of ears as pixel puffs, jaw stretched extra tile row screaming, fingers typing furiously.
Row 4 — HURT (2) + 2 EMPTY: confronted with reality — silhouette shrinking (#696969), laptop dropping, eyes wide in fear (#8b0000), body compressing into heap.

PALETTE: #555555 #2a2a2a #1a1a1a #000000 #ff0000 #cc0000 #ff6b6b #ffd700 #ffae00 #ffffff #c0c0c0 #808080 #404040 #00ff00 #8b0000 #696969.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('enemy_trollincel', 'assets/enemy_trollincel.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'trollincel_idle', frames: this.anims.generateFrameNumbers('enemy_trollincel', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'trollincel_walk', frames: this.anims.generateFrameNumbers('enemy_trollincel', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
this.anims.create({ key: 'trollincel_attack', frames: this.anims.generateFrameNumbers('enemy_trollincel', { start: 8, end: 11 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'trollincel_hurt', frames: this.anims.generateFrameNumbers('enemy_trollincel', { start: 12, end: 13 }), frameRate: 8, repeat: 0 });
```

### 4.3 homemcaverna — Homem Caverna

- **Sprite key:** `enemy_homemcaverna`
- **Palette:** brown `#8b4513`, dark brown `#5a2d0c`, sienna `#a0522d`, deep brown `#2a1a0a`, pure black `#000000`, chocolate club `#d2691e`, dark wood `#654321`, white `#ffffff`, beige loincloth `#f5f5dc`, silver bone `#c0c0c0`, gray bone `#808080`, red `#ff0000`, dark red mouth `#8b0000`, forest moss `#228b22`, dark olive `#556b2f`, goldenrod `#daa520`, transparent.

**LLM prompt:**

```text
SUBJECT: "Homem Caverna" — a hairy, stocky primitive figure with brown skin (#8b4513), heavy brow ridge, thick unkempt beard (#5a2d0c), bone necklace (#c0c0c0). Beige loincloth (#f5f5dc). Wooden club (#d2691e) with moss patch (#228b22). Permanent territorial grunt posture.

FRAME-BY-FRAME:
Row 1 — IDLE (4): standing grunt hold, chest puffed, club on shoulder, heavy brow, one frame with low caveman grunt — jaw drops one tile.
Row 2 — WALK (4): lumbering caveman stomp, club dragging, whole-body squash-and-stretch, feet hitting ground with flat impact, beard bouncing.
Row 3 — ATTACK (4): "Reclaim Territory" — club raised overhead then brought down in exaggerated arc, jaw stretched extra tile row roaring (#8b0000 mouth), eyes red (#ff0000), one frame planting a goldenrod (#daa520) territory marker flag.
Row 4 — HURT (2) + 2 EMPTY: club knocked away, body squashed into heap, stars circling head, dazed X-eyes.

PALETTE: #8b4513 #5a2d0c #a0522d #2a1a0a #000000 #d2691e #654321 #ffffff #f5f5dc #c0c0c0 #808080 #ff0000 #8b0000 #228b22 #556b2f #daa520.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('enemy_homemcaverna', 'assets/enemy_homemcaverna.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'homemcaverna_idle', frames: this.anims.generateFrameNumbers('enemy_homemcaverna', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'homemcaverna_walk', frames: this.anims.generateFrameNumbers('enemy_homemcaverna', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
this.anims.create({ key: 'homemcaverna_attack', frames: this.anims.generateFrameNumbers('enemy_homemcaverna', { start: 8, end: 11 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'homemcaverna_hurt', frames: this.anims.generateFrameNumbers('enemy_homemcaverna', { start: 12, end: 13 }), frameRate: 8, repeat: 0 });
```

### 4.4 corporatebro — Corporate Bro

- **Sprite key:** `enemy_corporatebro`
- **Palette:** near-black `#1a1a1a`, deep black `#0d0d0d`, charcoal `#2a2a2a`, pure black `#000000`, gold `#ffd700`, dark gold `#daa520`, silver `#c0c0c0`, dark silver `#a9a9a9`, white `#ffffff`, off-white skin `#f5f5f5`, brown hair `#8b4513`, dark brown `#5a2d0c`, orange-red `#ff4500`, dark slate `#2f4f4f`, gray `#808080`, green cash `#00ff00`, transparent.

**LLM prompt:**

```text
SUBJECT: "Corporate Bro" enemy — a slick businessman in a near-black (#1a1a1a) shiny suit, too much hair gel (#8b4513), aviator sunglasses (#c0c0c0 frame, #a9a9a9 lens), gold tie (#ffd700), gold watch, smug "flex money" grin with white blocky teeth. BMW silhouette hinted in background corner using #2f4f4f body and #ff4500 taillight pixels — never a full car.

FRAME-BY-FRAME:
Row 1 — IDLE (4): standing smug, adjusting sunglasses, gold tie glinting (flat #daa520 swap), one frame pulling out green (#00ff00) cash bill.
Row 2 — WALK (4): strutting corporate walk, suit squashing, briefcase swinging, sunglasses reflecting, BMW taillight hint blinking.
Row 3 — ATTACK (4): "Flex Money" / "Money Shower" — throwing green cash bills in money storm, jaw stretched extra tile row in greedy laugh, eyes bugging out, gold coins (#ffd700) raining, BMW corner skidding in.
Row 4 — HURT (2) + 2 EMPTY: suit rumpled, sunglasses cracked, tie askew, body squashed into briefcase-heap, money scattered.

PALETTE: #1a1a1a #0d0d0d #2a2a2a #000000 #ffd700 #daa520 #c0c0c0 #a9a9a9 #ffffff #f5f5f5 #8b4513 #5a2d0c #ff4500 #2f4f4f #808080 #00ff00.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('enemy_corporatebro', 'assets/enemy_corporatebro.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'corporatebro_idle', frames: this.anims.generateFrameNumbers('enemy_corporatebro', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'corporatebro_walk', frames: this.anims.generateFrameNumbers('enemy_corporatebro', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
this.anims.create({ key: 'corporatebro_attack', frames: this.anims.generateFrameNumbers('enemy_corporatebro', { start: 8, end: 11 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'corporatebro_hurt', frames: this.anims.generateFrameNumbers('enemy_corporatebro', { start: 12, end: 13 }), frameRate: 8, repeat: 0 });
```

---

## 5. Bosses

Shared spec: 64×64 frames, 3 cols × 6 rows = 18 cells (2 empty), canvas 256×512 px (content 194×389 px), 1 px gutter.

### 5.1 homemarvore — Homem Árvore (Floresta)

- **Sprite key:** `boss_homemarvore`
- **Palette:** forest green `#2d5016`, dark green `#1a3a0a`, leaf `#4a7c2a`, leaf shadow `#6b8e23`, branch `#8b4513`, branch dark `#5a2d0c`, white `#ffffff`, off-white `#f5f5f5`, black `#000000`, near-black `#1a1a1a`, goldenrod `#daa520`, orange `#ff8c00`, dark red `#8b0000`, silver scar `#c0c0c0`, moss `#228b22`, dark olive `#556b2f`, transparent.

**LLM prompt:**

```text
SUBJECT: "Homem Árvore" boss — a grumpy, gnarled anthropomorphic tree with forest-green (#2d5016) bark body, scowling wooden face carved into the trunk, leafy canopy (#4a7c2a) atop, branch-arms. Refused dermabrasion: silver (#c0c0c0) pixel scar line across bark face. Mouth reveals flat white (#ffffff) blocky wooden teeth. Big — fills most of 64×64 frame.

FRAME-BY-FRAME (3 cols × 6 rows, 64×64 each):
Row 1 — IDLE (3): scowling wooden face hold, canopy swaying (flat #4a7c2a/#6b8e23 swap), one frame with low creaking groan — bark crack widening.
Row 2 — IDLE(1) + ATTACK(2): final idle with goldenrod (#daa520) sap glint; then "Galhada" — branch-arms swinging back, wooden jaw beginning to stretch.
Row 3 — ATTACK(2) + HURT(1): branch-arms slamming forward in exaggerated arc, jaw stretched extra tile row with teeth bared (#8b0000 mouth); then hurt — leaf knocked off, scowl deepening.
Row 4 — HURT (3): "Raiz Constrangedora" recoil — bark cracking, canopy drooping, silver scar splitting wider, eyes bugging out in embarrassment.
Row 5 — PHASE (3): leaves turning orange (#ff8c00) as flat autumn gag, bark darkening (#1a3a0a), face more furious, moss (#228b22) spreading.
Row 6 — PHASE(1) + 2 EMPTY: full enraged tree, canopy ablaze with orange flat leaves, mouth wide in roar.

PALETTE: #2d5016 #1a3a0a #4a7c2a #6b8e23 #8b4513 #5a2d0c #ffffff #f5f5f5 #000000 #1a1a1a #daa520 #ff8c00 #8b0000 #c0c0c0 #228b22 #556b2f.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('boss_homemarvore', 'assets/boss_homemarvore.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'homemarvore_idle', frames: this.anims.generateFrameNumbers('boss_homemarvore', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'homemarvore_attack', frames: this.anims.generateFrameNumbers('boss_homemarvore', { start: 4, end: 7 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'homemarvore_hurt', frames: this.anims.generateFrameNumbers('boss_homemarvore', { start: 8, end: 11 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'homemarvore_phase', frames: this.anims.generateFrameNumbers('boss_homemarvore', { start: 12, end: 15 }), frameRate: 6, repeat: -1 });
```

### 5.2 miragemego — Miragem do Ego (Deserto)

- **Sprite key:** `boss_miragemego`
- **Palette:** gold `#ffd700`, dark gold `#daa520`, amber `#ffae00`, lemon `#fffacd`, white `#ffffff`, off-white `#f5f5f5`, black `#000000`, near-black `#1a1a1a`, silver `#c0c0c0`, dark silver `#a9a9a9`, orange-red `#ff4500`, dark red `#8b0000`, sky blue `#87ceeb`, sand `#f4a460`, dark slate `#2f4f4f`, gray `#808080`, transparent.

**LLM prompt:**

```text
SUBJECT: "Miragem do Ego" boss — a perfect, glowing golden (#ffd700) humanoid ego illusion. Narcissistic figure made of solid gold pixels with smug flawless face, perfect hair, self-satisfied grin. Body shimmers with flat amber (#ffae00) halo pixels (no gradient). Surrounded by faint desert haze (#87ceeb sky-blue hint, #f4a460 heat-ripple lines). 2 phases; phase frames show clone escalation: 1 golden copy, then 2, then 3 identical copies within 64×64, separated by silver (#c0c0c0) 1px shimmer line.

FRAME-BY-FRAME:
Row 1 — IDLE (3): single golden figure standing smug, halo shimmering, hair-flip, eyes half-closed in self-admiration.
Row 2 — IDLE(1) + ATTACK(2): tooth glint; then "Ilusão Perfeita" — figure blurring into two overlapping flat-gold silhouettes.
Row 3 — ATTACK(2) + HURT(1): "Clones do Ego" — two golden copies striking mirrored pose, jaws stretched in synchronized smug laughter; then hurt — silver crack across golden face.
Row 4 — HURT (3): illusion cracking — gold flaking off in pixel chunks revealing dark-red (#8b0000) void, eyes bugging out, grin breaking into panicked frown.
Row 5 — PHASE / CLONE ESCALATION (3): Phase-1: ONE glowing copy; Phase-2: TWO copies side by side separated by silver line; Phase-3: THREE copies side by side all grinning.
Row 6 — PHASE(1) + 2 EMPTY: Phase-4 — three copies radiating orange-red (#ff4500) rage-flash pixels, all jaws stretched in triple ego-shriek.

PALETTE: #ffd700 #daa520 #ffae00 #fffacd #ffffff #f5f5f5 #000000 #1a1a1a #c0c0c0 #a9a9a9 #ff4500 #8b0000 #87ceeb #f4a460 #2f4f4f #808080.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('boss_miragemego', 'assets/boss_miragemego.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'miragemego_idle', frames: this.anims.generateFrameNumbers('boss_miragemego', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'miragemego_attack', frames: this.anims.generateFrameNumbers('boss_miragemego', { start: 4, end: 7 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'miragemego_hurt', frames: this.anims.generateFrameNumbers('boss_miragemego', { start: 8, end: 11 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'miragemego_phase', frames: this.anims.generateFrameNumbers('boss_miragemego', { start: 12, end: 15 }), frameRate: 6, repeat: -1 });
```

### 5.3 seureflexo — Seu Reflexo (Caverna)

- **Sprite key:** `boss_seureflexo`
- **Palette:** silver `#c0c0c0`, dark silver `#a9a9a9`, bright silver `#e8e8e8`, white `#ffffff`, off-white `#f5f5f5`, black `#000000`, near-black `#1a1a1a`, dark slate `#2f4f4f`, steel blue `#4682b4`, cadet blue `#5f9ea0`, brown hair `#8b4513`, dark brown `#5a2d0c`, gold `#ffd700`, dark gold `#daa520`, hot pink `#ff69b4`, slime green `#8bc34a`, transparent.

**LLM prompt:**

```text
SUBJECT: "Seu Reflexo" boss — a silver (#c0c0c0), slightly more attractive clone of the four heroes combined into one generic heroic silhouette. Polished, idealized adventurer: broad shoulders, steel-blue (#4682b4) cape, gold (#ffd700) belt buckle, brown (#8b4513) heroic hair, confident grin with white teeth. Subtle accent pixels reference four heroes: hot-pink (#ff69b4) sash trim (Boleto nod), slime-green (#8bc34a) boot trim (Meleca nod). "A slightly better version of you." Body silver-toned, flat fills only.

FRAME-BY-FRAME:
Row 1 — IDLE (3): heroic stance, cape swaying (flat #4682b4/#5f9ea0 swap), confident grin, hair-flip with tooth gleam.
Row 2 — IDLE(1) + ATTACK(2): gold buckle glint; "Soco do Reflexo" — punch wind-up, cape snapping back, silver fist clenching.
Row 3 — ATTACK(2) + HURT(1): punch released in exaggerated arc, jaw stretched in heroic shout, impact star-burst; hurt — polished grin cracks, silver dent appears.
Row 4 — HURT (3): "Insegurança Exposta" — facade crumbling, cape drooping, hair losing polish, eyes bugging out in self-doubt, figure looking at own hands in existential crisis.
Row 5 — PHASE (3): clone becomes MORE polished, silver brightening (#e8e8e8), stance widening, grin widening, cape growing, buckle gleaming.
Row 6 — PHASE(1) + 2 EMPTY: maximum heroic silhouette, cape fully spread, double thumbs-up, blinding white gleam lines radiating.

PALETTE: #c0c0c0 #a9a9a9 #e8e8e8 #ffffff #f5f5f5 #000000 #1a1a1a #2f4f4f #4682b4 #5f9ea0 #8b4513 #5a2d0c #ffd700 #daa520 #ff69b4 #8bc34a.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('boss_seureflexo', 'assets/boss_seureflexo.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'seureflexo_idle', frames: this.anims.generateFrameNumbers('boss_seureflexo', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'seureflexo_attack', frames: this.anims.generateFrameNumbers('boss_seureflexo', { start: 4, end: 7 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'seureflexo_hurt', frames: this.anims.generateFrameNumbers('boss_seureflexo', { start: 8, end: 11 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'seureflexo_phase', frames: this.anims.generateFrameNumbers('boss_seureflexo', { start: 12, end: 15 }), frameRate: 6, repeat: -1 });
```

### 5.4 manifestacaorealidade — Manifestação da Realidade (Vulcão)

- **Sprite key:** `boss_manifestacaorealidade`
- **Palette:** orange-red `#ff4500`, dark orange-red `#cc3300`, bright orange `#ff6b00`, dark orange `#ff8c00`, gold `#ffd700`, yellow `#ffff00`, white `#ffffff`, dark red `#8b0000`, near-black red `#2f0000`, black `#000000`, silver `#c0c0c0`, dark silver `#a9a9a9`, gray `#808080`, dim gray `#696969`, pure red `#ff0000`, dark gold `#daa520`, transparent.

**LLM prompt:**

```text
SUBJECT: "Manifestação da Realidade" boss — an abstract fire entity, not humanoid. Swirling mass of concentric fire circles (#ff4500 base, #808080 ring lines, #c0c0c0 silver reality-shard lines cutting through). Center hot core (#ffff00 yellow → #ffffff white at absolute center). Shape roughly circular but shifts and squashes. No face, no limbs — fire geometry communicating "truth" through escalating intensity. 3 phases showing low → medium → high → maximum fire.

FRAME-BY-FRAME:
Row 1 — IDLE (3): concentric fire circles pulsing (flat #ff4500/#cc3300 swap), silver reality-shard lines rotating slowly, core glowing flat #ffd700.
Row 2 — IDLE(1) + ATTACK(2): core brightens to #ffff00; "Golpe da Realidade" — fire circles expanding outward in exaggerated burst, silver shards shooting out as pixel lines.
Row 3 — ATTACK(2) + HURT(1): "Verdade Agressiva" — rings slamming forward, fire-mouth made of #ff0000 pure-red pixels stretching extra tile row, white "TRUTH" impact burst; hurt — fire dimming, rings contracting, silver crack splitting core.
Row 4 — HURT (3): fire sputtering, core cracking, reality shards falling as pixel debris (#a9a9a9), one frame compressing into tight #8b0000 dark-red ball.
Row 5 — PHASE / FIRE ESCALATION (3): Phase-1 low fire (tight, #ff4500 base, #ffd700 core); Phase-2 medium fire (expanding, #ff6b00 added, rings multiplying, core #ffff00); Phase-3 high fire (filling most frame, #ff8c00 outer flames, #ffffff white-hot center, silver shards multiplying).
Row 6 — PHASE(1) + 2 EMPTY: Phase-4 max fire — entire frame consumed by concentric fire circles at maximum intensity, #ff0000 rage-flash pixels erupting, white-hot core blinding, silver reality-shards exploding outward.

PALETTE: #ff4500 #cc3300 #ff6b00 #ff8c00 #ffd700 #ffff00 #ffffff #8b0000 #2f0000 #000000 #c0c0c0 #a9a9a9 #808080 #696969 #ff0000 #daa520.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('boss_manifestacaorealidade', 'assets/boss_manifestacaorealidade.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'manifestacaorealidade_idle', frames: this.anims.generateFrameNumbers('boss_manifestacaorealidade', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'manifestacaorealidade_attack', frames: this.anims.generateFrameNumbers('boss_manifestacaorealidade', { start: 4, end: 7 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'manifestacaorealidade_hurt', frames: this.anims.generateFrameNumbers('boss_manifestacaorealidade', { start: 8, end: 11 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'manifestacaorealidade_phase', frames: this.anims.generateFrameNumbers('boss_manifestacaorealidade', { start: 12, end: 15 }), frameRate: 6, repeat: -1 });
```

### 5.5 senhorarazao — Senhora Razão (Monte)

- **Sprite key:** `boss_senhorarazao`
- **Palette:** white `#ffffff`, off-white `#f5f5f5`, bright gray `#e8e8e8`, silver `#c0c0c0`, dark silver `#a9a9a9`, gray `#808080`, light gray `#dcdcdc`, black `#000000`, near-black `#1a1a1a`, dark slate `#2f4f4f`, steel blue `#4682b4`, cadet blue `#5f9ea0`, pure red `#ff0000`, dark red `#cc0000`, gold `#ffd700`, dark gold `#daa520`, transparent.

**LLM prompt:**

```text
SUBJECT: "Senhora Razão" final boss — the invisible concept of logic. NO anatomy, NO body, NO face. Represented entirely as giant, glowing, ethereal punctuation marks and judgment symbols made of white (#ffffff) and silver (#c0c0c0) light pixels floating in the void: massive disapproving arched eyebrow (#dcdcdc), giant cold question mark (#4682b4 steel-blue tint), glowing exclamation point (#ff0000), abstract judgment symbols (#ffd700 gold). No humanoid form ever. Just floating, glowing punctuation conveying extreme judgment and cold logic.

FRAME-BY-FRAME:
Row 1 — IDLE (3): eyebrow (#dcdcdc) floating disapproving — arches higher each frame; final idle-3: cold question mark (#4682b4) materializing, dot pulsing (flat #4682b4/#5f9ea0 swap).
Row 2 — IDLE(1) + ATTACK(2): glowing exclamation point (#ff0000) appears; judgment symbol — gold (#ffd700) scales-of-justice glyph; "Lógica Irrefutável" — straight #4682b4 steel-blue pixel line shooting across frame.
Row 3 — ATTACK(2) + HURT(1): cold question mark slamming down like a stamp, white impact star; exclamation point slamming down "Senso Comum"; hurt — logic symbols cracking, silver fracture lines across question mark.
Row 4 — HURT (3): logic breaking down — eyebrow drooping and cracking, question mark distorting, exclamation dot flying off, symbols flickering (flat #ffffff/#808080 swap) in a glitch of irrationality.
Row 5 — PHASE (3): symbols regrouping, glowing brighter, eyebrow re-arching; all four symbols appearing simultaneously; composite glyph — question-mark-inside-exclamation-point made of gold and white.
Row 6 — PHASE(1) + 2 EMPTY: composite glyph at maximum intensity, radiating #ff0000 red and #ffd700 gold judgment pixels, eyebrow arched so high it exits top of frame, question-mark dot a blinding white star.

PALETTE: #ffffff #f5f5f5 #e8e8e8 #c0c0c0 #a9a9a9 #808080 #dcdcdc #000000 #1a1a1a #2f4f4f #4682b4 #5f9ea0 #ff0000 #cc0000 #ffd700 #daa520.
NO humanoid anatomy — only glowing punctuation and judgment symbols.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('boss_senhorarazao', 'assets/boss_senhorarazao.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```

**Animation snippet:**

```ts
this.anims.create({ key: 'senhorarazao_idle', frames: this.anims.generateFrameNumbers('boss_senhorarazao', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
this.anims.create({ key: 'senhorarazao_attack', frames: this.anims.generateFrameNumbers('boss_senhorarazao', { start: 4, end: 7 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'senhorarazao_hurt', frames: this.anims.generateFrameNumbers('boss_senhorarazao', { start: 8, end: 11 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'senhorarazao_phase', frames: this.anims.generateFrameNumbers('boss_senhorarazao', { start: 12, end: 15 }), frameRate: 6, repeat: -1 });
```

---

## 6. Items

Shared sheet: `items`, 32×32 frames, 4 cols × 2 rows, canvas 256×128 px (content 131×65 px), 1 px gutter.

| Frame | Item ID | Item Name | Grid Position |
|---:|---|---|---|
| 0 | cerveja | Cerveja | Row 1, Col 1 |
| 1 | pizzaFria | Pizza Fria | Row 1, Col 2 |
| 2 | doritos | Doritos Flamin' Hot | Row 1, Col 3 |
| 3 | energetico | Energético Misterioso | Row 1, Col 4 |
| 4 | fotoBoleto | Foto do Boleto | Row 2, Col 1 |
| 5 | espelhoQuebrado | Espelho Quebrado | Row 2, Col 2 |
| 6 | manualConversacao | Manual de Conversação | Row 2, Col 3 |
| 7 | maconhaZeze | Maconha de Zezé | Row 2, Col 4 |

**Palette suggestion:** black `#000000`, white `#ffffff`, Doritos red `#ff0055`, beer/pizza gold `#ffaa00`, cheese yellow `#ffea00`, herb green `#00aa00`, stoner aura `#00ff66`, energy blue `#0055ff`, mirror cyan `#00ffff`, Boleto pink `#ff77a8`, skin `#ffccaa`, crumpled gray `#888888`, dark purple `#5500aa`, sauce red `#aa0000`, dark green `#005500`, very dark gray `#111111`.

**LLM prompt:**

```text
Create a 4×2 grid of 32×32 pixel item icons on a 256×128 canvas (content top-left 131×65, rest transparent). Each cell separated by 1 px transparent gutter.

Frame 0 (cerveja): cheap tavern beer mug filled with golden beer (#ffaa00), overflowing with thick white foam (#ffffff) dripping down the side.
Frame 1 (pizzaFria): single slice of cold greasy pizza with yellow cheese (#ffea00), red pepperoni (#aa0000), slightly curled brown crust (#8b4513).
Frame 2 (doritos): bright red (#ff0055) chip bag with small flame graphic and one triangular orange chip next to it.
Frame 3 (energetico): sketchy dented blue (#0055ff) and silver energy drink can with neon yellow lightning bolt (#ffea00).
Frame 4 (fotoBoleto): crumpled low-quality printed photo showing a pink (#ff77a8) bipedal horse in an embarrassing awkward pose.
Frame 5 (espelhoQuebrado): jagged sharp shard of broken mirror reflecting a bright cyan (#00ffff) magical glint.
Frame 6 (manualConversacao): thick self-help book with cheesy purple (#5500aa) cover and golden title emblem (#ffaa00).
Frame 7 (maconhaZeze): small clear plastic baggie filled with green herbs (#00aa00), surrounded by faint green (#00ff66) stoner aura.

All icons in clean flat pixel art, 16-color palette max, transparent background, PNG-32 alpha.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('items', 'assets/items.png', {
  frameWidth: 32, frameHeight: 32, spacing: 1,
});
```

---

## 7. Spells

Each spell is a separate 64×64 VFX sheet, 2 cols × 2 rows = 4 frames, canvas 256×256 px (content 129×129 px), 1 px gutter.

### 7.1 abracadabrumSexicus

- **Sprite key:** `spell_abracadabrumSexicus`
- **Palette:** hot pink `#ff69b4`, purple `#9b59b6`, heart red `#ff0055`, sparkle white `#ffffff`, gold `#ffd700`, blush `#ffaaaa`, transparent.

**LLM prompt:**

```text
SUBJECT: "Abracadabrum Sexicus" heal spell. A 2×2 grid of 64×64 VFX frames showing pink/purple heart sparkles and awkward romance magic.
Frame 0: small heart popping into existence, pink (#ff69b4) with gold (#ffd700) sparkle.
Frame 1: heart expands with purple (#9b59b6) magical swirl around it.
Frame 2: heart bursts into multiple tiny hearts and sparkles (#ffffff).
Frame 3: residual pink blush particles (#ffaaaa) fading.
PNG-32 alpha, 1 px gutter, transparent background, flat pixel art, 16 colors max.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('spell_abracadabrumSexicus', 'assets/spell_abracadabrumSexicus.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```


### 7.2 incantumConfusus

- **Sprite key:** `spell_incantumConfusus`
- **Palette:** purple `#9b59b6`, question yellow `#ffcc00`, swirl cyan `#00ffff`, dizzy green `#88ff88`, black `#000000`, transparent.

**LLM prompt:**

```text
SUBJECT: "Incantum Confusus" confuse spell. 2×2 grid of 64×64 VFX frames showing swirl/question marks and disorientation.
Frame 0: yellow (#ffcc00) question mark spinning.
Frame 1: purple (#9b59b6) spiral expanding around the question mark.
Frame 2: cyan (#00ffff) dizzy stars orbit the spiral.
Frame 3: green (#88ff88) wavy confusion lines ripple outward.
PNG-32 alpha, 1 px gutter, transparent background, flat pixel art, 16 colors max.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('spell_incantumConfusus', 'assets/spell_incantumConfusus.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```


### 7.3 magicusRidiculum

- **Sprite key:** `spell_magicusRidiculum`
- **Palette:** down-arrow blue `#4488ff`, sad gray `#888888`, crumble brown `#8b4513`, defeat purple `#5500aa`, transparent.

**LLM prompt:**

```text
SUBJECT: "Magicus Ridiculum" debuff spell. 2×2 grid of 64×64 VFX frames showing down arrow / sad face / crumbling confidence.
Frame 0: big downward-pointing arrow (#4488ff) slamming down.
Frame 1: arrow hits a gray sad-face symbol (#888888).
Frame 2: the sad face cracks and crumbles (#8b4513 fragments).
Frame 3: small defeat particles (#5500aa) drift down.
PNG-32 alpha, 1 px gutter, transparent background, flat pixel art, 16 colors max.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('spell_magicusRidiculum', 'assets/spell_magicusRidiculum.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```


### 7.4 levitatusPenosos

- **Sprite key:** `spell_levitatusPenosos`
- **Palette:** feather white `#ffffff`, escape blue `#87ceeb`, running silhouette black `#000000`, sweat drop `#b3e5fc`, transparent.

**LLM prompt:**

```text
SUBJECT: "Levitatus Penosos" escape spell. 2×2 grid of 64×64 VFX frames showing floating feather / running silhouette / awkward levitation.
Frame 0: single white feather (#ffffff) drifting up.
Frame 1: a comedic running silhouette (#000000) lifted off the ground by blue (#87ceeb) levitation rays.
Frame 2: silhouette flailing mid-air with sweat drops (#b3e5fc).
Frame 3: silhouette and feather fading upward.
PNG-32 alpha, 1 px gutter, transparent background, flat pixel art, 16 colors max.
```


**Phaser load snippet:**

```ts
this.load.spritesheet('spell_abracadabrumSexicus', 'assets/spell_abracadabrumSexicus.png', {
  frameWidth: 64, frameHeight: 64, spacing: 1,
});
```


---

## 8. Zones

### 8.1 Backgrounds (800×600)

| Zone ID | Zone Name | bgColor | Sprite Key | Canvas |
|---|---|---|---|---|
| taverna | Taverna do Lamento | `#3a2a1a` | `bg_taverna` | 800×600 (pad to 1024×1024) |
| floresta | Floresta da Rejeição | `#1a3a1a` | `bg_floresta` | 800×600 (pad to 1024×1024) |
| deserto | Deserto do Esquecimento | `#d4a017` | `bg_deserto` | 800×600 (pad to 1024×1024) |
| caverna | Caverna do Constrangimento | `#2a2a3a` | `bg_caverna` | 800×600 (pad to 1024×1024) |
| vulcao | Vulcão da Verdade | `#8b0000` | `bg_vulcao` | 800×600 (pad to 1024×1024) |
| monte | Monte Macheza | `#e0e0ff` | `bg_monte` | 800×600 (pad to 1024×1024) |

**LLM prompt template:**

```text
Pixel art background/tileset for "Catirobas do Inferno," a comedic 1980s-style RPG... [same global preamble adapted for backgrounds]

Background illustration of "[ZONE NAME]". The background color is [BGCOLOR]. [ZONE-SPECIFIC DESCRIPTION]. Render as 800×600 pixel art on a 1024×1024 transparent-padded canvas. No gradients, no soft lighting, no photorealism, no anime/chibi. Flat fills, limited 16-color palette, PNG-32 alpha.
```

**Zone descriptions:**
- **taverna**: Dark sticky tavern interior, sagging wooden tables, bent barstools, cobwebs hanging from ceiling, sickly green stains on floor, dim flickering yellow light, harsh blocky shadows.
- **floresta**: Forest that literally laughs at you, twisted trees with smirking mocking faces carved into bark, dark green foliage, thorny bushes, rejection atmosphere.
- **deserto**: Vast hot lonely desert, golden sand dunes, dry rocks, withered cactus, wavy mirage heat lines, bright pixelated sun.
- **caverna**: Dark blue-grey cave, stalactites hanging from ceiling, glowing pink/purple flashback vignettes floating in air showing comically embarrassing moments, shadows like crying/cowering figures.
- **vulcao**: Dark red volcanic landscape, jagged volcanic rock formations, glowing orange lava cracks, small fire bursts, comically dramatic smoke puffs, truth-burning runes in rock.
- **monte**: Pale blue snow peak, snowy mountain summit, howling wind swirls, comically small glowing primordial fire altar at top, frozen statues of previous losers who failed the quest.

**Phaser load snippet:**

```ts
this.load.image('bg_taverna', 'assets/bg_taverna.png');
```

### 8.2 Tilesets (16×16 tiles in 256×256 sheet)

| Zone ID | Sprite Key | Layout |
|---|---|---|
| taverna | `tiles_taverna` | 16×16 or 15×15 bleed-safe |
| floresta | `tiles_floresta` | 16×16 or 15×15 bleed-safe |
| deserto | `tiles_deserto` | 16×16 or 15×15 bleed-safe |
| caverna | `tiles_caverna` | 16×16 or 15×15 bleed-safe |
| vulcao | `tiles_vulcao` | 16×16 or 15×15 bleed-safe |
| monte | `tiles_monte` | 16×16 or 15×15 bleed-safe |

**Tileset contents per zone (suggest 10-12 distinct tiles + variations):**
- Taverna: sticky floorboards, stained wood, cracked tiles, dirty planks, cracked plaster, sagging table, bent barstool, broken mug, spilled drink, sticky green puddle, mold, cobwebs, dust, wall cracks.
- Floresta: mossy grass, muddy path, roots, laughing hedges, dark tree trunks, thorny barriers, smirking tree hollow, "Go Away" signpost, tiny crying mushroom, laughing thorn bushes, poison ivy, falling twigs.
- Deserto: gold sand, cracked dry earth, sand dunes, sandstone cliffs, rock walls, withered cactus, bleached skull, "?" signpost, mirage heat wave, quicksand, sand ripples, small pebbles, desert shrubs.
- Caverna: dark stone floor, damp gravel, cracked bedrock, stalactite walls, flashback vignette frame, crying shadow figure, glowing purple crystal, embarrassment shadow puddles, sharp stalagmites, dripping water, rock cracks, glowing moss.
- Vulcao: hardened dark red basalt, ash piles, cracked lava crust, volcanic rock walls, obsidian pillars, magma flows, truth-burning altar, glowing rune stone, small vent, lava cracks, bubbling magma, smoke puffs, fire sparks, rock fissures.
- Monte: pale blue snow, icy path, frozen soil, glacier walls, snow-covered peaks, ice blocks, primordial fire altar, frozen loser statue, wind-blown flag, icy spikes, freezing wind gusts, snow drifts, icicles, wind swirls.

**Phaser load snippet:**

```ts
this.load.image('tiles_taverna', 'assets/tiles_taverna.png');
// In create() with a tilemap:
const tileset = map.addTilesetImage('taverna', 'tiles_taverna', 16, 16, 1, 1);
```

Use `margin: 0, spacing: 0` for a compact 16×16 grid, or `margin: 1, spacing: 1` for a bleed-safe 15×15 grid that still fits 256×256.

---

## 9. NPCs

Shared spec: 48×48 frames, 4 cols × 1 row, canvas 256×64 px (content 195×48 px), 1 px gutter.

### 9.1 Zezé

- **Sprite key:** `npc_zeze`
- **Palette:** neon green `#66ff00`, smoke green `#338800`, dirty brown `#5c3d1a`, sickly green `#4a6b2a`, tan `#c8a96e`, black `#000000`, transparent.

**LLM prompt:**

```text
SUBJECT: "Zezé," the stoner sage NPC. Scrawny humanoid floating impossibly upside-down in mid-air, legs crossed lotus-style above head, arms dangling loosely. Wears tie-dye headband and ragged vest. Expression permanently half-lidded and blissful. Thick cloud of comical green smoke (#338800 and #66ff00) billows around him in chunky pixel puffs.

Layout: 4 cells in a single horizontal row, each 48×48 px, 1 px gutter, on 256×64 canvas.
Frame 0: floats upside-down, arms limp, tiny green smoke wisps curling left, eyes half-shut, dopey grin.
Frame 1: smoke puffs shift right and expand by 2 px, Zezé bobs 1 px lower, one arm sways.
Frame 2: large chunky smoke ring forms around torso, bobs 1 px higher, eyes momentarily close.
Frame 3: smoke ring disperses into 3 small puffs, eyes open to half-lid, returns to Frame 0 pose for seamless loop.

PALETTE: #66ff00 #338800 #5c3d1a #4a6b2a #c8a96e #000000 + transparent.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('npc_zeze', 'assets/npc_zeze.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
this.anims.create({
  key: 'zeze_idle',
  frames: this.anims.generateFrameNumbers('npc_zeze', { start: 0, end: 3 }),
  frameRate: 4, repeat: -1,
});
```

### 9.2 Mulher

- **Sprite key:** `npc_mulher`
- **Palette:** plum `#dda0dd`, dark plum `#8b668b`, aura magenta `#ff0080`, black `#000000`, transparent.

**LLM prompt:**

```text
SUBJECT: "Mulher," a woman NPC sitting on a barstool with her back COMPLETELY turned to the viewer. Plum-colored dress (#dda0dd), dark hair in a tight bun, arms crossed. A jagged zigzag aura in hot magenta (#ff0080) crackles around her silhouette spelling DO NOT APPROACH.

Layout: 4 cells in a single horizontal row, each 48×48 px, 1 px gutter, on 256×64 canvas.
Frame 0: back turned, arms crossed, jagged magenta aura spikes radiate outward in short zigzag lines.
Frame 1: aura spikes rotate 45 degrees clockwise, head tilts 1 px right, emphasizing disinterest.
Frame 2: aura spikes flash brighter (#ff66aa), she raises one shoulder in dismissive micro-shrug.
Frame 3: returns to Frame 0 pose, seamless loop.

PALETTE: #dda0dd #8b668b #ff0080 #ff66aa #000000 + transparent.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('npc_mulher', 'assets/npc_mulher.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
this.anims.create({
  key: 'mulher_idle',
  frames: this.anims.generateFrameNumbers('npc_mulher', { start: 0, end: 3 }),
  frameRate: 4, repeat: -1,
});
```

### 9.3 Bartender

- **Sprite key:** `npc_bartender`
- **Palette:** brown apron `#8b4513`, dirty tan `#c8a96e`, off-white shirt `#d4c8a0`, dead-eye black `#1a1a1a`, transparent.

**LLM prompt:**

```text
SUBJECT: Bored bartender NPC standing behind a dirty counter. Stocky generic male, stained brown apron (#8b4513) over dingy off-white shirt (#d4c8a0). Eyes are two tiny black dots with zero life. Holds dirty rag in one hand and questionable bottle in the other. Grimy bar counter visible at waist level.

Layout: 4 cells in a single horizontal row, each 48×48 px, 1 px gutter, on 256×64 canvas.
Frame 0: stands still, rag hand resting on counter, bottle in other hand, dead stare forward.
Frame 1: slowly wipes counter with rag in a 2-pixel circular motion, expression unchanged.
Frame 2: lifts bottle 2 px, squints at it with zero curiosity, then lowers it.
Frame 3: returns to Frame 0 exact pose, seamless loop.

PALETTE: #8b4513 #c8a96e #d4c8a0 #1a1a1a + transparent.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('npc_bartender', 'assets/npc_bartender.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
this.anims.create({
  key: 'bartender_idle',
  frames: this.anims.generateFrameNumbers('npc_bartender', { start: 0, end: 3 }),
  frameRate: 4, repeat: -1,
});
```

**Phaser load snippet per NPC:**

Zezé:

```ts
this.load.spritesheet('npc_zeze', 'assets/npc_zeze.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
this.anims.create({
  key: 'zeze_idle',
  frames: this.anims.generateFrameNumbers('npc_zeze', { start: 0, end: 3 }),
  frameRate: 4, repeat: -1,
});
```

Mulher:

```ts
this.load.spritesheet('npc_mulher', 'assets/npc_mulher.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
this.anims.create({
  key: 'mulher_idle',
  frames: this.anims.generateFrameNumbers('npc_mulher', { start: 0, end: 3 }),
  frameRate: 4, repeat: -1,
});
```

Bartender:

```ts
this.load.spritesheet('npc_bartender', 'assets/npc_bartender.png', {
  frameWidth: 48, frameHeight: 48, spacing: 1,
});
this.anims.create({
  key: 'bartender_idle',
  frames: this.anims.generateFrameNumbers('npc_bartender', { start: 0, end: 3 }),
  frameRate: 4, repeat: -1,
});
```

---

## 10. Hero Expression Portraits

Shared sheet: `portraits_heroes`, 32×32 frames, 6 cols × 2 rows = 12 portraits, canvas 256×128 px (content 197×65 px), 1 px gutter.

| Frame | Hero | Expression | Description |
|---:|---|---|---|
| 0 | Boleto | Smug | Toothy overconfident grin, sparkle pixel on tooth, chin up, nostrils flared. |
| 1 | Boleto | Lust / Wild Take | Eyes popped out as heart shapes, jaw dropped 4 px below chin, tongue lolling, pink blush pixels. |
| 2 | Boleto | Confused/Insulted | Brow furrowed, mouth twisted, one eye squinting, looking down at broken sword off-frame. |
| 3 | Porquinho | Panic | Huge white terror eyes, 3-pixel sweat drops flying, mouth tiny trembling zigzag. |
| 4 | Porquinho | Casting | Eyes squeezed shut, tongue poking out, biting concentration, tiny pixel sparks at hat tip. |
| 5 | Porquinho | Embarrassment Puddle | Features drooping and pooling at bottom of cell, two sad dots near bottom, puddle of shame. |
| 6 | Meleca | Clueless Happy | Green blob face with dot eyes, wide vacant U-shaped smile, slime drip hanging from chin. |
| 7 | Meleca | Sad Wobble | Outline wobbles like jelly, droopy half-circle eyes, small downturned mouth, slime tear. |
| 8 | Meleca | Damage Splatter | Blob mid-splat, squashed wide, features scattered, one eye higher, green splatter drops flying. |
| 9 | Caveira | Existential Sigh | Bone-white skull with crack, eye sockets rolled up in sarcasm, tiny air puff, weary jaw hang. |
| 10 | Caveira | Crying Dust | Eye sockets pointing down, tan/brown dust particles trickling from each socket, crack wider. |
| 11 | Caveira | Sarcastic Smirk | One socket narrowed slit, other wide, jawbone curves into dry smirk, crossed bone daggers below chin. |

**Phaser load snippet:**

```ts
this.load.spritesheet('portraits_heroes', 'assets/portraits_heroes.png', {
  frameWidth: 32, frameHeight: 32, spacing: 1,
});
// Frame index map:
// boleto: { smug:0, lust:1, confused:2 }
// porquinho: { panic:3, casting:4, embarrassed:5 }
// meleca: { happy:6, sad:7, damage:8 }
// caveira: { sigh:9, crying:10, smirk:11 }
```

---



## 11. UI Kit

Use either separate small sheets or one packed atlas (`ui.png` + `ui.json`).

### 11.1 Button states

- **Sprite key:** `btn_states`
- **Frame size:** 96×32 px
- **Grid:** 1 col × 3 rows = normal, hover, active
- **Canvas:** 128×128 px (content 96×98 px)
- **Palette:** from `uiFactory.ts`: `#0f3460` normal bg, `#1a5276` hover, `#2471a3` active, border `#0f3460`, highlight `#1a3a6e`, shadow `#0a2040`.

**LLM prompt:**

```text
SUBJECT: Retro RPG menu button in three interaction states. Rounded-corner rectangle (2 px corner radius), 2 px wide border in dark navy (#0f3460). Interior flat-filled. Bevel suggested using 1 px lighter top/left edge and 1 px darker bottom/right edge.

Layout: 1 column × 3 rows, each cell 96×32 px, 1 px gutter, on 128×128 canvas.
Row 0 — NORMAL: fill #0f3460, border #0f3460, highlight edge #1a3a6e, shadow edge #0a2040, interior flat.
Row 1 — HOVER: fill #1a5276, border #0f3460, highlight #2a6a90, bright accent line along top interior.
Row 2 — ACTIVE/PRESSED: fill #2471a3, border #0f3460, bevel inverted (shadow top/left, highlight bottom/right), fill shifted down-right 1 px.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('btn_states', 'assets/btn_states.png', {
  frameWidth: 96, frameHeight: 32, spacing: 1,
});
// Frame 0 = normal, 1 = hover, 2 = active
```

### 11.2 Panel

- **Sprite keys:** `panel_9slice` (48×48 tile) and `panel_fixed` (200×40 precomposed)
- **Palette:** fill `#16213e`, border `#0f3460`, inner highlight `#1a3a5e`.

**LLM prompt for 9-slice tile:**

```text
SUBJECT: 48×48 square panel tile for 9-slice stretching. Dark navy fill (#16213e). 2 px border (#0f3460). 8×8 pixel decorative corner brackets: small right-angle pixel flourishes (2 px thick L-shape per corner). Edges between corners are simple 2 px straight borders. Center 32×32 area flat (#16213e). Must stretch cleanly when sliced at 8 px insets on all sides.
```

**Phaser snippet:**

```ts
this.load.image('panel_9slice', 'assets/panel_9slice.png');
this.add.nineslice(x, y, 'panel_9slice', undefined, width, height, 8, 8, 8, 8);
```

### 11.3 Health / MP / XP bars

- **Sprite key:** `bars`
- **Frame size:** 64×8 px
- **Grid:** 1 col × 4 rows = background, HP, MP, XP
- **Canvas:** 64×64 px
- **Palette:** bg `#1a1a1a`, HP `#00cc44`, MP `#4488ff`, XP `#9933ff`.

**Phaser load snippet:**

```ts
this.load.spritesheet('bars', 'assets/bars.png', {
  frameWidth: 64, frameHeight: 8, spacing: 1,
});
// Frame 0 = background, 1 = HP, 2 = MP, 3 = XP
```

### 11.4 Status icons

- **Sprite key:** `status_icons`
- **Frame size:** 16×16 px
- **Grid:** 4 cols × 1 row
- **Canvas:** 128×16 px (content 67×16 px)
- **Frames:** 0 = confuso, 1 = envenenado, 2 = paralisado, 3 = morrendo.

**LLM prompt:**

```text
SUBJECT: Four 16×16 status effect icons for RPG combat HUD, high contrast, bold shapes.
Cell 0 — CONFUSO: pair of cartoon spiral eyes (yellow #ffcc00 spirals on black), two small yellow stars orbiting above.
Cell 1 — ENVENENADO: dripping skull and crossbones in toxic green (#44ff44) on transparent, two green droplets falling from jaw.
Cell 2 — PARALISADO: yellow (#ffcc00) lightning bolt zigzag downward through center, small spark pixels at tip, stiff horizontal lines suggesting frozen limbs.
Cell 3 — MORRENDO: broken heart shape in red (#cc0000), cracked down the middle with visible gap, one pixel drop of red falling, small dark aura around heart.
```

**Phaser load snippet:**

```ts
this.load.spritesheet('status_icons', 'assets/status_icons.png', {
  frameWidth: 16, frameHeight: 16, spacing: 1,
});
```

### 11.5 Portrait frame

- **Sprite key:** `portrait_frame`
- **Size:** 48×48 px single image
- **Design:** 8 px wide ornamental border surrounding transparent 32×32 interior. Outer edge 2 px dark navy (#0f3460), inner band #16213e, corner diamond ornaments gold (#ffd700), repeating gold dot pattern along edges, inner accent line hot pink (#ff0080).

**Phaser snippet:**

```ts
this.load.image('portrait_frame', 'assets/portrait_frame.png');
```

### 11.6 Cursor

- **Sprite key:** `cursor`
- **Size:** 16×16 px single image
- **Design:** chunky white pointing hand with 1 px black outline, index finger pointing top-left (hotspot at 1,1), wrist cuff gold (#ffd700).

**Phaser snippet:**

```ts
this.load.image('cursor', 'assets/cursor.png');
this.input.setDefaultCursor('url(assets/cursor.png) 1 1, pointer');
```

### 11.7 Directional arrows

- **Sprite key:** `arrows`
- **Frame size:** 16×16 px
- **Grid:** 4 cols × 1 row = up, down, left, right
- **Canvas:** 128×16 px
- **Design:** bold triangular arrowhead (6 px wide base, 5 px tall) + 2 px shaft, white fill (#ffffff), 1 px black outline.

**Phaser load snippet:**

```ts
this.load.spritesheet('arrows', 'assets/arrows.png', {
  frameWidth: 16, frameHeight: 16, spacing: 1,
});
// Frame 0 = up, 1 = down, 2 = left, 3 = right
```

### 11.8 X mark (close/cancel)

- **Sprite key:** `icon_close`
- **Size:** 16×16 px single image
- **Design:** bold X from (3,3) to (13,13) and (13,3) to (3,13), 2 px wide strokes, red (#cc0000) fill, darker red (#880000) outline.

**Phaser snippet:**

```ts
this.load.image('icon_close', 'assets/icon_close.png');
```

### 11.9 Coin icon

- **Sprite key:** `icon_coin`
- **Size:** 16×16 px single image
- **Design:** slightly oval gold coin (12×14 px), dark gold (#b8860b) outer ring, bright gold (#ffd700) face, bold letter "C" stamped in center in dark gold, single white highlight pixel at 10-o'clock rim.

**Phaser snippet:**

```ts
this.load.image('icon_coin', 'assets/icon_coin.png');
```

### 11.10 Atlas packing reference

For a single `ui.png` atlas, pack the above elements and use `this.load.atlas('ui', 'assets/ui.png', 'assets/ui.json')`. Atlas frame names follow `btn_normal`, `panel_9slice`, `bar_hp`, `status_confuso`, `portrait_frame`, `cursor`, `arrow_up`, `icon_close`, `icon_coin`, etc.

---

## 12. Phaser 3.87 Integration Guide

### 12.1 Recommended asset folder structure

```
public/
  assets/
    hero_boleto.png
    hero_porquinho.png
    hero_meleca.png
    hero_caveira.png
    enemy_niceguy.png
    enemy_trollincel.png
    enemy_homemcaverna.png
    enemy_corporatebro.png
    boss_homemarvore.png
    boss_miragemego.png
    boss_seureflexo.png
    boss_manifestacaorealidade.png
    boss_senhorarazao.png
    items.png
    spell_abracadabrumSexicus.png
    spell_incantumConfusus.png
    spell_magicusRidiculum.png
    spell_levitatusPenosos.png
    bg_taverna.png
    bg_floresta.png
    bg_deserto.png
    bg_caverna.png
    bg_vulcao.png
    bg_monte.png
    tiles_taverna.png
    tiles_floresta.png
    tiles_deserto.png
    tiles_caverna.png
    tiles_vulcao.png
    tiles_monte.png
    npc_zeze.png
    npc_mulher.png
    npc_bartender.png
    portraits_heroes.png
    btn_states.png
    bars.png
    status_icons.png
    arrows.png
    portrait_frame.png
    cursor.png
    icon_close.png
    icon_coin.png
```


### 12.2 Phaser 3.87 pixel-art renderer config

For crisp sprites, set these in `gameConfig.ts`:

```ts
{
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}
```

`pixelArt: true` disables texture smoothing, and `roundPixels: true` keeps sub-pixel positions from blurring 1 px lines.

### 12.3 Minimal PreloadScene

Create a new scene and add it as the first scene in `gameConfig.ts`:

```ts
import Phaser from 'phaser';
import { SceneKeys } from './sceneKeys';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Preload });
  }

  preload(): void {
    // Heroes
    this.load.spritesheet('hero_boleto', 'assets/hero_boleto.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });
    this.load.spritesheet('hero_porquinho', 'assets/hero_porquinho.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });
    this.load.spritesheet('hero_meleca', 'assets/hero_meleca.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });
    this.load.spritesheet('hero_caveira', 'assets/hero_caveira.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });

    // Enemies
    this.load.spritesheet('enemy_niceguy', 'assets/enemy_niceguy.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });
    this.load.spritesheet('enemy_trollincel', 'assets/enemy_trollincel.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });
    this.load.spritesheet('enemy_homemcaverna', 'assets/enemy_homemcaverna.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });
    this.load.spritesheet('enemy_corporatebro', 'assets/enemy_corporatebro.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });

    // Bosses
    this.load.spritesheet('boss_homemarvore', 'assets/boss_homemarvore.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });
    this.load.spritesheet('boss_miragemego', 'assets/boss_miragemego.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });
    this.load.spritesheet('boss_seureflexo', 'assets/boss_seureflexo.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });
    this.load.spritesheet('boss_manifestacaorealidade', 'assets/boss_manifestacaorealidade.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });
    this.load.spritesheet('boss_senhorarazao', 'assets/boss_senhorarazao.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });

    // Items & spells
    this.load.spritesheet('items', 'assets/items.png', { frameWidth: 32, frameHeight: 32, spacing: 1 });
    this.load.spritesheet('spell_abracadabrumSexicus', 'assets/spell_abracadabrumSexicus.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });
    this.load.spritesheet('spell_incantumConfusus', 'assets/spell_incantumConfusus.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });
    this.load.spritesheet('spell_magicusRidiculum', 'assets/spell_magicusRidiculum.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });
    this.load.spritesheet('spell_levitatusPenosos', 'assets/spell_levitatusPenosos.png', { frameWidth: 64, frameHeight: 64, spacing: 1 });

    // Zone backgrounds
    this.load.image('bg_taverna', 'assets/bg_taverna.png');
    this.load.image('bg_floresta', 'assets/bg_floresta.png');
    this.load.image('bg_deserto', 'assets/bg_deserto.png');
    this.load.image('bg_caverna', 'assets/bg_caverna.png');
    this.load.image('bg_vulcao', 'assets/bg_vulcao.png');
    this.load.image('bg_monte', 'assets/bg_monte.png');

    // Tilesets (load as images; add to tilemap in create)
    this.load.image('tiles_taverna', 'assets/tiles_taverna.png');
    this.load.image('tiles_floresta', 'assets/tiles_floresta.png');
    this.load.image('tiles_deserto', 'assets/tiles_deserto.png');
    this.load.image('tiles_caverna', 'assets/tiles_caverna.png');
    this.load.image('tiles_vulcao', 'assets/tiles_vulcao.png');
    this.load.image('tiles_monte', 'assets/tiles_monte.png');

    // NPCs
    this.load.spritesheet('npc_zeze', 'assets/npc_zeze.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });
    this.load.spritesheet('npc_mulher', 'assets/npc_mulher.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });
    this.load.spritesheet('npc_bartender', 'assets/npc_bartender.png', { frameWidth: 48, frameHeight: 48, spacing: 1 });

    // UI
    this.load.spritesheet('portraits_heroes', 'assets/portraits_heroes.png', { frameWidth: 32, frameHeight: 32, spacing: 1 });
    this.load.spritesheet('btn_states', 'assets/btn_states.png', { frameWidth: 96, frameHeight: 32, spacing: 1 });
    this.load.spritesheet('bars', 'assets/bars.png', { frameWidth: 64, frameHeight: 8, spacing: 1 });
    this.load.spritesheet('status_icons', 'assets/status_icons.png', { frameWidth: 16, frameHeight: 16, spacing: 1 });
    this.load.spritesheet('arrows', 'assets/arrows.png', { frameWidth: 16, frameHeight: 16, spacing: 1 });
    this.load.image('portrait_frame', 'assets/portrait_frame.png');
    this.load.image('cursor', 'assets/cursor.png');
    this.load.image('icon_close', 'assets/icon_close.png');
    this.load.image('icon_coin', 'assets/icon_coin.png');
  }

  create(): void {
    this.createHeroAnims();
    this.createEnemyAnims();
    this.createBossAnims();
    this.createNpcAnims();
    this.scene.start(SceneKeys.Title);
  }

  private createHeroAnims(): void {
    const dirs = ['down', 'up', 'left', 'right'];
    const heroes = ['boleto', 'porquinho', 'meleca', 'caveira'];

    for (const hero of heroes) {
      const key = `hero_${hero}`;
      // walk: rows 0-1  => frames 0-15
      for (let i = 0; i < 4; i++) {
        const start = i * 4;
        this.anims.create({
          key: `${hero}_walk_${dirs[i]}`,
          frames: this.anims.generateFrameNumbers(key, { start, end: start + 3 }),
          frameRate: 8, repeat: -1,
        });
      }
      // idle: rows 2-3 => frames 16-31
      for (let i = 0; i < 4; i++) {
        const start = 16 + i * 4;
        this.anims.create({
          key: `${hero}_idle_${dirs[i]}`,
          frames: this.anims.generateFrameNumbers(key, { start, end: start + 3 }),
          frameRate: 4, repeat: -1,
        });
      }
      // attack: rows 4-5 => frames 32-47
      for (let i = 0; i < 4; i++) {
        const start = 32 + i * 4;
        this.anims.create({
          key: `${hero}_attack_${dirs[i]}`,
          frames: this.anims.generateFrameNumbers(key, { start, end: start + 3 }),
          frameRate: 12, repeat: 0,
        });
      }
      // hurt: row 6 => frames 48-55, 2 per direction
      for (let i = 0; i < 4; i++) {
        const start = 48 + i * 2;
        this.anims.create({
          key: `${hero}_hurt_${dirs[i]}`,
          frames: this.anims.generateFrameNumbers(key, { start, end: start + 1 }),
          frameRate: 6, repeat: 0,
        });
      }
      // death: rows 7-8 => frames 56-71
      for (let i = 0; i < 4; i++) {
        const start = 56 + i * 4;
        this.anims.create({
          key: `${hero}_death_${dirs[i]}`,
          frames: this.anims.generateFrameNumbers(key, { start, end: start + 3 }),
          frameRate: 6, repeat: 0,
        });
      }
    }
  }

  private createEnemyAnims(): void {
    const enemies = ['niceguy', 'trollincel', 'homemcaverna', 'corporatebro'];
    for (const id of enemies) {
      const key = `enemy_${id}`;
      this.anims.create({ key: `${id}_idle`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: `${id}_walk`, frames: this.anims.generateFrameNumbers(key, { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: `${id}_attack`, frames: this.anims.generateFrameNumbers(key, { start: 8, end: 11 }), frameRate: 10, repeat: 0 });
      this.anims.create({ key: `${id}_hurt`, frames: this.anims.generateFrameNumbers(key, { start: 12, end: 13 }), frameRate: 6, repeat: 0 });
    }
  }

  private createBossAnims(): void {
    const bosses = ['homemarvore', 'miragemego', 'seureflexo', 'manifestacaorealidade', 'senhorarazao'];
    for (const id of bosses) {
      const key = `boss_${id}`;
      this.anims.create({ key: `${id}_idle`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
      this.anims.create({ key: `${id}_attack`, frames: this.anims.generateFrameNumbers(key, { start: 4, end: 7 }), frameRate: 8, repeat: 0 });
      this.anims.create({ key: `${id}_hurt`, frames: this.anims.generateFrameNumbers(key, { start: 8, end: 11 }), frameRate: 6, repeat: 0 });
      this.anims.create({ key: `${id}_phase`, frames: this.anims.generateFrameNumbers(key, { start: 12, end: 15 }), frameRate: 6, repeat: 0 });
    }
  }

  private createNpcAnims(): void {
    for (const id of ['zeze', 'mulher', 'bartender']) {
      this.anims.create({
        key: `${id}_idle`,
        frames: this.anims.generateFrameNumbers(`npc_${id}`, { start: 0, end: 3 }),
        frameRate: 4, repeat: -1,
      });
    }
  }
}
```

### 12.4 Replacing runtime primitives

In `src/ui/uiCache.ts` and `src/ui/uiFactory.ts`, the following primitives should be replaced by the new sprites:

- `makeCharacterPrimitives()` and `getCharacterShapeImage()` → use `scene.add.sprite(x, y, 'hero_<id>').play('<id>_idle_down')`.
- `makeEnemyPrimitives()` and `getEnemyShapeImage()` → use `scene.add.sprite(x, y, 'enemy_<id>')` / `'boss_<id>'` and play the appropriate animation.
- `drawHealthBar()` background/fill rectangles → use `bars` sheet frames 0/1/2/3 and scale/crop the fill frame to the current percentage.
- `drawButton()` rectangle → use `btn_states` frames with pointer-over/out/down events swapping frames.
- `drawPanel()` rectangle → use `panel_9slice` with Phaser `NineSlice` or `panel_fixed` for fixed sizes.
- World map zone nodes remain live circles (interactive); only backgrounds/tilesets are new art.

---

## 13. Manifest Table

| Sprite Key | Entity ID | Scene(s) | Replaces in uiCache.ts / uiFactory.ts |
|---|---|---|---|
| `hero_boleto` | `boleto` | Battle, World, Dialogue | `makeCharacterPrimitives('boleto')` → `getCharacterShapeImage('boleto')` |
| `hero_porquinho` | `porquinho` | Battle, World, Dialogue | `makeCharacterPrimitives('porquinho')` |
| `hero_meleca` | `meleca` | Battle, World, Dialogue | `makeCharacterPrimitives('meleca')` |
| `hero_caveira` | `caveira` | Battle, World, Dialogue | `makeCharacterPrimitives('caveira')` |
| `enemy_niceguy` | `niceguy` | Battle | `makeEnemyPrimitives('niceguy')` |
| `enemy_trollincel` | `trollincel` | Battle | `makeEnemyPrimitives('trollincel')` |
| `enemy_homemcaverna` | `homemcaverna` | Battle | `makeEnemyPrimitives('homemcaverna')` |
| `enemy_corporatebro` | `corporatebro` | Battle | `makeEnemyPrimitives('corporatebro')` |
| `boss_homemarvore` | `homemarvore` | Battle (Floresta) | `makeEnemyPrimitives('homemarvore')` |
| `boss_miragemego` | `miragemego` | Battle (Deserto) | `makeEnemyPrimitives('miragemego')` |
| `boss_seureflexo` | `seureflexo` | Battle (Caverna) | `makeEnemyPrimitives('seureflexo')` |
| `boss_manifestacaorealidade` | `manifestacaorealidade` | Battle (Vulcão) | `makeEnemyPrimitives('manifestacaorealidade')` |
| `boss_senhorarazao` | `senhorarazao` | Battle (Monte) | `makeEnemyPrimitives('senhorarazao')` |
| `items` | `cerveja`, `pizzaFria`, `doritos`, `energetico`, `fotoBoleto`, `espelhoQuebrado`, `manualConversacao`, `maconhaZeze` | Shop, Inventory, Battle | Text labels in `ShopOverlay` / `PauseScene` |
| `spell_abracadabrumSexicus` | `abracadabrumSexicus` | Battle | Text spell names / primitive VFX |
| `spell_incantumConfusus` | `incantumConfusus` | Battle | Text spell names / primitive VFX |
| `spell_magicusRidiculum` | `magicusRidiculum` | Battle | Text spell names / primitive VFX |
| `spell_levitatusPenosos` | `levitatusPenosos` | Battle | Text spell names / primitive VFX |
| `bg_taverna` | `taverna` | Battle, Pause | Solid `bgColor` #3a2a1a in `BattleScene` |
| `bg_floresta` | `floresta` | Battle, Pause | Solid `bgColor` #1a3a1a |
| `bg_deserto` | `deserto` | Battle, Pause | Solid `bgColor` #d4a017 |
| `bg_caverna` | `caverna` | Battle, Pause | Solid `bgColor` #2a2a3a |
| `bg_vulcao` | `vulcao` | Battle, Pause | Solid `bgColor` #8b0000 |
| `bg_monte` | `monte` | Battle, Pause | Solid `bgColor` #e0e0ff |
| `tiles_taverna` | `taverna` | World (future) | No existing tilemap |
| `tiles_floresta` | `floresta` | World (future) | No existing tilemap |
| `tiles_deserto` | `deserto` | World (future) | No existing tilemap |
| `tiles_caverna` | `caverna` | World (future) | No existing tilemap |
| `tiles_vulcao` | `vulcao` | World (future) | No existing tilemap |
| `tiles_monte` | `monte` | World (future) | No existing tilemap |
| `npc_zeze` | `ZEZÉ` | Dialogue | No existing primitive |
| `npc_mulher` | `MULHER` | Dialogue | No existing primitive |
| `npc_bartender` | `Bartender` | Shop / Dialogue | No existing primitive |
| `portraits_heroes` | `boleto`, `porquinho`, `meleca`, `caveira` | Dialogue, Battle, Shop | No existing portraits |
| `btn_states` | — | All scenes | `drawButton()` rectangle in `uiFactory.ts` |
| `bars` | — | Battle, Shop | `drawHealthBar()` rectangles in `uiFactory.ts` |
| `status_icons` | `confuso`, `envenenado`, `paralisado`, `morrendo` | Battle | Text-only status in combat UI |
| `arrows` | — | UI navigation | No existing arrow primitives |
| `portrait_frame` | — | Dialogue, Battle | `drawPanel()` calls in `DialogueOverlay` |
| `cursor` | — | All scenes | Default browser cursor |
| `icon_close` | — | All scenes | No existing close icon |
| `icon_coin` | — | Shop, Battle rewards | Text coin labels |

---
