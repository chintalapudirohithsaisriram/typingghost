# TypeNova UX/UI and security rebuild plan

## Audit summary

### Confirmed product and UX findings
- The typing engine, 20-lesson curriculum, statistics, settings, and local progress are established and should be preserved.
- The lesson page currently renders `VirtualKeyboard` and `HandGuide` as separate sibling cards in `src/routes/learn.$lessonId.tsx`; their geometry is unrelated, so fingers cannot align with physical key columns.
- `HandGuide.tsx` uses fixed standalone SVG coordinates, while `VirtualKeyboard.tsx` independently renders the keyboard. Both read the same key/finger mapping, but do not share layout or Shift state.
- The passive keyboard is correctly non-interactive, while the tap keyboard uses real buttons. This safety boundary, plus physical typing, mobile `beforeinput`, IME handling, Backspace, and focus restoration, must remain intact.
- Guidance is duplicated beneath both existing guides. On mobile, the separate panels stack and lose the key-to-finger relationship.
- The visual system is token-based and already supports paper, sand, dark, reduced-motion, and font scaling. The current `panel` utility and key shadows are the primary redesign seams.
- Navigation and routes are complete, but surface treatments and control patterns vary across Home, Learn, Practice, Test, Games, Challenges, Focus, Progress, Settings, results, and empty/error states.

### Confirmed security findings
- Progress and settings are stored only in `localStorage`. This is suitable for private, device-local convenience data, but it is user-modifiable and must never be treated as authoritative for access, competition, rewards, or future server data.
- Profile loading handles invalid JSON, but runtime shape validation is incomplete; structurally malformed stored objects can still reach application logic.
- The lesson route displays `error.message` directly, unlike the generic root error screen. Internal error details should not be exposed to users.
- Client and server error reporting can transmit messages and stacks. Current code does not intentionally attach typed passages or progress, but a privacy-safe scrubber and explicit allowlist are advisable before features expand.
- Server error capture keeps the last error in shared module state for five seconds. This can associate the wrong stack with a concurrent request's log and should be replaced with request-scoped handling.
- CSRF middleware is present for server functions. There is currently no account system or protected backend, so broken access control is not presently applicable; future authentication must enforce authorization server-side.
- No application code was found evaluating user strings or rendering typed text as HTML. The shared chart utility uses `dangerouslySetInnerHTML` for internally supplied CSS variables, so it should remain restricted to trusted token values.
- A fresh dependency scan found two **high-severity CPU-exhaustion advisories** in transitive `js-yaml` through `@tanstack/react-start` 1.168.32. The persisted security scan is older and reported no findings, so the fresh lockfile result takes precedence for remediation planning.
- Google Fonts are loaded from third-party origins. Security headers for the actual application response could not be fully verified through the sign-in-protected preview; CSP, framing, permissions, and referrer behavior require deployment-level verification.

