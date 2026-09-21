import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";

import ResultsPanel from "@/components/ResultsPanel";
import StatTile from "@/components/StatTile";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useTypingSession } from "@/hooks/useTypingSession";
import { recordSession } from "@/lib/profile";
import { TEST_DURATIONS, TEST_PASSAGES, type Difficulty, type TestDuration } from "@/lib/typing-content";
import { formatSeconds } from "@/lib/typing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/test")({
  head: () => ({
    meta: [
      { title: "Typing Speed Test — Net WPM and Accuracy | TypeNova" },
      {
        name: "description",
        content: "Run 15, 30, 60, or 120 second typing tests with net WPM, real accuracy, consistency, and mistake analysis.",
      },
      { property: "og:title", content: "Typing Speed Test — TypeNova" },
      {
        property: "og:description",
        content: "Measure honest net WPM, accuracy, consistency, and the keys slowing you down.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TestPage,
});

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function makeTarget(difficulty: Difficulty, seed: number) {
  const passages = TEST_PASSAGES[difficulty];
  const passage = passages[seed % passages.length] ?? passages[0] ?? "Practice steady typing with accuracy first.";
  return Array(8).fill(passage).join(" ");
}

function TestPage() {
  const { update } = useProfile();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [duration, setDuration] = useState<TestDuration>(60);
  const [seed, setSeed] = useState(0);
  const [savedKey, setSavedKey] = useState("");
  const target = useMemo(() => makeTarget(difficulty, seed), [difficulty, seed]);

  const session = useTypingSession({
    target,
    completeOnTarget: false,
    limitMs: duration * 1000,
    onComplete: ({ stats, errors, hits }) => {
      const resultKey = `${difficulty}-${duration}-${seed}-${stats.elapsedMs}-${stats.typed}`;
      setSavedKey((current) => {
        if (current === resultKey) return current;
        update((profile) =>
          recordSession(profile, {
            mode: "test",
            label: `${duration}s ${difficulty} test`,
            stats,
            errors,
            hits,
          }),
        );
        return resultKey;
      });
    },
  });

  const resetWith = (nextDifficulty = difficulty, nextDuration = duration, nextSeed = seed) => {
    setSavedKey("");
    setDifficulty(nextDifficulty);
    setDuration(nextDuration);
    setSeed(nextSeed);
    session.reset();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="font-mono text-sm text-primary">SPEED.TEST</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Timed typing test</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Measure usable speed, not inflated speed. Net WPM subtracts your mistakes, and the result feeds your weak-key drills.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Time left" value={formatSeconds(session.remainingMs ?? duration * 1000)} tone="primary" />
          <StatTile label="Net WPM" value={Math.round(session.stats.netWpm)} tone="accent" />
          <StatTile label="Accuracy" value={Math.round(session.stats.realAccuracy)} unit="%" />
        </div>
      </header>

      <section className="mt-8 panel p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <fieldset>
            <legend className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Difficulty</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIFFICULTIES.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={difficulty === item ? "default" : "outline"}
                  size="sm"
                  onClick={() => resetWith(item)}
                  className="capitalize"
                >
                  {item}
                </Button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Duration</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TEST_DURATIONS.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={duration === item ? "default" : "outline"}
                  size="sm"
                  onClick={() => resetWith(difficulty, item)}
                >
                  {item}s
                </Button>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => resetWith(difficulty, duration, seed + 1)}>
              <Shuffle aria-hidden="true" /> New text
            </Button>
            <Button type="button" variant="outline" onClick={() => resetWith()}>
              <RotateCcw aria-hidden="true" /> Reset
            </Button>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-2" aria-label="Test time progress">
          <div
            className={cn("h-full rounded-full bg-primary transition-all", session.done && "bg-accent")}
            style={{ width: `${Math.min(100, (session.elapsedMs / (duration * 1000)) * 100)}%` }}
          />
        </div>
      </section>

      <section className="mt-6">
        <TypingSurface target={target} session={session} size="lg" />
      </section>

      {session.done ? (
        <section className="mt-8">
          <ResultsPanel
            title="Test result"
            stats={session.stats}
            samples={session.samples}
            errors={session.errors}
            actions={
              <Button type="button" onClick={() => resetWith(difficulty, duration, seed + 1)} size="sm">
                <Shuffle aria-hidden="true" /> Run another
              </Button>
            }
          />
        </section>
      ) : null}
    </div>
  );
}
