import type { TypingStats } from "./typing";
import { LESSONS } from "./typing-content";
import { storage } from "./storage";

export type SessionRecord = {
  id: string;
  at: number;
  mode: "lesson" | "test" | "practice" | "game" | "focus";
  errors?: number;
  lessonId?: string;
  passed?: boolean;
  label: string;
  wpm: number;
  netWpm: number;
  accuracy: number;
  consistency: number;
  durationMs: number;
  characters: number;
};

export type ProfileState = {
  version: 3;
  xp: number;
  sessions: SessionRecord[];
  completedLessons: string[];
  keyStats: Record<string, { hits: number; misses: number }>;
  bestWpm: number;
  bestAccuracy: number;
};

const STORAGE_KEY = "typenova.profile.v3";
const LEGACY_KEYS = ["typenova.profile.v2"];
const MAX_SESSIONS = 500;
const MAX_XP = 10_000_000;
const cleanNumber = (value: unknown, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0;
const cleanText = (value: unknown, max = 120) =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max) : "";

export const defaultProfile = (): ProfileState => ({
  version: 3,
  xp: 0,
  sessions: [],
  completedLessons: [],
  keyStats: {},
  bestWpm: 0,
  bestAccuracy: 0,
});

function normalise(parsed: Partial<ProfileState> | null): ProfileState {
  if (!parsed || typeof parsed !== "object") return defaultProfile();
  const sessions = Array.isArray(parsed.sessions)
    ? parsed.sessions.slice(-MAX_SESSIONS).flatMap((value) => {
        if (!value || typeof value !== "object") return [];
        const session = value as Partial<SessionRecord>;
        const modes: SessionRecord["mode"][] = ["lesson", "test", "practice", "game", "focus"];
        const legacyMode = (session.mode as string) === "drill" ? "practice" : session.mode;
        if (!modes.includes(legacyMode as SessionRecord["mode"])) return [];
        return [{
          id: cleanText(session.id, 80) || `recovered-${Date.now()}`,
          at: cleanNumber(session.at, Date.now() + 86_400_000),
          mode: legacyMode as SessionRecord["mode"],
          label: cleanText(session.label) || "Recovered session",
          wpm: cleanNumber(session.wpm, 500),
          netWpm: cleanNumber(session.netWpm, 500),
          accuracy: cleanNumber(session.accuracy, 100),
          consistency: cleanNumber(session.consistency, 100),
          durationMs: cleanNumber(session.durationMs, 86_400_000),
          characters: cleanNumber(session.characters, 1_000_000),
          errors: cleanNumber(session.errors, 1_000_000),
          ...(typeof session.lessonId === "string" && LESSONS.some((lesson) => lesson.id === session.lessonId)
            ? { lessonId: session.lessonId }
            : {}),
          ...(typeof session.passed === "boolean" ? { passed: session.passed } : {}),
        }];
      })
    : [];
  const rawKeyStats = parsed.keyStats && typeof parsed.keyStats === "object" ? parsed.keyStats : {};
  const keyStats = Object.fromEntries(
    Object.entries(rawKeyStats).slice(0, 120).flatMap(([key, value]) => {
      if (key.length > 2 || !value || typeof value !== "object") return [];
      const stat = value as { hits?: unknown; misses?: unknown };
      return [[key, { hits: cleanNumber(stat.hits, 1_000_000), misses: cleanNumber(stat.misses, 1_000_000) }]];
    }),
  );
  return {
    version: 3,
    xp: cleanNumber(parsed.xp, MAX_XP),
    sessions,
    completedLessons: Array.isArray(parsed.completedLessons)
      ? Array.from(new Set(parsed.completedLessons.filter((id): id is string =>
          typeof id === "string" && LESSONS.some((lesson) => lesson.id === id),
        )))
      : [],
    keyStats,
    bestWpm: cleanNumber(parsed.bestWpm, 500),
    bestAccuracy: cleanNumber(parsed.bestAccuracy, 100),
  };
}

