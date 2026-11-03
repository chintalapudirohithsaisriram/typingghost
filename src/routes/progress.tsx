import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Download, RotateCcw, TrendingDown, TrendingUp, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import StatTile from "@/components/StatTile";
import TrajectoryChart from "@/components/TrajectoryChart";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import {
  averageOf,
  badgesFor,
  coachMessage,
  importProfile,
  levelFromXp,
  streakDays,
  strongestKeys,
  totalActiveMs,
  weakestKeys,
} from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { formatSeconds } from "@/lib/typing";
import { FINGER_BY_KEY, LESSONS } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  head: () =>
    pageHead(
      "Your Typing Progress | TypingGhost",
      "Net WPM and accuracy trajectories, a diagnostic session log, weakest keys, error patterns, practice time, streaks and milestones — from your own sessions.",
    ),
  component: ProgressPage,
});

const MODE_LABEL = {
  lesson: "Lesson",
  test: "Test",
  practice: "Practice",
  game: "Game",
  focus: "Focus",
} as const;

const shortDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fullDate = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Delta({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) return <span>—</span>;
  if (value === 0) return <span className="text-muted-foreground">±0</span>;
  const up = value > 0;
  return (
    <span
      className={cn("inline-flex items-center gap-1", up ? "text-success" : "text-destructive")}
    >
      {up ? (
        <TrendingUp aria-hidden="true" className="size-3" />
      ) : (
        <TrendingDown aria-hidden="true" className="size-3" />
      )}
      {up ? "+" : "−"}
      {Math.abs(value)}
    </span>
  );
}

