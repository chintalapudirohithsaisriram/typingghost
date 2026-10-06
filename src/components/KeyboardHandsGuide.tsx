import { FINGER_BY_KEY, keyFor, shiftSideFor } from "@/lib/typing-content";
import { HOME_KEY_BY_FINGER, KEY_LAYOUT, keyLabel } from "@/lib/keyboard-layout";
import { cn } from "@/lib/utils";

type Props = { nextChar?: string; highlightKeys?: string[]; errorKeys?: Record<string, number>; showHands?: boolean; className?: string };
const boxFor = (key: string) => KEY_LAYOUT.find((box) => box.key === key);

export default function KeyboardHandsGuide({ nextChar = "", highlightKeys = [], errorKeys = {}, showHands = true, className }: Props) {
  const { key: targetKey, shift } = keyFor(nextChar);
  const finger = FINGER_BY_KEY[targetKey];
  const shiftSide = shift ? shiftSideFor(targetKey) : null;
  const fingertips = Object.entries(HOME_KEY_BY_FINGER).flatMap(([id, homeKey]) => {
    const home = boxFor(homeKey);
    const destination = id === finger ? boxFor(targetKey) : id === `${shiftSide} pinky` ? boxFor(`shift-${shiftSide}`) : home;
    if (!home || !destination) return [];
    return [{ id, home, destination, active: id === finger || id === `${shiftSide} pinky` }];
  });
  return (
    <figure className={cn("keyboard-stage", className)} data-testid="keyboard-hands-guide" aria-hidden="true">
      <svg viewBox="0 0 1000 448" className="pointer-events-none block h-auto w-full select-none" focusable="false">
        {KEY_LAYOUT.map((box) => {
          const active = box.key === targetKey || box.key === `shift-${shiftSide}`;
          const lesson = highlightKeys.includes(box.key);
          return <g key={box.key} data-guide-key={box.key} data-active={active}>
            <rect x={box.x} y={box.y + 3} width={box.w} height={box.h} rx="8" className="fill-surface-2 stroke-key-border" />
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="8" className={cn("stroke-key-border", active ? "fill-key-accent stroke-primary" : lesson ? "fill-key-accent" : "fill-key")} strokeWidth={active ? 3 : 1.5} />
            {active ? <path d={`M${box.x + 8} ${box.y + box.h - 5}h${box.w - 16}`} className="stroke-primary" strokeWidth="3" /> : null}
          </g>;
        })}
        {showHands ? <g className="guide-hands" opacity="0.72">
          <path d="M205 448 L195 389 Q190 343 230 331 L377 326 Q420 328 434 367 L443 448 Z" className="fill-hand stroke-hand-edge" strokeWidth="2" />
          <path d="M795 448 L805 389 Q810 343 770 331 L623 326 Q580 328 566 367 L557 448 Z" className="fill-hand stroke-hand-edge" strokeWidth="2" />
          {fingertips.map(({id, home, destination, active}) => {
            const x = destination.x + destination.w / 2;
            const y = destination.y + 9;
            const baseX = home.x + home.w / 2;
            return <g key={id} className={active ? "stroke-primary" : "stroke-hand-edge"}>
              <path d={`M${baseX} 362 Q${baseX} 316 ${x} ${y + 12}`} strokeWidth={active ? 17 : 14} strokeLinecap="round" fill="none" />
              <circle cx="0" cy="0" r={active ? 7 : 5} className={cn("guide-fingertip", active ? "fill-primary" : "fill-hand-detail")} style={{ transform: `translate(${x}px, ${y}px)` }} data-finger={id} data-target={active ? destination.key : undefined} />
            </g>;
          })}
          {["left", "right"].map((side) => <path key={side} d={targetKey === " " ? `M${side === "left" ? 407 : 593} 385 Q${side === "left" ? 460 : 540} 345 ${side === "left" ? 470 : 530} 281` : `M${side === "left" ? 407 : 593} 385 Q${side === "left" ? 440 : 560} 360 ${side === "left" ? 465 : 535} 345`} className={targetKey === " " ? "stroke-primary" : "stroke-hand-edge"} strokeWidth="18" strokeLinecap="round" fill="none" />)}
        </g> : null}
        {KEY_LAYOUT.map((box) => <text key={box.key} x={box.x + box.w / 2} y={box.y + 35} textAnchor="middle" className={cn("font-mono text-[18px] font-semibold uppercase", (errorKeys[box.key] ?? 0) > 0 ? "fill-destructive" : "fill-foreground")} stroke="var(--key)" strokeWidth="4" paintOrder="stroke">{box.label}</text>)}
      </svg>
      <figcaption className="px-2 pb-2 text-center text-sm text-muted-foreground">
        {targetKey ? <><kbd className="font-mono font-semibold text-foreground">{keyLabel(nextChar)}</kbd> · {finger ?? "special key"}{shiftSide ? <> · {shiftSide} Shift pinky</> : null}</> : "A S D F · J K L ;"}
      </figcaption>
    </figure>
  );
}
