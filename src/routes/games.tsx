import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import StatTile from "@/components/StatTile";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { seededRandom, useSeed } from "@/hooks/useSeed";
import { useTypingSession, type TypingResult } from "@/hooks/useTypingSession";
import { recordSession } from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { calculateStats, reviewCharacters, round } from "@/lib/typing";
import { COMMON_WORDS, KEYBOARD_ROWS } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games")({
  head: () =>
    pageHead(
      "Typing Games — Word Ladder, Clean Streak, Key Hunt | TypeNova",
      "Short, skill-focused typing games with no time pressure: climb a word ladder, build a clean streak, or hunt keys by feel.",
    ),
  component: GamesPage,
});

type Game = "ladder" | "streak" | "hunt";
const GAMES: { id: Game; title: string; skill: string; rules: string }[] = [
  {
    id: "ladder",
    title: "Word Ladder",
    skill: "Rhythm on growing words",
    rules: "Words get longer as you climb. Each word typed cleanly adds a rung.",
  },
  {
    id: "streak",
    title: "Clean Streak",
    skill: "Accuracy under commitment",
    rules: "No backspace. Your score is the longest run of perfectly typed words.",
  },
  {
    id: "hunt",
    title: "Key Hunt",
    skill: "Finding keys without looking",
    rules: "One key at a time. Find it by feel — first-try hits score.",
  },
];

const shuffle = <T,>(list: T[], rng: () => number) =>
  list
    .map((v) => [rng(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);

function GamesPage() {
  const [game, setGame] = useState<Game>("ladder");
  const [round_, setRound] = useState(0);
  const current = GAMES.find((g) => g.id === game)!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-primary">Games</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Typing games</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Short rounds, each training one skill. No clocks, no pressure.
      </p>

      <div role="radiogroup" aria-label="Choose a game" className="mt-6 grid gap-3 sm:grid-cols-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={game === g.id}
            onClick={() => {
              setGame(g.id);
              setRound((r) => r + 1);
            }}
            className={cn(
              "rounded-2xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              game === g.id
                ? "border-primary bg-accent/40"
                : "border-border bg-surface hover:bg-secondary",
            )}
          >
            <span className="block font-display text-lg font-semibold">{g.title}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{g.skill}</span>
          </button>
        ))}
      </div>

      <section className="mt-8 space-y-4" aria-labelledby="game-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="game-title" className="font-display text-2xl font-semibold">
              {current.title}
            </h2>
            <p className="text-sm text-muted-foreground">{current.rules}</p>
          </div>
          <Button variant="outline" onClick={() => setRound((r) => r + 1)}>
            <RefreshCw aria-hidden="true" /> New round
          </Button>
        </div>
        {game === "hunt" ? (
          <KeyHunt key={round_} />
        ) : (
          <WordGame key={`${game}-${round_}`} game={game} />
        )}
      </section>
    </div>
  );
}

function WordGame({ game }: { game: "ladder" | "streak" }) {
  const { update } = useProfile();
  const seed = useSeed();
  const words = useMemo(() => {
    const rng = seededRandom(seed);
    if (game === "ladder") {
      const byLen = (n: number) =>
        shuffle(
          COMMON_WORDS.filter((w) => w.length === n),
          rng,
        ).slice(0, 2);
      return [2, 3, 4, 5, 6].flatMap(byLen).filter(Boolean);
    }
    return shuffle(COMMON_WORDS, rng).slice(0, 25);
  }, [game, seed]);
  const target = words.join(" ");
  const [done, setDone] = useState<TypingResult | null>(null);

  const session = useTypingSession({
    target,
    allowBackspace: game === "ladder",
    onComplete: (run) => {
      setDone(run);
      update((c) =>
        recordSession(c, {
          mode: "game",
          label: game === "ladder" ? "Game · Word Ladder" : "Game · Clean Streak",
          stats: run.stats,
          errors: run.errors,
          hits: run.hits,
        }),
      );
    },
  });

  // Word-level scoring from the characters actually typed.
  const wordScores = useMemo(() => {
    const review = reviewCharacters(target, session.value);
    const result: boolean[] = [];
    let pos = 0;
    for (const word of words) {
      const slice = review.slice(pos, pos + word.length);
      if (slice.some((c) => c.state === "missed")) break;
      result.push(slice.every((c) => c.state === "correct"));
      pos += word.length + 1;
    }
    return result;
  }, [session.value, target, words]);

  const clean = wordScores.filter(Boolean).length;
  let best = 0;
  let run = 0;
  for (const ok of wordScores) {
    run = ok ? run + 1 : 0;
    best = Math.max(best, run);
  }

  return (
    <div className="space-y-4">
      {game === "ladder" ? (
        <ol className="flex flex-wrap gap-1.5" aria-label="Ladder rungs">
          {words.map((w, i) => (
            <li
              key={i}
              className={cn(
                "rounded-md border px-2 py-1 font-mono text-xs",
                wordScores[i] === true && "border-primary bg-primary text-primary-foreground",
                wordScores[i] === false && "border-destructive/50 text-destructive",
                wordScores[i] === undefined && "border-border text-muted-foreground",
              )}
            >
              {w}
            </li>
          ))}
        </ol>
      ) : null}
      <div className="grid grid-cols-3 gap-3">
        <StatTile
          label={game === "ladder" ? "Rungs climbed" : "Best streak"}
          value={game === "ladder" ? `${clean}/${words.length}` : best}
          tone="primary"
        />
        <StatTile label="Speed" value={round(session.stats.netWpm)} unit="WPM" />
        <StatTile
          label="Accuracy"
          value={session.value ? round(session.stats.realAccuracy) : 100}
          unit="%"
        />
      </div>
      {done ? (
        <p role="status" className="panel p-5 text-sm">
          Round complete.{" "}
          {game === "ladder"
            ? `You climbed ${clean} of ${words.length} rungs cleanly.`
            : `Your longest clean streak was ${best} words.`}{" "}
          Start a new round to play again.
        </p>
      ) : (
        <TypingSurface
          target={target}
          session={session}
          size="lg"
          hint={game === "streak" ? "Backspace is off in this game · No time limit" : undefined}
        />
      )}
    </div>
  );
}

