import { useEffect, useMemo, useRef } from "react";
import type { TypingSession } from "@/hooks/useTypingSession";
import { playKeySound } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Props = {
  target: string;
  session: TypingSession;
  size?: "md" | "lg" | "xl";
  hint?: string | undefined;
  autoFocus?: boolean;
  className?: string;
};

/**
 * The only place (besides real keyboard buttons) that produces characters.
 * Captures physical keys via keydown and soft keyboards via beforeinput.
 */
export default function TypingSurface({
  target,
  session,
  size = "md",
  hint,
  autoFocus = true,
  className,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const chars = useMemo(() => Array.from(target), [target]);
  const typed = useMemo(() => Array.from(session.value), [session.value]);
  const prevLength = useRef(0);

  useEffect(() => {
    if (!session.done && autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [session.done, target, autoFocus]);

  useEffect(() => {
    if (typed.length > prevLength.current) playKeySound(session.lastWrong);
    prevLength.current = typed.length;
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [typed.length, session.lastWrong]);

  const { handleBeforeInput, appendText } = session;
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onBefore = (event: Event) => handleBeforeInput(event as InputEvent);
    const onCompositionEnd = (event: CompositionEvent) => {
      if (event.data) appendText(event.data);
      el.value = "";
    };
    el.addEventListener("beforeinput", onBefore);
    el.addEventListener("compositionend", onCompositionEnd);
    return () => {
      el.removeEventListener("beforeinput", onBefore);
      el.removeEventListener("compositionend", onCompositionEnd);
    };
  }, [handleBeforeInput, appendText]);

  return (
    <div
      className={cn(
        "panel relative cursor-text p-5 transition-shadow focus-within:ring-2 focus-within:ring-ring sm:p-7",
        className,
      )}
      onMouseDown={(event) => {
        if (event.target === inputRef.current) return;
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }}
      data-testid="typing-surface"
    >
      <textarea
        ref={inputRef}
        aria-label="Typing area. Type the text shown."
        className="absolute inset-0 h-full w-full resize-none opacity-0"
        defaultValue=""
        rows={1}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        readOnly={session.done}
        onKeyDown={session.handleKeyDown}
        onInput={(event) => {
          // Anything not handled above must never accumulate in the hidden field.
          (event.target as HTMLTextAreaElement).value = "";
        }}
      />

      <span className="sr-only" aria-live="polite">
        {session.done
          ? `Finished. ${Math.round(session.stats.netWpm)} words per minute at ${Math.round(session.stats.realAccuracy)} percent accuracy.`
          : ""}
      </span>

      <p
        aria-hidden="true"
        className={cn(
          "pointer-events-none relative font-mono leading-relaxed break-words whitespace-pre-wrap select-none",
          size === "xl"
            ? "text-2xl sm:text-3xl"
            : size === "lg"
              ? "text-xl sm:text-2xl"
              : "text-lg sm:text-xl",
        )}
      >
        {chars.map((char, index) => {
          const input = typed[index];
          const isActive = index === typed.length;
          const state = input === undefined ? "pending" : input === char ? "correct" : "wrong";
          return (
            <span
              key={index}
              ref={isActive ? activeRef : undefined}
              className={cn(
                "rounded-[3px]",
                state === "pending" && "text-muted-foreground/80",
                state === "correct" && "text-foreground",
                state === "wrong" &&
                  "bg-destructive/15 text-destructive underline decoration-destructive decoration-2 underline-offset-4",
                isActive &&
                  !session.done &&
                  "caret-blink bg-primary/20 text-foreground shadow-[inset_0_-2px_0_var(--primary)]",
              )}
            >
              {char === " " && state === "wrong" ? "␣" : char === "\n" ? "↵\n" : char}
            </span>
          );
        })}
      </p>

      {session.done ? null : (
        <p className="pointer-events-none relative mt-5 text-xs text-muted-foreground">
          {hint ?? "Click here and type · Backspace fixes the last character · No time limit"}
        </p>
      )}
    </div>
  );
}
