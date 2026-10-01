import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Screen, PageHeader } from "@/components/app-shell";
import { DrillMode } from "@/components/practice/drill-mode";
import { LatihanMode } from "@/components/practice/latihan-mode";
import { TryOutMode } from "@/components/practice/tryout-mode";
import { ReadMode } from "@/components/practice/read-mode";
import { FundamentalPath } from "@/components/fundamental-path";

const modes = {
  drill: { title: "Drill Soal", description: "Latihan bebas sesuai kebutuhanmu." },
  latihan: { title: "Latihan Soal", description: "Bangun kemampuanmu secara bertahap." },
  "try-out": { title: "Try Out", description: "Uji kemampuanmu dalam simulasi ujian." },
  read: { title: "Read", description: "Belajar lewat bacaan dan pemahaman." },
  fundamental: { title: "Fundamental.", description: "Perkuat kemampuan dasar yang menjadi fondasi belajar." },
} as const;

type Mode = keyof typeof modes;

function isMode(value: string): value is Mode {
  return value in modes;
}

export const Route = createFileRoute("/practice/mode/$mode")({
  head: ({ params }) => {
    const mode = isMode(params.mode) ? modes[params.mode] : undefined;
    const title = `${mode?.title ?? "Practice"} — Fundamental.`;
    const description = mode?.description ?? "Explore ways to practice with Fundamental.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ModeScreen,
});

function ModeScreen() {
  const { mode } = Route.useParams();
  if (!isMode(mode)) throw notFound();
  const current = modes[mode];

  return (
    <Screen className="md:max-w-[960px] md:px-8 md:pt-10 lg:px-12">
      <PageHeader title={current.title} caption={current.description} back={{ to: "/practice" }} />
      {mode === "drill" && <DrillMode />}
      {mode === "latihan" && <LatihanMode />}
      {mode === "try-out" && <TryOutMode />}
      {mode === "read" && <ReadMode />}
      {mode === "fundamental" && <FundamentalPath />}
      <Link to="/practice" className="tap mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-primary hover:underline">
        Lihat semua mode <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </Screen>
  );
}
