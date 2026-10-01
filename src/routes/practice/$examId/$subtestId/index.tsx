import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Screen, PageHeader } from "@/components/app-shell";
import { findExam, findSubtest } from "@/data/prototype";

export const Route = createFileRoute("/practice/$examId/$subtestId/")({
  head: () => ({
    meta: [
      { title: "Materials — Fundamental." },
      { name: "description", content: "Choose a material and see how far you've come." },
      { property: "og:title", content: "Materials — Fundamental." },
      { property: "og:description", content: "Choose a material and see how far you've come." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubtestScreen,
});

function SubtestScreen() {
  const { examId, subtestId } = Route.useParams();
  const exam = findExam(examId);
  const subtest = findSubtest(examId, subtestId);
  if (!exam || !subtest) throw notFound();

  return (
    <Screen>
      <PageHeader
        title={subtest.name}
        caption={subtest.caption}
        back={{ to: "/practice/$examId", params: { examId } }}
      />
      <div className="divide-y divide-border border-y border-border">
        {subtest.materials.map((m) => {
          const pct = Math.round((m.completed / m.total) * 100);
          return (
            <Link
              key={m.id}
              to="/practice/$examId/$subtestId/$materialId"
              params={{ examId, subtestId, materialId: m.id }}
              className="tap block py-3.5"
            >
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium tracking-[-0.01em]">{m.name}</p>
                  <p className="tabular mt-1 text-[12px] text-muted-foreground">
                    {m.completed} / {m.total} completed
                  </p>
                  <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="shrink-0 text-muted-foreground/60">›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Screen>
  );
}

