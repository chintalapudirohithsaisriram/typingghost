import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  ALL_PASSAGES,
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
      "Typing Test — Passages, Words, Numbers & Punctuation | TypingGhost",
      "Choose a timed or untimed typing test with rotating passages, words, numbers, punctuation and custom letters. See net WPM, accuracy and a character-by-character review.",
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
const TIMED_TEST_MS = 60_000;

function TestPage() {
  const { update } = useProfile();
  const [mode, setMode] = useState<TestMode>("passage");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [letters, setLetters] = useState("asdfjkl");
  const [seed, setSeed] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [duration, setDuration] = useState<"untimed" | "60">("untimed");
  const [remainingMs, setRemainingMs] = useState(TIMED_TEST_MS);
  const timerStartedAt = useRef<number | null>(null);

  const cleanLetters = useMemo(
    () => Array.from(new Set(letters.toLowerCase().replace(/[^a-z]/g, ""))),
    [letters],
  );

  const baseSeed = useSeed();
  const target = useMemo(() => {
    const rng = seededRandom(baseSeed + seed * 7919);
    let selected: string;
    switch (mode) {
      case "words":
        selected = generateWords(
          difficulty === "easy" ? 20 : difficulty === "medium" ? 35 : 50,
          rng,
        );
        break;
      case "numbers":
        selected = pickRotating(NUMBER_LINES, recent, rng);
        break;
      case "punctuation":
        selected = pickRotating(PUNCTUATION_LINES, recent, rng);
        break;
      case "custom":
        selected = generateCustomLetters(cleanLetters, 24, rng);
        break;
      default:
        selected = pickRotating(TEST_PASSAGES[difficulty], recent, rng);
    }
    if (duration !== "60" || (mode === "custom" && !cleanLetters.length)) return selected;

    const chunks = [selected];
    let totalChars = selected.length;
    const timedPool =
      mode === "numbers"
        ? NUMBER_LINES
        : mode === "punctuation"
          ? PUNCTUATION_LINES
          : mode === "passage"
            ? ALL_PASSAGES
            : [];
    let passageIndex = (seed + mode.length) % Math.max(1, timedPool.length);
    while (totalChars < 3200) {
      const nextText =
        mode === "words"
          ? generateWords(45, rng)
          : mode === "custom"
            ? generateCustomLetters(cleanLetters, 24, rng)
            : timedPool[passageIndex % timedPool.length]!;
      chunks.push(nextText);
      totalChars += nextText.length + 1;
      passageIndex += 1;
    }
    return chunks.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty, cleanLetters.join(""), seed, baseSeed, duration]);

  useEffect(() => {
    timerStartedAt.current = null;
    setRemainingMs(TIMED_TEST_MS);
  }, [duration, target]);

  const label = `${duration === "60" ? "60-second " : ""}Test · ${
    MODES.find((m) => m.id === mode)!.label
  }${mode === "passage" || mode === "words" ? ` (${difficulty})` : ""}`;

  const session = useTypingSession({
    target,
    completeOnTarget: duration !== "60",
    wallClock: duration === "60",
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

  useEffect(() => {
    if (duration !== "60" || !session.running || session.done) {
      timerStartedAt.current = null;
      return;
    }
    if (timerStartedAt.current === null) timerStartedAt.current = Date.now();
    const timer = window.setInterval(() => {
      const startedAt = timerStartedAt.current;
      if (startedAt === null) return;
      const elapsed = Date.now() - startedAt;
      const nextRemaining = Math.max(0, TIMED_TEST_MS - elapsed);
      setRemainingMs(nextRemaining);
      if (nextRemaining === 0) session.finishNow(TIMED_TEST_MS);
    }, 100);
    return () => window.clearInterval(timer);
  }, [duration, session.running, session.done, session.finishNow]);

  const restartTest = () => {
    timerStartedAt.current = null;
    setRemainingMs(TIMED_TEST_MS);
    session.reset();
  };

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
          {duration === "60"
            ? "The timer starts with your first keystroke. Type for one minute, then review your net WPM and accuracy."
            : "Type the full text at your own pace. There's no countdown — the clock only measures your active typing time for the result."}
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
        <div
          role="radiogroup"
          aria-label="Test length"
          className="flex gap-1 rounded-xl border border-border bg-surface p-1"
        >
          {(["untimed", "60"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={duration === option}
              onClick={() => setDuration(option)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                duration === option
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === "60" ? "60 sec" : "Untimed"}
            </button>
          ))}
        </div>
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
            title={duration === "60" ? "60-second test result" : "Test result"}
            timeLabel={duration === "60" ? "Test duration" : "Active time"}
            stats={session.stats}
            samples={session.samples}
            errors={session.errors}
            target={
              duration === "60"
                ? Array.from(target).slice(0, Array.from(session.value).length).join("")
                : target
            }
            typed={session.value}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={restartTest}>
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
                {session.value ? round(session.stats.realAccuracy) : 100}% ·{" "}
                {duration === "60"
                  ? `left ${formatSeconds(remainingMs)}`
                  : `active ${formatSeconds(session.elapsedMs)}`}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={restartTest}>
                  <RotateCcw aria-hidden="true" /> Restart
                </Button>
                <Button variant="outline" size="sm" onClick={newText}>
                  <RefreshCw aria-hidden="true" /> New text
                </Button>
                {duration !== "60" && session.value ? (
                  <Button variant="ghost" size="sm" onClick={() => session.finishNow()}>
                    Finish here
                  </Button>
                ) : null}
              </div>
            </div>
            <TypingSurface
              target={target}
              session={session}
              size="lg"
              windowSize={duration === "60" ? 240 : undefined}
              hint={
                duration === "60"
                  ? "Type continuously until the timer ends · Backspace corrects the last character"
                  : undefined
              }
            />
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
