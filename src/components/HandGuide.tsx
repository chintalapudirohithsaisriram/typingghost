import { FINGER_BY_KEY, keyFor, shiftSideFor } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

type Props = { nextChar?: string; className?: string };

// Finger order per hand, pinky → thumb, with (x, height) for the drawing.
const LEFT = [
  { id: "left pinky", x: 14, h: 46 },
  { id: "left ring", x: 34, h: 60 },
  { id: "left middle", x: 54, h: 66 },
  { id: "left index", x: 74, h: 58 },
];
const RIGHT = [
  { id: "right index", x: 126, h: 58 },
  { id: "right middle", x: 146, h: 66 },
  { id: "right ring", x: 166, h: 60 },
  { id: "right pinky", x: 186, h: 46 },
];

/**
 * Visual-only finger guide. It has no buttons, no handlers and ignores
 * pointer events entirely, so clicking or tapping it can never type.
 */
export default function HandGuide({ nextChar, className }: Props) {
  const { key, shift } = keyFor(nextChar ?? "");
  const finger = FINGER_BY_KEY[key];
  const shiftSide = shift ? shiftSideFor(key) : null;
  const active = (id: string) =>
    finger === id ||
    (shiftSide === "left" && id === "left pinky") ||
    (shiftSide === "right" && id === "right pinky");

  return (
    <div
      className={cn("pointer-events-none select-none", className)}
      aria-hidden="true"
      data-testid="hand-guide"
    >
      <svg viewBox="0 0 200 120" className="mx-auto h-auto w-full max-w-xs">
        {[...LEFT, ...RIGHT].map((f) => (
          <rect
            key={f.id}
            x={f.x - 8}
            y={100 - f.h}
            width={16}
            height={f.h}
            rx={8}
            className={cn(active(f.id) ? "fill-primary" : "fill-secondary", "stroke-border")}
            strokeWidth={1}
          />
        ))}
        <rect x={4} y={86} width={82} height={30} rx={14} className="fill-secondary" />
        <rect x={114} y={86} width={82} height={30} rx={14} className="fill-secondary" />
        <rect
          x={84}
          y={78}
          width={14}
          height={30}
          rx={7}
          transform="rotate(-25 91 93)"
          className={finger === "thumbs" ? "fill-primary" : "fill-secondary"}
        />
        <rect
          x={102}
          y={78}
          width={14}
          height={30}
          rx={7}
          transform="rotate(25 109 93)"
          className={finger === "thumbs" ? "fill-primary" : "fill-secondary"}
        />
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {finger ? (
          <>
            Use your <span className="font-medium text-foreground">{finger}</span>
            {shiftSide ? <> + {shiftSide} pinky on Shift</> : null}
          </>
        ) : (
          "Fingers rest on the home row"
        )}
      </p>
    </div>
  );
}
