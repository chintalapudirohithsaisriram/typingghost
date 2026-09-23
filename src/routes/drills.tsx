import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

import ResultsPanel from "@/components/ResultsPanel";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import { useProfile } from "@/hooks/useProfile";
import { useTypingSession } from "@/hooks/useTypingSession";
import { recordSession, weakestKeys } from "@/lib/profile";
import { buildDrill } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/drills")({
  head: () => ({
    meta: [
      { title: "Weak-Key Typing Drills | TypeNova" },
      {
        name: "description",
        content: "Practice adaptive typing drills generated from the keys you miss most, with manual key selection for focused training.",
      },
      { property: "og:title", content: "Weak-Key Typing Drills — TypeNova" },
      {
        property: "og:description",
        content: "Turn your most common typing mistakes into focused practice drills.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DrillsPage,
});

const MANUAL_KEYS = "asdfjkl;ghqwertyuiopzxcvbnm,.".split("");

function DrillsPage() {
  const { profile, ready, update } = useProfile();
  const weak = weakestKeys(profile, 8);
  const recommended = weak.map((item) => item.key);
  const [manualKeys, setManualKeys] = useState<string[]>(["f", "j", "g", "h"]);
  const [mode, setMode] = useState<"adaptive" | "manual">("adaptive");
  const [round, setRound] = useState(0);
  const activeKeys = mode === "adaptive" && recommended.length ? recommended : manualKeys;
  const target = useMemo(() => buildDrill(activeKeys, 170 + round * 5), [activeKeys, round]);

  const session = useTypingSession({
    target,
    onComplete: ({ stats, errors, hits }) => {
      update((current) =>
        recordSession(current, {
          mode: "drill",
          label: `${mode === "adaptive" && recommended.length ? "Adaptive" : "Manual"} drill`,
          stats,
          errors,
          hits,
        }),
      );
    },
  });

  const restart = () => {
    session.reset();
  };

  const newDrill = () => {
    setRound((value) => value + 1);
    session.reset();
  };

  const toggleKey = (key: string) => {
    setMode("manual");
    setManualKeys((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      return [...current, key].slice(-10);
    });
    session.reset();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="font-mono text-sm text-primary">WEAK.KEYS</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Drills that attack your mistakes</h1>
        <p className="mt-4 text-muted-foreground">
          TypeNova learns which keys trip you up, then builds short pressure drills around those patterns. No history yet? Pick keys manually.
        </p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:order-first">
          <div className="panel p-5">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Drill source</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button type="button" variant={mode === "adaptive" ? "default" : "outline"} onClick={() => setMode("adaptive")}>
                Adaptive
              </Button>
              <Button type="button" variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode("manual")}>
                Manual
              </Button>
            </div>
            <div className="mt-5">
              <p className="text-sm font-medium">Current focus</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeKeys.length ? (
                  activeKeys.map((key) => (
                    <span key={key} className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-sm text-primary uppercase">
                      {key === " " ? "space" : key}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Choose at least one key.</span>
                )}
              </div>
            </div>
            {ready && recommended.length ? (
              <div className="mt-5 space-y-2">
                {weak.slice(0, 5).map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-sm">
                    <span className="font-mono uppercase">{item.key}</span>
                    <span className="text-muted-foreground">{Math.round(item.accuracy)}% · {item.misses} misses</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">Finish lessons or tests to unlock adaptive drills.</p>
            )}
          </div>

          <div className="panel p-5">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Manual keys</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {MANUAL_KEYS.map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => toggleKey(key)}
                  className={cn(
                    "h-8 w-8 bg-surface-2 font-mono text-xs uppercase hover:border-primary hover:text-primary",
                    manualKeys.includes(key) && "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
                  )}
                  aria-pressed={manualKeys.includes(key)}
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="panel p-4 sm:p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Pattern lab</p>
                <p className="mt-1 text-sm text-muted-foreground">Short clusters force clean finger returns and expose hesitation fast.</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={restart}>
                  <RotateCcw aria-hidden="true" /> Retry
                </Button>
                <Button type="button" size="sm" onClick={newDrill}>
                  <Wand2 aria-hidden="true" /> New drill
                </Button>
              </div>
            </div>
          </div>
          <TypingSurface target={target} session={session} size="lg" />
          <VirtualKeyboard nextChar={session.currentChar} highlightKeys={activeKeys} errorKeys={session.errors} />
        </div>
      </section>

      {session.done ? (
        <section className="mt-8">
          <ResultsPanel
            title="Drill result"
            stats={session.stats}
            samples={session.samples}
            errors={session.errors}
            actions={
              <Button type="button" onClick={newDrill} size="sm">
                <Wand2 aria-hidden="true" /> Generate next
              </Button>
            }
          />
        </section>
      ) : null}
    </div>
  );
}
