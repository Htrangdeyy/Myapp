import { Clock, Flag, Play, Repeat as RepeatIcon, Check, RotateCcw } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { categoryColor } from "@/domain/planner";
import { PRIORITY_LABEL, REPEAT_LABEL, STATUS_LABEL, type Occurrence, type Task } from "@/domain/types";
import { relativeDay } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { PastelCard } from "./ui/card";
import { CheckButton } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { iconFor } from "./icons";

const priorityTone = { high: "bg-white/80 text-danger", medium: "bg-white/60", low: "bg-white/40 text-ink-soft" } as const;

export function PriorityBadge({ task }: { task: Task }) {
  if (!task.priority) return null;
  return (
    <Badge className={priorityTone[task.priority]}>
      <Flag className="h-3 w-3" /> {PRIORITY_LABEL[task.priority]}
    </Badge>
  );
}

/** A task as it appears on a given day, with check-off, start and complete. */
export function TaskCard({ occ, compact = false }: { occ: Occurrence; compact?: boolean }) {
  const { today, toggleOccurrence, setTaskStatus, busy } = usePlanner();
  const { task, done } = occ;
  const color = categoryColor(task.category);
  const Icon = iconFor(task.category || task.title);
  const doing = !done && task.status === "doing" && !occ.habitKey;
  const progress = done ? 1 : doing ? 0.5 : 0;
  const statusLabel = occ.habitKey ? (done ? "Đã check-in" : "Chưa check-in") : STATUS_LABEL[done ? "done" : task.status];

  return (
    <PastelCard color={color} className={cn("flex flex-col gap-3", done && "opacity-70")}>
      <div className="flex items-start gap-3">
        <CheckButton checked={done} onChange={() => toggleOccurrence(occ)} label={`Hoàn thành ${task.title}`} disabled={busy} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn("text-base font-bold leading-snug", done && "line-through decoration-2")}>{task.title}</h3>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/60" aria-hidden>
              <Icon className="h-4 w-4" />
            </span>
          </div>
          {task.note && !compact && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{task.note}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge>
          <Clock className="h-3 w-3" /> {relativeDay(occ.date, today)}
          {task.duration && ` · ${task.duration}`}
        </Badge>
        {task.repeat !== "once" && (
          <Badge>
            <RepeatIcon className="h-3 w-3" /> {REPEAT_LABEL[task.repeat]}
          </Badge>
        )}
        <PriorityBadge task={task} />
        {task.category && <Badge className="bg-white/40">{task.category}</Badge>}
      </div>

      {!compact && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs font-semibold text-ink-soft">
              <span>{statusLabel}</span>
              <span className="tabular">{Math.round(progress * 100)}%</span>
            </div>
            <Progress value={progress} />
          </div>
          {done ? (
            <Button size="sm" variant="ink-ghost" onClick={() => toggleOccurrence(occ)} disabled={busy}>
              <RotateCcw className="h-3.5 w-3.5" /> Mở lại
            </Button>
          ) : !occ.habitKey && task.status === "todo" ? (
            <Button size="sm" variant="ink" onClick={() => setTaskStatus(task, "doing")} disabled={busy}>
              <Play className="h-3.5 w-3.5" /> Bắt đầu
            </Button>
          ) : (
            <Button size="sm" variant="ink" onClick={() => toggleOccurrence(occ)} disabled={busy}>
              <Check className="h-3.5 w-3.5" /> Hoàn thành
            </Button>
          )}
        </div>
      )}
    </PastelCard>
  );
}