export function loadProfile(): ProfileState {
  const current = storage.read<Partial<ProfileState>>(STORAGE_KEY);
  if (current) return normalise(current);
  for (const key of LEGACY_KEYS) {
    const legacy = storage.read<Partial<ProfileState>>(key);
    if (legacy) {
      const migrated = normalise(legacy);
      storage.write(STORAGE_KEY, migrated);
      return migrated;
    }
  }
  return defaultProfile();
}

export function saveProfile(profile: ProfileState) {
  storage.write(STORAGE_KEY, profile);
}

export function resetProfile() {
  storage.remove(STORAGE_KEY);
  LEGACY_KEYS.forEach((key) => storage.remove(key));
}

export const levelFromXp = (xp: number) => {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 60)) + 1;
  const current = (level - 1) ** 2 * 60;
  const next = level ** 2 * 60;
  return {
    level,
    current,
    next,
    progress: next > current ? ((xp - current) / (next - current)) * 100 : 0,
  };
};

/**
 * XP only rewards genuine practice: sessions shorter than 20 typed characters
 * or 5 seconds, or below 50% accuracy, earn nothing. Per-session XP is capped
 * so one long run can't dwarf steady learning.
 */
export const xpForSession = (stats: TypingStats) => {
  if (stats.typed < 20 || stats.elapsedMs < 5000 || stats.realAccuracy < 50) return 0;
  const earned = (stats.netWpm * (stats.realAccuracy / 100) * stats.elapsedMs) / 6000 + 5;
  return Math.min(150, Math.round(earned));
};

export function recordSession(
  profile: ProfileState,
  entry: {
    mode: SessionRecord["mode"];
    label: string;
    stats: TypingStats;
    errors: Record<string, number>;
    hits: Record<string, number>;
    lessonId?: string;
    passed?: boolean;
  },
): ProfileState {
  const { stats } = entry;
  const session: SessionRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    mode: entry.mode,
    label: entry.label,
    wpm: Math.round(stats.grossWpm),
    netWpm: Math.round(stats.netWpm),
    accuracy: Math.round(stats.realAccuracy * 10) / 10,
    consistency: Math.round(stats.consistency),
    durationMs: stats.elapsedMs,
    characters: stats.typed,
    errors: stats.errors,
    ...(entry.lessonId ? { lessonId: entry.lessonId } : {}),
    ...(entry.passed !== undefined ? { passed: entry.passed } : {}),
  };

  const keyStats = { ...profile.keyStats };
  for (const [key, count] of Object.entries(entry.hits)) {
    const prev = keyStats[key] ?? { hits: 0, misses: 0 };
    keyStats[key] = { ...prev, hits: prev.hits + count };
  }
  for (const [key, count] of Object.entries(entry.errors)) {
    const prev = keyStats[key] ?? { hits: 0, misses: 0 };
    keyStats[key] = { ...prev, misses: prev.misses + count };
  }

  const completedLessons =
    entry.lessonId && entry.passed && !profile.completedLessons.includes(entry.lessonId)
      ? [...profile.completedLessons, entry.lessonId]
      : profile.completedLessons;

  return {
    ...profile,
    xp: profile.xp + xpForSession(stats),
    sessions: [...profile.sessions, session].slice(-MAX_SESSIONS),
    keyStats,
    completedLessons,
    bestWpm: Math.max(profile.bestWpm, session.netWpm),
    bestAccuracy: Math.max(profile.bestAccuracy, session.accuracy),
  };
}

export const weakestKeys = (profile: ProfileState, count = 6) =>
  Object.entries(profile.keyStats)
    .map(([key, value]) => ({
      key,
      attempts: value.hits + value.misses,
      misses: value.misses,
      accuracy: value.hits + value.misses ? (value.hits / (value.hits + value.misses)) * 100 : 100,
    }))
    .filter((item) => item.attempts >= 8 && item.misses > 0)
    .sort((a, b) => a.accuracy - b.accuracy || b.misses - a.misses)
    .slice(0, count);

