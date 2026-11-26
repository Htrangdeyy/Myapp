import { CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Flag, Repeat as RepeatIcon, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { usePlanner } from "@/data/PlannerProvider";
import { categoryColor, goalMilestones, goalTasks } from "@/domain/planner";
import { REPEAT_LABEL, type CategoryColor, type Goal, type Task } from "@/domain/types";
import { diffDays, fmtDMY, relativeDay } from "@/lib/date";
import { cn } from "@/lib/utils";
import { GoalCard } from "@/components/GoalCard";
import { ProgressCard } from "@/components/ProgressCard";
import { SectionError, SyncStatus } from "@/components/SyncStatus";
import { Dialog } from "@/components/ui/dialog";
import { CheckButton } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PastelCard, pastelBg } from "@/components/ui/card";
import { Ring } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const progressOf = (g: Goal, data: Parameters<typeof goalMilestones>[1]) => {
  if (g.progress > 0) return g.progress;
  const ms = goalMilestones(g, data);
  return ms.total ? ms.done / ms.total : 0;
};

const PHASE_COLORS: CategoryColor[] = ["lavender", "mint", "peach", "sky", "butter", "lilac"];

export function GoalsPage() {
  const { data, today, sections } = usePlanner();
  const [phase, setPhase] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = data.goals.find((g) => g.id === openId) ?? null;

  const phases = [...new Set(data.goals.map((g) => g.phase || "Khác"))].map((name, i) => {
    const goals = data.goals.filter((g) => (g.phase || "Khác") === name);
    const starts = goals.map((g) => g.start).filter(Boolean) as string[];
    const ends = goals.map((g) => g.end).filter(Boolean) as string[];
    const start = starts.sort()[0] ?? null;
    const end = ends.sort().slice(-1)[0] ?? null;
    return {
      name, goals, start, end,
      color: PHASE_COLORS[i % PHASE_COLORS.length],
      progress: goals.reduce((s, g) => s + progressOf(g, data), 0) / goals.length,
      current: (!start || start <= today) && (!end || end >= today),
    };
  });
  const selected = phases.find((p) => p.name === phase) ?? null;

  const active = data.goals.filter((g) => (!g.start || g.start <= today) && (!g.end || g.end >= today));
  const avg = data.goals.length ? data.goals.reduce((s, g) => s + progressOf(g, data), 0) / data.goals.length : 0;
  const nextDeadline = data.goals.filter((g) => g.end && g.end >= today).sort((a, b) => (a.end! < b.end! ? -1 : 1))[0];

  if (selected) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <Button variant="soft" size="sm" onClick={() => setPhase(null)}>
            <ChevronLeft className="h-4 w-4" /> Tất cả giai đoạn
          </Button>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{selected.name}</h1>
          <p className="mt-1 text-sm font-semibold text-muted tabular">
            {selected.start ? fmtDMY(selected.start) : "?"} → {selected.end ? fmtDMY(selected.end) : "?"} · {selected.goals.length} mục tiêu · {Math.round(selected.progress * 100)}%
          </p>
          <p className="mt-1 text-sm text-muted">Chạm vào một mục tiêu để xem các việc nhỏ.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {selected.goals.map((g) => <GoalCard key={g.id} goal={g} compact onOpen={() => setOpenId(g.id)} />)}
        </div>
        <Dialog open={!!open} onClose={() => setOpenId(null)} title={open?.title ?? ""}>
          {open && <GoalDetail goal={open} />}
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mục tiêu</h1>
        <p className="mt-1 text-sm text-muted">Chạm vào một giai đoạn để xem các mục tiêu của nó.</p>
        <SyncStatus className="mt-2" />
      </div>
      <SectionError sheet="goals" />

      {data.goals.length > 0 && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Tổng quan mục tiêu">
          <ProgressCard label="Tổng mục tiêu" value={data.goals.length} hint={`${phases.length} giai đoạn`} color="lilac" icon={Target} />
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

      <section className="flex flex-col gap-4" aria-label="Các giai đoạn">
        {phases.map((p) => (
          <PastelCard
            key={p.name}
            color={p.color}
            role="button"
            tabIndex={0}
            onClick={() => setPhase(p.name)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPhase(p.name))}
            className="flex cursor-pointer items-center gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">{p.name}</h2>
                {p.current && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">Đang ở đây</span>}
              </div>
              <div className="mt-1 text-sm font-semibold text-ink-soft tabular">
                {p.start ? fmtDMY(p.start) : "?"} → {p.end ? fmtDMY(p.end) : "?"}
              </div>
              <div className="mt-2 text-sm font-medium">{p.goals.length} mục tiêu</div>
              <div className="mt-1 line-clamp-1 text-xs text-ink-soft">{p.goals.map((g) => g.title).join(" · ")}</div>
            </div>
            <div className="relative grid shrink-0 place-items-center">
              <Ring value={p.progress} size={64} stroke={7} />
              <span className="absolute text-sm font-extrabold tabular">{Math.round(p.progress * 100)}%</span>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0" />
          </PastelCard>
        ))}
      </section>
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
