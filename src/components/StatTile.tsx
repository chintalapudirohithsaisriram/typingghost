import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "default" | "primary" | "accent" | "warning" | "destructive";
  className?: string;
};

const TONES: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  accent: "text-accent",
  warning: "text-warning",
  destructive: "text-destructive",
};

export default function StatTile({ label, value, unit, hint, tone = "default", className }: Props) {
  return (
    <div className={cn("panel px-4 py-3", className)}>
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-semibold sm:text-3xl", TONES[tone])}>
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
