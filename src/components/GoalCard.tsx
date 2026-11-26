import { CalendarClock, Milestone } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { categoryColor, goalMilestones } from "@/domain/planner";
import type { Goal } from "@/domain/types";
import { diffDays, fmtDMY } from "@/lib/date";
import { Badge } from "./ui/badge";
import { PastelCard } from "./ui/card";
import { Progress } from "./ui/progress";
import { iconFor } from "./icons";

export function GoalCard({ goal, compact = false }: { goal: Goal; compact?: boolean }) {
  const { data, today } = usePlanner();
  const ms = goalMilestones(goal, data);
  // progress: the sheet's own figure, else share of milestones done
  const progress = goal.progress > 0 ? goal.progress : ms.total ? ms.done / ms.total : 0;
  const Icon = iconFor(goal.category || goal.title);
  const left = goal.end ? diffDays(goal.end, today) : null;
  return (
    <PastelCard color={categoryColor(goal.category)} className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{goal.phase || goal.category}</div>
          <h3 className="mt-1 text-base font-bold leading-snug">{goal.title}</h3>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/60" aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {!compact && goal.note && <p className="line-clamp-2 text-sm text-ink-soft">{goal.note}</p>}
      <div>
        <div className="mb-1 flex justify-between text-xs font-semibold text-ink-soft">
          <span>{goal.status || "Tiến độ"}</span>
          <span className="tabular">{Math.round(progress * 100)}%</span>
        </div>
        <Progress value={progress} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {goal.end && (
          <Badge>
            <CalendarClock className="h-3 w-3" /> {fmtDMY(goal.end)}
            {left !== null && left >= 0 && ` · còn ${left} ngày`}
          </Badge>
        )}
        <Badge>
          <Milestone className="h-3 w-3" /> {ms.done}/{ms.total} mốc
        </Badge>
      </div>
    </PastelCard>
  );
}
