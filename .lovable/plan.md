# TypeNova: current state and remaining QA

## Current implementation
- Routes: `/`, `/learn`, `/learn/$lessonId`, `/practice`, `/test`, `/games`, `/challenges`, `/focus`, `/progress`, `/settings`; `/drills` and `/index` redirect.
- Engine: `useTypingSession` is unlimited (no `limitMs`); per-char review, raw/net WPM, accuracy, real accuracy, errors, error rate, consistency, active time.
- Content: 20 lessons (levels 1–20) incl. Number Row (`/learn/numbers`), Numbers in Context, Punctuation, Symbols; rotating test passages; letters-only custom generator.
- Keyboard: `VirtualKeyboard` is a picture only unless given `onKey` (then real buttons with number row, Shift, Backspace). `HandGuide` is picture-only.
- Data: profile v3 (v2 migrated) behind `lib/storage.ts`; settings stored separately. XP requires ≥20 chars, ≥5 s, ≥50% accuracy, capped at 150 per session.
- Course complete: `nextLesson` returns nothing after all 20; Home and Learn show "Course complete — improve with Practice".
- Look: warm off-white/charcoal/olive, optional sand/dark themes, reduced motion, font scale.

## Remaining work
- [ ] Rerun full browser QA suite at 1280/768/390 after the latest focus fixes
- [ ] Rerun lint and production build after the latest edits
- [ ] Test typing on a real phone
- [ ] The earlier page-matching error: couldn't reproduce this turn (all routes and header links came back clean at 3 widths); keep watching for it