### Typing.com interaction principles to adopt
Typing.com keeps the keyboard and hands together, offers independent keyboard/hands visibility, animated-hands control, one-hand modes, and read-aloud/accessibility options. TypeNova will adopt the spatial teaching and user-control principles without copying proprietary artwork or assets. References: [keyboard settings](https://support.typing.com/en/articles/9048065), [accessibility settings](https://support.typing.com/en/articles/13785025), and [read aloud](https://support.typing.com/en/articles/13785921).

## Implementation priorities

### P0 — Input correctness, data safety, and the integrated teaching surface
1. **Protect and test the typing engine before visual work**
   - Add focused tests around `src/hooks/useTypingSession.ts`, `src/components/TypingSurface.tsx`, and `src/lib/typing.ts` for hydration/focus recovery, physical keys, touch `beforeinput`, composition/IME commit, Backspace, Enter, Shift/symbol input, duplicate-event prevention, completion idempotency, active-character scrolling, and reset/target changes.
   - Strengthen focus guards to recognize editable elements beyond native inputs, including `contenteditable` and textbox-like widgets, without weakening the typing-surface recovery behavior.
   - Preserve the hidden textarea as the sole physical/mobile input boundary and preserve the real-button path for tap typing.

2. **Create one keyboard-and-hands system**
   - Add `src/components/KeyboardHandsGuide.tsx` as the composed teaching surface.
   - Refactor `src/components/VirtualKeyboard.tsx` to expose stable key geometry and support two explicit modes: passive guide elements with no handlers, and real tap-key buttons.
   - Replace `src/components/HandGuide.tsx` with an integrated, pointer-transparent hand overlay driven by the same row/key geometry. Hands sit directly above/behind the keys; active fingers extend toward the target without covering labels.
   - Drive target key, active finger, required opposite-side Shift pinky, and space/thumb from one derived guidance model using `keyFor`, `FINGER_BY_KEY`, and `shiftSideFor` in `src/lib/typing-content.ts`.
   - Lift virtual Shift state into the composed component so highlighted Shift, active pinky, displayed shifted label, and emitted character remain synchronized.
   - Use one concise visual and screen-reader guidance status. Remove duplicate guide captions.
   - On mobile, scale the keyboard and hand geometry as one unit, simplify hand detail, retain target/finger/Shift meaning, and prevent horizontal overflow.

3. **Replace the lesson’s split layout**
   - Update `src/routes/learn.$lessonId.tsx` to render the integrated guide directly beneath the typing surface, never in a right-side hand card.
   - Preserve independent keyboard/hands settings. When tap mode is enabled, only key controls become interactive; the hand overlay remains `aria-hidden`, pointer-transparent, and unable to type.
   - Keep lesson progression, goals, current-key highlighting, completion, and saved results unchanged.

4. **Harden local data and visible errors**
   - Add schema-based validation and bounded normalization for profile/settings data in `src/lib/profile.ts`, `src/lib/settings.ts`, and `src/lib/storage.ts`; recover safely from malformed, oversized, or future-version records without destroying valid v3 history.
   - Replace lesson-level raw error messages with the generic user-safe error treatment.
   - Add request-scoped, privacy-safe error serialization in `src/lib/error-capture.ts`, `src/lib/lovable-error-reporting.ts`, `src/start.ts`, and `src/server.ts`; remove the shared last-error buffer and exclude typed text, stored progress, URLs with sensitive query data, and arbitrary object payloads.

### P1 — Refined soft-surface system and complete-site consistency
5. **Build the restrained soft-surface design tokens**
   - Rework `src/styles.css` with warm high-contrast surfaces, shallow paired light/dark elevation, inset pressed states, crisp borders, and explicit focus rings for paper, sand, and dark themes.
   - Add semantic elevation tokens for page, raised panel, inset field, key, pressed key, selected control, and overlay. Avoid stacking shadows on every container.
   - Keep Manrope/DM Sans/JetBrains Mono initially, but self-host or use system fallbacks if CSP hardening makes remote fonts undesirable.
   - Update `src/components/ui/button.tsx` and reused controls so tap targets, focus visibility, disabled states, and pressed/selected states are consistent.

6. **Apply the system route by route**
   - `src/routes/__root.tsx`: simplify the header hierarchy, strengthen active navigation, make mobile navigation intentional, and align generic 404/error states with the design system and shared buttons.
   - `src/routes/index.tsx`: clarify Learn → Practice → Test → Improve, preserve real-data-only home progress, and reduce unused vertical space without adding fabricated metrics.
   - `src/routes/learn.index.tsx`, `src/components/CourseSidebar.tsx`: make the 20-step path clearer, tactile, and scan-friendly while preserving progress semantics.
   - `src/routes/practice.tsx`, `src/routes/test.tsx`: unify mode selectors, typing controls, live status, and typing-stage spacing; retain intact passages and all existing modes.
   - `src/routes/games.tsx`, `src/routes/challenges.tsx`, `src/routes/focus.tsx`: apply the same surface hierarchy without making games childish or focus mode visually busy.
   - `src/routes/progress.tsx`, `src/components/StatTile.tsx`, `src/components/Sparkline.tsx`: improve dense-data scanning and mobile history presentation while showing only saved activity.
   - `src/routes/settings.tsx`: organize appearance, motion/sound, and keyboard/hands controls; preserve instant persistence.
   - `src/components/ResultsPanel.tsx`: clarify metric hierarchy and character review states for expected, typed, correct, wrong, and not reached.
   - Review all empty, loading, not-found, error, confirmation, and completion states for consistent hierarchy and actionable recovery.

7. **Accessibility and responsive completion**
   - Maintain one `<main>`, skip navigation, semantic headings, labels, live result announcements, and reduced motion.
   - Replace remaining raw application controls with shared accessible components where appropriate.
   - Verify 44px touch targets for primary mobile actions, no focus loss when guide controls are used, no color-only status, and high font-scale layouts without clipping.
   - Keep keyboard/hands visibility controls; add animated-hands control only if the final motion is genuinely instructional and fully disabled by reduced motion. Treat one-hand and read-aloud support as P2 extensions, not implied completed features.

### P1 — OWASP-oriented hardening
8. **Dependency and supply-chain remediation**
   - Resolve the two `js-yaml` advisories through a compatible TanStack upgrade or safe package override, regenerate the lockfile, then rerun dependency, type, lint, and production checks.
   - Preserve the existing package-age guard and avoid adding unnecessary UI or animation dependencies.

9. **Browser and deployment defenses**
   - Define and verify a CSP compatible with the application, preferably removing remote font dependencies first; include framing restrictions, permissions policy, referrer policy, MIME sniffing protection, and production HSTS where the platform owns HTTPS.
   - Ensure the standalone server error page remains CSP-compatible by removing inline event handlers/styles if strict CSP is applied.
   - Document in `AGENTS.md` that local progress is untrusted presentation data and that any future accounts, rankings, certificates, purchases, or shared challenges require authenticated server-side authorization and validation.

### P2 — Follow-up enhancements
10. **Teaching accessibility extensions**
   - Add optional read-aloud guidance using browser speech capabilities only after privacy, interruption, and reduced-motion/reduced-distraction behavior are tested.
   - Add explicit left-hand-only/right-hand-only teaching modes only with revised key mappings and dedicated curriculum QA.
   - Remove only confirmed dead route artifacts after route-generation checks; preserve `/drills` and `/index` redirects while compatibility is required.

## Verification plan

### Automated checks
- Typecheck, lint, production build, dependency scan, and security scan.
- Unit/component coverage for key mapping, Shift side, symbols, space/thumb, Backspace, IME/composition, duplicate event paths, completion-once behavior, stats, corrupt storage recovery, and settings migration.
- Search for raw error disclosure, unsafe HTML use, direct storage trust, external resources, inline handlers, and stale timer infrastructure.

### Browser checks
Run each relevant flow with console, page-error, and request monitoring:
- **390px mobile:** touch typing, tap keyboard, Backspace, Shift/symbols, space/thumb, integrated hand/key alignment, high font scale, open navigation, no overflow.
- **768px tablet:** lesson path, integrated guide proportions, mode selectors, results, settings, progress/history.
- **1280px desktop:** complete navigation and every route/state, full lesson stage, passive guide clicks never type, tap buttons type once, physical keys type once.
- **Keyboard only:** skip link, header, course path, lesson controls, mode selectors, settings, results actions, reset confirmations, visible focus, logical order.
- **Reduced motion:** system preference and explicit Off setting disable instructional movement and transitions without hiding guidance.
- **High font scale:** 130% setting across every route with no clipping, overlap, inaccessible controls, or horizontal page overflow.

### Regression scenarios
- Physical typing, mobile input, composition/IME, Backspace, Enter, uppercase, shifted symbols, space, target scrolling, restart, route changes, and completion saved exactly once.
- Passive keyboard, hands, fingers, and visual Shift never dispatch typing or become focusable; tap keyboard keys remain real labeled buttons.
- Active target key and finger stay synchronized through lowercase, uppercase, punctuation, number, symbol, and space lessons.
- Existing local progress/settings survive migration and reload; malformed storage falls back safely; no fake progress appears.
- Practice, Test, Games, Challenges, Focus, Progress, Home, Settings, results, empty states, 404, and recoverable error states all remain usable.

## Implementation order
1. Add regression tests around the current typing engine and storage.
2. Build the shared key geometry and integrated `KeyboardHandsGuide`.
3. Replace the lesson split layout and verify all physical/tap/guide behavior.
4. Introduce soft-surface tokens and shared control variants.
5. Restyle shared shell, then Learn, Practice/Test, Games/Challenges/Focus, Progress/Home/Settings, and result/error states.
6. Harden storage and error reporting, remediate dependencies, and add deployable security headers.
7. Run the complete responsive, accessibility, interaction, persistence, build, and security verification matrix; fix failures before release.
