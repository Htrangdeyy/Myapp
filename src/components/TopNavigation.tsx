import { Star, Trophy } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { productivityPoints } from "@/domain/planner";
import { cn } from "@/lib/utils";
import { ROUTES, type Route } from "./nav";

export function TopNavigation({ route, onNavigate }: { route: Route; onNavigate: (r: Route) => void }) {
  const { data } = usePlanner();
  const { points, level } = productivityPoints(data);
  return (
    <header className="sticky z-30 pt-3" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <nav className="flex h-[72px] items-center justify-between gap-4 rounded-full bg-nav px-3 text-nav-fg shadow-lift" aria-label="Chính">
        <a href="#dashboard" onClick={() => onNavigate("dashboard")} className="flex items-center gap-3 pr-2">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-base font-extrabold text-accent-fg" aria-hidden>
            B
          </span>
          <span className="text-lg font-bold tracking-tight">My Planner</span>
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

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-base font-semibold tabular sm:inline-flex" title="Điểm năng suất">
            <Star className="h-4 w-4 text-butter" fill="currentColor" />
            {points}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-base font-semibold tabular" title="Cấp độ">
            <Trophy className="h-4 w-4 text-accent" />
            Lv {level}
          </span>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-peach text-base font-bold text-ink" title="Hồ sơ">
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
                className={cn("flex min-h-[60px] flex-col items-center justify-center gap-1 py-2.5 text-[13px] font-semibold leading-tight transition-colors", active ? "text-accent" : "text-nav-fg/70")}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 2} />
                {r.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
