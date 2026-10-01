import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Screen, PageHeader, ListRow } from "@/components/app-shell";
import { findExam } from "@/data/prototype";

export const Route = createFileRoute("/practice/$examId/")({
  head: () => ({
    meta: [
      { title: "Subtests — Fundamental." },
      { name: "description", content: "Pick a subtest to narrow down your practice session." },
      { property: "og:title", content: "Subtests — Fundamental." },
      { property: "og:description", content: "Pick a subtest to narrow down your practice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExamScreen,
});

function ExamScreen() {
  const { examId } = Route.useParams();
  const exam = findExam(examId);
  if (!exam) throw notFound();

  return (
    <Screen>
      <PageHeader title={exam.name} caption={exam.caption} back={{ to: "/practice" }} />
      <div className="divide-y divide-border border-y border-border">
        {exam.subtests.map((s) => (
          <Link
            key={s.id}
            to="/practice/$examId/$subtestId"
            params={{ examId: exam.id, subtestId: s.id }}
            className="tap block"
          >
            <ListRow title={s.name} caption={s.caption} meta={`${s.materials.length} topics`} />
          </Link>
        ))}
      </div>
    </Screen>
  );
}

