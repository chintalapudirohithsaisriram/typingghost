import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Keyboard, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import CourseSidebar from "@/components/CourseSidebar";
import KeyboardHandsGuide from "@/components/KeyboardHandsGuide";
import ResultsPanel from "@/components/ResultsPanel";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import { useProfile } from "@/hooks/useProfile";
import { useTypingSession, type TypingResult } from "@/hooks/useTypingSession";
import { recordSession } from "@/lib/profile";
import { pageHead } from "@/lib/seo";
import { useSettings, updateSettings } from "@/lib/settings";
import { round } from "@/lib/typing";
import { LESSONS, lessonById, type Lesson } from "@/lib/typing-content";

export const Route = createFileRoute("/learn/$lessonId")({
  loader: ({ params }) => {
    const lesson = lessonById(params.lessonId);
    if (!lesson) throw notFound();
    return { lessonId: lesson.id };
  },
  head: ({ loaderData }) => {
    const lesson = loaderData ? lessonById(loaderData.lessonId) : undefined;
    if (!lesson)
      return pageHead(
        "Lesson not found | TypeNova",
        "This lesson is not part of the TypeNova course.",
      );
    return pageHead(
      `Lesson ${lesson.level}: ${lesson.title} | TypeNova`,
      `${lesson.description} Goal: ${lesson.goalWpm} WPM at ${lesson.goalAccuracy}% accuracy, with no time limit.`,
    );
  },
  notFoundComponent: LessonNotFound,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold">This lesson could not load.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong while opening this lesson. Return to the course and try again.
      </p>
      <Button asChild className="mt-6">
        <Link to="/learn">Open the course</Link>
      </Button>
    </div>
  ),
  component: LessonPage,
});

function LessonNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">That lesson isn't in the course.</h1>
      <p className="mt-3 text-muted-foreground">Pick a lesson from the course path.</p>
      <Button asChild className="mt-6">
        <Link to="/learn">Open the course</Link>
      </Button>
    </div>
  );
}

function LessonPage() {
  const { lessonId } = Route.useLoaderData();
  const lesson = lessonById(lessonId);
  if (!lesson) return <LessonNotFound />;
  return <LessonExperience key={lesson.id} lesson={lesson} />;
}

