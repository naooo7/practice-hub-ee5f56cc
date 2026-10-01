import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Screen, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { findMaterial } from "@/data/prototype";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice/$examId/$subtestId/$materialId")({
  head: () => ({
    meta: [
      { title: "Start practice — Fundamental." },
      { name: "description", content: "Set your mode and start a focused question set." },
      { property: "og:title", content: "Start practice — Fundamental." },
      { property: "og:description", content: "Set your mode and start a focused question set." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StartScreen,
});

const modes = [
  { id: "drill", name: "Drill", caption: "Answer fast, review at the end." },
  { id: "learn", name: "Learn", caption: "See the explanation after every question." },
] as const;

function StartScreen() {
  const { examId, subtestId, materialId } = Route.useParams();
  const material = findMaterial(examId, subtestId, materialId);
  const [mode, setMode] = useState<string>("drill");
  if (!material) throw notFound();

  return (
    <Screen nav={false}>
      <PageHeader
        title={material.name}
        back={{ to: "/practice/$examId/$subtestId", params: { examId, subtestId } }}
      />
      <div className="tabular flex items-baseline gap-6 border-y border-border py-4">
        <div>
          <p className="text-2xl font-semibold tracking-[-0.02em]">{material.questionCount}</p>
          <p className="text-[12px] text-muted-foreground">Questions</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-[-0.02em]">~{material.minutes} min</p>
          <p className="text-[12px] text-muted-foreground">Estimated</p>
        </div>
      </div>

      <p className="label-xs mt-5">Mode</p>
      <div className="mt-2 space-y-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "tap w-full rounded-xl border px-4 py-3 text-left",
              mode === m.id
                ? "border-primary bg-primary/[0.06]"
                : "border-border bg-surface hover:border-border-strong",
            )}
          >
            <p className="text-[15px] font-medium">{m.name}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{m.caption}</p>
          </button>
        ))}
      </div>

      <Button asChild size="block" className="mt-6">
        <Link
          to="/session/$examId/$subtestId/$materialId"
          params={{ examId, subtestId, materialId }}
          search={{ mode }}
        >
          Start
        </Link>
      </Button>
    </Screen>
  );
}

