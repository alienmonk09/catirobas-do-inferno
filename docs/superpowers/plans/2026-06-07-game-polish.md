# Game Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cohesive layer of visual polish — a shared tween/easing primitive plus combat juice, turn-rhythm punctuation, spell/movement identity, and environmental ambience — with zero new runtime deps and without breaking the headless test split.

**Architecture:** A single pure `src/engine/tween.ts` (easing fns + a value tween, node-testable exactly like `src/engine/camera.ts`) becomes the shared "motion language". Every later piece of juice is built render/scene/UI-side consuming it, so `src/core` / `src/battle` / `src/data` stay render-free and the ~1552 node-env tests keep passing. Work is strictly sequenced: foundation → felt combat juice → turn rhythm → action identity → ambience.

**Tech Stack:** TypeScript, Vite, hand-rolled canvas 2D renderer, Vitest (node env), zero runtime dependencies.

---

## Ground rules (read before any task)

These hold for EVERY task below. They are the guardrails the audit flagged — violating one breaks the build or the feel:

- **No runtime dependency.** No Phaser/gsap/pixi/anime. The ~30-line pure `tween.ts` is the entire animation "engine".
- **Logic/render split is sacred.** `src/core`, `src/battle`, `src/data` must NOT import render code. `src/engine/renderer.ts` and `src/ui/*` are never imported by node tests. `tween.ts` must stay pure (no canvas/DOM/window).
- **Reduced motion on every new motion.** Gate canvas juice with `prefersReducedMotion()` (`src/engine/accessibility.ts`); add a `.reduced-motion` override in `src/ui/styles.ts` for DOM/CSS. A tint/flash is debatable — state your call in the task.
- **Phase 0 retrofit is a provable NO-OP.** Reproduce existing curve shapes exactly; tune feel only AFTER it lands.
- **Do not mutate the cached sprite canvas** for hit-flash — draw the tint as a per-frame overlay pass.
- **Punch-zoom is center-anchored inside Camera** (effectiveZoom used by both `origin` and `scale`) — a raw scale bump in buildView would zoom toward (0,0).
- **Hit-stop <= 0.12s** and never feed dt=0 to anything that stalls turn-flow promises beyond that cap.
- **Verification convention.** Pure modules (`tween.ts`, Camera pulse math) -> full TDD (failing vitest first, mirror `tests/camera.test.ts`). Render/scene/UI changes are NOT headless-testable -> implement, then `npx tsc --noEmit` + `npx vitest run` (zero logic regression) + a manual/puppeteer render eyeball. Every task ends in a commit.

---

## Phase 0 — Foundation: the shared motion primitive

This phase builds `src/engine/tween.ts` (pure, node-testable, mirrors `src/engine/camera.ts`) with full TDD, then does a provable no-op retrofit of the one inline curve that maps cleanly to a locked fn (the attack lunge → `hump`). The two renderer curves audited (crit pop-in, sprite/arrow bob) are deliberately LEFT alone — they don't map cleanly (see Task 0.4). Risk ≈ zero; every later phase consumes this module.

---

### Task 0.1: Write the failing test for `tween.ts`
**Files:** Create `tests/tween.test.ts` (mirrors the style of `tests/camera.test.ts`)

- [ ] **Step 1: Create the test file with the full LOCKED-API spec.** Write `tests/tween.test.ts` with exactly this content. It imports from a module that does not exist yet (so it MUST fail to compile/run first):

```ts
import { describe, it, expect } from "vitest";
import {
  lerp, clamp01, linear, easeInQuad, easeOutQuad, easeInOutSine,
  smoothstep, hump, makeTween,
} from "../src/engine/tween";

describe("tween scalars", () => {
  it("lerp interpolates a→b by t", () => {
    expect(lerp(0, 10, 0)).toBeCloseTo(0, 9);
    expect(lerp(0, 10, 0.5)).toBeCloseTo(5, 9);
    expect(lerp(0, 10, 1)).toBeCloseTo(10, 9);
    expect(lerp(4, 8, 0.25)).toBeCloseTo(5, 9); // a+(b-a)*t
  });

  it("clamp01 clamps to [0,1]", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.3)).toBeCloseTo(0.3, 9);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(2)).toBe(1);
  });
});

describe("tween easings: f(0)=0, f(1)=1, with the right midpoint", () => {
  it("linear is the identity", () => {
    expect(linear(0)).toBeCloseTo(0, 9);
    expect(linear(0.5)).toBeCloseTo(0.5, 9);
    expect(linear(1)).toBeCloseTo(1, 9);
  });
  it("easeInQuad = t*t", () => {
    expect(easeInQuad(0)).toBeCloseTo(0, 9);
    expect(easeInQuad(0.5)).toBeCloseTo(0.25, 9);
    expect(easeInQuad(1)).toBeCloseTo(1, 9);
  });
  it("easeOutQuad = 1-(1-t)^2", () => {
    expect(easeOutQuad(0)).toBeCloseTo(0, 9);
    expect(easeOutQuad(0.5)).toBeCloseTo(0.75, 9);
    expect(easeOutQuad(1)).toBeCloseTo(1, 9);
  });
  it("easeInOutSine = -(cos(PI*t)-1)/2", () => {
    expect(easeInOutSine(0)).toBeCloseTo(0, 9);
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 9);
    expect(easeInOutSine(1)).toBeCloseTo(1, 9);
  });
  it("smoothstep = t*t*(3-2t)", () => {
    expect(smoothstep(0)).toBeCloseTo(0, 9);
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 9);
    expect(smoothstep(1)).toBeCloseTo(1, 9);
  });
});

describe("hump: one-shot 0→1→0", () => {
  it("peaks at the middle and returns to 0", () => {
    expect(hump(0)).toBeCloseTo(0, 9);
    expect(hump(0.5)).toBeCloseTo(1, 9);
    expect(hump(1)).toBeCloseTo(0, 9);
  });
  it("clamps its input to [0,1] (no negative-sine wrap-around)", () => {
    expect(hump(-1)).toBeCloseTo(0, 9); // clamp01(-1)=0 → sin(0)=0
    expect(hump(2)).toBeCloseTo(0, 9);  // clamp01(2)=1 → sin(PI)≈0
  });
});

describe("makeTween", () => {
  it("starts at `from` before any update", () => {
    const tw = makeTween({ from: 10, to: 20, dur: 1 });
    expect(tw.value).toBeCloseTo(10, 9);
    expect(tw.done).toBe(false);
  });
  it("settles to `to` with done=true once elapsed≥dur", () => {
    const tw = makeTween({ from: 0, to: 100, dur: 1 });
    tw.update(0.5);
    expect(tw.value).toBeCloseTo(50, 9); // linear default at t=0.5
    expect(tw.done).toBe(false);
    tw.update(0.5);
    expect(tw.value).toBeCloseTo(100, 9);
    expect(tw.done).toBe(true);
  });
  it("clamps elapsed at dur (overshoot dt does not overshoot value)", () => {
    const tw = makeTween({ from: 0, to: 100, dur: 1 });
    tw.update(5);
    expect(tw.value).toBeCloseTo(100, 9);
    expect(tw.done).toBe(true);
  });
  it("update returns the new value", () => {
    const tw = makeTween({ from: 0, to: 10, dur: 1 });
    expect(tw.update(0.5)).toBeCloseTo(5, 9);
  });
  it("applies the supplied ease", () => {
    const tw = makeTween({ from: 0, to: 100, dur: 1, ease: easeInQuad });
    tw.update(0.5);
    expect(tw.value).toBeCloseTo(25, 9); // easeInQuad(0.5)=0.25 → 0+(100-0)*0.25
  });
  it("treats a non-positive dur as instantly complete (value=to, done)", () => {
    const tw = makeTween({ from: 0, to: 100, dur: 0 });
    expect(tw.value).toBeCloseTo(100, 9);
    expect(tw.done).toBe(true);
    expect(tw.update(0.5)).toBeCloseTo(100, 9);
    expect(tw.done).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test, expect FAIL.** Run:

```bash
cd /Users/jader/dev/tactics-game && npx vitest run tests/tween.test.ts
```

Expected: failure — vitest cannot resolve the import (`Failed to load url ../src/engine/tween` / "Cannot find module"). This proves the test exercises a not-yet-existing module. Do NOT commit yet.

---

### Task 0.2: Implement `tween.ts` to make the test pass
**Files:** Create `src/engine/tween.ts` (pure — no canvas/DOM/window, mirrors `src/engine/camera.ts`)

- [ ] **Step 1: Write the module with the exact LOCKED API.** Create `src/engine/tween.ts`:

```ts
/** Pure motion primitives — no canvas/DOM/window (mirrors camera.ts → node-unit-testable).
 *  The whole "tween engine" for the game: ~30 lines, zero runtime deps. */

/** Linear interpolation: a + (b-a)*t. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp t into [0,1]. */
export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

// ---- easings: all map [0,1] → [0,1] with f(0)=0, f(1)=1 ----
export function linear(t: number): number {
  return t;
}
export function easeInQuad(t: number): number {
  return t * t;
}
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** One-shot 0→1→0 bump, peaking at t=0.5. Input is clamped so out-of-range
 *  t never wraps into a negative sine lobe. */
export function hump(t: number): number {
  return Math.sin(clamp01(t) * Math.PI);
}

export interface Tween {
  update(dt: number): number;
  readonly value: number;
  readonly done: boolean;
}

/** Time-driven scalar tween. Advances an internal elapsed by dt (clamped at dur);
 *  value = lerp(from, to, ease(elapsed/dur)); done once elapsed ≥ dur. */
export function makeTween(opts: {
  from: number;
  to: number;
  dur: number;
  ease?: (t: number) => number;
}): Tween {
  const ease = opts.ease ?? linear;
  const dur = opts.dur;
  let elapsed = 0;
  // A non-positive duration is an instantly-complete tween: it sits at `to`, done.
  const frac = () => (dur <= 0 ? 1 : clamp01(elapsed / dur));
  const compute = () => lerp(opts.from, opts.to, ease(frac()));
  let value = compute();
  return {
    update(dt: number): number {
      elapsed = dur <= 0 ? 0 : Math.min(dur, elapsed + dt);
      value = compute();
      return value;
    },
    get value() {
      return value;
    },
    get done() {
      return dur <= 0 || elapsed >= dur;
    },
  };
}
```

- [ ] **Step 2: Run the tween test, expect PASS.** Run:

```bash
cd /Users/jader/dev/tactics-game && npx vitest run tests/tween.test.ts
```

Expected: all tests in `tests/tween.test.ts` pass (green, 0 failures).

- [ ] **Step 3: Typecheck.** Run:

```bash
cd /Users/jader/dev/tactics-game && npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 4: Commit.** Run:

```bash
cd /Users/jader/dev/tactics-game && git add src/engine/tween.ts tests/tween.test.ts && git commit -m "feat(engine): add pure tween.ts motion primitives (TDD)"
```

---

### Task 0.3: No-op retrofit — attack lunge consumes `hump`
**Files:** Modify `src/scenes/battleView.ts` (import line ~13; lunge curve at `:161`)

The current lunge curve is `Math.sin(Math.min(1, s.lunge.age / LUNGE_DUR) * Math.PI) * 7`. Since `hump(x) = Math.sin(clamp01(x) * Math.PI)` and `clamp01(x) = Math.max(0, Math.min(1, x))`, and `s.lunge.age / LUNGE_DUR` is always ≥ 0 (age and LUNGE_DUR are both positive), `Math.min(1, x)` and `clamp01(x)` are identical on this domain. So `hump(s.lunge.age / LUNGE_DUR) * 7` is mathematically identical — a true no-op.

- [ ] **Step 1: Add the `hump` import.** In `src/scenes/battleView.ts`, the accessibility import is on line 12:

```ts
import { prefersReducedMotion } from "../engine/accessibility";
```

Add a new import line directly after it:

```ts
import { prefersReducedMotion } from "../engine/accessibility";
import { hump } from "../engine/tween";
```

- [ ] **Step 2: Replace the inline lunge curve.** At line 161, replace:

```ts
      const f = Math.sin(Math.min(1, s.lunge.age / LUNGE_DUR) * Math.PI) * 7;
```

with:

```ts
      const f = hump(s.lunge.age / LUNGE_DUR) * 7;
```

- [ ] **Step 3: Typecheck.** Run:

```bash
cd /Users/jader/dev/tactics-game && npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 4: Full test suite, expect ZERO regressions.** Run:

```bash
cd /Users/jader/dev/tactics-game && npx vitest run
```

Expected: all tests pass (the full ~1552-test suite stays green — `battleView.ts` is render-side and not directly tested, so this proves no logic regression elsewhere). Note: `battleView.ts` is never imported by node tests, so the lunge change itself is exercised only by manual eyeball in Step 5.

- [ ] **Step 5: MANUAL VERIFY — lunge looks identical.** Start the dev server and watch an attack animation:

```bash
cd /Users/jader/dev/tactics-game && npm run dev
```

Open the app (drive system Edge/Brave via puppeteer-core per the repo's browser-verification flow), start a battle, and trigger a melee attack. Visual checklist:
  - [ ] The attacker lunges toward its target tile, then returns to its resting tile (one smooth out-and-back, no jump/teleport).
  - [ ] Peak lunge displacement is the same ~7px toward the target as before (sprite eases out and back, peaking mid-animation).
  - [ ] No flicker, no double-bounce, no residual offset after the lunge ends (sprite settles exactly on its tile).
  - [ ] Lunge direction still points at the target (diagonal lunges go diagonally, not axis-aligned).

- [ ] **Step 6: Commit.** Run:

```bash
cd /Users/jader/dev/tactics-game && git add src/scenes/battleView.ts && git commit -m "refactor(engine): lunge consumes tween.hump (provable no-op)"
```

---

### Task 0.4: Document why the renderer curves are LEFT alone (no code change)
**Files:** Read-only inspection of `src/engine/renderer.ts` (crit pop `:782`; sprite bob `:682`; arrow bob `:758`). This task adds clarifying comments only — no behavior change.

The audit flagged three renderer curves. After inspection, NONE map cleanly to a locked tween fn, so forcing them through the module would change their shape (a hidden feel change — forbidden). Record the reasoning inline so a future engineer doesn't "helpfully" retrofit them and break the feel.

- [ ] **Step 1: Annotate the crit pop curve.** At `src/engine/renderer.ts:780-782`, the curve is:

```ts
        // Crit popups read bigger and "pop": a brief overshoot scale at spawn that
        // settles to a still-larger-than-normal size, drawn from the popup's center.
        const pop = 1.5 + Math.max(0, 0.6 - t * 6);
```

Replace those three lines with the same code plus a NO-RETROFIT note (behavior unchanged — comment only):

```ts
        // Crit popups read bigger and "pop": a brief overshoot scale at spawn that
        // settles to a still-larger-than-normal size, drawn from the popup's center.
        // NOTE: ad-hoc clamped linear decay (floor at base scale 1.5), NOT a [0,1]
        // ease/hump — no clean tween.ts equivalent, so left inline on purpose.
        const pop = 1.5 + Math.max(0, 0.6 - t * 6);
```

- [ ] **Step 2: Annotate the sprite bob.** At `src/engine/renderer.ts:682`, the curve is:

```ts
    const bob = active ? Math.sin(time * 6) * 2 : 0;
```

Replace with the same code plus a note (behavior unchanged):

```ts
    // Continuous wall-clock oscillator (not a normalized [0,1] ease) → no clean
    // tween.ts equivalent; left inline on purpose.
    const bob = active ? Math.sin(time * 6) * 2 : 0;
```

- [ ] **Step 3: Annotate the active-arrow bob.** At `src/engine/renderer.ts:758` (in the active-indicator block, comment "Active indicator: bobbing arrow above the sprite." at `:756`), the curve is:

```ts
    const ab = Math.sin(time * 6) * 3;
```

Replace with the same code plus a note (behavior unchanged):

```ts
    // Continuous wall-clock oscillator (see sprite bob) — left inline on purpose.
    const ab = Math.sin(time * 6) * 3;
```

- [ ] **Step 4: Typecheck.** Run:

```bash
cd /Users/jader/dev/tactics-game && npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 5: Full test suite, expect ZERO regressions.** Run:

```bash
cd /Users/jader/dev/tactics-game && npx vitest run
```

Expected: all tests pass (comments only — no logic touched).

- [ ] **Step 6: MANUAL VERIFY — visuals unchanged.** With the dev server running (`npm run dev`), in a battle:
  - [ ] Crit damage popups still "pop" larger at spawn then settle (no change vs. before).
  - [ ] The active unit's sprite still gently bobs up/down.
  - [ ] The active-unit arrow indicator above the sprite still bobs.

- [ ] **Step 7: Commit.** Run:

```bash
cd /Users/jader/dev/tactics-game && git add src/engine/renderer.ts && git commit -m "docs(render): note why crit-pop/bob curves stay inline (no clean tween equiv)"
```

---

Verified against the real files at HEAD `fbb4c18`: `tests/camera.test.ts` style mirrored; `src/scenes/battleView.ts` accessibility import is line 12, lunge curve is line 161 (`Math.sin(Math.min(1, s.lunge.age / LUNGE_DUR) * Math.PI) * 7`); `src/engine/renderer.ts` crit pop is line 782, sprite bob line 682, arrow bob line 758. `vite.config.ts` confirms `environment:'node'`. Only the lunge maps cleanly to a locked fn (`hump`); the three renderer curves are ad-hoc/continuous oscillators with no clean equivalent and are deliberately left inline.

---

## Phase 1 — Hit feedback the player FEELS immediately

> Depends on Phase 0's `src/engine/tween.ts` (locked API: `easeOutQuad`, `clamp01`, `makeTween`, etc.).
> All tasks here are render/scene-side except Task 1.3's Camera math, which is PURE and TDD'd.
> Tasks 1.1, 1.2, 1.3, 1.5 are pure-additive; do them first. Task 1.4 (hit-stop) touches the hot `update(dt)` path — do it LAST with extra manual care.
>
> Ground truth re-verified against current files:
> - `src/scenes/battleScene.ts`: scene juice fields ~`:100-106`; `shakeScreen` `:1493-1497`; `pushPopup` `:1513-1559` (damage branch `:1524-1533`, crit calls `shakeScreen(1)` `:1528`, killed calls `shakeScreen(0.85)` `:1555`); `update(dt)` `:1594`, juice timer loops `:1622-1645`.
> - `src/scenes/battleView.ts`: `ViewScene` interface `:41-66`; `buildView` return `:109-128`; `computeScreenShake` `:132-137`; `computeUnitOffsets` `:140-167`; consts `:28-33`.
> - `src/engine/renderer.ts`: `BattleView` interface `:77-107`; `render()` `:188-203`; `drawScene` unit branch `:330-348`; `drawUnit` `:669-767`.
> - `src/engine/camera.ts`: `update(dt)` `:127-138`; `origin` getter `:141-143`; `scale` getter `:144`.
> - `HitResult` (`src/battle/combat.ts:12-21`): `{ unitId, kind, amount, crit, killed, revived, status? }`.

---

### Task 1.1: Hit-flash tint on the struck sprite

A white (gold on crit) tint flashed over the damaged unit's baked sprite, decaying over ~0.18s. It is a *tint, not motion* — but it's a sharp full-sprite strobe that can be uncomfortable, so we GATE it on `prefersReducedMotion()` (suppress when reduced motion is on). Mirror the existing `hitShake` Map in every layer. NEVER mutate the cached sprite canvas — composite onto the screen ctx per frame.

**Files:**
- Modify: `src/scenes/battleScene.ts` (field ~`:102`; set in `pushPopup` ~`:1517`; decay in `update` ~`:1635`)
- Modify: `src/scenes/battleView.ts` (`ViewScene` ~`:54`; new const ~`:28`; project into view ~`:121`)
- Modify: `src/engine/renderer.ts` (`BattleView` ~`:92`; pass through `drawScene` ~`:347`; render in `drawUnit` ~`:721`)

- [ ] **Step 1: Add the `hitFlash` Map field to BattleScene.** In `src/scenes/battleScene.ts`, directly under the `hitShake` line (`:102`):
  ```ts
  private hitFlash = new Map<string, number>(); // unitId -> seconds of hit-flash tint remaining
  ```

- [ ] **Step 2: Add the flash duration const + crit flag to `pushPopup`.** First add a duration const in `src/scenes/battleView.ts` right after `LUNGE_DUR` (`:29`):
  ```ts
  /** Seconds a per-sprite hit-flash tint lasts. */
  export const HIT_FLASH_DUR = 0.18;
  ```
  Then in `src/scenes/battleScene.ts`, import it: change the existing import line (`:49`)
  ```ts
  import { POPUP_COLORS, SHAKE_DUR, LUNGE_DUR, SCREEN_SHAKE_DUR, buildView } from "./battleView";
  ```
  to
  ```ts
  import { POPUP_COLORS, SHAKE_DUR, LUNGE_DUR, SCREEN_SHAKE_DUR, HIT_FLASH_DUR, buildView } from "./battleView";
  ```

