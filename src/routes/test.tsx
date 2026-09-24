import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import ResultsPanel from "@/components/ResultsPanel";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { seededRandom, useSeed } from "@/hooks/useSeed";
import { useTypingSession } from "@/hooks/useTypingSession";
import { recordSession } from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { formatSeconds, round } from "@/lib/typing";
import {
  NUMBER_LINES,
  PUNCTUATION_LINES,
  TEST_PASSAGES,
  generateCustomLetters,
  generateWords,
  pickRotating,
  type Difficulty,
  type TestMode,
} from "@/lib/typing-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/test")({
  head: () =>
    pageHead(
      "Typing Test — Passages, Words, Numbers & Punctuation | TypeNova",
      "An untimed typing test with rotating passages, words, numbers, punctuation and custom letters. See net WPM, accuracy, consistency and a character-by-character review.",
    ),
  component: TestPage,
});

const MODES: { id: TestMode; label: string }[] = [
  { id: "passage", label: "Passage" },
  { id: "words", label: "Words" },
  { id: "numbers", label: "Numbers" },
  { id: "punctuation", label: "Punctuation" },
  { id: "custom", label: "Custom letters" },
];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function TestPage() {
  const { update } = useProfile();
  const [mode, setMode] = useState<TestMode>("passage");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [letters, setLetters] = useState("asdfjkl");
  const [seed, setSeed] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const cleanLetters = useMemo(
    () => Array.from(new Set(letters.toLowerCase().replace(/[^a-z]/g, ""))),
    [letters],
  );

  const baseSeed = useSeed();
  const target = useMemo(() => {
    const rng = seededRandom(baseSeed + seed * 7919);
    switch (mode) {
      case "words":
        return generateWords(difficulty === "easy" ? 20 : difficulty === "medium" ? 35 : 50, rng);
      case "numbers":
        return pickRotating(NUMBER_LINES, recent, rng);
      case "punctuation":
        return pickRotating(PUNCTUATION_LINES, recent, rng);
      case "custom":
        return generateCustomLetters(cleanLetters, 24, rng);
      default:
        return pickRotating(TEST_PASSAGES[difficulty], recent, rng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty, cleanLetters.join(""), seed, baseSeed]);

  const label = `Test · ${MODES.find((m) => m.id === mode)!.label}${mode === "passage" || mode === "words" ? ` (${difficulty})` : ""}`;

  const session = useTypingSession({
    target,
    onComplete: (run) =>
      update((current) =>
        recordSession(current, {
          mode: "test",
          label,
          stats: run.stats,
          errors: run.errors,
          hits: run.hits,
        }),
      ),
  });

  const newText = () => {
    setRecent((r) => [...r, target].slice(-10));
    setSeed((s) => s + 1);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <p className="text-sm font-medium text-primary">Test</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Typing test</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Type the full text at your own pace. There's no countdown — the clock only measures your
          active typing time for the result.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Test type"
          className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                mode === m.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === "passage" || mode === "words" ? (
          <div
            role="radiogroup"
            aria-label="Difficulty"
            className="flex gap-1 rounded-xl border border-border bg-surface p-1"
          >
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm capitalize focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  difficulty === d
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        ) : null}
        {mode === "custom" ? (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Letters</span>
            <Input
              value={letters}
              onChange={(e) => setLetters(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 26))}
              className="h-9 w-40 font-mono"
              aria-describedby="letters-help"
            />
            <span id="letters-help" className="text-xs text-muted-foreground">
              letters only
            </span>
          </label>
        ) : null}
      </div>

      <section className="mt-6 space-y-4">
        {mode === "custom" && !cleanLetters.length ? (
          <p className="panel p-6 text-sm text-muted-foreground">
            Enter at least one letter to build a custom test.
          </p>
        ) : session.done ? (
          <ResultsPanel
            title="Test result"
            stats={session.stats}
            samples={session.samples}
            errors={session.errors}
            target={target}
            typed={session.value}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={session.reset}>
                  <RotateCcw aria-hidden="true" /> Retry same
                </Button>
                <Button onClick={newText}>
                  <RefreshCw aria-hidden="true" /> New test
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span className="tabular-nums" data-testid="live-stats">
                {round(session.stats.netWpm)} WPM ·{" "}
                {session.value ? round(session.stats.realAccuracy) : 100}% · active{" "}
                {formatSeconds(session.elapsedMs)}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={session.reset}>
                  <RotateCcw aria-hidden="true" /> Restart
                </Button>
                <Button variant="outline" size="sm" onClick={newText}>
                  <RefreshCw aria-hidden="true" /> New text
                </Button>
                {session.value ? (
                  <Button variant="ghost" size="sm" onClick={session.finishNow}>
                    Finish here
                  </Button>
                ) : null}
              </div>
            </div>
            <TypingSurface target={target} session={session} size="lg" />
          </>
        )}
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Results are saved to your{" "}
        <Link to="/progress" className="font-medium text-foreground underline underline-offset-4">
          Progress
        </Link>
        .
      </p>
    </div>
  );
}
