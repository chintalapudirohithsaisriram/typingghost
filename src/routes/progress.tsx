import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import Sparkline from "@/components/Sparkline";
import StatTile from "@/components/StatTile";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { averageOf, coachMessage, levelFromXp, streakDays, strongestKeys, weakestKeys } from "@/lib/profile";
import { LESSONS } from "@/lib/typing-content";
import { formatSeconds } from "@/lib/typing";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Typing Progress Dashboard | TypeNova" },
      {
        name: "description",
        content: "Review typing speed trends, lesson completion, key accuracy, session history, streaks, XP, and coaching insights.",
      },
      { property: "og:title", content: "Typing Progress Dashboard — TypeNova" },
      {
        property: "og:description",
        content: "Track WPM, accuracy, streaks, lesson completion, and weak keys in one local dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { profile, ready, clear } = useProfile();
  const [confirmReset, setConfirmReset] = useState(false);
  const recent = profile.sessions.slice(-20);
  const level = levelFromXp(profile.xp);
  const weak = weakestKeys(profile, 8);
  const strong = strongestKeys(profile, 8);
  const completed = new Set(profile.completedLessons);
  const completion = LESSONS.length ? (completed.size / LESSONS.length) * 100 : 0;
  const averages = useMemo(
    () => ({
      netWpm: Math.round(averageOf(recent.map((session) => session.netWpm))),
      accuracy: Math.round(averageOf(recent.map((session) => session.accuracy))),
      consistency: Math.round(averageOf(recent.map((session) => session.consistency))),
    }),
    [recent],
  );

  const exportProgress = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = "typenova-progress.json";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <p className="font-mono text-sm text-primary">PROGRESS.LOG</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Your typing dashboard</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every lesson, test, and drill updates this view. Your data stays in this browser, and you can reset or export it anytime.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button type="button" variant="outline" onClick={exportProgress} disabled={!ready || profile.sessions.length === 0}>
            <Download aria-hidden="true" /> Export
          </Button>
          <Button type="button" variant={confirmReset ? "destructive" : "outline"} onClick={() => (confirmReset ? (clear(), setConfirmReset(false)) : setConfirmReset(true))}>
            <RotateCcw aria-hidden="true" /> {confirmReset ? "Confirm reset" : "Reset"}
          </Button>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Level" value={level.level} tone="primary" hint={`${Math.round(level.progress)}% to next`} />
        <StatTile label="Best net WPM" value={ready ? profile.bestWpm : 0} tone="accent" />
        <StatTile label="Best accuracy" value={ready ? Math.round(profile.bestAccuracy) : 0} unit="%" />
        <StatTile label="Day streak" value={ready ? streakDays(profile) : 0} tone="warning" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">Performance trend</h2>
              <p className="mt-1 text-sm text-muted-foreground">{coachMessage(profile)}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="font-display text-xl font-semibold text-primary">{averages.netWpm}</p>
                <p className="text-xs text-muted-foreground">avg WPM</p>
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-accent">{averages.accuracy}%</p>
                <p className="text-xs text-muted-foreground">avg acc.</p>
              </div>
              <div>
                <p className="font-display text-xl font-semibold">{averages.consistency}%</p>
                <p className="text-xs text-muted-foreground">steady</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Sparkline values={recent.map((session) => session.netWpm)} label="Recent net WPM" height={150} />
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="font-display text-2xl font-semibold">Course completion</h2>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{completed.size} of {LESSONS.length} lessons passed</p>
          <div className="mt-5 grid max-h-72 gap-2 overflow-y-auto pr-1">
            {LESSONS.map((lesson) => (
              <Link
                key={lesson.id}
                to="/learn/$lessonId"
                params={{ lessonId: lesson.id }}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm transition-colors hover:border-primary/50"
              >
                <span>{lesson.level}. {lesson.title}</span>
                <span className={completed.has(lesson.id) ? "text-primary" : "text-muted-foreground"}>
                  {completed.has(lesson.id) ? "Passed" : "Open"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <KeyPanel title="Keys to repair" items={weak} empty="Mistake data appears after a few completed runs." />
        <KeyPanel title="Most reliable keys" items={strong} empty="Clean key data appears after more practice." />
      </section>

      <section className="mt-8 panel p-6">
        <h2 className="font-display text-2xl font-semibold">Session history</h2>
        {profile.sessions.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 font-medium">Run</th>
                  <th className="py-2 font-medium">Mode</th>
                  <th className="py-2 font-medium">Net WPM</th>
                  <th className="py-2 font-medium">Accuracy</th>
                  <th className="py-2 font-medium">Consistency</th>
                  <th className="py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {profile.sessions.slice(-18).reverse().map((session) => (
                  <tr key={session.id} className="border-t border-border">
                    <td className="py-3 pr-4">{session.label}</td>
                    <td className="py-3 pr-4 capitalize text-muted-foreground">{session.mode}</td>
                    <td className="py-3 pr-4 font-mono text-primary">{session.netWpm}</td>
                    <td className="py-3 pr-4">{session.accuracy}%</td>
                    <td className="py-3 pr-4">{session.consistency}%</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatSeconds(session.durationMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            Finish a lesson, test, or drill to start your history.
          </div>
        )}
      </section>
    </div>
  );
}

type KeyItem = { key: string; attempts: number; accuracy: number; misses?: number };

function KeyPanel({ title, items, empty }: { title: string; items: KeyItem[]; empty: string }) {
  return (
    <div className="panel p-6">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {items.length ? (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="rounded border border-border bg-surface-2 px-2 py-0.5 font-mono uppercase">{item.key === " " ? "space" : item.key}</span>
                <span className="text-muted-foreground">{Math.round(item.accuracy)}% · {item.attempts} tries</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Math.min(100, item.accuracy))}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
