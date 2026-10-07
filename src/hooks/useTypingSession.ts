import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateStats, calculateWpm, compareTypedText, type TypingStats } from "@/lib/typing";

/** Gaps longer than this between keystrokes don't count toward active time. */
const IDLE_CAP_MS = 3000;

export type TypingResult = {
  stats: TypingStats;
  errors: Record<string, number>;
  hits: Record<string, number>;
  target: string;
  typed: string;
};

export type TypingSessionOptions = {
  target: string;
  /** Finish automatically once the target text is fully typed. Never time-limited. */
  completeOnTarget?: boolean;
  onComplete?: (result: TypingResult) => void;
  onKeystroke?: (correct: boolean) => void;
  /** Some games disable corrections; lessons, practice and tests always allow them. */
  allowBackspace?: boolean;
};

/**
 * Unlimited typing session. There is no countdown anywhere: time is only
 * measured (active time, idle gaps capped) and reported as a result.
 */
export function useTypingSession({
  target,
  completeOnTarget = true,
  onComplete,
  onKeystroke,
  allowBackspace = true,
}: TypingSessionOptions) {
  const [value, setValue] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, number>>({});
  const [lastWrong, setLastWrong] = useState(false);

  const activeRef = useRef(0);
  const lastKeyAtRef = useRef<number | null>(null);
  const valueRef = useRef("");
  const mistakesRef = useRef(0);
  const completedRef = useRef(false);
  const sampleAtRef = useRef(0);
  const samplesRef = useRef<number[]>([]);
  const errorsRef = useRef<Record<string, number>>({});
  const hitsRef = useRef<Record<string, number>>({});
  const targetRef = useRef(target);
  const onCompleteRef = useRef(onComplete);
  const onKeystrokeRef = useRef(onKeystroke);
  targetRef.current = target;
  onCompleteRef.current = onComplete;
  onKeystrokeRef.current = onKeystroke;

  const liveElapsed = () => {
    if (lastKeyAtRef.current === null) return activeRef.current;
    return activeRef.current + Math.min(IDLE_CAP_MS, Date.now() - lastKeyAtRef.current);
  };

  const markKey = () => {
    const now = Date.now();
    if (lastKeyAtRef.current !== null) {
      activeRef.current += Math.min(IDLE_CAP_MS, now - lastKeyAtRef.current);
    }
    lastKeyAtRef.current = now;
  };

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    const finalElapsed = Math.max(1, activeRef.current);
    const typed = valueRef.current;
    const comparison = compareTypedText(targetRef.current, typed);
    const finalSample = calculateWpm(Array.from(typed).length, finalElapsed);
    const finalSamples =
      finalSample > 0 ? [...samplesRef.current, finalSample] : samplesRef.current;
    const finalStats = calculateStats(
      comparison.correct,
      comparison.incorrect,
      finalElapsed,
      mistakesRef.current,
    );
    lastKeyAtRef.current = null;
    setElapsedMs(finalElapsed);
    setRunning(false);
    setDone(true);
    onCompleteRef.current?.({
      stats: finalStats,
      errors: { ...errorsRef.current },
      hits: { ...hitsRef.current },
      target: targetRef.current,
      typed,
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const elapsed = liveElapsed();
      setElapsedMs(elapsed);
      if (elapsed - sampleAtRef.current >= 1000) {
        sampleAtRef.current = elapsed;
        const comparison = compareTypedText(targetRef.current, valueRef.current);
        const sample = calculateStats(
          comparison.correct,
          comparison.incorrect,
          Math.max(1, elapsed),
          mistakesRef.current,
        ).netWpm;
        samplesRef.current = [...samplesRef.current, sample];
        setSamples(samplesRef.current);
      }
    };
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [running]);

  const appendCharacters = useCallback(
    (characters: string) => {
      if (completedRef.current || !characters) return;
      markKey();
      if (!running) setRunning(true);
      let nextValue = valueRef.current;
      let nextMistakes = mistakesRef.current;
      const nextErrors = { ...errorsRef.current };
      const nextHits = { ...hitsRef.current };
      const targetChars = Array.from(targetRef.current);
      let wrong = false;

      for (const char of Array.from(characters)) {
        const position = Array.from(nextValue).length;
        const expected = targetChars[position];
        if (expected === undefined) break;
        const key = expected.toLowerCase();
        if (char !== expected) {
          nextMistakes += 1;
          nextErrors[key] = (nextErrors[key] ?? 0) + 1;
          wrong = true;
        } else {
          nextHits[key] = (nextHits[key] ?? 0) + 1;
        }
        nextValue += char;
      }

      valueRef.current = nextValue;
      mistakesRef.current = nextMistakes;
      errorsRef.current = nextErrors;
      hitsRef.current = nextHits;
      setValue(nextValue);
      setMistakes(nextMistakes);
      setErrors(nextErrors);
      setLastWrong(wrong);
      onKeystrokeRef.current?.(!wrong);

      if (completeOnTarget && Array.from(nextValue).length >= targetChars.length) finish();
    },
    [completeOnTarget, finish, running],
  );

  const removeCharacter = useCallback(() => {
    if (completedRef.current || !valueRef.current || !allowBackspace) return;
    markKey();
    valueRef.current = Array.from(valueRef.current).slice(0, -1).join("");
    setValue(valueRef.current);
    setLastWrong(false);
  }, [allowBackspace]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (completedRef.current) return;
      if (event.key === "Tab" || event.key === "Escape") return; // keep keyboard navigation
      if (event.ctrlKey || event.metaKey || event.altKey) {
        if (["v", "x"].includes(event.key.toLowerCase())) event.preventDefault();
        return;
      }
      if (event.nativeEvent.isComposing || event.key === "Unidentified" || event.key === "Process")
        return;
      if (event.key === "Backspace") {
        event.preventDefault();
        removeCharacter();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (targetRef.current.includes("\n")) appendCharacters("\n");
        return;
      }
      if (event.key.length !== 1) return;
      event.preventDefault();
      appendCharacters(event.key);
    },
    [appendCharacters, removeCharacter],
  );

  /** Mobile/IME fallback: soft keyboards often report "Unidentified" keydowns. */
  const handleBeforeInput = useCallback(
    (event: InputEvent) => {
      if (completedRef.current) return;
      if (event.inputType === "deleteContentBackward") {
        event.preventDefault();
        removeCharacter();
      } else if (event.inputType === "insertText" || event.inputType === "insertReplacementText") {
        event.preventDefault();
        if (event.data) appendCharacters(event.data);
      } else if (event.inputType === "insertCompositionText") {
        // let composition finish; committed text arrives via compositionend
      } else {
        event.preventDefault();
      }
    },
    [appendCharacters, removeCharacter],
  );

  const reset = useCallback(() => {
    activeRef.current = 0;
    lastKeyAtRef.current = null;
    valueRef.current = "";
    mistakesRef.current = 0;
    completedRef.current = false;
    sampleAtRef.current = 0;
    samplesRef.current = [];
    errorsRef.current = {};
    hitsRef.current = {};
    setValue("");
    setElapsedMs(0);
    setRunning(false);
    setDone(false);
    setMistakes(0);
    setSamples([]);
    setErrors({});
    setLastWrong(false);
  }, []);

  useEffect(() => {
    reset();
  }, [target, reset]);

  const comparison = useMemo(() => compareTypedText(target, value), [target, value]);
  const stats = useMemo(
    () => calculateStats(comparison.correct, comparison.incorrect, elapsedMs, mistakes),
    [comparison, elapsedMs, mistakes],
  );
  const targetChars = useMemo(() => Array.from(target), [target]);
  const typedLength = Array.from(value).length;

  return {
    value,
    elapsedMs,
    running,
    done,
    mistakes,
    stats,
    errors,
    samples,
    lastWrong,
    currentChar: targetChars[typedLength] ?? "",
    progress: targetChars.length ? Math.min(100, (typedLength / targetChars.length) * 100) : 0,
    finishNow: finish,
    reset,
    handleKeyDown,
    handleBeforeInput,
    appendText: appendCharacters,
    handleVirtualKey: (key: string) =>
      key === "Backspace" ? removeCharacter() : appendCharacters(key),
  };
}

export type TypingSession = ReturnType<typeof useTypingSession>;
