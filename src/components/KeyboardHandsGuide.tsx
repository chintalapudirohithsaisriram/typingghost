import { FINGER_BY_KEY, keyFor, shiftSideFor } from "@/lib/typing-content";
import { HOME_KEY_BY_FINGER, KEY_LAYOUT, keyLabel, SHIFTED_BY_KEY } from "@/lib/keyboard-layout";
import { cn } from "@/lib/utils";

type Props = {
  nextChar?: string;
  highlightKeys?: string[];
  errorKeys?: Record<string, number>;
  showHands?: boolean;
  className?: string | undefined;
};
const boxFor = (key: string) => KEY_LAYOUT.find((box) => box.key === key);
const kindOf = (finger?: string) =>
  !finger
    ? "none"
    : finger === "thumbs"
      ? "thumb"
      : (finger.split(" ")[1] ?? "none");
const fc = (kind: string) => `var(--finger-${kind}, var(--key-border))`;

/** Original translucent hands, colour-coded by finger zone, on the shared key geometry. */
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
  const shiftKey = shiftSide ? `shift-${shiftSide}` : "";
  const activeKind = kindOf(finger);

  const fingers = Object.entries(HOME_KEY_BY_FINGER).flatMap(([id, homeKey]) => {
    const home = boxFor(homeKey);
    const isTarget = id === finger;
    const isShift = id === `${shiftSide} pinky`;
    const dest = isTarget ? boxFor(targetKey) : isShift ? boxFor(shiftKey) : home;
    if (!home || !dest) return [];
    const left = id.startsWith("left");
    const kind = kindOf(id);
    const order = { pinky: 0, ring: 1, middle: 2, index: 3 }[kind] ?? 0;
    // Knuckles sit on an arc under the home row, so resting fingers are short and natural.
    const kx = left ? 250 + order * 46 : 750 - order * 46;
    const ky = 300 - [8, 20, 26, 18][order]!;
    return [{ id, kind, active: isTarget || isShift, dest, kx, ky }];
  });
  const space = boxFor(" ");
  const spaceActive = targetKey === " ";

  return (
    <figure
      className={cn("keyboard-stage pointer-events-none select-none", className)}
      data-testid="keyboard-hands-guide"
      aria-hidden="true"
    >
      <figcaption className="guide-caption">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <kbd className="guide-target" style={{ borderColor: fc(activeKind) }}>
            {targetKey ? keyLabel(nextChar) : "—"}
          </kbd>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="guide-dot" style={{ background: fc(activeKind) }} />
            {finger === "thumbs"
              ? "Either thumb"
              : finger
                ? `${finger.charAt(0).toUpperCase()}${finger.slice(1)}`
                : "Home position"}
          </span>
          {shiftSide ? (
            <span className="text-sm text-muted-foreground">+ {shiftSide} pinky holds Shift</span>
          ) : null}
        </div>
      </figcaption>
      <svg viewBox={`0 0 1000 ${showHands ? 470 : 342}`} className="block h-auto w-full" focusable="false">
        {KEY_LAYOUT.map((box) => {
          const kind = kindOf(FINGER_BY_KEY[box.key]);
          const active = box.key === targetKey || box.key === shiftKey;
          return (
            <g key={box.key} data-guide-key={box.key} data-active={active}>
              <rect x={box.x} y={box.y + 4} width={box.w} height={box.h} rx="9" className="fill-surface-2" />
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx="9"
                className={cn("stroke-key-border", active ? "guide-key-active" : highlightKeys.includes(box.key) ? "fill-key-accent" : "fill-key")}
                style={active ? { fill: fc(box.key === shiftKey ? "pinky" : kind), stroke: fc(box.key === shiftKey ? "pinky" : kind) } : undefined}
                strokeWidth={active ? 2 : 1}
              />
              {kind !== "none" ? (
                <rect x={box.x + 10} y={box.y + box.h - 7} width={box.w - 20} height="3" rx="1.5" style={{ fill: fc(kind) }} opacity={active ? 0 : 0.55} />
              ) : null}
              {SHIFTED_BY_KEY[box.key] ? (
                <text x={box.x + 9} y={box.y + 15} className="fill-muted-foreground font-mono" fontSize="11">
                  {SHIFTED_BY_KEY[box.key]}
                </text>
              ) : null}
              {box.key === "f" || box.key === "j" ? (
                <path d={`M${box.x + 23} ${box.y + 47}h12`} className="stroke-muted-foreground" strokeWidth="2" strokeLinecap="round" />
              ) : null}
            </g>
          );
        })}

        {showHands ? (
          <g className="guide-hands">
            {[false, true].map((right) => (
              <path
                key={String(right)}
                transform={right ? "translate(1000 0) scale(-1 1)" : undefined}
                d="M232 300 Q236 270 268 276 L398 284 Q420 290 424 318 L432 372 Q440 420 410 452 Q360 470 300 462 Q248 452 236 400 Z"
                className="guide-palm"
              />
            ))}
            {fingers.map(({ id, kind, active, dest, kx, ky }) => {
              const x = dest.x + dest.w / 2;
              const y = dest.y + 16;
              const d = `M${kx} ${ky} Q${(kx + x) / 2} ${(ky + y) / 2 + 10} ${x} ${y}`;
              return (
                <g key={id} className={cn("guide-digit", active && "guide-digit-active")} data-finger={id} data-target={active ? dest.key : undefined}>
                  <path d={d} className="guide-finger guide-finger-path" strokeWidth={kind === "pinky" ? 22 : 26} />
                  <path d={d} className="guide-finger-path" fill="none" strokeLinecap="round" strokeWidth={kind === "pinky" ? 14 : 17} style={{ stroke: fc(kind) }} opacity={active ? 0.9 : 0.35} />
                  <g className="guide-fingertip" style={{ transform: `translate(${x}px, ${y}px)` }}>
                    <ellipse rx="8" ry="6" className="fill-surface" opacity="0.85" />
                    {active ? <circle r="20" className="guide-ping" style={{ stroke: fc(kind) }} /> : null}
                  </g>
                </g>
              );
            })}
            {["left", "right"].map((side) => {
              const l = side === "left";
              const x = spaceActive && space ? space.x + space.w * (l ? 0.36 : 0.64) : l ? 448 : 552;
              const y = spaceActive && space ? space.y + 22 : 345;
              const bx = l ? 410 : 590;
              const d = `M${bx} 380 Q${(bx + x) / 2} ${y + 30} ${x} ${y}`;
              return (
                <g key={side} className={cn("guide-digit", spaceActive && "guide-digit-active")} data-finger={`${side} thumb`} data-target={spaceActive ? " " : undefined}>
                  <path d={d} className="guide-finger guide-finger-path" strokeWidth="28" />
                  <path d={d} className="guide-finger-path" fill="none" strokeLinecap="round" strokeWidth="19" style={{ stroke: fc("thumb") }} opacity={spaceActive ? 0.9 : 0.35} />
                  <g className="guide-fingertip" style={{ transform: `translate(${x}px, ${y}px)` }}>
                    <ellipse rx="9" ry="6" className="fill-surface" opacity="0.85" />
                    {spaceActive ? <circle r="22" className="guide-ping" style={{ stroke: fc("thumb") }} /> : null}
                  </g>
                </g>
              );
            })}
          </g>
        ) : null}

        {/* Legends painted last on opaque backing: guidance never obscures a letter. */}
        {KEY_LAYOUT.map((box) => {
          const active = box.key === targetKey || box.key === shiftKey;
          return (
            <g key={box.key}>
              <rect
                x={box.x + box.w / 2 - (box.label.length > 1 ? 28 : 12)}
                y={box.y + 23}
                width={box.label.length > 1 ? 56 : 24}
                height="22"
                rx="5"
                className={active ? "fill-surface" : "fill-key"}
                opacity={active ? 0.95 : 0.9}
              />
              <text
                x={box.x + box.w / 2}
                y={box.y + 40}
                textAnchor="middle"
                fontSize={box.label.length > 1 ? 14 : 19}
                className={cn("font-mono font-semibold uppercase", (errorKeys[box.key] ?? 0) > 0 ? "fill-destructive" : "fill-foreground")}
              >
                {box.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="guide-legend">
        {["pinky", "ring", "middle", "index", "thumb"].map((k) => (
          <span key={k} className={cn(activeKind === k && "font-semibold text-foreground")}>
            <span className="guide-dot" style={{ background: fc(k) }} />
            {k}
          </span>
        ))}
      </div>
    </figure>
  );
}
