import { CalendarDays, CheckSquare, Flame, LayoutGrid, Target, type LucideIcon } from "lucide-react";

export type Route = "dashboard" | "calendar" | "tasks" | "goals" | "habits";
export const ROUTES: { id: Route; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "goals", label: "Goals", icon: Target },
  { id: "habits", label: "Habits", icon: Flame },
];
