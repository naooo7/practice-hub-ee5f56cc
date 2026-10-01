import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Flag } from "lucide-react";
import { exams, getQuestions } from "@/data/prototype";
import { cn } from "@/lib/utils";
import { CardGrid, SelectCard, StepHeader, fmtTime } from "./select-card";

type Pkg = { id: string; name: string; questions: number; minutes: number; composition: string };

const packages = (examName: string): Pkg[] => [
  { id: "01", name: `${examName} Try Out #01`, questions: 10, minutes: 15, composition: "Komposisi resmi · paket pembuka" },
  { id: "02", name: `${examName} Try Out #02`, questions: 15, minutes: 20, composition: "Komposisi resmi · tingkat sedang" },
  { id: "03", name: `${examName} Try Out #03`, questions: 20, minutes: 30, composition: "Komposisi resmi · simulasi penuh" },
];

/** Try Out: fixed-package exam simulation. No feedback until submission. */
export function TryOutMode() {
  const [examId, setExamId] = useState<string | null>(null);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [phase, setPhase] = useState<"intro" | "exam" | "result">("intro");
  const [result, setResult] = useState<{ correct: number; answered: number; seconds: number } | null>(null);
  const exam = exams.find((e) => e.id === examId);

  if (!exam)
    return (
      <>
        <StepHeader trail={["Try Out"]} title="Pilih ujian" caption="Seberapa siap kamu? Simulasikan ujian sebenarnya." />
        <CardGrid cols={3}>
          {exams.map((e) => <SelectCard key={e.id} title={e.name} description={e.caption} meta="3 paket" onClick={() => setExamId(e.id)} />)}
        </CardGrid>
      </>
    );

  if (!pkg)
    return (
      <>
        <StepHeader trail={["Try Out", exam.name]} title="Pilih paket" onBack={() => setExamId(null)} />
        <CardGrid cols={3}>
          {packages(exam.name).map((p) => <SelectCard key={p.id} title={p.name} description={`${p.questions} soal · ${p.minutes} menit`} onClick={() => { setPkg(p); setPhase("intro"); }} />)}
        </CardGrid>
      </>
    );

  if (phase === "exam") return <ExamRunner pkg={pkg} onSubmit={(r) => { setResult(r); setPhase("result"); }} />;

  if (phase === "result" && result) {
    const score = Math.round((result.correct / pkg.questions) * 100);
    return (
      <div className="mx-auto max-w-md py-4">
        <p className="label-xs">{pkg.name}</p>
        <h2 className="mt-1 text-[24px] font-semibold tracking-tight">Hasil simulasi</h2>
        <div className="mt-5 rounded-lg border border-border bg-surface p-5 text-center shadow-soft">
          <p className="label-xs">Skor</p>
          <p className="mt-1 text-[44px] font-bold leading-none tabular-nums">{score}</p>
          <p className="mt-2 text-[13px] text-muted-foreground">{score >= 70 ? "Siap — pertahankan ritme ini." : score >= 50 ? "Hampir siap — perkuat materi yang lemah." : "Belum siap — fokus latihan dulu."}</p>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2.5 text-center">
          {[["Benar", `${result.correct}/${pkg.questions}`], ["Dijawab", `${result.answered}`], ["Waktu", fmtTime(result.seconds)]].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-surface p-3"><p className="label-xs">{k}</p><p className="mt-1 text-[17px] font-bold tabular-nums">{v}</p></div>
          ))}
        </div>
        <button type="button" onClick={() => setPkg(null)} className="tap mt-5 w-full rounded-lg bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground">Kembali ke paket</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <StepHeader trail={["Try Out", exam.name, pkg.name]} title={pkg.name} caption={pkg.composition} onBack={() => setPkg(null)} />
      <div className="rounded-lg border border-border bg-surface p-4 shadow-soft">
        <div className="grid grid-cols-2 gap-3 text-[14px]">
          <div><p className="label-xs">Soal</p><p className="mt-1 font-semibold tabular-nums">{pkg.questions}</p></div>
          <div><p className="label-xs">Waktu</p><p className="mt-1 font-semibold tabular-nums">{pkg.minutes} menit</p></div>
        </div>
        <ul className="mt-4 space-y-1.5 text-[13.5px] text-muted-foreground">
          <li>• Tidak ada pembahasan selama ujian.</li>
          <li>• Kamu bisa berpindah antar soal dan menandai soal.</li>
          <li>• Ujian otomatis berakhir saat waktu habis.</li>
        </ul>
      </div>
      <button type="button" onClick={() => setPhase("exam")} className="tap mt-4 w-full rounded-lg bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground">Mulai simulasi</button>
    </div>
  );
}

