export interface PointerPos {
  x: number;
  y: number;
}

/**
 * Mouse + keyboard input on the canvas. Tracks hover position and dispatches
 * left-click (tile select), right-click (cancel), and key events to handlers
 * the active scene sets.
 */
export class Input {
  pointer: PointerPos | null = null;
  onLeftClick: (x: number, y: number) => void = () => {};
  onRightClick: () => void = () => {};
  onKey: (key: string) => void = () => {};

  constructor(private canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousemove", this.handleMove);
    canvas.addEventListener("mouseleave", this.handleLeave);
    canvas.addEventListener("click", this.handleClick);
    canvas.addEventListener("contextmenu", this.handleContext);
    window.addEventListener("keydown", this.handleKey);
  }

  private toCanvas(e: MouseEvent): PointerPos {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private handleMove = (e: MouseEvent) => {
    this.pointer = this.toCanvas(e);
  };

  private handleLeave = () => {
    this.pointer = null;
  };

  private handleClick = (e: MouseEvent) => {
    const p = this.toCanvas(e);
    this.onLeftClick(p.x, p.y);
  };

  private handleContext = (e: MouseEvent) => {
    e.preventDefault();
    this.onRightClick();
  };

  private handleKey = (e: KeyboardEvent) => {
    this.onKey(e.key);
  };

  /** Reset handlers (used on scene change). */
  reset(): void {
    this.onLeftClick = () => {};
    this.onRightClick = () => {};
    this.onKey = () => {};
  }

  dispose(): void {
    this.canvas.removeEventListener("mousemove", this.handleMove);
    this.canvas.removeEventListener("mouseleave", this.handleLeave);
    this.canvas.removeEventListener("click", this.handleClick);
    this.canvas.removeEventListener("contextmenu", this.handleContext);
    window.removeEventListener("keydown", this.handleKey);
  }
}
