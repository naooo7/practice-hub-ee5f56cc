import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, Minus, Plus, X } from "lucide-react";
import { exams, getQuestions, type Question } from "@/data/prototype";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardGrid, SelectCard, StepHeader, fmtTime } from "./select-card";

type MaterialPick = { id: string; name: string };
type Config = { items: { material: MaterialPick; count: number }[]; total: number };
type Scope = { trail: string[]; materials: MaterialPick[] };

const FUND_SCOPES = ["Mathematics", "English", "Bahasa Indonesia", "Logika"];
const COUNT_OPTIONS = [5, 10, 15, 20, 30];

/** Drill: the most customizable mode. Pick any scope, then pick materials and per-material question counts. */
export function DrillMode() {
  const [examId, setExamId] = useState<string | null>(null);
  const [subtestId, setSubtestId] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope | null>(null);
  const [run, setRun] = useState<Config | null>(null);
  const [result, setResult] = useState<{ correct: number; total: number; answered: number; seconds: number; config: Config } | null>(null);

  const exam = exams.find((e) => e.id === examId);
  const subtest = exam?.subtests.find((s) => s.id === subtestId);

  if (result && scope)
    return <DrillResult {...result} trail={scope.trail} onAgain={() => { setResult(null); setRun(result.config); }} onConfigure={() => setResult(null)} />;

  if (run && scope)
    return <DrillRunner config={run} trail={scope.trail} onExit={() => setRun(null)} onDone={(r) => { setRun(null); setResult({ ...r, config: run }); }} />;

  if (scope) return <DrillConfig scope={scope} onBack={() => setScope(null)} onStart={setRun} />;

  if (examId === "fundamental")
    return (
      <>
        <StepHeader trail={["Drill", "Fundamental."]} title="Pilih subjek" onBack={() => setExamId(null)} />
        <CardGrid>
          {FUND_SCOPES.map((s) => (
            <SelectCard key={s} title={s} onClick={() => setScope({ trail: ["Drill", "Fundamental.", s], materials: [{ id: s, name: s }] })} />
          ))}
        </CardGrid>
      </>
    );

  if (!exam)
    return (
      <>
        <StepHeader trail={["Drill"]} title="Pilih kategori" caption="Latih persis apa yang kamu pilih." />
        <CardGrid cols={3}>
          {exams.map((e) => (
            <SelectCard key={e.id} title={e.name} description={e.caption} onClick={() => setExamId(e.id)} />
          ))}
          <SelectCard title="Fundamental." description="Kemampuan dasar" onClick={() => setExamId("fundamental")} />
        </CardGrid>
      </>
    );

  if (!subtest)
    return (
      <>
        <StepHeader trail={["Drill", exam.name]} title="Pilih subtes" onBack={() => setExamId(null)} />
        <CardGrid cols={3}>
          {exam.subtests.map((s) => (
            <SelectCard key={s.id} title={s.name} description={s.caption} onClick={() => setSubtestId(s.id)} />
          ))}
        </CardGrid>
      </>
    );

  return (
    <DrillConfig
      scope={{ trail: ["Drill", exam.name, subtest.name], materials: subtest.materials.map((m) => ({ id: m.id, name: m.name })) }}
      onBack={() => setSubtestId(null)}
      onStart={(c) => {
        setScope({ trail: ["Drill", exam.name, subtest.name], materials: subtest.materials.map((m) => ({ id: m.id, name: m.name })) });
        setRun(c);
      }}
    />
  );
}

