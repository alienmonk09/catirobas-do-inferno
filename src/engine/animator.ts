import type { Point } from "../core/types";

interface MoveTween {
  unitId: string;
  path: Point[];
  seg: number;
  t: number;
  tilesPerSec: number;
  resolve: () => void;
}

interface WaitTween {
  remaining: number;
  resolve: () => void;
}

/**
 * Drives smooth, time-based animations from the game loop. The renderer reads
 * `animPos` for any unit currently being tweened. Scenes await the returned
 * promises to sequence movement and pauses.
 */
export class Animator {
  readonly animPos = new Map<string, Point>();
  private moves: MoveTween[] = [];
  private waits: WaitTween[] = [];

  get busy(): boolean {
    return this.moves.length > 0 || this.waits.length > 0;
  }

  update(dt: number): void {
    // Movement tweens.
    for (let i = this.moves.length - 1; i >= 0; i--) {
      const m = this.moves[i];
      m.t += dt * m.tilesPerSec;
      while (m.t >= 1 && m.seg < m.path.length - 2) {
        m.t -= 1;
        m.seg += 1;
      }
      const a = m.path[m.seg];
      const b = m.path[Math.min(m.seg + 1, m.path.length - 1)];
      const frac = Math.min(1, m.t);
      this.animPos.set(m.unitId, {
        x: a.x + (b.x - a.x) * frac,
        y: a.y + (b.y - a.y) * frac,
      });
      if (m.seg >= m.path.length - 2 && m.t >= 1) {
        this.animPos.delete(m.unitId);
        this.moves.splice(i, 1);
        m.resolve();
      }
    }
    // Wait tweens.
    for (let i = this.waits.length - 1; i >= 0; i--) {
      const w = this.waits[i];
      w.remaining -= dt;
      if (w.remaining <= 0) {
        this.waits.splice(i, 1);
        w.resolve();
      }
    }
  }

  moveAlong(unitId: string, path: Point[], tilesPerSec = 7): Promise<void> {
    if (path.length < 2) return Promise.resolve();
    return new Promise((resolve) => {
      this.animPos.set(unitId, { x: path[0].x, y: path[0].y });
      this.moves.push({ unitId, path, seg: 0, t: 0, tilesPerSec, resolve });
    });
  }

  wait(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      this.waits.push({ remaining: seconds, resolve });
    });
  }

  clear(): void {
    this.animPos.clear();
    this.moves = [];
    this.waits = [];
  }
}
