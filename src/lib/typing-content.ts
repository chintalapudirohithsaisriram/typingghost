export type Lesson = {
  id: string;
  level: number;
  stage:
    | "Getting started"
    | "Home row"
    | "Reaches"
    | "Capitals and Shift"
    | "Numbers and punctuation"
    | "Words and patterns"
    | "Fluency and transfer";
  title: string;
  description: string;
  tip: string;
  targetKeys: string[];
  finger: string;
  exercise: string;
  goalWpm: number;
  goalAccuracy: number;
  demonstration: string;
  success: string;
};

type RawLesson = Omit<Lesson, "stage" | "demonstration" | "success"> & {
  stage: string;
};

const RAW_LESSONS: RawLesson[] = [
  {
    id: "first-keystrokes",
    level: 1,
    stage: "Foundations",
    title: "First Keystrokes",
    description: "Meet the two anchor keys and learn deliberate, single-key movement.",
    tip: "Feel the small bumps on F and J. Your index fingers live there.",
    targetKeys: ["f", "j"],
    finger: "Left index + right index",
    exercise: "f j f j fj jf fj jf f j f j fj jf fj jf ffjj jjff fj jf",
    goalWpm: 8,
    goalAccuracy: 90,
  },
  {
    id: "home-row",
    level: 2,
    stage: "Foundations",
    title: "Home Row",
    description: "Set all eight fingers on their anchors and keep them there.",
    tip: "Return every finger to its home key after each stroke.",
    targetKeys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    finger: "Index, middle, ring, pinky",
    exercise: "asdf jkl; fdsa ;lkj asdf jkl; fdsa ;lkj asdf jkl; ajsk dlf;",
    goalWpm: 12,
    goalAccuracy: 92,
  },
  {
    id: "home-row-words",
    level: 3,
    stage: "Foundations",
    title: "Home Row Words",
    description: "Turn home-row movement into short, repeatable words.",
    tip: "Read a whole word before typing it instead of hunting letter by letter.",
    targetKeys: ["a", "s", "d", "f", "j", "k", "l"],
    finger: "All home-row fingers",
    exercise: "ask sad fall flask lad all dad salad falls asks lads flask sad all ask",
    goalWpm: 15,
    goalAccuracy: 93,
  },
  {
    id: "g-and-h",
    level: 4,
    stage: "Foundations",
    title: "The G and H Stretch",
    description: "Stretch your index fingers inward without moving your wrists.",
    tip: "Only the index finger moves. The other three stay planted.",
    targetKeys: ["g", "h"],
    finger: "Left index + right index",
    exercise: "fg jh fg jh gh hg gash flash half glad hall gash gala hash",
    goalWpm: 16,
    goalAccuracy: 93,
  },
  {
    id: "left-reach",
    level: 5,
    stage: "Reaches",
    title: "Left Hand Top Row",
    description: "Reach up from home position and snap straight back.",
    tip: "Up-and-back in one motion — never drift your hand across the board.",
    targetKeys: ["q", "w", "e", "r", "t"],
    finger: "Left hand by finger zone",
    exercise: "aq sw de fr ft qw er tw was were wet trade quart start tear",
    goalWpm: 18,
    goalAccuracy: 94,
  },
  {
    id: "right-reach",
    level: 6,
    stage: "Reaches",
    title: "Right Hand Top Row",
    description: "Build controlled reaches across the right side of the top row.",
    tip: "Keep your right pinky light — it only taps P, it doesn't lunge.",
    targetKeys: ["y", "u", "i", "o", "p"],
    finger: "Right hand by finger zone",
    exercise: "jy ku li op py yu io up you your pour joy pilot yield opium",
    goalWpm: 18,
    goalAccuracy: 94,
  },
  {
    id: "reach-return",
    level: 7,
    stage: "Reaches",
    title: "Reach and Return",
    description: "Alternate hands and return cleanly to the anchors each time.",
    tip: "Alternating hands is faster than same-hand runs. Let each hand rest.",
    targetKeys: ["r", "u", "e", "i"],
    finger: "Index + middle fingers",
    exercise: "fr ju re ui er iu rue tier quiet rider where their outside",
    goalWpm: 20,
    goalAccuracy: 95,
  },
  {
    id: "top-row-words",
    level: 8,
    stage: "Reaches",
    title: "Top Row Words",
    description: "Whole words that live on the top row, reached and returned cleanly.",
    tip: "Reach up with one finger only — the rest stay anchored on the home row.",
    targetKeys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    finger: "All fingers reach up",
    exercise: "type write power tower quiet route pretty equip tipper trout rope wiper pour yeti",
    goalWpm: 22,
    goalAccuracy: 95,
  },
  {
    id: "lower-row",
    level: 9,
    stage: "Reaches",
    title: "Bottom Row",
    description: "Curl down into the bottom row while keeping your wrists relaxed.",
    tip: "Curl the fingertip down; do not drop your whole wrist to the desk.",
    targetKeys: ["z", "x", "c", "v", "b", "n", "m"],
    finger: "Mapped by finger zone",
    exercise: "cv vm bn mx zv xc cb nm can van mix zone brave number climb",
    goalWpm: 22,
    goalAccuracy: 95,
  },
  {
    id: "all-letters",
    level: 10,
    stage: "Fluency",
    title: "All Letters",
    description: "Combine all three letter rows without looking down.",
    tip: "If you glance at the keys, slow down instead — looking down resets progress.",
    targetKeys: ["all"],
    finger: "All fingers",
    exercise: "the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs",
    goalWpm: 25,
    goalAccuracy: 95,
  },
  {
    id: "word-building",
    level: 11,
    stage: "Fluency",
    title: "Common Words",
    description: "Automate the two hundred words you type most often.",
    tip: "Frequent words should feel like one motion, not five separate taps.",
    targetKeys: ["t", "h", "e", "r", "o", "n"],
    finger: "Mixed",
    exercise:
      "the other there another north then these those their people about would because between",
    goalWpm: 28,
    goalAccuracy: 95,
  },
  {
    id: "tricky-patterns",
    level: 12,
    stage: "Fluency",
    title: "Tricky Patterns",
    description: "Drill the letter transitions that break most people's rhythm.",
    tip: "Repeat a stumble three times slowly before you speed it up.",
    targetKeys: ["t", "r", "h", "g"],
    finger: "Mixed",
    exercise:
      "right tight sight great three through thought bright straight rhythm strength lengths",
    goalWpm: 30,
    goalAccuracy: 96,
  },
  {
    id: "capital-letters",
    level: 13,
    stage: "Fluency",
    title: "Shift and Capitals",
    description: "Coordinate Shift with the opposite hand and keep your rhythm.",
    tip: "Always use the Shift on the opposite side from the letter.",
    targetKeys: ["shift"],
    finger: "Opposite-hand pinky for Shift",
    exercise:
      "Good Work. Type Calmly. Build Control. Keep Focus. Monday In March. New York And Paris.",
    goalWpm: 30,
    goalAccuracy: 96,
  },
  {
    id: "numbers",
    level: 14,
    stage: "Mastery",
    title: "Number Row",
    description: "Reach for numbers while your home position stays stable.",
    tip: "Numbers use the same finger as the letter directly below them.",
    targetKeys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    finger: "Mapped by finger zone",
    exercise: "12345 67890 2026 314159 8080 42 100 365 2048 4096 1920 1080 75",
    goalWpm: 26,
    goalAccuracy: 95,
  },
  {
    id: "numbers-in-context",
    level: 15,
    stage: "Mastery",
    title: "Numbers in Context",
    description: "Dates, prices and quantities mixed into real sentences.",
    tip: "Glance at the whole number first, then type it as one confident chunk.",
    targetKeys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    finger: "Mapped by finger zone",
    exercise: "Room 204 opens at 9 on May 17. Order 36 pens and 48 pads. Call 555 0192 by 2030.",
    goalWpm: 26,
    goalAccuracy: 95,
  },
  {
    id: "punctuation",
    level: 16,
    stage: "Mastery",
    title: "Punctuation",
    description: "Commas, quotes, colons and sentence endings without hesitation.",
    tip: "One space after a period. Let the thumb handle every space.",
    targetKeys: [",", ".", ";", "'", ":", "!"],
    finger: "Mapped by finger zone",
    exercise:
      'Ready, set, type. Keep pace; stay precise! Yes: breathe, focus, repeat. "Steady," she said.',
    goalWpm: 30,
    goalAccuracy: 96,
  },
  {
    id: "symbols",
    level: 17,
    stage: "Mastery",
    title: "Symbols",
    description: "Shifted symbols used in email, code and everyday writing.",
    tip: "Symbols are Shift plus a number — same finger, one row up.",
    targetKeys: ["@", "#", "$", "%", "&", "*", "(", ")", "-", "_"],
    finger: "Mapped by finger zone",
    exercise: "name@mail.com 50% off #1 pick (draft) $1,250 a_b_c 10*4 R&D +/- 99",
    goalWpm: 24,
    goalAccuracy: 94,
  },
  {
    id: "accuracy-loop",
    level: 18,
    stage: "Mastery",
    title: "Accuracy Loop",
    description: "Slow, exact repetition until the hard patterns settle.",
    tip: "Target 98% here. Speed is not the goal in this lesson.",
    targetKeys: ["g", "h", "r", "t"],
    finger: "Mixed",
    exercise:
      "fr fr ju ju fr ju tr tr hg hg right right tight tight great great three three through through gather gather higher higher",
    goalWpm: 32,
    goalAccuracy: 98,
  },
  {
    id: "speed-builder",
    level: 19,
    stage: "Mastery",
    title: "Speed Builder",
    description: "Raise your pace while protecting accuracy and rhythm.",
    tip: "Push to a pace where you make one or two errors — then hold it.",
    targetKeys: ["all"],
    finger: "All fingers",
    exercise:
      "Fast hands still need calm, accurate movement. Keep the rhythm steady and let speed follow good technique.",
    goalWpm: 40,
    goalAccuracy: 96,
  },
  {
    id: "endurance",
    level: 20,
    stage: "Mastery",
    title: "Endurance",
    description: "Hold reliable technique through a longer piece of text.",
    tip: "Breathe normally and relax your shoulders every few lines.",
    targetKeys: ["all"],
    finger: "All fingers",
    exercise:
      "Consistent practice turns conscious technique into effortless habit. Sit tall, relax your shoulders, and keep your eyes a few words ahead of your hands. When a mistake appears, stay calm, correct the pattern, and carry on without losing the rhythm you have built.",
    goalWpm: 45,
    goalAccuracy: 96,
  },
];

