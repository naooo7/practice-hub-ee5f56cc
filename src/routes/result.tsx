import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock3, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, summarize, useActivity } from "@/lib/activity";

export const Route = createFileRoute("/result")({
  validateSearch: (search: Record<string, unknown>) => ({
    correct: Number(search["correct"] ?? 0),
    total: Number(search["total"] ?? 0),
    material: (search["material"] as string) ?? "Practice",
    examId: (search["examId"] as string) ?? "skd",
    subtestId: (search["subtestId"] as string) ?? "tiu",
    sessionId: (search["sessionId"] as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Session result — Fundamental." },
      { name: "description", content: "Your score, accuracy and the questions worth revisiting." },
      { property: "og:title", content: "Session result — Fundamental." },
      { property: "og:description", content: "Your score and the questions worth revisiting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultScreen,
});

function performanceSummary(pct: number, total: number) {
  if (!total || pct <= 50) return { title: "Needs more review", body: "Review your mistakes, then try another focused set.", tone: "low" as const };
  if (pct <= 70) return { title: "Keep practicing", body: "Review the questions you missed to strengthen your understanding.", tone: "mid" as const };
  return { title: "Good progress", body: "You are building a strong foundation. Keep the momentum going!", tone: "high" as const };
}

function ResultScreen() {
  const search = Route.useSearch();
  const data = useActivity();
  const session = data?.sessions.find((s) => s.id === search.sessionId);
  const attempts = data?.attempts.filter((a) => a.sessionId === search.sessionId) ?? [];
  const stats = attempts.length ? summarize(attempts) : null;

  const correct = stats ? stats.correct : search.correct;
  const total = stats ? stats.total : search.total;
  const incorrect = Math.max(total - correct, 0);
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const time = session?.endedAt
    ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
    : (stats?.timeMs ?? 0);
  const summary = performanceSummary(pct, total);

  return (
    <div className="min-h-screen bg-background">
      <main className="screen-in mx-auto w-full max-w-[560px] px-5 pb-10 pt-7 sm:px-8 sm:pt-12">
        <header className="text-center">
          <p className="text-[15px] font-bold text-primary">Fundamental.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[12px] font-semibold text-success">
            <Check size={14} aria-hidden="true" /> Completed
          </div>
          <h1 className="mt-3 text-[24px] font-semibold">Session complete</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">{session?.materialName ?? search.material}</p>
        </header>

        <section className={`result-panel result-panel--${summary.tone} mt-6 rounded-xl border px-5 py-6 text-center sm:px-8 sm:py-8`} aria-label="Session score">
          <div className="relative mx-auto grid size-40 place-items-center">
            <svg viewBox="0 0 160 160" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
              <circle cx="80" cy="80" r="69" fill="none" stroke="currentColor" strokeWidth="10" className="opacity-20" />
              <circle cx="80" cy="80" r="69" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" pathLength="100" strokeDasharray={`${pct} 100`} className="transition-all duration-700" />
            </svg>
            <div className="flex flex-col items-center">
              <span className="tabular text-[40px] font-bold leading-none">{correct}<span className="text-[21px] font-medium opacity-70">/{total}</span></span>
              <span className="mt-1 text-[12px] font-semibold uppercase">Your score</span>
            </div>
          </div>
          <p className="mt-5 text-[20px] font-semibold">{summary.title}</p>
          <p className="mx-auto mt-1 max-w-[340px] text-[13px] leading-relaxed text-foreground/80">{summary.body}</p>
        </section>

        <section aria-label="Session statistics" className="mt-3 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <ResultStat icon={Check} label="Correct" value={String(correct)} tone="success" />
            <ResultStat icon={X} label="Incorrect" value={String(incorrect)} tone="destructive" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ResultStat icon={Check} label="Accuracy" value={`${pct}%`} tone="success" />
            <ResultStat icon={RotateCcw} label="Needs Review" value={`${incorrect} ${incorrect === 1 ? "question" : "questions"}`} />
            <ResultStat icon={Clock3} label="Time" value={data ? formatDuration(time) : "—"} />
          </div>
        </section>

        <div className="mt-6 grid gap-2.5">
          <Button asChild size="block">
            <Link to="/review">Review Mistakes <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild size="block" variant="outline">
            <Link to="/practice">Done</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

type ResultStatProps = {
  icon: typeof Check;
  label: string;
  value: string;
  tone?: "success" | "destructive";
};

function ResultStat({ icon: Icon, label, value, tone }: ResultStatProps) {
  const toneClass = tone === "success" ? "bg-success/[0.1] text-success" : tone === "destructive" ? "bg-destructive/[0.09] text-destructive" : "bg-primary-soft text-primary";
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface p-2.5 shadow-soft">
      <span className={`flex size-7 items-center justify-center rounded-md ${toneClass}`}>
        <Icon className="size-3.5" strokeWidth={2} />
      </span>
      <p className="mt-1.5 text-[11px] leading-tight text-muted-foreground">{label}</p>
      <p className="tabular mt-0.5 break-words text-[15px] font-semibold leading-tight">{value}</p>
    </div>
  );
}

