import { useState, useSyncExternalStore } from "react";
import { ArrowLeft, BookOpen, Calculator, Check, Languages, Lock, Puzzle, Trophy, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CardGrid, SelectCard } from "@/components/practice/select-card";

/* ---------- Mock data (prototype only) ---------- */

type SubjectId = "math" | "english" | "indonesia" | "logic";
type Level = { name: string; lessons: string[] };
type Subject = { id: SubjectId; name: string; description: string; basePct: number; levels: Level[] };

const FINAL = "Final Challenge";

const subjects: Subject[] = [
  {
    id: "math", name: "Mathematics", description: "Arithmetic, fractions, percentages, ratios, algebra", basePct: 72,
    levels: [
      { name: "Level 1", lessons: ["Addition", "Subtraction", "Multiplication", "Division", FINAL] },
      { name: "Level 2", lessons: ["Fractions", "Decimals", "Percentages", "Ratios", FINAL] },
      { name: "Level 3", lessons: ["Powers", "Roots", "Algebra", "Equations", FINAL] },
    ],
  },
  {
    id: "english", name: "English", description: "Vocabulary, grammar, sentence structure, reading", basePct: 45,
    levels: [
      { name: "Level 1", lessons: ["Basic Vocabulary", "Common Words", "Sentence Structure", "Basic Grammar", FINAL] },
      { name: "Level 2", lessons: ["Tenses", "Prepositions", "Context Clues", "Reading", FINAL] },
    ],
  },
  {
    id: "indonesia", name: "Bahasa Indonesia", description: "EYD, SPOK, vocabulary, punctuation, effective sentences", basePct: 28,
    levels: [
      { name: "Level 1", lessons: ["Kata Baku", "EYD", "Tanda Baca", "SPOK", FINAL] },
      { name: "Level 2", lessons: ["Kalimat Efektif", "Sinonim", "Antonim", "Struktur Kalimat", FINAL] },
    ],
  },
  {
    id: "logic", name: "Logika", description: "Patterns, sequences, classification, analogy", basePct: 12,
    levels: [
      { name: "Level 1", lessons: ["Classification", "Sequences", "Patterns", "Analogy", FINAL] },
      { name: "Level 2", lessons: ["Number Patterns", "Logical Relationships", "Verbal Logic", "Mixed Logic", FINAL] },
    ],
  },
];

type Question = { q: string; options: string[]; answer: number; why: string };

const questionBank: Record<SubjectId, Question[]> = {
  math: [
    { q: "What is 7 + 8?", options: ["14", "15", "16", "17"], answer: 1, why: "7 + 8 = 15. Split 8 into 3 + 5: 7 + 3 = 10, then 10 + 5 = 15." },
    { q: "What is 6 × 7?", options: ["36", "42", "48", "49"], answer: 1, why: "6 × 7 = 42. Think of 6 × 5 = 30 plus 6 × 2 = 12." },
    { q: "What is 45 − 18?", options: ["27", "23", "33", "37"], answer: 0, why: "45 − 20 = 25, then add back 2: 27." },
    { q: "What is 56 ÷ 8?", options: ["6", "7", "8", "9"], answer: 1, why: "8 × 7 = 56, so 56 ÷ 8 = 7." },
    { q: "What is 25% of 80?", options: ["15", "20", "25", "40"], answer: 1, why: "25% is one quarter: 80 ÷ 4 = 20." },
  ],
  english: [
    { q: "Choose the correct sentence.", options: ["She go to school.", "She goes to school.", "She going school.", "She gone to school."], answer: 1, why: "Third-person singular in the present simple takes -s: goes." },
    { q: "Synonym of \"rapid\"?", options: ["Slow", "Quick", "Late", "Weak"], answer: 1, why: "Rapid means fast or quick." },
    { q: "\"I ___ a book yesterday.\"", options: ["read", "reads", "reading", "am read"], answer: 0, why: "Past tense of read is spelled read (pronounced \"red\")." },
    { q: "Opposite of \"ancient\"?", options: ["Old", "Modern", "Huge", "Quiet"], answer: 1, why: "Ancient means very old; modern is its opposite." },
    { q: "\"The keys are ___ the table.\"", options: ["in", "on", "at", "to"], answer: 1, why: "Objects resting on a surface use on." },
  ],
  indonesia: [
    { q: "Manakah kata baku?", options: ["Apotik", "Apotek", "Apotiek", "Apothek"], answer: 1, why: "Menurut KBBI, bentuk baku adalah apotek." },
    { q: "Penulisan yang benar?", options: ["di rumah", "dirumah", "di-rumah", "Dirumah"], answer: 0, why: "\"di\" sebagai kata depan ditulis terpisah dari kata tempat." },
    { q: "Subjek dari \"Adik membaca buku\"?", options: ["Membaca", "Buku", "Adik", "Membaca buku"], answer: 2, why: "Subjek adalah pelaku: Adik." },
    { q: "Kata baku yang benar?", options: ["Resiko", "Risiko", "Resico", "Risico"], answer: 1, why: "KBBI menetapkan bentuk baku risiko." },
    { q: "Antonim \"rajin\"?", options: ["Tekun", "Malas", "Giat", "Cepat"], answer: 1, why: "Lawan kata rajin adalah malas." },
  ],
  logic: [
    { q: "2, 4, 8, 16, …", options: ["18", "24", "32", "30"], answer: 2, why: "Each number doubles: 16 × 2 = 32." },
    { q: "Which does not belong?", options: ["Apple", "Banana", "Carrot", "Mango"], answer: 2, why: "Carrot is a vegetable; the others are fruits." },
    { q: "Bird : Fly = Fish : ?", options: ["Water", "Swim", "Fin", "Sea"], answer: 1, why: "A bird flies; a fish swims — the relationship is movement." },
    { q: "3, 6, 9, 12, …", options: ["14", "15", "16", "18"], answer: 1, why: "Add 3 each time: 12 + 3 = 15." },
    { q: "Doctor : Hospital = Teacher : ?", options: ["Book", "School", "Student", "Class"], answer: 1, why: "A doctor works in a hospital; a teacher works in a school." },
  ],
};

