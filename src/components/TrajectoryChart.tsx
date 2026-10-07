type Point = {
  /** Short x-axis label, e.g. "Oct 5" */
  label: string;
  wpm: number;
  accuracy: number;
  /** Full description for the accessible tooltip/title. */
  title: string;
};

type Props = { points: Point[] };

const W = 640;
const H = 240;
const PAD = { left: 44, right: 52, top: 14, bottom: 26 };

const niceBounds = (min: number, max: number) => {
  const lo = Math.max(0, Math.floor(min - 5));
  const hi = Math.ceil(max + 5);
  return hi - lo < 10 ? [Math.max(0, hi - 10), hi] : [lo, hi];
};

const line = (coords: [number, number][]) =>
  coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/** Dual-axis SVG trajectory of net WPM (solid) and accuracy (dashed) across sessions. */
export default function TrajectoryChart({ points }: Props) {
  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        Finish at least two sessions to see your trajectory.
      </div>
    );
  }

  const wpmValues = points.map((p) => Math.max(0, p.wpm));
  const accValues = points.map((p) => Math.min(100, Math.max(0, p.accuracy)));
  const [wpmLo, wpmHi] = niceBounds(Math.min(...wpmValues), Math.max(...wpmValues));
  const accLo = Math.min(85, Math.max(0, Math.floor(Math.min(...accValues) - 6)));
  const accHi = 100;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
  const yW = (v: number) => PAD.top + innerH - ((v - wpmLo) / (wpmHi - wpmLo || 1)) * innerH;
  const yA = (v: number) => PAD.top + innerH - ((v - accLo) / (accHi - accLo || 1)) * innerH;

  const wpmCoords = wpmValues.map((v, i) => [x(i), yW(v)] as [number, number]);
  const accCoords = accValues.map((v, i) => [x(i), yA(v)] as [number, number]);
  const gridWpm = [wpmHi, (wpmHi + wpmLo) / 2, wpmLo];
  const gridAcc = [accHi, (accHi + accLo) / 2, accLo];
  const step = Math.max(1, Math.ceil(points.length / 6));

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Net WPM and accuracy across your last ${points.length} sessions`}
      >
        {gridWpm.map((v) => (
          <g key={`w${v}`}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yW(v)}
              y2={yW(v)}
              className="stroke-border"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 6}
              y={yW(v) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[10px] tabular-nums"
            >
              {Math.round(v)}
            </text>
          </g>
        ))}
        {gridAcc.map((v) => (
          <text
            key={`a${v}`}
            x={W - PAD.right + 6}
            y={yA(v) + 3}
            className="fill-muted-foreground text-[10px] tabular-nums"
          >
            {Math.round(v)}%
          </text>
        ))}
        <path
          d={line(accCoords)}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          opacity="0.7"
        />
        <path d={line(wpmCoords)} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={yA(p.accuracy)}
              r="2.5"
              className="fill-muted-foreground"
              opacity="0.7"
            >
              <title>{p.title}</title>
            </circle>
            <circle cx={x(i)} cy={yW(p.wpm)} r="3.5" className="fill-primary">
              <title>{p.title}</title>
            </circle>
          </g>
        ))}
        {points.map((p, i) =>
          i % step === 0 || i === points.length - 1 ? (
            <text
              key={`x${i}`}
              x={x(i)}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
              className="fill-muted-foreground text-[10px]"
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 rounded bg-primary" aria-hidden="true" />
          Net WPM
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-5 rounded opacity-70"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--muted-foreground) 0 4px, transparent 4px 8px)",
            }}
            aria-hidden="true"
          />
          Accuracy
        </span>
      </figcaption>
    </figure>
  );
}
