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

/** Original vector anatomy, driven by the same physical-key geometry as the keycaps. */
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
  const fingers = Object.entries(HOME_KEY_BY_FINGER).flatMap(([id, homeKey]) => {
    const home = boxFor(homeKey);
    const active = id === finger || id === `${shiftSide} pinky`;
    const destination =
      id === finger
        ? boxFor(targetKey)
        : id === `${shiftSide} pinky`
          ? boxFor(`shift-${shiftSide}`)
          : home;
    if (!home || !destination) return [];
    const left = id.startsWith("left");
    const order = id.endsWith("pinky")
      ? 0
      : id.endsWith("ring")
        ? 1
        : id.endsWith("middle")
          ? 2
          : 3;
    const baseX = left ? 232 + order * 43 : 768 - order * 43;
    return [{ id, active, destination, baseX }];
  });
  const space = boxFor(" ");

  return (
    <figure
      className={cn("keyboard-stage pointer-events-none select-none", className)}
      data-testid="keyboard-hands-guide"
      aria-hidden="true"
    >
      <figcaption className="guide-caption">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <kbd className="guide-target">{targetKey ? keyLabel(nextChar) : "—"}</kbd>
          <span className="text-sm font-medium text-foreground">
            {showHands
              ? finger === "thumbs"
                ? "Either thumb"
                : finger
                  ? `${finger.charAt(0).toUpperCase()}${finger.slice(1)}`
                  : "Home position"
              : "Next key"}
          </span>
          {shiftSide ? (
            <span className="text-sm text-muted-foreground">+ {shiftSide} pinky on Shift</span>
          ) : null}
        </div>
      </figcaption>
      <svg
        viewBox={`0 0 1000 ${showHands ? 496 : 342}`}
        className="block h-auto w-full"
        focusable="false"
      >
        {KEY_LAYOUT.map((box) => {
          const active = box.key === targetKey || box.key === `shift-${shiftSide}`;
          return (
            <g key={box.key} data-guide-key={box.key} data-active={active}>
              <rect
                x={box.x}
                y={box.y + 4}
                width={box.w}
                height={box.h}
                rx="7"
                className="fill-surface-2 stroke-key-border"
              />
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx="7"
                className={cn(
                  "stroke-key-border",
                  active
                    ? "fill-key-accent stroke-primary"
                    : highlightKeys.includes(box.key)
                      ? "fill-key-accent"
                      : "fill-key",
                )}
                strokeWidth={active ? 2.5 : 1}
              />
              <path
                d={`M${box.x + 8} ${box.y + 5}h${box.w - 16}`}
                className="stroke-surface"
                strokeWidth="2"
                opacity="0.8"
              />
              {SHIFTED_BY_KEY[box.key] ? (
                <text
                  x={box.x + 9}
                  y={box.y + 15}
                  className="fill-muted-foreground font-mono"
                  fontSize="11"
                >
                  {SHIFTED_BY_KEY[box.key]}
                </text>
              ) : null}
              {active ? (
                <path
                  d={`M${box.x + 10} ${box.y + box.h - 5}h${box.w - 20}`}
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ) : null}
              {box.key === "f" || box.key === "j" ? (
                <path
                  d={`M${box.x + 23} ${box.y + 46}h12`}
                  className="stroke-muted-foreground"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : null}
            </g>
          );
        })}
        {showHands ? (
          <g className="guide-hands">
            {[false, true].map((right) => (
              <g
                key={String(right)}
                transform={right ? "translate(1000 0) scale(-1 1)" : undefined}
              >
                <path
                  d="M237 485 L220 420 Q211 379 225 353 Q236 338 254 342 L361 342 Q381 343 397 367 Q411 370 423 386 Q432 412 415 437 L397 485 Z"
                  className="fill-hand stroke-hand-edge"
                  strokeWidth="1.5"
                />
                <path
                  d="M249 479 L242 423 Q237 399 247 382 M268 420 Q313 398 363 418 M276 445 Q322 430 361 441"
                  className="stroke-hand-edge"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <path
                  d="M231 400 Q224 373 238 354"
                  className="stroke-surface"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </g>
            ))}
            {fingers.map(({ id, active, destination, baseX }) => {
              const x = destination.x + destination.w / 2;
              // The contact pad lands inside the key, above the unobstructed legend.
              const y = destination.y + 13;
              const d = `M${baseX} 365 C${baseX} 307 ${x} ${y + 64} ${x} ${y + 9}`;
              return (
                <g
                  key={id}
                  className={cn("guide-digit", active ? "guide-digit-active" : "guide-digit-rest")}
                  data-finger={id}
                  data-target={active ? destination.key : undefined}
                >
                  <path
                    d={d}
                    fill="none"
                    className="stroke-hand-edge guide-finger-path"
                    strokeWidth="29"
                    strokeLinecap="round"
                  />
                  <path
                    d={d}
                    fill="none"
                    className="stroke-hand guide-finger-path"
                    strokeWidth="25"
                    strokeLinecap="round"
                  />
                  {active ? (
                    <path
                      d={d}
                      fill="none"
                      className="stroke-primary guide-finger-path"
                      strokeWidth="2"
                      strokeDasharray="4 7"
                      strokeLinecap="round"
                    />
                  ) : null}
                  <g className="guide-fingertip" style={{ transform: `translate(${x}px, ${y}px)` }}>
                    <rect
                      x="-9"
                      y="-4"
                      width="18"
                      height="19"
                      rx="7"
                      className="fill-surface stroke-hand-edge"
                      strokeWidth="1"
                    />
                    <path
                      d="M-5 8 Q0 5 5 8"
                      fill="none"
                      className="stroke-hand-edge"
                      strokeWidth="1"
                    />
                    {active ? (
                      <>
                        <circle r="17" className="fill-none stroke-primary" strokeWidth="2" />
                        <circle r="3" className="fill-primary" />
                      </>
                    ) : null}
                  </g>
                </g>
              );
            })}
            {["left", "right"].map((side) => {
              const active = targetKey === " " && space !== undefined;
              const x =
                active && space
                  ? space.x + space.w * (side === "left" ? 0.37 : 0.63)
                  : side === "left"
                    ? 440
                    : 560;
              const y = active && space ? space.y + 13 : 347;
              const base = side === "left" ? 388 : 612;
              const d = `M${base} 418 Q${base} 372 ${x} ${y + 10}`;
              return (
                <g
                  key={side}
                  className={cn("guide-digit", active ? "guide-digit-active" : "guide-digit-rest")}
                  data-finger={`${side} thumb`}
                  data-target={active ? " " : undefined}
                >
                  <path
                    d={d}
                    className="stroke-hand-edge guide-finger-path"
                    strokeWidth="34"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={d}
                    className="stroke-hand guide-finger-path"
                    strokeWidth="30"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <g className="guide-fingertip" style={{ transform: `translate(${x}px, ${y}px)` }}>
                    <rect
                      x="-10"
                      y="-3"
                      width="20"
                      height="19"
                      rx="8"
                      className="fill-surface stroke-hand-edge"
                    />
                    {active ? (
                      <>
                        <circle r="19" className="fill-none stroke-primary" strokeWidth="2" />
                        <circle r="3" className="fill-primary" />
                      </>
                    ) : null}
                  </g>
                </g>
              );
            })}
          </g>
        ) : null}
        {/* Legends are painted last on opaque backing: guidance can never obscure a letter. */}
        {KEY_LAYOUT.map((box) => (
          <g key={box.key}>
            <rect
              x={box.x + box.w / 2 - (box.label.length > 1 ? 28 : 11)}
              y={box.y + 25}
              width={box.label.length > 1 ? 56 : 22}
              height="20"
              rx="3"
              className={
                box.key === targetKey || box.key === `shift-${shiftSide}`
                  ? "fill-key-accent"
                  : "fill-key"
              }
            />
            <text
              x={box.x + box.w / 2}
              y={box.y + 40}
              textAnchor="middle"
              fontSize={box.label.length > 1 ? 14 : 19}
              className={cn(
                "font-mono font-semibold uppercase",
                (errorKeys[box.key] ?? 0) > 0 ? "fill-destructive" : "fill-foreground",
              )}
            >
              {box.label}
            </text>
          </g>
        ))}
        {showHands ? (
          <g className="fill-muted-foreground font-sans" fontSize="12" textAnchor="middle">
            <text x="316" y="471">
              LEFT HAND
            </text>
            <text x="684" y="471">
              RIGHT HAND
            </text>
          </g>
        ) : null}
      </svg>
    </figure>
  );
}
