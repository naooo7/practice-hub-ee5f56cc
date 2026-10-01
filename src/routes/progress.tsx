import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Screen, PageHeader } from "@/components/app-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Fundamental." },
      { name: "description", content: "Questions answered, accuracy, study time and topic strength." },
      { property: "og:title", content: "Progress — Fundamental." },
      { property: "og:description", content: "Questions, accuracy, study time and topic strength." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressScreen,
});

type Period = "week" | "month" | "all";

type PeriodData = {
  /** Questions answered per bucket (day / few days / month). */
  activity: number[];
  correct: number;
  studyMinutes: number;
};

// Deterministic client-side mock data: current vs previous equivalent period.
const DATA: Record<Period, { current: PeriodData; previous: PeriodData; label: string }> = {
  week: {
    label: "vs last week",
    current: { activity: [22, 30, 26, 38, 34, 44, 54], correct: 193, studyMinutes: 384 },
    previous: { activity: [18, 26, 30, 28, 36, 40, 43], correct: 165, studyMinutes: 325 },
  },
  month: {
    label: "vs last month",
    current: { activity: [96, 120, 110, 142, 135, 160, 172, 188], correct: 840, studyMinutes: 1540 },
    previous: { activity: [102, 118, 126, 120, 138, 130, 150, 141], correct: 768, studyMinutes: 1610 },
  },
  all: {
    label: "vs previous period",
    current: { activity: [310, 420, 380, 520, 610, 580, 720, 790], correct: 3420, studyMinutes: 6120 },
    previous: { activity: [180, 240, 300, 280, 360, 410, 450, 500], correct: 2010, studyMinutes: 4380 },
  },
};

const TOPICS: { name: string; value: number }[] = [
  { name: "Penalaran Matematika", value: 42 },
  { name: "Peluang dan Logika", value: 20 },
  { name: "Pernyataan & Argumentasi", value: 15 },
  { name: "Figur Geometri", value: 10 },
  { name: "Lainnya", value: 13 },
];

const sum = (a: number[]) => a.reduce((s, n) => s + n, 0);
const accuracyOf = (p: PeriodData) => (sum(p.activity) ? (p.correct / sum(p.activity)) * 100 : 0);
const pctChange = (cur: number, prev: number) => (prev ? Math.round(((cur - prev) / prev) * 100) : 0);
const fmtTime = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

function ProgressScreen() {
  const [period, setPeriod] = useState<Period>("week");
  const { current, previous, label } = DATA[period];

  const total = sum(current.activity);
  const acc = accuracyOf(current);

  return (
    <Screen>
      <PageHeader title="Progress" />

      <div role="tablist" aria-label="Period" className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
        {(["week", "month", "all"] as const).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={cn(
              "tap h-8 rounded-full text-[13px] font-medium capitalize transition-colors",
              period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-[12px] text-muted-foreground">Total Questions</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="shrink-0">
            <p className="tabular text-[32px] font-semibold leading-none tracking-[-0.03em]">{total.toLocaleString()}</p>
            <Change value={pctChange(total, sum(previous.activity))} label={label} className="mt-2" />
          </div>
          <SmoothChart values={current.activity} className="h-16 w-full max-w-[60%]" />
        </div>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MetricCard
          title="Accuracy"
          value={`${Math.round(acc)}%`}
          change={pctChange(acc, accuracyOf(previous))}
          label={label}
        />
        <MetricCard
          title="Study Time"
          value={fmtTime(current.studyMinutes)}
          change={pctChange(current.studyMinutes, previous.studyMinutes)}
          label={label}
        />
      </div>

      <section className="mt-5">
        <h2 className="text-[15px] font-semibold">By Topic</h2>
        <ul className="mt-2 divide-y divide-border">
          {TOPICS.map((t) => (
            <li key={t.name} className="py-2.5">
              <div className="flex items-center justify-between text-[13px]">
                <span>{t.name}</span>
                <span className="tabular text-muted-foreground">{t.value}%</span>
              </div>
              <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary" style={{ width: `${t.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Screen>
  );
}

function MetricCard({ title, value, change, label }: { title: string; value: string; change: number; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">{title}</p>
        <p className="tabular mt-1 text-[22px] font-semibold leading-tight tracking-[-0.02em]">{value}</p>
        <Change value={change} label={label} className="mt-1" compact />
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
    </div>
  );
}

function Change({ value, label, className, compact }: { value: number; label: string; className?: string; compact?: boolean }) {
  const up = value >= 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <p className={cn("flex items-center gap-1 text-[12px]", className)}>
      <span className={cn("flex items-center gap-0.5 font-medium", value === 0 ? "text-muted-foreground" : up ? "text-success" : "text-destructive")}>
        <Icon className="size-3" strokeWidth={2.5} />
        {Math.abs(value)}%
      </span>
      {!compact && <span className="text-muted-foreground">{label}</span>}
    </p>
  );
}

/** Smooth Catmull-Rom → cubic Bézier line with soft area fill. */
function SmoothChart({ values, className }: { values: number[]; className?: string }) {
  const w = 200;
  const h = 64;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts: [number, number][] = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2),
  ]);
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1: number[] = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: number[] = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("text-primary", className)} aria-hidden>
      <defs>
        <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="url(#progress-fill)" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
