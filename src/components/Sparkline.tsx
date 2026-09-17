type Props = {
  values: number[];
  height?: number;
  label?: string;
};

/** Lightweight SVG trend line — no chart library, no layout shift. */
export default function Sparkline({ values, height = 120, label }: Props) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (clean.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
        style={{ height }}
      >
        Finish two sessions to see your trend
      </div>
    );
  }

  const max = Math.max(...clean);
  const min = Math.min(...clean);
  const span = max - min || 1;
  const width = 600;
  const points = clean.map((value, index) => {
    const x = (index / (clean.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 16) - 8;
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={label ?? "Trend"}
      >
        <polygon points={area} fill="var(--primary)" opacity="0.14" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>low {Math.round(min)}</span>
        <span>high {Math.round(max)}</span>
      </figcaption>
    </figure>
  );
}
