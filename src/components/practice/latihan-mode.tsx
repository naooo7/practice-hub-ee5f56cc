import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { exams } from "@/data/prototype";
import { CardGrid, SelectCard, StepHeader } from "./select-card";

/** Latihan Soal: structured, system-guided progression. Category → Subtest → Material → guided session. */
export function LatihanMode() {
  const navigate = useNavigate();
  const [examId, setExamId] = useState<string | null>(null);
  const [subtestId, setSubtestId] = useState<string | null>(null);
  const exam = exams.find((e) => e.id === examId);
  const subtest = exam?.subtests.find((s) => s.id === subtestId);

  if (!exam)
    return (
      <>
        <StepHeader trail={["Latihan Soal"]} title="Pilih kategori" caption="Latihan bertahap — kami yang mengatur urutannya." />
        <CardGrid cols={3}>
          {exams.map((e) => (
            <SelectCard key={e.id} title={e.name} description={e.caption} meta={`${e.subtests.length} subtes`} onClick={() => setExamId(e.id)} />
          ))}
        </CardGrid>
      </>
    );

  if (!subtest)
    return (
      <>
        <StepHeader trail={["Latihan Soal", exam.name]} title="Pilih subtes" onBack={() => setExamId(null)} />
        <CardGrid cols={3}>
          {exam.subtests.map((s) => {
            const done = s.materials.reduce((n, m) => n + m.completed, 0);
            const total = s.materials.reduce((n, m) => n + m.total, 0);
            return <SelectCard key={s.id} title={s.name} description={s.caption} progress={Math.round((done / total) * 100)} onClick={() => setSubtestId(s.id)} />;
          })}
        </CardGrid>
      </>
    );

  // Recommended next material = first not yet finished; the system guides the order.
  const nextIdx = subtest.materials.findIndex((m) => m.completed < m.total);
  return (
    <>
      <StepHeader trail={["Latihan Soal", exam.name, subtest.name]} title="Pilih materi" caption="Mulai dari materi yang direkomendasikan untuk progres terbaik." onBack={() => setSubtestId(null)} />
      <CardGrid cols={3}>
        {subtest.materials.map((m, i) => (
          <SelectCard
            key={m.id}
            title={m.name}
            description={`Langkah ${i + 1} · ${m.completed}/${m.total} soal selesai`}
            progress={Math.round((m.completed / m.total) * 100)}
            badge={i === nextIdx ? "Berikutnya" : undefined}
            onClick={() =>
              navigate({
                to: "/session/$examId/$subtestId/$materialId",
                params: { examId: exam.id, subtestId: subtest.id, materialId: m.id },
                search: { mode: "latihan" },
              })
            }
          />
        ))}
      </CardGrid>
    </>
  );
}

