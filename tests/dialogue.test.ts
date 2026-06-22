import { describe, it, expect } from "vitest";
import { PHASES } from "../src/data/maps";
import {
  PHASE_DIALOGUE,
  dialogueFor,
  PHASE_OUTRO,
  outroFor,
  ENDING_DIALOGUE,
  endingDialogue,
  TIRED_DIALOGUE,
  tiredDialogue,
  NPC_REACTIONS,
  npcReaction,
  STATUS_DIALOGUE,
  statusDialogue,
} from "../src/data/dialogue";

describe("phase dialogue", () => {
  it("has a scene for every phase map id", () => {
    for (const map of PHASES) {
      expect(PHASE_DIALOGUE[map.id], `missing dialogue for ${map.id}`).toBeDefined();
    }
  });

  PHASES.forEach((map) => {
    describe(map.id, () => {
      const lines = PHASE_DIALOGUE[map.id];

      it("has at least one line", () => {
        expect(lines.length).toBeGreaterThanOrEqual(1);
      });

      it("every line has a non-empty speaker and text", () => {
        for (const line of lines) {
          expect(line.speaker.length).toBeGreaterThan(0);
          expect(line.text.trim().length).toBeGreaterThan(0);
        }
      });
    });
  });
});

describe("dialogueFor", () => {
  it("returns the lines for a known map id", () => {
    const first = PHASES[0];
    expect(dialogueFor(first.id)).toBe(PHASE_DIALOGUE[first.id]);
    expect(dialogueFor(first.id).length).toBeGreaterThan(0);
  });

  it("returns [] for an unknown map id", () => {
    expect(dialogueFor("no-such-map")).toEqual([]);
  });
});

describe("phase outro", () => {
  it("has an outro for every phase map id", () => {
    for (const map of PHASES) {
      expect(PHASE_OUTRO[map.id], `missing outro for ${map.id}`).toBeDefined();
    }
  });

  PHASES.forEach((map) => {
    describe(map.id, () => {
      const lines = PHASE_OUTRO[map.id];

      it("has at least one line", () => {
        expect(lines.length).toBeGreaterThanOrEqual(1);
      });

      it("every line has a non-empty speaker and text", () => {
        for (const line of lines) {
          expect(line.speaker.length).toBeGreaterThan(0);
          expect(line.text.trim().length).toBeGreaterThan(0);
        }
      });
    });
  });
});

describe("outroFor", () => {
  it("returns the lines for a known map id", () => {
    const first = PHASES[0];
    expect(outroFor(first.id)).toBe(PHASE_OUTRO[first.id]);
    expect(outroFor(first.id).length).toBeGreaterThan(0);
  });

  it("returns [] for an unknown map id", () => {
    expect(outroFor("no-such-map")).toEqual([]);
  });
});

describe("ENDING_DIALOGUE", () => {
  it("has all four ending keys (a, b, c, d)", () => {
    expect(ENDING_DIALOGUE.a).toBeDefined();
    expect(ENDING_DIALOGUE.b).toBeDefined();
    expect(ENDING_DIALOGUE.c).toBeDefined();
    expect(ENDING_DIALOGUE.d).toBeDefined();
  });

  it("each ending has at least 3 lines", () => {
    for (const key of ["a", "b", "c", "d"]) {
      expect(ENDING_DIALOGUE[key].length).toBeGreaterThanOrEqual(3);
    }
  });

  it("every line has non-empty speaker and text", () => {
    for (const key of Object.keys(ENDING_DIALOGUE)) {
      for (const line of ENDING_DIALOGUE[key]) {
        expect(line.speaker.length).toBeGreaterThan(0);
        expect(line.text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("endingDialogue", () => {
  it("returns lines for a known ending id", () => {
    expect(endingDialogue("a")).toBe(ENDING_DIALOGUE.a);
    expect(endingDialogue("a").length).toBeGreaterThan(0);
  });

  it("returns [] for an unknown ending id", () => {
    expect(endingDialogue("z")).toEqual([]);
  });
});

describe("TIRED_DIALOGUE", () => {
  it("has at least 3 dialogue sets", () => {
    expect(TIRED_DIALOGUE.length).toBeGreaterThanOrEqual(3);
  });

  it("every set has at least 2 lines with non-empty speaker/text", () => {
    for (const set of TIRED_DIALOGUE) {
      expect(set.length).toBeGreaterThanOrEqual(2);
      for (const line of set) {
        expect(line.speaker.length).toBeGreaterThan(0);
        expect(line.text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("tiredDialogue", () => {
  it("returns a non-empty array", () => {
    const result = tiredDialogue();
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("NPC_REACTIONS", () => {
  it("has at least 3 reaction keys", () => {
    expect(Object.keys(NPC_REACTIONS).length).toBeGreaterThanOrEqual(3);
  });

  it("every reaction has non-empty speaker and text", () => {
    for (const key of Object.keys(NPC_REACTIONS)) {
      const reaction = NPC_REACTIONS[key];
      expect(reaction.speaker.length).toBeGreaterThan(0);
      expect(reaction.text.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("npcReaction", () => {
  it("returns the reaction for a known key", () => {
    const firstKey = Object.keys(NPC_REACTIONS)[0];
    expect(npcReaction(firstKey)).toBe(NPC_REACTIONS[firstKey]);
  });

  it("returns null for an unknown key", () => {
    expect(npcReaction("no-such-reaction")).toBeNull();
  });
});

describe("STATUS_DIALOGUE", () => {
  it("has at least 3 status keys", () => {
    expect(Object.keys(STATUS_DIALOGUE).length).toBeGreaterThanOrEqual(3);
  });

  it("every status has at least one hero entry with lines", () => {
    for (const status of Object.keys(STATUS_DIALOGUE)) {
      const heroes = STATUS_DIALOGUE[status];
      expect(Object.keys(heroes).length).toBeGreaterThanOrEqual(1);
      for (const hero of Object.keys(heroes)) {
        expect(heroes[hero].length).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe("statusDialogue", () => {
  it("returns lines for a known status + hero", () => {
    expect(statusDialogue("confuse", "Boleto").length).toBeGreaterThan(0);
  });

  it("returns [] for an unknown status or hero", () => {
    expect(statusDialogue("no-such-status", "Boleto")).toEqual([]);
    expect(statusDialogue("confuse", "Nobody")).toEqual([]);
  });
});