/* ---------- Prototype progress store (in-memory) ---------- */

const initialCompleted: Record<SubjectId, number> = { math: 2, english: 1, indonesia: 0, logic: 0 };
let completed = { ...initialCompleted };
const listeners = new Set<() => void>();
const store = {
  subscribe: (l: () => void) => (listeners.add(l), () => listeners.delete(l)),
  get: () => completed,
  getServer: () => initialCompleted,
  complete(id: SubjectId, index: number) {
    if (index === completed[id]) {
      completed = { ...completed, [id]: completed[id] + 1 };
      listeners.forEach((l) => l());
    }
  },
};
const useCompleted = () => useSyncExternalStore(store.subscribe, store.get, store.getServer);

const totalLessons = (s: Subject) => s.levels.reduce((n, l) => n + l.lessons.length, 0);
const pct = (s: Subject, done: number) =>
  Math.min(100, s.basePct + Math.round(((done - initialCompleted[s.id]) / totalLessons(s)) * 100));

function locate(s: Subject, index: number) {
  let i = index;
  for (let l = 0; l < s.levels.length; l++) {
    if (i < s.levels[l]!.lessons.length) return { level: l, pos: i };
    i -= s.levels[l]!.lessons.length;
  }
  return { level: s.levels.length - 1, pos: s.levels.at(-1)!.lessons.length - 1 };
}

/* ---------- Views ---------- */

type View =
  | { name: "entry" }
  | { name: "path"; subject: SubjectId }
  | { name: "lesson"; subject: SubjectId; index: number }
  | { name: "done"; subject: SubjectId; index: number; score: number };

export function FundamentalPath() {
  const [view, setView] = useState<View>({ name: "entry" });
  const done = useCompleted();

  if (view.name === "entry") return <Entry done={done} onPick={(id) => setView({ name: "path", subject: id })} />;
  const subject = subjects.find((s) => s.id === view.subject)!;
  if (view.name === "path")
    return <PathView subject={subject} done={done[subject.id]} onBack={() => setView({ name: "entry" })} onOpen={(i) => setView({ name: "lesson", subject: subject.id, index: i })} />;
  if (view.name === "lesson")
    return (
      <Lesson
        subject={subject}
        index={view.index}
        onExit={() => setView({ name: "path", subject: subject.id })}
        onFinish={(score) => {
          store.complete(subject.id, view.index);
          setView({ name: "done", subject: subject.id, index: view.index, score });
        }}
      />
    );
  return <Complete subject={subject} index={view.index} score={view.score} onContinue={() => setView({ name: "path", subject: subject.id })} />;
}

const subjectIcons: Record<SubjectId, LucideIcon> = { english: Languages, math: Calculator, indonesia: BookOpen, logic: Puzzle };
const subjectOrder: SubjectId[] = ["english", "math", "indonesia", "logic"];

