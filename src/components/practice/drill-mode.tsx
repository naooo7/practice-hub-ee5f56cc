import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Minus, Plus } from "lucide-react";
import { exams } from "@/data/prototype";
import { cn } from "@/lib/utils";
import { CardGrid, practiceIconFor, SelectCard, StepHeader } from "./select-card";

type MaterialPick = { id: string; name: string };
type Scope = { trail: string[]; examId: string; subtestId: string; materials: MaterialPick[] };
const DIFFICULTIES = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "mixed", label: "Mixed" },
] as const;
const TIMERS = [
  { s: 0, label: "No Limit" },
  { s: 30, label: "30 sec" },
  { s: 60, label: "60 sec" },
  { s: 90, label: "90 sec" },
] as const;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const FUND_SCOPES = ["Mathematics", "English", "Bahasa Indonesia", "Logika"];
const COUNT_OPTIONS = [5, 10, 15, 20, 30];

/** Drill: the most customizable mode. Pick any scope, then pick materials and per-material question counts. */
export function DrillMode() {
  const [examId, setExamId] = useState<string | null>(null);
  const [subtestId, setSubtestId] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope | null>(null);

  const exam = exams.find((e) => e.id === examId);
  const subtest = exam?.subtests.find((s) => s.id === subtestId);

  if (scope) return <DrillConfig scope={scope} onBack={() => setScope(null)} />;

  if (examId === "fundamental")
    return (
      <>
        <StepHeader trail={["Drill", "Fundamental."]} title="Pilih subjek" onBack={() => setExamId(null)} />
        <CardGrid>
          {FUND_SCOPES.map((s) => (
            <SelectCard key={s} title={s} onClick={() => setScope({ trail: ["Drill", "Fundamental.", s], examId: "fundamental", subtestId: slug(s), materials: [{ id: slug(s), name: s }] })} />
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
      scope={{ trail: ["Drill", exam.name, subtest.name], examId: exam.id, subtestId: subtest.id, materials: subtest.materials.map((m) => ({ id: m.id, name: m.name })) }}
      onBack={() => setSubtestId(null)}
    />
  );
}

function DrillConfig({ scope, onBack }: { scope: Scope; onBack: () => void }) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<string>("mixed");
  const [timer, setTimer] = useState<number>(0);
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
          const MaterialIcon = practiceIconFor(m.name);
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
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <MaterialIcon size={17} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{m.name}</span>
                {active && <span className="shrink-0 text-[12.5px] tabular-nums text-muted-foreground">{count} soal</span>}
              </button>
              {active && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pl-[68px]">
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
      <Options label="Kesulitan" value={difficulty} onChange={setDifficulty} options={DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))} />
      <Options label="Timer per soal" value={timer} onChange={setTimer} options={TIMERS.map((t) => ({ value: t.s, label: t.label }))} />
      <div className="sticky bottom-16 -mx-5 mt-4 bg-background px-5 pb-2 pt-3 md:static md:mx-0 md:px-0">
        <button
          type="button"
          disabled={total === 0}
          onClick={() =>
            navigate({
              to: "/session/$examId/$subtestId/$materialId",
              params: { examId: scope.examId, subtestId: scope.subtestId, materialId: items.length === 1 ? items[0]!.material.id : "mix" },
              search: { mode: "drill", difficulty, timer, items: items.map((it) => ({ id: it.material.id, name: it.material.name, count: it.count })) },
            })
          }
          className="tap w-full rounded-lg bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground shadow-soft disabled:opacity-40"
        >
          Start Drill
        </button>
        <p className="mt-2 text-center text-[12.5px] text-muted-foreground">
          {total > 0 ? `Total ${total} soal · ${items.length} materi` : "Pilih minimal satu materi"}
        </p>
      </div>
    </div>
  );
}

function Options<T extends string | number>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="mt-5">
      <p className="label-xs">{label}</p>
      <div className="mt-2 grid grid-cols-4 gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "tap min-h-10 rounded-lg border px-2 text-[13px] font-medium transition-colors",
              value === o.value ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface hover:border-border-strong",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