function DrillConfig({ scope, onBack, onStart }: { scope: Scope; onBack: () => void; onStart: (c: Config) => void }) {
  const [selected, setSelected] = useState<Record<string, number>>(() =>
    Object.fromEntries(scope.materials.map((m) => [m.id, 10])),
  );

  const items = scope.materials.filter((m) => selected[m.id] !== undefined).map((m) => ({ material: m, count: selected[m.id]! }));
  const total = items.reduce((sum, it) => sum + it.count, 0);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = { ...s };
      if (next[id] !== undefined) delete next[id];
      else next[id] = 10;
      return next;
    });
  const setCount = (id: string, count: number) =>
    setSelected((s) => (s[id] === undefined ? s : { ...s, [id]: Math.max(1, Math.min(100, count)) }));

  return (
    <div className="max-w-2xl">
      <StepHeader trail={[...scope.trail, "Konfigurasi"]} title="Atur drill kamu" caption={scope.trail.slice(1).join(" · ")} onBack={onBack} />
      <div className="space-y-2.5">
        {scope.materials.map((m) => {
          const count = selected[m.id];
          const active = count !== undefined;
          return (
            <div
              key={m.id}
              className={cn(
                "rounded-lg border bg-surface px-4 py-3 shadow-soft transition-colors",
                active ? "border-primary" : "border-border",
              )}
            >
              <button type="button" onClick={() => toggle(m.id)} aria-pressed={active} className="tap flex w-full items-center gap-3 text-left">
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-background",
                  )}
                >
                  {active && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{m.name}</span>
                {active && <span className="shrink-0 text-[12.5px] tabular-nums text-muted-foreground">{count} soal</span>}
              </button>
              {active && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
                  {COUNT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(m.id, n)}
                      aria-pressed={count === n}
                      className={cn(
                        "tap min-h-9 rounded-lg border px-3 text-[13px] font-medium tabular-nums transition-colors",
                        count === n ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface hover:border-border-strong",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="ml-1 inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCount(m.id, count - 5)}
                      disabled={count <= 5}
                      aria-label={`Kurangi jumlah soal ${m.name}`}
                      className="tap grid size-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:border-border-strong disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCount(m.id, count + 5)}
                      disabled={count >= 100}
                      aria-label={`Tambah jumlah soal ${m.name}`}
                      className="tap grid size-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:border-border-strong disabled:opacity-40"
                    >
                      <Plus size={15} />
                    </button>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="sticky bottom-16 -mx-5 mt-4 bg-background px-5 pb-2 pt-3 md:static md:mx-0 md:px-0">
        <button
          type="button"
          disabled={total === 0}
          onClick={() => onStart({ items, total })}
          className="tap w-full rounded-lg bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground shadow-soft disabled:opacity-40"
        >
          Start Drill
        </button>
        <p className="mt-2 text-center text-[12.5px] text-muted-foreground">
          {total > 0 ? `${total} soal · ${items.length} materi` : "Pilih minimal satu materi"}
        </p>
      </div>
    </div>
  );
}

function buildSet(config: Config): Question[] {
  const base = getQuestions(99);
  const list = Array.from({ length: config.total }, (_, i) => ({ ...base[i % base.length]!, id: `d${i}` }));
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j]!, list[i]!];
  }
  return list;
}

function DrillRunner({ config, trail, onExit, onDone }: { config: Config; trail: string[]; onExit: () => void; onDone: (r: { correct: number; total: number; answered: number; seconds: number }) => void }) {
  const questions = useMemo(() => buildSet(config), [config]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const state = useRef({ correct: 0, answered: 0, elapsed: 0, done: false });
  state.current.correct = correct;
  state.current.elapsed = elapsed;

  const finish = (answered: number) => {
    if (state.current.done) return;
    state.current.done = true;
    onDone({ correct: state.current.correct, total: questions.length, answered, seconds: state.current.elapsed });
  };

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const q = questions[i]!;
  const answered = submitted;
  const remaining = questions.length - i - (answered ? 1 : 0);

  const pick = (k: string) => {
    if (answered) return;
    setPicked(k);
  };
  const submit = () => {
    if (!picked || submitted) return;
    setSubmitted(true);
    state.current.answered = i + 1;
    if (picked === q.answer) setCorrect((c) => c + 1);
  };
  const next = () => {
    if (i === questions.length - 1) return finish(i + 1);
    setI(i + 1);
    setPicked(null);
    setSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={onExit} aria-label="Keluar dari drill" className="tap grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted">
          <X size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] text-muted-foreground">{trail.slice(1).join(" · ")}</p>
          <p className="text-[13px] font-semibold tabular-nums">Soal {i + 1}/{questions.length} · {remaining} tersisa</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[13px] font-semibold tabular-nums">
          <Clock size={14} aria-hidden="true" /> {fmtTime(elapsed)}
        </span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((i + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      <p className="text-[17px] font-medium leading-7">{q.prompt}</p>
      <div className="mt-5 space-y-2">
        {q.choices.map((c) => {
          const tone = !answered ? c.key === picked ? "border-primary bg-primary-soft" : "border-border hover:border-border-strong" : c.key === q.answer ? "border-success bg-success/10" : c.key === picked ? "border-destructive bg-destructive/10" : "border-border opacity-50";
          return (
            <Button key={c.key} type="button" variant="outline" disabled={answered} aria-pressed={picked === c.key} onClick={() => pick(c.key)} className={cn("flex min-h-12 h-auto w-full items-center justify-start gap-3 whitespace-normal rounded-lg border-2 bg-surface px-4 py-3 text-left text-[15px] text-foreground", tone)}>
              <span className="w-5 shrink-0 font-semibold text-muted-foreground">{c.key}</span>
              <span className="flex-1">{c.text}</span>
              {answered && c.key === q.answer && <Check size={17} className="text-success" />}
            </Button>
          );
        })}
      </div>
      {!answered && <Button size="block" disabled={!picked} onClick={submit} className="mt-4">Answer</Button>}
      {answered && (
        <div className="mt-4" role="status">
          <p className={cn("flex items-center gap-2 text-[14px] font-semibold", picked === q.answer ? "text-success" : "text-destructive")}>
            {picked === q.answer ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}
            {picked === q.answer ? "Benar" : "Belum tepat"}
          </p>
          {picked !== q.answer && <p className="mt-2 text-[13.5px] font-medium">Jawaban benar: {q.answer}. {q.choices.find((choice) => choice.key === q.answer)?.text}</p>}
          <p className="text-[13.5px] leading-6 text-muted-foreground">{q.explanation.why}</p>
          <Button size="block" onClick={next} className="mt-3">{i === questions.length - 1 ? "Selesai" : "Continue"}</Button>
        </div>
      )}
    </div>
  );
}

function DrillResult({ correct, total, answered, seconds, config, trail, onAgain, onConfigure }: { correct: number; total: number; answered: number; seconds: number; config: Config; trail: string[]; onAgain: () => void; onConfigure: () => void }) {
  const acc = answered ? Math.round((correct / answered) * 100) : 0;
  const summary = acc >= 80 ? "Sangat baik — naikkan tingkat kesulitan berikutnya." : acc >= 60 ? "Cukup baik — ulangi untuk menguatkan pola." : "Perlu latihan lagi — coba jumlah soal lebih sedikit dan fokus.";
  return (
    <div className="mx-auto max-w-md py-4">
      <p className="label-xs">{trail.slice(1).join(" · ")}</p>
      <h2 className="mt-1 text-[24px] font-semibold tracking-tight">Drill selesai</h2>
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[
          ["Benar", `${correct}/${total}`],
          ["Akurasi", `${acc}%`],
          ["Dijawab", `${answered}/${total}`],
          ["Waktu", fmtTime(seconds)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-surface p-4 shadow-soft">
            <p className="label-xs">{k}</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-[14px]">{summary}</p>
      <p className="mt-2 text-[12.5px] text-muted-foreground">{config.items.map((it) => `${it.material.name} ${it.count}`).join(" · ")}</p>
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onConfigure} className="tap rounded-lg border border-border bg-surface py-3 text-[14px] font-semibold">Ubah konfigurasi</button>
        <button type="button" onClick={onAgain} className="tap rounded-lg bg-primary py-3 text-[14px] font-semibold text-primary-foreground">Ulangi drill</button>
      </div>
    </div>
  );
}
