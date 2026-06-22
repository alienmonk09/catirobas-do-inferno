import type { SpriteDef } from "../../engine/sprite";

const HERO_WIDTH = 38;
const HERO_HEIGHT = 50;

type Grid = string[][];

const blank = (): Grid =>
  Array.from({ length: HERO_HEIGHT }, () => Array(HERO_WIDTH).fill("."));

function put(grid: Grid, x: number, y: number, key: string): void {
  if (x >= 0 && x < HERO_WIDTH && y >= 0 && y < HERO_HEIGHT) {
    grid[y][x] = key;
  }
}

function rect(
  grid: Grid,
  x: number,
  y: number,
  width: number,
  height: number,
  key: string,
): void {
  for (let yy = y; yy < y + height; yy += 1) {
    for (let xx = x; xx < x + width; xx += 1) {
      put(grid, xx, yy, key);
    }
  }
}

function row(grid: Grid, y: number, x: number, keys: string): void {
  [...keys].forEach((key, index) => put(grid, x + index, y, key));
}

function outlineRect(
  grid: Grid,
  x: number,
  y: number,
  width: number,
  height: number,
  outline: string,
  fill: string,
): void {
  rect(grid, x, y, width, height, outline);
  rect(grid, x + 1, y + 1, width - 2, height - 2, fill);
}

function blobRow(
  grid: Grid,
  y: number,
  width: number,
  outline: string,
  fill: string,
  xShift = 0,
): void {
  const x = Math.floor((HERO_WIDTH - width) / 2) + xShift;
  for (let index = 0; index < width; index += 1) {
    put(grid, x + index, y, index === 0 || index === width - 1 ? outline : fill);
  }
}

function rows(grid: Grid): string[] {
  return grid.map((gridRow) => gridRow.join(""));
}

function boletoRows(): string[] {
  const grid = blank();

  rect(grid, 12, 2, 4, 4, "D");
  rect(grid, 22, 2, 4, 4, "D");
  row(grid, 3, 11, "ADDDDA....ADDDDA");
  row(grid, 4, 10, "ADBBBBDA..ADBBBDA");
  row(grid, 5, 9, "ADBBBBBDAADBBBBDA");
  row(grid, 6, 8, "ADBBBBBBBBBBBBBDA");
  row(grid, 7, 8, "ABBBBBBBBBBBBBBBA");
  row(grid, 8, 7, "ABBBBDDBBBBBBDDBBA");
  row(grid, 9, 7, "ABBBBJDBBBBBBJDBBA");
  row(grid, 10, 7, "ABBBBBDDBBBBBDDBBA");
  row(grid, 11, 8, "ABBBBBBBBBBBBBBBA");
  row(grid, 12, 9, "ABBBBLLLLLLBBBBA");
  row(grid, 13, 10, "ABBBLLLLLLLLBBA");
  row(grid, 14, 11, "ABLLLLLLLLLLBA");
  row(grid, 15, 12, "ALLLLCCCCLLLA");
  row(grid, 16, 13, "ALLCCCCCCLLA");
  row(grid, 17, 14, "ALCCCCCCLA");
  row(grid, 18, 15, "ACCCCCCCA");
  row(grid, 19, 16, "ACCCCCCA");
  row(grid, 20, 17, "AKKKKKA");
  rect(grid, 17, 21, 5, 2, "D");

  outlineRect(grid, 13, 23, 12, 14, "A", "F");
  rect(grid, 15, 24, 8, 2, "G");
  rect(grid, 14, 27, 10, 4, "H");
  rect(grid, 13, 31, 12, 3, "F");
  rect(grid, 8, 25, 5, 4, "C");
  rect(grid, 25, 25, 5, 4, "C");
  rect(grid, 6, 29, 5, 9, "B");
  rect(grid, 28, 29, 5, 9, "B");
  rect(grid, 12, 37, 5, 8, "E");
  rect(grid, 21, 37, 5, 8, "E");
  rect(grid, 11, 45, 7, 2, "K");
  rect(grid, 20, 45, 7, 2, "K");

  return rows(grid);
}

function porquinhoRows(): string[] {
  const grid = blank();

  rect(grid, 5, 10, 3, 32, "H");
  rect(grid, 8, 13, 1, 28, "M");
  rect(grid, 3, 8, 5, 3, "I");
  put(grid, 31, 11, "G");
  put(grid, 33, 13, "N");
  put(grid, 31, 15, "G");
  put(grid, 34, 18, "G");

  rect(grid, 15, 3, 8, 2, "I");
  rect(grid, 13, 5, 12, 2, "D");
  rect(grid, 11, 7, 16, 2, "B");
  rect(grid, 9, 9, 20, 2, "C");
  rect(grid, 8, 11, 22, 2, "C");
  rect(grid, 10, 13, 18, 2, "D");

  outlineRect(grid, 9, 15, 20, 13, "I", "E");
  rect(grid, 6, 18, 5, 6, "E");
  rect(grid, 27, 18, 5, 6, "E");
  put(grid, 14, 20, "K");
  put(grid, 23, 20, "K");
  rect(grid, 16, 22, 6, 3, "L");
  put(grid, 18, 23, "K");
  put(grid, 20, 23, "K");
  rect(grid, 16, 27, 7, 1, "F");

  outlineRect(grid, 10, 29, 18, 12, "I", "B");
  rect(grid, 11, 30, 16, 2, "C");
  rect(grid, 13, 32, 12, 2, "D");
  rect(grid, 14, 34, 10, 5, "B");
  rect(grid, 9, 35, 5, 5, "C");
  rect(grid, 24, 35, 5, 5, "C");
  rect(grid, 13, 41, 5, 5, "H");
  rect(grid, 21, 41, 5, 5, "H");
  rect(grid, 12, 46, 7, 2, "I");
  rect(grid, 20, 46, 7, 2, "I");

  return rows(grid);
}

