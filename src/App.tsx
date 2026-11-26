import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QuickAddModal } from "@/components/QuickAddModal";
import { ROUTES, type Route } from "@/components/nav";
import { PlannerProvider } from "@/data/PlannerProvider";
import { Dashboard } from "@/pages/Dashboard";
import { CalendarPage } from "@/pages/CalendarPage";
import { TasksPage } from "@/pages/TasksPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { HabitsPage } from "@/pages/HabitsPage";

const fromHash = (): Route => {
  const h = location.hash.replace("#", "");
  return (ROUTES.find((r) => r.id === h)?.id ?? "dashboard") as Route;
};

export default function App() {
  const [route, setRoute] = useState<Route>(fromHash);
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState<string | undefined>();

  useEffect(() => {
    const on = () => setRoute(fromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const navigate = useCallback((r: Route) => {
    setRoute(r);
    if (location.hash !== `#${r}`) location.hash = r;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const quickAdd = useCallback((date?: string) => {
    setAddDate(date);
    setAddOpen(true);
  }, []);

  return (
    <PlannerProvider>
      <AppShell route={route} onNavigate={navigate} onQuickAdd={() => quickAdd()}>
        {route === "dashboard" && <Dashboard onQuickAdd={() => quickAdd()} navigate={navigate} />}
        {route === "calendar" && <CalendarPage onAddOn={quickAdd} />}
        {route === "tasks" && <TasksPage />}
        {route === "goals" && <GoalsPage />}
        {route === "habits" && <HabitsPage />}
      </AppShell>
      <QuickAddModal open={addOpen} onClose={() => setAddOpen(false)} defaultDate={addDate} />
    </PlannerProvider>
  );
}
