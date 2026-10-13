export type LessonStage =
  | "Setup and home row"
  | "Top-row reaches"
  | "Bottom-row reaches"
  | "Full alphabet and patterns"
  | "Capitals and punctuation"
  | "Numbers and symbols"
  | "Everyday writing"
  | "Advanced fluency";

export type LessonActivity = {
  id: string;
  kind: "warmup" | "drill" | "transfer" | "review";
  instruction: string;
  text: string;
  focusKeys?: string[];
};

export type Lesson = {
  id: string;
  level: number;
  stage: LessonStage;
  title: string;
  description: string;
  tip: string;
  targetKeys: string[];
  finger: string;
  activities: LessonActivity[];
  goalAccuracy: number;
  demonstration: string;
  success: string;
};

type LessonDefinition = Omit<Lesson, "level" | "activities" | "demonstration" | "success"> & {
  drill: string;
  transfer: string;
  review?: string;
};

export const COURSE_STAGES: { title: LessonStage; description: string; lessonCount: number }[] = [
  {
    title: "Setup and home row",
    description: "Get comfortable, find the home keys, and build a relaxed starting position.",
    lessonCount: 6,
  },
  {
    title: "Top-row reaches",
    description: "Learn small top-row groups, returning each finger to home between reaches.",
    lessonCount: 7,
  },
  {
    title: "Bottom-row reaches",
    description: "Reach down with control, then bring each finger back to its home key.",
    lessonCount: 7,
  },
  {
    title: "Full alphabet and patterns",
    description: "Connect the whole alphabet through common words, useful patterns, and review.",
    lessonCount: 8,
  },
  {
    title: "Capitals and punctuation",
    description: "Coordinate opposite-hand Shift and add punctuation in manageable groups.",
    lessonCount: 8,
  },
  {
    title: "Numbers and symbols",
    description: "Reach for numbers and common shifted symbols in real formats.",
    lessonCount: 6,
  },
  {
    title: "Everyday writing",
    description: "Use your growing skill in messages, study, work, and practical text.",
    lessonCount: 4,
  },
  {
    title: "Advanced fluency",
    description:
      "Build steady rhythm, practise personal weak keys, and transfer skills to longer text.",
    lessonCount: 4,
  },
];

