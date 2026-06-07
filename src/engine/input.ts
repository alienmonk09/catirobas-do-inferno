export interface PointerPos {
  x: number;
  y: number;
}

export const DRAG_THRESHOLD = 5;

/** A pointer gesture is a pan if its peak straight-line distance from the
 *  mousedown origin reached the threshold. `peak` lets the caller pass the
 *  max distance seen during the drag (so a return-to-origin still counts). */
export function isPan(down: PointerPos, up: PointerPos, peak?: number): boolean {
  const d = peak ?? Math.hypot(up.x - down.x, up.y - down.y);
  return d >= DRAG_THRESHOLD;
}

/**
 * Mouse + keyboard input on the canvas. Tracks hover position and dispatches
 * left-click (tile select), right-click (cancel), key events, mouse-wheel zoom,
 * and drag-pan to handlers the active scene sets. A left press becomes a click
 * only if it never crossed the drag threshold (otherwise it was a pan).
 */
export class Input {
  pointer: PointerPos | null = null;
  onLeftClick: (x: number, y: number) => void = () => {};
  onRightClick: () => void = () => {};
  onKey: (key: string) => void = () => {};
  onWheel: (normDeltaY: number, x: number, y: number) => void = () => {};
  onDrag: (dx: number, dy: number) => void = () => {};
  readonly keysDown = new Set<string>();

  private down: PointerPos | null = null;
  private last: PointerPos | null = null;
  private peak = 0;

  constructor(private canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousemove", this.handleMove);
    canvas.addEventListener("mouseleave", this.handleLeave);
    canvas.addEventListener("mousedown", this.handleDown);
    window.addEventListener("mouseup", this.handleUp);
    canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    canvas.addEventListener("contextmenu", this.handleContext);
    window.addEventListener("keydown", this.handleKey);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.handleBlur);
  }

  private toCanvas(e: MouseEvent): PointerPos {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private handleMove = (e: MouseEvent) => {
    const p = this.toCanvas(e);
    this.pointer = p;
    if (this.down && this.last) {
      this.peak = Math.max(this.peak, Math.hypot(p.x - this.down.x, p.y - this.down.y));
      this.onDrag(p.x - this.last.x, p.y - this.last.y);
      this.last = p;
    }
  };

  private handleLeave = () => {
    this.pointer = null;
  };

  private handleDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    this.down = this.toCanvas(e);
    this.last = this.down;
    this.peak = 0;
  };

  private handleUp = (e: MouseEvent) => {
    if (e.button !== 0 || !this.down) return;
    const up = this.toCanvas(e);
    if (!isPan(this.down, up, this.peak)) this.onLeftClick(up.x, up.y);
    this.down = this.last = null;
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Normalize deltaMode (0=px, 1=lines, 2=pages) so trackpads and notched
    // wheels are comparable before the scene maps it to a zoom factor.
    const factor = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.canvas.clientHeight : 1;
    const p = this.toCanvas(e);
    this.onWheel(e.deltaY * factor, p.x, p.y);
  };

  private handleContext = (e: MouseEvent) => {
    e.preventDefault();
    this.onRightClick();
  };

  private handleKey = (e: KeyboardEvent) => {
    this.keysDown.add(e.key);
    this.onKey(e.key);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysDown.delete(e.key);
  };

  private handleBlur = () => {
    this.keysDown.clear();
    this.down = this.last = null;
  };

  /** Reset handlers (used on scene change). */
  reset(): void {
    this.onLeftClick = () => {};
    this.onRightClick = () => {};
    this.onKey = () => {};
    this.onWheel = () => {};
    this.onDrag = () => {};
    this.keysDown.clear();
    this.down = this.last = null;
  }

  dispose(): void {
    this.canvas.removeEventListener("mousemove", this.handleMove);
    this.canvas.removeEventListener("mouseleave", this.handleLeave);
    this.canvas.removeEventListener("mousedown", this.handleDown);
    window.removeEventListener("mouseup", this.handleUp);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.canvas.removeEventListener("contextmenu", this.handleContext);
    window.removeEventListener("keydown", this.handleKey);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.handleBlur);
  }
}
