import { useEffect, useSyncExternalStore } from "react";
import { storage } from "./storage";

export type Settings = {
  theme: "paper" | "sand" | "dark";
  sound: boolean;
  animations: "system" | "on" | "off";
  fontScale: 90 | 100 | 115 | 130;
  showKeyboard: boolean;
  showHands: boolean;
};

const KEY = "typenova.settings.v1";
export const DEFAULT_SETTINGS: Settings = {
  theme: "paper",
  sound: false,
  animations: "system",
  fontScale: 100,
  showKeyboard: true,
  showHands: true,
};

let current: Settings = DEFAULT_SETTINGS;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  current = { ...DEFAULT_SETTINGS, ...(storage.read<Partial<Settings>>(KEY) ?? {}) };
}

export function updateSettings(patch: Partial<Settings>) {
  ensureLoaded();
  current = { ...current, ...patch };
  storage.write(KEY, current);
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useSettings(): Settings {
  return useSyncExternalStore(
    subscribe,
    () => {
      ensureLoaded();
      return current;
    },
    () => DEFAULT_SETTINGS,
  );
}

/** Applies theme, font scale and motion preference to <html>. */
export function useApplySettings() {
  const settings = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    root.classList.toggle("theme-sand", settings.theme === "sand");
    root.style.fontSize = `${settings.fontScale}%`;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.toggle(
      "reduce-motion",
      settings.animations === "off" || (settings.animations === "system" && prefersReduced),
    );
  }, [settings]);
}

let audio: AudioContext | null = null;
/** Short, soft click. Only plays when the user has enabled sound. */
export function playKeySound(wrong: boolean) {
  if (typeof window === "undefined" || !current.sound) return;
  try {
    audio ??= new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = wrong ? 180 : 620;
    osc.type = wrong ? "square" : "sine";
    gain.gain.setValueAtTime(0.04, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.06);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.07);
  } catch {
    /* audio unavailable */
  }
}
