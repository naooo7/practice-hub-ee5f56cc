import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Clock3, X } from "lucide-react";
import { endSession, recordAttempt, startSession } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { DesktopSidebar } from "@/components/app-shell";
import { findExam, findMaterial, findSubtest, getQuestions } from "@/data/prototype";
import { cn } from "@/lib/utils";

type DrillItem = { id: string; name: string; count: number };

export const Route = createFileRoute("/session/$examId/$subtestId/$materialId")({
  validateSearch: (search: Record<string, unknown>): { mode: string; difficulty?: string | undefined; timer?: number | undefined; items?: DrillItem[] | undefined } => ({
    mode: (search["mode"] as string) ?? "drill",
    difficulty: (search["difficulty"] as string | undefined) ?? undefined,
    timer: search["timer"] ? Number(search["timer"]) : undefined,
    items: Array.isArray(search["items"]) ? (search["items"] as DrillItem[]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Question — Fundamental." },
      { name: "description", content: "One question at a time, with a clear explanation." },
      { property: "og:title", content: "Question — Fundamental." },
      { property: "og:description", content: "One question at a time, with a clear explanation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SessionScreen,
});

function SessionScreen() {
  const { examId, subtestId, materialId } = Route.useParams();
  const { mode, items, timer: timerSec = 0 } = Route.useSearch();
  const navigate = useNavigate();
  const exam = findExam(examId);
  const subtest = findSubtest(examId, subtestId);
  const found = findMaterial(examId, subtestId, materialId);
  const material = found ?? (items?.length ? { name: items.map((i) => i.name).join(", ") } : undefined);
  const questions = useMemo(() => {
    if (!items?.length) return getQuestions();
    const base = getQuestions(99);
    let n = 0;
    return items.flatMap((it) =>
      Array.from({ length: it.count }, () => {
        const b = base[n % base.length]!;
        return { ...b, id: `${it.id}-${n++}`, materialName: it.name };
      }),
    );
  }, [items]);
  const [left, setLeft] = useState(timerSec);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const sessionId = useRef<string | null>(null);
  const questionStart = useRef<number>(0);
  const sessionStart = useRef<number>(0);
  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!material) return;
    sessionId.current = startSession({ examId, subtestId, materialId, materialName: material.name, mode });
    questionStart.current = Date.now();
    sessionStart.current = Date.now();
    const tick = window.setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart.current) / 1000)), 1000);
    return () => window.clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, subtestId, materialId]);

  useEffect(() => {
    if (!timerSec || revealed) return;
    if (left <= 0) {
      timeUp();
      return;
    }
    const t = window.setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, revealed, timerSec]);

  if (!material) throw notFound();

  const q = questions[index];
  if (!q) throw notFound();
  const isCorrect = selected === q.answer;
  const last = index === questions.length - 1;
  const correctChoice = q.choices.find((choice) => choice.key === q.answer);
  const showFeedback = mode !== "latihan";
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  function submit(pick: string | null = selected) {
    if (!q || !pick || revealed || !sessionId.current) return;
    const selected = pick;
    const correct = selected === q.answer;
    const nextCorrect = correctCount + (correct ? 1 : 0);
    if (correct) setCorrectCount(nextCorrect);
    recordAttempt({
      sessionId: sessionId.current,
      examId,
      subtestId,
      materialId,
      materialName: (q as { materialName?: string }).materialName ?? material!.name,
      questionId: q.id,
      selected,
      correct,
      // cap idle time per question at 10 min
      durationMs: Math.min(Date.now() - questionStart.current, 10 * 60_000),
    });
    if (!showFeedback) {
      advance(nextCorrect);
      return;
    }
    setRevealed(true);
    requestAnimationFrame(() => {
      explanationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function timeUp() {
    if (!q || revealed || !sessionId.current) return;
    recordAttempt({
      sessionId: sessionId.current, examId, subtestId, materialId,
      materialName: (q as { materialName?: string }).materialName ?? material!.name,
      questionId: q.id, selected: "", correct: false, durationMs: timerSec * 1000,
    });
    advance(correctCount);
  }

  function advance(score: number) {
    if (last) {
      if (sessionId.current) endSession(sessionId.current);
      navigate({
        to: "/result",
        search: {
          correct: score,
          total: questions.length,
          material: material!.name,
          examId,
          subtestId,
          sessionId: sessionId.current ?? "",
        },
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setLeft(timerSec);
    questionStart.current = Date.now();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function next() {
    advance(correctCount);
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <div className="md:pl-56">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-5 pt-4 sm:px-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-1">
          <Link
            {...(items?.length || !found
              ? { to: "/practice/mode/$mode" as const, params: { mode: "drill" } }
              : { to: "/practice/$examId/$subtestId/$materialId" as const, params: { examId, subtestId, materialId } })}
            className="tap flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            aria-label="Leave session"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <span className="tabular text-center text-[14px] font-semibold" aria-label={`Question ${index + 1} of ${questions.length}`}>
            {index + 1}/{questions.length}
          </span>
          <span className="tabular flex items-center justify-end gap-1.5 text-[13px] font-medium text-muted-foreground" aria-label={timerSec ? `${left} seconds left` : `Elapsed time ${time}`}>
            <Clock3 size={15} aria-hidden="true" /> {timerSec ? `${left}s` : time}
          </span>
        </header>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Question progress" aria-valuenow={index + 1} aria-valuemin={0} aria-valuemax={questions.length}>
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>

        <main key={q.id} className="screen-in flex-1 pt-7">
          <div>
            <p className="label-xs">{exam?.name ?? examId} · {subtest?.name ?? subtestId}</p>
            <h1 className="mt-4 text-[19px] font-semibold leading-[1.5]">{q.prompt}</h1>

            <div className="mt-7 grid gap-2.5" role="group" aria-label="Answer choices">
              {q.choices.map((c) => {
                const chosen = selected === c.key;
                const isAnswer = c.key === q.answer;
                const tone = !revealed
                  ? chosen
                    ? "border-primary bg-primary-soft hover:bg-primary-soft"
                    : "border-border bg-surface hover:border-border-strong hover:bg-surface"
                  : isAnswer
                    ? "border-success bg-success/10 hover:bg-success/10"
                    : chosen
                      ? "border-destructive bg-destructive/10 hover:bg-destructive/10"
                      : "border-border bg-surface opacity-50";
                return (
                  <Button
                    key={c.key}
                    type="button"
                    variant="outline"
                    aria-pressed={chosen}
                    onClick={() => { if (revealed) return; setSelected(c.key); if (mode === "drill") submit(c.key); }}
                    className={cn(
                      "flex min-h-12 h-auto w-full items-center justify-start gap-2.5 whitespace-normal rounded-lg border px-3.5 py-2.5 text-left text-foreground shadow-none",
                      tone,
                    )}
                  >
                    <span className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border text-[13px] font-semibold",
                      revealed
                        ? isAnswer
                          ? "border-success bg-success/10 text-success"
                          : chosen
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-border bg-background text-muted-foreground"
                        : chosen
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground",
                    )}>
                      {c.key}
                    </span>
                    <span className="min-w-0 flex-1 text-[14px] leading-[1.5]">{c.text}</span>
                    {!revealed && chosen && <Check className="shrink-0 text-primary" size={17} aria-hidden="true" />}
                    {revealed && isAnswer && <Check className="shrink-0 text-success" size={17} aria-hidden="true" />}
                    {revealed && !isAnswer && chosen && <X className="shrink-0 text-destructive" size={17} aria-hidden="true" />}
                  </Button>
                );
              })}
            </div>

            {revealed && (
              <div ref={explanationRef} className="mt-8" role="status">
                <div className="flex items-center gap-2.5">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    {isCorrect ? <Check size={19} strokeWidth={2.5} aria-hidden="true" /> : <X size={19} strokeWidth={2.5} aria-hidden="true" />}
                  </span>
                  <span className={cn("text-[13px] font-semibold", isCorrect ? "text-success" : "text-destructive")}>{isCorrect ? "Correct" : "Incorrect"}</span>
                </div>
                <h2 className="mt-5 text-[23px] font-semibold leading-[1.3]">{isCorrect ? "Jawaban kamu benar!" : "Jawaban kamu belum tepat."}</h2>
                <div className="mt-5 flex items-center gap-3 rounded-lg border border-success/40 bg-success/5 px-4 py-3.5">
                  <Check className="shrink-0 text-success" size={18} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-muted-foreground">Correct answer</p>
                    <p className="mt-0.5 text-[14px] font-semibold leading-snug">{q.answer}. {correctChoice?.text}</p>
                  </div>
                </div>
                <section className="mt-8 border-t border-border pt-6" aria-labelledby="why-heading">
                  <h3 id="why-heading" className="text-[18px] font-semibold">Why?</h3>
                  <p className="mt-3 text-[15px] leading-[1.65] text-foreground">{q.explanation.why}</p>
                  {q.explanation.steps.length > 0 && (
                    <ol className="mt-6 space-y-5">
                      {q.explanation.steps.map((step, i) => (
                        <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-semibold text-primary">{i + 1}</span>
                          <div className="min-w-0 pt-0.5">
                            <p className="text-[13px] font-semibold">Step {i + 1}</p>
                            <p className="mt-1 text-[14px] leading-[1.6] text-muted-foreground">{step}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>

        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-border bg-background/95 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          {revealed ? (
            <Button size="block" onClick={next}>
              {last ? "See result" : "Next question"}
            </Button>
          ) : (
            <Button size="block" onClick={() => submit()} disabled={!selected}>
              Answer
            </Button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