const COURSE_ORDER = [
  "first-keystrokes",
  "home-row",
  "home-row-words",
  "g-and-h",
  "left-reach",
  "right-reach",
  "reach-return",
  "top-row-words",
  "lower-row",
  "all-letters",
  "capital-letters",
  "numbers",
  "numbers-in-context",
  "punctuation",
  "symbols",
  "word-building",
  "tricky-patterns",
  "accuracy-loop",
  "speed-builder",
  "endurance",
] as const;

const stageFor = (id: string): Lesson["stage"] => {
  if (id === "first-keystrokes") return "Getting started";
  if (["home-row", "home-row-words", "g-and-h"].includes(id)) return "Home row";
  if (["left-reach", "right-reach", "reach-return", "top-row-words", "lower-row", "all-letters"].includes(id)) return "Reaches";
  if (id === "capital-letters") return "Capitals and Shift";
  if (["numbers", "numbers-in-context", "punctuation", "symbols"].includes(id)) return "Numbers and punctuation";
  if (["word-building", "tricky-patterns"].includes(id)) return "Words and patterns";
  return "Fluency and transfer";
};

export const LESSONS: Lesson[] = COURSE_ORDER.map((id, index) => {
  const lesson = RAW_LESSONS.find((item) => item.id === id);
  if (!lesson) throw new Error(`Missing lesson: ${id}`);
  return {
    ...lesson,
    level: index + 1,
    stage: stageFor(id),
    demonstration:
      id === "first-keystrokes"
        ? "Place your index fingers on the raised bumps at F and J. Keep wrists straight, shoulders relaxed, and the keyboard directly in front of you."
        : `${lesson.tip} After each reach, bring the finger back to its home position.`,
    success: `Complete the full exercise with at least ${lesson.goalAccuracy}% real accuracy. Speed is information, not a pass requirement.`,
  };
});

