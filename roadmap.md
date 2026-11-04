# Roadmap

TypingGhost is an active, local-first typing coach. This roadmap separates the foundation already in place from work that is still open. Product purpose and current behavior are described in the [product overview](docs/product-overview.md).

## Foundation in place

- [x] Progressive 50-lesson course from keyboard setup through numbers, symbols, and everyday writing.
- [x] Integrated keyboard and hand guidance driven by shared keyboard geometry and finger mappings.
- [x] Learn, Practice, Test, Games, Challenges, Progress, and Settings routes.
- [x] Browser-local profile, settings, and session history with normalization and legacy migration.
- [x] Unit tests for course content, profile behavior, and keyboard mappings.

## Current focus

- [ ] Harden typing focus and input behavior across physical keyboards, mobile input, IME, Backspace, and route changes.
- [ ] Validate local profile and settings data, and communicate safe storage errors.
- [ ] Finish the audit of tap-keyboard visibility behavior and remove only obsolete paths.
- [ ] Audit remaining Focus-mode references in saved session data, navigation, and user-facing copy.

## Next improvements

- [ ] Remove raw WPM and consistency/steadiness measures where they do not help learners choose a next step.
- [ ] Improve Progress with clearer accuracy and net-WPM trends, diagnostics, and recent-session summaries.
- [ ] Apply the restrained surface system consistently across routes and shared controls.
- [ ] Harden dependencies, response headers, and browser-facing security settings.

## Release readiness

- [ ] Complete TypeScript, unit, lint, production-build, dependency, and security checks.
- [ ] Finish responsive, accessibility, interaction, and persistence review at mobile, tablet, and desktop widths.
- [ ] Verify a deployed build only after a release is requested.

See the [quality checklist](docs/quality-checklist.md) for the repeatable review path. Items stay open until their checks have actually passed.
