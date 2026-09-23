import { useEffect, useMemo, useRef } from "react";
import type { TypingSession } from "@/hooks/useTypingSession";
import { cn } from "@/lib/utils";

type Props = {
  target: string;
  session: TypingSession;
  size?: "md" | "lg";
};

/**
 * Renders the target text character by character with live correctness
 * colouring, and captures keystrokes through an invisible input so the
 * caret behaves identically on desktop and mobile keyboards.
 */
export default function TypingSurface({ target, session, size = "md" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const chars = useMemo(() => Array.from(target), [target]);
  const typed = useMemo(() => Array.from(session.value), [session.value]);

  useEffect(() => {
    if (!session.done) inputRef.current?.focus();
  }, [session.done, target]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [typed.length]);

  return (
    <div
      className="panel relative cursor-text p-5 transition-shadow focus-within:ring-2 focus-within:ring-ring sm:p-7"
      onMouseDown={(event) => {
        event.preventDefault();
        inputRef.current?.focus();
      }}
    >
      <input
        ref={inputRef}
        aria-label="Typing input"
        className="absolute h-px w-px opacity-0"
        value=""
        inputMode="text"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        readOnly={session.done}
        onChange={() => undefined}
        onKeyDown={session.handleKeyDown}
      />

      <span className="sr-only" aria-live="polite">
        {session.done ? `Typing complete. ${Math.round(session.stats.netWpm)} words per minute at ${Math.round(session.stats.realAccuracy)} percent accuracy.` : ""}
      </span>

      <p
        className={cn(
          "font-mono leading-relaxed tracking-wide break-words whitespace-pre-wrap",
          size === "lg" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
        )}
      >
        {chars.map((char, index) => {
          const input = typed[index];
          const isActive = index === typed.length;
          const state =
            input === undefined ? "pending" : input === char ? "correct" : "wrong";
          return (
            <span
              key={`${char}-${index}`}
              ref={isActive ? activeRef : undefined}
              className={cn(
                "relative rounded-[3px]",
                state === "pending" && "text-muted-foreground",
                state === "correct" && "text-foreground",
                state === "wrong" &&
                  "bg-destructive/25 text-destructive underline decoration-destructive/70 decoration-2",
                isActive && !session.done && "caret-blink bg-primary/25 text-foreground",
              )}
            >
              {char === " " && state === "wrong" ? "␣" : char}
            </span>
          );
        })}
      </p>

      {session.done ? null : (
        <p className="mt-5 text-xs text-muted-foreground">
          Click here and start typing · Backspace fixes the last character
        </p>
      )}
    </div>
  );
}
