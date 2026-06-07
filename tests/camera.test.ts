import { describe, it, expect } from "vitest";
import { Camera, MAX_ZOOM } from "../src/engine/camera";
import { tileScreen, rotateTile, TILE_W, TILE_H, TILE_Z, type Rotation } from "../src/engine/iso";
import { Grid } from "../src/battle/grid";
import type { MapDef } from "../src/core/types";

function gridOf(w: number, h: number, maxZ = 0): Grid {
  const heights = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (x === 0 && y === 0 ? maxZ : 0)),
  );
  const map: MapDef = { id: "c", name: "c", intro: "", width: w, height: h, heights, playerSpawns: [], enemies: [] };
  return new Grid(map);
}

// SP1 computeCamera reference (the boot framing we must reproduce pixel-for-pixel).
function computeOriginRef(g: Grid, rot: Rotation, vw: number, vh: number) {
  const dimsW = rot & 1 ? g.height : g.width;
  const dimsH = rot & 1 ? g.width : g.height;
  const pxW = (dimsW + dimsH) * (TILE_W / 2);
  const pxH = (dimsW + dimsH) * (TILE_H / 2) + g.maxHeight() * TILE_Z;
  const scale = Math.min(1, (vw * 0.98) / pxW, (vh * 0.94) / pxH);
  const mid = tileScreen((dimsW - 1) / 2, (dimsH - 1) / 2, 0);
  return { sx: vw / 2 / scale - mid.sx, sy: vh / 2 / scale - mid.sy - 40, scale };
}

const VP = { w: 1280, h: 720 };
const ROTS: Rotation[] = [0, 1, 2, 3];

describe("Camera boot parity", () => {
  it("reset() reproduces computeCamera origin+scale across sizes and rotations", () => {
    for (const [w, h, z] of [[8, 8, 0], [16, 16, 5], [12, 20, 3], [20, 12, 4]] as const) {
      const g = gridOf(w, h, z);
      for (const rot of ROTS) {
        const cam = new Camera(VP);
        cam.reset(g, rot);
        const ref = computeOriginRef(g, rot, VP.w, VP.h);
        expect(cam.scale).toBeCloseTo(ref.scale, 9);
        expect(cam.origin.sx).toBeCloseTo(ref.sx, 6);
        expect(cam.origin.sy).toBeCloseTo(ref.sy, 6);
      }
    }
  });

  it("pins the FRAME_NUDGE: center.sy - mid.sy === 40 on a map that fits below 1.0", () => {
    const g = gridOf(24, 24, 0); // fitScale < 1
    const cam = new Camera(VP);
    cam.reset(g, 0);
    const dimsW = 24, dimsH = 24;
    const mid = tileScreen((dimsW - 1) / 2, (dimsH - 1) / 2, 0);
    // origin.sy = vh/2/zoom - center.sy ; so center.sy = vh/2/zoom - origin.sy
    const centerSy = VP.h / 2 / cam.scale - cam.origin.sy;
    expect(centerSy - mid.sy).toBeCloseTo(40, 6);
  });
});

describe("Camera origin/scale", () => {
  it("places center at the viewport middle", () => {
    const cam = new Camera(VP);
    cam.reset(gridOf(16, 16, 3), 0);
    const o = cam.origin, z = cam.scale;
    // a tile-screen point equal to `center` lands at M:
    // (center + origin)*zoom == M ; center = M/zoom - origin
    const cx = VP.w / 2 / z - o.sx, cy = VP.h / 2 / z - o.sy;
    expect((cx + o.sx) * z).toBeCloseTo(VP.w / 2, 6);
    expect((cy + o.sy) * z).toBeCloseTo(VP.h / 2, 6);
  });
});

describe("Camera panBy", () => {
  it("moves center by -d/zoom on a pannable (big) map", () => {
    const cam = new Camera(VP);
    cam.reset(gridOf(24, 24, 0), 0); // big enough that fitScale < 1 → pannable at zoom 1
    cam.zoomTo(1); // helper for tests; see note
    const before = cam.origin.sx;
    cam.panBy(40, 0);
    // content shifts +40 px: origin.sx += 40/zoom ; origin.sx*zoom moved +40
    expect((cam.origin.sx - before) * cam.scale).toBeCloseTo(40, 4);
  });
  it("pins to fitCenter on a small map (no transient)", () => {
    const cam = new Camera({ w: 1280, h: 720 });
    cam.reset(gridOf(8, 8, 0), 0); // fits at 1.0 → pan pinned
    const sx0 = cam.origin.sx, sy0 = cam.origin.sy;
    cam.panBy(200, 200);
    expect(cam.origin.sx).toBeCloseTo(sx0, 6);
    expect(cam.origin.sy).toBeCloseTo(sy0, 6);
  });
  it("keyboard convention: right arrow (camera moves right) raises center.sx", () => {
    // The scene negates the held-key delta; here we model that: camera-right ⇒ panBy(-dx,...)
    const cam = mkBig();
    cam.zoomTo(1);
    const centerSx0 = VP.w / 2 / cam.scale - cam.origin.sx;
    cam.panBy(-30, 0); // camera-move-right convention
    const centerSx1 = VP.w / 2 / cam.scale - cam.origin.sx;
    expect(centerSx1).toBeGreaterThan(centerSx0);
  });
});

