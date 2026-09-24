import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { sessionsSince, totalActiveMs, type ProfileState } from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/challenges")({
  head: () =>
    pageHead(
      "Typing Challenges — Daily, Weekly, Monthly | TypeNova",
      "Daily, weekly and monthly typing goals tracked from your real practice sessions. No fake progress.",
    ),
  component: ChallengesPage,
});

type Challenge = {
  id: string;
  title: string;
  goal: string;
  value: number;
  target: number;
  unit: string;
  to: "/learn" | "/practice" | "/test" | "/games";
};

function challengesFor(profile: ProfileState): Record<"Daily" | "Weekly" | "Monthly", Challenge[]> {
  const day = sessionsSince(profile, "day");
  const week = sessionsSince(profile, "week");
  const month = sessionsSince(profile, "month");
  const days = (list: typeof month) => new Set(list.map((s) => new Date(s.at).toDateString())).size;
  const lessonsPassed = (list: typeof week) =>
    new Set(list.filter((s) => s.mode === "lesson" && s.passed).map((s) => s.lessonId)).size;
  return {
    Daily: [
      {
        id: "d1",
        title: "Warm up",
        goal: "Finish 3 sessions of any kind today.",
        value: day.length,
        target: 3,
        unit: "sessions",
        to: "/practice",
      },
      {
        id: "d2",
        title: "Clean hands",
        goal: "Finish one session at 97%+ accuracy today.",
        value: day.filter((s) => s.accuracy >= 97).length,
        target: 1,
        unit: "session",
        to: "/test",
      },
    ],
    Weekly: [
      {
        id: "w1",
        title: "Steady week",
        goal: "Type for 20 active minutes this week.",
        value: Math.floor(totalActiveMs(week) / 60000),
        target: 20,
        unit: "min",
        to: "/practice",
      },
      {
        id: "w2",
        title: "Course step",
        goal: "Pass 2 lessons this week.",
        value: lessonsPassed(week),
        target: 2,
        unit: "lessons",
        to: "/learn",
      },
      {
        id: "w3",
        title: "Three tests",
        goal: "Complete 3 typing tests this week.",
        value: week.filter((s) => s.mode === "test").length,
        target: 3,
        unit: "tests",
        to: "/test",
      },
    ],
    Monthly: [
      {
        id: "m1",
        title: "Habit",
        goal: "Practise on 12 different days this month.",
        value: days(month),
        target: 12,
        unit: "days",
        to: "/practice",
      },
      {
        id: "m2",
        title: "Play",
        goal: "Finish 10 game rounds this month.",
        value: month.filter((s) => s.mode === "game").length,
        target: 10,
        unit: "rounds",
        to: "/games",
      },
    ],
  };
}

function ChallengesPage() {
  const { profile, ready } = useProfile();
  const groups = challengesFor(profile);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-primary">Challenges</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Challenges</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Goals that reset each day, week (Monday) and month. Progress is counted from sessions you
        have actually completed on this device.
      </p>
      {ready && !profile.sessions.length ? (
        <p className="mt-6 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
          You haven't completed a session yet, so every challenge starts at zero.
        </p>
      ) : null}
      <div className="mt-8 space-y-10">
        {(Object.keys(groups) as (keyof typeof groups)[]).map((period) => (
          <section key={period} aria-labelledby={`p-${period}`}>
            <h2 id={`p-${period}`} className="font-display text-xl font-semibold">
              {period}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups[period].map((c) => {
                const value = ready ? Math.min(c.value, c.target) : 0;
                const complete = value >= c.target;
                return (
                  <li
                    key={c.id}
                    className={cn("panel flex flex-col p-5", complete && "border-primary/60")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{c.title}</h3>
                      {complete ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                          <Check className="size-3" aria-hidden="true" /> Complete
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.goal}</p>
                    <div
                      className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
                      role="progressbar"
                      aria-label={`${c.title} progress`}
                      aria-valuemin={0}
                      aria-valuemax={c.target}
                      aria-valuenow={value}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(value / c.target) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="tabular-nums">
                        {value} / {c.target} {c.unit}
                      </span>
                      {!complete ? (
                        <Button asChild variant="link" size="sm" className="h-auto p-0">
                          <Link to={c.to}>Go</Link>
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
