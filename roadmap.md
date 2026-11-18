# Roadmap

## Shipped

- [x] Integrated keyboard-and-hands guide with exact finger-to-key coordination
- [x] Tap keyboard, Focus mode, raw WPM and consistency removed
- [x] Progress trajectories, diagnostics and recent net-WPM sessions
- [x] TypingGhost branding everywhere (old saved progress still migrates)
- [x] 50-lesson course with E/I/R/U-first top-row order; no lesson uses a key before it is taught
- [x] Post-lesson mistake drill; clean retypes retire saved mistakes
- [x] Practice "Mistake words" uses the learner's real mistyped words
- [x] Progress import (validated, bounded), also available on an empty device
- [x] Guide caption readable by screen readers; visual keyboard stays hidden and non-interactive

## Current focus: release readiness

- [ ] Add stable `test` and `typecheck` package scripts; keep the README commands aligned with `package.json`
- [ ] Add GitHub Actions checks for the frozen Bun install, tests, lint, typecheck, and production build
- [ ] Review the open manual browser smoke checklist pull request and keep its steps with the release notes
- [ ] Complete a real-phone typing check (requires a physical device)
- [ ] Publish and recheck the live site after explicit approval

## Release plan

### First public release

Cut a versioned GitHub Release (for example, `v0.1.0`) once the release-readiness checks above are complete. Include a concise summary of learner-facing changes, fixes, known limitations, and the live demo link. Keep browser-local progress and its device-specific behavior clear in the release notes.

### Release checklist

- [ ] Relevant tests, typecheck, lint, and production build pass on the release commit
- [ ] Browser smoke checklist is completed at desktop and narrow-screen sizes
- [ ] Review the change list and update release notes
- [ ] Tag the reviewed commit and publish its GitHub Release
- [ ] If the live site is being published or updated, obtain approval first and verify the deployed URL afterward

Use focused pull requests for changes. Do not rewrite published Git history; this repository is connected to Lovable and branch commits may sync back to the project.
