export interface DialogueLine {
  /** Who speaks. A party hero or villain by name, or "—" for the narrator. */
  speaker: string;
  text: string;
}

/**
 * A short story scene played before each battle (2–4 lines), keyed by MAP ID.
 * Lines adapt the STORY.md beats to that chapter's locale (see each map's
 * `intro`). Speakers are party heroes (Garan, Lyra, Vex, Mira, Bron), the tyrant
 * Maldrath, his court, or the narrator ("—"). Keep them terse and in-tone.
 */
export const PHASE_DIALOGUE: Record<string, DialogueLine[]> = {
  // Chapter I — Tutorial Skirmish (a grassy field, a brigand camp).
  phase1: [
    { speaker: "—", text: "The border of Calenmark. Thirty years since the banner last flew here." },
    { speaker: "Garan", text: "Brigands on the rise. Maldrath's, by the look of them." },
    { speaker: "Lyra", text: "First field of the war. Plant the banner and let them remember it." },
    { speaker: "Garan", text: "We are five. We were always going to be enough." },
  ],

  // Chapter II — Ambush in the Hills (high ground, a hill sorcerer on the ridge).
  phase2: [
    { speaker: "Lyra", text: "I know these hills. They hold the ridge, and there's a mage weaving flame behind it." },
    { speaker: "Vex", text: "Then we take the height from him before he burns us off it." },
    { speaker: "Bron", text: "Uphill into a sorcerer. My favorite kind of morning." },
  ],

  // Chapter III — The Bridge (a river chasm, one narrow stone span).
  phase3: [
    { speaker: "—", text: "A river cleaves the valley. One stone bridge, and the enemy holds the far bank." },
    { speaker: "Garan", text: "A choke. They come one at a time, or not at all." },
    { speaker: "Mira", text: "Hold the span. I'll keep the line standing on it." },
  ],

  // Chapter IV — The Cinder Fields (burned farmland, a roving company that flanks).
  cinderFields: [
    { speaker: "—", text: "Past the bridge, the land opens into black stubble — farmland the fires ate." },
    { speaker: "Vex", text: "This was wheat once. They burned the country to keep it." },
    { speaker: "Garan", text: "No chokepoint here. They mean to surround us — hold the rally point and don't break." },
    { speaker: "Lyra", text: "Watch your facing. Reinforcements are coming if we last." },
  ],

  // Chapter V — Sorcerer's Court (tiered terraces, a stack of mages and a healer).
  phase4: [
    { speaker: "—", text: "The inner court — the cabal that props the regime up, raised on its terraces." },
    { speaker: "Mira", text: "Pyromancer, stormcaller, and that abbess mending them faster than we can drop them." },
    { speaker: "Vex", text: "Then we break the healer first, or we lose the day to attrition." },
    { speaker: "Garan", text: "Spread out. Weather it. Break the court and the throne has nothing left to hide behind." },
  ],

  // Chapter VI — The Outer Ramparts (the keep's wall, archers on the high stone, one gate).
  outerRamparts: [
    { speaker: "—", text: "The keep's outer wall rears out of the ash — merlons manned, one gate at its center." },
    { speaker: "Lyra", text: "They've got the high stone and every angle on the courtyard." },
    { speaker: "Bron", text: "So we don't stand in the open. Force the gate, take the wall." },
    { speaker: "Garan", text: "Seize the gatehouse and the garrison's hold breaks. Then it's only Maldrath." },
  ],

  // Chapter VII — The Tyrant's Stand (the shattered throne, two chasms, the killing floor).
  phase5: [
    { speaker: "—", text: "The shattered keep. Two chasms, one narrow approach, and the throne at the end of it." },
    { speaker: "Maldrath", text: "The ash banner. Thirty years, and a handful still carries that rag to my floor." },
    { speaker: "Garan", text: "It never burned through, Maldrath. Neither did we." },
    { speaker: "Maldrath", text: "Then plant it here. I'll bury it with you." },
  ],
};

/** Lines for a map's pre-battle scene, or `[]` if the map has none. */
export function dialogueFor(mapId: string): DialogueLine[] {
  return PHASE_DIALOGUE[mapId] ?? [];
}
