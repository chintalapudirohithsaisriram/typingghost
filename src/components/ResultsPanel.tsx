import type { ReactNode } from "react";
import type { TypingStats } from "@/lib/typing";
import { formatSeconds, round } from "@/lib/typing";
import StatTile from "@/components/StatTile";
import Sparkline from "@/components/Sparkline";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  stats: TypingStats;
  samples: number[];
  errors: Record<string, number>;
  verdict?: { passed: boolean; message: string };
  actions?: ReactNode;
};

export default function ResultsPanel({ title, stats, samples, errors, verdict, actions }: Props) {
  const worst = Object.entries(errors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {actions}
      </header>

      {verdict ? (
        <p
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            verdict.passed
              ? "border-success/40 bg-success/10 text-success"
              : "border-warning/40 bg-warning/10 text-warning",
          )}
        >
          {verdict.message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Net WPM" value={round(stats.netWpm)} tone="primary" hint="Speed after error penalty" />
        <StatTile label="Accuracy" value={round(stats.realAccuracy, 1)} unit="%" tone="accent" />
        <StatTile label="Consistency" value={round(stats.consistency)} unit="%" />
        <StatTile label="Time" value={formatSeconds(stats.elapsedMs)} />
        <StatTile label="Raw WPM" value={round(stats.grossWpm)} />
        <StatTile label="Characters" value={stats.typed} />
        <StatTile label="Mistakes" value={stats.errors} tone={stats.errors ? "destructive" : "default"} />
        <StatTile label="Error rate" value={round(stats.errorRate, 1)} unit="%" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="panel p-5">
          <h3 className="mb-3 text-sm font-medium">Speed through the run</h3>
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
            <p className="text-sm text-muted-foreground">Clean run — not a single wrong key.</p>
          )}
        </div>
      </div>
    </section>
  );
}