- [ ] **Step 3: Set the flash in `pushPopup` next to `hitShake`.** In `src/scenes/battleScene.ts`, the line `:1517` currently reads:
  ```ts
    if (res.kind === "damage") this.hitShake.set(res.unitId, SHAKE_DUR);
  ```
  Replace with:
  ```ts
    if (res.kind === "damage") {
      this.hitShake.set(res.unitId, SHAKE_DUR);
      this.hitFlash.set(res.unitId, HIT_FLASH_DUR);
    }
  ```
  (Color is decided render-side from the popup's existing `crit` flag — but `hitFlash` is keyed by unit, not popup, so the renderer picks gold when the unit's frame is a crit. Simplest: store a signed value where crit is negative? No — KISS: store duration only and pass crit separately. See Step 4.)

- [ ] **Step 4: Store crit color cheaply.** YAGNI on a struct map. Encode crit by storing the duration but track crit in the SAME map via a second map would be over-engineering. Instead store a small object. Replace the Step 3 block with:
  ```ts
    if (res.kind === "damage") {
      this.hitShake.set(res.unitId, SHAKE_DUR);
      this.hitFlash.set(res.unitId, HIT_FLASH_DUR);
      if (res.crit) this.critFlash.add(res.unitId);
    }
  ```
  And add the companion set under the `hitFlash` field (`src/scenes/battleScene.ts`, below the Step 1 line):
  ```ts
  private critFlash = new Set<string>(); // unitIds whose current hit-flash is a crit (gold)
  ```

- [ ] **Step 5: Decay `hitFlash` in `update()` next to `hitShake`.** In `src/scenes/battleScene.ts`, after the `hitShake` decay loop (ends `:1639`), add:
  ```ts
      for (const [id, t] of this.hitFlash) {
        const left = t - dt;
        if (left <= 0) { this.hitFlash.delete(id); this.critFlash.delete(id); }
        else this.hitFlash.set(id, left);
      }
  ```

- [ ] **Step 6: Expose `hitFlash` + `critFlash` + `HIT_FLASH_DUR` on `ViewScene`.** In `src/scenes/battleView.ts`, in the `ViewScene` interface after `hitShake: Map<string, number>;` (`:54`):
  ```ts
    hitFlash: Map<string, number>;
    critFlash: Set<string>;
  ```

- [ ] **Step 7: Project a per-unit flash descriptor into the view.** In `src/scenes/battleView.ts`, add a builder function right after `computeUnitOffsets` (after `:167`):
  ```ts
  /** Per-unit hit-flash tint (white, gold on crit) that fades as the timer runs out.
   *  A tint, not motion — but a sharp strobe, so suppress it under reduced motion. */
  function computeUnitFlashes(s: ViewScene): Map<string, { color: string; a: number }> {
    const flashes = new Map<string, { color: string; a: number }>();
    if (prefersReducedMotion()) return flashes;
    for (const [id, remaining] of s.hitFlash) {
      const a = remaining / HIT_FLASH_DUR; // 1 -> 0
      const color = s.critFlash.has(id) ? "#ffd34d" : "#ffffff";
      flashes.set(id, { color, a });
    }
    return flashes;
  }
  ```

- [ ] **Step 8: Wire it into the `buildView` return.** In `src/scenes/battleView.ts`, in the return object after `unitOffsets: computeUnitOffsets(s),` (`:121`):
  ```ts
      unitFlashes: computeUnitFlashes(s),
  ```

- [ ] **Step 9: Add `unitFlashes` to `BattleView`.** In `src/engine/renderer.ts`, in the `BattleView` interface after the `unitOffsets` line (`:92`):
  ```ts
    /** Per-unit hit-flash tint overlay (color + alpha 1→0), keyed by unit id. */
    unitFlashes?: Map<string, { color: string; a: number }>;
  ```

- [ ] **Step 10: Pass the flash into `drawUnit`.** In `src/engine/renderer.ts`, the `drawUnit` call (`:347`) currently:
  ```ts
          this.drawUnit(it.unit, center, it.unit.id === view.activeUnitId, view.time, view.deathFade.get(it.unit.id), { x: fx, y: fy });
  ```
  Replace with:
  ```ts
          this.drawUnit(it.unit, center, it.unit.id === view.activeUnitId, view.time, view.deathFade.get(it.unit.id), { x: fx, y: fy }, { flash: view.unitFlashes?.get(it.unit.id) });
  ```

- [ ] **Step 11: Accept and render the flash in `drawUnit` (via an options object).** In `src/engine/renderer.ts`, extend the signature (`:669-676`) with a trailing OPTIONS object — later phases (walk hop in Task 3.3, status flash in Task 3.4) add fields to this SAME object instead of appending positional params, so the signature never drifts and never hits "required-after-optional". Change the closing of the param list (`:675-676`):
  ```ts
    facingDir: { x: number; y: number },
  ): void {
  ```
  to
  ```ts
    facingDir: { x: number; y: number },
    opts: { flash?: { color: string; a: number } } = {},
  ): void {
    const { flash } = opts;
  ```
  Add a reusable offscreen tint canvas as a `Renderer` field (avoids allocating a fresh canvas per flashed unit per frame). Near the other private render fields at the top of the `Renderer` class, add:
  ```ts
    /** Reusable offscreen for sprite tint passes (hit-flash). Resized on demand. */
    private tintCanvas = document.createElement("canvas");
  ```
  Then, immediately AFTER the live-sprite blit `ctx.drawImage(canvas, drawX, drawY);` (`:721`), add the tint composite:
  ```ts
    // Hit-flash tint: re-blit the cached sprite onto a REUSABLE offscreen, fill its
    // opaque pixels with the flash color (source-atop), then draw that tinted copy
    // back over the real sprite at the fade alpha. NEVER mutate the cached canvas.
    if (flash && flash.a > 0) {
      const tint = this.tintCanvas;
      if (tint.width !== w || tint.height !== h) { tint.width = w; tint.height = h; }
      const tctx = tint.getContext("2d")!;
      tctx.clearRect(0, 0, w, h);
      tctx.imageSmoothingEnabled = false;
      tctx.drawImage(canvas, 0, 0);
      tctx.globalCompositeOperation = "source-atop";
      tctx.fillStyle = flash.color;
      tctx.fillRect(0, 0, w, h);
      tctx.globalCompositeOperation = "source-over"; // reset for the next reuse
      ctx.globalAlpha = Math.min(1, flash.a) * 0.8;
      ctx.drawImage(tint, drawX, drawY);
      ctx.globalAlpha = 1;
    }
  ```

- [ ] **Step 12: tsc.** Run:
  ```
  npx tsc --noEmit
  ```
  Expected: no errors. (If it complains `hitFlash`/`critFlash` not on `ViewScene` for the runtime cast — they ARE on the class; the structural cast in `buildView` is `scene as unknown as ViewScene`, so no error.)

- [ ] **Step 13: vitest (logic regression check).** Run:
  ```
  npx vitest run
  ```
  Expected: all pass (~1552). Proves zero logic regression — none of these fields touch core/battle/data.

- [ ] **Step 14: MANUAL VERIFY.** Launch the app (drive system Edge/Brave via puppeteer-core per the repo convention) and:
  - Attack an enemy with a normal hit → the struck sprite flashes WHITE for a beat (~0.18s) then returns to normal, sprite art intact (no permanent discoloration on subsequent frames — proves the cached canvas wasn't mutated).
  - Land a crit → the flash is GOLD, not white.
  - Toggle reduced motion ON, attack again → NO flash (gated). Sprite still takes damage normally.
  - Attack the same unit twice quickly → flash re-arms each hit.

- [ ] **Step 15: Commit.**
  ```
  git add -A && git commit -m "feat(juice): hit-flash tint on struck sprite (gold on crit, reduced-motion gated)"
  ```

---

### Task 1.2: Single-frame impact flash overlay

A brief full-screen color wash on emphatic hits: WHITE on crit, soft RED (`rgba(255,40,40,...)`) when a *player* unit takes damage. Stored as `scene.flash = { color, t }`, set next to the `shakeScreen` calls, projected into the view gated by `prefersReducedMotion()` (mirroring `computeScreenShake`), and drawn as one `fillRect` over the whole canvas AFTER `ctx.restore()` so it isn't shaken/scaled with the scene.

**Files:**
- Modify: `src/scenes/battleScene.ts` (field ~`:105`; set in `pushPopup` ~`:1528`/`:1555`; decay in `update` ~`:1645`)
- Modify: `src/scenes/battleView.ts` (`ViewScene` ~`:57`; const ~`:31`; project into view ~`:125`)
- Modify: `src/engine/renderer.ts` (`BattleView` ~`:100`; draw in `render()` ~`:202`)

- [ ] **Step 1: Add the `flash` field + duration const.** In `src/scenes/battleView.ts` after `SCREEN_SHAKE_DUR` (`:31`):
  ```ts
  /** Seconds a full-screen impact flash lasts. */
  export const FLASH_DUR = 0.12;
  ```
  Import it in `src/scenes/battleScene.ts` — extend the `:49` import to also pull `FLASH_DUR`:
  ```ts
  import { POPUP_COLORS, SHAKE_DUR, LUNGE_DUR, SCREEN_SHAKE_DUR, HIT_FLASH_DUR, FLASH_DUR, buildView } from "./battleView";
  ```
  Add the field in `src/scenes/battleScene.ts` under `screenShake` (`:105`):
  ```ts
  private flash: { color: string; t: number } | null = null; // full-screen impact flash
  ```

- [ ] **Step 2: Add a `fireFlash` helper next to `shakeScreen`.** In `src/scenes/battleScene.ts`, right after `shakeScreen` (after `:1497`):
  ```ts
  /** Kick off a brief full-screen color wash (impact flash). Keeps the strongest
   *  pending flash if one is already running. */
  private fireFlash(color: string): void {
    if (!this.flash || this.flash.t < FLASH_DUR) this.flash = { color, t: FLASH_DUR };
  }
  ```

- [ ] **Step 3: Fire WHITE flash on crit.** In `src/scenes/battleScene.ts`, the crit branch in `pushPopup` (`:1525-1529`) currently:
  ```ts
          if (res.crit) {
            sfx.playCrit();
            // Crits punch: jolt the screen and tag the popup for emphatic rendering.
            this.shakeScreen(1);
            crit = true;
          } else sfx.playHit();
  ```
  Replace with:
  ```ts
          if (res.crit) {
            sfx.playCrit();
            // Crits punch: jolt the screen, wash white, and tag the popup for emphatic rendering.
            this.shakeScreen(1);
            this.fireFlash("rgba(255,255,255,1)");
            crit = true;
          } else sfx.playHit();
  ```

- [ ] **Step 4: Fire soft-RED flash when a PLAYER unit takes damage.** In the same `damage` branch, the `target` is already resolved at the top of `pushPopup` (`const target = this.units.find(...)`, `:1514`). After the crit/non-crit block above (right before `text = ...`, `:1531`), add:
  ```ts
          if (target.team === "player") this.fireFlash("rgba(255,40,40,0.9)");
  ```

- [ ] **Step 5: Decay `flash` in `update()`.** In `src/scenes/battleScene.ts`, right after the `screenShake` decay line (`:1645`):
  ```ts
      if (this.flash) {
        this.flash.t -= dt;
        if (this.flash.t <= 0) this.flash = null;
      }
  ```

- [ ] **Step 6: Expose on `ViewScene`.** In `src/scenes/battleView.ts`, in `ViewScene` after `screenShake: number;` (`:57`):
  ```ts
    /** Active full-screen impact flash (null = none). */
    flash: { color: string; t: number } | null;
  ```

- [ ] **Step 7: Project the flash into the view (reduced-motion gated).** In `src/scenes/battleView.ts`, add a builder after `computeScreenShake` (after `:137`):
  ```ts
  /** Full-screen impact flash alpha that fades over FLASH_DUR. Suppressed under
   *  reduced motion (a sudden full-screen strobe is exactly what that setting kills). */
  function computeFlash(s: ViewScene): { color: string; a: number } | undefined {
    if (!s.flash || prefersReducedMotion()) return undefined;
    return { color: s.flash.color, a: Math.max(0, s.flash.t / FLASH_DUR) };
  }
  ```
  Import `FLASH_DUR` is unneeded here (defined in this same file). Then wire into the `buildView` return after `screenShake: computeScreenShake(s),` (`:125`):
  ```ts
      flash: computeFlash(s),
  ```

- [ ] **Step 8: Add `flash` to `BattleView`.** In `src/engine/renderer.ts`, in `BattleView` after the `screenShake` line (`:100`):
  ```ts
    /** Full-screen impact flash overlay (color + alpha 1→0). Drawn un-transformed. */
    flash?: { color: string; a: number };
  ```

- [ ] **Step 9: Draw the flash AFTER `ctx.restore()` in `render()`.** In `src/engine/renderer.ts`, `render()` ends (`:202`):
  ```ts
      if (transformed) this.ctx.restore();
    }
  ```
  Replace with:
  ```ts
      if (transformed) this.ctx.restore();
      // Impact flash sits in screen space (NOT inside the shake/scale transform),
      // so it washes the whole canvas uniformly regardless of camera juice.
      const fl = view.flash;
      if (fl && fl.a > 0) {
        const ctx = this.ctx;
        const [base, alpha] = fl.color.startsWith("rgba")
          ? [fl.color.slice(0, fl.color.lastIndexOf(",")), parseFloat(fl.color.slice(fl.color.lastIndexOf(",") + 1, -1))]
          : [fl.color, 1];
        ctx.save();
        ctx.globalAlpha = fl.a * alpha;
        ctx.fillStyle = fl.color.startsWith("rgba") ? `${base},1)` : base;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
      }
    }
  ```
  (Parsing the trailing rgba alpha lets the red flash stay capped softer than the crit white. KISS: the color string carries its own peak alpha; `fl.a` is the fade envelope.)

- [ ] **Step 10: tsc.** Run `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 11: vitest.** Run `npx vitest run` — expected: all pass.

- [ ] **Step 12: MANUAL VERIFY.** In the running app:
  - Crit an enemy → a quick WHITE wash over the entire viewport (one beat, ~0.12s) on top of the screen shake. It should NOT scale/jitter with the shake (it covers the full canvas edge-to-edge).
  - Let an ENEMY hit one of YOUR units (end turn, let AI attack) → a soft RED wash. Normal player-on-enemy non-crit hit → NO red wash (only player-takes-damage triggers red).
  - Reduced motion ON → no flash at all.

- [ ] **Step 13: Commit.**
  ```
  git add -A && git commit -m "feat(juice): full-screen impact flash (white crit / red player-hit), reduced-motion gated"
  ```

---

### Task 1.3: Punch-zoom on crits/kills (PURE Camera math — TDD)

A transient center-anchored zoom pulse on the camera. The Camera's `effectiveZoom()` momentarily exceeds the base `zoom`, then decays back over `PULSE_DUR`. Crucially, BOTH the `origin` and `scale` getters must use `effectiveZoom()` so the bump zooms about the viewport CENTER (not the map origin). The clamp/pan/zoom math keeps using the base `this.zoom`. This is pure math → full TDD against `tests/camera.test.ts` style.

**Files:**
- Test: `tests/camera.test.ts` (append a `describe`)
- Modify: `src/engine/camera.ts` (consts ~`:16`; fields ~`:29-31`; new `pulse()` + `effectiveZoom()`; `update` ~`:127`; `origin`/`scale` getters `:141-144`)

- [ ] **Step 1: Write the FAILING test first.** Append to `tests/camera.test.ts`:
  ```ts
  describe("Camera punch-zoom pulse", () => {
    const g = gridOf(16, 16, 3);

    it("bumps scale above base right after pulse(), then decays back to base", () => {
      const cam = new Camera(VP);
      cam.reset(g, 0);
      const base = cam.scale;
      cam.pulse();
      cam.update(0.001); // tiny advance: pulse near peak
      expect(cam.scale).toBeGreaterThan(base);
      // After PULSE_DUR has fully elapsed, scale returns to base.
      cam.update(0.2);
      expect(cam.scale).toBeCloseTo(base, 9);
    });

    it("keeps the origin consistent with the bumped scale (center-anchored)", () => {
      const cam = new Camera(VP);
      cam.reset(g, 0);
      // The point that maps to the viewport center must stay the viewport center
      // through the pulse: screenCenter = (vw/2/scale - origin.sx) * scale ... i.e.
      // vw/2 - origin.sx*scale is invariant. Verify origin*scale stays put.
      const before = { x: cam.origin.sx * cam.scale, y: cam.origin.sy * cam.scale };
      cam.pulse();
      cam.update(0.001);
      const after = { x: cam.origin.sx * cam.scale, y: cam.origin.sy * cam.scale };
      // origin.sx*scale = vw/2 - center.sx*effZoom ; center.sx unchanged, effZoom up,
      // so this shifts — that shift is exactly what re-centers the zoom on the middle.
      // The invariant we assert: the viewport-center world point is unchanged.
      // world_at_center = center.sx (by construction), independent of zoom:
      const worldCenterBefore = VP.w / 2 / cam.scale - cam.origin.sx;
      cam.update(0.2); // decay back
      const worldCenterAfter = VP.w / 2 / cam.scale - cam.origin.sx;
      expect(worldCenterAfter).toBeCloseTo(worldCenterBefore, 6);
      void before; void after;
    });

    it("settled pulse leaves scale exactly at base (no drift across many pulses)", () => {
      const cam = new Camera(VP);
      cam.reset(g, 0);
      const base = cam.scale;
      for (let i = 0; i < 5; i++) { cam.pulse(); cam.update(0.3); }
      expect(cam.scale).toBeCloseTo(base, 9);
    });
  });
  ```
  Run:
  ```
  npx vitest run tests/camera.test.ts
  ```
  Expected: FAIL — `cam.pulse is not a function`.

- [ ] **Step 2: Add the pulse consts.** In `src/engine/camera.ts`, after `export const MAX_ZOOM = 2.5;` (`:16`):
  ```ts
  /** Punch-zoom pulse: how long a crit/kill zoom bump lasts (s) and its peak
   *  fraction of base zoom (0.06 = +6% at the punch's apex). Center-anchored. */
  export const PULSE_DUR = 0.18;
  export const PULSE_MAG = 0.06;
  ```

- [ ] **Step 3: Add the pulse state fields.** In `src/engine/camera.ts`, after `private zoom = 1;` (`:29`):
  ```ts
    private pulseT = 0;        // seconds remaining in the current zoom pulse (0 = none)
    private pulseStrength = 0; // 0..1 scale on PULSE_MAG for this pulse
  ```

- [ ] **Step 4: Add `pulse()` + `effectiveZoom()`.** Also import `easeOutQuad`/`clamp01` from the Phase 0 tween module. Add to the import block at the TOP of `src/engine/camera.ts` (after the existing imports, before `const FRAME_NUDGE`):
  ```ts
  import { easeOutQuad, clamp01 } from "./tween";
  ```
  Then add these methods right before the `// ---- outputs ----` comment (`:140`):
  ```ts
    // ---- transient punch-zoom (center-anchored) ----
    /** Fire a brief zoom-in punch that decays over PULSE_DUR. strength scales PULSE_MAG. */
    pulse(strength = 1): void {
      this.pulseT = PULSE_DUR;
      this.pulseStrength = clampNum(strength, 0, 1);
    }
    /** Display zoom = base zoom + a decaying punch. Peaks right after pulse() then
     *  eases to 0. Only the getters use this; clamp/pan/zoom math use base this.zoom. */
    private effectiveZoom(): number {
      const f = easeOutQuad(clamp01(this.pulseT / PULSE_DUR));
      return this.zoom * (1 + f * PULSE_MAG * this.pulseStrength);
    }
  ```

- [ ] **Step 5: Decay the pulse in `update(dt)`.** In `src/engine/camera.ts`, `update` starts (`:127`):
  ```ts
    update(dt: number): void {
      const c0 = this.center;
  ```
  Insert the pulse decay as the FIRST statement:
  ```ts
    update(dt: number): void {
      if (this.pulseT > 0) this.pulseT = Math.max(0, this.pulseT - dt);
      const c0 = this.center;
  ```

- [ ] **Step 6: Make BOTH getters use `effectiveZoom()`.** In `src/engine/camera.ts`, the getters (`:141-144`):
  ```ts
    get origin(): ScreenPoint {
      return { sx: this.vw / 2 / this.zoom - this.center.sx, sy: this.vh / 2 / this.zoom - this.center.sy };
    }
    get scale(): number { return this.zoom; }
  ```
  Replace with:
  ```ts
    get origin(): ScreenPoint {
      const z = this.effectiveZoom();
      return { sx: this.vw / 2 / z - this.center.sx, sy: this.vh / 2 / z - this.center.sy };
    }
    get scale(): number { return this.effectiveZoom(); }
  ```
  (Because the world point at the viewport center is `vw/2/z - origin.sx = center.sx` independent of `z`, scaling about `z` keeps the center fixed → center-anchored punch. This is exactly what the Step 1 test asserts.)

