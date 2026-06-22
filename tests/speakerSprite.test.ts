import { describe, it, expect } from "vitest";
import { speakerSprite } from "../src/data/sprites";

describe("speakerSprite", () => {
  it("returns a SpriteDef for a known hero name", () => {
    const sprite = speakerSprite("Boleto");
    expect(sprite).not.toBeNull();
    expect(sprite).toHaveProperty("palette");
    expect(sprite).toHaveProperty("rows");
  });

  it("is case-insensitive for hero names", () => {
    expect(speakerSprite("boleto")).not.toBeNull();
    expect(speakerSprite("PORQUINHO")).not.toBeNull();
    expect(speakerSprite("Caveira")).not.toBeNull();
  });

  it("returns a SpriteDef for every roster hero name", () => {
    for (const name of ["Boleto", "Porquinho", "Meleca", "Caveira"]) {
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