const HUNT_KEYS = KEYBOARD_ROWS.slice(1)
  .flat()
  .filter((k) => /[a-z]/.test(k));
const HUNT_LENGTH = 25;

function KeyHunt() {
  const { update } = useProfile();
  const seed = useSeed();
  const sequence = useMemo(() => {
    const rng = seededRandom(seed);
    return Array.from(
      { length: HUNT_LENGTH },
      () => HUNT_KEYS[Math.floor(rng() * HUNT_KEYS.length)]!,
    );
  }, [seed]);
  const [index, setIndex] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [misses, setMisses] = useState(0);
  const [missedThis, setMissedThis] = useState(false);
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);
  const started = useRef<number | null>(null);
  const errors = useRef<Record<string, number>>({});
  const hits = useRef<Record<string, number>>({});
  const finished = index >= HUNT_LENGTH;
  const target = sequence[index];

  const press = useCallback(
    (key: string) => {
      if (finished || !target) return;
      started.current ??= Date.now();
      if (key.toLowerCase() === target) {
        hits.current[target] = (hits.current[target] ?? 0) + 1;
        const nextFirst = firstTry + (missedThis ? 0 : 1);
        setFirstTry(nextFirst);
        setMissedThis(false);
        setFlash("hit");
        const next = index + 1;
        setIndex(next);
        if (next >= HUNT_LENGTH) {
          const elapsed = Math.max(1, Date.now() - started.current);
          const stats = calculateStats(HUNT_LENGTH, 0, elapsed, [], misses);
          update((c) =>
            recordSession(c, {
              mode: "game",
              label: "Game · Key Hunt",
              stats,
              errors: { ...errors.current },
              hits: { ...hits.current },
            }),
          );
        }
      } else {
        errors.current[target] = (errors.current[target] ?? 0) + 1;
        setMisses((m) => m + 1);
        setMissedThis(true);
        setFlash("miss");
      }
    },
    [finished, target, firstTry, missedThis, index, misses, update],
  );

  return (
    <div className="space-y-4">
      <div
        tabIndex={0}
        role="application"
        aria-label={finished ? "Key Hunt finished" : `Key Hunt. Press the key ${target}`}
        onKeyDown={(e) => {
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            press(e.key);
          }
        }}
        className="panel flex min-h-56 flex-col items-center justify-center gap-3 p-6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        data-testid="key-hunt"
      >
        {finished ? (
          <p role="status" className="text-center">
            <span className="block font-display text-3xl font-bold">
              {firstTry} / {HUNT_LENGTH}
            </span>
            <span className="text-sm text-muted-foreground">first-try hits · {misses} misses</span>
          </p>
        ) : (
          <>
            <span
              className={cn(
                "flex size-24 items-center justify-center rounded-2xl border-2 font-mono text-5xl uppercase transition-colors",
                flash === "miss" ? "border-destructive text-destructive" : "border-primary",
              )}
            >
              {target}
            </span>
            <span className="text-sm text-muted-foreground">
              Key {index + 1} of {HUNT_LENGTH} · click here, then press the key without looking
            </span>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="First-try hits" value={firstTry} tone="primary" />
        <StatTile label="Misses" value={misses} tone={misses ? "destructive" : "default"} />
      </div>
    </div>
  );
}
