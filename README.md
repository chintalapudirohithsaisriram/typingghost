# TypingGhost

> A free, local-first touch-typing coach for everyday writing.

<p align="center">
  <a href="https://typingghost.lovable.app"><strong>Try the live app ↗</strong></a>
  &nbsp;·&nbsp;
  <a href="docs/README.md">Project documentation</a>
  &nbsp;·&nbsp;
  <a href="roadmap.md">Roadmap</a>
  &nbsp;·&nbsp;
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

TypingGhost helps people learn touch typing through a guided 50-lesson course, focused practice, untimed tests, and useful progress feedback. It is designed to make everyday writing—messages, study notes, work documents, and online forms—feel less stop-and-start as keyboard habits improve.

## Why it exists

When typing means hunting for keys, correcting repeated mistakes, or racing a timer, it can be hard to build a reliable technique. A speed score alone also gives little direction about what to practise next.

TypingGhost breaks the skill into small steps: learn a key and its finger, practise the keys or words that need work, take an untimed test, and use personal progress to choose a next step. There is no countdown and no account requirement.

## Who it is for

- Beginners learning where keys belong and which fingers to use.
- People returning to touch typing who want a calm way to rebuild consistency.
- Students and professionals who type messages, notes, assignments, reports, or forms every day.

TypingGhost supports practice; it does not promise a particular speed or replace a formal typing assessment.

## How it helps in daily use

| Everyday need | How TypingGhost supports it |
| --- | --- |
| Find keys without looking down | Progressive lessons introduce keys in manageable groups with visual finger guidance. |
| Stop repeating the same mistakes | Focused practice can target weak keys and previously missed words. |
| Type real-world text more comfortably | Later lessons include messages, study and work writing, forms, numbers, and punctuation. |
| Know what to practise next | Untimed results and saved progress show accuracy, net WPM, key trends, and course progress. |

## The learning loop

1. **Learn** with guided lessons that build from the home row to numbers and symbols.
2. **Practise** weak keys and words from previous sessions.
3. **Test** at your own pace, with a character-by-character review.
4. **Improve** by using saved progress to decide what to practise next.

Short games and optional challenges add variety without interrupting the lesson path.

## Try it online

[Open TypingGhost](https://typingghost.lovable.app). The app does not require an account. Settings and practice history stay in the current browser profile.

## Run it locally

You need [Git](https://git-scm.com/) and [Bun](https://bun.sh/).

```sh
git clone https://github.com/chintalapudirohithsaisriram/typingghost.git
cd typingghost
bun install --frozen-lockfile
bun run dev
```

Open the local URL printed by the development server.

### Project commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the local development server. |
| `bun run typecheck` | Check TypeScript without emitting files. |
| `bun run test` | Run the existing Vitest unit tests. |
| `bun run lint` | Run ESLint. |
| `bun run build` | Create a production build. |
| `bun run preview` | Preview a production build locally. |
| `bun run format` | Format repository files with Prettier; review the resulting diff. |

## Project structure

```text
.
├── docs/                    Product, architecture, quality, and course documentation
├── public/                  Static assets, sitemap, and crawler rules
├── src/
│   ├── components/ui/       Reusable interface primitives
│   ├── components/          Shared TypingGhost interface components
│   ├── hooks/               Typing, profile, and responsive hooks
│   ├── lib/                 Typing engine, course, progress, settings, and storage
│   ├── routes/              TanStack file-based pages and route notes
│   ├── routeTree.gen.ts     Generated route tree; do not edit by hand
│   ├── router.tsx           Router setup
│   ├── server.ts            Server entry and error handling
│   ├── start.ts             TanStack Start setup
│   └── styles.css           Global styles and design tokens
├── AGENTS.md                Project-specific engineering safeguards
├── CONTRIBUTING.md          Setup and contribution workflow
├── package.json             Project scripts and dependencies
└── roadmap.md               Priorities and release checks
```

For the route map and data flow, start with [the documentation index](docs/README.md).

## Data and privacy

TypingGhost does not require an account or send practice history to an app database. Settings and progress are stored in browser local storage, so they are limited to that browser profile and may be lost if its data is cleared. Browser data can be edited by the person using the device; scores are for personal feedback, not verified competition results.

## Project status

TypingGhost is actively developed. The repository includes unit tests, while full interaction, responsive, accessibility, security, and deployed checks remain in progress. See the [roadmap](roadmap.md) and [quality checklist](docs/quality-checklist.md) for the current state and repeatable review steps.

## Contributing and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. Project code is licensed under the [MIT License](LICENSE); dependencies and other third-party assets retain their own licenses.
