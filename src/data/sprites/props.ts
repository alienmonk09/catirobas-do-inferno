import type { SpriteDef } from "../../engine/sprite";

export const PROP_SPRITES = {
  grassTuft: {
    palette: { A: "#2f6b22", B: "#3f8a2c", C: "#56a838" },
    rows: ["...B...", "..BCB..", ".ABCBA.", "ABACABA"],
  },
  flowerCluster: {
    palette: { A: "#2f6b22", B: "#e8d24a", C: "#d96a8f" },
    rows: ["B.C.B..", ".ABA.C.", "AABAAB.", ".AAAA.."],
  },
  pebbles: {
    palette: { A: "#6b6f78", B: "#8b9099", C: "#4a4e56" },
    rows: [".B...", "ABCA.", "..ABB"],
  },
  rubble: {
    palette: { A: "#6b6258", B: "#8a7f70", C: "#4a443c" },
    rows: ["..B..A", "ABCBA.", "BACABB", ".ABAA."],
  },
  reeds: {
    palette: { A: "#3a6b2c", B: "#5aa83c", C: "#caa64a" },
    rows: ["B.C.B", "B.B.B", "AABAA", ".ABA."],
  },
  cattail: {
    palette: { A: "#3a6b2c", B: "#7a4a22", C: "#5aa83c" },
    rows: [".B.", "CBC", "CBC", ".A.", "AAA"],
  },
  mushroom: {
    palette: { A: "#b4452f", B: "#e8e0d0", C: "#caa", D: "#8a8278" },
    rows: [".AAA.", "ABABA", ".DDD.", ".DDD."],
  },
  tree: {
    palette: { A: "#1c3a16", B: "#2f6b22", C: "#3f8a2c", D: "#5a3a1c", E: "#7a4f28" },
    rows: [
      "...AABAA..", "..ABCCBA..", ".ABCCCCBA.", "ABCCCCCCBA",
      ".ABCCCCBA.", "..ABCCBA..", "...ADEA...", "...ADEA...",
      "...ADEA...", "...DDEE...",
    ],
  },
  pineTree: {
    palette: { A: "#14401a", B: "#256b2c", C: "#3a8a3c", D: "#5a3a1c" },
    rows: ["..A..", ".ABA.", ".BCB.", "ABCBA", "BCCCB", "ABCBA", "..D..", "..D.."],
  },
  boulder: {
    palette: { A: "#4a4e56", B: "#6b6f78", C: "#8b9099", D: "#33363c" },
    rows: ["..BBB..", ".BCCBB.", "BCCCBBA", "BCCBBBA", "DABBBAD", ".DAAAD."],
  },
  stump: {
    palette: { A: "#5a3a1c", B: "#7a4f28", C: "#9a6a38" },
    rows: [".ABCA.", "ABCCBA", "ABBBBA", ".AAAA."],
  },
  deadTree: {
    palette: { A: "#3a2c1c", B: "#5a4632" },
    rows: ["..A.B.", "A.AB..", ".AAB.A", "..AB..", "..AB..", "..AB.."],
  },
  wallSegment: {
    palette: { A: "#5a5650", B: "#7a766e", C: "#403c38", D: "#9a958c" },
    rows: ["DDDDDDDD", "ABBABBAB", "BABBABBA", "ABBABBAB", "CCCCCCCC", "ABBABBAB"],
  },
} satisfies Record<string, SpriteDef>;

export type PropSpriteId = keyof typeof PROP_SPRITES;
