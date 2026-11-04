import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import ResultsPanel from "@/components/ResultsPanel";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { seededRandom, useSeed } from "@/hooks/useSeed";
import { useTypingSession } from "@/hooks/useTypingSession";
import {
  markMistakePractised,
  recordSession,
  weakestKeys,
  type MistakeRecord,
  type ProfileState,
} from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { round } from "@/lib/typing";
import {
  ALL_PASSAGES,
  COMMON_WORDS,
  KEYBOARD_ROWS,
  TEST_PASSAGES,
  buildDrill,
  generateWords,
  pickRotating,
} from "@/lib/typing-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice")({
  head: () =>
    pageHead(
      "Typing Practice — Weak Keys, Accuracy and Speed | TypingGhost",
      "Unlimited, adaptive typing practice built from your own mistakes: weak keys, error words, accuracy and speed modes.",
    ),
  component: PracticePage,
});

type Mode = "adaptive" | "weak" | "mistakes" | "accuracy" | "speed";
const MODES: { id: Mode; label: string; blurb: string }[] = [
  { id: "adaptive", label: "Adaptive", blurb: "Mixes your weakest keys with real sentences." },
  { id: "weak", label: "Weak keys", blurb: "Focused patterns on the keys you miss most." },
  { id: "mistakes", label: "Mistake words", blurb: "Common words that contain your error keys." },
  { id: "accuracy", label: "Accuracy", blurb: "Calm passages. Aim for 98% or better." },
  { id: "speed", label: "Speed", blurb: "Short, familiar words to push your pace." },
];

const LETTERS = KEYBOARD_ROWS.slice(1)
  .flat()
  .filter((k) => /[a-z]/.test(k));

function buildText(mode: Mode, keys: string[], recent: string[], rng: () => number): string {
  switch (mode) {
    case "weak":
      return buildDrill(keys, 110);
    case "mistakes": {
      const words = COMMON_WORDS.filter((w) => keys.some((k) => w.includes(k)));
      if (words.length < 5) return generateWords(24, rng);
      const out: string[] = [];
      for (let i = 0; i < 22; i += 1) out.push(words[Math.floor(rng() * words.length)]!);
      return out.join(" ");
    }
    case "accuracy":
      return pickRotating([...TEST_PASSAGES.easy, ...TEST_PASSAGES.medium], recent, rng);
    case "speed":
      return generateWords(28, rng);
    default:
      return `${buildDrill(keys, 45)} ${pickRotating(ALL_PASSAGES, recent, rng)}`;
  }
}

function suggestion(profile: ProfileState, weak: string[]): string {
  const recent = profile.sessions.slice(-5);
  if (!recent.length)
    return "No history yet — pick a few keys below or try Speed mode to get a baseline.";
  const acc = recent.reduce((s, x) => s + x.accuracy, 0) / recent.length;
  if (acc < 94) return `Recent accuracy is ${round(acc)}%. Accuracy mode is the best next step.`;
  if (weak.length)
    return `Your error keys are ${weak.map((k) => k.toUpperCase()).join(", ")}. Try Weak keys or Mistake words.`;
  return "Accuracy is solid. Push your pace in Speed mode.";
}

function PracticePage() {
  const { profile, update, ready } = useProfile();
  const detected = useMemo(
    () =>
      weakestKeys(profile, 5)
        .map((k) => k.key)
        .filter((k) => k.trim()),
    [profile],
  );
  const [mode, setMode] = useState<Mode>("adaptive");
  const [picked, setPicked] = useState<string[]>([]);
  const [round_, setRound] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const keys = picked.length ? picked : detected.length ? detected : ["f", "j", "d", "k"];

  const baseSeed = useSeed();
  const target = useMemo(
    () => buildText(mode, keys, recent, seededRandom(baseSeed + round_ * 7919)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, keys.join(""), round_, baseSeed],
  );

  const session = useTypingSession({
    target,
    onComplete: (run) =>
      update((current) =>
        recordSession(current, {
          mode: "practice",
          label: `Practice · ${MODES.find((m) => m.id === mode)!.label}`,
          stats: run.stats,
          errors: run.errors,
          hits: run.hits,
        }),
      ),
  });

  const fresh = () => {
    setRecent((r) => [...r, target].slice(-8));
    setRound((r) => r + 1);
  };
  const toggleKey = (key: string) =>
    setPicked((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key].slice(-6),
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Practice</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Practice what you actually miss
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Unlimited and untimed. Every run updates your key accuracy.
          </p>
        </div>
      </header>

      <p
        className="mt-6 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm"
        aria-live="polite"
      >
        <span className="font-medium">Suggested next: </span>
        {ready ? suggestion(profile, detected) : "Loading your history…"}
      </p>

      <div role="radiogroup" aria-label="Practice mode" className="mt-6 grid gap-2 sm:grid-cols-5">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              mode === m.id
                ? "border-primary bg-accent/40"
                : "border-border bg-surface hover:bg-secondary",
            )}
          >
            <span className="block text-sm font-semibold">{m.label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{m.blurb}</span>
          </button>
        ))}
      </div>

      {mode === "weak" || mode === "mistakes" || mode === "adaptive" ? (
        <div className="mt-4 text-sm">
          <p className="text-muted-foreground">
            {picked.length
              ? "Using your chosen keys."
              : detected.length
                ? `Detected from your history: ${detected.join(" ").toUpperCase()}.`
                : "No error history yet — choose keys to focus on:"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Choose focus keys">
            {LETTERS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={picked.includes(key)}
                onClick={() => toggleKey(key)}
                className={cn(
                  "h-9 w-9 rounded-md border font-mono text-sm uppercase focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  picked.includes(key)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface hover:bg-secondary",
                )}
              >
                {key}
              </button>
            ))}
            {picked.length ? (
              <Button variant="ghost" size="sm" onClick={() => setPicked([])}>
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="mt-6 space-y-4">
        {session.done ? (
          <ResultsPanel
            title="Practice result"
            stats={session.stats}
            samples={session.samples}
            errors={session.errors}
            target={target}
            typed={session.value}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={session.reset}>
                  <RotateCcw aria-hidden="true" /> Same text
                </Button>
                <Button onClick={fresh}>
                  <RefreshCw aria-hidden="true" /> New text
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span className="tabular-nums">
                {round(session.stats.netWpm)} WPM ·{" "}
                {session.value ? round(session.stats.realAccuracy) : 100}% accuracy ·{" "}
                {Math.round(session.progress)}%
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={session.reset}>
                  <RotateCcw aria-hidden="true" /> Restart
                </Button>
                <Button variant="outline" size="sm" onClick={fresh}>
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
        Want structure instead?{" "}
        <Link to="/learn" className="font-medium text-foreground underline underline-offset-4">
          Continue the course
        </Link>
        .
      </p>
    </div>
  );
}