const definitions: LessonDefinition[] = [
  {
    id: "first-keystrokes",
    stage: "Setup and home row",
    title: "Comfortable Setup",
    description: "Set up your keyboard and body so practice feels relaxed and repeatable.",
    tip: "Sit tall with loose shoulders; keep wrists floating and the keyboard centered.",
    targetKeys: ["f", "j"],
    finger: "Both hands relaxed; index fingers find F and J",
    drill: "fjfj",
    transfer: "fjjf",
    goalAccuracy: 85,
  },
  {
    id: "home-row",
    stage: "Setup and home row",
    title: "F and J Anchors",
    description:
      "Use the raised bumps to return your index fingers to the home position without looking down.",
    tip: "Left index rests on F and right index on J; feel the bumps with your fingertips.",
    targetKeys: ["f", "j"],
    finger: "Left index F · right index J",
    drill: "fjfjfjfjffjjjjffjfjfjf",
    transfer: "fjjf",
    goalAccuracy: 88,
  },
  {
    id: "left-home-row",
    stage: "Setup and home row",
    title: "Left Home Row",
    description: "Place the left little, ring, middle, and index fingers on A, S, D, and F.",
    tip: "Keep the left hand curved and let each finger move only to its own key.",
    targetKeys: ["a", "s", "d", "f"],
    finger: "Left pinky A · ring S · middle D · index F",
    drill: "asdfasdffsadfdas",
    transfer: "sad",
    goalAccuracy: 90,
  },
  {
    id: "right-home-row",
    stage: "Setup and home row",
    title: "Right Home Row",
    description:
      "Place the right index, middle, ring, and little fingers on J, K, L, and semicolon.",
    tip: "Right index stays on J; the little finger reaches to semicolon and returns.",
    targetKeys: ["j", "k", "l", ";"],
    finger: "Right index J · middle K · ring L · pinky semicolon",
    drill: "jkl;jkll;;lkjjl",
    transfer: "ask",
    goalAccuracy: 90,
  },
  {
    id: "g-and-h",
    stage: "Setup and home row",
    title: "Space, G and H, Alternating Hands",
    description:
      "Use the thumbs for spaces, alternate hands, and reach inward to G and H with the index fingers.",
    tip: "Left index reaches from F to G; right index reaches from J to H. Keep wrists still and use either thumb for Space.",
    targetKeys: ["g", "h", " "],
    finger: "Index fingers reach G/H · either thumb presses Space",
    drill: "fg jh gh hg f g j h a g h;",
    transfer: "a dad has a flag",
    goalAccuracy: 90,
  },
  {
    id: "home-row-words",
    stage: "Setup and home row",
    title: "Home-Row Words and Review",
    description:
      "Turn home-row movement into words while keeping your fingers close to their starting keys.",
    tip: "Read the whole word first; let each finger return home after its reach.",
    targetKeys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", " "],
    finger: "All home-row fingers and either thumb",
    drill: "ask sad fall flask lad all dad salad falls asks lads",
    transfer: "a sad lad asks dad",
    review: "Repeat the words once slowly, then once with an even rhythm.",
    goalAccuracy: 92,
  },

  {
    id: "left-reach",
    stage: "Top-row reaches",
    title: "Q and W",
    description: "Reach from A and S to Q and W, then return to the home row.",
    tip: "Left pinky reaches Q from A; left ring reaches W from S.",
    targetKeys: ["q", "w"],
    finger: "Left pinky Q · left ring W",
    drill: "aq sw qa ws aq sw q w",
    transfer: "a saw",
    goalAccuracy: 90,
  },
  {
    id: "top-row-ert",
    stage: "Top-row reaches",
    title: "E, R and T",
    description: "Add E, R, and T with small reaches from the left home row.",
    tip: "Left middle reaches E; left index reaches R and T. Return after every key.",
    targetKeys: ["e", "r", "t"],
    finger: "Left middle E · index R and T",
    drill: "de fr ft er tr re te",
    transfer: "we were free",
    goalAccuracy: 91,
  },
  {
    id: "top-row-index-return",
    stage: "Top-row reaches",
    title: "Left Reach and Return",
    description: "Join Q through T while keeping the hand anchored and the reaches light.",
    tip: "Only the assigned finger leaves home; bring it back before the next reach.",
    targetKeys: ["q", "w", "e", "r", "t"],
    finger: "Left hand by finger zone",
    drill: "aq sw de fr ft qw er tw",
    transfer: "a tree grew tall",
    goalAccuracy: 92,
  },
  {
    id: "right-reach",
    stage: "Top-row reaches",
    title: "Y and U",
    description: "Reach to Y and U with the right index finger, then return to J.",
    tip: "Right index covers Y and U; keep the other fingers resting on home keys.",
    targetKeys: ["y", "u"],
    finger: "Right index Y and U",
    drill: "jy ku uj yj ju uy",
    transfer: "a jury",
    goalAccuracy: 91,
  },
  {
    id: "right-reach-iop",
    stage: "Top-row reaches",
    title: "I, O and P",
    description: "Add I, O, and P with controlled reaches across the right side of the top row.",
    tip: "Right middle reaches I, ring reaches O, and pinky reaches P.",
    targetKeys: ["i", "o", "p"],
    finger: "Right middle I · ring O · pinky P",
    drill: "ki lo ;p io op pi",
    transfer: "oil your pipe it is quite poor",
    goalAccuracy: 91,
  },
  {
    id: "top-row-words",
    stage: "Top-row reaches",
    title: "Top-Row Words and Phrases",
    description: "Use the complete top row in familiar words while returning to home position.",
    tip: "Read one word ahead and avoid sliding your hand across the keyboard.",
    targetKeys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    finger: "All fingers reach to the top row",
    drill: "type write power tower quiet route pretty equip",
    transfer: "write a quiet word",
    goalAccuracy: 92,
  },
  {
    id: "top-row-review",
    stage: "Top-row reaches",
    title: "Mixed Reach Checkpoint",
    description: "Review both top-row groups and check that each reach returns to its home key.",
    tip: "Pause after a difficult reach, reset your fingers, and continue without rushing.",
    targetKeys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    finger: "All fingers reach to the top row",
    drill: "we were quite ready to write your type",
    transfer: "the quiet writer will type a proper word",
    review: "Repeat any pair that felt awkward before moving on.",
    goalAccuracy: 92,
  },

  {
    id: "lower-row",
    stage: "Bottom-row reaches",
    title: "Z and X",
    description: "Curl the left pinky and ring fingers down to Z and X, then return to A and S.",
    tip: "Move from the knuckle with a small curl; keep your wrist relaxed.",
    targetKeys: ["z", "x"],
    finger: "Left pinky Z · left ring X",
    drill: "az sx za xs zx xz",
    transfer: "a fox",
    goalAccuracy: 90,
  },
  {
    id: "lower-cvb",
    stage: "Bottom-row reaches",
    title: "C, V and B",
    description: "Add C, V, and B with the left middle and index fingers.",
    tip: "Left middle types C; left index reaches V and B.",
    targetKeys: ["c", "v", "b"],
    finger: "Left middle C · index V and B",
    drill: "dc fv fb cv vb bc",
    transfer: "a brave voice",
    goalAccuracy: 91,
  },
  {
    id: "lower-nm",
    stage: "Bottom-row reaches",
    title: "N and M",
    description: "Reach down from the right index and middle fingers to N and M.",
    tip: "Right index covers N; right middle covers M. Return to J and K.",
    targetKeys: ["n", "m"],
    finger: "Right index N · middle M",
    drill: "jn km mn nm jn km",
    transfer: "many men make a new name",
    goalAccuracy: 91,
  },
  {
    id: "reach-return",
    stage: "Bottom-row reaches",
    title: "Reach and Return",
    description: "Combine bottom-row keys with home-row anchors and return after each reach.",
    tip: "Keep the unused fingers near home; move the fingertip, not the whole hand.",
    targetKeys: ["z", "x", "c", "v", "b", "n", "m"],
    finger: "All fingers by bottom-row zone",
    drill: "az sx dc fv fb jn km",
    transfer: "move a brave hand back to home",
    goalAccuracy: 92,
  },
  {
    id: "bottom-patterns",
    stage: "Bottom-row reaches",
    title: "Bottom-Row Patterns",
    description: "Practise useful letter combinations without losing control on the lower row.",
    tip: "Separate a tricky pattern, then join it smoothly to the next one.",
    targetKeys: ["z", "x", "c", "v", "b", "n", "m"],
    finger: "All fingers by bottom-row zone",
    drill: "mix max box van can cab ban name",
    transfer: "a calm voice can move a brave mind",
    goalAccuracy: 92,
  },
  {
    id: "lower-row-words",
    stage: "Bottom-row reaches",
    title: "Bottom-Row Words and Phrases",
    description: "Use lower-row letters in complete words and a short applied sentence.",
    tip: "Aim for light, accurate reaches; speed will grow as paths become familiar.",
    targetKeys: ["z", "x", "c", "v", "b", "n", "m"],
    finger: "All fingers by bottom-row zone",
    drill: "can van mix zone brave number climb",
    transfer: "a brave beginner can combine new words",
    goalAccuracy: 92,
  },
  {
    id: "bottom-row-review",
    stage: "Bottom-row reaches",
    title: "Bottom-Row Review Checkpoint",
    description: "Mix all lower-row keys with familiar letters and check your return paths.",
    tip: "If a key feels uncertain, slow down and rehearse the reach from its home finger.",
    targetKeys: ["z", "x", "c", "v", "b", "n", "m"],
    finger: "All fingers by bottom-row zone",
    drill: "the brave fox can climb a new hill",
    transfer: "write a sentence about a calm brave learner",
    review: "Repeat the letter pair that needed the most attention.",
    goalAccuracy: 93,
  },

  {
    id: "all-letters",
    stage: "Full alphabet and patterns",
    title: "All Letters",
    description: "Combine all three letter rows and keep your eyes on the text.",
    tip: "If you feel lost, return to F and J by touch and continue calmly.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "the quick brown fox jumps over the lazy dog",
    transfer: "pack my box with five dozen liquor jugs",
    goalAccuracy: 93,
  },
  {
    id: "word-building",
    stage: "Full alphabet and patterns",
    title: "Common Words",
    description: "Build fluency with familiar words that appear often in everyday writing.",
    tip: "Let common words flow as a small movement pattern instead of separate hunts.",
    targetKeys: ["t", "h", "e", "r", "o", "n"],
    finger: "Mixed",
    drill: "the other there another then these those their",
    transfer: "people learn when they practice a little each day",
    goalAccuracy: 93,
  },
  {
    id: "words-to-phrases",
    stage: "Full alphabet and patterns",
    title: "Words into Phrases",
    description: "Connect familiar words with spaces to make short, meaningful phrases.",
    tip: "Use either thumb for Space and keep your hands balanced over the home row.",
    targetKeys: ["all", " "],
    finger: "All fingers · either thumb for Space",
    drill: "learn a little every day",
    transfer: "a steady hand builds a useful skill",
    goalAccuracy: 93,
  },
  {
    id: "frequent-pairs",
    stage: "Full alphabet and patterns",
    title: "Frequent Letter Pairs",
    description: "Smooth out common two-letter transitions used in many words.",
    tip: "Look at the next pair as a unit while keeping the fingers relaxed.",
    targetKeys: ["t", "h", "e", "r", "i", "n"],
    finger: "Mixed",
    drill: "th he in er an re on at",
    transfer: "there is another reason to remain patient",
    goalAccuracy: 93,
  },
  {
    id: "three-letter-patterns",
    stage: "Full alphabet and patterns",
    title: "Three-Letter Patterns",
    description: "Join common three-letter groups into longer, familiar words.",
    tip: "Type each group evenly, then connect it to the next without a pause.",
    targetKeys: ["t", "h", "r", "s", "i", "n"],
    finger: "Mixed",
    drill: "the ing and ion ent her",
    transfer: "thinking clearly helps a learner find the right rhythm",
    goalAccuracy: 94,
  },
  {
    id: "same-alternating-patterns",
    stage: "Full alphabet and patterns",
    title: "Same-Hand and Alternating Patterns",
    description: "Notice when a word repeats one hand or moves between hands.",
    tip: "Keep same-hand sequences light and let alternating hands share the work.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "minimum people level rhythm",
    transfer: "a careful typist lets both hands work together",
    goalAccuracy: 94,
  },
  {
    id: "tricky-patterns",
    stage: "Full alphabet and patterns",
    title: "Tricky Words",
    description:
      "Break down words with less familiar transitions, then rebuild them at a steady pace.",
    tip: "Repeat a stumble slowly three times before joining it to a full word.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "right tight sight great through thought",
    transfer: "strength grows through thoughtful steady practice",
    goalAccuracy: 94,
  },
  {
    id: "mixed-alphabet-review",
    stage: "Full alphabet and patterns",
    title: "Alphabet and Pattern Review",
    description: "Review the full alphabet, frequent patterns, and short phrases together.",
    tip: "Accuracy first: pause briefly to reset instead of guessing at a key.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "the quick learner finds a better rhythm",
    transfer: "a good habit grows when clear words feel natural",
    review: "Choose one pattern to repeat slowly, then type the sentence once more.",
    goalAccuracy: 94,
  },

  {
    id: "capital-letters",
    stage: "Capitals and punctuation",
    title: "Opposite-Hand Shift",
    description: "Type a capital by holding Shift with the hand opposite the letter being typed.",
    tip: "Use the opposite-hand Shift: for a left-hand letter, press right Shift; for a right-hand letter, press left Shift.",
    targetKeys: ["shift", "all"],
    finger: "Opposite pinky presses Shift; other hand types the letter",
    drill: "Aa Ss Dd Ff Jj Kk Ll",
    transfer: "A Calm Hand Can Type Well",
    goalAccuracy: 92,
  },
  {
    id: "capitals-across-keyboard",
    stage: "Capitals and punctuation",
    title: "Capitals Across the Keyboard",
    description:
      "Coordinate opposite-hand Shift for capital letters from both sides of the keyboard.",
    tip: "Keep the Shift pinky down only while the other hand types the capital.",
    targetKeys: ["shift", "all"],
    finger: "Opposite pinky for Shift",
    drill: "Qw Er Ty Ui Op As Df Gh Jk Lz Xc Vb Nm",
    transfer: "Write A Short Note With Both Hands",
    goalAccuracy: 92,
  },
  {
    id: "names-sentence-starts",
    stage: "Capitals and punctuation",
    title: "Names and Sentence Starts",
    description: "Use capitals for names and the first word of a sentence.",
    tip: "Use the opposite-hand Shift rule for names on either side of the keyboard.",
    targetKeys: ["shift", "all"],
    finger: "Opposite pinky for Shift",
    drill: "Maya Ravi London Friday",
    transfer: "Maya and Ravi learn together",
    goalAccuracy: 93,
  },
  {
    id: "punctuation",
    stage: "Capitals and punctuation",
    title: "Periods, Commas and Spaces",
    description:
      "Finish a thought with a period, separate ideas with a comma, and add one space after punctuation.",
    tip: "The right ring finger reaches for period; the right middle finger reaches for comma. Use a thumb for Space.",
    targetKeys: [".", ",", " "],
    finger: "Right ring period · right middle comma · either thumb Space",
    drill: "one, two, three. one, two, three.",
    transfer: "A small step, taken each day, can build a lasting skill.",
    goalAccuracy: 93,
  },
  {
    id: "question-exclamation-apostrophe",
    stage: "Capitals and punctuation",
    title: "Questions, Exclamations and Apostrophes",
    description: "Add question marks, exclamation points, and apostrophes to expressive sentences.",
    tip: "On US QWERTY, ? and ! use Shift with their keys; apostrophe is typed with the right pinky.",
    targetKeys: ["?", "!", "'", "shift"],
    finger: "Right pinky for apostrophe and ? · Shift with opposite hand",
    drill: "is it ready? yes! it is",
    transfer: "Don't rush! Can you keep it steady?",
    goalAccuracy: 93,
  },
  {
    id: "quotation-colon-semicolon-hyphen",
    stage: "Capitals and punctuation",
    title: "Quotes, Colons, Semicolons and Hyphens",
    description:
      "Use quotation marks and mid-sentence punctuation with deliberate finger movement.",
    tip: "On US QWERTY, right pinky handles quotes, colon, semicolon, and hyphen; use left Shift for shifted right-hand keys.",
    targetKeys: ['"', ":", ";", "-", "shift"],
    finger: "Right pinky for these keys · left pinky Shift for shifted keys",
    drill: '; - ; - : "go"; "wait"',
    transfer: 'Maya said, "Take a well-timed break; then begin."',
    goalAccuracy: 93,
  },
  {
    id: "mixed-punctuation-sentences",
    stage: "Capitals and punctuation",
    title: "Mixed Punctuation Sentences",
    description: "Use capitals and familiar punctuation together in natural short sentences.",
    tip: "Use one space after sentence-ending punctuation, then reset your hands.",
    targetKeys: ["all", ".", ",", "?", "!", "'", '"', ":", ";", "-", "shift"],
    finger: "All fingers · opposite pinky for Shift",
    drill: "Ready, set; breathe. Is it steady? Yes!",
    transfer: '"It\'s a calm, well-paced lesson," Maya said.',
    goalAccuracy: 94,
  },
  {
    id: "punctuation-review",
    stage: "Capitals and punctuation",
    title: "Capitals and Punctuation Review",
    description: "Review capitals, spacing, and punctuation in complete sentences.",
    tip: "Let the opposite hand hold Shift while your typing hand reaches for a capital or symbol.",
    targetKeys: ["all", "shift"],
    finger: "All fingers · opposite pinky for Shift",
    drill: "Can a clear sentence stay calm? Yes, it can!",
    transfer: 'Ravi asked, "Can we pause, breathe, and begin again?"',
    review: "Repeat a punctuation sequence that felt unfamiliar at an easy pace.",
    goalAccuracy: 94,
  },

  {
    id: "numbers",
    stage: "Numbers and symbols",
    title: "Number Row 1–5",
    description: "Reach from the left hand to numbers 1 through 5, keeping the wrist relaxed.",
    tip: "On US QWERTY, 1–5 follow the left pinky, ring, middle, and index finger zones.",
    targetKeys: ["1", "2", "3", "4", "5"],
    finger: "Left pinky 1 · ring 2 · middle 3 · index 4 and 5",
    drill: "1 2 3 4 5 15 24 35",
    transfer: "Order 3 pens and 5 pads",
    goalAccuracy: 92,
  },
  {
    id: "number-row-right",
    stage: "Numbers and symbols",
    title: "Number Row 6–0",
    description: "Reach to numbers 6 through 0 with the right fingers and return to home position.",
    tip: "On US QWERTY, 6–0 follow the right index, middle, ring, and pinky zones.",
    targetKeys: ["6", "7", "8", "9", "0"],
    finger: "Right index 6 and 7 · middle 8 · ring 9 · pinky 0",
    drill: "6 7 8 9 0 67 89 90",
    transfer: "Room 8 has 9 chairs and 0 spare desks",
    goalAccuracy: 92,
  },
  {
    id: "mixed-numbers",
    stage: "Numbers and symbols",
    title: "Mixed Numbers",
    description: "Move across the number row while maintaining an even rhythm.",
    tip: "Read the whole number before typing; keep your hands relaxed between reaches.",
    targetKeys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    finger: "Number-row finger zones",
    drill: "12345 67890 2026 314159 8080",
    transfer: "A total of 42 learners joined 3 groups",
    goalAccuracy: 93,
  },
  {
    id: "numbers-in-context",
    stage: "Numbers and symbols",
    title: "Dates, Times, Decimals and Money",
    description: "Type everyday numbers in dates, times, decimal amounts, and prices.",
    tip: "On US QWERTY, slash and question mark share the right pinky key; use Shift for the question mark.",
    targetKeys: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "/", ".", ":"],
    finger: "Number-row zones · right pinky slash · right pinky colon with Shift",
    drill: "05/17 9:30 3.50 12.75",
    transfer: "The meeting is 05/17 at 9:30; lunch costs 12.75",
    goalAccuracy: 93,
  },
  {
    id: "symbols",
    stage: "Numbers and symbols",
    title: "Shift Symbols",
    description: "Reach for common symbols typed with Shift and the number row.",
    tip: "Hold the opposite pinky on Shift while the number-row finger types its symbol.",
    targetKeys: ["@", "#", "$", "%", "&", "*", "(", ")", "shift"],
    finger: "Opposite pinky Shift · number-row finger types symbol",
    drill: "@ # $ % & * ( )",
    transfer: "A 50% offer costs $8; use code #2",
    goalAccuracy: 91,
  },
  {
    id: "digital-formats",
    stage: "Numbers and symbols",
    title: "Emails, Web Addresses and Simple Code",
    description: "Use familiar letters, numbers, and symbols in practical digital text.",
    tip: "Type each segment deliberately; reset your hands after an @, slash, or underscore.",
    targetKeys: ["@", ".", "/", "_", "-", ":", "shift"],
    finger: "Mixed · opposite pinky Shift for shifted symbols",
    drill: "maya@example.com example.com",
    transfer: "https://example.com/course-part-1",
    goalAccuracy: 91,
  },

  {
    id: "messages-emails",
    stage: "Everyday writing",
    title: "Messages and Emails",
    description: "Type a short friendly message with a greeting, complete thought, and sign-off.",
    tip: "Pause at sentence boundaries and keep one space after punctuation.",
    targetKeys: ["all"],
    finger: "All fingers · either thumb for Space",
    drill: "Hi Maya, I hope your day is going well.",
    transfer: "Hello Ravi, I can join the study group at 4. See you soon, Maya.",
    goalAccuracy: 94,
  },
  {
    id: "study-work-paragraphs",
    stage: "Everyday writing",
    title: "Study and Workplace Paragraphs",
    description: "Maintain a steady pace across a useful paragraph about learning and work.",
    tip: "Keep your eyes a few words ahead and breathe naturally at commas and periods.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "A clear plan makes a busy day easier to manage.",
    transfer:
      "Good work begins with a clear plan. Break a large task into small steps, focus on one part, and take a short pause when you need it.",
    goalAccuracy: 94,
  },
  {
    id: "forms-addresses",
    stage: "Everyday writing",
    title: "Forms and Addresses",
    description:
      "Switch between names, addresses, numbers, and short form fields without losing your place.",
    tip: "Check each field before moving on; use the same finger zones for numbers and symbols every time.",
    targetKeys: ["all", "@", ".", "-"],
    finger: "All fingers · number-row zones",
    drill: "Maya Rao 18 Lake Road",
    transfer: "Name: Maya Rao; email: maya@example.com; address: 18 Lake Road.",
    goalAccuracy: 94,
  },
  {
    id: "practical-mixed-review",
    stage: "Everyday writing",
    title: "Practical Mixed-Text Review",
    description:
      "Apply letters, capitals, numbers, and punctuation in one realistic short passage.",
    tip: "Accuracy and comfort matter more than speed; reset your posture if tension appears.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "Plan, pause, and continue.",
    transfer:
      'On 12 May, Maya sent a clear note: "The first draft is ready. Please review it by 3:30."',
    review: "Notice one key or transition to practise again in a later session.",
    goalAccuracy: 94,
  },

  {
    id: "speed-builder",
    stage: "Advanced fluency",
    title: "Rhythm and Controlled Speed",
    description:
      "Build speed from a consistent, relaxed rhythm rather than rushing individual keys.",
    tip: "Increase pace only while your hands stay relaxed and your accuracy remains comfortable.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "Keep a calm rhythm; let the next word arrive in time.",
    transfer:
      "Fast typing grows from patient practice. Keep the rhythm even, look ahead, and let speed follow control.",
    goalAccuracy: 94,
  },
  {
    id: "accuracy-loop",
    stage: "Advanced fluency",
    title: "Personal Weak-Key Practice",
    description: "Use your saved practice history to notice weaker keys and review them with care.",
    tip: "Choose a weak key from your practice feedback; make small accurate repetitions before using it in words.",
    targetKeys: ["all"],
    finger: "Use the finger zone shown by the keyboard guide",
    drill: "Repeat a short word slowly, then type it in a phrase.",
    transfer: "Write a short paragraph using words that include a key you want to strengthen.",
    review:
      "If your history has no weak-key signal yet, choose any key that still feels uncertain.",
    goalAccuracy: 95,
  },
  {
    id: "endurance",
    stage: "Advanced fluency",
    title: "Longer Text and Endurance",
    description: "Keep comfortable posture and dependable accuracy through a longer passage.",
    tip: "Relax your shoulders every few lines; a brief reset helps preserve a smooth rhythm.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "Breathe evenly, sit comfortably, and keep your eyes on the next phrase.",
    transfer:
      "Consistent practice turns careful technique into a useful habit. Sit comfortably, keep your shoulders relaxed, and let your eyes move a few words ahead. When a mistake appears, stay calm, correct the pattern, and return your attention to the next phrase. A steady pace will carry you farther than a rushed start.",
    goalAccuracy: 94,
  },
  {
    id: "final-transfer-challenge",
    stage: "Advanced fluency",
    title: "Final Transfer Challenge and Reflection",
    description:
      "Bring the full course together in a realistic passage, then choose what you want to practise next.",
    tip: "Set a comfortable pace, use the technique that works for you, and treat the result as information—not a test you can fail.",
    targetKeys: ["all"],
    finger: "All fingers",
    drill: "What feels easier now than it did at the start?",
    transfer:
      "A new skill grows with practice. I can type a clear message, review a detail, and keep a calm rhythm. Progress is personal: I will notice what feels steady, choose one useful goal, and continue learning one step at a time.",
    review:
      "Reflect on one strength and one next step. There is no required WPM score to finish the course.",
    goalAccuracy: 94,
  },
];

