import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Repeat, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import CourseSidebar from "@/components/CourseSidebar";
import KeyboardHandsGuide from "@/components/KeyboardHandsGuide";
import ResultsPanel from "@/components/ResultsPanel";
import TypingSurface from "@/components/TypingSurface";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useTypingSession, type TypingResult } from "@/hooks/useTypingSession";
import { lessonStatus, markMistakePractised, recordSession } from "@/lib/profile";
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
        "Lesson not found | TypingGhost",
        "This lesson is not part of the TypingGhost course.",
      );
    return pageHead(
      `Lesson ${lesson.level}: ${lesson.title} | TypingGhost`,
      lesson.description + " Accuracy is supportive feedback, and speed is personal progress.",
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
  const { profile, ready, update } = useProfile();
  const settings = useSettings();
  const [result, setResult] = useState<(TypingResult & { passed: boolean }) | null>(null);
  const [activityIndex, setActivityIndex] = useState(0);
  const [progressReady, setProgressReady] = useState(false);
  const [drillText, setDrillText] = useState<string | null>(null);
  const [drillResult, setDrillResult] = useState<TypingResult | null>(null);
  const initializedLesson = useRef<string | null>(null);
  const savedActivityCount = profile.lessonProgress[lesson.id]?.completedActivities ?? 0;

  useEffect(() => {
    if (!ready || initializedLesson.current === lesson.id) return;
    initializedLesson.current = lesson.id;
    setActivityIndex(Math.min(savedActivityCount, lesson.activities.length - 1));
    setProgressReady(true);
  }, [ready, savedActivityCount, lesson.id, lesson.activities.length]);

  const activity = lesson.activities[activityIndex] ?? lesson.activities[0]!;
  const isFinalActivity = activityIndex === lesson.activities.length - 1;
  const activityKeys = activity.focusKeys ?? lesson.targetKeys;
  const index = LESSONS.findIndex((item) => item.id === lesson.id);
  const next = LESSONS[index + 1];
  const previous = index > 0 ? LESSONS[index - 1] : undefined;
  const completedBefore = profile.completedLessons.includes(lesson.id);

  const session = useTypingSession({
    target: drillText ?? activity.text,
    onComplete: (run) => {
      if (drillText) {
        // A clean retelling of missed words retires them from the saved list.
        const corrected = run.wordAttempts.filter((w) => w.attempt === w.target).map((w) => w.target);
        update((current) =>
          markMistakePractised(
            recordSession(current, {
              mode: "practice",
              label: `Mistake drill · Lesson ${lesson.level}: ${lesson.title}`,
              stats: run.stats,
              errors: run.errors,
              hits: run.hits,
            }),
            corrected,
          ),
        );
        setDrillResult(run);
        return;
      }
      const accuracyMet = run.stats.realAccuracy >= lesson.goalAccuracy;
      setResult({ ...run, passed: true });
      update((current) =>
        recordSession(current, {
          mode: "lesson",
          label:
            "Lesson " + lesson.level + ", activity " + (activityIndex + 1) + ": " + lesson.title,
          stats: run.stats,
          errors: run.errors,
          hits: run.hits,
          lessonId: lesson.id,
          activityId: activity.id,
          passed: accuracyMet,
          lessonCompleted: isFinalActivity,
          lessonActivityIndex: activityIndex,
        }),
      );
    },
  });

  const targetKeys = activityKeys.filter((key) => key !== "all" && key !== "shift");
  const restart = () => {
    setResult(null);
    session.reset();
  };
  const continueActivity = () => {
    setResult(null);
    session.reset();
    setActivityIndex((current) => Math.min(current + 1, lesson.activities.length - 1));
  };
  const missedWords = result
    ? result.wordAttempts
        .filter((attempt) => attempt.attempt !== attempt.target)
        .map((attempt) => attempt.target)
        .slice(0, 6)
    : [];
  const startDrill = () => {
    if (!missedWords.length) return;
    setDrillResult(null);
    setDrillText(missedWords.flatMap((word) => [word, word]).join(" "));
  };
  const exitDrill = () => {
    setDrillText(null);
    setDrillResult(null);
    session.reset();
  };
  const restartDrill = () => {
    setDrillResult(null);
    session.reset();
  };

  const verdict = result
    ? {
        passed: true,
        label: isFinalActivity ? "Lesson complete" : "Activity complete",
        message:
          (isFinalActivity ? "Lesson complete." : "Activity complete.") +
          " Accuracy: " +
          round(result.stats.realAccuracy, 1) +
          "%" +
          (result.stats.realAccuracy < lesson.goalAccuracy
            ? " (suggested focus: " + lesson.goalAccuracy + "%)."
            : ".") +
          " WPM is progress information; continue whenever you are ready." +
          (completedBefore ? " Your earlier completion remains saved." : ""),
      }
    : undefined;

  if (!progressReady) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Loading your saved lesson progress…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <CourseSidebar
          completed={profile.completedLessons}
          inProgress={LESSONS.filter(
            (item) => lessonStatus(profile, item.id) === "in-progress",
          ).map((item) => item.id)}
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
                  {completedBefore ? " · Completed" : ""}
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
                    Activity
                  </dt>
                  <dd className="font-display text-xl font-bold">
                    {activityIndex + 1}{" "}
                    <span className="text-xs font-normal">of {lesson.activities.length}</span>
                  </dd>
                </div>
                <div className="rounded-xl bg-secondary px-4 py-2">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Accuracy guide
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
                  {key === "all" ? "all keys" : key === " " ? "Space" : key}
                </kbd>
              ))}
              <span className="ml-auto text-muted-foreground">Tip: {lesson.tip}</span>
            </div>
            <div className="mt-4 rounded-xl bg-secondary/70 p-4">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {activity.kind} · activity {activityIndex + 1} of {lesson.activities.length}
              </p>
              <p className="mt-1 text-sm">{activity.instruction}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Accuracy is supportive feedback; speed never blocks progress.
              </p>
            </div>
          </header>

          {drillText ? (
            <section className="panel space-y-4 p-5" aria-labelledby="drill-title">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 id="drill-title" className="font-display text-lg font-semibold">
                    Mistake drill
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Type the words you missed twice. A clean run retires them from your saved
                    mistakes.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={exitDrill}>
                  Back to results
                </Button>
              </header>
              {drillResult ? (
                <div className="space-y-3">
                  <p className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
                    Drill finished: {round(drillResult.stats.realAccuracy, 1)}% accuracy ·{" "}
                    {round(drillResult.stats.netWpm)} WPM.{" "}
                    {drillResult.stats.realAccuracy >= 98
                      ? "Clean run — those words are retired."
                      : "Drill again when you are ready."}
                  </p>
                  <Button onClick={restartDrill} variant="outline">
                    <RotateCcw aria-hidden="true" /> Drill again
                  </Button>
                </div>
              ) : (
                <>
                  <TypingSurface target={drillText} session={session} size="lg" />
                  <Button onClick={restartDrill} variant="outline" size="sm">
                    <RotateCcw aria-hidden="true" /> Restart drill
                  </Button>
                </>
              )}
            </section>
          ) : !session.done ? (
            <>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div
                  className="h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-label="Activity progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(session.progress)}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: String(session.progress) + "%" }}
                  />
                </div>
                <span className="tabular-nums text-muted-foreground" aria-live="off">
                  {round(session.stats.netWpm)} WPM ·{" "}
                  {session.value ? round(session.stats.realAccuracy) : 100}% accuracy
                </span>
                <Button onClick={restart} variant="outline" size="sm">
                  <RotateCcw aria-hidden="true" /> Restart activity
                </Button>
              </div>

              <TypingSurface target={activity.text} session={session} size="lg" />

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
            </>
          ) : (
            <ResultsPanel
              title={"Lesson " + lesson.level + ", activity " + (activityIndex + 1) + " result"}
              stats={session.stats}
              samples={session.samples}
              errors={session.errors}
              target={activity.text}
              typed={session.value}
              verdict={verdict}
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button onClick={restart} variant="outline">
                    <RotateCcw aria-hidden="true" /> Try again
                  </Button>
                  {missedWords.length ? (
                    <Button variant="outline" onClick={startDrill}>
                      <Repeat aria-hidden="true" /> Drill {missedWords.length} missed word
                      {missedWords.length === 1 ? "" : "s"}
                    </Button>
                  ) : null}
                  {!isFinalActivity ? (
                    <Button onClick={continueActivity}>
                      Continue activity <ArrowRight aria-hidden="true" />
                    </Button>
                  ) : next ? (
                    <Button asChild>
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
