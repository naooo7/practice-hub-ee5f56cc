import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { user } from "@/data/prototype";
import {
  institutions,
  setAppearance,
  setInstitution,
  usePrefs,
  type Appearance,
} from "@/lib/institution";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Fundamental." },
      { name: "description", content: "Your target institution, appearance and settings." },
      { property: "og:title", content: "Profile — Fundamental." },
      { property: "og:description", content: "Your target institution, appearance and settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfileScreen,
});

const items = ["Edit Profile"];
const appearances: { id: Appearance; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

function ProfileScreen() {
  const prefs = usePrefs();
  const current = institutions.find((i) => i.id === prefs.institution) ?? null;

  return (
    <Screen>
      <div className="mb-6 flex items-center gap-4 pt-2">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="text-[19px] font-semibold tracking-[-0.02em]">{user.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            Target institution:
            {current ? (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                {current.short}
              </span>
            ) : (
              <span>Not set</span>
            )}
          </p>
        </div>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {items.map((label) => (
          <button key={label} className="tap flex w-full items-center justify-between py-3.5 text-left">
            <span className="text-[15px] font-medium">{label}</span>
            <span className="text-muted-foreground/60">›</span>
          </button>
        ))}
      </div>

      <h2 className="mb-1 mt-7 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Settings
      </h2>
      <div className="divide-y divide-border border-y border-border">
        <div className="flex items-center justify-between py-3.5">
          <p className="text-[15px] font-medium">Appearance</p>
          <div className="flex rounded-lg border border-border p-0.5" role="radiogroup" aria-label="Appearance">
            {appearances.map((a) => {
              const active = prefs.appearance === a.id;
              return (
                <button
                  key={a.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setAppearance(a.id)}
                  className={cn(
                    "tap rounded-md px-3 py-1.5 text-[13px] font-medium",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground",
                  )}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="py-3.5">
          <p className="text-[15px] font-medium">Target Institution</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Sets a subtle accent across the app.</p>
          <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Target institution">
            {institutions.map((inst) => {
              const active = prefs.institution === inst.id;
              return (
                <button
                  key={inst.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setInstitution(active ? null : inst.id)}
                  className={cn(
                    "tap flex items-center gap-2.5 rounded-xl border bg-surface px-3 py-2.5 text-left",
                    active ? "border-primary ring-1 ring-primary/30" : "border-border",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full ring-1 ring-foreground/10"
                    style={{ background: inst.swatch }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium">{inst.short}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{inst.name}</span>
                  </span>
                  {active && <Check className="size-4 shrink-0 text-primary" strokeWidth={2.2} />}
                </button>
              );
            })}
          </div>
          {current && (
            <button
              onClick={() => setInstitution(null)}
              className="tap mt-2.5 text-[12px] font-medium text-muted-foreground"
            >
              Use default Fundamental. accent
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-[12px] text-muted-foreground">Fundamental. · Prototype v0.1</p>
    </Screen>
  );
}