- [ ] **Step 7: Run the test — expect PASS.**
  ```
  npx vitest run tests/camera.test.ts
  ```
  Expected: the new `Camera punch-zoom pulse` describe passes AND the existing boot-parity / origin tests still pass (they read `cam.scale`/`cam.origin` with `pulseT=0`, where `effectiveZoom() === this.zoom`).

- [ ] **Step 8: Call `cam.pulse()` where crit/death fire `shakeScreen`.** In `src/scenes/battleScene.ts`:
  - In the crit branch (right after `this.shakeScreen(1);`, `:1528`):
    ```ts
          this.cam.pulse(1);
    ```
  - In the killed branch (right after `this.shakeScreen(0.85);`, `:1555`):
    ```ts
        this.cam.pulse(0.85);
    ```

- [ ] **Step 9: tsc + full vitest.** Run:
  ```
  npx tsc --noEmit
  npx vitest run
  ```
  Expected: no tsc errors; all tests pass.

- [ ] **Step 10: MANUAL VERIFY.** In the running app:
  - Crit an enemy → the whole view briefly punches in (~+6%) and settles back — the impact "snaps" toward the action. The zoom recenters on the VIEWPORT MIDDLE (the map doesn't slide sideways during the punch).
  - Kill a unit → a slightly softer punch.
  - Pan/zoom manually afterward → still smooth; no residual zoom drift (the pulse fully decays, base zoom unchanged).
  - Reduced motion: the punch is camera juice; it is NOT gated here (the locked design only gates flashes/shakes). Confirm it still fires — that's intended. (If a later playtest finds it nauseating, gate the `cam.pulse(...)` call sites, not the math.)

- [ ] **Step 11: Commit.**
  ```
  git add -A && git commit -m "feat(juice): center-anchored punch-zoom on crit/kill (pure Camera.pulse, TDD)"
  ```

---

### Task 1.5: Damage-scaled shake amplitude

Thread a `magnitude` (0..1, `≈ amount/maxHp`) through `shakeScreen` so a heavy blow shakes harder than chip damage. Store it alongside the timer, and multiply `SCREEN_SHAKE_AMP` by it in `computeScreenShake` with a FLOOR so even small hits still register. (Doing 1.5 before 1.4 per the ordering — pure-additive, doesn't touch the hot freeze path.)

**Files:**
- Modify: `src/scenes/battleScene.ts` (`shakeScreen` `:1493-1497`; field ~`:105`; call sites `:899`,`:1528`,`:1555`; decay `:1645`)
- Modify: `src/scenes/battleView.ts` (`ViewScene` ~`:57`; `computeScreenShake` `:132-137`)
- Modify: `src/engine/renderer.ts` — no change (it consumes `{dx,dy}`).

- [ ] **Step 1: Add a `shakeMag` field.** In `src/scenes/battleScene.ts`, under `screenShake` (`:105`, next to the Task 1.2 `flash` field):
  ```ts
  private shakeMag = 1; // 0..1 amplitude scale for the active screen shake
  ```

- [ ] **Step 2: Give `shakeScreen` an optional `magnitude` arg.** In `src/scenes/battleScene.ts`, replace `shakeScreen` (`:1493-1497`):
  ```ts
    /** Kick off (or refresh) the whole-scene impact shake. `strength` 0..1 scales
     *  how long it rings; full strength for the most emphatic hits. */
    private shakeScreen(strength = 1): void {
      this.screenShake = Math.max(this.screenShake, SCREEN_SHAKE_DUR * strength);
    }
  ```
  with:
  ```ts
    /** Kick off (or refresh) the whole-scene impact shake. `strength` 0..1 scales
     *  how long it rings; `magnitude` 0..1 scales the amplitude (heavy hits jolt
     *  harder). Floored render-side so chip damage still registers. */
    private shakeScreen(strength = 1, magnitude = 1): void {
      // A bigger incoming shake claims the amplitude; refreshes also re-arm the timer.
      if (this.screenShake <= 0 || magnitude >= this.shakeMag) this.shakeMag = magnitude;
      this.screenShake = Math.max(this.screenShake, SCREEN_SHAKE_DUR * strength);
    }
  ```

- [ ] **Step 3: Pass magnitude from the damage call sites.** In `src/scenes/battleScene.ts`, the damage branch of `pushPopup` resolves `target` (`:1514`). Compute a normalized magnitude once and pass it. In the crit branch, change (`:1528`, now also has `this.cam.pulse(1)` from Task 1.3):
  ```ts
          this.shakeScreen(1);
  ```
  to:
  ```ts
          this.shakeScreen(1, Math.max(0.35, Math.min(1, res.amount / target.stats.maxHp)));
  ```
  And the killed branch (`:1555`):
  ```ts
        this.shakeScreen(0.85);
  ```
  to:
  ```ts
        this.shakeScreen(0.85, 1); // a kill always lands at full weight
  ```
  Leave the counter shake at `:899` (`this.shakeScreen(0.5);`) as-is — it uses the default `magnitude = 1`, which is fine (a counter is a full hit landing).

- [ ] **Step 4: Reset `shakeMag` when the shake ends.** In `src/scenes/battleScene.ts`, the decay line (`:1645`):
  ```ts
      if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt);
  ```
  Replace with:
  ```ts
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - dt);
        if (this.screenShake === 0) this.shakeMag = 1;
      }
  ```

- [ ] **Step 5: Expose `shakeMag` on `ViewScene`.** In `src/scenes/battleView.ts`, in `ViewScene` after `screenShake: number;` (`:57`, next to the Task 1.2 `flash` field):
  ```ts
    /** 0..1 amplitude scale for the active screen shake (heavier hits shake more). */
    shakeMag: number;
  ```

- [ ] **Step 6: Apply the magnitude (with floor) in `computeScreenShake`.** In `src/scenes/battleView.ts`, `computeScreenShake` (`:132-137`):
  ```ts
  function computeScreenShake(s: ViewScene): { dx: number; dy: number } | undefined {
    // Whole-scene shake is the most disorienting juice — suppress it for reduced motion.
    if (s.screenShake <= 0 || prefersReducedMotion()) return undefined;
    const amp = (s.screenShake / SCREEN_SHAKE_DUR) * SCREEN_SHAKE_AMP;
    return { dx: Math.sin(s.time * 90) * amp, dy: Math.cos(s.time * 78) * amp * 0.6 };
  }
  ```
  Replace the `amp` line with:
  ```ts
    // Floor at 0.4 so chip damage still produces a felt jolt; full hits go to 1.0.
    const mag = Math.max(0.4, s.shakeMag);
    const amp = (s.screenShake / SCREEN_SHAKE_DUR) * SCREEN_SHAKE_AMP * mag;
  ```

- [ ] **Step 7: tsc + vitest.** Run:
  ```
  npx tsc --noEmit
  npx vitest run
  ```
  Expected: no tsc errors; all pass.

- [ ] **Step 8: MANUAL VERIFY.** In the running app:
  - Land a big crit that takes a large chunk of the target's HP → noticeably stronger shake than...
  - ...a small chip crit on a high-maxHp tank → still shakes (floor holds) but visibly gentler.
  - A kill → full-weight shake regardless of overkill amount.
  - Reduced motion ON → no shake (unchanged gating).

- [ ] **Step 9: Commit.**
  ```
  git add -A && git commit -m "feat(juice): scale screen-shake amplitude by damage fraction with a chip-damage floor"
  ```

---

### Task 1.4: Hit-stop (LAST — touches the hot update path)

A momentary freeze (~0.06–0.09s, hard-capped < 0.12s) on crit/kill so the impact "bites" before motion resumes. Implemented at the TOP of `update(dt)`: while `hitStop > 0`, decrement it by REAL `dt` and feed `dt = 0` to the animator + juice timers so the visual frame freezes — but the freeze is bounded by the cap, so turn-flow promises resume immediately after.

**THREADING NOTE — read before implementing.** The cap (< 0.12s) is the whole safety story. `this.ctx.animator.update(dt)` (`:1596`) advances tween-style move/attack animations; if those drive promise resolution for turn flow, feeding `dt = 0` *pauses* them — but only for ≤ ~2 frames. Hit-stop must touch ONLY: `animator.update`, the popup/effect age loops, the juice timers (`hitShake`, `deaths`, `lunge`, `screenShake`, `hitFlash`, `flash`), and the camera. It must NOT zero `dt` for `this.time` (used as the global render clock — keep it real so terrain/water shimmer doesn't stutter), nor for input/hover handling, nor anything that gates a turn from EVER advancing. Because `hitStop` decays by REAL `dt` and is capped, every frozen path is guaranteed to receive real `dt` again within < 0.12s — no promise can stall beyond the cap.

**Files:**
- Modify: `src/scenes/battleScene.ts` (field ~`:105`; set in `pushPopup` crit/kill; `update` top `:1594-1596` + juice loop `:1622-1645`)

- [ ] **Step 1: Add the `hitStop` field + cap const.** In `src/scenes/battleScene.ts`, under the other juice fields (`:105`, near `flash`/`shakeMag`):
  ```ts
  private hitStop = 0; // seconds of frame-freeze remaining (impact bite)
  ```
  And add a module-level cap const near the top of the file (next to where other scene consts live — e.g. just before the class, or reuse an existing const block). Add:
  ```ts
  /** Hard cap on hit-stop so a freeze can never stall turn flow (s). */
  const HIT_STOP_CAP = 0.12;
  ```

- [ ] **Step 2: Add a `freeze` helper next to `shakeScreen`.** In `src/scenes/battleScene.ts`, after `fireFlash` (Task 1.2):
  ```ts
  /** Request a brief frame-freeze (impact bite). Clamped under HIT_STOP_CAP so it
   *  can never stall the turn-flow animator beyond a couple frames. */
  private freeze(seconds: number): void {
    this.hitStop = Math.min(HIT_STOP_CAP, Math.max(this.hitStop, seconds));
  }
  ```

- [ ] **Step 3: Trigger freeze on crit + kill.** In `src/scenes/battleScene.ts` `pushPopup`:
  - In the crit branch (after `this.cam.pulse(1);`, `:1528` area):
    ```ts
          this.freeze(0.06);
    ```
  - In the killed branch (after `this.cam.pulse(0.85);`, `:1555` area):
    ```ts
        this.freeze(0.09); // a kill bites a touch longer
    ```

- [ ] **Step 4: Apply hit-stop at the TOP of `update(dt)`.** In `src/scenes/battleScene.ts`, `update` (`:1594-1596`):
  ```ts
    update(dt: number): void {
      this.time += dt;
      this.ctx.animator.update(dt);
  ```
  Replace with:
  ```ts
    update(dt: number): void {
      this.time += dt; // global render clock stays REAL (terrain shimmer must not stutter)
      // Hit-stop: while frozen, feed dt=0 to the animator + juice timers so the frame
      // bites. hitStop decays by REAL dt and is capped < HIT_STOP_CAP, so every frozen
      // path resumes within ~2 frames — no turn-flow promise can stall.
      let jdt = dt;
      if (this.hitStop > 0) {
        this.hitStop = Math.max(0, this.hitStop - dt);
        jdt = 0;
      }
      this.ctx.animator.update(jdt);
  ```

- [ ] **Step 5: Feed `jdt` (not `dt`) to the juice timers + camera + popups/effects.** The cleanest KISS move: the camera and juice should freeze too. In `src/scenes/battleScene.ts`:
  - The camera advance `this.cam.update(dt);` (`:1618`) → `this.cam.update(jdt);` (so the punch-zoom pulse from Task 1.3 also holds at its apex during the freeze, which looks great).
  - The popup age loop (`:1623`) `this.popups[i].age += dt;` → `+= jdt;`
  - The effect age loop (`:1630`) `e.age += dt;` → `+= jdt;`
  - The `hitShake` decay loop (`:1636`) `const left = t - dt;` → `const left = t - jdt;`
  - The Task 1.1 `hitFlash` decay loop `const left = t - dt;` → `const left = t - jdt;`
  - The `deaths` loop (`:1640`) `this.deaths.set(id, age + dt);` → `age + jdt`
  - The `lunge` advance (`:1642`) `this.lunge.age += dt;` → `+= jdt;`
  - The `screenShake` decay (Task 1.5 block at `:1645`) `this.screenShake - dt` → `this.screenShake - jdt`
  - The Task 1.2 `flash` decay `this.flash.t -= dt;` → `this.flash.t -= jdt;`

  Leave hover/input handling (`:1648` onward) on REAL `dt`/real pointer — never freeze input.

  > NOTE: the held-key pan block (`:1601-1611`) uses `dt` for `panBy`. During a ≤0.12s freeze it's harmless either way; leave it on real `dt` (panning is direct player input, not impact juice). Only the *follow* + `cam.update` path needs to hold.

- [ ] **Step 6: tsc + vitest.** Run:
  ```
  npx tsc --noEmit
  npx vitest run
  ```
  Expected: no tsc errors; all ~1552 pass. (Hit-stop lives entirely in the scene's render-loop; no core/battle/data logic is touched, so headless tests prove no regression.)

- [ ] **Step 7: MANUAL VERIFY (extra care — hot path).** In the running app:
  - Land a crit → a tiny but perceptible freeze (~1–2 frames) at the moment of impact; the punch-zoom holds at its apex during the freeze, then everything resumes smoothly. Combat then CONTINUES normally (turn passes, next action resolves) — confirm no hang.
  - Kill a unit → a slightly longer bite, then the death fade + screen shake play out and the turn proceeds.
  - Chain several crits/kills in one turn (e.g. an AoE that kills multiple) → freezes don't accumulate into a stall (each `freeze` clamps at `HIT_STOP_CAP`; back-to-back hits just re-arm a single ≤0.12s freeze). The battle must never lock up.
  - Watch the water/lava terrain shimmer DURING a freeze → it keeps animating (proves `this.time` stayed on real `dt`).
  - Reduced motion: hit-stop is a freeze, not motion-amplitude; it's not jarring strobe/shake. Leave it ON under reduced motion (it actually *reduces* motion). Confirm it still fires — intended.

- [ ] **Step 8: Commit.**
  ```
  git add -A && git commit -m "feat(juice): capped hit-stop freeze on crit/kill (real-dt clock + bounded turn-flow threading)"
  ```

---

## Phase 2 — Turn rhythm & state-change punctuation

These are all DOM/CSS + one scene-level side-flip check. None of the touched files (`src/ui/battleUI.ts`, `src/ui/styles.ts`, `src/scenes/battleScene.ts`, `src/scenes/sceneManager.ts`, `src/main.ts`) are imported by the node-env vitest suite, so there are NO new unit tests here EXCEPT Task 2.1a, which extracts the pure side-flip predicate so it CAN be unit-tested. Verification for the render/DOM tasks is: `npx tsc --noEmit` (no errors) + `npx vitest run` (all ~1552 pass — proves zero logic regression) + a manual eyeball checklist. Every new motion is gated on `prefersReducedMotion()` (canvas/scene juice) or the `.reduced-motion` CSS overrides (DOM/CSS).

Verified anchors at time of writing (re-confirm before editing — line numbers drift):
- `src/scenes/battleScene.ts`: `private active: Unit | null` @ :87; `private cam: Camera` @ :72; `beginNextTurn()` @ :335 (sets `this.active = advanceToNextActor(...)` @ :342, returns early @ :343); `runEnemyTurn()` think-wait `await this.ctx.animator.wait(0.35)` @ :1396; `refreshTurnBar()` @ :1576; `dispose()` @ :1669. battleScene does NOT yet import `prefersReducedMotion`.
- `src/ui/battleUI.ts`: imports `prefersReducedMotion` @ :6, `el, clear` @ :12; `setTurnOrder` @ :190-226; `showBanner`/`hideBanner` @ :523-535; `hideLevelUp` @ :691-694; `hideRewards` @ :773-776.
- `src/ui/styles.ts`: `@keyframes card-rise` @ :246; reduced-motion modal block @ :353-354; main `.reduced-motion` overrides @ :664-677; CSS string closes with a backtick @ :678; `injectStyles()` @ :683.
- `src/scenes/sceneManager.ts`: `change()` @ :34-37 (synchronous `dispose()` then assign).
- `src/main.ts`: `app` resolved @ :18, `manager` @ :28, loop wiring @ :71.
- `src/core/types.ts`: `export type Team = "player" | "enemy"` @ :3.

---

### Task 2.1a: Extract the pure side-flip predicate (TDD)
**Files:** Create `src/scenes/turnRhythm.ts`; Create `tests/turnRhythm.test.ts`

A "phase banner" should fire only when the acting team changes from the previous actor's team. That decision is pure scalar logic, so extract it and unit-test it (it lives in `src/scenes` which node tests CAN import — it pulls in no render code; it imports only the `Team` type).

- [ ] **Step 1: Write the failing test.** Create `tests/turnRhythm.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { teamFlipped } from "../src/scenes/turnRhythm";

  describe("teamFlipped", () => {
    it("is true on the very first actor (no previous team)", () => {
      expect(teamFlipped(null, "player")).toBe(true);
      expect(teamFlipped(null, "enemy")).toBe(true);
    });
    it("is false when the same team acts again", () => {
      expect(teamFlipped("player", "player")).toBe(false);
      expect(teamFlipped("enemy", "enemy")).toBe(false);
    });
    it("is true when control passes to the other team", () => {
      expect(teamFlipped("player", "enemy")).toBe(true);
      expect(teamFlipped("enemy", "player")).toBe(true);
    });
  });
  ```
- [ ] **Step 2: Run the test, expect FAIL.** Run `npx vitest run tests/turnRhythm.test.ts`. Expected: fails to resolve `../src/scenes/turnRhythm` (module not found) — confirms the test drives the new module.
- [ ] **Step 3: Implement the pure module.** Create `src/scenes/turnRhythm.ts`:
  ```ts
  import type { Team } from "../core/types";

  /**
   * Whether a "Player Phase / Enemy Phase" banner should sweep in for the actor
   * about to take its turn. True on the first actor of the battle (prev = null)
   * and whenever control passes to the opposite team.
   */
  export function teamFlipped(prev: Team | null, next: Team): boolean {
    return prev !== next;
  }
  ```
- [ ] **Step 4: Run the test, expect PASS.** Run `npx vitest run tests/turnRhythm.test.ts`. Expected: 3 tests pass.
- [ ] **Step 5: Commit.** Run `git add -A && git commit -m "feat(juice): pure teamFlipped predicate for phase-banner gating"`.

---

### Task 2.1b: Player/Enemy Phase banner sweep (CSS)
**Files:** Modify `src/ui/styles.ts` (append keyframes + classes before the CSS-closing backtick @ ~:678)

A full-width strip that slides in from the left, holds, and slides out. CSS-only animation here; the JS trigger is Task 2.1c. Add to the `.ui-layer` stacking so it sits above panels but below banners.

- [ ] **Step 1: Read the tail of the CSS string** to confirm the closing backtick location. Run `npx vitest run tests/maps.test.ts` is NOT needed — instead Read `src/ui/styles.ts` around :660-689 to confirm the `.reduced-motion` block ends at :677 and the backtick closes at :678.
- [ ] **Step 2: Insert the phase-banner CSS** immediately before the line that is exactly `` ` `` closing the `CSS` template (currently @ :678). Paste:
  ```css
/* Player/Enemy Phase sweep — a full-width strip that slides in, holds, slides out.
   The element is added/removed by BattleUI.showPhaseBanner; the keyframe owns the
   whole in/hold/out timeline so JS only has to insert it and clean up on animationend. */
.phase-banner {
  position: absolute; left: 0; right: 0; top: 38%;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
  padding: 14px 0;
  font-family: var(--font-display); font-weight: 700;
  font-size: calc(34px * var(--ui-scale)); letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--ink);
  animation: phase-sweep 1.05s cubic-bezier(0.2,0.8,0.2,1) both;
}
.phase-banner.player {
  background: linear-gradient(90deg, transparent, rgba(70,120,220,0.32) 22%, rgba(70,120,220,0.32) 78%, transparent);
  text-shadow: 0 2px 12px rgba(70,120,220,0.6);
}
.phase-banner.enemy {
  background: linear-gradient(90deg, transparent, rgba(220,70,70,0.32) 22%, rgba(220,70,70,0.32) 78%, transparent);
  text-shadow: 0 2px 12px rgba(220,70,70,0.6);
}
@keyframes phase-sweep {
  0%   { transform: translateX(-12%); opacity: 0; }
  18%  { transform: translateX(0);    opacity: 1; }
  72%  { transform: translateX(0);    opacity: 1; }
  100% { transform: translateX(12%);  opacity: 0; }
}
/* Reduced motion: show a static, instantly-fading label instead of the slide. */
.reduced-motion .phase-banner { animation: phase-static 0.7s linear both; }
@keyframes phase-static { 0%,82% { opacity: 1; transform: none; } 100% { opacity: 0; transform: none; } }
  ```
- [ ] **Step 3: Typecheck.** Run `npx tsc --noEmit`. Expected: no output (no errors).
- [ ] **Step 4: Full regression.** Run `npx vitest run`. Expected: all suites pass (the CSS string is inert to node tests).
- [ ] **Step 5: Commit.** Run `git add -A && git commit -m "feat(juice): phase-banner sweep keyframes + reduced-motion fallback"`.

---

### Task 2.1c: `showPhaseBanner` method on BattleUI
**Files:** Modify `src/ui/battleUI.ts` (add a field in the constructor near :47-100; add the method near the banner methods @ ~:535)

A self-cleaning DOM strip. It reuses one element, restarts the animation on each call, and removes itself on `animationend` (with a timeout fallback so it never leaks).

- [ ] **Step 1: Declare the field.** In the class field block (the `private ...El: HTMLDivElement;` cluster @ :47-53), after `private bannerEl: HTMLDivElement;` (@ :47) add:
  ```ts
  private phaseBannerEl: HTMLDivElement;
  ```
- [ ] **Step 2: Create the element in the constructor.** After the line `this.bannerEl = el("div", { className: "banner" });` (@ :72) add:
  ```ts
    this.phaseBannerEl = el("div", { className: "phase-banner" });
  ```
- [ ] **Step 3: Mount it (no hide-on-mount).** The strip must NOT be in the `display:none` loop (it self-manages display). After the `parent.appendChild(this.layer);` line (@ :101) add:
  ```ts
    this.phaseBannerEl.style.display = "none";
    this.layer.appendChild(this.phaseBannerEl);
  ```
- [ ] **Step 4: Add the method.** Immediately after `hideBanner()` (closes @ :535) add:
  ```ts
  /** Sweep in a "Player Phase" / "Enemy Phase" strip, then self-remove. The CSS
   *  keyframe owns the full in/hold/out timeline (~1.05s, or a static fade under
   *  reduced motion); we just (re)start it and clean up on animationend with a
   *  timeout fallback so a missed event can never leave the strip on screen. */
  showPhaseBanner(side: "player" | "enemy"): void {
    const e = this.phaseBannerEl;
    e.className = `phase-banner ${side}`;
    e.textContent = side === "player" ? "Player Phase" : "Enemy Phase";
    e.style.display = "flex";
    // Restart the animation if one is already mid-flight (re-trigger reflow).
    e.style.animation = "none";
    void e.offsetWidth;
    e.style.animation = "";
    let cleared = false;
    const done = () => {
      if (cleared) return;
      cleared = true;
      e.style.display = "none";
      e.removeEventListener("animationend", done);
    };
    e.addEventListener("animationend", done);
    window.setTimeout(done, 1400);
  }
  ```
- [ ] **Step 5: Typecheck.** Run `npx tsc --noEmit`. Expected: no output.
- [ ] **Step 6: Full regression.** Run `npx vitest run`. Expected: all pass.
- [ ] **Step 7: Commit.** Run `git add -A && git commit -m "feat(juice): BattleUI.showPhaseBanner self-cleaning sweep strip"`.

---

### Task 2.1d: Trigger the phase banner on team flip in `beginNextTurn`
**Files:** Modify `src/scenes/battleScene.ts` (add import; add a field near :87; insert call in `beginNextTurn` @ ~:344; cover the enemy think-time @ :1396)

Fire `showPhaseBanner` ONLY when the acting team differs from the previous actor's team, using the pure `teamFlipped` from Task 2.1a. Track `lastActingTeam` across turns. On the enemy phase, lengthen the existing `animator.wait(0.35)` think-time so the sweep isn't stepped on.

- [ ] **Step 1: Add the import.** After the existing turnManager import (@ :28) add a line:
  ```ts
  import { teamFlipped } from "./turnRhythm";
  ```
- [ ] **Step 2: Add the tracking field.** After `private active: Unit | null = null;` (@ :87) add:
  ```ts
  /** Team of the previous actor; null until the first turn. Drives the phase banner. */
  private lastActingTeam: Team | null = null;
  ```
  Then confirm `Team` is imported: the top-of-file type import (@ :1) currently is `import type { BattleRewards, Direction, HeroXpResult, LevelUpInfo, Loot, MapDef, Point, SkillDef, Unit } from "../core/types";`. Edit it to add `Team`:
  ```ts
  import type { BattleRewards, Direction, HeroXpResult, LevelUpInfo, Loot, MapDef, Point, SkillDef, Team, Unit } from "../core/types";
  ```
- [ ] **Step 3: Fire the banner on flip.** In `beginNextTurn`, the block after `this.active = advanceToNextActor(this.units);` / `if (!this.active) return;` (@ :342-343) and before the camera `if (!this.bootFraming)` block (@ :346). Insert:
  ```ts
    // Phase punctuation: sweep a "Player/Enemy Phase" strip only when control
    // actually changes hands (not every individual unit's turn).
    if (teamFlipped(this.lastActingTeam, this.active.team)) {
      this.ui.showPhaseBanner(this.active.team);
    }
    this.lastActingTeam = this.active.team;
  ```
- [ ] **Step 4: Cover the sweep on the enemy think-time.** In `runEnemyTurn` (@ :1395) the first line is `await this.ctx.animator.wait(0.35);` (@ :1396). The enemy phase banner sweeps ~1.05s; give the AI a beat so the unit doesn't lurch mid-sweep. Replace that line with:
  ```ts
    // Hold for the Enemy Phase sweep (CSS ~1.05s) before the AI acts, so the
    // banner reads before the first enemy moves. Reduced motion still gets a beat.
    await this.ctx.animator.wait(0.6);
  ```
- [ ] **Step 5: Typecheck.** Run `npx tsc --noEmit`. Expected: no output. (If TS complains `Team` is unused — it isn't, the field uses it.)
- [ ] **Step 6: Full regression.** Run `npx vitest run`. Expected: all pass (including the new `tests/turnRhythm.test.ts`).
- [ ] **Step 7: MANUAL VERIFY.** Launch the app (drive system Edge/Brave via puppeteer-core per the repo's browser-verification note) and start a battle. Visual checklist:
  - At the FIRST player turn a blue "PLAYER PHASE" strip slides in from the left, holds, slides out (~1s total).
  - It does NOT re-appear when the next player unit's turn begins (same team).
  - When the last player unit ends and the first enemy acts, a red "ENEMY PHASE" strip sweeps; the enemy unit waits for it before moving.
  - Toggle reduced motion (Settings, or OS `prefers-reduced-motion`): the strip appears static (no horizontal slide) and fades, instead of sweeping.
- [ ] **Step 8: Commit.** Run `git add -A && git commit -m "feat(juice): fire phase banner on team flip + cover enemy think-time"`.

---

### Task 2.2: FLIP-animate the turn-order bar
**Files:** Modify `src/ui/battleUI.ts` (`setTurnOrder` @ :190-226)

When the order rebuilds, chips that survived should glide from their old x to their new x (FLIP: First/Last/Invert/Play). New chips fade in. The id→old-left measurement must happen BEFORE `clear()`. Gated on `prefersReducedMotion()`.

- [ ] **Step 1: Add the CSS for the FLIP transition + new-chip fade.** In `src/ui/styles.ts`, after the existing `.turn-chip { position: relative; overflow: visible; }` rule (@ :172) add:
  ```css
.turn-chip.tc-flip { transition: transform 0.25s ease; }
.turn-chip.tc-enter { animation: chip-enter 0.25s ease both; }
@keyframes chip-enter { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: none; } }
.reduced-motion .turn-chip.tc-flip { transition: none !important; }
.reduced-motion .turn-chip.tc-enter { animation: none !important; }
  ```
- [ ] **Step 2: Capture old positions before clearing.** In `setTurnOrder` (@ :190), the body currently starts with `clear(this.turnBar);` (@ :191). Insert ABOVE that line:
  ```ts
    // FLIP step 1 (First): record each surviving chip's current left edge, keyed
    // by unit id, BEFORE we tear down and rebuild the bar.
    const reduce = prefersReducedMotion();
    const oldLeft = new Map<string, number>();
    if (!reduce) {
      for (const child of Array.from(this.turnBar.children)) {
        const id = (child as HTMLElement).dataset.unitId;
        if (id) oldLeft.set(id, (child as HTMLElement).getBoundingClientRect().left);
      }
    }
  ```
- [ ] **Step 3: Tag each chip with its unit id + remember the node.** Inside the `units.forEach((u, i) => { ... })` loop, the `chip` is created via `el("div", { className: \`turn-chip...\`, ... })` (@ :199-209). The chip element needs its `data-unit-id` set so step 2's next call can read it, and we need a handle to apply the FLIP after layout. After the line `this.turnBar.appendChild(chip);` (@ :223) add:
  ```ts
      chip.dataset.unitId = u.id;
  ```
  (Place it before `this.turnBar.appendChild(chip);` is fine too — just ensure it runs for every chip. Putting it right after `const chip = el(...)` closes @ :209, before the side-marker append @ :212, is cleanest.)

  Concretely: immediately after the `const chip = el("div", {...});` statement ends (@ :209) insert:
  ```ts
      chip.dataset.unitId = u.id;
  ```
- [ ] **Step 4: Apply the FLIP after the rebuild.** The method ends with `this.turnBar.style.display = "flex";` (@ :225). Replace that single line with:
  ```ts
    this.turnBar.style.display = "flex";
    if (reduce) return;
    // FLIP steps 2-4 (Last/Invert/Play): for each surviving chip, jump it back to
    // where it was (transform, no transition), then on the next frame clear the
    // transform with a transition so it glides into place. Brand-new chips fade in.
    for (const child of Array.from(this.turnBar.children)) {
      const node = child as HTMLElement;
      const id = node.dataset.unitId;
      if (!id) continue; // the "Turn order" label has no unit id
      const prev = oldLeft.get(id);
      if (prev === undefined) {
        node.classList.add("tc-enter"); // newly-appeared unit
        continue;
      }
      const now = node.getBoundingClientRect().left;
      const dx = prev - now;
      if (Math.abs(dx) < 0.5) continue;
      node.style.transform = `translateX(${dx}px)`;
      requestAnimationFrame(() => {
        node.classList.add("tc-flip");
        node.style.transform = "";
      });
    }
  ```
- [ ] **Step 5: Typecheck.** Run `npx tsc --noEmit`. Expected: no output. (`dataset.unitId` is typed `string | undefined` — the `if (!id)` / `=== undefined` guards handle it.)
- [ ] **Step 6: Full regression.** Run `npx vitest run`. Expected: all pass. (`setTurnOrder` is never called by node tests; `requestAnimationFrame` only runs in the browser.)
- [ ] **Step 7: MANUAL VERIFY.** In a running battle, watch the turn-order bar at the top across turn changes:
  - When the active unit cycles to the back of the order, the surviving chips slide smoothly to their new slots (no instant snap).
  - A unit that re-enters the previewed window (e.g. after a fast unit acts) fades+scales in rather than popping.
  - Under reduced motion the bar rebuilds instantly with no slide or fade.
- [ ] **Step 8: Commit.** Run `git add -A && git commit -m "feat(juice): FLIP-animate turn-order bar reorders, fade new chips"`.

---

### Task 2.3a: Fade-to-black overlay CSS
**Files:** Modify `src/ui/styles.ts` (append before the CSS-closing backtick @ ~:678)

One persistent full-screen black div, opacity-transitioned. Lives above everything (canvas + ui-layer). Reduced motion zeroes the transition so the swap is instant.

- [ ] **Step 1: Insert the overlay CSS** immediately before the closing `` ` `` of the `CSS` template (currently @ :678), alongside the phase-banner block added in 2.1b:
  ```css
/* Scene-swap fade: a persistent top-layer black sheet that main.ts pulses 0->1->0
   around a SceneManager.change(). pointer-events:none so it never eats input even
   while transitioning (it's transparent at rest). */
.scene-fade {
  position: fixed; inset: 0; z-index: 9999;
  background: #05060a; opacity: 0; pointer-events: none;
  transition: opacity 150ms linear;
}
.reduced-motion .scene-fade { transition: none !important; }
  ```
- [ ] **Step 2: Typecheck.** Run `npx tsc --noEmit`. Expected: no output.
- [ ] **Step 3: Full regression.** Run `npx vitest run`. Expected: all pass.
- [ ] **Step 4: Commit.** Run `git add -A && git commit -m "feat(juice): scene-fade overlay CSS (reduced-motion safe)"`.

---

### Task 2.3b: Drive the fade from `sceneManager.change()` via a main.ts-owned overlay
**Files:** Modify `src/scenes/sceneManager.ts` (`change` @ :34-37, add an optional fade hook); Modify `src/main.ts` (own the overlay div, wire it in @ ~:28-43)

Keep the dispose/swap SYNCHRONOUS — the fade is a cosmetic overlay layered on top, NOT a gate on scene readiness. The overlay div is owned by `main.ts` (it already owns `app` and `manager`), and a small fade callback is handed to the manager.

- [ ] **Step 1: Add an optional fade hook to SceneManager.** Replace the `change` method (@ :34-37) which currently is:
  ```ts
  change(scene: Scene): void {
    this.current?.dispose();
    this.current = scene;
  }
  ```
  with:
  ```ts
  /** Optional cosmetic transition: pulse a fade overlay 0->1 immediately and
   *  schedule 1->0 after the (synchronous) swap. Wired from main.ts. */
  private onSwap: (() => void) | null = null;

  setSwapEffect(fn: () => void): void {
    this.onSwap = fn;
  }

  change(scene: Scene): void {
    this.onSwap?.();
    this.current?.dispose();
    this.current = scene;
  }
  ```
  Note: `onSwap` is declared mid-class here for locality; if your linter requires fields-before-methods, move the `private onSwap: ... = null;` line up next to `private current: Scene | null = null;` (@ :32) instead and keep only `setSwapEffect` + the edited `change`.
- [ ] **Step 2: Create + own the overlay in main.ts.** In `boot()`, after `const manager = new SceneManager();` (@ :28) add:
  ```ts
    // Cosmetic scene-swap fade: a persistent top-layer sheet pulsed on every
    // SceneManager.change(). Owned here (main owns #app + the manager). The swap
    // itself stays synchronous — this overlay only rides on top of it.
    const fade = document.createElement("div");
    fade.className = "scene-fade";
    app.appendChild(fade);
    let fadeTimer = 0;
    manager.setSwapEffect(() => {
      if (prefersReducedMotion()) return; // CSS already zeroes the transition, but skip the work too
      window.clearTimeout(fadeTimer);
      fade.style.opacity = "1";
      // Drop back to transparent shortly after the synchronous swap completes.
      fadeTimer = window.setTimeout(() => { fade.style.opacity = "0"; }, 150);
    });
  ```
- [ ] **Step 3: Import `prefersReducedMotion` in main.ts.** main.ts already imports `applyAccessibility` from `./engine/accessibility` (@ :8). Edit that line:
  ```ts
  import { applyAccessibility, prefersReducedMotion } from "./engine/accessibility";
  ```
- [ ] **Step 4: Typecheck.** Run `npx tsc --noEmit`. Expected: no output.
- [ ] **Step 5: Full regression.** Run `npx vitest run`. Expected: all pass. (`sceneManager.ts` is type-imported by node tests but the new method is inert; `main.ts` is never imported.)
- [ ] **Step 6: MANUAL VERIFY.** In the running app, navigate between scenes (Title → Party Select → Battle → Party Camp). Checklist:
  - Each scene swap shows a brief (~150ms) dip to black and back — a soft cut, not a hard pop.
  - The new scene is interactive immediately (the fade does NOT block input; it's `pointer-events:none`).
  - Under reduced motion, swaps are instant with no black flash.
- [ ] **Step 7: Commit.** Run `git add -A && git commit -m "feat(juice): fade-to-black overlay on scene swap (kept swap synchronous)"`.

---

### Task 2.4a: Symmetric modal-exit keyframes (CSS)
**Files:** Modify `src/ui/styles.ts` (append before the CSS-closing backtick @ ~:678)

A `card-fall` keyframe (reverse of `card-rise` @ :246) plus a backdrop fade-out, applied via exit classes. Reduced motion strips them (the existing `.reduced-motion .level-up-card, .reduced-motion .rewards-card { animation: none; }` @ :353 already kills the card animation; we add the exit equivalents).

- [ ] **Step 1: Insert the exit CSS** before the closing `` ` `` of the `CSS` template (@ ~:678), with the other Phase 2 additions:
  ```css
/* Symmetric modal exit: card-fall is the reverse of card-rise; the backdrop dims
   back to transparent. Applied by BattleUI hide* via an exit class, removed on
   animationend (with a timeout fallback so onClick/nav fires even headless). */
@keyframes card-fall { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(14px) scale(0.985); } }
@keyframes backdrop-fade { from { opacity: 1; } to { opacity: 0; } }
.banner.is-exiting, .level-up.is-exiting, .rewards.is-exiting { animation: backdrop-fade 0.22s ease both; }
.banner.is-exiting .banner-card { animation: card-fall 0.22s cubic-bezier(0.4,0,1,1) both; }
.level-up.is-exiting .level-up-card { animation: card-fall 0.22s cubic-bezier(0.4,0,1,1) both; }
.rewards.is-exiting .rewards-card { animation: card-fall 0.22s cubic-bezier(0.4,0,1,1) both; }
.reduced-motion .banner.is-exiting,
.reduced-motion .level-up.is-exiting,
.reduced-motion .rewards.is-exiting,
.reduced-motion .banner.is-exiting .banner-card,
.reduced-motion .level-up.is-exiting .level-up-card,
.reduced-motion .rewards.is-exiting .rewards-card { animation: none !important; }
  ```
- [ ] **Step 2: Typecheck.** Run `npx tsc --noEmit`. Expected: no output.
- [ ] **Step 3: Full regression.** Run `npx vitest run`. Expected: all pass.
- [ ] **Step 4: Commit.** Run `git add -A && git commit -m "feat(juice): card-fall + backdrop-fade modal-exit keyframes"`.

---

### Task 2.4b: Wire symmetric exits into BattleUI hide* methods
**Files:** Modify `src/ui/battleUI.ts` (`hideBanner` @ :533, `hideLevelUp` @ :691, `hideRewards` @ :773; add one private helper)

Each `hide*` adds `is-exiting`, then on `animationend` (timeout fallback) hides + clears. The fallback is what keeps headless/test paths working: any `onClick`/nav that calls a `hide*` still resolves synchronously elsewhere — the visual cleanup is decoupled and never blocks logic.

- [ ] **Step 1: Add a shared exit helper.** Just before `hideBanner()` (@ :533) add a private method:
  ```ts
  /** Play the exit animation on a modal layer, then hide (+ optionally clear its
   *  children) once it finishes. A timeout fallback guarantees cleanup even if the
   *  animationend event is missed (or animations are off), so nothing leaks. */
  private animateOut(layer: HTMLDivElement, clearAfter: boolean): void {
    if (layer.style.display === "none") return;
    layer.classList.add("is-exiting");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      layer.classList.remove("is-exiting");
      layer.style.display = "none";
      if (clearAfter) clear(layer);
      layer.removeEventListener("animationend", finish);
    };
    layer.addEventListener("animationend", finish);
    window.setTimeout(finish, 300);
  }
  ```
- [ ] **Step 2: Route `hideBanner` through it.** Replace `hideBanner()` (@ :533-535):
  ```ts
  hideBanner(): void {
    this.bannerEl.style.display = "none";
  }
  ```
  with:
  ```ts
  hideBanner(): void {
    this.animateOut(this.bannerEl, false);
  }
  ```
- [ ] **Step 3: Route `hideLevelUp` through it.** Replace `hideLevelUp()` (@ :691-694):
  ```ts
  hideLevelUp(): void {
    this.levelUpEl.style.display = "none";
    clear(this.levelUpEl);
  }
  ```
  with:
  ```ts
  hideLevelUp(): void {
    this.animateOut(this.levelUpEl, true);
  }
  ```
- [ ] **Step 4: Route `hideRewards` through it.** Replace `hideRewards()` (@ :773-776):
  ```ts
  hideRewards(): void {
    this.rewardsEl.style.display = "none";
    clear(this.rewardsEl);
  }
  ```
  with:
  ```ts
  hideRewards(): void {
    this.animateOut(this.rewardsEl, true);
  }
  ```
- [ ] **Step 5: Typecheck.** Run `npx tsc --noEmit`. Expected: no output.
- [ ] **Step 6: Full regression.** Run `npx vitest run`. Expected: all pass. CRITICAL: the level-up/rewards `onClick` handlers (@ :679-683 and :764-768) call `this.hideLevelUp()`/`this.hideRewards()` immediately followed by `onDone()` — `onDone` is unaffected by the now-deferred visual cleanup, so the battle→camp/victory flow stays synchronous. Confirm no objectives/progression/state tests regress.
- [ ] **Step 7: MANUAL VERIFY.** In a running battle:
  - Dismiss a banner (e.g. the intro/objective banner via its button): the card drops down + the backdrop dims out, instead of vanishing instantly. The next state appears right after.
  - Trigger a mid-battle level-up and click Continue: the level-up card falls away symmetrically with its rise.
  - Win a battle and click Continue on the Spoils screen: the rewards card falls away, then navigation proceeds (Party Camp / Victory).
  - Under reduced motion: all three hide instantly (no fall), and navigation still proceeds.
- [ ] **Step 8: Commit.** Run `git add -A && git commit -m "feat(juice): symmetric modal exit for banner/level-up/rewards with timeout fallback"`.

---

## Phase 3 — Spell / movement identity

> All tasks here are render-layer only. Files in `src/core`, `src/battle`, `src/data` keep their no-render contract; node tests must stay green as proof of zero logic regression. This phase CONSUMES `src/engine/tween.ts` (built in Phase 0) — its `easeOutQuad`, `hump`, `lerp`, and `clamp01` exports are assumed to exist. Every task ends in `npx tsc --noEmit`, `npx vitest run`, a manual visual check, and a commit.

Verified anchors (re-check before editing — they drift):
- `src/engine/renderer.ts`: `ActiveEffect` interface @ ~61-66; `drawEffects` @ ~223-238; `drawUnit` signature @ ~669-676, `drawY` computed @ ~685, sprite blit @ ~721; `STATUS_UI` palette @ ~125-134; `import` block @ 1-19.
- `src/scenes/battleScene.ts`: field decls @ ~101-106; `tryAttack` lunge @ ~855; `castSkill` @ ~920-957; `resolveCast` per-target effect loop @ ~1012-1016; `resolveLeapMove` @ ~1086-1103; enemy `runEnemyTurn` attack-lunge @ ~1414, skill cast site @ ~1427-1476 (per-target `pushEffect` @ ~1453); `pushEffect` @ ~1499-1506; `update` effect-aging loop @ ~1628-1632, juice timers @ ~1634-1645.
- `src/scenes/battleView.ts`: `ViewScene` interface @ ~41-66; `computeUnitOffsets` @ ~140-167; view assembly @ ~109-128.
- `src/engine/animator.ts`: `animPos` Map @ 23; `moveAlong` @ 64.

---

### Task 3.1: Caster lunge on skill cast (player + enemy)

**Files:** Modify `src/scenes/battleScene.ts` (`castSkill` ~924, `resolveCast` ~966, `runEnemyTurn` skill site ~1432)

Today `tryAttack` sets `this.lunge` so the attacker visibly lunges, but skill casters stay frozen. Reuse the exact same `this.lunge` Map shape (`{ id, tx, ty, age: 0 }`) at every cast site, toward the cast `center`. The renderer already turns `this.lunge` into a pixel offset in `computeUnitOffsets` (battleView.ts ~149) — no render change needed.

- [ ] **Step 1: Lunge the player caster in `castSkill`.** Read the offensive-facing block at ~922-926. It currently reads:
  ```ts
    const isOffensive = skill.effect === "damage" || skill.effect === "debuff";
    // Turn to face an offensive cast (self-targeted casts keep their facing).
    if (isOffensive && !samePoint(center, this.active.pos)) {
      this.active.facing = directionTo(this.active.pos, center);
    }
  ```
  Replace it with (adds the lunge inside the same guard — self-targeted casts neither turn nor lunge):
  ```ts
    const isOffensive = skill.effect === "damage" || skill.effect === "debuff";
    // Turn to face an offensive cast (self-targeted casts keep their facing).
    if (isOffensive && !samePoint(center, this.active.pos)) {
      this.active.facing = directionTo(this.active.pos, center);
      // Caster lunges toward the cast center, mirroring tryAttack's juice.
      this.lunge = { id: this.active.id, tx: center.x, ty: center.y, age: 0 };
    }
  ```

- [ ] **Step 2: Cover the charged-skill path too via `resolveCast`.** A charged skill resolves a turn later through `resolveCast` (called from `beginNextTurn`), where `castSkill`'s lunge has long since expired. Add a lunge at the top of `resolveCast`. Read ~966-970:
  ```ts
    private resolveCast(skill: SkillDef, caster: Unit, center: Point, fromCharge = false): void {
      const isOffensive = skill.effect === "damage" || skill.effect === "debuff";
      const affected = aoeTiles(this.grid, center, skill.aoe).flatMap((t) =>
        this.units.filter((u) => samePoint(u.pos, t)),
      );
  ```
  Insert the lunge right after the `isOffensive` line:
  ```ts
    private resolveCast(skill: SkillDef, caster: Unit, center: Point, fromCharge = false): void {
      const isOffensive = skill.effect === "damage" || skill.effect === "debuff";
      // Caster lunges toward the resolved cast center (covers charged-skill resolution,
      // where castSkill's lunge already expired). Self-targeted casts keep still.
      if (isOffensive && !samePoint(center, caster.pos)) {
        this.lunge = { id: caster.id, tx: center.x, ty: center.y, age: 0 };
      }
      const affected = aoeTiles(this.grid, center, skill.aoe).flatMap((t) =>
        this.units.filter((u) => samePoint(u.pos, t)),
      );
  ```
  (This double-sets the lunge for instant casts — harmless, `age` just resets to 0 — and is the ONLY trigger for charged casts.)

- [ ] **Step 3: Lunge the enemy caster in `runEnemyTurn`.** Read the skill block facing line at ~1432:
  ```ts
        if (isOffensive && !samePoint(center, unit.pos)) unit.facing = directionTo(unit.pos, center);
  ```
  Replace with:
  ```ts
        if (isOffensive && !samePoint(center, unit.pos)) {
          unit.facing = directionTo(unit.pos, center);
          this.lunge = { id: unit.id, tx: center.x, ty: center.y, age: 0 };
        }
  ```

- [ ] **Step 4: Type-check.** Run `npx tsc --noEmit`. Expected: no output (clean exit 0).

- [ ] **Step 5: Regression-proof.** Run `npx vitest run`. Expected: all suites pass (~1552 tests green) — proves no logic touched.

- [ ] **Step 6: MANUAL VERIFY.** Launch the app (drive system Edge/Brave via puppeteer-core per the repo convention). Checklist: select a mage, cast an offensive skill (e.g. Fire) at an enemy a few tiles away → the CASTER sprite visibly lunges ~7px toward the target tile and settles (same feel as a basic attack). Cast a self/ally-targeted buff/heal → caster does NOT lunge. Trigger an enemy mage to cast on your party → enemy caster lunges. If reduced-motion is on, the lunge still plays (it's a positional ease, not the suppressed jitter — matches existing lunge behavior).

- [ ] **Step 7: Commit.**
  ```
  git add -A && git commit -m "feat(juice): lunge skill casters toward target on cast"
  ```

---

### Task 3.2: Projectile-travel VFX for ranged spell families

**Files:** Modify `src/engine/renderer.ts` (`ActiveEffect` ~61, `drawEffects` ~223), `src/scenes/battleScene.ts` (`resolveCast` effect loop ~1012, `runEnemyTurn` skill effect ~1453, `pushEffect` ~1499)

Today every spell impact pops on the target tile instantly. Give the ranged MAGIC families (fire/bolt/arcane) a short travel phase: the VFX sprite flies from the caster's tile to the target, THEN plays the existing impact frames in place. Bows/basic `physical` are explicitly OUT of scope (Step 8 explains why). Popups still fire immediately (do NOT delay them — test ordering on log/popup must not move).

- [ ] **Step 1: Extend `ActiveEffect`.** Read the interface @ ~61-66:
  ```ts
  /** A transient spell/skill effect animation playing over a tile. */
  export interface ActiveEffect {
    tile: Point;
    anim: AnimDef;
    /** Seconds elapsed. */
    age: number;
  }
  ```
  Replace with:
  ```ts
  /** A transient spell/skill effect animation playing over a tile. */
  export interface ActiveEffect {
    tile: Point;
    anim: AnimDef;
    /** Seconds elapsed. */
    age: number;
    /** Optional launch tile: while age < travel the sprite flies from here to `tile`. */
    from?: Point;
    /** Seconds the projectile spends in flight before the impact frames play. */
    travel?: number;
  }
  ```

- [ ] **Step 2: Import the easing into the renderer.** Read the existing `iso` import block ending @ ~19. Add a tween import directly after it (after line 19):
  ```ts
  import { easeOutQuad, clamp01 } from "./tween";
  ```

- [ ] **Step 3: Make `drawEffects` lerp the projectile, then impact.** Read @ ~223-238. Replace the whole method:
  ```ts
    private drawEffects(view: BattleView): void {
      const ctx = this.ctx;
      for (const e of view.effects) {
        // Pre-delay (the AOE center-out stagger seeds a negative age): not launched
        // yet, so skip entirely — never draw frame 0 stacked at the caster tile.
        if (e.age < 0) continue;
        const travel = e.travel ?? 0;
        // Projectile flight: before `travel` elapses, hold frame 0 and lerp the
        // sprite from `from` tile to the target tile. After it lands, run the
        // impact frames in place from age 0 (so the existing animation is intact).
        const flying = e.from !== undefined && e.age < travel;
        const impactAge = flying ? 0 : e.age - travel;
        const frames = e.anim.frames;
        const idx = Math.min(Math.floor(impactAge / e.anim.frameDur), frames.length - 1);
        if (idx < 0) continue;
        const canvas = bakeSprite(frames[idx], VFX_SCALE);
        let tx = e.tile.x;
        let ty = e.tile.y;
        if (flying && e.from) {
          const f = easeOutQuad(clamp01(e.age / travel));
          tx = e.from.x + (e.tile.x - e.from.x) * f;
          ty = e.from.y + (e.tile.y - e.from.y) * f;
        }
        const z = view.grid.interpHeightAt(tx, ty);
        const center = this.project(view, tx, ty, z);
        ctx.drawImage(
          canvas,
          Math.round(center.sx - canvas.width / 2),
          Math.round(center.sy - 39 - canvas.height / 2),
        );
      }
    }
  ```
  Note: `this.project` accepts fractional coords (it routes through `worldToScreen`); `grid.interpHeightAt` is the same fractional-height helper `drawScene` already uses @ ~298 for mid-step units.

- [ ] **Step 4: Cull-window must include the travel phase.** In `battleScene.ts`, read the effect-aging loop @ ~1628-1632:
  ```ts
      for (let i = this.effects.length - 1; i >= 0; i--) {
        const e = this.effects[i];
        e.age += dt;
        if (e.age >= e.anim.frames.length * e.anim.frameDur) this.effects.splice(i, 1);
      }
  ```
  Replace the cull condition so a travelling effect isn't culled mid-flight:
  ```ts
      for (let i = this.effects.length - 1; i >= 0; i--) {
        const e = this.effects[i];
        e.age += dt;
        const life = (e.travel ?? 0) + e.anim.frames.length * e.anim.frameDur;
        if (e.age >= life) this.effects.splice(i, 1);
      }
  ```

- [ ] **Step 5: Teach `pushEffect` to accept an optional launch tile.** Read @ ~1499-1506:
  ```ts
    private pushEffect(tile: Point, vfxKey: string): void {
      const anim = getVfx(vfxKey);
      if (!anim) return;
      if (vfxKey !== "physical" && vfxKey !== "heal" && vfxKey !== "revive" && vfxKey !== "status") {
        sfx.playMagic();
      }
      this.effects.push({ tile: { ...tile }, anim, age: 0 });
    }
  ```
  Replace with (a `from` tile turns on travel for the ranged families; default keeps every existing call unchanged):
  ```ts
    /** Spell/skill families that read as a launched projectile (vs. a hit-in-place). */
    private static readonly PROJECTILE_VFX: ReadonlySet<string> = new Set(["fire", "bolt", "arcane"]);
    /** Seconds a projectile spends in flight before its impact frames play. */
    private static readonly TRAVEL_DUR = 0.16;

    private pushEffect(tile: Point, vfxKey: string, from?: Point): void {
      const anim = getVfx(vfxKey);
      if (!anim) return;
      if (vfxKey !== "physical" && vfxKey !== "heal" && vfxKey !== "revive" && vfxKey !== "status") {
        sfx.playMagic();
      }
      const travels = from !== undefined && BattleScene.PROJECTILE_VFX.has(vfxKey) && !samePoint(from, tile);
      this.effects.push({
        tile: { ...tile },
        anim,
        age: 0,
        from: travels ? { ...from } : undefined,
        travel: travels ? BattleScene.TRAVEL_DUR : undefined,
      });
    }
  ```
  (`samePoint` is already imported @ line 8.)

- [ ] **Step 6: Pass the caster tile at the player cast site.** Read `resolveCast`'s effect loop @ ~1011-1016:
  ```ts
      const skillVfx = vfxKeyForSkill(skill);
      for (const r of results) {
        this.pushPopup(r);
        const u = this.units.find((x) => x.id === r.unitId);
        if (u) this.pushEffect(u.pos, skillVfx);
      }
  ```
  Replace the loop body to launch from the caster (popup still fires first/immediately — unchanged):
  ```ts
      const skillVfx = vfxKeyForSkill(skill);
      for (const r of results) {
        this.pushPopup(r);
        const u = this.units.find((x) => x.id === r.unitId);
        if (u) this.pushEffect(u.pos, skillVfx, caster.pos);
      }
  ```

- [ ] **Step 7: Pass the caster tile at the enemy cast site.** Read the enemy per-target `pushEffect` @ ~1453:
  ```ts
            this.pushEffect(actual.pos, skillVfx);
  ```
  Replace with:
  ```ts
            this.pushEffect(actual.pos, skillVfx, unit.pos);
  ```

- [ ] **Step 8: (Bow) Pass the caster tile for basic ranged weapon hits.** Bows map to the `physical` family which is NOT in `PROJECTILE_VFX`, so a `from` arg is inert there — leave basic-attack `pushEffect(actual.pos, vfxKeyForWeapon(weapon))` calls (tryAttack ~861, tryCounter ~900, enemy attack ~1420) UNTOUCHED. (Projectile travel is intentionally scoped to the magic families; promoting bows to a flying arrow is a separate visual change, not in scope.)

- [ ] **Step 9: Type-check.** `npx tsc --noEmit`. Expected: clean (exit 0).

- [ ] **Step 10: Regression-proof.** `npx vitest run`. Expected: all green. Pay attention to any battleLog/popup-order suites — they must still pass, confirming the popup still fires at cast time (we only delayed the SPRITE, not the popup/log).

- [ ] **Step 11: MANUAL VERIFY.** Launch the app. Checklist: cast Fire/Bolt/an arcane spell at a DISTANT enemy → the spell sprite visibly flies from the caster's tile across to the target (decelerating, easeOut), then the burst plays on the target. Cast on an ADJACENT enemy → effectively no visible travel (gap ~0, lands instantly). Heal/buff/status VFX still pop in place with no flight. Crit/death shake and damage numbers still appear at the same moment as before (popup not delayed).

- [ ] **Step 12: Commit.**
  ```
  git add -A && git commit -m "feat(render): projectile-travel VFX for fire/bolt/arcane casts"
  ```

---

### Task 3.3: Per-tile walk hop in `drawUnit`

**Files:** Modify `src/engine/renderer.ts` (`drawUnit` ~669-685)

While a unit is mid-walk (`view.animPos` has an entry for it), bounce it with a small vertical hop. Pure draw-time — derive the hop phase from `view.time` so we don't touch the animator's shared walk-tween semantics.

- [ ] **Step 1: Pass a "walking" signal into the bob calc.** Read `drawUnit`'s bob/`drawY` block @ ~682-685:
  ```ts
      const bob = active ? Math.sin(time * 6) * 2 : 0;
      const drawX = Math.round(center.sx - w / 2);
      const feetY = center.sy + 6; // a touch below the tile-top center
      const drawY = Math.round(feetY - h + bob);
  ```
  The method doesn't currently know if the unit is walking. The cheapest signal already at the call site is `view.animPos`. Add a `walking` flag to the `opts` object introduced in Task 1.1 (a field on the object, NOT a new positional param). Read the opts param + destructure set by Task 1.1 @ ~675-678:
  ```ts
      facingDir: { x: number; y: number },
      opts: { flash?: { color: string; a: number } } = {},
    ): void {
      const { flash } = opts;
  ```
  Replace with (extend the opts type and destructure `walking`):
  ```ts
      facingDir: { x: number; y: number },
      opts: { flash?: { color: string; a: number }; walking?: boolean } = {},
    ): void {
      const { flash, walking } = opts;
  ```

- [ ] **Step 2: Add the hop to `drawY`.** Replace the bob/`drawY` block @ ~682-685 with:
  ```ts
      const bob = active ? Math.sin(time * 6) * 2 : 0;
      // Walk hop: a quick one-direction-up bounce while the unit is mid-step. Keyed
      // off wall-clock time (draw-only) so it never perturbs the walk tween itself.
      const hop = walking ? -Math.abs(Math.sin(time * 14)) * 3 : 0;
      const drawX = Math.round(center.sx - w / 2);
      const feetY = center.sy + 6; // a touch below the tile-top center
      const drawY = Math.round(feetY - h + bob + hop);
  ```

- [ ] **Step 3: Pass `walking` at the call site.** Read the `drawUnit` call in `drawScene` @ ~347 (the opts-object form set in Task 1.1):
  ```ts
          this.drawUnit(it.unit, center, it.unit.id === view.activeUnitId, view.time, view.deathFade.get(it.unit.id), { x: fx, y: fy }, { flash: view.unitFlashes?.get(it.unit.id) });
  ```
  Replace with (the unit is walking iff the animator is tweening its position — add the `walking` key):
  ```ts
          this.drawUnit(it.unit, center, it.unit.id === view.activeUnitId, view.time, view.deathFade.get(it.unit.id), { x: fx, y: fy }, { flash: view.unitFlashes?.get(it.unit.id), walking: view.animPos.has(it.unit.id) });
  ```

- [ ] **Step 4: Type-check.** `npx tsc --noEmit`. Expected: clean.

- [ ] **Step 5: Regression-proof.** `npx vitest run`. Expected: all green.

- [ ] **Step 6: MANUAL VERIFY.** Launch the app. Checklist: move a unit across several tiles → the sprite visibly hops (a few px up-and-down) as it walks, then settles flat the instant it arrives (animPos cleared → `walking` false → hop 0). A standing/active unit shows only the existing idle bob, no hop. A leap-skill hop (single segment) also bounces. The shadow stays put on the ground (only the sprite `drawY` moves).

- [ ] **Step 7: Commit.**
  ```
  git add -A && git commit -m "feat(render): per-tile walk hop on moving units"
  ```

---

### Task 3.4: Status-apply body flash + AOE center-out stagger

**Files:** Modify `src/engine/renderer.ts` (`BattleView` ~77, `drawUnit` ~669/~721), `src/scenes/battleView.ts` (`ViewScene` ~41, view assembly ~109), `src/scenes/battleScene.ts` (field decls ~102, `pushPopup` ~1517, juice timers ~1635, `resolveCast` AOE loop ~1012)

Two independent juice bits: (a) a short colored body-flash when a status lands (a `statusFlash` Map mirroring `hitShake`); (b) AOE per-tile impacts staggered by distance from center so a blast reads as expanding outward.

- [ ] **Step 1: Add the `statusFlash` field.** Read the field decls @ ~101-105:
  ```ts
    private effects: ActiveEffect[] = [];
    private hitShake = new Map<string, number>(); // unitId -> seconds of shake remaining
    private deaths = new Map<string, number>(); // unitId -> seconds since death (fade-out)
    private lunge: { id: string; tx: number; ty: number; age: number } | null = null;
    private screenShake = 0; // seconds of whole-scene impact shake remaining
  ```
  Add after the `hitShake` line:
  ```ts
    private effects: ActiveEffect[] = [];
    private hitShake = new Map<string, number>(); // unitId -> seconds of shake remaining
    private statusFlash = new Map<string, { color: string; t: number }>(); // unitId -> body-flash tint + seconds remaining
    private deaths = new Map<string, number>(); // unitId -> seconds since death (fade-out)
    private lunge: { id: string; tx: number; ty: number; age: number } | null = null;
    private screenShake = 0; // seconds of whole-scene impact shake remaining
  ```

- [ ] **Step 2: Seed the flash on a status result in `pushPopup`.** Read the `status` case @ ~1547-1551:
  ```ts
        case "status":
          // A status result with no `status` field is a cure (Remedy strips debuffs).
          text = res.status ?? "Cure";
          color = POPUP_COLORS.status;
          break;
  ```
  Replace with (flash the body in the status's UI color; default duration 0.3s):
  ```ts
        case "status":
          // A status result with no `status` field is a cure (Remedy strips debuffs).
          text = res.status ?? "Cure";
          color = POPUP_COLORS.status;
          // Body-flash the recipient in a status-tinted pulse so an applied buff/debuff
          // reads on the SPRITE, not just the floating word.
          this.statusFlash.set(res.unitId, { color: STATUS_FLASH_COLOR[res.status ?? ""] ?? "#ffd34d", t: STATUS_FLASH_DUR });
          break;
  ```

- [ ] **Step 3: Add the flash palette + duration consts.** These need to live where `pushPopup` can see them and stay logic-pure (no render import). Put them near the top of `battleScene.ts` after the existing imports/constants — read around the `POPUP_COLORS` import usage and the class top. Add a module-level block just ABOVE the `export class BattleScene` declaration (search for `class BattleScene`):
  ```ts
  /** Seconds a status-apply body flash lasts. */
  const STATUS_FLASH_DUR = 0.3;
  /** Body-flash tint per status kind (mirrors the renderer's STATUS_UI colors, kept
   *  here so the logic layer stays free of any render import). "" = a cure. */
  const STATUS_FLASH_COLOR: Record<string, string> = {
    guard: "#7fb0ff",
    protect: "#5fd0ff",
    shell: "#b98cff",
    haste: "#ffd34d",
    slow: "#ff9f4d",
    stop: "#c8ccd6",
    poison: "#8fe39a",
    regen: "#5fff9a",
    "": "#9affc8", // cure
  };
  ```

- [ ] **Step 4: Decay the flash in the update loop.** Read the hit-shake decay loop @ ~1635-1639:
  ```ts
      for (const [id, t] of this.hitShake) {
        const left = t - dt;
        if (left <= 0) this.hitShake.delete(id);
        else this.hitShake.set(id, left);
      }
  ```
  Add an identical decay for `statusFlash` directly after it:
  ```ts
      for (const [id, t] of this.hitShake) {
        const left = t - dt;
        if (left <= 0) this.hitShake.delete(id);
        else this.hitShake.set(id, left);
      }
      for (const [id, sf] of this.statusFlash) {
        const left = sf.t - dt;
        if (left <= 0) this.statusFlash.delete(id);
        else this.statusFlash.set(id, { color: sf.color, t: left });
      }
  ```

- [ ] **Step 5: Surface `statusFlash` on `BattleView`.** Read the `BattleView` interface in `renderer.ts`, the `deathFade` field @ ~93-94:
  ```ts
    /** Seconds since a unit died, for the death fade-out. */
    deathFade: Map<string, number>;
  ```
  Add after it:
  ```ts
    /** Seconds since a unit died, for the death fade-out. */
    deathFade: Map<string, number>;
    /** Per-unit status-apply body flash: tint color + seconds remaining (of STATUS_FLASH_DUR). */
    statusFlash: Map<string, { color: string; t: number }>;
  ```

- [ ] **Step 6: Thread it through the view builder.** In `battleView.ts`, read the `ViewScene` interface's `hitShake` line @ ~54:
  ```ts
    hitShake: Map<string, number>;
  ```
  Add after it:
  ```ts
    hitShake: Map<string, number>;
    statusFlash: Map<string, { color: string; t: number }>;
  ```
  Then read the view assembly's `deathFade` line @ ~123:
  ```ts
      deathFade: s.deaths,
  ```
  Add after it:
  ```ts
      deathFade: s.deaths,
      statusFlash: s.statusFlash,
  ```

- [ ] **Step 7: Pass the status flash into `drawUnit` and draw a tint pass.** Add a `statusFlash` field to the `opts` object set in Tasks 1.1/3.3. Read the opts param + destructure (ending after `walking?`):
  ```ts
      facingDir: { x: number; y: number },
      opts: { flash?: { color: string; a: number }; walking?: boolean } = {},
    ): void {
      const { flash, walking } = opts;
  ```
  Replace with (extend the opts type and destructure `statusFlash`):
  ```ts
      facingDir: { x: number; y: number },
      opts: {
        flash?: { color: string; a: number };
        walking?: boolean;
        statusFlash?: { color: string; t: number };
      } = {},
    ): void {
      const { flash, walking, statusFlash } = opts;
  ```
  Then read the sprite blit @ ~721 (the live-unit one, NOT the dead-unit early-return at ~696):
  ```ts
      ctx.drawImage(canvas, drawX, drawY);

      const topY = drawY;
  ```
  Replace with (overlay a fading colored copy of the sprite via source-atop so only opaque pixels tint):
  ```ts
      ctx.drawImage(canvas, drawX, drawY);

      // Status-apply flash: a fading tinted copy of the sprite (source-atop so only
      // the unit's body lights up, not its bounding box). Uses STATUS_FLASH_DUR=0.3.
      if (statusFlash) {
        const a = Math.max(0, statusFlash.t / 0.3) * 0.7;
        if (a > 0) {
          ctx.save();
          ctx.globalAlpha = a;
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = statusFlash.color;
          ctx.fillRect(drawX, drawY, w, h);
          ctx.restore();
        }
      }

      const topY = drawY;
  ```
  > NOTE: `source-atop` clips to existing canvas content (the whole frame), not just the sprite, so the `fillRect` is bounded to `drawX/drawY/w/h` to keep the tint local. This tints sprite pixels AND any non-sprite frame pixels under that rect; the rect hugs the sprite, and at most 0.7 alpha for ≤0.3s, so the bleed is visually negligible. (A fully clean per-sprite tint would need an offscreen recolor of `canvas`; YAGNI for a 0.3s flash.)

- [ ] **Step 8: Pass `statusFlash` at the call site.** Read the `drawUnit` call you edited in Task 3.3 @ ~347 (the opts-object form ending in `walking: ...`):
  ```ts
          this.drawUnit(it.unit, center, it.unit.id === view.activeUnitId, view.time, view.deathFade.get(it.unit.id), { x: fx, y: fy }, { flash: view.unitFlashes?.get(it.unit.id), walking: view.animPos.has(it.unit.id) });
  ```
  Replace with (add the `statusFlash` key):
  ```ts
          this.drawUnit(it.unit, center, it.unit.id === view.activeUnitId, view.time, view.deathFade.get(it.unit.id), { x: fx, y: fy }, { flash: view.unitFlashes?.get(it.unit.id), walking: view.animPos.has(it.unit.id), statusFlash: view.statusFlash.get(it.unit.id) });
  ```

- [ ] **Step 9: Stagger AOE impacts center-out.** Read `resolveCast`'s effect loop you last touched in Task 3.2 Step 6:
  ```ts
      const skillVfx = vfxKeyForSkill(skill);
      for (const r of results) {
        this.pushPopup(r);
        const u = this.units.find((x) => x.id === r.unitId);
        if (u) this.pushEffect(u.pos, skillVfx, caster.pos);
      }
  ```
  Replace with (after pushing, back-date each effect's `age` by its manhattan distance from `center` so closer tiles ignite first — the blast expands):
  ```ts
      const skillVfx = vfxKeyForSkill(skill);
      for (const r of results) {
        this.pushPopup(r);
        const u = this.units.find((x) => x.id === r.unitId);
        if (!u) continue;
        this.pushEffect(u.pos, skillVfx, caster.pos);
        // AOE expands outward: tiles farther from the blast center start later by
        // pre-aging the just-pushed effect negative. drawEffects's `e.age < 0` guard
        // (Task 3.2 Step 3) skips it entirely until age climbs to 0, then it launches.
        if (skill.aoe !== "single") {
          const e = this.effects[this.effects.length - 1];
          e.age = -0.04 * manhattan(center, u.pos);
        }
      }
  ```
  (`manhattan` imported @ line 8. `this.effects[length-1]` is the effect we just pushed in `pushEffect`.)

- [ ] **Step 10: Verify the stagger composes with the `age < 0` guard.** In `drawEffects` (Task 3.2 Step 3) the FIRST line of the loop is now `if (e.age < 0) continue;`. So a staggered AOE effect (seeded with a negative `e.age` in Step 9) draws NOTHING — not the impact frames, and crucially not a frame-0 projectile stacked at the caster — until its `age` crawls up to 0. Only then does it launch: a projectile family (`from` set, `travel>0`) flies for `travel` seconds and then impacts; a non-projectile AOE (holy/status, `travel=0`) plays its impact frames in place. That is the desired center-out ripple. The cull `life` from Task 3.2 Step 4 already tolerates a negative start (the effect simply lives a touch longer). Confirm by re-reading the head of the loop:
  ```ts
      for (const e of view.effects) {
        if (e.age < 0) continue; // staggered pre-delay — not launched yet
        const travel = e.travel ?? 0;
        const flying = e.from !== undefined && e.age < travel;
        // ...
      }
  ```
  No code change needed here — this is a read-only verification that the Step 9 stagger + the Step-3 guard compose correctly (without it, every staggered projectile would draw frame 0 piled on the caster during its delay).

- [ ] **Step 11: Type-check.** `npx tsc --noEmit`. Expected: clean.

- [ ] **Step 12: Regression-proof.** `npx vitest run`. Expected: all green (status application is logic-untouched — we only added a render Map + draw-time stagger).

- [ ] **Step 13: MANUAL VERIFY.** Launch the app. Checklist: (a) cast a buff (e.g. Haste/Protect) on an ally and a debuff (Slow) on an enemy → the recipient's SPRITE briefly flashes in the status color (~0.3s, fading), distinct from the floating status word. (b) Cast an AOE damage skill (cross/square aoe) over a clump of enemies → the impact VFX ignite center-first and ripple outward over a few frames, not all-at-once. (c) Single-target casts are unchanged (no stagger). No flicker/garbage outside the sprite from the tint pass.

- [ ] **Step 14: Commit.**
  ```
  git add -A && git commit -m "feat(juice): status-apply body flash + center-out AOE stagger"
  ```

---

### Task 3.5: Leap arc + landing dust

**Files:** Modify `src/scenes/battleScene.ts` (`leaping` field + `resolveLeapMove` ~1099), `src/scenes/battleView.ts` (`ViewScene` ~41, `computeUnitOffsets` ~140)

Leap skills currently slide the caster flat to the landing tile. Give the leap a vertical parabola (`hump()` from tween.ts) and kick up dust on landing. Apply the arc in `battleView`'s `computeUnitOffsets` (a pixel offset) — NOT in `animPos` — so we never touch the shared walk-tween semantics. Leap state stays SCENE-SIDE (a `Set<string>`), never on the core `Unit` type — mirroring how `hitShake`/`lunge`/`effects` already keep render juice out of `src/core`.

- [ ] **Step 1: Add a scene-side `leaping` set (NOT a field on the core `Unit` type).** Render-only juice state already lives in `BattleScene` (`hitShake`, `lunge`, `effects`), never in `src/core/types`. Keep leap state the same way so `Unit` stays render-free (preserving the logic/render split). In `src/scenes/battleScene.ts`, next to the `lunge` field (~:104), add:
  ```ts
    private leaping = new Set<string>(); // unitIds currently mid-leap (render arc hint)
  ```

- [ ] **Step 2: Set/clear the leap flag around the move.** Read `resolveLeapMove`'s move @ ~1099-1102:
  ```ts
      void this.ctx.animator.moveAlong(caster.id, [caster.pos, land]);
      caster.pos = { ...land };
      caster.facing = directionTo(caster.pos, victim.pos);
      return true;
  ```
  Replace with (flag on, attach the flag-clear + landing dust to the tween's completion — keep the existing non-blocking `void` semantics, do NOT make the method async):
  ```ts
      const id = caster.id;
      this.leaping.add(id);
      const leapTo = { ...land };
      void this.ctx.animator.moveAlong(id, [caster.pos, leapTo]).then(() => {
        this.leaping.delete(id);
        this.pushEffect(leapTo, "physical"); // a small impact puff on landing
      });
      caster.pos = { ...land };
      caster.facing = directionTo(caster.pos, victim.pos);
      return true;
  ```
  > Rationale: `resolveLeapMove` is called with `void`/non-awaited at all three call sites (castSkill ~929, resolveCast path, runEnemyTurn ~1435) and it already fires `moveAlong` with `void`. Keeping it synchronous and attaching `.then()` preserves the existing non-blocking semantics (logic continues immediately, pos already updated) — we only piggyback the set-clear + dust on the tween's completion. Do NOT change the method to `async`; that would ripple into the call sites.

- [ ] **Step 3: Surface the leap set on `ViewScene`.** In `src/scenes/battleView.ts`, add a field to the `ViewScene` interface next to `lunge` (~:55):
  ```ts
    leaping: Set<string>;
  ```
  The structural cast `scene as unknown as ViewScene` in `buildView` already exposes the class's `leaping` set — no separate view-assembly line is needed, same as `hitShake`/`lunge`, which `computeUnitOffsets` reads straight off `s`.

- [ ] **Step 4: Import `hump` into `battleView.ts`.** Read the import block top of `battleView.ts` (the `accessibility` import @ ~12). Add directly after it:
  ```ts
  import { hump } from "../engine/tween";
  ```

- [ ] **Step 5: Arc the leaping unit in `computeUnitOffsets`.** Read the tail of `computeUnitOffsets` @ ~149-167 (the lunge block + return):
  ```ts
    if (s.lunge) {
      const att = s.units.find((u) => u.id === s.lunge!.id);
      if (att) {
        ...
        offsets.set(s.lunge.id, { dx: prev.dx + vx * f, dy: prev.dy + vy * f });
      }
    }
    return offsets;
  }
  ```
  Insert a leap-arc block just BEFORE `return offsets;`:
  ```ts
    if (s.lunge) {
      const att = s.units.find((u) => u.id === s.lunge!.id);
      if (att) {
        ...
        offsets.set(s.lunge.id, { dx: prev.dx + vx * f, dy: prev.dy + vy * f });
      }
    }
    // Leap arc: while a unit's `leaping` flag is set, lift it on a 0->1->0 parabola
    // (hump) so the hop reads as an airborne pounce, not a flat slide. Keyed off the
    // animator's own progress so the peak lands mid-flight. Suppressed for reduced
    // motion (a big vertical jump is disorienting juice).
    if (!prefersReducedMotion()) {
      for (const u of s.units) {
        if (!s.leaping.has(u.id)) continue;
        const ap = s.ctx.animator.animPos.get(u.id);
        if (!ap) continue;
        // Fraction of the single leap segment travelled = distance covered / total.
        const total = Math.abs(u.pos.x - ap.x) + Math.abs(u.pos.y - ap.y);
        // animPos walks FROM start TO u.pos; we don't know the start tile here, so
        // approximate flight progress by remaining-distance: near u.pos => near 1.
        // hump() peaks at frac 0.5, so we feed a 0->1 progress and accept symmetry.
        const frac = total <= 0 ? 1 : 1 - Math.min(1, total);
        const lift = hump(frac) * 18; // peak px lifted off the ground
        const prev = offsets.get(u.id) ?? { dx: 0, dy: 0 };
        offsets.set(u.id, { dx: prev.dx, dy: prev.dy - lift });
      }
    }
    return offsets;
  }
  ```
  > NOTE on `frac`: `animPos` interpolates start→`u.pos`, and by the time `computeUnitOffsets` runs `u.pos` is already the landing tile (set in Step 2). The animator's `animPos` lerps from the start tile toward `path[last]` (= landing). So `|u.pos - ap.x|+|u.pos - ap.y|` shrinks from segment-length down to 0 as it lands — i.e. it's "remaining distance," not progress. For a single-tile leap (length 1) this gives `frac = 1 - remaining`, a clean 0→1. For a multi-tile leap (leapLanding can return a tile up to jump distance away) the magnitude exceeds 1 and `Math.min(1, total)` clamps, flattening the early arc — acceptable for the rare long leap. `hump(frac)` then rises 0→1→0 with peak near landing; that reads as a descending pounce, which is the desired feel.

- [ ] **Step 6: Type-check.** `npx tsc --noEmit`. Expected: clean. (Leap state is a scene-side `Set<string>` plus one `ViewScene` field — the core `Unit` type is untouched, so no exhaustiveness or unit-construction checks shift.)

- [ ] **Step 7: Regression-proof.** `npx vitest run`. Expected: all green. Leap state lives entirely in `BattleScene` + the view layer (never in `src/core`/`src/battle`), so unit-construction and combat tests are unaffected.

- [ ] **Step 8: MANUAL VERIFY.** Launch the app. Checklist: give/select a unit a leap skill (e.g. Dragoon Jump or any `leap: true` skill), cast it at a non-adjacent enemy → the caster visibly arcs UP and over to the adjacent landing tile (not a flat slide), and a small dust/impact puff plays on the landing tile as it touches down. The strike resolves immediately after (logic isn't blocked on the hop). Adjacent-target leaps (strike in place) show no arc. With reduced-motion enabled, the leap slides flat (no vertical arc) — verify by toggling the OS/CSS reduced-motion preference.

- [ ] **Step 9: Commit.**
  ```
  git add -A && git commit -m "feat(juice): leap arc trajectory + landing dust"
  ```

---

## Phase 4 — Ambience & lower-impact polish

This phase lands last: highest life-per-pixel, lowest gameplay risk. It adds an optional `ambience` tag to `MapDef`, sky/vignette/particle/tint atmosphere in the renderer, wind sway on vegetation, an HP-drain tween, and a grab-bag of UI grace notes. Every motion gates on `prefersReducedMotion()` (canvas) or the `.reduced-motion` CSS class (DOM). The logic/render split is preserved: `ambience` is a plain optional data field on `MapDef` (no render import), and all new motion lives in `renderer.ts` / `battleView.ts` / `battleUI.ts` / `styles.ts`, never in `src/core` or `src/battle`.

Before starting, confirm the baseline is green:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass (~1552).

---

### Task 4.1: Optional `ambience` tag on `MapDef`

**Files:**
- Modify: `src/core/types.ts` (the `MapDef` interface, ends ~:291)
- Test: `tests/ambience.test.ts` (create)

This is the only Phase-4 task that touches a node-tested file. The field is pure data (no render import), so the split holds. Test asserts the optional field is structurally accepted and that the real maps still load with valid (or absent) ambience.

- [ ] **Step 1: Add the `AmbiencePreset` + `Ambience` types to `src/core/types.ts`.** Insert directly ABOVE the `MapDef` interface (just before the line `export interface MapDef {` at ~:266):

```ts
/** Which biome particle preset drifts over a map (purely cosmetic). */
export type AmbiencePreset = "embers" | "snow" | "dust";

/**
 * Optional per-map atmosphere. All fields cosmetic and optional — the renderer
 * falls back to today's look when absent. Imports no render code, so the
 * logic/render split is preserved.
 */
export interface Ambience {
  /** Vertical sky gradient [topColor, horizonColor] drawn behind the scene. */
  sky?: [string, string];
  /** Full-canvas mood wash (any CSS color); applied at <=0.08 alpha. */
  tint?: string;
  /** Drifting biome motes. */
  particles?: AmbiencePreset;
}
```

- [ ] **Step 2: Add the optional `ambience` field to `MapDef`.** In `src/core/types.ts`, inside the `MapDef` interface, add the field after the `decor` field (currently the last field, ~:290):

```ts
  decor?: { pos: Point; propId: string }[];
  /** Optional cosmetic atmosphere (sky gradient, mood tint, drifting particles).
   *  Absent ⇒ the renderer uses its default look. */
  ambience?: Ambience;
}
```

- [ ] **Step 3: Write the failing test.** Create `tests/ambience.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PHASES } from "../src/data/maps";
import type { MapDef, AmbiencePreset } from "../src/core/types";

const PRESETS: AmbiencePreset[] = ["embers", "snow", "dust"];

describe("MapDef ambience", () => {
  it("accepts a fully-specified ambience tag (structural)", () => {
    const m: MapDef = {
      id: "t", name: "t", intro: "", width: 1, height: 1,
      heights: [[0]], playerSpawns: [], enemies: [],
      ambience: { sky: ["#101524", "#3a2c20"], tint: "#ff6a2a", particles: "embers" },
    };
    expect(m.ambience?.particles).toBe("embers");
  });

  it("every campaign map either omits ambience or supplies valid fields", () => {
    for (const map of PHASES) {
      const a = map.ambience;
      if (!a) continue;
      if (a.sky) {
        expect(a.sky).toHaveLength(2);
        for (const c of a.sky) expect(typeof c).toBe("string");
      }
      if (a.tint) expect(typeof a.tint).toBe("string");
      if (a.particles) expect(PRESETS).toContain(a.particles);
    }
  });
});
```

- [ ] **Step 4: Run the test.** Run:

```
npx vitest run tests/ambience.test.ts
```
Expected: PASS (both cases). The field is data-only, so this passes once the types compile — confirm with `npx tsc --noEmit` (expect: no errors).

- [ ] **Step 5: Commit.**

```
git add src/core/types.ts tests/ambience.test.ts
git commit -m "feat(juice): optional ambience tag on MapDef (sky/tint/particles)"
```

---

### Task 4.2: Renderer reads ambience with safe defaults

**Files:**
- Modify: `src/engine/renderer.ts` (the `BattleView` interface ~:77-107; `render()` ~:188-203)

The renderer never imports `MapDef`. `buildView` (battleView.ts) will pass the ambience values through the `BattleView` snapshot in the next task; here we add the field to `BattleView` and a default-resolver helper. No behavior change yet (field will be `undefined` until Task 4.3 wires it).

- [ ] **Step 1: Import the `Ambience` type.** In `src/engine/renderer.ts`, edit the existing first import line (currently `import type { Point, StatusKind, TerrainType, Unit } from "../core/types";`) to add `Ambience`:

```ts
import type { Ambience, Point, StatusKind, TerrainType, Unit } from "../core/types";
```

- [ ] **Step 2: Add the `ambience` field to `BattleView`.** In `src/engine/renderer.ts`, inside the `BattleView` interface, add after the `props?` field (the last field, ~:106):

```ts
  /** Decoration props to draw on the field (baked into their tile's canvas). */
  props?: PlacedProp[];
  /** Optional per-map atmosphere (sky/tint/particles). Absent ⇒ default look. */
  ambience?: Ambience;
```

- [ ] **Step 3: Add the default-resolver constant + helper.** In `src/engine/renderer.ts`, directly below the `COLOR` object (after its closing `};` ~:120), add:

```ts
/** Today's look when a map supplies no ambience: a cool dark sky fading to a
 *  warmer horizon. Tint/particles default off (no wash, no motes). */
const DEFAULT_SKY: [string, string] = ["#0e1322", "#241a14"];
```

- [ ] **Step 4: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass (field is optional and unread, zero behavior change).

- [ ] **Step 5: Commit.**

```
git add src/engine/renderer.ts
git commit -m "feat(render): plumb optional ambience through BattleView (no-op default)"
```

---

### Task 4.3: Wire ambience through `buildView`

**Files:**
- Modify: `src/scenes/battleView.ts` (the returned `BattleView` object in `buildView` ~:109-128)

`buildView` already reads `s.map` (the `MapDef`). Pass its `ambience` into the snapshot. This is the bridge — after this, the renderer sees real per-map values.

- [ ] **Step 1: Add `ambience` to the returned view.** In `src/scenes/battleView.ts`, in the object returned by `buildView`, add after the `props: s.props,` line (~:127):

```ts
    chests: s.chests.filter((c) => !c.opened).map((c) => ({ ...c.pos })),
    props: s.props,
    ambience: s.map.ambience,
  };
```

- [ ] **Step 2: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass (`s.map` is already in the `ViewScene` interface; `ambience` is optional).

- [ ] **Step 3: Commit.**

```
git add src/scenes/battleView.ts
git commit -m "feat(render): pass map ambience into the per-frame view"
```

---

### Task 4.4: Sky / atmosphere gradient + vignette

**Files:**
- Modify: `src/engine/renderer.ts` (`render()` ~:188-203; add `drawSky` method)

Replace the bare `clearRect` look with a full-canvas vertical sky gradient + radial vignette, drawn in SCREEN space (before the shake/scale transform) so the sky never pans or scales with the scene. The gradient draws over the cleared canvas FIRST, then the transformed scene paints on top.

- [ ] **Step 1: Add the `drawSky` method.** In `src/engine/renderer.ts`, add this method directly below the `clear()` method (after its closing `}` at ~:180):

```ts
  /** Full-canvas sky gradient + radial vignette in screen space. Drawn before the
   *  scene's shake/scale transform so the backdrop never pans or zooms with the
   *  field. Colors come from ambience.sky or a cool-dark default. */
  private drawSky(view: BattleView): void {
    const ctx = this.ctx;
    const [top, horizon] = view.ambience?.sky ?? DEFAULT_SKY;
    const g = ctx.createLinearGradient(0, 0, 0, this.height);
    g.addColorStop(0, top);
    g.addColorStop(1, horizon);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.width, this.height);
    // Radial vignette: transparent center sinking to dark at the corners, to
    // pull focus toward the battlefield middle.
    const cx = this.width / 2;
    const cy = this.height / 2;
    const r = Math.hypot(cx, cy);
    const vg = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.width, this.height);
  }
```

- [ ] **Step 2: Call `drawSky` first in `render()`.** In `src/engine/renderer.ts`, in `render()`, insert the `drawSky` call between `this.clear();` and the shake/scale block (~:189):

```ts
  render(view: BattleView): void {
    this.clear();
    this.drawSky(view);
    const shake = view.screenShake;
    const scale = view.scale ?? 1;
```

- [ ] **Step 3: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass (renderer is never node-imported).

- [ ] **Step 4: MANUAL VERIFY (render-only — reliable per repo convention).** Launch the dev app (`npm run dev`) and drive it via the system browser per the repo's puppeteer-core verification flow. Start a battle and confirm:
  - The background is a vertical gradient (darker at the top, warmer toward the bottom), NOT a flat single color.
  - Screen corners are visibly darker than the center (vignette).
  - Panning/zooming the camera moves the FIELD but the sky/vignette stay fixed to the viewport (they do not slide or scale).
  - No seams or clipped edges at any zoom level.

- [ ] **Step 5: Commit.**

```
git add src/engine/renderer.ts
git commit -m "feat(render): screen-space sky gradient + vignette backdrop"
```

---

### Task 4.5: Biome particle pool

**Files:**
- Modify: `src/engine/renderer.ts` (add a `Mote` interface, particle pool fields, `advanceParticles` + `drawParticles`; call from `render()`)

A small pool of 60 motes lives in the Renderer (NOT core), advances by `dt`, draws in SCREEN space (like the sky), and is preset from `ambience.particles`. The whole effect is gated on `prefersReducedMotion()`. The pool re-seeds when the preset changes.

- [ ] **Step 1: Import `prefersReducedMotion`.** In `src/engine/renderer.ts`, add this import below the existing `import { PROPS, type PlacedProp } from "../data/props";` line (~:8):

```ts
import { PROPS, type PlacedProp } from "../data/props";
import { prefersReducedMotion } from "./accessibility";
```

- [ ] **Step 2: Add the `Mote` interface.** In `src/engine/renderer.ts`, add directly below the `ForecastTag` interface (after its closing `}` ~:76):

```ts
/** One drifting ambience particle, in screen space. */
interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0..1 lifetime phase; mote recycles to the top/edge when it expires or exits. */
  life: number;
  /** seconds this mote lives before recycling. */
  ttl: number;
}
```

- [ ] **Step 3: Add the pool fields.** In `src/engine/renderer.ts`, inside the `Renderer` class, add after the `private static readonly ANIMATED` line (~:148):

```ts
  private static readonly ANIMATED: ReadonlySet<TerrainType> = new Set(["water", "spring", "lava"]);

  /** Ambience particle pool (screen space). Seeded lazily per preset. */
  private motes: Mote[] = [];
  private motePreset: Ambience["particles"] | null = null;
  private static readonly MOTE_COUNT = 60;
```

- [ ] **Step 4: Add the seed + advance + draw methods.** In `src/engine/renderer.ts`, add these three methods directly below `drawSky` (after its closing `}`):

```ts
  /** (Re)seed the mote pool for a preset, spread across the viewport. */
  private seedMotes(preset: NonNullable<Ambience["particles"]>): void {
    this.motePreset = preset;
    this.motes = [];
    for (let i = 0; i < Renderer.MOTE_COUNT; i++) this.motes.push(this.spawnMote(preset, true));
  }

  /** One mote with preset-specific velocity. `anywhere` seeds it at a random y
   *  (initial fill); otherwise it enters from the top edge (recycle). */
  private spawnMote(preset: NonNullable<Ambience["particles"]>, anywhere: boolean): Mote {
    const x = Math.random() * this.width;
    const y = anywhere ? Math.random() * this.height : -8;
    // embers rise; snow/dust settle. dust drifts faster sideways.
    const rise = preset === "embers";
    const vx = (preset === "dust" ? 22 : 10) * (Math.random() * 2 - 1);
    const vy = rise ? -(14 + Math.random() * 18) : 12 + Math.random() * 16;
    const ttl = 3 + Math.random() * 4;
    return { x, y: rise && anywhere ? y : y, vx, vy, life: 0, ttl };
  }

  /** Advance the pool by dt and recycle expired/off-screen motes. No-op (and
   *  clears the pool) when the preset is absent or reduced motion is on. */
  private advanceParticles(view: BattleView, dt: number): void {
    const preset = prefersReducedMotion() ? undefined : view.ambience?.particles;
    if (!preset) {
      if (this.motes.length) { this.motes = []; this.motePreset = null; }
      return;
    }
    if (preset !== this.motePreset) this.seedMotes(preset);
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life += dt;
      if (m.life >= m.ttl || m.y < -12 || m.y > this.height + 12 || m.x < -12 || m.x > this.width + 12) {
        this.motes[i] = this.spawnMote(preset, false);
      }
    }
  }

  /** Draw the mote pool in screen space (over the scene, under the HUD). */
  private drawParticles(view: BattleView): void {
    const preset = view.ambience?.particles;
    if (!preset || this.motes.length === 0) return;
    const ctx = this.ctx;
    const color = preset === "embers" ? "#ff9b4a" : preset === "snow" ? "#e8f2ff" : "#cdba94";
    for (const m of this.motes) {
      // Fade in at birth, fade out near death; triangular over life.
      const f = m.life / m.ttl;
      const alpha = (f < 0.2 ? f / 0.2 : f > 0.8 ? (1 - f) / 0.2 : 1) * 0.65;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(m.x), Math.round(m.y), preset === "snow" ? 2 : 1, preset === "snow" ? 2 : 2);
    }
    ctx.globalAlpha = 1;
  }
```

- [ ] **Step 5: Advance the pool from the scene's update tick.** The Renderer has no `dt` in `render()`. Drive the pool from `render()` using a per-frame time delta derived from `view.time` (the scene's accumulator). In `src/engine/renderer.ts`, add a `prevTime` field next to the mote fields (Step 3 block):

```ts
  private motePreset: Ambience["particles"] | null = null;
  private static readonly MOTE_COUNT = 60;
  /** Last view.time seen, to derive a per-frame dt for the particle pool. */
  private prevTime = 0;
```

Then in `render()`, advance + draw the pool. Edit `render()` so the body reads:

```ts
  render(view: BattleView): void {
    this.clear();
    this.drawSky(view);
    const dt = Math.max(0, Math.min(0.1, view.time - this.prevTime));
    this.prevTime = view.time;
    this.advanceParticles(view, dt);
    const shake = view.screenShake;
    const scale = view.scale ?? 1;
    const transformed = !!shake || scale !== 1;
    if (transformed) {
      this.ctx.save();
      if (shake) this.ctx.translate(shake.dx, shake.dy);
      if (scale !== 1) this.ctx.scale(scale, scale);
    }
    this.drawScene(view);
    this.drawEffects(view);
    this.drawPopups(view);
    this.drawForecast(view);
    if (transformed) this.ctx.restore();
    this.drawParticles(view);
  }
```

(The `dt` clamp at 0.1s guards against a long first-frame / tab-restore jump. Particles draw AFTER `restore()` so they live in screen space like the sky.)

- [ ] **Step 6: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass.

- [ ] **Step 7: MANUAL VERIFY (render-only).** Launch the app, start a battle whose map sets `ambience.particles` (after Task 4.8 lands; or temporarily set `particles: "embers"` on `phase1` to test now, then revert). Confirm:
  - Motes drift across the viewport: embers rise, snow/dust settle.
  - Motes fade in at spawn and out near death (no hard pop).
  - Toggle Reduced Motion ON in Settings → motes vanish entirely; toggle OFF → they return.
  - Motes stay fixed to the viewport (do not pan/zoom with the field).

- [ ] **Step 8: Commit.**

```
git add src/engine/renderer.ts
git commit -m "feat(juice): biome particle pool (embers/snow/dust), reduced-motion gated"
```

---

### Task 4.6: Per-map mood tint

**Files:**
- Modify: `src/engine/renderer.ts` (`render()`; add `drawTint`)

A single full-canvas `fillRect` at `<=0.08` alpha from `ambience.tint`, drawn at the very end of the frame (over scene + particles) so it washes the whole image. No tint ⇒ no-op.

- [ ] **Step 1: Add the `drawTint` method.** In `src/engine/renderer.ts`, add directly below `drawParticles`:

```ts
  /** A faint full-canvas mood wash from ambience.tint (<=0.08 alpha). No-op when
   *  the map sets no tint. Drawn last so it colors the whole composed frame. */
  private drawTint(view: BattleView): void {
    const tint = view.ambience?.tint;
    if (!tint) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
```

- [ ] **Step 2: Call it at the very end of `render()`.** In `src/engine/renderer.ts`, add the call after `this.drawParticles(view);` (the new last line of `render()`):

```ts
    if (transformed) this.ctx.restore();
    this.drawParticles(view);
    this.drawTint(view);
  }
```

- [ ] **Step 3: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass.

- [ ] **Step 4: MANUAL VERIFY (render-only).** Temporarily set `tint: "#ff4a1a"` on `phase1.ts` (revert after). Launch, start the battle, confirm a faint warm wash over the WHOLE frame (including the HUD-free field area) — subtle, not a colored overlay that drowns the art. Remove the temp tint.

- [ ] **Step 5: Commit.**

```
git add src/engine/renderer.ts
git commit -m "feat(render): per-map mood tint wash from ambience.tint"
```

---

### Task 4.7: Wind sway on vegetation props

**Files:**
- Modify: `src/engine/renderer.ts` (`drawScene` ~:303-326 tile branch; `bakeTile` ~:411-437; add `drawSwayProp`)

Today every prop is baked into its tile canvas (static). Pull the four vegetation props (`grass`/`tree`/`pineTree`/`flowerCluster` — note the scatter prop is `grassTuft`, so use that id) out of the static bake and live-draw them with a horizontal sin-shear applied to the upper rows, per-prop phase via `tileHash`. Boulders/walls/other props stay baked. Sway is off under reduced motion.

- [ ] **Step 1: Define the swaying-prop set.** In `src/engine/renderer.ts`, add directly above the `Renderer` class (after the `key` function ~:138):

```ts
/** Vegetation props that sway in the wind (live-drawn, not baked). All other
 *  props (boulders, walls, rubble…) stay in the static tile bake. */
const SWAY_PROPS: ReadonlySet<string> = new Set(["grassTuft", "flowerCluster", "tree", "pineTree"]);
```

- [ ] **Step 2: Skip swaying props in the bake.** In `src/engine/renderer.ts`, in `bakeTile` (~:411), make the prop bake skip swaying ids so they aren't baked into the tile. Change the `prop` lookup line (~:414):

```ts
    const wallH = z * TILE_Z;
    const prop = propId && !SWAY_PROPS.has(propId) ? PROPS[propId] : undefined;
```

(`bakeTile`'s cache key still includes `propId`; a swaying prop now bakes a tile with no prop, but the key stays unique per id — harmless. The live sway draw in Step 4 supplies the visual.)

- [ ] **Step 3: Add the `drawSwayProp` method.** In `src/engine/renderer.ts`, add directly below `drawChest` (after its closing `}` ~:401):

```ts
  /** Live-draw a vegetation prop on its tile with a horizontal wind shear that
   *  grows toward the top (roots stay planted, crown sways). Per-prop phase from
   *  tileHash so neighbors don't sway in lockstep. Sway disabled for reduced motion. */
  private drawSwayProp(center: ScreenPoint, propId: string, tx: number, ty: number, time: number): void {
    const prop = PROPS[propId];
    if (!prop) return;
    const canvas = bakeSprite(prop.sprite, PROP_SCALE);
    const ctx = this.ctx;
    const baseX = center.sx;
    const baseY = center.sy + 4; // roots at the tile-top center
    const phase = this.tileHash(tx, ty, 11) * Math.PI * 2;
    const sway = prefersReducedMotion() ? 0 : Math.sin(time * 1.6 + phase) * 3;
    const w = canvas.width;
    const h = canvas.height;
    // Slice the sprite into horizontal bands; shift each band sideways by an
    // amount that ramps from 0 at the base to `sway` at the crown.
    const BANDS = 6;
    const bandH = h / BANDS;
    for (let b = 0; b < BANDS; b++) {
      const sy = b * bandH;
      const t = 1 - (b + 0.5) / BANDS; // 0 at bottom band, ~1 at top band
      const shear = sway * t;
      ctx.drawImage(
        canvas,
        0, sy, w, bandH,
        Math.round(baseX - w / 2 + shear), Math.round(baseY - h + sy), w, bandH,
      );
    }
  }
```

- [ ] **Step 4: Call `drawSwayProp` from the tile branch of `drawScene`.** In `src/engine/renderer.ts`, in `drawScene`, inside the `if (it.kind === "tile")` block, after the `drawTileFringe` call and before the overlay `cols` block (~:324), add the live sway draw:

```ts
        this.drawTileFringe(view, center, it.x, it.y, z, ao);
        if (propId && SWAY_PROPS.has(propId)) this.drawSwayProp(center, propId, it.x, it.y, view.time);
        const cols = overlays.get(`${it.x},${it.y}`);
```

- [ ] **Step 5: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass (`props.test.ts` checks scatter placement, not draw — unaffected).

- [ ] **Step 6: MANUAL VERIFY (render-only).** Launch, start a grassy map (phase1 has grass scatter). Confirm:
  - Grass tufts / trees gently sway side-to-side; the base stays planted while the crown moves most (shear ramp).
  - Neighboring tufts are out of phase (not a synchronized wave).
  - Boulders / walls / rubble do NOT move.
  - Reduced Motion ON → all sway stops (props render upright). OFF → sway returns.
  - No flicker or vertical gap between sprite bands.

- [ ] **Step 7: Commit.**

```
git add src/engine/renderer.ts
git commit -m "feat(juice): wind sway on vegetation props, reduced-motion gated"
```

---

### Task 4.8: Populate the 17 campaign maps' ambience (data task)

**Files:**
- Modify: each map file under `src/data/maps/` (add an `ambience` field per map)
- Test: `tests/ambience.test.ts` (extend coverage)

Pure data. `PHASES` (in `src/data/maps/index.ts`) holds 17 maps. Tag each with biome-appropriate atmosphere. Field is optional, so any map left untagged still renders the default — but the goal is to dress all of them. Sky colors are `[top, horizon]`; tint is a faint wash; particles match the biome.

- [ ] **Step 1: Apply ambience to the snow/ice map.** In `src/data/maps/frostspirePass.ts`, add as the last field of the `frostspirePass` object (before the closing `};`):

```ts
  ambience: { sky: ["#1a2740", "#6b7a96"], tint: "#9fc8ff", particles: "snow" },
```

- [ ] **Step 2: Apply ambience to the fire/ember maps.** Add the same-shaped field (last field, before `};`) to each of these:
  - `src/data/maps/cinderFields.ts`: `ambience: { sky: ["#1c0f0a", "#5a2410"], tint: "#ff5a1e", particles: "embers" },`
  - `src/data/maps/emberfallQuarry.ts`: `ambience: { sky: ["#1f110a", "#612812"], tint: "#ff6a22", particles: "embers" },`
  - `src/data/maps/phase5.ts` (Maldrath's stand finale): `ambience: { sky: ["#140a12", "#4a1422"], tint: "#ff3a3a", particles: "embers" },`

- [ ] **Step 3: Apply ambience to the arid/dusty maps.** Add to each:
  - `src/data/maps/saltflatMirage.ts`: `ambience: { sky: ["#2a2436", "#caa46a"], tint: "#e8c060", particles: "dust" },`
  - `src/data/maps/howlingSteppe.ts`: `ambience: { sky: ["#23283a", "#8a7a58"], tint: "#cbb070", particles: "dust" },`
  - `src/data/maps/maldrathsApproach.ts`: `ambience: { sky: ["#1a1422", "#3a2c3a"], tint: "#a06a8a", particles: "dust" },`

- [ ] **Step 4: Apply ambience to the green/ruin/forest maps.** Add to each:
  - `src/data/maps/phase1.ts`: `ambience: { sky: ["#142036", "#3a5230"] },`
  - `src/data/maps/phase2.ts`: `ambience: { sky: ["#142036", "#3a5230"] },`
  - `src/data/maps/phase3.ts`: `ambience: { sky: ["#13202f", "#2f4a3a"] },`
  - `src/data/maps/verdantRuins.ts`: `ambience: { sky: ["#101e2a", "#2c4a38"], tint: "#5fd08a" },`
  - `src/data/maps/gravewatchHollow.ts`: `ambience: { sky: ["#0e1424", "#283042"], tint: "#6a7aa0" },`

- [ ] **Step 5: Apply ambience to the water/stone keep maps.** Add to each:
  - `src/data/maps/sunkenCauseway.ts`: `ambience: { sky: ["#0e1a2c", "#1f4256"], tint: "#3a9ad0" },`
  - `src/data/maps/drownedVault.ts`: `ambience: { sky: ["#0a1422", "#173848"], tint: "#2f88c0" },`
  - `src/data/maps/outerRamparts.ts`: `ambience: { sky: ["#161a26", "#3a3a44"] },`
  - `src/data/maps/ironholdGate.ts`: `ambience: { sky: ["#14161f", "#33343c"] },`
  - `src/data/maps/phase4.ts`: `ambience: { sky: ["#141826", "#34384a"] },`

- [ ] **Step 6: Strengthen the test to require coverage.** In `tests/ambience.test.ts`, add a third case inside the `describe("MapDef ambience", …)` block:

```ts
  it("tags every campaign map with a sky gradient", () => {
    for (const map of PHASES) {
      expect(map.ambience, `${map.id} missing ambience`).toBeDefined();
      expect(map.ambience?.sky, `${map.id} missing sky`).toHaveLength(2);
    }
  });
```

- [ ] **Step 7: Run the test.** Run:

```
npx vitest run tests/ambience.test.ts
```
Expected: PASS (all 17 maps now have `sky`). Then `npx tsc --noEmit` (expect: no errors).

- [ ] **Step 8: Full suite + typecheck.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass (`maps.test.ts` invariants unaffected — ambience adds no structural constraints).

- [ ] **Step 9: MANUAL VERIFY (render-only).** Launch and step through 3 contrasting maps (a snow map, a fire map, a green map). Confirm each reads with a distinct sky tone + appropriate particles (snow vs embers vs none), and that the mood tint suits the biome. No map should look broken or washed-out.

- [ ] **Step 10: Commit.**

```
git add src/data/maps tests/ambience.test.ts
git commit -m "feat(maps): per-biome ambience (sky/tint/particles) on all 17 maps"
```

---

### Task 4.9: HP-bar drain tween

**Files:**
- Modify: `src/engine/renderer.ts` (the HP bar in `drawUnit` ~:723-732; add an `hpDrain` Map + `tween` import)

When a unit takes damage, ease the lost chunk of the HP bar over ~0.2s and render a secondary "lost" segment (a paler bar that drains down to the new HP). Uses an `hpDrain` Map per unit driven off `view.time`, plus `easeOutQuad` from the locked `tween.ts` API. Drain motion is gated on `prefersReducedMotion()` (snap to current HP).

- [ ] **Step 1: Import the tween easing.** In `src/engine/renderer.ts`, add below the `prefersReducedMotion` import (added in Task 4.5):

```ts
import { prefersReducedMotion } from "./accessibility";
import { easeOutQuad, clamp01 } from "./tween";
```

- [ ] **Step 2: Add the drain-state fields.** In `src/engine/renderer.ts`, inside the `Renderer` class, add next to the mote fields (Task 4.5 Step 3 block):

```ts
  /** Last view.time seen, to derive a per-frame dt for the particle pool. */
  private prevTime = 0;
  /** Per-unit HP-bar drain state. `prev` = the hpFrac seen last frame (to detect a
   *  drop), `from` = the fraction the "lost" segment drains FROM, `startedAt` = when
   *  the current drain armed (view.time). Keyed by unit id. */
  private hpDrain = new Map<string, { prev: number; from: number; startedAt: number }>();
  private static readonly HP_DRAIN_DUR = 0.2;
```

- [ ] **Step 3: Replace the HP bar fill with a draining version.** In `src/engine/renderer.ts`, in `drawUnit`, replace the existing HP-bar block (~:724-732):

```ts
    const topY = drawY;
    // HP bar.
    const barW = 42;
    const barX = center.sx - barW / 2;
    const barY = topY - 10;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(barX - 1, barY - 1, barW + 2, 5);
    const hpFrac = unit.stats.hp / unit.stats.maxHp;
    ctx.fillStyle = hpFrac > 0.5 ? "#5fbf72" : hpFrac > 0.25 ? "#d6cf5f" : "#d65f5f";
    ctx.fillRect(barX, barY, barW * hpFrac, 3);
```

with:

```ts
    const topY = drawY;
    // HP bar.
    const barW = 42;
    const barX = center.sx - barW / 2;
    const barY = topY - 10;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(barX - 1, barY - 1, barW + 2, 5);
    const hpFrac = unit.stats.hp / unit.stats.maxHp;
    // Drain: when HP drops, paint a pale "lost" segment that eases down from the
    // previous fill to the new one over HP_DRAIN_DUR (snapped under reduced motion).
    const drainFrac = this.hpDrainFrac(unit.id, hpFrac, time);
    if (drainFrac > hpFrac) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillRect(barX, barY, barW * drainFrac, 3);
    }
    ctx.fillStyle = hpFrac > 0.5 ? "#5fbf72" : hpFrac > 0.25 ? "#d6cf5f" : "#d65f5f";
    ctx.fillRect(barX, barY, barW * hpFrac, 3);
```

- [ ] **Step 4: Add the `hpDrainFrac` helper.** In `src/engine/renderer.ts`, add directly above `drawUnit` (before `private drawUnit(` ~:669):

```ts
  /** Eased fraction the "lost" HP segment currently reaches. Tracks per-unit prev
   *  HP across frames so a *drop since last frame* arms a fresh 0.2s ease from the
   *  previous fill down to the new one. A heal/revive or no-change snaps with no lost
   *  segment. Reduced motion snaps. CRITICAL: arm `startedAt` ONLY on a real drop —
   *  arming it on the first-ever-seen frame would make every later hit compute
   *  t = (now - long_ago)/DUR >= 1 and snap instantly (no visible drain). */
  private hpDrainFrac(id: string, hpFrac: number, time: number): number {
    let d = this.hpDrain.get(id);
    if (d === undefined) {
      // First sight: record current, no lost segment.
      this.hpDrain.set(id, { prev: hpFrac, from: hpFrac, startedAt: time });
      return hpFrac;
    }
    if (hpFrac < d.prev) {
      // HP dropped since last frame → arm a fresh drain FROM the previous level
      // (snap instead under reduced motion).
      d = prefersReducedMotion()
        ? { prev: hpFrac, from: hpFrac, startedAt: time }
        : { prev: hpFrac, from: d.prev, startedAt: time };
      this.hpDrain.set(id, d);
    } else if (hpFrac > d.prev) {
      // HP rose (heal/revive) → snap with NO lost segment, even on a PARTIAL heal
      // that's still below the old drain origin (the case the first pass missed:
      // a 40%→60% heal must not leave a pale segment hanging at ~70%).
      d = { prev: hpFrac, from: hpFrac, startedAt: time };
      this.hpDrain.set(id, d);
    }
    // else: unchanged since last frame — d.prev already equals hpFrac; let any
    // in-flight drain keep easing toward the current HP (don't reset it).
    if (prefersReducedMotion()) return hpFrac;
    const t = clamp01((time - d.startedAt) / Renderer.HP_DRAIN_DUR);
    return d.from + (hpFrac - d.from) * easeOutQuad(t);
  }
```

- [ ] **Step 5: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass. (Requires `src/engine/tween.ts` from Phase 0 — `easeOutQuad`/`clamp01` are part of the locked API.)

- [ ] **Step 6: MANUAL VERIFY (render-only).** Launch, attack an enemy. Confirm:
  - On a hit, the HP bar shows a pale segment that drains down to the new (colored) HP level over a short beat, then disappears.
  - Multiple quick hits re-arm the drain from the new level each time (no stuck pale segment).
  - Healing/reviving grows the colored bar with NO pale lost segment.
  - Reduced Motion ON → HP bar snaps with no drain animation.

- [ ] **Step 7: Commit.**

```
git add src/engine/renderer.ts
git commit -m "feat(juice): HP-bar drain tween with a fading lost segment"
```

---

### Task 4.10: Breathing pulse on hovered tile / skill range

**Files:**
- Modify: `src/engine/renderer.ts` (`drawScene` overlay paint ~:325-326; `COLOR.hover` ~:114; add a pulsed-alpha helper)

Modulate the hover-tile alpha by `0.5 + 0.5 * sin(time * 4)` so the highlight breathes, drawing focus without a hard static box. Pulse is suppressed under reduced motion (static alpha). The `aoe`/`attack` range tints stay constant — only the single hover diamond breathes (cheap, one tile).

- [ ] **Step 1: Import `prefersReducedMotion` (already imported in Task 4.5).** No new import needed — confirm `import { prefersReducedMotion } from "./accessibility";` is present near the top of `src/engine/renderer.ts`.

- [ ] **Step 2: Add a `hoverPulseColor` helper.** In `src/engine/renderer.ts`, add directly above `paintDiamond` (before `private paintDiamond(` ~:352):

```ts
  /** The hover overlay color with a breathing alpha (0.11..0.33 over time).
   *  Static at the midpoint under reduced motion. */
  private hoverPulseColor(time: number): string {
    const pulse = prefersReducedMotion() ? 0.5 : 0.5 + 0.5 * Math.sin(time * 4);
    const alpha = 0.11 + 0.22 * pulse;
    return `rgba(255,255,255,${alpha.toFixed(3)})`;
  }
```

(Base hover today is `rgba(255,255,255,0.22)` — this oscillates around that value.)

- [ ] **Step 3: Swap the hover color in the overlay paint.** In `src/engine/renderer.ts`, in `drawScene`, the tile branch paints overlay colors via `for (const c of cols) this.paintDiamond(center, c);` (~:326). Replace that single line so the hover color is substituted with the pulsing one:

```ts
        const cols = overlays.get(`${it.x},${it.y}`);
        if (cols) for (const c of cols) this.paintDiamond(center, c === COLOR.hover ? this.hoverPulseColor(view.time) : c);
```

(`COLOR.hover` is the exact constant pushed by `overlayColors` for the hover tile, so the identity compare `c === COLOR.hover` reliably targets only the hover diamond.)

- [ ] **Step 4: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass.

- [ ] **Step 5: MANUAL VERIFY (render-only).** Launch, hover tiles during a move/target phase. Confirm:
  - The hovered tile's white highlight gently pulses brighter/dimmer (breathing), while the blue move-range / orange AoE tints stay steady.
  - Reduced Motion ON → hover highlight is steady (no breathing). OFF → it breathes.

- [ ] **Step 6: Commit.**

```
git add src/engine/renderer.ts
git commit -m "feat(juice): breathing pulse on the hovered tile highlight"
```

---

### Task 4.11: Dedup per-frame `setTargetInfo` + `.panel` enter fade

**Files:**
- Modify: `src/ui/battleUI.ts` (`setTargetInfo` ~:178-186; add a cache field)
- Modify: `src/ui/styles.ts` (`.panel` ~:32; add an enter-fade + reduced-motion override)

`setTargetInfo` rebuilds the target panel's DOM every frame the pointer hovers a unit (called from `battleScene.update` ~:1657). Dedup it: cache the last shown unit id + the fields it renders, early-return when nothing changed. THEN add a one-shot fade-in on the panel when it (re)opens, gated by the existing `.reduced-motion` CSS path.

- [ ] **Step 1: Add the dedup cache field.** In `src/ui/battleUI.ts`, add next to `toastTimer` (~:55):

```ts
  private toastTimer = 0;
  /** Signature of the last target panel content, so the per-frame setTargetInfo
   *  early-returns when nothing the panel shows has changed (no DOM rebuild). */
  private lastTargetSig: string | null = null;
```

- [ ] **Step 2: Rewrite `setTargetInfo` to dedup + fade.** In `src/ui/battleUI.ts`, replace the whole `setTargetInfo` method (~:178-186):

```ts
  setTargetInfo(unit: Unit | null, recruitHint?: string): void {
    if (!unit) {
      if (this.lastTargetSig !== null) {
        this.targetPanel.style.display = "none";
        this.lastTargetSig = null;
      }
      return;
    }
    // Signature MUST cover every field unitPanelContent() + reactionLine() render,
    // or the panel goes stale when an omitted field changes. JSON.stringify(stats)
    // captures all combat stats at once (hp/mp + atk/def/mag/res/spd/mov). Include
    // class/race/team, level/xp/sp, equipment, sub-job, reaction, statuses, learned
    // skills, and the recruit hint. (pos/facing aren't shown in this panel.)
    const sig = [
      unit.id, unit.name, unit.classId, unit.raceId, unit.team,
      unit.level, unit.xp, unit.sp,
      JSON.stringify(unit.stats),
      unit.weaponId, unit.armorId ?? "", unit.accessoryId ?? "",
      unit.subClassId ?? "", unit.reactionId ?? "",
      unit.statuses.map((s) => `${s.kind}:${s.turnsLeft}`).join(","),
      unit.learnedSkillIds.join(","), recruitHint ?? "",
    ].join("|");
    if (sig === this.lastTargetSig && this.targetPanel.style.display !== "none") return;
    this.lastTargetSig = sig;
    clear(this.targetPanel);
    for (const n of this.unitPanelContent(unit, recruitHint)) this.targetPanel.appendChild(n);
    this.targetPanel.style.display = "block";
    // One-shot enter fade (no-op under .reduced-motion via the CSS override).
    this.targetPanel.classList.remove("panel-enter");
    void this.targetPanel.offsetWidth; // reflow so re-adding the class restarts the animation
    this.targetPanel.classList.add("panel-enter");
  }
```

- [ ] **Step 3: Add the `.panel-enter` fade + reduced-motion override to styles.** In `src/ui/styles.ts`, add directly below the `.panel` rule's closing `}` (~:40):

```ts
.panel.panel-enter { animation: panel-fade-in 0.16s ease-out; }
@keyframes panel-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 4: Suppress the fade under reduced motion.** In `src/ui/styles.ts`, add `.panel-enter` to the existing `.reduced-motion … { animation: none !important; }` group (~:664-669). Edit that selector list to include it:

```ts
.reduced-motion .banner-card,
.reduced-motion .title-actions .btn,
.reduced-motion .banner-card .title-mark h1,
.reduced-motion .panel.panel-enter,
.reduced-motion .settings-rebind-listening {
  animation: none !important;
}
```

- [ ] **Step 5: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass (`turnBar.test.ts` and other UI tests don't exercise `setTargetInfo` hover dedup; behavior on real content change is unchanged).

- [ ] **Step 6: MANUAL VERIFY (render-only).** Launch, hover an enemy unit. Confirm:
  - The target info panel fades in once when it appears (subtle slide-up + fade).
  - While hovering the SAME unit with no stat change, the panel does NOT flicker/rebuild (it stays put — the fade plays once, not every frame).
  - Damaging the hovered unit updates its HP and replays the panel correctly.
  - Reduced Motion ON → the panel appears instantly with no fade.

- [ ] **Step 7: Commit.**

```
git add src/ui/battleUI.ts src/ui/styles.ts
git commit -m "refactor(ui): dedup per-frame target panel + add panel enter fade"
```

---

### Task 4.12: Fix the lingering 0-opacity toast + give it a drop-in

**Files:**
- Modify: `src/ui/battleUI.ts` (`toast` ~:513-521)
- Modify: `src/ui/styles.ts` (`.toast` ~:214-219)

Today `toast()` only removes the `.show` class after 1.6s — the element keeps `display:block` at `opacity:0`, lingering invisibly over the field (and eating pointer events via `.ui-layer *`). Fix: set `display:none` after the fade-out transition completes, and give the toast a small drop-in entrance (suppressed under reduced motion).

- [ ] **Step 1: Set `display:none` after the fade.** In `src/ui/battleUI.ts`, replace the whole `toast` method (~:513-521):

```ts
  toast(text: string): void {
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastEl.textContent = text;
    this.toastEl.style.display = "block";
    // Re-trigger the drop-in: clear then re-add on the next frame's reflow.
    this.toastEl.classList.remove("show");
    void this.toastEl.offsetWidth; // reflow so the transition restarts
    this.toastEl.classList.add("show");
    this.toastTimer = window.setTimeout(() => {
      this.toastEl.classList.remove("show");
      // After the 0.2s opacity fade finishes, fully hide so the invisible toast
      // stops covering the field / intercepting pointer events.
      this.toastTimer = window.setTimeout(() => {
        this.toastEl.style.display = "none";
      }, 220);
    }, 1600);
  }
```

- [ ] **Step 2: Add the drop-in to the toast CSS.** In `src/ui/styles.ts`, replace the `.toast` + `.toast.show` rules (~:214-219):

```ts
.toast {
  left: 50%; transform: translateX(-50%) translateY(-8px); top: 92px;
  font-size: 14px; padding: 6px 14px; opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  background: rgba(10,12,20,0.9);
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
```

(The existing `.reduced-motion .toast { transition: none !important; }` rule at ~:672 already neutralizes the drop-in motion — the toast appears/disappears instantly under reduced motion. No CSS change needed there.)

- [ ] **Step 3: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass.

- [ ] **Step 4: MANUAL VERIFY (render-only).** Launch, trigger a toast (e.g. attempt an illegal move / an action that surfaces a toast notice). Confirm:
  - The toast slides down + fades in, holds, then fades out.
  - After it fades out, it is fully gone (`display:none`) — it does NOT linger invisibly. Verify by clicking a field tile where the toast was: the click hits the tile, not a hidden toast.
  - Re-triggering a toast while one is showing replays the drop-in (no stuck state).
  - Reduced Motion ON → toast appears/disappears with no slide/fade.

- [ ] **Step 5: Commit.**

```
git add src/ui/battleUI.ts src/ui/styles.ts
git commit -m "fix(ui): hide toast after fade + add drop-in entrance"
```

---

### Task 4.13: Verify the camera punch-zoom wiring (verification only — no new juice)

**Files:** None to modify by default (read-only audit). The `cam.pulse(...)` crit/kill wiring AND the `Camera.pulse()`/`effectiveZoom()` math were ALL delivered in **Task 1.3 (Phase 1)**. This task only confirms that wiring survived the later phases — it must NOT re-wire the pulses, or every crit/kill would fire the punch twice.

> Single source of truth for the pulse (set in Task 1.3 Step 8):
> - crit → `this.cam.pulse(1)` (right after `this.shakeScreen(1)` in `pushPopup`)
> - kill → `this.cam.pulse(0.85)` (right after `this.shakeScreen(0.85)` in `pushPopup`)
> - reduced motion: the punch-zoom is camera juice and is deliberately NOT gated (Task 1.3 Step 10). Do not add a gate here.

- [ ] **Step 1: Confirm the crit/kill pulses are wired exactly once.** In `src/scenes/battleScene.ts`:

```bash
grep -n "cam.pulse" src/scenes/battleScene.ts
```
Expected: EXACTLY two hits — `this.cam.pulse(1)` in the crit branch and `this.cam.pulse(0.85)` in the kill branch (both from Task 1.3 Step 8). If you see more than two, a duplicate slipped in — delete the extras so each impact fires a single pulse.

- [ ] **Step 2: Confirm the camera advances every frame.** Verify `update()` calls `this.cam.update(dt)` (~:1618), which decays `pulseT` (Phase 1). No change needed.

- [ ] **Step 3: Typecheck + tests.** Run:

```
npx tsc --noEmit && npx vitest run
```
Expected: no TS errors; all tests pass (`camera.test.ts` already covers the pulse math from Phase 1).

- [ ] **Step 4: MANUAL VERIFY (render-only).** Launch, land a critical hit and a killing blow. Confirm:
  - On a crit, the whole field briefly zooms in a touch (~+6%) and settles back — anchored on the viewport CENTER (no sideways drift), layered with the screen shake.
  - On a kill, a slightly softer punch (0.85).
  - Panning mid-pulse keeps the field correctly positioned (base zoom math unaffected — only `effectiveZoom` carries the transient).
  - The punch fires regardless of the Reduced-Motion setting (intended per Task 1.3). If a playtest finds it nauseating, gate the two `cam.pulse(...)` CALL SITES (not the math), in one place.

- [ ] **Step 5: Commit only if you removed a duplicate.** This is a verification task — normally nothing to commit. If Step 1 found and you deleted a duplicate pulse:

```
git add src/scenes/battleScene.ts
git commit -m "fix(juice): de-duplicate crit/kill camera pulse wiring"
```

---

Phase 4 complete. Run a final `npx tsc --noEmit && npx vitest run` (expect: no errors, all pass) and one end-to-end manual pass through a battle to confirm sky + particles + sway + HP drain + UI grace notes + camera pulse all read together without visual conflict, and that toggling Reduced Motion strips every Phase-4 motion (particles, sway, hover breathing, HP drain, panel/toast transitions, camera pulse).

Key file paths touched this phase: `/Users/jader/dev/tactics-game/src/core/types.ts`, `/Users/jader/dev/tactics-game/src/engine/renderer.ts`, `/Users/jader/dev/tactics-game/src/scenes/battleView.ts`, `/Users/jader/dev/tactics-game/src/scenes/battleScene.ts`, `/Users/jader/dev/tactics-game/src/ui/battleUI.ts`, `/Users/jader/dev/tactics-game/src/ui/styles.ts`, all 17 files under `/Users/jader/dev/tactics-game/src/data/maps/`, and the new `/Users/jader/dev/tactics-game/tests/ambience.test.ts`.
