# Contributing to TypeNova

Thank you for helping improve TypeNova. Contributions should make typing practice clearer, more reliable, accessible, and respectful of learners' data.

## Before you begin

- For a substantial change, open an issue or discussion first so the scope and approach can be agreed.
- For a focused typo fix or similarly small correction, a pull request is welcome.
- Check the [roadmap](roadmap.md) for current priorities and incomplete work.
- Read the [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

Use Bun and a supported version of Git. You need GitHub access to clone the repository.

```sh
git clone https://github.com/chintalapudirohithsaisriram/typingghost.git
cd typingghost
bun install --frozen-lockfile
bun run dev
```

The development server prints the local URL when it starts.

## Branches and pull requests

Create a focused branch from the current `main` branch and open a pull request when the change is ready for review. The `main` branch is connected to Lovable, so commits pushed there may sync back to the project. Keep that branch in a working state and do not rewrite published history. Follow the safeguards in [AGENTS.md](AGENTS.md).

Use a short, descriptive branch name such as `fix/lesson-focus` or `docs/setup-guide`. Keep each pull request limited to one purpose. In the description, explain the reason for the change, its user impact, and any steps a reviewer should follow.

## Code and product guidelines

- Use the existing TypeScript, React, TanStack, and styling conventions.
- Prefer small, maintainable changes that preserve existing behavior.
- Keep typing input handling in the established typing interaction components. Passive keyboard and hand illustrations must not enter text.
- Keep keyboard layouts, finger guidance, and key mappings aligned with their shared source of truth.
- Respect keyboard users, visible focus, semantic markup, readable contrast, and reduced-motion preferences.
- Treat browser storage as user-editable. Never use client-stored progress as trusted evidence for a leaderboard, certificate, purchase, or other protected outcome.
- Do not commit credentials, tokens, private learner data, or personal information.
- Preserve third-party notices and follow the licenses for dependencies and assets.

## Checks before opening a pull request

Run the checks that apply to your change and include the results in the pull request description:

```sh
bun run lint
bun run build
```

There is currently no `test` script in `package.json`; the roadmap lists broader testing and quality assurance as unfinished. Do not describe unrun checks as passing. For interface changes, include screenshots or a concise manual verification note when possible.

## Pull request checklist

- [ ] The change has a clear purpose and stays within the proposed scope.
- [ ] User-facing behavior and documentation agree.
- [ ] Relevant lint and build checks were run, and their results are stated.
- [ ] Any remaining limitation or follow-up is described.
- [ ] Screenshots or manual steps are included for user-interface changes.
- [ ] No secrets, personal data, or unrelated generated changes are included.

## Reporting security concerns

Do not publish secrets, exploitable details, or personal information in a public issue. Contact the maintainer using the private contact option available on the [project owner's GitHub profile](https://github.com/chintalapudirohithsaisriram). If no private contact option is available, open an issue asking for a private reporting channel without including sensitive details.

## License

By contributing, you agree that your contributions to this project are offered under the [MIT License](LICENSE).