export const lessonById = (id: string) => LESSONS.find((lesson) => lesson.id === id);

export type Difficulty = "easy" | "medium" | "hard";

export const TEST_PASSAGES: Record<Difficulty, string[]> = {
  easy: [
    "Good typing begins with calm hands and steady movement. Keep your fingers close to the home row and let the rhythm grow on its own.",
    "Practice a little each day. Small, careful steps build strong habits, better accuracy, and faster typing over time.",
    "Touch typing makes the keyboard feel familiar. Look at the words, trust your fingers, and stay with the next letter.",
    "A quiet room and a straight back help more than raw effort. Comfort first, speed second, and progress follows.",
  ],
  medium: [
    "The quickest typists are not rushing every keystroke. They rely on efficient finger paths, an even rhythm, and dependable muscle memory that does the work for them.",
    "Strong typists recover from mistakes without losing their rhythm. They breathe, correct the pattern, and return their attention to the next word on the line.",
    "Clear writing rewards clear typing. Keep your eyes on the next phrase, let your fingers follow the pattern they have practiced, and resist the urge to look down.",
    "Professional typing is quiet, accurate, and repeatable. Build control first, and let speed emerge from movement that no longer wastes effort.",
  ],
  hard: [
    "Rhythm, not raw velocity, separates a 60 wpm typist from a 110 wpm typist: the faster hand simply wastes fewer motions, hesitates less between awkward bigrams, and recovers from a mistyped key in roughly 40 milliseconds.",
    '"Accuracy is the quiet engine of speed," the instructor said, "because every correction costs you three keystrokes: the wrong one, the backspace, and the right one." Budget 98% accuracy and the pace arrives free.',
    "Between 2019 and 2026, remote work pushed average daily keystrokes from roughly 8,500 to 13,200 per person — a 55% jump that made posture, wrist angle, and break intervals matter far more than they once did.",
    "Deliberate practice means choosing the uncomfortable drill: the punctuation run, the number row, the same-hand sequence (qwe, zxc, plo) that you quietly avoid because it exposes exactly what you have not yet learned.",
  ],
};

