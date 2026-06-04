export interface ElOpts {
  className?: string;
  text?: string;
  html?: string;
  onClick?: (e: MouseEvent) => void;
  attrs?: Record<string, string>;
  children?: HTMLElement[];
}

/** Tiny DOM element factory. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOpts = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.html !== undefined) node.innerHTML = opts.html;
  if (opts.onClick) node.addEventListener("click", opts.onClick as EventListener);
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  if (opts.children) for (const c of opts.children) node.appendChild(c);
  return node;
}

export function clear(node: HTMLElement): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}
