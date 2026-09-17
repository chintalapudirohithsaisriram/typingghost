import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateStats, calculateWpm, compareTypedText, type TypingStats } from "@/lib/typing";

export type TypingSessionOptions = {
  target: string;
  /** Finish automatically once the target text is fully typed. */
  completeOnTarget?: boolean;
  /** Optional countdown in milliseconds (timed tests). */
  limitMs?: number;
  onComplete?: (result: {
    stats: TypingStats;
    errors: Record<string, number>;
    hits: Record<string, number>;
    target: string;
    typed: string;
  }) => void;
};

export function useTypingSession({
  target,
  completeOnTarget = true,
  limitMs,
  onComplete,
}: TypingSessionOptions) {
  const [value, setValue] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, number>>({});

  const startedAtRef = useRef<number | null>(null);
  const valueRef = useRef("");
  const mistakesRef = useRef(0);
  const completedRef = useRef(false);
  const sampleAtRef = useRef(0);
  const samplesRef = useRef<number[]>([]);
  const errorsRef = useRef<Record<string, number>>({});
  const hitsRef = useRef<Record<string, number>>({});
  const targetRef = useRef(target);
  const onCompleteRef = useRef(onComplete);
  targetRef.current = target;
  onCompleteRef.current = onComplete;

  const finish = useCallback((finalElapsed: number) => {
    if (completedRef.current) return;
    completedRef.current = true;
    const typed = valueRef.current;
    const comparison = compareTypedText(targetRef.current, typed);
    const finalSample = finalElapsed > 0 ? calculateWpm(Array.from(typed).length, finalElapsed) : 0;
    const finalSamples = finalSample > 0 ? [...samplesRef.current, finalSample] : samplesRef.current;
    const finalStats = calculateStats(
      comparison.correct,
      comparison.incorrect,
      finalElapsed,
      finalSamples,
      mistakesRef.current,
    );
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
    if (!running || startedAtRef.current === null) return;
    const tick = () => {
      const elapsed = Math.max(0, Date.now() - (startedAtRef.current ?? Date.now()));
      setElapsedMs(elapsed);
      if (elapsed - sampleAtRef.current >= 1000) {
        sampleAtRef.current = elapsed;
        const comparison = compareTypedText(targetRef.current, valueRef.current);
        const sample = calculateStats(
          comparison.correct,
          comparison.incorrect,
          Math.max(1, elapsed),
        ).grossWpm;
        samplesRef.current = [...samplesRef.current, sample];
        setSamples(samplesRef.current);
      }
      if (limitMs && elapsed >= limitMs) finish(limitMs);
    };
    tick();
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [running, limitMs, finish]);

  const startIfNeeded = useCallback(() => {
    if (startedAtRef.current !== null || done) return;
    startedAtRef.current = Date.now();
    completedRef.current = false;
    setRunning(true);
    setElapsedMs(0);
  }, [done]);

  const appendCharacters = useCallback(
    (characters: string) => {
      if (done || !characters) return;
      startIfNeeded();
      let nextValue = valueRef.current;
      let nextMistakes = mistakesRef.current;
      const nextErrors = { ...errorsRef.current };
      const nextHits = { ...hitsRef.current };
      const targetChars = Array.from(targetRef.current);
      const length = () => Array.from(nextValue).length;

      for (const char of Array.from(characters)) {
        const expected = targetChars[length()];
        if (expected === undefined) break;
        const key = expected.toLowerCase();
        if (char !== expected) {
          nextMistakes += 1;
          nextErrors[key] = (nextErrors[key] ?? 0) + 1;
        } else {
          nextHits[key] = (nextHits[key] ?? 0) + 1;
        }
        nextValue += char;
        if (completeOnTarget && length() >= targetChars.length) break;
      }

      valueRef.current = nextValue;
      mistakesRef.current = nextMistakes;
      errorsRef.current = nextErrors;
      hitsRef.current = nextHits;
      setValue(nextValue);
      setMistakes(nextMistakes);
      setErrors(nextErrors);

      if (completeOnTarget && length() >= targetChars.length) {
        finish(Math.max(1, Date.now() - (startedAtRef.current ?? Date.now())));
      }
    },
    [completeOnTarget, done, finish, startIfNeeded],
  );

  const removeCharacter = useCallback(() => {
    if (done || !valueRef.current) return;
    valueRef.current = Array.from(valueRef.current).slice(0, -1).join("");
    setValue(valueRef.current);
  }, [done]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (done) return;
      if (event.ctrlKey || event.metaKey || event.altKey) {
        if (["v", "c", "x", "a"].includes(event.key.toLowerCase())) event.preventDefault();
        return;
      }
      if (["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Delete"].includes(event.key)) {
        event.preventDefault();
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        removeCharacter();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        appendCharacters("\n");
        return;
      }
      if (event.key.length !== 1) return;
      event.preventDefault();
      appendCharacters(event.key);
    },
    [appendCharacters, done, removeCharacter],
  );

  const reset = useCallback(() => {
    startedAtRef.current = null;
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
  }, []);

  // A new target always means a fresh run.
  useEffect(() => {
    reset();
  }, [target, reset]);

  const comparison = useMemo(() => compareTypedText(target, value), [target, value]);
  const stats = useMemo(
    () => calculateStats(comparison.correct, comparison.incorrect, elapsedMs, samples, mistakes),
    [comparison, elapsedMs, mistakes, samples],
  );
  const targetChars = useMemo(() => Array.from(target), [target]);
  const typedLength = Array.from(value).length;

  return {
    value,
    elapsedMs,
    remainingMs: limitMs ? Math.max(0, limitMs - elapsedMs) : undefined,
    running,
    done,
    mistakes,
    stats,
    errors,
    samples,
    currentChar: targetChars[typedLength] ?? "",
    progress: targetChars.length ? Math.min(100, (typedLength / targetChars.length) * 100) : 0,
    finishNow: () => finish(Math.max(1, elapsedMs)),
    reset,
    handleKeyDown,
    handleVirtualKey: (key: string) =>
      key === "Backspace" ? removeCharacter() : appendCharacters(key),
  };
}

export type TypingSession = ReturnType<typeof useTypingSession>;
