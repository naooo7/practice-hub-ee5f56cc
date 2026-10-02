import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { practiceIconFor } from "@/components/practice/select-card";
import { findSubtest } from "@/data/prototype";
import { needsReview, useActivity } from "@/lib/activity";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All" },
  { id: "skd", label: "SKD" },
  { id: "utbk", label: "UTBK" },
  { id: "psikotes", label: "Psikotes" },
] as const;

type ReviewFilter = (typeof filters)[number]["id"];

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
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const data = useActivity();
  const items = data ? needsReview(data.attempts) : [];
  const visibleItems = filter === "all" ? items : items.filter((item) => item.examId === filter);
  const total = visibleItems.reduce((a, b) => a + b.count, 0);

  return (
    <Screen>
      <PageHeader
        title="Needs Review"
        caption={visibleItems.length ? `${total} questions across ${visibleItems.length} topics` : ""}
        back={{ to: "/" }}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter review category">
        {filters.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={filter === option.id ? "default" : "outline"}
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
            className="shrink-0 shadow-none"
          >
            {option.label}
          </Button>
        ))}
      </div>
      {!data ? null : visibleItems.length === 0 ? (
        <div className="border-y border-border py-8 text-center">
          <p className="text-[15px] font-medium">You're all caught up</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Questions you answer incorrectly will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleItems.map((item) => {
            const subtestName = findSubtest(item.examId, item.subtestId)?.name ?? item.subtestId.toUpperCase();
            const ItemIcon = practiceIconFor(`${subtestName} ${item.material}`);
            return (
              <article
                key={`${item.examId}/${item.subtestId}/${item.materialId}`}
                className="flex min-h-[76px] items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-3 shadow-soft sm:gap-4 sm:px-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <ItemIcon size={19} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold uppercase text-muted-foreground">{subtestName}</p>
                  <p className="truncate text-[14px] font-semibold">{item.material}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{item.count} soal perlu direview</p>
                </div>
                <Button asChild size="sm" className={cn("shrink-0 px-3", "max-sm:px-2.5")}>
                  <Link
                    to="/session/$examId/$subtestId/$materialId"
                    params={{ examId: item.examId, subtestId: item.subtestId, materialId: item.materialId }}
                    search={{ mode: "learn" }}
                  >
                    Start Review
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </Screen>
  );
}

