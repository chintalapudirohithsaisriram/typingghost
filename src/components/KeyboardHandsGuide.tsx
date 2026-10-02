import { FINGER_BY_KEY, KEYBOARD_ROWS, keyFor, shiftSideFor } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

type Props = {
  nextChar?: string;
  highlightKeys?: string[];
  errorKeys?: Record<string, number>;
  showHands?: boolean;
  className?: string;
};

type KeyBox = { key: string; x: number; y: number; w: number; h: number };

const ROWS = [
  { keys: KEYBOARD_ROWS[0] ?? [], x: 58, y: 224, w: 66, gap: 8 },
  { keys: KEYBOARD_ROWS[1] ?? [], x: 90, y: 292, w: 72, gap: 8 },
  { keys: KEYBOARD_ROWS[2] ?? [], x: 118, y: 360, w: 72, gap: 8 },
  { keys: KEYBOARD_ROWS[3] ?? [], x: 170, y: 428, w: 72, gap: 8 },
] as const;

const KEY_BOXES: KeyBox[] = ROWS.flatMap((row) =>
  row.keys.map((key, index) => ({ key, x: row.x + index * (row.w + row.gap), y: row.y, w: row.w, h: 54 })),
);
const SHIFT_BOXES: KeyBox[] = [
  { key: "shift-left", x: 58, y: 428, w: 104, h: 54 },
  { key: "shift-right", x: 826, y: 428, w: 116, h: 54 },
];
const SPACE_BOX: KeyBox = { key: " ", x: 322, y: 496, w: 356, h: 50 };

const FINGER_HOME: Record<string, { x: number; y: number }> = {
  "left pinky": { x: 235, y: 164 },
  "left ring": { x: 300, y: 142 },
  "left middle": { x: 365, y: 130 },
  "left index": { x: 430, y: 150 },
  "right index": { x: 570, y: 150 },
  "right middle": { x: 635, y: 130 },
  "right ring": { x: 700, y: 142 },
  "right pinky": { x: 765, y: 164 },
  thumbs: { x: 500, y: 198 },
};

const labelFor = (key: string) => (key === " " ? "space" : key);

export default function KeyboardHandsGuide({
  nextChar = "",
  highlightKeys = [],
  errorKeys = {},
  showHands = true,
  className,
}: Props) {
  const { key: targetKey, shift } = keyFor(nextChar);
  const finger = FINGER_BY_KEY[targetKey];
  const shiftSide = shift ? shiftSideFor(targetKey) : null;
  const target = targetKey === " " ? SPACE_BOX : KEY_BOXES.find((box) => box.key === targetKey);
  const targetPoint = target ? { x: target.x + target.w / 2, y: target.y + 7 } : undefined;
  const activeFinger = finger ? FINGER_HOME[finger] : undefined;
  const shiftTarget = shiftSide ? SHIFT_BOXES.find((box) => box.key === `shift-${shiftSide}`) : undefined;
  const shiftPoint = shiftTarget
    ? { x: shiftTarget.x + shiftTarget.w / 2, y: shiftTarget.y + 7 }
    : undefined;
  const shiftFinger = shiftSide ? FINGER_HOME[`${shiftSide} pinky`] : undefined;

  return (
    <figure
      className={cn("soft-panel overflow-hidden p-2 sm:p-4", className)}
      data-testid="keyboard-hands-guide"
    >
      <div className="mx-auto w-full max-w-4xl" aria-hidden="true">
        <svg viewBox="0 0 1000 570" className="block h-auto w-full select-none" focusable="false">
          {showHands ? (
            <g className="pointer-events-none">
              <path d="M165 205 C205 116 295 84 438 113 L482 210 L410 247 L250 242 Z" className="fill-hand stroke-hand-edge" strokeWidth="3" />
              <path d="M835 205 C795 116 705 84 562 113 L518 210 L590 247 L750 242 Z" className="fill-hand stroke-hand-edge" strokeWidth="3" />
              {Object.entries(FINGER_HOME).filter(([id]) => id !== "thumbs").map(([id, point]) => {
                const isActive = id === finger || id === `${shiftSide} pinky`;
                return <circle key={id} cx={point.x} cy={point.y} r={isActive ? 17 : 12} className={isActive ? "fill-primary stroke-primary" : "fill-hand-detail stroke-hand-edge"} strokeWidth="3" />;
              })}
              <path d="M430 205 Q470 225 500 271" className={finger === "thumbs" ? "stroke-primary" : "stroke-hand-edge"} strokeWidth="24" strokeLinecap="round" fill="none" />
              <path d="M570 205 Q530 225 500 271" className={finger === "thumbs" ? "stroke-primary" : "stroke-hand-edge"} strokeWidth="24" strokeLinecap="round" fill="none" />
              {activeFinger && targetPoint ? (
                <path d={`M ${activeFinger.x} ${activeFinger.y + 15} Q ${activeFinger.x} ${(activeFinger.y + targetPoint.y) / 2} ${targetPoint.x} ${targetPoint.y}`} className="stroke-primary" strokeWidth="9" strokeLinecap="round" fill="none" />
              ) : null}
              {shiftFinger && shiftPoint ? (
                <path d={`M ${shiftFinger.x} ${shiftFinger.y + 15} Q ${shiftFinger.x} ${(shiftFinger.y + shiftPoint.y) / 2} ${shiftPoint.x} ${shiftPoint.y}`} className="stroke-primary" strokeWidth="7" strokeLinecap="round" strokeDasharray="12 9" fill="none" />
              ) : null}
            </g>
          ) : null}

          {[...KEY_BOXES, ...SHIFT_BOXES, SPACE_BOX].map((box) => {
            const baseKey = box.key.startsWith("shift-") ? "shift" : box.key;
            const isTarget = baseKey === targetKey || box.key === `shift-${shiftSide}`;
            const isLessonKey = highlightKeys.includes(baseKey);
            const hasErrors = (errorKeys[baseKey] ?? 0) > 0;
            return (
              <g key={box.key}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx="11"
                  className={cn(
                    "stroke-key-border",
                    isTarget ? "fill-primary" : isLessonKey ? "fill-key-accent" : "fill-key",
                  )}
                  strokeWidth={isTarget ? 4 : 2}
                />
                <text
                  x={box.x + box.w / 2}
                  y={box.y + box.h / 2 + 5}
                  textAnchor="middle"
                  className={cn(
                    "font-mono text-[16px] font-semibold uppercase",
                    isTarget ? "fill-primary-foreground" : hasErrors ? "fill-destructive" : "fill-foreground",
                  )}
                >
                  {box.key.startsWith("shift-") ? "shift" : labelFor(box.key)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="-mt-1 px-2 pb-1 text-center text-sm text-muted-foreground" aria-live="polite">
        {targetKey ? (
          <>
            Next <kbd className="soft-key mx-1 px-2 py-0.5 font-mono text-foreground">{labelFor(nextChar)}</kbd>
            <span className="text-foreground">{finger ?? "special key"}</span>
            {shiftSide ? <> · hold {shiftSide} Shift with your pinky</> : null}
          </>
        ) : (
          "Rest on A S D F and J K L ;"
        )}
      </figcaption>
    </figure>
  );
}