export const strongestKeys = (profile: ProfileState, count = 6) =>
  Object.entries(profile.keyStats)
    .map(([key, value]) => ({
      key,
      attempts: value.hits + value.misses,
      accuracy: value.hits + value.misses ? (value.hits / (value.hits + value.misses)) * 100 : 0,
    }))
    .filter((item) => item.attempts >= 8)
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts)
    .slice(0, count);

export const nextLesson = (profile: ProfileState) =>
  LESSONS.find((lesson) => !profile.completedLessons.includes(lesson.id));

export const courseComplete = (profile: ProfileState) => nextLesson(profile) === undefined;

export const dayKey = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10);

export function streakDays(profile: ProfileState): number {
  const days = new Set(profile.sessions.map((session) => dayKey(session.at)));
  if (!days.size) return 0;
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to stand if today has no session yet but yesterday does.
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const averageOf = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export function coachMessage(profile: ProfileState): string {
  const recent = profile.sessions.slice(-5);
  if (!recent.length)
    return "No sessions yet. Start with Lesson 1 — a few focused minutes builds the right habits.";
  const accuracy = averageOf(recent.map((session) => session.accuracy));
  const speed = averageOf(recent.map((session) => session.netWpm));
  const weak = weakestKeys(profile, 2).map((item) => item.key.toUpperCase());
  if (accuracy < 93)
    return `Accuracy is ${Math.round(accuracy)}%. Slow down about 15% until you hold 95%+.`;
  if (weak.length)
    return `Solid accuracy. Your weakest keys right now are ${weak.join(" and ")} — run a weak-key practice.`;
  if (speed < 40)
    return "Technique looks clean. Push your pace until you feel one or two errors creep in.";
  return "You are in good shape — try a hard passage test to stretch your endurance.";
}

export const totalActiveMs = (sessions: SessionRecord[]) =>
  sessions.reduce((sum, s) => sum + (s.durationMs || 0), 0);

const startOf = (unit: "day" | "week" | "month", now = new Date()) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (unit === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (unit === "month") d.setDate(1);
  return d.getTime();
};

export const sessionsSince = (profile: ProfileState, unit: "day" | "week" | "month") => {
  const from = startOf(unit);
  return profile.sessions.filter((s) => s.at >= from);
};

export type Badge = { id: string; title: string; description: string; earned: boolean };

/** Milestones computed strictly from saved history — nothing is pre-awarded. */
export function badgesFor(profile: ProfileState): Badge[] {
  const s = profile.sessions;
  const lessons = profile.completedLessons.length;
  return [
    {
      id: "first",
      title: "First session",
      description: "Finish any typing session.",
      earned: s.length >= 1,
    },
    {
      id: "home",
      title: "Home row",
      description: "Pass the first three lessons.",
      earned: ["first-keystrokes", "home-row", "home-row-words"].every((id) =>
        profile.completedLessons.includes(id),
      ),
    },
    { id: "half", title: "Halfway", description: "Pass 10 lessons.", earned: lessons >= 10 },
    {
      id: "grad",
      title: "Graduate",
      description: `Pass all ${LESSONS.length} lessons.`,
      earned: lessons >= LESSONS.length,
    },
    {
      id: "precise",
      title: "Precise",
      description: "Finish a session at 98%+ accuracy (100+ chars).",
      earned: s.some((x) => x.accuracy >= 98 && x.characters >= 100),
    },
    {
      id: "wpm40",
      title: "40 WPM",
      description: "Reach 40 net WPM.",
      earned: profile.bestWpm >= 40,
    },
    {
      id: "wpm60",
      title: "60 WPM",
      description: "Reach 60 net WPM.",
      earned: profile.bestWpm >= 60,
    },
    {
      id: "streak7",
      title: "7-day streak",
      description: "Practise seven days in a row.",
      earned: streakDays(profile) >= 7,
    },
  ];
}
