# TypeNova beginner learning and mistake-practice improvement plan

## Audit snapshot

### Preserve
- The existing TanStack Start app, all current public routes, the 20-lesson inventory, untimed typing engine, physical/mobile input handling, local profile/settings, results review, tests, games, challenges, progress charts, themes, reduced motion, and no-account model.
- The shared keyboard geometry and mapping (`KEY_LAYOUT`, `keyFor`, `FINGER_BY_KEY`, `SHIFT_MAP`, `shiftSideFor`) as the only source of truth for key/finger guidance.
- Real-data-only progress, bounded local persistence, generic user-safe error screens, and the rule that browser data is not authoritative for future protected features.

### Confirmed current state
- All main routes currently load at 1280, 768, and 390 pixels without page errors or horizontal page overflow. The expected missing-route request produces the only observed 404 console entry.
- Learn has 20 sequential lessons and an integrated passive keyboard/hands SVG. However, the course uses only four broad stages, lessons begin typing immediately, and passing currently requires both WPM and accuracy. That conflicts with the requested beginner-first mastery model.
- The mobile guide is technically contained but its full keyboard, labels, and hands become too small to teach from clearly. Its visible caption is inside an `aria-hidden` figure, so equivalent finger guidance is not currently announced.
- Practice exposes Adaptive, Weak keys, Mistake words, Accuracy, and Speed. “Mistake words” currently invents drills from aggregate weak letters; TypeNova does not store the actual target word or incorrect attempt.
- Input tracking records cumulative expected-key hits and misses. Backspace removes the visible character but deliberately does not erase that historical miss. There is no bounded word-mistake record, retry mastery, priority decay, dismissal, or mistake-only reset.
- Profile and settings are allowlist-normalized and size-bounded, but storage write/remove failures are silently ignored. Export/reset covers the profile, not a future mistake store unless it is included in the profile schema.
- Route titles and descriptions are present. `robots.txt` allows crawling. There is no sitemap, canonical origin, social image, or structured data; no production domain is available, so preview URLs must not be used as canonical URLs.
- No automated test files or test script currently exist.
- The roadmap is stale: it still lists already-completed removals and does not include the requested beginner course or real mistake-practice work.

## P0 — Learning data and typing correctness

1. **Add regression coverage before changing behavior**
   - Add a lightweight Vitest setup and focused tests for `src/lib/typing.ts`, `src/hooks/useTypingSession.ts`, `src/lib/profile.ts`, `src/lib/settings.ts`, and `src/lib/typing-content.ts`.
   - Cover physical input, `beforeinput`, IME commit-once behavior, Backspace, corrections, uppercase/Shift, punctuation, completion idempotency, active time, malformed/future-version storage, lesson ordering, and key/finger mappings.

2. **Model small, private mistake records**
   - Migrate the profile schema without losing valid v3 history. Add a bounded, normalized mistake collection containing only the target word, bounded incorrect attempt, relevant expected keys/fingers, occurrence count, successful retry streak, priority, and timestamps.
   - Never persist full passages, free-form arbitrary text, hidden input contents, or secrets. Cap record count, string lengths, characters, counters, and age; merge repeated target/attempt patterns rather than growing without limit.
   - Include mistakes in the existing profile export and full reset. Add separate dismiss and “reset mistake history” actions without erasing course progress.

3. **Capture corrected and uncorrected word mistakes accurately**
   - Extend the typing session with a position-aware attempt trace that can finalize a word at a delimiter or session end while preserving the current character stats API.
   - Record one word mistake when its attempt differed at any point, including a mistake later corrected with Backspace. Do not double-count duplicate browser/IME events or every intermediate Backspace state.
   - Preserve punctuation and capitalization in the target and attempt, while deriving key/finger guidance through the shared mapping.
   - Add tests for repeated errors, corrected words, delimiters, punctuation, capitals, Backspace, IME, early finish, reset, and completion exactly once.

4. **Make local saving observable and resilient**
   - Change the storage adapter to return explicit read/write/remove outcomes while keeping browser-only behavior.
   - Surface a calm, non-blocking “progress could not be saved on this device” status when storage is unavailable/full; keep the current session usable in memory.
   - Ensure reset/export and settings updates report failures honestly and never claim persistence succeeded when it did not.

