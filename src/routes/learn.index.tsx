import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import CourseSidebar from "@/components/CourseSidebar";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { nextLesson } from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { LESSONS, type Lesson } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/")({
  head: () =>
    pageHead(
      `Typing Course — ${LESSONS.length} Guided Lessons | TypeNova`,
      "A structured touch typing course from the home row to numbers, punctuation, symbols and endurance. Unlimited time, clear goals.",
    ),
  component: LearnIndex,
});

const STAGES: Lesson["stage"][] = ["Foundations", "Reaches", "Fluency", "Mastery"];
const STAGE_BLURB: Record<Lesson["stage"], string> = {
  Foundations: "Anchor your hands and learn the home row without looking.",
  Reaches: "Leave the home row and return cleanly, one finger at a time.",
  Fluency: "Whole words, common patterns and capital letters.",
  Mastery: "Numbers, punctuation, symbols, accuracy and endurance.",
};

function LearnIndex() {
  const { profile, ready } = useProfile();
  const upcoming = nextLesson(profile);
  const started = ready && profile.completedLessons.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <CourseSidebar
          completed={profile.completedLessons}
          className="hidden self-start lg:sticky lg:top-24 lg:block"
        />
        <div>
          <p className="text-sm font-medium text-primary">Learn</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            The touch typing course
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {LESSONS.length} short lessons in four stages. Each one has a clear objective and a
            speed and accuracy goal. Take as long as you need — there is never a time limit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/learn/$lessonId" params={{ lessonId: upcoming?.id ?? LESSONS[0]!.id }}>
                {started ? `Continue: ${upcoming?.title}` : "Start lesson 1"}{" "}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 space-y-10">
            {STAGES.map((stage) => (
              <section key={stage} aria-labelledby={`stage-${stage}`}>
                <h2 id={`stage-${stage}`} className="font-display text-xl font-semibold">
                  {stage}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{STAGE_BLURB[stage]}</p>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {LESSONS.filter((l) => l.stage === stage).map((lesson) => {
                    const done = profile.completedLessons.includes(lesson.id);
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
                                : "border-border",
                            )}
                          >
                            {done ? <Check className="size-4" aria-label="passed" /> : lesson.level}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium">{lesson.title}</span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                              {lesson.description}
                            </span>
                            <span className="mt-2 block text-xs text-muted-foreground">
                              Goal {lesson.goalWpm} WPM · {lesson.goalAccuracy}% accuracy
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
        </div>
      </div>
    </div>
  );
}
