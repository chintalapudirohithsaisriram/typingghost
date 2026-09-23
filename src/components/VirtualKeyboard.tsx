import { FINGER_BY_KEY, KEYBOARD_ROWS } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

type Props = {
  nextChar?: string;
  highlightKeys?: string[];
  errorKeys?: Record<string, number>;
};

const OFFSETS = ["", "pl-3", "pl-6", "pl-9"];

export default function VirtualKeyboard({ nextChar, highlightKeys = [], errorKeys = {} }: Props) {
  const next = (nextChar ?? "").toLowerCase();
  const finger = FINGER_BY_KEY[next];

  return (
    <div className="panel p-4" aria-hidden="true">
      <div className="flex flex-col gap-1.5">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={cn("flex justify-center gap-1.5", OFFSETS[rowIndex])}>
            {row.map((key) => {
              const isNext = key === next;
              const isTarget = highlightKeys.includes(key);
              const misses = errorKeys[key] ?? 0;
              return (
                <span
                  key={key}
                  className={cn(
                    "flex h-8 w-7 items-center justify-center rounded-md border border-border bg-surface-2 font-mono text-xs uppercase transition-all sm:h-10 sm:w-9 sm:text-sm",
                    isTarget && "border-accent/60 text-accent",
                    misses > 0 && "border-destructive/50 text-destructive",
                    isNext &&
                      "glow-ring -translate-y-0.5 border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {key}
                </span>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center pt-1">
          <span
            className={cn(
              "flex h-8 w-1/2 items-center justify-center rounded-md border border-border bg-surface-2 text-[10px] tracking-[0.3em] uppercase transition-all sm:h-10",
              next === " " && "glow-ring border-primary bg-primary text-primary-foreground",
            )}
          >
            space
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {finger ? (
          <>
            Next key uses your <span className="text-foreground">{finger}</span>
          </>
        ) : (
          "Keep all eight fingers resting on the home row"
        )}
      </p>
    </div>
  );
}
