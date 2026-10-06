import { KEYBOARD_ROWS, SHIFT_MAP } from "./typing-content";

export type KeyBox = { key: string; label: string; x: number; y: number; w: number; h: number };
const rows = [
  { keys: ["`", ...(KEYBOARD_ROWS[0] ?? [])], x: 16, y: 16 },
  { keys: [...(KEYBOARD_ROWS[1] ?? []), "[", "]", "\\"], x: 90, y: 80 },
  { keys: KEYBOARD_ROWS[2] ?? [], x: 110, y: 144 },
  { keys: KEYBOARD_ROWS[3] ?? [], x: 142, y: 208 },
];
export const KEY_LAYOUT: KeyBox[] = [
  ...rows.flatMap((row) => row.keys.map((key, i) => ({ key, label: key, x: row.x + i * 64, y: row.y, w: 58, h: 54 }))),
  { key: "Backspace", label: "⌫", x: 848, y: 16, w: 136, h: 54 },
  { key: "Tab", label: "tab", x: 16, y: 80, w: 68, h: 54 },
  { key: "enter", label: "enter", x: 814, y: 144, w: 170, h: 54 },
  { key: "shift-left", label: "shift", x: 16, y: 208, w: 120, h: 54 },
  { key: "shift-right", label: "shift", x: 788, y: 208, w: 196, h: 54 },
  { key: " ", label: "space", x: 270, y: 272, w: 460, h: 54 },
];
export const SHIFTED_BY_KEY = Object.fromEntries(Object.entries(SHIFT_MAP).map(([symbol, key]) => [key, symbol]));
export const keyLabel = (key: string) => key === " " ? "space" : key === "\n" || key === "enter" ? "Enter" : key === "\t" ? "Tab" : key;
export const HOME_KEY_BY_FINGER: Record<string, string> = {
  "left pinky": "a", "left ring": "s", "left middle": "d", "left index": "f",
  "right index": "j", "right middle": "k", "right ring": "l", "right pinky": ";",
};