## P0 — Beginner Learn course

5. **Restructure the existing 20 lessons into seven clear stages**
   - Reuse and reorder/refine the existing lessons into: Getting started, Home row, Reaches, Capitals and Shift, Numbers and punctuation, Words and patterns, Fluency and transfer.
   - Preserve stable lesson IDs where possible so existing completions migrate safely. Add structured lesson metadata for objective, new keys/fingers, prerequisite/review keys, demonstration, guided pattern, word/phrase practice, success criteria, and next action.
   - Add a short physical-keyboard setup lesson/step using neutral-wrist, relaxed-shoulder, keyboard-in-front guidance. Make clear that physical-keyboard practice is recommended while lessons remain browsable on touch devices.

6. **Build a staged lesson experience**
   - Before typing, show one concise objective, the new key/finger relationship, home-return instruction, and an explicit “Start practice” action.
   - Run each lesson through guided keys → short patterns → words/phrases → mixed review, recycling learned keys rather than isolating new ones.
   - Keep feedback calm and specific: expected key, correct finger, return-to-home cue, and opposite-hand Shift where needed. Avoid shame, countdowns, and speed pressure.
   - Replace WPM-gated completion with transparent completion plus accuracy mastery. WPM remains informational in later fluency work, not a blocker for beginner progression.
   - On results, offer Retry, extra targeted practice, and Next lesson. Only add a lesson to completed lessons after the mastery criteria are genuinely met.
   - Improve the course overview/sidebar so completed, current, available-next, and upcoming lessons are visually and semantically distinct.

## P0 — Real “Practice my mistakes”

7. **Generate drills from actual saved mistakes**
   - Replace the misleading current Mistake words behavior with a prominent “Practice my mistakes” path using recurring saved target words plus weak-key patterns and familiar learned words.
   - Rank by recurrence, recency, low success streak, and relevant weak keys. Keep generated drills short and varied; never fabricate history for a new learner.
   - During a mistake drill, show the correct word, the learner’s previous attempt, and the mapped key/finger to focus on, then require a clean retry before advancing.
   - Reduce priority after repeated correct retries; allow dismissing one pattern and resetting all mistake history.
   - Keep Adaptive, Weak keys, Accuracy, and Speed modes, but clarify their purpose and ensure recommendations come only from saved evidence. Empty history should offer Learn, baseline Test, or manual key selection.

## P1 — Accurate coordination guide and responsive teaching

8. **Refine one shared guidance model and visual**
   - Add a derived guidance helper that returns target key, finger, home key, return path, Shift key/opposite pinky, and concise accessible instruction from the existing mappings.
   - Validate every displayed US-QWERTY key, including letters, number row, shifted symbols, punctuation, Space, Enter, Tab, and Backspace. Label the supported layout accurately; do not imply alternate layouts.
   - Redesign the integrated SVG so hands align with key centers, the active reach and home-return path are obvious, labels stay unobscured, and color is reinforced by text, shape, and contact markers.
   - Respect both system and in-app reduced-motion settings. Motion should explain reach/return, not decorate.

9. **Make guidance legible at each width**
   - Desktop: retain the complete keyboard/hands teaching stage with precise alignment.
   - Tablet: simplify hand detail while preserving readable labels and the target path.
   - Mobile: use a focused, enlarged key neighborhood/current row plus a keyboard overview rather than shrinking the full desktop diagram to illegibility. Keep a visible physical-keyboard note.
   - Keep the passive visual pointer-transparent, non-focusable, and unable to type. Put an accessible live instruction outside the `aria-hidden` artwork.
   - Reuse the same passive guidance component in Learn, mistake Practice, and a short home-page demonstration so mappings and visuals cannot drift.

## P1 — Home and full-site UX

10. **Clarify the first visit**
    - Make “Start with Lesson 1” the primary beginner action and “Take a baseline test” the secondary action.
    - Add a short usable demonstration of the typing surface and coordinated finger guidance without writing fake progress.
    - Explain the real loop with concrete language: Learn a key → practise missed words/keys → test transfer → review device-local progress.
    - State plainly that TypeNova is free, needs no account, and saves progress only on this device. Avoid improvement-time promises.