function melecaRows(): string[] {
  const grid = blank();
  const widths = [
    7, 11, 16, 21, 25, 29, 31, 30, 28, 26, 29, 32, 34, 33, 31, 28, 25, 29,
    33, 35, 34, 32, 30, 27, 25, 22, 20, 18, 15, 12,
  ];

  widths.forEach((width, index) => {
    const y = 5 + index;
    const fill = index < 8 ? "L" : index < 18 ? "D" : "V";
    const xShift = index % 7 === 0 ? -2 : index % 5 === 0 ? 2 : index % 3 === 0 ? -1 : 0;
    blobRow(grid, y, width, "O", fill, xShift);
  });

  rect(grid, 11, 8, 5, 2, "B");
  rect(grid, 20, 9, 5, 2, "W");
  put(grid, 13, 15, "K");
  put(grid, 25, 15, "K");
  put(grid, 17, 18, "K");
  put(grid, 21, 18, "K");
  put(grid, 24, 19, "K");
  put(grid, 19, 27, "b");
  put(grid, 22, 27, "b");

  rect(grid, 1, 24, 8, 7, "D");
  rect(grid, 0, 27, 5, 4, "L");
  rect(grid, 30, 22, 7, 8, "V");
  rect(grid, 34, 25, 4, 5, "D");
  rect(grid, 5, 34, 28, 7, "V");
  rect(grid, 3, 40, 32, 3, "G");
  rect(grid, 1, 43, 36, 3, "O");
  rect(grid, 6, 46, 9, 2, "O");
  rect(grid, 16, 46, 8, 2, "G");
  rect(grid, 27, 46, 7, 2, "O");

  return rows(grid);
}

function caveiraRows(): string[] {
  const grid = blank();

  blobRow(grid, 3, 10, "O", "K");
  blobRow(grid, 4, 16, "O", "S");
  blobRow(grid, 5, 20, "K", "L");
  blobRow(grid, 6, 23, "K", "L");
  blobRow(grid, 7, 25, "K", "L");
  blobRow(grid, 8, 27, "K", "L");
  blobRow(grid, 9, 28, "K", "L");
  blobRow(grid, 10, 28, "K", "L");
  blobRow(grid, 11, 27, "K", "L");
  blobRow(grid, 12, 25, "K", "L");
  blobRow(grid, 13, 23, "K", "L");
  blobRow(grid, 14, 21, "K", "L");
  blobRow(grid, 15, 19, "K", "L");
  rect(grid, 10, 9, 7, 5, "B");
  rect(grid, 22, 9, 7, 5, "B");
  rect(grid, 17, 11, 5, 2, "L");
  rect(grid, 18, 15, 3, 3, "H");
  row(grid, 13, 19, "LKLKLKLKLKLK");
  row(grid, 15, 21, "KSSSSSSSK");
  rect(grid, 17, 23, 5, 3, "H");

  rect(grid, 16, 27, 7, 3, "O");
  rect(grid, 14, 30, 11, 2, "S");
  rect(grid, 12, 32, 15, 2, "C");
  rect(grid, 10, 34, 19, 2, "D");
  rect(grid, 12, 36, 15, 2, "C");
  rect(grid, 14, 38, 11, 2, "h");
  rect(grid, 17, 33, 5, 5, "B");
  rect(grid, 5, 31, 5, 10, "K");
  rect(grid, 6, 34, 3, 4, "E");
  rect(grid, 29, 31, 5, 10, "K");
  rect(grid, 30, 34, 3, 4, "E");
  rect(grid, 13, 40, 5, 7, "D");
  rect(grid, 21, 40, 5, 7, "D");
  rect(grid, 11, 47, 8, 2, "K");
  rect(grid, 20, 47, 8, 2, "K");

  return rows(grid);
}

export const HERO_SPRITES: Record<string, SpriteDef> = {
  boleto: {
    palette: {
      A: "#1a0a14",
      B: "#e8c9a0",
      C: "#c08b5a",
      D: "#6b4423",
      E: "#4a2b18",
      F: "#ff69b4",
      G: "#00e5ff",
      H: "#ffd700",
      I: "#fff3c0",
      J: "#1a1a1a",
      K: "#2a1410",
      L: "#b77b54",
    },
    rows: boletoRows(),
  },
  porquinho: {
    palette: {
      B: "#6a3d8a",
      C: "#9b59b6",
      D: "#4a235a",
      E: "#f8bbd0",
      F: "#ef5350",
      G: "#ffd700",
      H: "#8b5a2b",
      I: "#2a0a3a",
      J: "#fff59d",
      K: "#1a0a14",
      L: "#ffb3d9",
      M: "#e8c9a0",
      N: "#b3e5fc",
    },
    rows: porquinhoRows(),
  },
  meleca: {
    palette: {
      O: "#2e4d1a",
      G: "#33691e",
      L: "#8bc34a",
      D: "#9ccc65",
      W: "#d8ff9b",
      K: "#183013",
      V: "#689f38",
      b: "#7cb342",
      B: "#c8ff72",
      E: "#eaffc6",
    },
    rows: melecaRows(),
  },
  caveira: {
    palette: {
      O: "#263238",
      S: "#90a4ae",
      K: "#546e7a",
      L: "#eceff1",
      H: "#455a64",
      h: "#607d8b",
      C: "#37474f",
      D: "#424242",
      E: "#b3e5fc",
      B: "#000000",
    },
    rows: caveiraRows(),
  },
};
