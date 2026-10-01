import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, FileText } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { findMaterial, todaysFocus, user } from "@/data/prototype";
import { dayKey, formatDuration, needsReview, streak, summarize, useActivity } from "@/lib/activity";
import { useInstitution } from "@/lib/institution";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fundamental. — Your daily question drill" },
      {
        name: "description",
        content:
          "Fundamental. is a calm, focused drilling app for SKD, UTBK, TPA and more. Pick a topic, answer questions, understand every explanation.",
      },
      { property: "og:title", content: "Fundamental. — Your daily question drill" },
      {
        property: "og:description",
        content: "Less interface. More learning. A serious study tool that gets out of your way.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const institution = useInstitution();
  const data = useActivity();
  const attempts = data?.attempts ?? [];
  const reviewCount = needsReview(attempts).length;
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const key = dayKey(date);
    return { key, label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], count: attempts.filter((a) => dayKey(new Date(a.answeredAt)) === key).length, isToday: key === dayKey(today) };
  });
  const ws = summarize(attempts.filter((a) => weekDays.some((d) => d.key === dayKey(new Date(a.answeredAt)))));
  const maxDayCount = Math.max(...weekDays.map((d) => d.count), 1);
  const days = streak(attempts);
  const lastSession = data?.sessions.at(-1);
  const focusMaterial = lastSession
    ? findMaterial(lastSession.examId, lastSession.subtestId, lastSession.materialId)
    : undefined;
  const focus = lastSession && focusMaterial
    ? { examId: lastSession.examId, subtestId: lastSession.subtestId, materialId: lastSession.materialId, name: focusMaterial.name }
    : todaysFocus;
  const qCount = focusMaterial?.questionCount ?? todaysFocus.questions;
  const qMinutes = focusMaterial?.minutes ?? todaysFocus.minutes;
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Screen>
      <header className="mb-4 flex items-start justify-between">
        <p className="relative inline-block text-[19px] font-bold leading-none tracking-[-0.03em]">
          Fundamental<span className="text-primary">.</span>
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 left-0 h-[3px] w-full -rotate-1 rounded-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/5"
          />
        </p>
        <button type="button" aria-label="Notifications" className="relative mt-0.5 text-foreground/80">
          <Bell className="size-[22px]" strokeWidth={1.6} />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive" />
        </button>
      </header>

      <div className="mb-4">
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.025em]" suppressHydrationWarning>
          {greeting}, {user.name}.
        </h1>
        <p className="mt-1 text-[14px] leading-snug text-muted-foreground">
          Preparing for <span className="font-medium text-foreground/80">{institution?.name ?? "your target institution"}</span>
        </p>
      </div>

      <section aria-label="Streak" className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-soft">
        <span role="img" aria-label="Streak" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warm-soft text-[16px] leading-none">
          🔥
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">{days ? `${days} day${days === 1 ? "" : "s"} streak` : "No streak yet"}</p>
          <p className="text-[12px] text-muted-foreground">{days ? "Nice consistency." : "Start today."}</p>
        </div>
        <span className="h-8 w-px bg-border" />
        <Link to="/progress" className="flex items-center gap-1 pl-1 text-[12px] font-medium text-primary">
          Keep it going! <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </section>

      <section aria-label="This Week" className="mt-3.5 rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.01em]">This Week</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {ws.total ? `${ws.total} questions · ${ws.accuracy}% · ${formatDuration(ws.timeMs)}` : "No activity yet"}
            </p>
          </div>
          <Link to="/progress" className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-primary">
            View details <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="mt-4 grid h-[116px] grid-cols-7 gap-2" role="img" aria-label={`Weekly activity: ${ws.total} questions answered`}>
          {weekDays.map((d) => {
            const fill = d.count ? Math.max(24, Math.round((d.count / maxDayCount) * 100)) : 0;
            return (
              <div key={d.key} className="flex min-w-0 flex-col items-center">
                <div
                  className={`relative h-[82px] w-full max-w-8 overflow-hidden rounded-md border ${d.isToday ? "border-primary/40 ring-2 ring-primary/10" : "border-border"} bg-muted/55`}
                  aria-label={`${d.label}: ${d.count} question${d.count === 1 ? "" : "s"}`}
                >
                  <div className="absolute inset-x-0 bottom-0 bg-primary/15 transition-[height,background-color] duration-500" style={{ height: `${fill}%` }} />
                  {d.count > 0 ? (
                    <div className="absolute inset-x-0 bottom-0 bg-primary/70 transition-[height] duration-500" style={{ height: `${Math.max(12, fill - 10)}%` }} />
                  ) : null}
                  <span className={`tabular absolute inset-x-0 top-2 text-center text-[10px] font-semibold ${d.count ? "text-foreground/75" : "text-muted-foreground/45"}`}>
                    {d.count || "·"}
                  </span>
                </div>
                <span className={`mt-2 text-[11px] ${d.isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <Link to="/review" className="tap mt-3.5 flex items-center gap-3.5 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-soft">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
          <FileText className="size-[18px] text-primary" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">Needs Review</p>
          <p className="text-[12.5px] text-muted-foreground">
            {reviewCount ? `${reviewCount} topic${reviewCount === 1 ? "" : "s"} need${reviewCount === 1 ? "s" : ""} another look` : "All caught up"}
          </p>
          {!reviewCount && <p className="mt-0.5 text-[11.5px] text-muted-foreground/80">No items yet</p>}
        </div>
        <ChevronRight className="size-4 text-muted-foreground/70" />
      </Link>

      <section className="relative mt-3.5 overflow-hidden rounded-2xl border border-primary/15 bg-primary-soft/50 p-4 shadow-soft">
        <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 size-44 rotate-12 rounded-[45%] bg-primary/5" />
        <div className="relative flex items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground">
            √x
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-muted-foreground">{lastSession ? "Continue" : "Suggested start"}</p>
            <p className="truncate text-[15px] font-medium tracking-[-0.01em]">{focus.name}</p>
            <p className="tabular text-[12px] text-muted-foreground">{qCount} questions · ~{qMinutes} min</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <Button asChild size="block" className="relative mt-3.5">
          <Link
            to="/practice/mode/$mode"
            params={{ mode: "drill" }}
          >
            {lastSession ? "Continue" : "Start"} <ChevronRight className="size-4" />
          </Link>
        </Button>
      </section>
    </Screen>
  );
}