11. **Review every existing section without removing useful work**
    - Home, Learn, Practice, Test/results, Progress/history, Challenges, Games, Settings, 404/error, loading, and empty states: align labels, next actions, responsive hierarchy, and beginner language.
    - Keep the calm warm-paper/soft-surface identity, but reduce unnecessary elevation and use stronger hierarchy around the typing task and guidance.
    - Remove stale `focus` mode values from profile/UI compatibility paths only after preserving old records through migration.
    - Keep tests untimed and results factual; ensure progress recommendations, challenges, XP, streaks, and badges remain derived only from completed local activity.

## P1 — Accessibility, security, SEO, and performance

12. **Accessibility completion**
    - Verify one main landmark, semantic heading order, labels/names, 44px primary touch targets, keyboard-only flows, visible focus, non-color status cues, screen-reader announcements, high font scale, and reduced motion.
    - Avoid `role="application"` unless testing proves it is necessary; use familiar controls and concise status announcements.

13. **Security and privacy hardening**
    - Keep allowlist validation and bounded normalization for all browser records and user inputs. Render typed/stored text as React text only; keep privacy-safe error reporting and generic user errors.
    - Sanitize the internal chart selector ID, verify no client-bundled secrets, rerun the dependency scan, and preserve the clean dependency override state.
    - Add platform-compatible response headers only after checking TanStack/workerd rules and browser-testing that CSP does not break the app. Treat local progress as user-modifiable presentation data, not trusted achievements or authorization.

14. **Accurate SEO work**
    - Keep unique metadata on every content route and improve beginner/search language where useful.
    - Review redirects, `robots.txt`, crawlable navigation, and add a conservative `WebApplication` structured-data description only if every claim is true.
    - Do not emit canonical URLs, sitemap URLs, or social-image URLs until a real published origin exists; never canonicalize to the temporary preview. Record this as a publish-time limitation rather than inventing a domain.

## Verification and delivery

15. **Automated gate**
    - Run unit/component tests, TypeScript checking, lint, production build, dependency/security scans, and searches for stale timer code, unsafe HTML, raw exception disclosure, obsolete Focus/tap-keyboard references, and unbounded stored input.

16. **Browser gate**
    - Test `/`, `/learn`, representative lessons from all seven stages, `/learn/numbers`, `/practice` including real/empty mistake history, `/test`, `/games`, `/challenges`, `/progress`, `/settings`, redirects, 404, and error recovery.
    - At 1280/768/390: verify no runtime/console errors or page overflow; physical typing, mobile input, IME, Backspace/correction, Shift/capitals, numbers, punctuation, Space, completion-once, persistence/reload, export/reset, storage-failure messaging, guide alignment, and passive-guide click safety.
    - Verify keyboard-only navigation, 130% text scale, reduced motion, dark/sand themes, and isolated Playwright state using role/label-based selectors.

17. **Closeout**
    - Update `roadmap.md` to mark genuinely completed work and leave only verified blockers/open follow-ups.
    - Report files changed, migrations, checks actually run, confirmed results, and limitations. Do not publish or deploy.

## Key implementation files

- Course/content: `src/lib/typing-content.ts`, `src/routes/learn.index.tsx`, `src/routes/learn.$lessonId.tsx`, `src/components/CourseSidebar.tsx`
- Typing/mistakes: `src/hooks/useTypingSession.ts`, `src/components/TypingSurface.tsx`, `src/lib/typing.ts`, new focused mistake/guidance helpers
- Persistence: `src/lib/profile.ts`, `src/lib/storage.ts`, `src/hooks/useProfile.ts`, `src/lib/settings.ts`
- Practice/guidance: `src/routes/practice.tsx`, `src/components/KeyboardHandsGuide.tsx`, `src/lib/keyboard-layout.ts`
- Site UX: `src/routes/index.tsx`, `src/routes/test.tsx`, `src/routes/progress.tsx`, `src/routes/challenges.tsx`, `src/routes/games.tsx`, `src/routes/settings.tsx`, `src/components/ResultsPanel.tsx`, `src/routes/__root.tsx`, `src/styles.css`
- SEO/security: `src/lib/seo.ts`, `src/server.ts`, `src/start.ts`, `public/robots.txt`
- QA/docs: new test files/config, `package.json`, `AGENTS.md`, `roadmap.md`