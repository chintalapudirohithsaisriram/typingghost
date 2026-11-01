import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import StatTile from "@/components/StatTile";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import {
  averageOf,
  coachMessage,
  levelFromXp,
  nextLesson,
  streakDays,
  weakestKeys,
} from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { LESSONS } from "@/lib/typing-content";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "TypingGhost — Learn Touch Typing, Free and Untimed",
      `Learn touch typing with ${LESSONS.length} guided lessons, unlimited practice, untimed typing tests, games and honest progress tracking. Free, no sign-up.`,
    ),
  component: HomePage,
});

const PATH = [
  {
    step: "Learn",
    body: `${LESSONS.length} guided lessons, from the home row to numbers and symbols.`,
    to: "/learn",
  },
  {
    step: "Practice",
    body: "Unlimited practice built from the keys you actually miss.",
    to: "/practice",
  },
  {
    step: "Test",
    body: "Untimed tests with net WPM, accuracy and a letter-by-letter review.",
    to: "/test",
  },
  {
    step: "Improve",
    body: "Trends, weak keys, streaks and coaching from your own history.",
    to: "/progress",
  },
] as const;

function HomePage() {
  const { profile, ready } = useProfile();
  const upcoming = nextLesson(profile);
  const hasHistory = ready && profile.sessions.length > 0;
  const recent = profile.sessions.slice(-12);
  const level = levelFromXp(profile.xp);
  const weak = weakestKeys(profile, 4);

  return (
    <div>
      <section className="hero-glow border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-medium text-primary">
            Free touch typing course · No account needed
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-7xl">
            Master Your Keyboard.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Learn the right finger for every key, practise what you miss, and measure real progress
            — at your own pace, with no time limits.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              {upcoming || !hasHistory ? (
                <Link to="/learn/$lessonId" params={{ lessonId: upcoming?.id ?? LESSONS[0]!.id }}>
                  {hasHistory && upcoming ? `Continue: ${upcoming?.title}` : "Start learning"}{" "}
                  <ArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <Link to="/practice">
                  Course complete — improve with Practice <ArrowRight aria-hidden="true" />
                </Link>
              )}
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/test">Take a typing test</Link>
            </Button>
          </div>
        </div>
      </section>

      {hasHistory ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-labelledby="dash">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="dash" className="font-display text-2xl font-bold">
              Welcome back
            </h2>
            <Link
              to="/progress"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Full progress
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile label="Best net WPM" value={profile.bestWpm} tone="primary" />
            <StatTile
              label="Recent accuracy"
              value={Math.round(averageOf(recent.map((s) => s.accuracy)))}
              unit="%"
            />
            <StatTile label="Day streak" value={streakDays(profile)} />
            <StatTile label="Level" value={level.level} hint={`${profile.xp} XP`} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-medium">Net WPM, recent sessions</h3>
              <Sparkline values={recent.map((s) => s.netWpm)} height={110} label="Recent net WPM" />
            </div>
            <div className="panel flex flex-col p-5">
              <h3 className="text-sm font-medium">Coach</h3>
              <p className="mt-2 text-sm text-muted-foreground">{coachMessage(profile)}</p>
              {weak.length ? (
                <Button asChild variant="outline" size="sm" className="mt-auto self-start">
                  <Link to="/practice">
                    Practise {weak.map((w) => w.key.toUpperCase()).join(" ")}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="path">
        <h2 id="path" className="font-display text-2xl font-bold">
          Learn → Practice → Test → Improve
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PATH.map((p, i) => (
            <li key={p.step}>
              <Link
                to={p.to}
                className="panel block h-full p-5 transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="text-sm text-muted-foreground">0{i + 1}</span>
                <span className="mt-2 block font-display text-lg font-semibold">{p.step}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{p.body}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            to="/games"
            className="rounded-2xl border border-border p-5 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="font-semibold">Games</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Short skill rounds with no clock.
            </span>
          </Link>
          <Link
            to="/challenges"
            className="rounded-2xl border border-border p-5 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="font-semibold">Challenges</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Daily, weekly and monthly goals.
            </span>
          </Link>
          <Link
            to="/settings"
            className="rounded-2xl border border-border p-5 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="font-semibold">Settings</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Themes, sound, hands guidance and font size.
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