function ProgressPage() {
  const { profile, ready, clear, update } = useProfile();
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessions = profile.sessions;
  const recent = sessions.slice(-30);
  const level = levelFromXp(profile.xp);
  const weak = weakestKeys(profile, 8);
  const strong = strongestKeys(profile, 8);
  const badges = badgesFor(profile);
  const streak = streakDays(profile);
  const activeMs = totalActiveMs(sessions);

  const averages = useMemo(
    () => ({
      netWpm: Math.round(averageOf(recent.slice(-10).map((s) => s.netWpm))),
      accuracy: Math.round(averageOf(recent.slice(-10).map((s) => s.accuracy)) * 10) / 10,
    }),
    [recent],
  );

  const trajectory = useMemo(
    () =>
      recent.slice(-24).map((s) => ({
        label: shortDate(s.at),
        wpm: s.netWpm,
        accuracy: s.accuracy,
        title: `${s.label} · ${fullDate(s.at)} · ${s.netWpm} WPM · ${s.accuracy}% accuracy`,
      })),
    [recent],
  );

  const recentSessions = useMemo(() => sessions.slice(-8).reverse(), [sessions]);
  const maxRecentWpm = Math.max(1, ...recentSessions.map((s) => s.netWpm));
  const deltaFor = (index: number) => {
    const current = sessions[index];
    const prev = sessions[index - 1];
    return current && prev ? current.netWpm - prev.netWpm : null;
  };

  const fingerErrors = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const [key, v] of Object.entries(profile.keyStats)) {
      const finger = FINGER_BY_KEY[key];
      if (finger && v.misses) totals[finger] = (totals[finger] ?? 0) + v.misses;
    }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [profile.keyStats]);

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "typingghost-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = async (file: File) => {
    setImportStatus(null);
    if (file.size > 2_000_000) {
      setImportStatus("That file is too large to be a progress export.");
      return;
    }
    const text = await file.text();
    const imported = importProfile(text);
    if (!imported) {
      setImportStatus("That file could not be read as TypingGhost progress.");
      return;
    }
    update(() => imported);
    setImportStatus(
      `Imported ${imported.sessions.length} session${imported.sessions.length === 1 ? "" : "s"}.`,
    );
  };


  if (ready && !sessions.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm font-medium text-primary">Progress</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Nothing recorded yet
        </h1>
        <p className="mt-3 text-muted-foreground">
          Finish a lesson, practice run or test and your real results will appear here.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/learn">Start learning</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/test">Take a test</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Progress</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Your progress</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Built only from sessions you've finished on this device.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportProgress} disabled={!sessions.length}>
            <Download aria-hidden="true" /> Export
          </Button>
          {confirmReset ? (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  clear();
                  setConfirmReset(false);
                }}
              >
                Yes, erase everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setConfirmReset(true)}>
              <RotateCcw aria-hidden="true" /> Reset progress
            </Button>
          )}
        </div>
      </header>

      <p className="mt-6 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
        <span className="font-medium">Coach: </span>
        {coachMessage(profile)}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Avg net WPM"
          value={averages.netWpm}
          tone="primary"
          hint={`Best ${profile.bestWpm}`}
        />
        <StatTile label="Avg accuracy" value={averages.accuracy} unit="%" hint="Last 10 sessions" />
        <StatTile
          label="Practice time"
          value={formatSeconds(activeMs)}
          hint={`${sessions.length} sessions`}
        />
        <StatTile
          label="Day streak"
          value={streak}
          hint={`${profile.completedLessons.length} of ${LESSONS.length} lessons completed`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="font-semibold">WPM &amp; accuracy trajectory</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Net WPM (solid) and accuracy (dashed) across your last {trajectory.length} sessions.
          </p>
          <div className="mt-4">
            <TrajectoryChart points={trajectory} />
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-semibold">Level {level.level}</h2>
          <p className="text-sm text-muted-foreground">
            {profile.xp} XP · {Math.max(0, level.next - profile.xp)} to next level
          </p>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-label="Level progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(level.progress)}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs text-muted-foreground">Recent net WPM</p>
            <ul className="space-y-2">
              {recentSessions.map((s) => {
                const i = sessions.indexOf(s);
                return (
                  <li key={s.id} className="text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate">{s.label}</span>
                      <span className="shrink-0 tabular-nums">
                        <Delta value={deltaFor(i)} />
                      </span>
                      <span className="font-display font-bold tabular-nums">{s.netWpm}</span>
                    </div>
                    <div
                      className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.round((s.netWpm / maxRecentWpm) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <KeyList
          title="Weakest keys"
          items={weak.map((k) => ({
            key: k.key,
            value: `${Math.round(k.accuracy)}%`,
            sub: `${k.misses} misses`,
          }))}
          empty="Needs a few more sessions with some misses."
          to
        />
        <KeyList
          title="Strongest keys"
          items={strong.map((k) => ({
            key: k.key,
            value: `${Math.round(k.accuracy)}%`,
            sub: `${k.attempts} presses`,
          }))}
          empty="Needs a few more sessions."
        />
        <div className="panel p-5">
          <h2 className="font-semibold">Error patterns</h2>
          {fingerErrors.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {fingerErrors.map(([finger, n]) => (
                <li key={finger} className="flex justify-between">
                  <span className="capitalize">{finger}</span>
                  <span className="text-muted-foreground">{n} misses</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No mistakes recorded yet.</p>
          )}
        </div>
      </div>

      <section className="mt-4 panel p-5" aria-labelledby="badges">
        <h2 id="badges" className="font-semibold">
          Milestones
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => (
            <li
              key={b.id}
              className={cn(
                "flex gap-3 rounded-xl border p-3",
                b.earned ? "border-primary/50 bg-accent/30" : "border-border opacity-70",
              )}
            >
              <Award
                className={cn(
                  "size-5 shrink-0",
                  b.earned ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
              <span>
                <span className="block text-sm font-medium">
                  {b.title}
                  <span className="sr-only">{b.earned ? " (earned)" : " (not yet earned)"}</span>
                </span>
                <span className="block text-xs text-muted-foreground">{b.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 panel overflow-x-auto p-5" aria-labelledby="history">
        <h2 id="history" className="font-semibold">
          Diagnostic log
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your last 25 sessions with speed changes between runs.
        </p>
        <table className="mt-3 w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="py-2 font-medium">When</th>
              <th className="font-medium">Session</th>
              <th className="font-medium">Type</th>
              <th className="text-right font-medium">Net WPM</th>
              <th className="text-right font-medium">Δ</th>
              <th className="text-right font-medium">Accuracy</th>
              <th className="text-right font-medium">Errors</th>
              <th className="text-right font-medium">Characters</th>
              <th className="text-right font-medium">Active time</th>
            </tr>
          </thead>
          <tbody>
            {sessions
              .slice(-25)
              .reverse()
              .map((s) => {
                const i = sessions.indexOf(s);
                return (
                  <tr key={s.id} className="border-t border-border">
                    <td className="py-2 text-muted-foreground">{fullDate(s.at)}</td>
                    <td>
                      {s.label}
                      {s.passed ? (
                        <span className="ml-2 text-xs text-success">
                          {s.activityId ? "accuracy guide met" : "passed"}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-muted-foreground">{MODE_LABEL[s.mode] ?? s.mode}</td>
                    <td className="text-right tabular-nums">{s.netWpm}</td>
                    <td className="text-right tabular-nums">
                      <Delta value={deltaFor(i)} />
                    </td>
                    <td className="text-right tabular-nums">{s.accuracy}%</td>
                    <td className="text-right tabular-nums">{s.errors ?? 0}</td>
                    <td className="text-right tabular-nums">{s.characters}</td>
                    <td className="text-right tabular-nums">{formatSeconds(s.durationMs)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function KeyList({
  title,
  items,
  empty,
  to,
}: {
  title: string;
  items: { key: string; value: string; sub: string }[];
  empty: string;
  to?: boolean;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {to && items.length ? (
          <Link
            to="/practice"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Practise these
          </Link>
        ) : null}
      </div>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.key} className="flex items-center justify-between gap-2">
              <kbd className="rounded border border-border bg-surface-2 px-2 py-0.5 font-mono uppercase">
                {i.key === " " ? "space" : i.key}
              </kbd>
              <span className="text-muted-foreground">{i.sub}</span>
              <span className="w-12 text-right tabular-nums">{i.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
