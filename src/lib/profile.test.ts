import { describe, expect, it } from "vitest";
import {
  defaultProfile,
  importProfile,
  markMistakePractised,
  type MistakeRecord,
} from "./profile";

const mistake = (over: Partial<MistakeRecord> = {}): MistakeRecord => ({
  id: "teh::te",
  target: "teh",
  attempt: "te",
  errorKeys: ["h"],
  occurrences: 2,
  correctStreak: 0,
  updatedAt: 1_700_000_000_000,
  ...over,
});

describe("TypingGhost progress import", () => {
  it("accepts a real export and bounds hostile values", () => {
    const exported = {
      ...defaultProfile(),
      xp: 999_999_999,
      sessions: [
        {
          id: "s1",
          at: 1_700_000_000_000,
          mode: "test",
          label: "Test run",
          netWpm: 40,
          accuracy: 97,
          durationMs: 60_000,
          characters: 400,
          errors: 3,
        },
      ],
      completedLessons: ["first-keystrokes", "not-a-real-lesson"],
    };
    const imported = importProfile(JSON.stringify(exported));
    expect(imported).not.toBeNull();
    expect(imported!.version).toBe(5);
    expect(imported!.sessions).toHaveLength(1);
    expect(imported!.completedLessons).toEqual(["first-keystrokes"]);
    expect(imported!.xp).toBeLessThanOrEqual(10_000_000);
  });

  it("rejects files that are not a TypingGhost export", () => {
    expect(importProfile("not json")).toBeNull();
    expect(importProfile('["a","b"]')).toBeNull();
    expect(importProfile(JSON.stringify({ hello: "world" }))).toBeNull();
    expect(importProfile('{"version":99}')).toBeNull();
    expect(importProfile("x".repeat(2_000_001))).toBeNull();
  });

  it("normalises mistake records and drops impossible ones", () => {
    const imported = importProfile(
      JSON.stringify({
        version: 5,
        mistakes: [
          mistake({ occurrences: 50_000 }),
          mistake({ target: "" }),
          mistake({ id: "back::ba", target: "back", attempt: "ba", occurrences: 3 }),
        ],
      }),
    );
    expect(imported!.mistakes).toHaveLength(2);
    expect(imported!.mistakes[0]!.occurrences).toBeLessThanOrEqual(10_000);
  });
});

describe("mistake retirement", () => {
  it("reduces occurrences and retires a mistake after repeated clean runs", () => {
    let profile = defaultProfile();
    profile = { ...profile, mistakes: [mistake()] };
    profile = markMistakePractised(profile, ["teh"]);
    expect(profile.mistakes).toHaveLength(1);
    expect(profile.mistakes[0]!.occurrences).toBe(1);
    expect(profile.mistakes[0]!.correctStreak).toBe(1);

    profile = markMistakePractised(profile, ["teh"]);
    profile = markMistakePractised(profile, ["teh"]);
    // occurrences reached 0 and correctStreak reached 3: retired.
    expect(profile.mistakes).toHaveLength(0);
  });

  it("leaves unrelated saved mistakes untouched", () => {
    let profile = defaultProfile();
    profile = { ...profile, mistakes: [mistake(), mistake({ id: "back::ba", target: "back" })] };
    profile = markMistakePractised(profile, ["teh"]);
    expect(profile.mistakes.map((m) => m.target)).toEqual(["teh", "back"]);
    expect(profile.mistakes[1]!.occurrences).toBe(2);
  });
});