function LessonExperience({ lesson }: { lesson: Lesson }) {
  const { profile, update } = useProfile();
  const settings = useSettings();
  const [result, setResult] = useState<(TypingResult & { passed: boolean }) | null>(null);
  const [tapKeys, setTapKeys] = useState(false);
  const index = LESSONS.findIndex((item) => item.id === lesson.id);
  const next = LESSONS[index + 1];
  const previous = index > 0 ? LESSONS[index - 1] : undefined;
  const passedBefore = profile.completedLessons.includes(lesson.id);

  const session = useTypingSession({
    target: lesson.exercise,
    onComplete: (run) => {
      const passed =
        run.stats.netWpm >= lesson.goalWpm && run.stats.realAccuracy >= lesson.goalAccuracy;
      setResult({ ...run, passed });
      update((current) =>
        recordSession(current, {
          mode: "lesson",
          label: `Lesson ${lesson.level}: ${lesson.title}`,
          stats: run.stats,
          errors: run.errors,
          hits: run.hits,
          lessonId: lesson.id,
          passed,
        }),
      );
    },
  });

  const targetKeys = useMemo(
    () => lesson.targetKeys.filter((k) => k !== "all" && k !== "shift"),
    [lesson.targetKeys],
  );
  const restart = () => {
    setResult(null);
    session.reset();
  };

  const verdict = result
    ? {
        passed: result.passed,
        message: result.passed
          ? passedBefore
            ? "Another clean pass — this run was added to your progress."
            : "Both goals cleared. The next lesson is ready."
          : [
              result.stats.realAccuracy < lesson.goalAccuracy
                ? `Accuracy was ${round(result.stats.realAccuracy, 1)}% (goal ${lesson.goalAccuracy}%). Slow down slightly and aim for clean keystrokes.`
                : null,
              result.stats.netWpm < lesson.goalWpm
                ? `Speed was ${round(result.stats.netWpm)} WPM (goal ${lesson.goalWpm}). Keep a steady rhythm; speed builds with repetition.`
                : null,
            ]
              .filter(Boolean)
              .join(" "),
      }
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <CourseSidebar
          completed={profile.completedLessons}
          currentId={lesson.id}
          className="hidden max-h-[calc(100dvh-7rem)] self-start overflow-y-auto lg:sticky lg:top-24 lg:block"
        />

        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm" className="lg:hidden">
              <Link to="/learn">
                <ArrowLeft aria-hidden="true" /> Course path
              </Link>
            </Button>
            <div className="ml-auto flex gap-2">
              {previous ? (
                <Button asChild variant="outline" size="sm">
                  <Link to="/learn/$lessonId" params={{ lessonId: previous.id }}>
                    <ArrowLeft aria-hidden="true" /> Previous
                  </Link>
                </Button>
              ) : null}
              {next ? (
                <Button asChild variant="outline" size="sm">
                  <Link to="/learn/$lessonId" params={{ lessonId: next.id }}>
                    Next <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <header className="border-b border-border pb-5 sm:pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">
                  Lesson {lesson.level} of {LESSONS.length} · {lesson.stage}
                  {passedBefore ? " · Passed" : ""}
                </p>
                <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {lesson.title}
                </h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  <span className="font-medium text-foreground">Objective: </span>
                  {lesson.description}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-secondary px-4 py-2">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Goal speed
                  </dt>
                  <dd className="font-display text-xl font-bold">
                    {lesson.goalWpm} <span className="text-xs font-normal">WPM</span>
                  </dd>
                </div>
                <div className="rounded-xl bg-secondary px-4 py-2">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Goal accuracy
                  </dt>
                  <dd className="font-display text-xl font-bold">{lesson.goalAccuracy}%</dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Keys:</span>
              {lesson.targetKeys.map((key) => (
                <kbd
                  key={key}
                  className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs"
                >
                  {key === "all" ? "all keys" : key}
                </kbd>
              ))}
              <span className="ml-auto text-muted-foreground">Tip: {lesson.tip}</span>
            </div>
          </header>

          {!session.done ? (
            <>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div
                  className="h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-label="Lesson progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(session.progress)}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${session.progress}%` }}
                  />
                </div>
                <span className="tabular-nums text-muted-foreground" aria-live="off">
                  {round(session.stats.netWpm)} WPM ·{" "}
                  {session.value ? round(session.stats.realAccuracy) : 100}% accuracy
                </span>
                <Button onClick={restart} variant="outline" size="sm">
                  <RotateCcw aria-hidden="true" /> Restart
                </Button>
              </div>

              <TypingSurface target={lesson.exercise} session={session} size="lg" />

              {settings.showKeyboard ? (
                <KeyboardHandsGuide
                  nextChar={session.currentChar}
                  highlightKeys={targetKeys}
                  errorKeys={session.errors}
                  showHands={settings.showHands}
                />
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  aria-pressed={tapKeys}
                  onClick={() => setTapKeys((v) => !v)}
                >
                  <Keyboard aria-hidden="true" /> {tapKeys ? "Hide" : "Show"} tap keyboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={settings.showKeyboard}
                  onClick={() => updateSettings({ showKeyboard: !settings.showKeyboard })}
                >
                  {settings.showKeyboard ? "Hide" : "Show"} keyboard + hands
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!settings.showKeyboard}
                  aria-pressed={settings.showHands}
                  onClick={() => updateSettings({ showHands: !settings.showHands })}
                >
                  {settings.showHands ? "Hide" : "Show"} hands
                </Button>
              </div>
              {tapKeys ? (
                <VirtualKeyboard nextChar={session.currentChar} onKey={session.handleVirtualKey} />
              ) : null}
            </>
          ) : (
            <ResultsPanel
              title={`Lesson ${lesson.level} result`}
              stats={session.stats}
              samples={session.samples}
              errors={session.errors}
              target={lesson.exercise}
              typed={session.value}
              verdict={verdict}
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button onClick={restart} variant="outline">
                    <RotateCcw aria-hidden="true" /> Try again
                  </Button>
                  {next ? (
                    <Button asChild variant={result?.passed ? "default" : "outline"}>
                      <Link to="/learn/$lessonId" params={{ lessonId: next.id }}>
                        Next lesson <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link to="/test">Take a typing test</Link>
                    </Button>
                  )}
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
