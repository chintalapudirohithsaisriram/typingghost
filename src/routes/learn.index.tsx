import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS, type Lesson } from "@/lib/typing-content";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Typing Course — 18 Guided Lessons | TypeNova" },
      {
        name: "description",
        content:
          "A complete touch typing course: home row, reaches, capitals, numbers, symbols and endurance. Each lesson has a speed and accuracy target.",
      },
      { property: "og:title", content: "Typing Course — 18 Guided Lessons" },
      {
        property: "og:description",
        content: "From the F and J anchors to numbers, symbols and endurance text.",
      },
    ],
  }),
  component: LearnIndex,
});

const STAGES: Lesson["stage"][] = ["Foundations", "Reaches", "Fluency", "Mastery"];

const STAGE_BLURB: Record<Lesson["stage"], string> = {
  Foundations: "Anchor your hands and learn the home row without looking.",
  Reaches: "Move off the home row and return cleanly every time.",
  Fluency: "Turn letters into words and words into rhythm.",
  Mastery: "Numbers, symbols, precision and endurance.",
};

function LearnIndex() {
  const { profile, ready } = useProfile();
  const done = new Set(profile.completedLessons);
  const completed = ready ? done.size : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">The typing course</h1>
        <p className="mt-3 text-muted-foreground">
          Work through the lessons in order. A lesson is passed when you hit both its speed and its
          accuracy target in one run — repeat it as often as you like, nothing is locked.
        </p>
      </header>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(completed / LESSONS.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {completed} of {LESSONS.length} passed
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {STAGES.map((stage) => (
          <section key={stage}>
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold">{stage}</h2>
              <p className="text-sm text-muted-foreground">{STAGE_BLURB[stage]}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {LESSONS.filter((lesson) => lesson.stage === stage).map((lesson) => {
                const passed = ready && done.has(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    to="/learn/$lessonId"
                    params={{ lessonId: lesson.id }}
                    className={cn(
                      "panel group flex flex-col p-5 transition-all hover:-translate-y-0.5",
                      passed && "border-primary/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        Lesson {String(lesson.level).padStart(2, "0")}
                      </span>
                      {passed ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                          Passed
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold group-hover:text-primary">
                      {lesson.title}
                    </h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{lesson.description}</p>
                    <p className="mt-4 font-mono text-xs text-muted-foreground">
                      Target {lesson.goalWpm} wpm · {lesson.goalAccuracy}% accuracy
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