export const COMMON_WORDS =
  "the of and to in is you that it he was for on are as with his they at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part".split(
    " ",
  );

export const FINGER_BY_KEY: Record<string, string> = {
  "`": "left pinky",
  "1": "left pinky",
  q: "left pinky",
  a: "left pinky",
  z: "left pinky",
  "2": "left ring",
  w: "left ring",
  s: "left ring",
  x: "left ring",
  "3": "left middle",
  e: "left middle",
  d: "left middle",
  c: "left middle",
  "4": "left index",
  "5": "left index",
  r: "left index",
  t: "left index",
  f: "left index",
  g: "left index",
  v: "left index",
  b: "left index",
  "6": "right index",
  "7": "right index",
  y: "right index",
  u: "right index",
  h: "right index",
  j: "right index",
  n: "right index",
  m: "right index",
  "8": "right middle",
  i: "right middle",
  k: "right middle",
  ",": "right middle",
  "9": "right ring",
  o: "right ring",
  l: "right ring",
  ".": "right ring",
  "0": "right pinky",
  p: "right pinky",
  ";": "right pinky",
  "/": "right pinky",
  "'": "right pinky",
  "-": "right pinky",
  "=": "right pinky",
  "[": "right pinky",
  "]": "right pinky",
  "\\": "right pinky",
  enter: "right pinky",
  Backspace: "right pinky",
  Tab: "left pinky",
  " ": "thumbs",
};

export const KEYBOARD_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

/** Shifted characters mapped to the physical key that produces them. */
export const SHIFT_MAP: Record<string, string> = {
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  _: "-",
  "+": "=",
  ":": ";",
  '"': "'",
  "<": ",",
  ">": ".",
  "?": "/",
  "~": "`",
  "{": "[",
  "}": "]",
  "|": "\\",
};

/** Physical key + whether Shift is needed for a target character. */
export function keyFor(char: string): { key: string; shift: boolean } {
  if (!char) return { key: "", shift: false };
  if (char === "\n") return { key: "enter", shift: false };
  if (char === "\t") return { key: "Tab", shift: false };
  if (SHIFT_MAP[char]) return { key: SHIFT_MAP[char], shift: true };
  if (/[A-Z]/.test(char)) return { key: char.toLowerCase(), shift: true };
  return { key: char, shift: false };
}

/** Shift is pressed with the pinky of the opposite hand. */
export function shiftSideFor(key: string): "left" | "right" | null {
  const finger = FINGER_BY_KEY[key];
  if (!finger) return null;
  return finger.startsWith("left") ? "right" : "left";
}

