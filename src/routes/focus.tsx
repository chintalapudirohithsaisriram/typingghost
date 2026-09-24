import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { seededRandom, useSeed } from "@/hooks/useSeed";
import { useTypingSession, type TypingResult } from "@/hooks/useTypingSession";
import { recordSession } from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { formatSeconds, round } from "@/lib/typing";
import { ALL_PASSAGES, generateWords, pickRotating } from "@/lib/typing-content";

export const Route = createFileRoute("/focus")({
  head: () =>
    pageHead(
      "Focus Mode — Distraction-free Typing | TypeNova",
      "Just you and the text. A quiet, untimed typing space with results only when you finish.",
    ),
  component: FocusPage,
});

function FocusPage() {
  const { update } = useProfile();
  const [source, setSource] = useState<"passage" | "words">("passage");
  const [seed, setSeed] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [result, setResult] = useState<TypingResult | null>(null);
  const baseSeed = useSeed();
  const target = useMemo(() => {
    const rng = seededRandom(baseSeed + seed * 7919);
    return source === "words" ? generateWords(40, rng) : pickRotating(ALL_PASSAGES, recent, rng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, seed, baseSeed]);
  const session = useTypingSession({
    target,
    onComplete: (run) => {
      setResult(run);
      update((c) =>
        recordSession(c, {
          mode: "focus",
          label: "Focus session",
          stats: run.stats,
          errors: run.errors,
          hits: run.hits,
        }),
      );
    },
  });
  const next = () => {
    setResult(null);
    setRecent((r) => [...r, target].slice(-8));
    setSeed((s) => s + 1);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex gap-1" role="radiogroup" aria-label="Text source">
          {(["passage", "words"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={source === s}
              onClick={() => setSource(s)}
              className={`rounded-md px-2.5 py-1 capitalize focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${source === s ? "bg-secondary text-foreground" : "hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <X aria-hidden="true" /> Exit focus
          </Link>
        </Button>
      </div>
      <div className="flex flex-1 flex-col justify-center py-10">
        {result ? (
          <div role="status" className="text-center">
            <p className="font-display text-6xl font-bold">
              {round(result.stats.netWpm)}
              <span className="ml-2 text-xl font-medium text-muted-foreground">WPM</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              {round(result.stats.realAccuracy, 1)}% accuracy ·{" "}
              {formatSeconds(result.stats.elapsedMs)} active · {result.stats.errors} errors
            </p>
            <Button className="mt-6" onClick={next}>
              <RefreshCw aria-hidden="true" /> Next text
            </Button>
          </div>
        ) : (
          <TypingSurface
            target={target}
            session={session}
            size="xl"
            className="border-transparent bg-transparent shadow-none"
            hint="Type when ready · Esc then Tab to leave"
          />
        )}
      </div>
    </div>
  );
}
