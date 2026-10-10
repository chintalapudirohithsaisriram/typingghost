export type TypingStats = {
  elapsedMs: number;
  correct: number;
  incorrect: number;
  typed: number;
  netWpm: number;
  accuracy: number;
  realAccuracy: number;
  errorRate: number;
  errors: number;
};

const finite = (value: number) => (Number.isFinite(value) ? value : 0);
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** WPM uses the standard 5 keystrokes = 1 word convention. */
export function calculateWpm(characters: number, elapsedMs: number): number {
  const chars = Math.max(0, finite(characters));
  const elapsed = Math.max(0, finite(elapsedMs));
  if (!chars || !elapsed) return 0;
  return chars / 5 / (elapsed / 60_000);
}

/** Gross speed minus a transparent penalty for historical incorrect keystrokes. */
export function calculateNetWpm(grossWpm: number, errors: number, elapsedMs: number): number {
  const gross = Math.max(0, finite(grossWpm));
  const wrong = Math.max(0, finite(errors));
  const elapsed = Math.max(0, finite(elapsedMs));
  if (!gross || !elapsed) return 0;
  return Math.max(0, gross - calculateWpm(wrong, elapsed));
}

export function calculateStats(
  correct: number,
  incorrect: number,
  elapsedMs: number,
  errorCount = incorrect,
): TypingStats {
  const right = Math.max(0, finite(correct));
  const wrong = Math.max(0, finite(incorrect));
  const typed = right + wrong;
  const elapsed = Math.max(0, finite(elapsedMs));
  const errors = Math.max(0, finite(errorCount));
  const gross = calculateWpm(typed, elapsed);
  // Net WPM penalises errors left uncorrected in the final text (standard definition).
  const netWpm = calculateNetWpm(gross, wrong, elapsed);
  const accuracy = typed ? clamp((right / typed) * 100, 0, 100) : 0;
  const realAccuracy = typed ? clamp(((typed - errors) / typed) * 100, 0, 100) : 0;
  const errorRate = typed ? clamp((errors / typed) * 100, 0, 100) : 0;

  return {
    elapsedMs: elapsed,
    correct: right,
    incorrect: wrong,
    typed,
    netWpm,
    accuracy,
    realAccuracy,
    errorRate,
    errors,
  };
}

export function compareTypedText(target: string, value: string) {
  const targetChars = [...target];
  const chars = [...value];
  let correct = 0;
  let incorrect = 0;
  chars.forEach((char, index) => (char === targetChars[index] ? correct++ : incorrect++));
  return { correct, incorrect };
}

export const formatSeconds = (ms: number) => {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export type CharState = "correct" | "wrong" | "missed";
export type CharReview = { expected: string; typed: string | undefined; state: CharState };

export type WordAttempt = {
  target: string;
  attempt: string;
  errorKeys: string[];
};

/** Character-by-character comparison of the final attempt against the target. */
export function reviewCharacters(target: string, typed: string): CharReview[] {
  const expected = Array.from(target);
  const actual = Array.from(typed);
  return expected.map((char, index) => {
    const input = actual[index];
    return {
      expected: char,
      typed: input,
      state: input === undefined ? "missed" : input === char ? "correct" : "wrong",
    };
  });
}

/**
 * Returns only word-sized mistakes. Punctuation stays attached so "Work." and
 * "work" remain distinct teaching patterns; whitespace and full passages do not.
 */
export function reviewWordAttempts(target: string, typed: string): WordAttempt[] {
  const expected = Array.from(target);
  const actual = Array.from(typed);
  const attempts: WordAttempt[] = [];
  let start = 0;

  const flush = (end: number) => {
    if (end <= start) return;
    const targetWord = expected.slice(start, end).join("");
    const attempt = actual.slice(start, Math.min(end, actual.length)).join("");
    if (attempt === targetWord || (!attempt && start >= actual.length)) return;
    const errorKeys = Array.from(
      new Set(
        expected
          .slice(start, end)
          .filter((char, index) => actual[start + index] !== char)
          .map((char) => char.toLowerCase()),
      ),
    );
    attempts.push({ target: targetWord, attempt, errorKeys });
  };

  expected.forEach((char, index) => {
    if (/\s/u.test(char)) {
      flush(index);
      start = index + 1;
    }
  });
  flush(expected.length);
  return attempts;
}
