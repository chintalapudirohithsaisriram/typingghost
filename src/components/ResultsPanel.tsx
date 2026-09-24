import { useMemo, type ReactNode } from "react";
import type { TypingStats } from "@/lib/typing";
import { formatSeconds, reviewCharacters, round } from "@/lib/typing";
import StatTile from "@/components/StatTile";
import Sparkline from "@/components/Sparkline";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  stats: TypingStats;
  samples: number[];
  errors: Record<string, number>;
  target?: string;
  typed?: string;
  verdict?: { passed: boolean; message: string } | undefined;
  actions?: ReactNode;
};

export default function ResultsPanel({
  title,
  stats,
  samples,
  errors,
  target,
  typed,
  verdict,
  actions,
}: Props) {
  const worst = Object.entries(errors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const review = useMemo(
    () => (target !== undefined && typed !== undefined ? reviewCharacters(target, typed) : null),
    [target, typed],
  );
  const missed = review ? review.filter((c) => c.state === "missed").length : 0;

  return (
    <section className="space-y-5" aria-labelledby="results-title">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="results-title" className="font-display text-2xl font-semibold">
          {title}
        </h2>
        {actions}
      </header>

      {verdict ? (
        <p
          role="status"
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            verdict.passed
              ? "border-success/40 bg-success/10 text-foreground"
              : "border-warning/40 bg-warning/10 text-foreground",
          )}
        >
          <span
            className={cn("mr-2 font-semibold", verdict.passed ? "text-success" : "text-warning")}
          >
            {verdict.passed ? "Passed" : "Not yet"}
          </span>
          {verdict.message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Net WPM"
          value={round(stats.netWpm)}
          tone="primary"
          hint="Speed minus uncorrected errors"
        />
        <StatTile
          label="Accuracy"
          value={round(stats.accuracy, 1)}
          unit="%"
          hint="Final text correct"
        />
        <StatTile
          label="Real accuracy"
          value={round(stats.realAccuracy, 1)}
          unit="%"
          hint="Counts corrected mistakes"
        />
        <StatTile
          label="Active time"
          value={formatSeconds(stats.elapsedMs)}
          hint="Measured, never limited"
        />
      </div>
      <details className="panel group p-4">
        <summary className="cursor-pointer text-sm font-medium">More detail</summary>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Raw WPM" value={round(stats.grossWpm)} hint="All keystrokes" />
          <StatTile
            label="Consistency"
            value={round(stats.consistency)}
            unit="%"
            hint="Steadiness of pace"
          />
          <StatTile
            label="Errors"
            value={stats.errors}
            tone={stats.errors ? "destructive" : "default"}
            hint="Wrong keystrokes made"
          />
          <StatTile
            label="Error rate"
            value={round(stats.errorRate, 1)}
            unit="%"
            hint="Errors per keystroke"
          />
        </div>
      </details>

      {review ? (
        <div className="panel p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium">Character review</h3>
            <ul className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <li>
                <span className="mr-1 inline-block size-2.5 rounded-sm bg-foreground/80" />
                correct
              </li>
              <li>
                <span className="mr-1 inline-block size-2.5 rounded-sm bg-destructive" />
                wrong (typed shown above)
              </li>
              <li>
                <span className="mr-1 inline-block size-2.5 rounded-sm border border-dashed border-muted-foreground" />
                not reached{missed ? ` (${missed})` : ""}
              </li>
            </ul>
          </div>
          <p
            className="font-mono text-base leading-[2.4] break-words whitespace-pre-wrap"
            data-testid="char-review"
          >
            {review.map((c, i) => (
              <span
                key={i}
                title={
                  c.state === "wrong" ? `Expected "${c.expected}", typed "${c.typed}"` : undefined
                }
                className={cn(
                  "relative rounded-[3px]",
                  c.state === "correct" && "text-foreground",
                  c.state === "wrong" && "bg-destructive/15 text-destructive",
                  c.state === "missed" && "text-muted-foreground/60 underline decoration-dotted",
                )}
              >
                {c.state === "wrong" ? (
                  <span className="absolute -top-4 left-0 text-[10px] leading-none text-destructive">
                    {c.typed === " " ? "␣" : c.typed}
                  </span>
                ) : null}
                {c.expected === " " && c.state === "wrong" ? "␣" : c.expected}
                {c.state === "wrong" ? (
                  <span className="sr-only">{` (typed ${c.typed})`}</span>
                ) : null}
              </span>
            ))}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="panel p-5">
          <h3 className="mb-3 text-sm font-medium">Pace through the run</h3>
          <Sparkline values={samples} label="Words per minute over time" />
        </div>
        <div className="panel p-5">
          <h3 className="mb-3 text-sm font-medium">Keys that tripped you up</h3>
          {worst.length ? (
            <ul className="space-y-2">
              {worst.map(([key, count]) => (
                <li key={key} className="flex items-center justify-between text-sm">
                  <span className="rounded border border-border bg-surface-2 px-2 py-0.5 font-mono uppercase">
                    {key === " " ? "space" : key}
                  </span>
                  <span className="text-muted-foreground">
                    {count} miss{count === 1 ? "" : "es"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Clean run — no wrong keys.</p>
          )}
        </div>
      </div>
    </section>
  );
}