export type TestMode = "passage" | "words" | "numbers" | "punctuation" | "custom";

export const NUMBER_LINES = [
  "Flight 482 departs at 7 45 from gate 12 and lands at 10 30 after 1 280 kilometres.",
  "The survey had 1 024 replies: 612 said yes, 305 said no and 107 skipped the question.",
  "Invoice 2026 0419 lists 3 chairs at 149, 2 desks at 389 and 1 lamp at 45.",
  "Call extension 5530 before 9 or after 17, or text 0 7700 900 312 for help.",
  "Between 1990 and 2020 the town grew from 18 500 to 41 200 people in 30 years.",
  "Pack 6 boxes of 24, then 4 boxes of 36, for a total of 288 items on pallet 9.",
];

export const PUNCTUATION_LINES = [
  "Wait, did you save the file? Yes; I saved it twice: once locally, once online.",
  '"Slow is smooth," she said, "and smooth is fast." He nodded; it made sense.',
  "Bring three things: a notebook, a pen, and patience. Don't forget the charger!",
  "It's not rush-hour yet, so the trip (usually 40 minutes) should be quicker.",
  "Is it ready? Almost. Check the list: tickets, passport, keys; then we're off!",
  'Her note read: "Back at noon." It was 3 p.m., and the door was still locked.',
];

/** All passages, easy → hard, used for rotation. */
export const ALL_PASSAGES = [...TEST_PASSAGES.easy, ...TEST_PASSAGES.medium, ...TEST_PASSAGES.hard];

/** Pick the next item from a pool, avoiding anything in `recent` until the pool is exhausted. */
export function pickRotating<T>(pool: T[], recent: T[], random: () => number = Math.random): T {
  const fresh = pool.filter((item) => !recent.includes(item));
  const source = fresh.length ? fresh : pool.filter((item) => item !== recent[recent.length - 1]);
  const list = source.length ? source : pool;
  return list[Math.floor(random() * list.length)] as T;
}

export function generateWords(count = 30, random: () => number = Math.random): string {
  const words: string[] = [];
  for (let i = 0; i < count; i += 1) {
    let word = COMMON_WORDS[Math.floor(random() * COMMON_WORDS.length)] as string;
    if (word === words[words.length - 1])
      word = COMMON_WORDS[(COMMON_WORDS.indexOf(word) + 1) % COMMON_WORDS.length] as string;
    words.push(word);
  }
  return words.join(" ");
}

/** Letters-only practice text: pseudo-words built strictly from the chosen letters. */
export function generateCustomLetters(
  letters: string[],
  count = 24,
  random: () => number = Math.random,
): string {
  const pool = Array.from(
    new Set(letters.map((l) => l.toLowerCase()).filter((l) => /^[a-z]$/.test(l))),
  );
  if (!pool.length) return "";
  const realWords = COMMON_WORDS.filter((word) => Array.from(word).every((c) => pool.includes(c)));
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    if (realWords.length >= 4 && random() < 0.5) {
      out.push(realWords[Math.floor(random() * realWords.length)] as string);
      continue;
    }
    const len = 2 + Math.floor(random() * 4);
    let word = "";
    for (let j = 0; j < len; j += 1) word += pool[Math.floor(random() * pool.length)];
    out.push(word);
  }
  return out.join(" ");
}

/** Build a drill line that hammers the given weak keys inside readable chunks. */
export function buildDrill(keys: string[], length = 90): string {
  const pool = Array.from(
    new Set(keys.map((k) => k.toLowerCase()).filter((key) => key.length === 1 && key !== " ")),
  );
  if (!pool.length) return generateWords(18);
  const letterPool = pool.filter((key) => /[a-z]/.test(key));
  const words = COMMON_WORDS.filter((word) => letterPool.some((key) => word.includes(key)));
  const chunks: string[] = [];
  let index = 0;
  while (chunks.join(" ").length < length) {
    const a = pool[index % pool.length] as string;
    const b = pool[(index + 1) % pool.length] as string;
    chunks.push(`${a}${b}${a}`);
    if (words.length) chunks.push(words[(index * 7) % words.length] as string);
    chunks.push(`${b}${a}${b}`);
    if (words.length) chunks.push(words[(index * 11 + 3) % words.length] as string);
    index += 1;
  }
  return chunks.join(" ");
}
