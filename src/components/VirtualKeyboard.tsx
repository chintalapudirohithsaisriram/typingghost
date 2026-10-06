import { useState } from "react";
import { Button } from "@/components/ui/button";
import KeyboardHandsGuide from "./KeyboardHandsGuide";
import { KEY_LAYOUT, SHIFTED_BY_KEY } from "@/lib/keyboard-layout";
import { keyFor, shiftSideFor } from "@/lib/typing-content";
import { cn } from "@/lib/utils";

type Props = {
  nextChar?: string;
  highlightKeys?: string[];
  errorKeys?: Record<string, number>;
  onKey?: (key: string) => void;
  className?: string;
};
export default function VirtualKeyboard({
  nextChar = "",
  highlightKeys = [],
  errorKeys = {},
  onKey,
  className,
}: Props) {
  const [shift, setShift] = useState(false);
  const { key: next, shift: needsShift } = keyFor(nextChar);
  const shiftSide = needsShift ? shiftSideFor(next) : null;
  if (!onKey)
    return (
      <KeyboardHandsGuide
        nextChar={nextChar}
        highlightKeys={highlightKeys}
        errorKeys={errorKeys}
        showHands={false}
        className={className}
      />
    );
  const press = (key: string) => {
    if (key.startsWith("shift-")) {
      setShift((value) => !value);
      return;
    }
    if (key === "Tab") return;
    onKey(
      key === "enter"
        ? "\n"
        : key === "Backspace" || key === " "
          ? key
          : shift
            ? (SHIFTED_BY_KEY[key] ?? key.toUpperCase())
            : key,
    );
    if (key !== "Backspace") setShift(false);
  };
  return (
    <div
      className={cn("tap-keyboard-viewport", className)}
      role="group"
      aria-label="On-screen keyboard"
      data-testid="tap-keyboard"
    >
      <div className="tap-keyboard-layout">
        {KEY_LAYOUT.filter((box) => box.key !== "Tab").map((box) => {
          const isShift = box.key.startsWith("shift-");
          const active = isShift ? shift || box.key === `shift-${shiftSide}` : box.key === next;
          const label = shift && !isShift ? (SHIFTED_BY_KEY[box.key] ?? box.label) : box.label;
          return (
            <Button
              key={box.key}
              type="button"
              variant="outline"
              className={cn(
                "soft-key absolute h-auto min-h-11 px-0 font-mono text-xs uppercase",
                active && "border-primary bg-key-accent text-foreground",
                (errorKeys[box.key] ?? 0) > 0 && "text-destructive",
              )}
              style={{
                left: `${box.x / 10}%`,
                top: `${box.y / 3.42}%`,
                width: `${box.w / 10}%`,
                height: `${box.h / 3.42}%`,
              }}
              aria-label={
                isShift
                  ? `${box.key === "shift-left" ? "Left" : "Right"} Shift`
                  : box.key === "Backspace"
                    ? "Backspace"
                    : box.key === " "
                      ? "Space"
                      : box.key === "enter"
                        ? "Enter"
                        : `Type ${label}`
              }
              aria-pressed={isShift ? shift : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => press(box.key)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