function ExamRunner({ pkg, onSubmit }: { pkg: Pkg; onSubmit: (r: { correct: number; answered: number; seconds: number }) => void }) {
  const questions = useMemo(() => {
    const base = getQuestions(99);
    return Array.from({ length: pkg.questions }, (_, i) => base[i % base.length]!);
  }, [pkg]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [elapsed, setElapsed] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const limit = pkg.minutes * 60;
  const ref = useRef({ answers, elapsed, done: false });
  ref.current.answers = answers;
  ref.current.elapsed = elapsed;

  const submit = () => {
    if (ref.current.done) return;
    ref.current.done = true;
    const a = ref.current.answers;
    onSubmit({ correct: questions.filter((q, k) => a[k] === q.answer).length, answered: Object.keys(a).length, seconds: ref.current.elapsed });
  };

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (elapsed >= limit) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  const q = questions[i]!;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] text-muted-foreground">{pkg.name}</p>
          <p className="text-[13px] font-semibold tabular-nums">Soal {i + 1} dari {questions.length}</p>
        </div>
        <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold tabular-nums", limit - elapsed <= 60 ? "border-destructive text-destructive" : "border-border")}>
          <Clock size={14} aria-hidden="true" /> {fmtTime(Math.max(0, limit - elapsed))}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5" aria-label="Navigasi soal">
        {questions.map((_, k) => (
          <button key={k} type="button" onClick={() => setI(k)} aria-label={`Soal ${k + 1}`} aria-current={k === i}
            className={cn("tap size-8 rounded-md border text-[12px] font-semibold tabular-nums",
              k === i ? "border-primary text-primary" : answers[k] ? "border-transparent bg-primary-soft text-primary" : "border-border text-muted-foreground",
              flags[k] && "ring-2 ring-warm")}>
            {k + 1}
          </button>
        ))}
      </div>

      <p className="text-[17px] font-medium leading-7">{q.prompt}</p>
      <div className="mt-5 space-y-2">
        {q.choices.map((c) => (
          <button key={c.key} type="button" onClick={() => setAnswers({ ...answers, [i]: c.key })}
            className={cn("tap flex min-h-12 w-full items-center gap-3 rounded-lg border-2 bg-surface px-4 py-3 text-left text-[15px]",
              answers[i] === c.key ? "border-primary bg-primary-soft" : "border-border hover:border-border-strong")}>
            <span className="w-5 shrink-0 font-semibold text-muted-foreground">{c.key}</span>
            <span>{c.text}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="tap rounded-lg border border-border bg-surface px-4 py-3 text-[14px] font-semibold disabled:opacity-40">Sebelumnya</button>
        <button type="button" onClick={() => setFlags({ ...flags, [i]: !flags[i] })} aria-pressed={!!flags[i]} className={cn("tap grid size-12 place-items-center rounded-lg border", flags[i] ? "border-warm text-warm" : "border-border text-muted-foreground")} aria-label="Tandai soal">
          <Flag size={16} />
        </button>
        {i < questions.length - 1 ? (
          <button type="button" onClick={() => setI(i + 1)} className="tap flex-1 rounded-lg bg-primary py-3 text-[14px] font-semibold text-primary-foreground">Berikutnya</button>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="tap flex-1 rounded-lg bg-primary py-3 text-[14px] font-semibold text-primary-foreground">Kumpulkan</button>
        )}
      </div>
      {i < questions.length - 1 && (
        <button type="button" onClick={() => setConfirm(true)} className="tap mt-3 w-full text-center text-[13px] font-medium text-muted-foreground hover:text-foreground">Selesai & kumpulkan</button>
      )}
      {confirm && (
        <div role="dialog" aria-modal="true" className="mt-4 rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p className="text-[15px] font-semibold">Kumpulkan jawaban?</p>
          <p className="mt-1 text-[13.5px] text-muted-foreground">{answeredCount} dari {questions.length} soal terjawab. Hasil muncul setelah dikumpulkan.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirm(false)} className="tap rounded-lg border border-border py-2.5 text-[14px] font-semibold">Kembali</button>
            <button type="button" onClick={submit} className="tap rounded-lg bg-primary py-2.5 text-[14px] font-semibold text-primary-foreground">Kumpulkan</button>
          </div>
        </div>
      )}
    </div>
  );
}

