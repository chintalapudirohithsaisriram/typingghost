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
  const composingRef = useRef(false);
  const committedRef = useRef<string | null>(null);

  useEffect(() => {
    if (session.done || !autoFocus) return;
    // Don't steal focus from another field the user is editing (e.g. custom letters).
    const active = document.activeElement;
    if (
      active &&
      active !== inputRef.current &&
      active.matches("input, textarea, select, [contenteditable='true'], [role='textbox']")
    )
      return;
    inputRef.current?.focus({ preventScroll: true });
  }, [session.done, target, autoFocus]);

  useEffect(() => {
    if (typed.length > prevLength.current) playKeySound(session.lastWrong);
    prevLength.current = typed.length;
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [typed.length, session.lastWrong]);

  const { handleBeforeInput, appendText, handleKeyDown, done } = session;

  // If focus drifted to the page or a button (e.g. after clicking the visual guide), a
  // keystroke re-focuses the typing area and still counts.
  useEffect(() => {
    if (!autoFocus || done) return;
    const onKey = (event: KeyboardEvent) => {
      const active = document.activeElement;
      // Buttons (e.g. "Show tap keyboard") hand typing back to the surface;
      // real text fields, links and Tab/Enter keep their normal behaviour.
      if (active && active !== document.body && active.tagName !== "BUTTON") return;
      if (active?.tagName === "BUTTON" && (event.key === " " || event.key === "Enter")) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key !== "Backspace" && event.key.length !== 1) return;
      inputRef.current?.focus({ preventScroll: true });
      handleKeyDown({
        key: event.key,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        nativeEvent: event,
        preventDefault: () => event.preventDefault(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [autoFocus, done, handleKeyDown]);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onBefore = (event: Event) => {
      const input = event as InputEvent;
      if (composingRef.current || input.isComposing) return;
      if (committedRef.current !== null && input.data === committedRef.current && ["insertText", "insertFromComposition"].includes(input.inputType)) {
        input.preventDefault();
        committedRef.current = null;
        return;
      }
      committedRef.current = null;
      handleBeforeInput(input);
    };
    const onCompositionStart = () => { composingRef.current = true; committedRef.current = null; };
    const onCompositionEnd = (event: CompositionEvent) => {
      composingRef.current = false;
      if (event.data) appendText(event.data);
      committedRef.current = event.data || null;
      el.value = "";
    };
    el.addEventListener("compositionstart", onCompositionStart);
    el.addEventListener("beforeinput", onBefore);
    el.addEventListener("compositionend", onCompositionEnd);
    return () => {
      el.removeEventListener("beforeinput", onBefore);
      el.removeEventListener("compositionend", onCompositionEnd);
      el.removeEventListener("compositionstart", onCompositionStart);
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
        onKeyDown={(event) => {
          if (composingRef.current) return;
          committedRef.current = null;
          session.handleKeyDown(event);
        }}
        onInput={(event) => {
          // Anything not handled above must never accumulate in the hidden field.
          if (!composingRef.current) (event.target as HTMLTextAreaElement).value = "";
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
                state === "pending" && "text-muted-foreground/80",
                state === "correct" && "text-foreground",
                state === "wrong" &&
                  "text-destructive underline decoration-destructive/70 decoration-2 underline-offset-4",
                isActive &&
                  !session.done &&
                  "text-foreground shadow-[inset_0_-3px_0_var(--primary)]",
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
