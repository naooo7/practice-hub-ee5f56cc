import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Languages,
  Landmark,
  Lightbulb,
  Lock,
  Monitor,
  Shapes,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** A restrained, shared visual vocabulary for Practice categories and materials. */
export function practiceIconFor(label: string): LucideIcon {
  const value = label.toLowerCase();

  if (/matemat|math|aritmet|numer|kuant|angka|algebra|persen|rasio|deret/.test(value)) return Calculator;
  if (/logika|logic|penalaran|analogi|pola|kognitif/.test(value)) return Brain;
  if (/geometri|geometry|bangun|shape/.test(value)) return Shapes;
  if (/english|inggris|tbi|grammar|structure|tenses|clause|vocab/.test(value)) return Languages;
  if (/bahasa indonesia|lbi|eyd|spok|kalimat|kata|sinonim|antonim|bacaan|reading|literasi/.test(value)) return FileText;
  if (/twk|nasional|negara|integritas|bela|pilar/.test(value)) return Landmark;
  if (/tkp|pelayanan|jejaring|sosial|kepribadian|papi/.test(value)) return Users;
  if (/teknologi|informasi/.test(value)) return Monitor;
  if (/psikotes|kerja/.test(value)) return BriefcaseBusiness;
  if (/utbk|tps|akademik|tpa/.test(value)) return GraduationCap;
  if (/try out|paket|ujian|skd/.test(value)) return ClipboardCheck;
  if (/fundamental|dasar/.test(value)) return Lightbulb;
  return BookOpen;
}

/** Shared selection-card language for every Practice mode. */
export function SelectCard({
  title,
  description,
  icon: Icon,
  meta,
  progress,
  locked,
  badge,
  onClick,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  meta?: string;
  progress?: number;
  locked?: boolean;
  badge?: string | undefined;
  onClick: () => void;
}) {
  const CardIcon = Icon ?? practiceIconFor(`${title} ${description ?? ""}`);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={locked}
      className={cn(
        "tap group flex min-h-[68px] w-full items-center gap-3.5 rounded-lg border border-border bg-surface px-4 py-3 text-left shadow-soft transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        locked && "opacity-60",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <CardIcon size={19} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold">{title}</span>
          {badge && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{badge}</span>}
        </span>
        {description && <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{description}</span>}
        {progress !== undefined && (
          <span className="mt-2 flex items-center gap-2">
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </span>
            <span className="text-[11.5px] font-medium tabular-nums text-muted-foreground">{progress}%</span>
          </span>
        )}
      </span>
      {meta && <span className="shrink-0 text-[12.5px] tabular-nums text-muted-foreground">{meta}</span>}
      {locked ? (
        <Lock size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
      ) : (
        <ChevronRight size={16} className="shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" aria-hidden="true" />
      )}
    </button>
  );
}

export function CardGrid({ children }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className="grid grid-cols-1 gap-2.5">{children}</div>;
}

/** Breadcrumb + one-level back for in-mode navigation. */
export function StepHeader({ trail, title, caption, onBack }: { trail: string[]; title: string; caption?: string; onBack?: () => void }) {
  return (
    <div className="mb-4">
      <div className="flex min-w-0 items-center gap-2">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Kembali satu langkah" className="tap -ml-1.5 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
            <ArrowLeft size={16} />
          </button>
        )}
        <nav aria-label="Lokasi" className="min-w-0 truncate text-[12.5px] text-muted-foreground">
          {trail.join("  ›  ")}
        </nav>
      </div>
      <h2 className="mt-2 text-[19px] font-semibold tracking-tight">{title}</h2>
      {caption && <p className="mt-0.5 text-[13px] text-muted-foreground">{caption}</p>}
    </div>
  );
}

export function Chip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "tap min-h-10 rounded-lg border px-3.5 text-[14px] font-medium tabular-nums transition-colors",
        active ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface hover:border-border-strong",
      )}
    >
      {children}
    </button>
  );
}

export function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

