import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { findSubtest } from "@/data/prototype";
import { needsReview, useActivity } from "@/lib/activity";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Needs review — Fundamental." },
      { name: "description", content: "The topics and questions that deserve another look." },
      { property: "og:title", content: "Needs review — Fundamental." },
      { property: "og:description", content: "The topics and questions that deserve another look." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewScreen,
});

function ReviewScreen() {
  const data = useActivity();
  const items = data ? needsReview(data.attempts) : [];
  const total = items.reduce((a, b) => a + b.count, 0);
  const first = items[0];

  return (
    <Screen>
      <PageHeader
        title="Needs Review"
        caption={items.length ? `${total} questions across ${items.length} topics` : ""}
        back={{ to: "/" }}
      />
      {!data ? null : items.length === 0 ? (
        <div className="border-y border-border py-8 text-center">
          <p className="text-[15px] font-medium">Nothing to review</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Questions you answer incorrectly will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border border-y border-border">
            {items.map((item) => (
              <Link
                key={`${item.examId}/${item.subtestId}/${item.materialId}`}
                to="/session/$examId/$subtestId/$materialId"
                params={{ examId: item.examId, subtestId: item.subtestId, materialId: item.materialId }}
                search={{ mode: "learn" }}
                className="tap flex items-center gap-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="label-xs">{findSubtest(item.examId, item.subtestId)?.name ?? item.subtestId}</p>
                  <p className="mt-1 text-[15px] font-medium tracking-[-0.01em]">{item.material}</p>
                </div>
                <span className="tabular text-[13px] text-muted-foreground">
                  {item.count} question{item.count === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
          </div>
          {first ? (
            <Button asChild size="block" className="mt-6">
              <Link
                to="/session/$examId/$subtestId/$materialId"
                params={{ examId: first.examId, subtestId: first.subtestId, materialId: first.materialId }}
                search={{ mode: "learn" }}
              >
                Start review
              </Link>
            </Button>
          ) : null}
        </>
      )}
    </Screen>
  );
}