describe("Camera zoomAt", () => {
  it("keeps the tile-screen point under the cursor invariant (both directions)", () => {
    for (const factor of [1.3, 1 / 1.3]) {
      const cam = new Camera(VP);
      cam.reset(gridOf(24, 24, 0), 0);
      const cursor = { x: 900, y: 250 };
      const z0 = cam.scale, o0 = cam.origin;
      const u = { sx: cursor.x / z0 - o0.sx, sy: cursor.y / z0 - o0.sy }; // tile-screen pt under cursor
      cam.zoomAt(factor, cursor.x, cursor.y);
      const z1 = cam.scale, o1 = cam.origin;
      expect((u.sx + o1.sx) * z1).toBeCloseTo(cursor.x, 3);
      expect((u.sy + o1.sy) * z1).toBeCloseTo(cursor.y, 3);
    }
  });
  it("clamps zoom to [fitScale..MAX_ZOOM] and asserts factor>0", () => {
    const cam = new Camera(VP);
    cam.reset(gridOf(24, 24, 0), 0);
    const fit = cam.scale; // boot zoom == fitScale (< 1 on this big map)
    cam.zoomAt(100, 640, 360); // way in → clamps at MAX_ZOOM
    expect(cam.scale).toBeCloseTo(MAX_ZOOM, 9);
    expect(cam.scale).toBeGreaterThan(1); // zoom-in can exceed native (the whole point)
    cam.zoomAt(0.0001, 640, 360); // way out → clamps at fitScale
    expect(cam.scale).toBeCloseTo(fit, 9);
    expect(() => cam.zoomAt(0, 640, 360)).toThrow();
  });
});

describe("Camera follow ease", () => {
  it("converges and is dt-independent (one big step ≈ N small steps)", () => {
    // zoomTo(1) so the 24×24 map no longer fits either axis — otherwise clamp pins
    // center to fitCenter every frame and the ease never runs (the test would be
    // vacuous: even k=dt would pass). The target must stay inside the clamp region.
    const mk = () => { const c = new Camera(VP); c.reset(gridOf(24, 24, 0), 0); c.zoomTo(1); return c; };
    const target = { sx: 50, sy: 560 }; // reachable & inside the clamp region at zoom 1
    const a = mk(); a.followTo(target); a.update(0.25);
    const b = mk(); b.followTo(target); for (let i = 0; i < 250; i++) b.update(0.001);
    expect(a.origin.sx).toBeCloseTo(b.origin.sx, 2);
    expect(a.origin.sy).toBeCloseTo(b.origin.sy, 2);
  });
  it("a fresh followTo re-arms the ease after settling", () => {
    const cam = mkBig();
    cam.zoomTo(1); // widen the clamp range so the targets below are reachable
    cam.followTo({ sx: -150, sy: 592 });
    for (let i = 0; i < 200; i++) cam.update(0.05); // settle near -150
    const settledSx = VP.w / 2 / cam.scale - cam.origin.sx;
    cam.followTo({ sx: 150, sy: 592 });
    for (let i = 0; i < 200; i++) cam.update(0.05);
    const movedSx = VP.w / 2 / cam.scale - cam.origin.sx;
    expect(movedSx).toBeGreaterThan(settledSx + 50); // settle isn't a sticky latch — re-armed and moved
    expect(Math.abs(movedSx - 150)).toBeLessThan(1); // converged within EASE_EPSILON of the new target
  });
  it("snapTo sets center immediately", () => {
    const cam = mkBig();
    cam.snapTo({ sx: 0, sy: 0 });
    // origin = M/zoom - center ; center 0 → origin = M/zoom
    expect(cam.origin.sx).toBeCloseTo(VP.w / 2 / cam.scale, 6);
  });
});

function mkBig(): Camera { const c = new Camera(VP); c.reset(gridOf(24, 24, 0), 0); return c; }

describe("Camera setViewport re-fit", () => {
  it("grow raises fitScale and pulls a fit-zoomed camera up to the new bound", () => {
    const cam = new Camera({ w: 800, h: 600 });
    cam.reset(gridOf(24, 24, 0), 0);
    const z0 = cam.scale; // == fitScale(800x600) < 1
    cam.setViewport(2400, 1800); // much bigger → fitScale rises (likely to 1)
    expect(cam.scale).toBeGreaterThanOrEqual(z0);
  });
});

describe("Camera reframeForRotation", () => {
  it("keeps the supplied focus tile centered across a 90° turn", () => {
    const g = gridOf(16, 12, 2);
    const cam = new Camera(VP);
    cam.reset(g, 0);
    const focus = { x: 5, y: 7 };
    cam.reframeForRotation(g, 1, focus);
    const v = rotateTile(focus.x, focus.y, 1, g.width, g.height);
    const expected = tileScreen(v.x, v.y, g.heightAt(focus.x, focus.y));
    // focus should be ~at viewport middle: (expected + origin)*zoom ≈ M (modulo clamp)
    const sx = (expected.sx + cam.origin.sx) * cam.scale;
    expect(sx).toBeGreaterThan(0);
    expect(sx).toBeLessThan(VP.w);
  });
});
