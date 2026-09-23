import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { LESSONS } from "@/lib/typing-content";
import {
  averageOf,
  coachMessage,
  levelFromXp,
  nextLesson,
  streakDays,
  weakestKeys,
} from "@/lib/profile";
import StatTile from "@/components/StatTile";
import Sparkline from "@/components/Sparkline";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TypeNova — Learn Touch Typing Free, Test Your Speed" },
      {
        name: "description",
        content:
          "Learn touch typing with 18 guided lessons, timed WPM tests, weak-key drills and progress tracking. Free, no sign-up.",
      },
      { property: "og:title", content: "TypeNova — Learn Touch Typing Free" },
      {
        property: "og:description",
        content: "18 guided lessons, timed tests, weak-key drills and saved progress.",
      },
    ],
  }),
  component: HomePage,
});

const FEATURES = [
  {
    title: "A real course",
    body: "18 lessons from the F and J anchors to numbers, symbols and endurance text. Each one has a speed and accuracy target you must clear to pass.",
    to: "/learn",
    cta: "Start Lesson 1",
  },
  {
    title: "Honest tests",
    body: "15, 30, 60 or 120 second tests at three difficulty levels. You get net WPM after error penalties, real accuracy and consistency — not flattering numbers.",
    to: "/test",
    cta: "Take a test",
  },
  {
    title: "Drills for your weak keys",
    body: "Every mistyped key is remembered. Drills are generated from the keys that actually slow you down instead of a generic word list.",
    to: "/drills",
    cta: "Open drills",
  },
  {
    title: "Progress you can read",
    body: "Speed and accuracy trends, per-key accuracy, daily streak and a full session history — stored on your own device.",
    to: "/progress",
    cta: "See progress",
  },
] as const;

function HomePage() {
  const { profile, ready } = useProfile();
  const level = levelFromXp(profile.xp);
  const upcoming = nextLesson(profile);
  const recent = profile.sessions.slice(-12);
  const hasHistory = ready && profile.sessions.length > 0;

  return (
    <div>
      <section className="hero-glow border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="mb-4 inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Free · No account needed
          </p>
          <h1 className="max-w-3xl font-display text-4xl leading-[1.05] font-bold sm:text-6xl">
            Learn to type without looking down.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            TypeNova teaches touch typing the way it actually sticks: correct finger paths first,
            then measured speed. Guided lessons, timed tests, drills built from your own mistakes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {upcoming ? (
              <Link
                to="/learn/$lessonId"
                params={{ lessonId: upcoming.id }}
                className="glow-ring rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                {hasHistory ? `Continue: ${upcoming.title}` : "Start the course"}
              </Link>
            ) : (
              <Link
                to="/learn"
                className="glow-ring rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Open the course
              </Link>
            )}
            <Link
              to="/test"
              className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface-2"
            >
              Test my speed
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Lessons" value={LESSONS.length} hint="Beginner to mastery" />
            <StatTile label="Best net WPM" value={ready ? profile.bestWpm : 0} tone="primary" />
            <StatTile
              label="Best accuracy"
              value={ready ? Math.round(profile.bestAccuracy) : 0}
              unit="%"
              tone="accent"
            />
            <StatTile label="Day streak" value={ready ? streakDays(profile) : 0} tone="warning" />
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Everything in one place</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Four practice modes that feed each other — lessons teach the movement, tests measure it,
          drills repair it, progress proves it.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="panel flex flex-col p-6">
              <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
              <Link
                to={feature.to}
                className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                {feature.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {hasHistory ? (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="panel p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">Your dashboard</h2>
                <p className="mt-1 text-sm text-muted-foreground">{coachMessage(profile)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Level {level.level}
                </p>
                <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.max(4, level.progress))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
              <div>
                <h3 className="mb-3 text-sm font-medium">Recent net WPM</h3>
                <Sparkline values={recent.map((session) => session.netWpm)} label="Recent speed" />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium">Weakest keys</h3>
                {weakestKeys(profile, 5).length ? (
                  <ul className="space-y-2">
                    {weakestKeys(profile, 5).map((item) => (
                      <li key={item.key} className="flex items-center justify-between text-sm">
                        <span className="rounded border border-border bg-surface-2 px-2 py-0.5 font-mono uppercase">
                          {item.key === " " ? "space" : item.key}
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(item.accuracy)}% accurate
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not enough data yet — finish a lesson or a test.
                  </p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  Average accuracy over your last sessions:{" "}
                  <span className="text-foreground">
                    {Math.round(averageOf(recent.map((session) => session.accuracy)))}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="panel p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">How to get fast</h2>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Fix your hands",
                body: "Index fingers on F and J, wrists floating, eyes on the screen. Never look down — glancing resets the muscle memory you are building.",
              },
              {
                step: "02",
                title: "Accuracy before speed",
                body: "Hold 95% or better. Every correction costs three keystrokes, so errors are far more expensive than a slower pace.",
              },
              {
                step: "03",
                title: "Short daily sessions",
                body: "Ten focused minutes a day beats an hour on Sunday. Finish one lesson, run one test, drill one weak key.",
              },
            ].map((item) => (
              <li key={item.step}>
                <span className="font-mono text-sm text-primary">{item.step}</span>
                <h3 className="mt-1 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
