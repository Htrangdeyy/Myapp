import { CalendarClock, CheckCircle2, Flag, Repeat as RepeatIcon, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { usePlanner } from "@/data/PlannerProvider";
import { categoryColor, goalMilestones, goalTasks } from "@/domain/planner";
import { REPEAT_LABEL, type Goal, type Task } from "@/domain/types";
import { diffDays, fmtDMY, relativeDay } from "@/lib/date";
import { cn } from "@/lib/utils";
import { GoalCard } from "@/components/GoalCard";
import { ProgressCard } from "@/components/ProgressCard";
import { SectionError, SyncStatus } from "@/components/SyncStatus";
import { Dialog } from "@/components/ui/dialog";
import { CheckButton } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { pastelBg } from "@/components/ui/card";

const progressOf = (g: Goal, data: Parameters<typeof goalMilestones>[1]) => {
  if (g.progress > 0) return g.progress;
  const ms = goalMilestones(g, data);
  return ms.total ? ms.done / ms.total : 0;
};

export function GoalsPage() {
  const { data, today, sections } = usePlanner();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = data.goals.find((g) => g.id === openId) ?? null;

  const phases = [...new Set(data.goals.map((g) => g.phase || "Khác"))];
  const active = data.goals.filter((g) => (!g.start || g.start <= today) && (!g.end || g.end >= today));
  const avg = data.goals.length ? data.goals.reduce((s, g) => s + progressOf(g, data), 0) / data.goals.length : 0;
  const nextDeadline = data.goals.filter((g) => g.end && g.end >= today).sort((a, b) => (a.end! < b.end! ? -1 : 1))[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mục tiêu</h1>
        <p className="mt-1 text-sm text-muted">Chạm vào một mục tiêu để xem các việc nhỏ của nó.</p>
        <SyncStatus className="mt-2" />
      </div>
      <SectionError sheet="goals" />

      {data.goals.length > 0 && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Tổng quan mục tiêu">
          <ProgressCard label="Tổng mục tiêu" value={data.goals.length} hint={`${phases.length} giai đoạn`} color="lavender" icon={Target} />
          <ProgressCard label="Đang diễn ra" value={active.length} hint="trong thời gian thực hiện" color="sky" icon={Flag} />
          <ProgressCard label="Tiến độ chung" value={`${Math.round(avg * 100)}%`} color="mint" icon={TrendingUp} ring={avg} />
          <ProgressCard
            label="Hạn gần nhất"
            value={nextDeadline ? `${diffDays(nextDeadline.end!, today)}` : "–"}
            hint={nextDeadline ? `ngày · ${nextDeadline.title}` : "không có"}
            color="butter"
            icon={CalendarClock}
          />
        </section>
      )}

      {sections.goals.loaded && !data.goals.length && !sections.goals.error && <p className="text-sm text-muted">Sheet Lộ trình chưa có mục tiêu nào.</p>}

      {phases.map((p) => {
        const goals = data.goals.filter((g) => (g.phase || "Khác") === p);
        const phaseAvg = goals.reduce((s, g) => s + progressOf(g, data), 0) / goals.length;
        return (
          <section key={p}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold tracking-tight">{p}</h2>
              <span className="text-sm font-semibold text-muted tabular">{goals.length} mục tiêu · {Math.round(phaseAvg * 100)}%</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {goals.map((g) => <GoalCard key={g.id} goal={g} compact onOpen={() => setOpenId(g.id)} />)}
            </div>
          </section>
        );
      })}

      <Dialog open={!!open} onClose={() => setOpenId(null)} title={open?.title ?? ""}>
        {open && <GoalDetail goal={open} />}
      </Dialog>
    </div>
  );
}

function GoalDetail({ goal }: { goal: Goal }) {
  const { data, today, setTaskStatus, busy } = usePlanner();
  const tasks = goalTasks(goal, data);
  const recurring = tasks.filter((t) => t.repeat !== "once");
  const open = tasks.filter((t) => t.repeat === "once" && t.status !== "done");
  const done = tasks.filter((t) => t.repeat === "once" && t.status === "done");
  const progress = progressOf(goal, data);

  return (
    <div className="flex flex-col gap-5">
      <div className={cn("flex flex-col gap-2 rounded-2xl p-4 text-ink", pastelBg[categoryColor(goal.category)])}>
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{goal.phase} · {goal.category}</div>
        {goal.note && <p className="text-sm">{goal.note}</p>}
        <div className="flex justify-between text-xs font-semibold text-ink-soft">
          <span>{goal.start ? fmtDMY(goal.start) : "?"} → {goal.end ? fmtDMY(goal.end) : "?"}</span>
          <span className="tabular">{Math.round(progress * 100)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {!tasks.length && <p className="text-sm text-muted">Chưa có việc nào trong Lịch việc thuộc nhóm "{goal.category}" trong khoảng thời gian này.</p>}

      {open.length > 0 && (
        <TaskGroup title={`Cần làm · ${open.length}`}>
          {open.map((t) => <TaskLine key={t.id} task={t} today={today} busy={busy} onToggle={() => setTaskStatus(t, "done")} />)}
        </TaskGroup>
      )}
      {recurring.length > 0 && (
        <TaskGroup title="Việc lặp lại">
          {recurring.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5">
              <RepeatIcon className="h-4 w-4 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="text-xs text-muted">{REPEAT_LABEL[t.repeat]}{t.duration && ` · ${t.duration}`}</div>
              </div>
            </li>
          ))}
        </TaskGroup>
      )}
      {done.length > 0 && (
        <TaskGroup title={`Đã xong · ${done.length}`} icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />}>
          {done.map((t) => <TaskLine key={t.id} task={t} today={today} busy={busy} onToggle={() => setTaskStatus(t, "todo")} />)}
        </TaskGroup>
      )}
    </div>
  );
}

function TaskGroup({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">{icon}{title}</h3>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </section>
  );
}

function TaskLine({ task, today, busy, onToggle }: { task: Task; today: string; busy: boolean; onToggle: () => void }) {
  const isDone = task.status === "done";
  const late = !isDone && !!task.date && task.date < today;
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5">
      <CheckButton checked={isDone} onChange={onToggle} label={`Hoàn thành ${task.title}`} disabled={busy} className="border-fg/30 bg-transparent" />
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm font-semibold", isDone && "text-muted line-through")}>{task.title}</div>
        {task.note && <div className="line-clamp-2 text-xs text-muted">{task.note}</div>}
      </div>
      {task.date && (
        <span className={cn("shrink-0 text-xs font-semibold tabular", late ? "text-danger" : "text-muted")}>
          {isDone ? fmtDMY(task.date) : relativeDay(task.date, today)}
        </span>
      )}
    </li>
  );
}
