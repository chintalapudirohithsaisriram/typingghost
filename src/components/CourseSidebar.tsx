import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LESSONS, type Lesson } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

const STAGES: Lesson["stage"][] = ["Foundations", "Reaches", "Fluency", "Mastery"];

type Props = { completed: string[]; currentId?: string; className?: string };

export default function CourseSidebar({ completed, currentId, className }: Props) {
  const done = completed.length;
  return (
    <nav aria-label="Course path" className={cn("panel p-3", className)}>
      <div className="px-2 pt-1 pb-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Course path</p>
        <p className="mt-1 text-sm">
          <span className="font-semibold">{done}</span> of {LESSONS.length} passed
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={LESSONS.length} aria-valuenow={done} aria-label="Course progress">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(done / LESSONS.length) * 100}%` }} />
        </div>
      </div>
      {STAGES.map((stage) => (
        <div key={stage} className="mt-2">
          <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{stage}</p>
          <ol className="space-y-0.5">
            {LESSONS.filter((l) => l.stage === stage).map((lesson) => {
              const isDone = completed.includes(lesson.id);
              const isCurrent = lesson.id === currentId;
              return (
                <li key={lesson.id}>
                  <Link
                    to="/learn/$lessonId"
                    params={{ lessonId: lesson.id }}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      isCurrent && "bg-secondary font-medium",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                        isDone ? "border-primary bg-primary text-primary-foreground" : isCurrent ? "border-foreground" : "border-border text-muted-foreground",
                      )}
                    >
                      {isDone ? <Check className="size-3.5" aria-label="passed" /> : lesson.level}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </nav>
  );
}
