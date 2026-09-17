import type { TypingStats } from "./typing";
import { LESSONS } from "./typing-content";

export type SessionRecord = {
  id: string;
  at: number;
  mode: "lesson" | "test" | "drill";
  label: string;
  wpm: number;
  netWpm: number;
  accuracy: number;
  consistency: number;
  durationMs: number;
  characters: number;
};

export type ProfileState = {
  version: 2;
  xp: number;
  sessions: SessionRecord[];
  completedLessons: string[];
  keyStats: Record<string, { hits: number; misses: number }>;
  bestWpm: number;
  bestAccuracy: number;
};

const STORAGE_KEY = "typenova.profile.v2";
const MAX_SESSIONS = 400;

export const defaultProfile = (): ProfileState => ({
  version: 2,
  xp: 0,
  sessions: [],
  completedLessons: [],
  keyStats: {},
  bestWpm: 0,
  bestAccuracy: 0,
});

export function loadProfile(): ProfileState {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as Partial<ProfileState>;
    return {
      ...defaultProfile(),
      ...parsed,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      keyStats: parsed.keyStats && typeof parsed.keyStats === "object" ? parsed.keyStats : {},
    };
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(profile: ProfileState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* storage full or blocked — progress simply is not persisted */
  }
}

export function resetProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
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

export const xpForSession = (stats: TypingStats) =>
  Math.round((stats.netWpm * (stats.realAccuracy / 100) * stats.elapsedMs) / 6000) + 5;

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
  LESSONS.find((lesson) => !profile.completedLessons.includes(lesson.id)) ?? LESSONS[LESSONS.length - 1];

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
  if (!recent.length) return "Start with Lesson 1 — five focused minutes beats an hour of hunting and pecking.";
  const accuracy = averageOf(recent.map((session) => session.accuracy));
  const speed = averageOf(recent.map((session) => session.netWpm));
  const weak = weakestKeys(profile, 2).map((item) => item.key.toUpperCase());
  if (accuracy < 93) return `Accuracy is ${Math.round(accuracy)}%. Slow down about 15% until you hold 95%+.`;
  if (weak.length) return `Solid accuracy. Your weakest keys right now are ${weak.join(" and ")} — run a drill.`;
  if (speed < 40) return "Technique looks clean. Push your pace until you feel one or two errors creep in.";
  return "You are in good shape — try a two-minute hard test to stretch your endurance.";
}