function makeWarmup(keys: string[], drill: string): string {
  const printable = keys.filter((key) => key.length === 1 && key !== " ");
  if (!printable.length) return drill.split(/\s+/).slice(0, 5).join(" ");
  const pattern = printable.join("");
  return pattern + printable.slice().reverse().join("") + printable.join("");
}

function makeActivities(definition: LessonDefinition): LessonActivity[] {
  const keys = definition.targetKeys.filter((key) => key !== "all" && key !== "shift");
  const activities: LessonActivity[] = [
    {
      id: definition.id + "-warmup",
      kind: "warmup",
      instruction:
        "Get comfortable with the focus keys. Keep each movement light and return to home position.",
      text: makeWarmup(keys, definition.drill),
      focusKeys: keys,
    },
    {
      id: definition.id + "-drill",
      kind: "drill",
      instruction:
        "Practise the focused pattern at a steady pace. Accuracy and comfort come first.",
      text: definition.drill,
      focusKeys: keys,
    },
    {
      id: definition.id + "-transfer",
      kind: "transfer",
      instruction: "Apply the skill in useful words, a sentence, or a passage.",
      text: definition.transfer,
      focusKeys: keys,
    },
  ];
  if (definition.review) {
    activities.push({
      id: definition.id + "-review",
      kind: "review",
      instruction: definition.review,
      text: definition.drill + " " + definition.transfer,
      focusKeys: keys,
    });
  }
  return activities;
}

export const LESSONS: Lesson[] = definitions.map((definition, index) => ({
  ...definition,
  level: index + 1,
  activities: makeActivities(definition),
  demonstration:
    definition.tip + " Use the keyboard-and-hands guide to see the next key and finger zone.",
  success: `Finish each activity at your own pace. ${definition.goalAccuracy}% accuracy is a helpful guide, not a requirement; WPM is progress information.`,
}));
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
