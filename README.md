<h1 align="center">TypingGhost</h1>

<p align="center">
  <strong>Build confident typing habits, one focused session at a time.</strong>
</p>

<p align="center">
  <a href="https://typingghost.lovable.app"><strong>Try TypingGhost ↗</strong></a>
  &nbsp;·&nbsp;
  <a href="roadmap.md">Roadmap</a>
  &nbsp;·&nbsp;
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

TypingGhost is a local-first typing coach for learning touch typing through guided lessons, focused practice, untimed tests, and short games. Its learning loop is simple: **learn a skill, practice what needs work, test your progress, and choose the next step.**

## What you can do

- **Learn:** build from foundational keys toward numbers and symbols with visual finger guidance.
- **Practice:** focus on weak keys and mistakes from earlier sessions.
- **Test:** review speed, accuracy, and character-level results without a countdown.
- **Play:** sharpen skills with Word Ladder, Clean Streak, and Key Hunt.
- **Track progress:** review practice history, key-level trends, streaks, milestones, and goals.
- **Make it yours:** adjust appearance, motion, sound, font size, and keyboard or hand guidance.

## Get started

You’ll need [Git](https://git-scm.com/) and [Bun](https://bun.sh/).

```sh
git clone https://github.com/chintalapudirohithsaisriram/typingghost.git
cd typingghost
bun install --frozen-lockfile
bun run dev
```

Open the local URL printed by the development server.

## Useful commands

| Command | What it does |
| --- | --- |
| `bun run dev` | Start the local development server. |
| `bun run lint` | Run ESLint. |
| `bun run build` | Create a production build. |
| `bun run preview` | Preview a build locally. |

A `test` script is not defined yet. Check the [roadmap](roadmap.md) for current quality and verification work.

## Built with

- React and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS 4 and Radix UI
- Bun

## Project structure

```text
src/
├── components/   Shared interface and typing components
├── hooks/        Reusable interaction and state hooks
├── lib/          Typing logic, lessons, settings, and browser storage
└── routes/       Learn, practice, tests, games, progress, and settings
public/           Static assets
docs/             Product and course notes
roadmap.md        Current priorities and unfinished work
```

## Your data

TypingGhost does not require an account. Settings and practice history are stored in your browser, so they are tied to that browser profile and may be lost if its data is cleared. Browser-stored scores are editable and intended for personal practice, not as verified competition results.

## Project status

TypingGhost is actively developed. Some interaction hardening and full quality assurance are still in progress; see the [roadmap](roadmap.md) for the current list.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). The `main` branch is connected to Lovable, so keep it in a working state and do not rewrite published Git history.

## License

The project code is licensed under the [MIT License](LICENSE). Third-party dependencies and assets remain under their respective licenses.
