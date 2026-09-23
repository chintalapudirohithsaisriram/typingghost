import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import ResultsPanel from "@/components/ResultsPanel";
import StatTile from "@/components/StatTile";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import { useProfile } from "@/hooks/useProfile";
import { useTypingSession } from "@/hooks/useTypingSession";
import { recordSession } from "@/lib/profile";
import { LESSONS, lessonById } from "@/lib/typing-content";
import type { TypingStats } from "@/lib/typing";

export const Route = createFileRoute("/learn/$lessonId")({
  loader: ({ params }) => {
    const lesson = lessonById(params.lessonId);
    if (!lesson) throw notFound();
    return { lessonId: lesson.id };
  },
  head: ({ loaderData }) => {
    const lesson = loaderData ? lessonById(loaderData.lessonId) : undefined;
    const title = lesson ? `${lesson.title} Typing Lesson | TypeNova` : "Typing Lesson | TypeNova";
    const description = lesson
      ? `${lesson.description} Practice ${lesson.targetKeys.join(", ")} with a ${lesson.goalWpm} WPM and ${lesson.goalAccuracy}% accuracy target.`
      : "Practice a guided TypeNova touch typing lesson with live accuracy and WPM feedback.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: LessonNotFound,
  component: LessonPage,
});

type CompletionResult = {
  stats: TypingStats;
  errors: Record<string, number>;
  passed: boolean;
};

function LessonNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="font-mono text-sm text-primary">LESSON.NOT_FOUND</p>
      <h1 className="mt-3 font-display text-3xl font-bold">That lesson is not in the course.</h1>
      <p className="mt-3 text-muted-foreground">Choose a lesson from the course map and continue from there.</p>
      <Button asChild className="mt-6">
        <Link to="/learn">Open course</Link>
      </Button>
    </div>
  );
}

function LessonPage() {
  const { lessonId } = Route.useLoaderData();
  const lesson = lessonById(lessonId);
  if (!lesson) throw notFound();

  const { profile, update } = useProfile();
  const [result, setResult] = useState<CompletionResult | null>(null);
  const lessonIndex = LESSONS.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessonIndex >= 0 ? LESSONS[lessonIndex + 1] : undefined;
  const previousLesson = lessonIndex > 0 ? LESSONS[lessonIndex - 1] : undefined;
  const passedBefore = profile.completedLessons.includes(lesson.id);

  const session = useTypingSession({
    target: lesson.exercise,
    onComplete: ({ stats, errors, hits }) => {
      const passed = stats.netWpm >= lesson.goalWpm && stats.realAccuracy >= lesson.goalAccuracy;
      setResult({ stats, errors, passed });
      update((current) =>
        recordSession(current, {
          mode: "lesson",
          label: `Lesson ${lesson.level}: ${lesson.title}`,
          stats,
          errors,
          hits,
          lessonId: lesson.id,
          passed,
        }),
      );
    },
  });

  const verdict = result
    ? {
        passed: result.passed,
        message: result.passed
          ? passedBefore
            ? "Strong repeat. This lesson was already passed, and the new run still counted toward your progress."
            : "Lesson passed. Your speed and accuracy both cleared the target."
          : `Not passed yet. Reach ${lesson.goalWpm} net WPM and ${lesson.goalAccuracy}% accuracy in the same run.`,
      }
    : undefined;

  const targetKeys = useMemo(
    () => lesson.targetKeys.filter((key) => key !== "all" && key !== "shift"),
    [lesson.targetKeys],
  );

  const restart = () => {
    setResult(null);
    session.reset();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/learn">
            <ArrowLeft aria-hidden="true" /> Course map
          </Link>
        </Button>
        <div className="flex gap-2">
          {previousLesson ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/learn/$lessonId" params={{ lessonId: previousLesson.id }}>
                Previous
              </Link>
            </Button>
          ) : null}
          {nextLesson ? (
            <Button asChild size="sm">
              <Link to="/learn/$lessonId" params={{ lessonId: nextLesson.id }}>
                Next <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <header className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
          <p className="font-mono text-sm text-primary">LESSON {String(lesson.level).padStart(2, "0")}</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">{lesson.title}</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{lesson.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Target WPM" value={lesson.goalWpm} tone="primary" />
          <StatTile label="Target accuracy" value={lesson.goalAccuracy} unit="%" tone="accent" />
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-4">
          <div className="panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Technique cue</p>
                <p className="mt-1 text-sm text-foreground">{lesson.tip}</p>
              </div>
              <Button onClick={restart} variant="outline" size="sm">
                <RotateCcw aria-hidden="true" /> Retry
              </Button>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2" aria-label="Lesson progress">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${session.progress}%` }} />
            </div>
          </div>

          <TypingSurface target={lesson.exercise} session={session} size="lg" />
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Finger path</p>
            <p className="mt-2 font-display text-xl font-semibold">{lesson.finger}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {lesson.targetKeys.map((key) => (
                <span key={key} className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-sm uppercase">
                  {key}
                </span>
              ))}
            </div>
          </div>
          <VirtualKeyboard nextChar={session.currentChar} highlightKeys={targetKeys} errorKeys={session.errors} />
        </aside>
      </section>

      {session.done ? (
        <section className="mt-8">
          <ResultsPanel
            title="Lesson result"
            stats={session.stats}
            samples={session.samples}
            errors={session.errors}
            {...(verdict ? { verdict } : {})}
            actions={
              <div className="flex flex-wrap gap-2">
                <Button onClick={restart} variant="outline" size="sm">
                  <RotateCcw aria-hidden="true" /> Try again
                </Button>
                {result?.passed && nextLesson ? (
                  <Button asChild size="sm">
                    <Link to="/learn/$lessonId" params={{ lessonId: nextLesson.id }}>
                      Next lesson <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            }
          />
        </section>
      ) : null}
    </div>
  );
}
