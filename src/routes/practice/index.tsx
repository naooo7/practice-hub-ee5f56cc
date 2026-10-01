import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Compass, Layers3, ListChecks, Timer } from "lucide-react";
import { Screen, PageHeader } from "@/components/app-shell";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/practice/")({
  head: () => ({
    meta: [
      { title: "Practice — Fundamental." },
      {
        name: "description",
        content: "Choose a way to learn: Drill Soal, Latihan Soal, Try Out, Read, or Fundamental.",
      },
      { property: "og:title", content: "Practice — Fundamental." },
      { property: "og:description", content: "Five ways to practice and build your foundations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Practice,
});

const modes: { id: string; title: string; description: string; icon: LucideIcon }[] = [
  { id: "fundamental", title: "Fundamental.", description: "Perkuat kemampuan dasar yang menjadi fondasi belajar.", icon: Layers3 },
  { id: "drill", title: "Drill Soal", description: "Latihan bebas sesuai kebutuhanmu.", icon: Compass },
  { id: "latihan", title: "Latihan Soal", description: "Bangun kemampuanmu secara bertahap.", icon: ListChecks },
  { id: "try-out", title: "Try Out", description: "Uji kemampuanmu dalam simulasi ujian.", icon: Timer },
  { id: "read", title: "Read", description: "Belajar lewat bacaan dan pemahaman.", icon: BookOpen },
];

function Practice() {
  return (
    <Screen className="md:max-w-[960px] md:px-8 md:pt-10 lg:px-12">
      <PageHeader title="Practice" caption="Bagaimana kamu ingin berlatih?" />
      <div className="grid grid-cols-1 gap-2.5">
        {modes.map(({ id, title, description, icon: Icon }) => (
          <Link
            key={id}
            to="/practice/mode/$mode"
            params={{ mode: id }}
            className="tap group flex min-h-24 items-center gap-4 rounded-lg border border-border bg-surface px-4 py-4 shadow-soft transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary sm:size-11">
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{title}</span>
              <span className="mt-0.5 block text-[13px] leading-5 text-muted-foreground">{description}</span>
            </span>
            <ArrowUpRight size={17} className="shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </Screen>
  );
}

