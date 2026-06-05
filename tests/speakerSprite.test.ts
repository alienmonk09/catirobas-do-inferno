import { describe, it, expect } from "vitest";
import { speakerSprite } from "../src/data/sprites";

describe("speakerSprite", () => {
  it("returns a SpriteDef for a known hero name", () => {
    const sprite = speakerSprite("Garan");
    expect(sprite).not.toBeNull();
    expect(sprite).toHaveProperty("palette");
    expect(sprite).toHaveProperty("rows");
  });

  it("is case-insensitive for hero names", () => {
    expect(speakerSprite("garan")).not.toBeNull();
    expect(speakerSprite("LYRA")).not.toBeNull();
    expect(speakerSprite("Vex")).not.toBeNull();
  });

  it("returns a SpriteDef for every roster hero name", () => {
    for (const name of ["Garan", "Lyra", "Vex", "Mira", "Bron", "Enzo", "Penelope"]) {
      expect(speakerSprite(name), `expected sprite for ${name}`).not.toBeNull();
    }
  });

  it("returns null for Maldrath (villain, not in ROSTER)", () => {
    expect(speakerSprite("Maldrath")).toBeNull();
  });

  it("returns null for the narrator '—'", () => {
    expect(speakerSprite("—")).toBeNull();
  });

  it("returns null for unknown speakers", () => {
    expect(speakerSprite("Nobody")).toBeNull();
    expect(speakerSprite("")).toBeNull();
  });
});
