# TypeNova: product audit and step-by-step build plan

Goal: Learn, Practice, Test, Improve. This plan fixes and extends the current app. It keeps the engine, content, saved progress and routing that already work.

## 1. How the app is built today (checked in the code)
- TanStack Start, with routes for `/`, `/learn`, `/learn/$lessonId`, `/test`, `/drills` and `/progress`. There is also a stray `src/routes/index/index.tsx`, which may claim `/` a second time.
- Engine: `useTypingSession` (keystroke capture, per-key hits and errors, 1-second WPM samples, optional `limitMs`) and `lib/typing.ts` (stats math).
- Content: `typing-content.ts` has 18 lessons, test passages grouped by difficulty, `TEST_DURATIONS` (15/30/60/120) and `buildDrill`.
- Data: `lib/profile.ts` stores progress in the browser (`typenova.profile.v2`): sessions, key stats, XP, streaks.
- UI: `TypingSurface` uses a hidden input. `VirtualKeyboard` is a display only (`aria-hidden`, spans, no number row, no Shift key, no hands). Theme: dark neon lime/cyan.

## 2. Highest-risk bugs
1. The test page forces a countdown (`limitMs: duration * 1000`, duration buttons). This breaks the "no time limit" rule.
2. The virtual keyboard has no number row or Shift key, so number and symbol lessons can't show which key comes next. It can't be tapped to type either.
3. There are 18 lessons; the brief asks for 20. Some exercises need a content check: Home Row, Reach & Return, Accuracy Loop, Numbers, Punctuation.
4. `buildDrill` filters keys with a letters/punctuation pattern. Drills built from passages could quietly lose content, and number requests aren't clearly handled.
5. The stray `routes/index/index.tsx` could cause a duplicate-route conflict. I'll confirm and remove it.
6. The engine blocks some keys (Tab/IME risk found in the earlier review). The mistake counter and per-key stats need an exactly-once check when you restart or change lessons.
7. The design doesn't match the brief: it's dark neon, but the brief asks for warm off-white, charcoal and olive.
8. Missing pages: Games, Challenges, Focus mode, Settings. "Drills" should become Practice.

## 3. UX inconsistencies
- Timed wording in tests and on the home page conflicts with unlimited typing.
- Learn: the lesson list sits on a separate page, not next to where you type.
- Results panels differ between pages. There is no letter-by-letter view of what you typed against what was expected.
- The home page must show only real history and no invented numbers.

## 4. What stays
The typing math, lesson text, saved progress format (with a migration), the per-key stats model, the `TypingSurface` hidden-input approach, the charts, and the export/reset controls on Progress.

## 5. Build phases
**Phase 0: stabilise.** Remove the duplicate route. Run the typecheck. Take a baseline Playwright snapshot of every route.

**Phase 1: engine and data.**
- Remove countdown mode from all pages. Time becomes a measured result only.
- Keep typed-vs-expected results for each character. Add raw WPM, net WPM, accuracy, real accuracy, error rate and consistency.
- Only the typing surface and real key buttons can produce characters. Anything that is only a picture can't type.
- Upgrade saved progress to v3: keep existing records and add mode, challenge progress and settings.
- Put storage behind one module so a real backend can replace it later.

**Phase 2: design system.** New warm light theme (off-white, charcoal, olive/lime) plus an optional dark theme. Calmer shadows, focus rings, reduced-motion support, and a font-size setting.

**Phase 3: Learn (top priority).**
- Grow the course to 20 lessons in stages. Rewrite weak exercises. Make the Numbers and Punctuation lessons actually use numbers and punctuation.
- Split layout: the course path on the left, the typing area on the right. Show title, level, objective, target, progress and a restart button.
- Full keyboard with a number row and Shift, and a hand/finger guide. The guide is a picture only and has no click handlers.
- Keys you can tap to type sit in a separate row of real buttons on mobile.
- The results screen shows pass or retry, the keys you missed, and a next-lesson button.

**Phase 4: Practice** (`/practice`, with `/drills` redirecting there). Modes: weak keys, mistakes, accuracy, speed, adaptive. No time limit and a full-width typing area. Passages stay as written. A "next practice" suggestion comes from your real errors.

**Phase 5: Test.**
- Modes: Passage, Words, Numbers, Punctuation, Custom letters.
- Custom letters stay letters-only.
- Passages rotate without repeating until you've seen them all.
- The results screen shows a letter-by-letter comparison (correct, wrong, not reached) and grouped stats.

**Phase 6: Games, Challenges, Focus, Settings.**
- 3 short games with no time pressure (e.g. word ladder, accuracy streak, key hunt).
- Daily, weekly and monthly challenges worked out from real sessions.
- `/focus`: a bare typing screen with nothing else on it.
- `/settings`: theme, sound, animations, font size.

**Phase 7: Progress and Home.**
- Progress: trends, history, strongest and weakest keys, error patterns, practice time, and XP, level, streak and badges earned from real data. Coaching text is based on your actual data.
- Home: "Master Your Keyboard." heading, a Start Learning button and a typing test button. Dashboard cards appear only once you have history.

**Phase 8: responsive design, accessibility and head metadata** for every route.

## 6. QA matrix
Checked with Playwright at 1280, 768 and 390 widths, plus unit tests for the stats math.

| Area | Checks |
|---|---|
| Routes | Every nav link loads with no console errors; unknown lesson shows 404; `/index` and `/drills` redirect |
| Engine | Typing on a real keyboard, Backspace, Shift characters, numbers, punctuation; stats match hand-worked answers; a result saves exactly once when you retry |
| Learn | All 20 lessons load; Numbers and Punctuation require those characters; clicking the hand guide or Shift picture types nothing; tapping real keys types; completion is saved |
| Practice | Each mode builds the right text; passages are not stripped to letters; no timer |
| Test | Each mode; custom letters stay letters-only; retrying brings a new passage; the letter-by-letter view is correct; no countdown text anywhere (search the code for time-limit wording) |
| Games / Challenges | Playable without a clock; challenge progress matches the saved data |
| Progress / Home | Empty state for new users; values update after a session; reset and export work |
| Settings / Focus | Theme, font size and reduced motion apply and are remembered after a reload |
| Accessibility | Tab through each page; focus is visible; labels exist; screen-reader announcement when you finish |
| Build | Typecheck clean; production build runs |

## Technical notes
- New routes: `practice.tsx`, `games.tsx`, `challenges.tsx`, `focus.tsx`, `settings.tsx`, plus a redirect from `drills`.
- `useTypingSession`: remove `limitMs`, expose the per-character results, and stop blocking Tab.
- `VirtualKeyboard` splits into `KeyboardGuide` (picture only, `aria-hidden`) and `TapKeyboard` (real `<button>`s).
- Storage adapter: `lib/storage.ts`, with `profile.ts` calling it.
