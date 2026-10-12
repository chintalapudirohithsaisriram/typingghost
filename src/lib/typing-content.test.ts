import { describe, expect, it } from "vitest";
import { defaultProfile, lessonStatus, loadProfile, recordSession, weakestKeys } from "./profile";
import {
  COURSE_STAGES,
  FINGER_BY_KEY,
  KEYBOARD_ROWS,
  keyFor,
  LESSONS,
  shiftSideFor,
  SHIFT_MAP,
} from "./typing-content";

const retainedIds = [
  "first-keystrokes",
  "home-row",
  "home-row-words",
  "g-and-h",
  "left-reach",
  "right-reach",
  "reach-return",
  "top-row-words",
  "lower-row",
  "all-letters",
  "word-building",
  "tricky-patterns",
  "capital-letters",
  "numbers",
  "numbers-in-context",
  "punctuation",
  "symbols",
  "accuracy-loop",
  "speed-builder",
  "endurance",
];

describe("TypingGhost course", () => {
  it("has 50 lessons in the planned eight stages and preserves existing lesson IDs", () => {
    expect(LESSONS).toHaveLength(50);
    expect(new Set(LESSONS.map((lesson) => lesson.id)).size).toBe(50);
    expect(
      COURSE_STAGES.map((stage) => [
        stage.title,
        LESSONS.filter((lesson) => lesson.stage === stage.title).length,
      ]),
    ).toEqual(COURSE_STAGES.map((stage) => [stage.title, stage.lessonCount]));
    expect(LESSONS.map((lesson) => lesson.id)).toEqual(expect.arrayContaining(retainedIds));
  });

  it("gives every lesson an objective, cue, warmup, drill, and transfer activity", () => {
    const activityIds = LESSONS.flatMap((lesson) =>
      lesson.activities.map((activity) => activity.id),
    );
    expect(new Set(activityIds).size).toBe(activityIds.length);
    for (const lesson of LESSONS) {
      expect(lesson.description.trim()).not.toBe("");
      expect(lesson.tip.trim()).not.toBe("");
      expect(lesson.activities.map((activity) => activity.kind)).toEqual(
        expect.arrayContaining(["warmup", "drill", "transfer"]),
      );
      for (const activity of lesson.activities) {
        expect(activity.id).toContain(lesson.id);
        expect(activity.instruction.trim()).not.toBe("");
        expect(activity.text.trim()).not.toBe("");
      }
    }
  });

  it("introduces each typed character no earlier than its lesson", () => {
    const learned = new Set<string>();
    for (const lesson of LESSONS) {
      for (const key of lesson.targetKeys) {
        if (key === "all") {
          for (const letter of "abcdefghijklmnopqrstuvwxyz") learned.add(letter);
        } else if (key === "shift") {
          for (const letter of "abcdefghijklmnopqrstuvwxyz") learned.add(letter.toUpperCase());
        } else {
          for (const character of key) learned.add(character);
        }
      }
      for (const activity of lesson.activities) {
        for (const character of activity.text)
          expect(learned.has(character), `${lesson.title}: ${character}`).toBe(true);
      }
    }
  });

  it("matches key finger guidance for US QWERTY and opposite-hand Shift", () => {
    const rowFingers = [
      [
        "left pinky",
        "left ring",
        "left middle",
        "left index",
        "left index",
        "right index",
        "right index",
        "right middle",
        "right ring",
        "right pinky",
        "right pinky",
        "right pinky",
      ],
      [
        "left pinky",
        "left ring",
        "left middle",
        "left index",
        "left index",
        "right index",
        "right index",
        "right middle",
        "right ring",
        "right pinky",
      ],
      [
        "left pinky",
        "left ring",
        "left middle",
        "left index",
        "left index",
        "right index",
        "right index",
        "right middle",
        "right ring",
        "right pinky",
        "right pinky",
      ],
      [
        "left pinky",
        "left ring",
        "left middle",
        "left index",
        "left index",
        "right index",
        "right index",
        "right middle",
        "right ring",
        "right pinky",
      ],
    ];
    KEYBOARD_ROWS.forEach((row, rowIndex) =>
      row.forEach((key, keyIndex) =>
        expect(FINGER_BY_KEY[key], `QWERTY key ${key}`).toBe(rowFingers[rowIndex]?.[keyIndex]),
      ),
    );
    expect(FINGER_BY_KEY[","]).toBe("right middle");
    expect(FINGER_BY_KEY["."]).toBe("right ring");
    expect(FINGER_BY_KEY[" "]).toBe("thumbs");
    for (const [character, key] of Object.entries(SHIFT_MAP)) {
      expect(keyFor(character)).toEqual({ key, shift: true });
      expect(shiftSideFor(key)).toBe(FINGER_BY_KEY[key]?.startsWith("left") ? "right" : "left");
    }
    expect(keyFor("!")).toEqual({ key: "1", shift: true });
    expect(keyFor("?")).toEqual({ key: "/", shift: true });
    expect(shiftSideFor(keyFor("A").key)).toBe("right");
    expect(shiftSideFor(keyFor("?").key)).toBe("left");
    expect(LESSONS.find((lesson) => lesson.id === "punctuation")?.finger).toContain(
      "Right ring period",
    );
    const shiftLesson = LESSONS.find((lesson) => lesson.id === "capital-letters");
    expect(shiftLesson?.tip).toContain("opposite");
  });

  it("saves activity progress and completes a lesson regardless of accuracy", () => {
    const lesson = LESSONS[0]!;
    const stats = {
      elapsedMs: 10_000,
      correct: 4,
      incorrect: 6,
      typed: 10,
      netWpm: 12,
      accuracy: 40,
      realAccuracy: 40,
      errorRate: 60,
      errors: 6,
    };
    const started = recordSession(defaultProfile(), {
      mode: "lesson",
      label: "First activity",
      stats,
      errors: {},
      hits: {},
      lessonId: lesson.id,
      activityId: lesson.activities[0]!.id,
      lessonActivityIndex: 0,
      passed: false,
    });
    expect(lessonStatus(started, lesson.id)).toBe("in-progress");
    expect(started.completedLessons).not.toContain(lesson.id);

    const finished = recordSession(started, {
      mode: "lesson",
      label: "Final activity",
      stats,
      errors: {},
      hits: {},
      lessonId: lesson.id,
      activityId: lesson.activities.at(-1)!.id,
      lessonActivityIndex: lesson.activities.length - 1,
      lessonCompleted: true,
      passed: false,
    });
    expect(lessonStatus(finished, lesson.id)).toBe("completed");
  });

  it("preserves completed lessons and session history while migrating version 4 progress", () => {
    const legacy = {
      version: 4,
      xp: 120,
      sessions: [
        {
          id: "old-session",
          at: 1_700_000_000_000,
          mode: "lesson",
          label: "Lesson 1: First Keystrokes",
          netWpm: 12,
          accuracy: 96,
          durationMs: 20_000,
          characters: 40,
          lessonId: "first-keystrokes",
          passed: true,
        },
      ],
      completedLessons: ["first-keystrokes"],
      keyStats: { f: { hits: 20, misses: 1 } },
      bestWpm: 12,
      bestAccuracy: 96,
      mistakes: [],
    };
    const values = new Map([["typenova.profile.v3", JSON.stringify(legacy)]]);
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => values.get(key) ?? null,
          setItem: (key: string, value: string) => values.set(key, value),
          removeItem: (key: string) => values.delete(key),
        },
      },
    });

    try {
      const migrated = loadProfile();
      expect(migrated.version).toBe(5);
      expect(migrated.completedLessons).toContain("first-keystrokes");
      expect(migrated.sessions[0]?.id).toBe("old-session");
      expect(migrated.keyStats["f"]?.hits).toBe(20);
      expect(migrated.lessonProgress).toEqual({});
    } finally {
      if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
      else Reflect.deleteProperty(globalThis, "window");
    }
  });

  it("recommends keys that saved typing history identifies as weak", () => {
    const profile = defaultProfile();
    profile.keyStats["a"] = { hits: 18, misses: 2 };
    profile.keyStats["q"] = { hits: 3, misses: 7 };
    profile.keyStats["m"] = { hits: 7, misses: 3 };
    expect(weakestKeys(profile, 2).map((item) => item.key)).toEqual(["q", "m"]);
  });
});
