import { Columns3, List } from "lucide-react";
import { useMemo, useState, type DragEvent } from "react";
import { usePlanner } from "@/data/PlannerProvider";
import { categoryColor } from "@/domain/planner";
import { STATUS_LABEL, type Task, type TaskStatus } from "@/domain/types";
import { addDays } from "@/lib/date";
import { cn } from "@/lib/utils";
import { TaskCard } from "@/components/TaskCard";
import { SectionError, SyncStatus } from "@/components/SyncStatus";
import { Segmented } from "@/components/ui/field";
import { pastelBg } from "@/components/ui/card";

type View = "kanban" | "list";
type Scope = "30" | "all" | "past";
const GROUPS: TaskStatus[] = ["todo", "doing", "done"];

export function TasksPage() {
  const { data, today, setTaskStatus, categories } = usePlanner();
  const [view, setView] = useState<View>("kanban");
  const [scope, setScope] = useState<Scope>("30");
  const [cat, setCat] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);

  const tasks = useMemo(() => {
    const end = addDays(today, 30);
    return data.tasks
      .filter((t) => t.status !== "skipped")
      .filter((t) => !cat || t.category === cat)
      .filter((t) => {
        if (scope === "all") return true;
        if (scope === "past") return !!t.date && t.date < today;
        // next 30 days, plus anything recurring or still open from before
        return t.repeat !== "once" || !t.date || (t.date <= end && (t.date >= today || t.status !== "done"));
      })
      .sort((a, b) => (a.date ?? "9") < (b.date ?? "9") ? -1 : 1);
  }, [data.tasks, cat, scope, today]);

  const byStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s);
  const occ = (t: Task) => ({ task: t, date: t.date ?? today, done: t.status === "done" });

  const drop = (s: TaskStatus) => ({
    onDragOver: (e: DragEvent) => { e.preventDefault(); setOver(s); },
    onDragLeave: () => setOver(null),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(null);
      const t = data.tasks.find((x) => x.id === e.dataTransfer.getData("text/plain"));
      if (t && t.status !== s) setTaskStatus(t, s);
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Công việc</h1>
          <SyncStatus className="mt-2" />
        </div>
        <Segmented value={view} onChange={setView} options={[{ value: "kanban", label: "Kanban", icon: <Columns3 className="h-3.5 w-3.5" /> }, { value: "list", label: "Danh sách", icon: <List className="h-3.5 w-3.5" /> }]} />
      </div>
      <SectionError sheet="tasks" />

      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={scope} onChange={setScope} options={[{ value: "30", label: "30 ngày tới" }, { value: "all", label: "Tất cả" }, { value: "past", label: "Đã qua" }]} />
        <div className="flex max-w-full gap-1.5 overflow-x-auto no-scrollbar">
          <Chip active={!cat} onClick={() => setCat(null)}>Tất cả nhóm</Chip>
          {categories.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)} dot={pastelBg[categoryColor(c)]}>{c}</Chip>
          ))}
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {GROUPS.map((s) => (
            <section key={s} {...drop(s)} className={cn("flex min-h-[200px] flex-col gap-3 rounded-xl3 bg-surface/60 p-3 transition-all", over === s && "bg-accent/15 ring-2 ring-accent")}>
              <h2 className="flex items-center justify-between px-1 text-sm font-bold">
                {STATUS_LABEL[s]}
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs tabular text-muted shadow-soft">{byStatus(s).length}</span>
              </h2>
              {byStatus(s).map((t) => (
                <div key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)} className="cursor-grab active:cursor-grabbing">
                  <TaskCard occ={occ(t)} />
                </div>
              ))}
              {!byStatus(s).length && <p className="px-1 text-sm text-muted">Kéo việc vào đây.</p>}
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {GROUPS.map((s) => (
            <section key={s}>
              <h2 className="mb-2 text-sm font-bold text-muted">{STATUS_LABEL[s]} · {byStatus(s).length}</h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {byStatus(s).map((t) => <TaskCard key={t.id} occ={occ(t)} compact />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children, dot }: { active: boolean; onClick: () => void; children: React.ReactNode; dot?: string }) {
  return (
    <button onClick={onClick} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition", active ? "bg-fg text-bg" : "bg-surface text-muted shadow-soft hover:text-fg")}>
      {dot && <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />}
      {children}
    </button>
  );
}
