# Route conventions

TypingGhost uses TanStack Start file-based routing. Route filenames in this folder define URLs; the generated `routeTree.gen.ts` file is maintained by the router plugin and must not be edited by hand.

| File | URL | Purpose |
| --- | --- | --- |
| `index.tsx` | `/` | Home and personal dashboard. |
| `learn.index.tsx` | `/learn` | Course overview and lesson selection. |
| `learn.$lessonId.tsx` | `/learn/:lessonId` | Individual lesson and activity results. |
| `practice.tsx` | `/practice` | Focused and adaptive practice. |
| `test.tsx` | `/test` | Untimed typing tests. |
| `games.tsx` | `/games` | Short skill games. |
| `challenges.tsx` | `/challenges` | Personal practice goals. |
| `progress.tsx` | `/progress` | Saved activity and skill trends. |
| `settings.tsx` | `/settings` | Appearance, sound, motion, and guidance settings. |
| `drills.tsx` | `/drills` | Compatibility redirect to `/practice`. |
| `index/index.tsx` | `/index` | Compatibility redirect to `/`. |
| `__root.tsx` | Application shell | Shared navigation, metadata, and error boundaries. |

Add a route in the shape required by TanStack Start, then let the development or build tooling regenerate the route tree. Do not create a separate `src/pages/` directory or hand-maintain route types.
