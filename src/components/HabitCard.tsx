import { Check, Flame } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { categoryColor, habitStreak, habitWeek } from "@/domain/planner";
import type { Habit } from "@/domain/types";
import { weekdayShort } from "@/lib/date";
import { cn } from "@/lib/utils";
import { PastelCard, pastelBg } from "./ui/card";
import { CheckButton } from "./ui/checkbox";
import { Button } from "./ui/button";
import { iconFor } from "./icons";

export function HabitCard({ habit }: { habit: Habit }) {
  const { today, setHabit, busy } = usePlanner();
  const week = habitWeek(habit, today);
  const streak = habitStreak(habit, today);
  const doneToday = !!habit.log[today]?.done;
  const weekDone = week.filter((d) => d.done).length;
  const Icon = iconFor(habit.name);
  return (
    <PastelCard color={categoryColor(habit.name.split(" ")[0])} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/60" aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-bold leading-snug">{habit.name}</h3>
            <div className="text-xs font-semibold text-ink-soft tabular">{weekDone}/7 ngày tuần này</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-sm font-bold tabular" title="Chuỗi ngày liên tiếp">
          <Flame className={cn("h-4 w-4", streak > 0 ? "text-danger" : "text-ink-soft")} fill={streak > 0 ? "currentColor" : "none"} />
          {streak}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {week.map((d) => {
          const isToday = d.date === today;
          return (
            <button
              key={d.date}
              type="button"
              disabled={busy || d.date > today}
              onClick={() => setHabit(habit.key, d.date, !d.done)}
              aria-label={`${weekdayShort(d.date)} ${d.done ? "đã làm" : "chưa làm"}`}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-all",
                isToday && "ring-2 ring-ink/70",
                d.date <= today ? "hover:bg-white/50" : "opacity-40",
              )}
            >
              <span className="text-ink-soft">{weekdayShort(d.date)}</span>
              <span className={cn("grid h-6 w-6 place-items-center rounded-full", d.done ? "bg-ink text-white" : "bg-white/60")}>
                {d.done && <Check className="h-3.5 w-3.5 animate-pop" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <Button variant={doneToday ? "ink-ghost" : "ink"} onClick={() => setHabit(habit.key, today, !doneToday)} disabled={busy}>
        {doneToday ? "Đã check-in hôm nay · bỏ" : "Check-in hôm nay"}
      </Button>
    </PastelCard>
  );
}

/** Compact one-line habit for the dashboard: name, streak, week dots and today's check-in. */
export function HabitRow({ habit }: { habit: Habit }) {
  const { today, setHabit, busy } = usePlanner();
  const week = habitWeek(habit, today);
  const streak = habitStreak(habit, today);
  const doneToday = !!habit.log[today]?.done;
  const Icon = iconFor(habit.name);
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5 text-ink", pastelBg[categoryColor(habit.name.split(" ")[0])])}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{habit.name}</div>
        <div className="mt-1 flex gap-1" aria-hidden>
          {week.map((d) => (
            <span key={d.date} className={cn("h-1.5 w-4 rounded-full", d.done ? "bg-ink" : "bg-white/60", d.date === today && !d.done && "ring-1 ring-ink/40")} />
          ))}
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold tabular" title="Chuỗi ngày liên tiếp">
        <Flame className={cn("h-3.5 w-3.5", streak > 0 ? "text-danger" : "text-ink-soft")} fill={streak > 0 ? "currentColor" : "none"} />
        {streak}
      </span>
      <CheckButton checked={doneToday} onChange={() => setHabit(habit.key, today, !doneToday)} label={`Check-in ${habit.name} hôm nay`} disabled={busy} />
    </div>
  );
}
