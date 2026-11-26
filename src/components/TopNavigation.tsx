import { Flame } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { overallStreak } from "@/domain/planner";
import { cn } from "@/lib/utils";
import { ROUTES, type Route } from "./nav";

export function TopNavigation({ route, onNavigate }: { route: Route; onNavigate: (r: Route) => void }) {
  const { data, today } = usePlanner();
  const streak = overallStreak(data, today);
  return (
    <header className="sticky z-30 pt-3" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <nav className="flex h-16 items-center justify-between gap-2 rounded-full bg-nav px-3 text-nav-fg shadow-lift" aria-label="Chính">
        <a href="#dashboard" onClick={() => onNavigate("dashboard")} className="flex min-w-0 items-center gap-2.5 pr-1">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-base font-extrabold text-accent-fg" aria-hidden>
            B
          </span>
          <span className="whitespace-nowrap text-lg font-bold tracking-tight">My Planner</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {ROUTES.map((r) => (
            <li key={r.id}>
              <a
                href={`#${r.id}`}
                onClick={() => onNavigate(r.id)}
                aria-current={route === r.id ? "page" : undefined}
                className={cn(
                  "rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors",
                  route === r.id ? "bg-nav-fg text-nav" : "text-nav-fg/70 hover:text-nav-fg",
                )}
              >
                {r.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold tabular"
            title={streak.doneToday ? "Chuỗi ngày liên tiếp có check-in thói quen" : "Check-in một thói quen hôm nay để giữ chuỗi"}
          >
            <Flame className={streak.days > 0 ? "h-4 w-4 text-peach" : "h-4 w-4 text-nav-fg/50"} fill={streak.doneToday ? "currentColor" : "none"} />
            {streak.days} ngày
          </span>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-peach text-sm font-bold text-ink" title="Hồ sơ">
            Bl
          </span>
        </div>
      </nav>
    </header>
  );
}

export function BottomNav({ route, onNavigate }: { route: Route; onNavigate: (r: Route) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-nav text-nav-fg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingLeft: "env(safe-area-inset-left, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}
      aria-label="Điều hướng"
    >
      <ul className="grid grid-cols-5">
        {ROUTES.map((r) => {
          const Icon = r.icon;
          const active = route === r.id;
          return (
            <li key={r.id}>
              <a
                href={`#${r.id}`}
                onClick={() => onNavigate(r.id)}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-h-[76px] flex-col items-center justify-center gap-1.5 px-0.5 py-3 text-[14px] tracking-tight font-semibold leading-tight transition-colors", active ? "text-accent" : "text-nav-fg/70")}
              >
                <Icon className="h-7 w-7" strokeWidth={active ? 2.4 : 2} />
                {r.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
