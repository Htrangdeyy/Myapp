import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { BottomNav, TopNavigation } from "./TopNavigation";
import { Toasts } from "./Toasts";
import type { Route } from "./nav";

export function AppShell({ route, onNavigate, onQuickAdd, children }: { route: Route; onNavigate: (r: Route) => void; onQuickAdd: () => void; children: ReactNode }) {
  return (
    <div className="gutter mx-auto min-h-full max-w-[1320px] pb-36 md:pb-12">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-20 bg-bg"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
      />
      <TopNavigation route={route} onNavigate={onNavigate} />
      <main className="mt-8">{children}</main>
      <button
        onClick={onQuickAdd}
        aria-label="Thêm việc"
        className="fixed z-30 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-fg shadow-lift transition active:scale-95 md:hidden"
        style={{ right: "max(20px, calc(env(safe-area-inset-right, 0px) + 20px))", bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)" }}
      >
        <Plus className="h-6 w-6" />
      </button>
      <BottomNav route={route} onNavigate={onNavigate} />
      <Toasts />
    </div>
  );
}
