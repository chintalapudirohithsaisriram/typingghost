import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { pageHead } from "@/lib/seo";
import { DEFAULT_SETTINGS, updateSettings, useSettings, type Settings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () =>
    pageHead(
      "Settings — Theme, Sound, Motion, Text Size | TypingGhost",
      "Choose a theme, key sounds, animation level, text size and on-screen guides for TypingGhost.",
    ),
  component: SettingsPage,
});

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <span id={`seg-${label}`} className="font-medium">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`seg-${label}`}
        className="flex gap-1 rounded-xl border border-border bg-surface p-1"
      >
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              value === o.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  id,
  label,
  help,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  help: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <label htmlFor={id} className="min-w-0">
        <span className="block font-medium">{label}</span>
        <span className="block text-sm text-muted-foreground">{help}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SettingsPage() {
  const s = useSettings();
  const set = (patch: Partial<Settings>) => updateSettings(patch);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-primary">Settings</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Settings</h1>
      <p className="mt-3 text-muted-foreground">Saved on this device and applied instantly.</p>
      <div className="panel mt-8 divide-y divide-border px-5">
        <Segmented
          label="Theme"
          value={s.theme}
          onChange={(theme) => set({ theme })}
          options={[
            { value: "paper", label: "Paper" },
            { value: "sand", label: "Sand" },
            { value: "dark", label: "Night" },
          ]}
        />
        <Segmented
          label="Text size"
          value={s.fontScale}
          onChange={(fontScale) => set({ fontScale })}
          options={[
            { value: 90, label: "S" },
            { value: 100, label: "M" },
            { value: 115, label: "L" },
            { value: 130, label: "XL" },
          ]}
        />
        <Segmented
          label="Animations"
          value={s.animations}
          onChange={(animations) => set({ animations })}
          options={[
            { value: "system", label: "System" },
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ]}
        />
        <Toggle
          id="sound"
          label="Key sounds"
          help="A soft click per key and a low tone on mistakes."
          checked={s.sound}
          onChange={(sound) => set({ sound })}
        />
        <Toggle
          id="kbd"
          label="Keyboard guide in lessons"
          help="Highlights the next key."
          checked={s.showKeyboard}
          onChange={(showKeyboard) => set({ showKeyboard })}
        />
        <Toggle
          id="hands"
          label="Hand guide in lessons"
          help="Shows which finger to use. Visual only."
          checked={s.showHands}
          onChange={(showHands) => set({ showHands })}
        />
      </div>
      <Button variant="ghost" className="mt-4" onClick={() => set(DEFAULT_SETTINGS)}>
        Restore defaults
      </Button>
    </div>
  );
}