function Entry({ done, onPick }: { done: Record<SubjectId, number>; onPick: (id: SubjectId) => void }) {
  return (
    <section>
      <h2 className="mb-3 text-[19px] font-semibold tracking-tight">Choose a subject</h2>
      <CardGrid>
        {subjectOrder.map((id) => {
          const s = subjects.find((x) => x.id === id)!;
          return <SelectCard key={id} title={s.name} description={s.description} icon={subjectIcons[id]} progress={pct(s, done[id])} onClick={() => onPick(id)} />;
        })}
      </CardGrid>
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 16, c = 2 * Math.PI * r;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3.5" className="stroke-muted" />
      <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3.5" strokeLinecap="round" className="stroke-primary" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
    </svg>
  );
}

const offsets = [0, -1, -1.6, -1, 0, 1, 1.6, 1];

function PathView({ subject, done, onBack, onOpen }: { subject: Subject; done: number; onBack: () => void; onOpen: (i: number) => void }) {
  const [hint, setHint] = useState<number | null>(null);
  const current = locate(subject, done);
  let flat = 0;

  return (
    <section>
      <button type="button" onClick={onBack} className="tap mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft size={15} aria-hidden="true" /> Semua subjek
      </button>
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-[20px] font-semibold tracking-tight">{subject.name}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Now: {subject.levels[current.level]!.name} — {subject.levels[current.level]!.lessons[current.pos]}
          </p>
        </div>
        <span className="text-[13px] font-semibold tabular-nums text-primary">{pct(subject, done)}%</span>
      </div>

      <div className="mx-auto max-w-md md:max-w-lg">
        {subject.levels.map((level, li) => {
          const levelDone = subject.levels.slice(0, li + 1).reduce((n, l) => n + l.lessons.length, 0) <= done;
          return (
            <div key={level.name} className="mb-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="label-xs">{level.name}{levelDone ? " · selesai" : ""}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <ol className="flex flex-col items-center gap-5">
                {level.lessons.map((lesson, pi) => {
                  const i = flat++;
                  const state = i < done ? "done" : i === done ? "current" : "locked";
                  const isFinal = lesson === FINAL;
                  const x = isFinal ? 0 : (offsets[pi % offsets.length] ?? 0);
                  return (
                    <li key={i} className="relative flex flex-col items-center" style={{ transform: `translateX(calc(${x} * clamp(28px, 7vw, 56px)))` }}>
                      <Node state={state} final={isFinal} label={lesson} letter={String.fromCharCode(65 + pi)} onClick={() => (state === "locked" ? setHint(i) : onOpen(i))} />
                      <span className={`mt-2 text-center text-[12.5px] font-medium ${state === "locked" ? "text-muted-foreground" : ""}`}>{lesson}</span>
                      {state === "current" && <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">Mulai</span>}
                      {hint === i && (
                        <span role="status" className="mt-1.5 rounded-md bg-muted px-2.5 py-1 text-[12px] text-muted-foreground">
                          Complete the previous lesson to unlock this.
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Node({ state, final, label, letter, onClick }: { state: "done" | "current" | "locked"; final: boolean; label: string; letter: string; onClick: () => void }) {
  const size = final ? "h-[72px] w-[72px]" : "h-14 w-14";
  const styles =
    state === "done"
      ? "bg-success text-success-foreground"
      : state === "current"
        ? "bg-primary text-primary-foreground ring-4 ring-primary-soft shadow-[0_4px_0_0_var(--color-border-strong)]"
        : "bg-muted text-muted-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={state === "locked"}
      aria-label={`${label}${state === "locked" ? " (terkunci)" : state === "done" ? " (selesai)" : " (pelajaran saat ini)"}`}
      className={`tap grid place-items-center rounded-full transition-transform active:scale-95 ${size} ${styles} ${final && state !== "locked" ? "ring-4 ring-warm-soft" : ""} ${state === "locked" ? "cursor-not-allowed" : ""}`}
    >
      {state === "locked" ? (final ? <Trophy size={24} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />) : state === "done" ? <Check size={22} strokeWidth={3} aria-hidden="true" /> : final ? <Trophy size={26} aria-hidden="true" /> : <span className="text-[17px] font-bold">{letter}</span>}
    </button>
  );
}

function Lesson({ subject, index, onExit, onFinish }: { subject: Subject; index: number; onExit: () => void; onFinish: (score: number) => void }) {
  const bank = questionBank[subject.id];
  const questions = bank.map((_, i) => bank[(i + index) % bank.length]!);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const loc = locate(subject, index);
  const lessonName = subject.levels[loc.level]!.lessons[loc.pos];
  const isFinal = lessonName === FINAL;
  const q = questions[step]!;
  const answered = picked !== null;
  const correct = picked === q.answer;
  const last = step === questions.length - 1;

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.answer) setScore((n) => n + 1);
  };
  const next = () => {
    if (last) return onFinish(score);
    setStep(step + 1);
    setPicked(null);
  };

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-xl flex-col pb-28 md:min-h-0 md:pb-0">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} aria-label="Keluar dari pelajaran" className="tap grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted">
          <X size={20} />
        </button>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={step + (answered ? 1 : 0)}>
          <div className={`h-full rounded-full transition-all duration-300 ${isFinal ? "bg-warm" : "bg-primary"}`} style={{ width: `${((step + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[13px] font-semibold tabular-nums text-muted-foreground">{step + 1}/{questions.length}</span>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {isFinal && <Trophy size={16} className="text-warm" aria-hidden="true" />}
        <p className="label-xs">{subject.name} · {subject.levels[loc.level]!.name}</p>
      </div>
      <p className="mt-1 text-[15px] font-semibold">{isFinal ? `${subject.levels[loc.level]!.name} Final Challenge` : lessonName}</p>

      <h2 className="mt-6 text-[22px] font-semibold leading-snug tracking-tight">{q.q}</h2>
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const tone = !answered
            ? "border-border hover:border-border-strong active:scale-[0.98]"
            : i === q.answer
              ? "border-success bg-success/10 text-success"
              : i === picked
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-border opacity-50";
          return (
            <button key={o} type="button" disabled={answered} onClick={() => pick(i)} className={`tap flex min-h-14 items-center justify-between gap-3 rounded-xl border-2 bg-card px-4 py-3.5 text-left text-[16px] font-medium transition ${tone}`}>
              <span>{o}</span>
              {answered && i === q.answer && <Check size={18} strokeWidth={3} aria-hidden="true" />}
              {answered && i === picked && i !== q.answer && <X size={18} strokeWidth={3} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-16 z-30 mx-auto max-w-[430px] border-t-2 p-4 md:static md:mx-0 md:max-w-none md:mt-6 md:rounded-xl md:border-2 ${correct ? "border-success bg-card" : "border-destructive bg-card"}`}
        >
          <div className="mx-auto max-w-xl">
            <p className={`flex items-center gap-2 text-[16px] font-bold ${correct ? "text-success" : "text-destructive"}`}>
              {correct ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
              {correct ? "Benar!" : "Belum tepat"}
            </p>
            {!correct && (
              <p className="mt-1 text-[14px]">
                Jawaban benar: <span className="font-semibold">{q.options[q.answer]}</span>
              </p>
            )}
            <p className="mt-1 text-[14px] leading-6 text-muted-foreground">{q.why}</p>
            <button type="button" onClick={next} autoFocus className={`tap mt-3 w-full rounded-xl py-3.5 text-[15px] font-semibold md:w-auto md:px-10 ${correct ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}`}>
              {last ? "Lihat hasil" : "Lanjut"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Complete({ subject, index, score, onContinue }: { subject: Subject; index: number; score: number; onContinue: () => void }) {
  const loc = locate(subject, index);
  const level = subject.levels[loc.level]!;
  const name = level.lessons[loc.pos];
  const isFinal = name === FINAL;
  const total = questionBank[subject.id].length;
  const hasNext = index + 1 < totalLessons(subject);
  const nextName = hasNext ? (() => { const n = locate(subject, index + 1); const l = subject.levels[n.level]!; return l.lessons[n.pos] === FINAL ? `${l.name} ${FINAL}` : l.lessons[n.pos]; })() : null;
  return (
    <section className="mx-auto max-w-md py-8 text-center">
      <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${isFinal ? "bg-warm text-foreground ring-8 ring-warm-soft" : "bg-success text-success-foreground ring-8 ring-success/15"}`}>
        {isFinal ? <Trophy size={34} aria-hidden="true" /> : <Check size={34} strokeWidth={3} aria-hidden="true" />}
      </div>
      <h2 className="mt-6 text-[24px] font-semibold tracking-tight">{isFinal ? `${level.name} complete!` : "Lesson complete"}</h2>
      <p className="mt-1 text-[15px] text-muted-foreground">{subject.name} · {isFinal ? "Final Challenge" : name}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="label-xs">Benar</p>
          <p className="mt-1 text-[24px] font-bold tabular-nums">{score}/{total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="label-xs">Akurasi</p>
          <p className="mt-1 text-[24px] font-bold tabular-nums">{Math.round((score / total) * 100)}%</p>
        </div>
      </div>
      {nextName && (
        <p className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-[14px]">
          Unlocked: <span className="font-semibold">{nextName}</span>
        </p>
      )}
      <button type="button" onClick={onContinue} className="tap mt-6 w-full rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground">
        Continue
      </button>
    </section>
  );
}

