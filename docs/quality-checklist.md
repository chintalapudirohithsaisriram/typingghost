# Quality checklist

This checklist makes the local review steps repeatable. It does not mean every item has already passed; check the current [roadmap](../roadmap.md) for unfinished work.

## Automated checks

Run from the repository root after installing the locked dependencies:

```sh
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run lint
bun run build
```

To preview a successful production build locally:

```sh
bun run preview
```

The current automated test suite is unit-level coverage, not a complete browser or end-to-end suite.

## Manual smoke review

- [ ] Open the home page with a fresh browser profile; confirm it does not show fabricated progress.
- [ ] Start a lesson, type with physical keys, finish an activity, and confirm the result is understandable.
- [ ] Confirm Backspace, capitals, punctuation, numbers, and space behave as expected.
- [ ] Confirm passive keyboard and hand illustrations do not enter text; interactive typing controls type only once.
- [ ] Open Practice and Test, complete a sample session, and review the result.
- [ ] Reload the app and confirm saved progress appears in the same browser profile.
- [ ] Change a setting, navigate away, and confirm the preference remains applied.
- [ ] Check keyboard-only navigation, visible focus, labels, and reduced-motion behavior.
- [ ] Review the page at narrow mobile, tablet, and desktop widths for clipping and horizontal overflow.

## Before a public release

- [ ] Resolve current P0/P1 items in the roadmap.
- [ ] Review dependency and security findings.
- [ ] Complete the responsive, interaction, accessibility, and persistence checks.
- [ ] Verify the deployment after the user asks for a release.
