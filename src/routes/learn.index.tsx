import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, CircleDashed } from "lucide-react";
import CourseSidebar from "@/components/CourseSidebar";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { lessonStatus, nextLesson, weakestKeys } from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { COURSE_STAGES, LESSONS } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/")({
  head: () =>
    pageHead(
      `Typing Course — ${LESSONS.length} Guided Lessons | TypingGhost`,
      "A structured touch typing course from the home row to numbers, punctuation, symbols and endurance. Unlimited time, clear goals.",
    ),
  component: LearnIndex,
});

function LearnIndex() {
  const { profile, ready } = useProfile();
  const upcoming = nextLesson(profile);
  const started =
    ready &&
    (profile.completedLessons.length > 0 ||
      Object.keys(profile.lessonProgress).length > 0 ||
      profile.sessions.some((session) => session.mode === "lesson"));
  const weak = weakestKeys(profile, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <CourseSidebar
          completed={profile.completedLessons}
          inProgress={LESSONS.filter(
            (lesson) => lessonStatus(profile, lesson.id) === "in-progress",
          ).map((lesson) => lesson.id)}
          className="hidden self-start lg:sticky lg:top-24 lg:block"
        />
        <div>
          <p className="text-sm font-medium text-primary">Learn</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            The touch typing course
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {LESSONS.length} self-paced lessons in eight stages. Each lesson gives you an objective,
            a clear technique cue, focused practice, and useful text to apply the skill. Accuracy
            and speed are feedback; neither blocks your progress.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              {upcoming || !started ? (
                <Link to="/learn/$lessonId" params={{ lessonId: upcoming?.id ?? LESSONS[0]!.id }}>
                  {started ? `Continue: ${upcoming?.title}` : "Start lesson 1"}{" "}
                  <ArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <Link to="/practice">
                  Course complete — improve with Practice <ArrowRight aria-hidden="true" />
                </Link>
              )}
            </Button>
          </div>

          <div className="mt-10 space-y-10">
            {COURSE_STAGES.map(({ title: stage, description, lessonCount }) => (
              <section key={stage} aria-labelledby={`stage-${stage}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id={`stage-${stage}`} className="font-display text-xl font-semibold">
                    {stage}
                  </h2>
                  <span className="text-xs text-muted-foreground">{lessonCount} lessons</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {LESSONS.filter((l) => l.stage === stage).map((lesson) => {
                    const status = lessonStatus(profile, lesson.id);
                    const done = status === "completed";
                    return (
                      <li key={lesson.id}>
                        <Link
                          to="/learn/$lessonId"
                          params={{ lessonId: lesson.id }}
                          className="panel flex h-full gap-4 p-4 transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                              done
                                ? "border-primary bg-primary text-primary-foreground"
                                : status === "in-progress"
                                  ? "border-primary text-primary"
                                  : "border-border",
                            )}
                          >
                            {done ? (
                              <Check className="size-4" aria-label="completed" />
                            ) : status === "in-progress" ? (
                              <CircleDashed className="size-4" aria-label="in progress" />
                            ) : (
                              lesson.level
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium">{lesson.title}</span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                              {lesson.description}
                            </span>
                            <span className="mt-2 block text-xs text-muted-foreground">
                              {status === "completed"
                                ? "Completed"
                                : status === "in-progress"
                                  ? "In progress · resume saved activities"
                                  : "Not started"}
                              {" · Accuracy focus: " + lesson.goalAccuracy + "% (suggestion)"}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
          {weak.length > 0 ? (
            <aside className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h2 className="font-semibold">A useful review from your practice</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your recent typing suggests another look at{" "}
                {weak.map((item) => item.key.toUpperCase()).join(", ")}. Practice these keys
                whenever it helps; they do not hold up the course.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to="/practice">
                  Open Practice <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
