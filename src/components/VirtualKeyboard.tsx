import { useState } from "react";
import { Delete } from "lucide-react";
import { FINGER_BY_KEY, KEYBOARD_ROWS, keyFor, shiftSideFor } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

type Props = {
  nextChar?: string;
  highlightKeys?: string[];
  errorKeys?: Record<string, number>;
  /**
   * When provided, keys render as real buttons that type. When omitted the
   * keyboard is a purely visual guide: no buttons, no handlers, no pointer events.
   */
  onKey?: (key: string) => void;
  className?: string;
};

const SHIFTED: Record<string, string> = {
  "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")",
  "-": "_", "=": "+", ";": ":", "'": '"', ",": "<", ".": ">", "/": "?",
};

/** Keep focus on the typing area so physical typing continues after a tap. */
const keepFocus = (event: React.MouseEvent) => event.preventDefault();

const ROW_OFFSET = ["", "sm:pl-4", "sm:pl-7", "sm:pl-10"];

export default function VirtualKeyboard({ nextChar, highlightKeys = [], errorKeys = {}, onKey, className }: Props) {
  const interactive = Boolean(onKey);
  const [shift, setShift] = useState(false);
  const { key: next, shift: needsShift } = keyFor(nextChar ?? "");
  const shiftSide = needsShift ? shiftSideFor(next) : null;
  const finger = FINGER_BY_KEY[next];

  const press = (key: string) => {
    if (!onKey) return;
    if (key === "Backspace" || key === " ") {
      onKey(key);
      return;
    }
    const value = shift ? (SHIFTED[key] ?? key.toUpperCase()) : key;
    onKey(value);
    if (shift) setShift(false);
  };

  const keyClass = (active: boolean, extra?: string) =>
    cn(
      "flex h-9 min-w-0 flex-1 items-center justify-center rounded-md border border-border bg-surface font-mono text-xs uppercase shadow-[0_1px_0_var(--border)] sm:h-11 sm:text-sm",
      active && "border-primary bg-primary text-primary-foreground glow-ring",
      extra,
    );

  const renderKey = (key: string) => {
    const isNext = key === next;
    const isTarget = highlightKeys.includes(key);
    const misses = errorKeys[key] ?? 0;
    const label = shift && interactive ? (SHIFTED[key] ?? key) : key;
    const cls = keyClass(isNext, cn(!isNext && isTarget && "border-primary/50 bg-accent/40", !isNext && misses > 0 && "text-destructive"));
    if (interactive) {
      return (
        <button key={key} type="button" onMouseDown={keepFocus} className={cn(cls, "hover:bg-secondary active:translate-y-px")} aria-label={`Type ${label}`} onClick={() => press(key)}>
          {label}
        </button>
      );
    }
    return (
      <span key={key} className={cls}>
        {key}
      </span>
    );
  };

  const shiftKey = (side: "left" | "right") => {
    const active = shiftSide === side;
    if (interactive) {
      return (
        <button
          type="button" onMouseDown={keepFocus}
          aria-pressed={shift}
          aria-label={`${side === "left" ? "Left" : "Right"} shift (applies to the next key only)`}
          className={keyClass(active || shift, "max-w-20 flex-[1.6] text-[10px] tracking-wider hover:bg-secondary")}
          onClick={() => setShift((value) => !value)}
        >
          shift
        </button>
      );
    }
    return <span className={keyClass(active, "max-w-20 flex-[1.6] text-[10px] tracking-wider")}>shift</span>;
  };

  return (
    <div
      className={cn("panel p-3 sm:p-4", !interactive && "pointer-events-none select-none", className)}
      {...(interactive ? { role: "group", "aria-label": "On-screen keyboard" } : { "aria-hidden": true })}
      data-testid={interactive ? "tap-keyboard" : "keyboard-guide"}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-1.5">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={cn("flex gap-1 sm:gap-1.5", ROW_OFFSET[rowIndex])}>
            {rowIndex === 3 ? shiftKey("left") : null}
            {row.map(renderKey)}
            {rowIndex === 3 ? shiftKey("right") : null}
            {rowIndex === 0 && interactive ? (
              <button type="button" onMouseDown={keepFocus} aria-label="Backspace" className={keyClass(false, "max-w-16 flex-[1.4] hover:bg-secondary")} onClick={() => press("Backspace")}>
                <Delete className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ))}
        <div className="flex justify-center pt-0.5">
          {interactive ? (
            <button type="button" onMouseDown={keepFocus} aria-label="Space" className={keyClass(next === " ", "max-w-sm flex-none basis-1/2 text-[10px] tracking-[0.3em] hover:bg-secondary")} onClick={() => press(" ")}>
              space
            </button>
          ) : (
            <span className={keyClass(next === " ", "max-w-sm flex-none basis-1/2 text-[10px] tracking-[0.3em]")}>space</span>
          )}
        </div>
      </div>
      {!interactive ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {nextChar ? (
            <>
              Next: <span className="font-mono text-foreground">{nextChar === " " ? "space" : nextChar}</span>
              {finger ? <> · {finger}</> : null}
              {needsShift && shiftSide ? <> · hold {shiftSide} shift</> : null}
            </>
          ) : (
            "Rest your fingers on the home row: A S D F and J K L ;"
          )}
        </p>
      ) : null}
    </div>
  );
}
