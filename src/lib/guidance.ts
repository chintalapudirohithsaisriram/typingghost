import { HOME_KEY_BY_FINGER, keyLabel } from "./keyboard-layout";
import { FINGER_BY_KEY, keyFor, shiftSideFor } from "./typing-content";

export type KeyGuidance = {
  targetKey: string;
  label: string;
  finger: string;
  homeKey: string | null;
  shiftSide: "left" | "right" | null;
  instruction: string;
};

export function guidanceFor(character: string): KeyGuidance {
  const { key: targetKey, shift } = keyFor(character);
  const finger = FINGER_BY_KEY[targetKey] ?? "the matching finger";
  const shiftSide = shift ? shiftSideFor(targetKey) : null;
  const homeKey = finger === "thumbs" ? null : (HOME_KEY_BY_FINGER[finger] ?? null);
  const label = keyLabel(character);
  const returnCue =
    homeKey && homeKey !== targetKey ? `, then return to ${homeKey.toUpperCase()}` : "";
  const shiftCue = shiftSide ? ` while the ${shiftSide} pinky holds Shift` : "";
  const instruction = targetKey
    ? `Press ${label} with ${finger}${shiftCue}${returnCue}.`
    : "Rest your fingers on A S D F and J K L semicolon.";
  return { targetKey, label, finger, homeKey, shiftSide, instruction };
}
