import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, LayoutList, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/practice", label: "Practice", icon: LayoutList },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function DesktopSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-20 items-center px-7">
        <Link
          to="/"
          aria-label="Fundamental home"
          className="text-[20px] font-bold leading-none tracking-[-0.03em]"
        >
          Fundamental<span className="text-primary">.</span>
        </Link>
      </div>

      <nav aria-label="Primary navigation" className="px-3 pt-2">
        <ul className="space-y-1">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "tap flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-border bg-background/90 backdrop-blur-xl md:hidden">
      <div className="flex items-stretch px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "tap flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-[21px]" strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Screen({
  children,
  nav = true,
  className,
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      {nav ? <DesktopSidebar /> : null}
      <div className={cn(nav && "md:pl-56")}>
        <div
          className={cn(
            "screen-in mx-auto w-full max-w-[430px] px-5",
            nav ? "pb-28 pt-5 md:pb-10" : "pb-10 pt-5",
            className,
          )}
        >
          {children}
        </div>
      </div>
      {nav ? <BottomNav /> : null}
    </div>
  );
}

export function PageHeader({
  title,
  caption,
  back,
}: {
  title: string;
  caption?: string;
  back?: { to: string; params?: Record<string, string> };
}) {
  return (
    <header className="mb-5">
      {back ? (
        <Link
          to={back.to}
          params={back.params as never}
          className="tap mb-3 -ml-1 inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <span className="text-base leading-none">←</span> Back
        </Link>
      ) : null}
      <h1 className="text-[27px] font-semibold tracking-[-0.02em]">{title}</h1>
      {caption ? <p className="mt-1 text-sm text-muted-foreground">{caption}</p> : null}
    </header>
  );
}

export function ListRow({
  title,
  caption,
  meta,
  children,
}: {
  title: string;
  caption?: string;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium tracking-[-0.01em]">{title}</p>
        {caption ? (
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{caption}</p>
        ) : null}
        {children}
      </div>
      {meta ? <span className="tabular shrink-0 text-[13px] text-muted-foreground">{meta}</span> : null}
      <span className="shrink-0 text-muted-foreground/60">›</span>
    </div>
  );
}

