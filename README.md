# TypeNova

**A local-first typing coach for learning touch typing through structured lessons, focused practice, and measurable progress.**

TypeNova helps learners build accurate keyboard habits at their own pace. It combines guided lessons with practice based on missed keys, untimed typing tests, short skill games, and a personal progress dashboard.

## Project status

The application is published at [typingghost.lovable.app](https://typingghost.lovable.app) and remains in active development. The [project roadmap](roadmap.md) tracks unfinished work, including broader interaction and security hardening and full end-to-end quality assurance. A published build should not be read as evidence that every planned check is complete.

## What TypeNova includes

- **Guided learning:** lessons progress from foundational keys toward numbers and symbols, with visual finger guidance.
- **Focused practice:** exercises can emphasize keys and words that have been missed in earlier sessions.
- **Untimed typing tests:** review net words per minute, accuracy, and character-level results without a countdown.
- **Skill games:** Word Ladder, Clean Streak, and Key Hunt offer short, focused rounds.
- **Challenges and progress:** view practice history, key-level trends, streaks, milestones, and goals.
- **Personal settings:** adjust appearance, motion, sound, font size, and keyboard or hand guidance.

## Technology

- React and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS 4 and Radix UI primitives
- Bun for dependency installation and project scripts

## Run locally

You need GitHub access to clone this repository and [Bun](https://bun.sh/) installed.

```sh
git clone https://github.com/chintalapudirohithsaisriram/typingghost.git
cd typingghost
bun install --frozen-lockfile
bun run dev
```

Use the local URL printed by the development server. To create and preview a production build, run:

```sh
bun run build
bun run preview
```

## Project scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the local development server. |
| `bun run build` | Create a production build. |
| `bun run build:dev` | Create a development-mode build. |
| `bun run preview` | Preview a previously created build. |
| `bun run lint` | Run ESLint across the repository. |
| `bun run format` | Format repository files with Prettier. Review the diff because this script formats the project tree. |

The package currently does not define a `test` script. Although test-related packages are present, full test and end-to-end verification remain tracked in the roadmap.

## Repository map

```text
.
├── .lovable/                 Lovable project metadata
├── .gitignore                Files excluded from Git
├── .prettierignore           Files excluded from formatting
├── .prettierrc               Prettier settings
├── AGENTS.md                 Project and contributor guidance
├── CODE_OF_CONDUCT.md        Community behavior and reporting
├── CONTRIBUTING.md           Local setup and contribution workflow
├── LICENSE                   MIT license for this project
├── README.md                 Project overview and setup
├── bun.lock                  Locked dependency versions
├── bunfig.toml               Bun configuration
├── components.json           UI component configuration
├── eslint.config.js          ESLint configuration
├── package.json              Dependencies and scripts
├── public/                   Static public assets
├── roadmap.md                Planned work and project status
├── src/
│   ├── components/           Shared interface and typing components
│   ├── hooks/                Reusable React state and interaction hooks
│   ├── lib/                  Typing logic, content, settings, and storage
│   ├── routes/               File-based application pages
│   ├── routeTree.gen.ts      Generated TanStack route tree
│   ├── router.tsx            Router setup
│   ├── server.ts             TanStack Start server entry
│   ├── start.ts              TanStack Start application setup
│   └── styles.css            Global styles
├── tsconfig.json             TypeScript configuration
└── vite.config.ts            Vite and TanStack Start configuration
```

## Privacy and score integrity

TypeNova does not require an account. The current application saves personal settings and practice history in the browser's local storage. That data is specific to the browser profile and may be lost if browser data is cleared; it is also editable by the person using the browser.

Typing statistics are calculated for personal practice in the client. The current project does not provide a server-verified leaderboard or authoritative competitive scoring. Do not use local scores as proof of identity, skill, eligibility, or a competition result.

## Documentation and community

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a change.
- Follow the expectations in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Review [roadmap.md](roadmap.md) for planned work and known unfinished checks.
- This repository's project code is licensed under the [MIT License](LICENSE). Third-party dependencies and assets remain subject to their own licenses.

## Lovable project

This repository is connected to the [TypeNova project in Lovable](https://lovable.dev/projects/09fd5755-3c76-423a-9eaf-0018ddca3d54). Changes pushed to the connected `main` branch may sync back to the Lovable project. See [AGENTS.md](AGENTS.md) before changing published Git history.