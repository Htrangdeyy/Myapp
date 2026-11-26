import { AlarmClock, Bell, CalendarRange, Target } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { categoryColor, occurrencesOn, overdue, upcoming } from "@/domain/planner";
import { addDays, fmtDM, relativeDay, weekdayLong, type ISODate } from "@/lib/date";
import type { PlannerData, Task } from "@/domain/types";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { pastelBg } from "./ui/card";
import { CheckButton } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import type { ReactNode } from "react";

function Block({ icon, title, children, empty }: { icon: ReactNode; title: string; children: ReactNode; empty?: string | false }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
        {icon}
        {title}
      </h3>
      {empty ? <p className="text-sm text-muted">{empty}</p> : children}
    </section>
  );
}

/** Right-hand personal agenda: today's schedule, upcoming, deadlines, reminders, key goals. */
export function TodayAgenda() {
  const { data, today, toggleOccurrence, busy } = usePlanner();
  const todays = occurrencesOn(data, today);
  const soon = upcoming(data, today, 7).slice(0, 5);
  const late = overdue(data, today);
  const deadlines = upcoming(data, today, 45).filter((t) => t.priority === "high" || /thi|nộp|hạn|đăng ký/i.test(t.title)).slice(0, 4);
  const reminders = data.tasks.filter((t) => t.repeat === "weekly" || t.repeat === "monthly" || t.repeat === "quarterly")
    .map((t) => ({ t, next: nextOccurrence(t, today, data) }))
    .filter((x) => x.next)
    .sort((a, b) => (a.next! < b.next! ? -1 : 1))
    .slice(0, 3);
  const goals = data.goals.filter((g) => (!g.start || g.start <= today) && (!g.end || g.end >= today)).slice(0, 3);

  return (
    <Card className="flex flex-col gap-6 lg:sticky lg:top-24">
      <div>
        <div className="text-sm font-semibold text-muted">{weekdayLong(today)}, {fmtDM(today)}</div>
        <h2 className="text-2xl font-extrabold tracking-tight">Hôm nay</h2>
      </div>

      <Block icon={<CalendarRange className="h-3.5 w-3.5" />} title="Lịch trình" empty={!todays.length && "Hôm nay không có việc nào trong Sheet."}>
        <ul className="flex flex-col gap-1.5">
          {todays.map((o) => (
            <li key={o.task.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2">
              <span className={cn("h-8 w-1.5 shrink-0 rounded-full", pastelBg[categoryColor(o.task.category)])} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-sm font-semibold", o.done && "text-muted line-through")}>{o.task.title}</div>
                <div className="text-xs text-muted">{[o.task.category, o.task.duration].filter(Boolean).join(" · ")}</div>
              </div>
              <CheckButton checked={o.done} onChange={() => toggleOccurrence(o)} label={`Hoàn thành ${o.task.title}`} disabled={busy} className="border-fg/30 bg-transparent" />
            </li>
          ))}
        </ul>
      </Block>

      {late.length > 0 && (
        <Block icon={<AlarmClock className="h-3.5 w-3.5 text-danger" />} title={`Quá hạn · ${late.length}`}>
          <ul className="flex flex-col gap-1">
            {late.slice(0, 4).map((t) => (
              <li key={t.id} className="flex justify-between gap-2 text-sm">
                <span className="truncate font-semibold">{t.title}</span>
                <span className="shrink-0 text-danger">{relativeDay(t.date!, today)}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block icon={<CalendarRange className="h-3.5 w-3.5" />} title="Sắp đến · 7 ngày" empty={!soon.length && "Không có việc trong 7 ngày tới."}>
        <ul className="flex flex-col gap-1">
          {soon.map((t) => (
            <li key={t.id} className="flex justify-between gap-2 text-sm">
              <span className="truncate font-semibold">{t.title}</span>
              <span className="shrink-0 text-muted tabular">{fmtDM(t.date!)}</span>
            </li>
          ))}
        </ul>
      </Block>

      {deadlines.length > 0 && (
        <Block icon={<AlarmClock className="h-3.5 w-3.5" />} title="Deadline">
          <ul className="flex flex-col gap-1.5">
            {deadlines.map((t) => (
              <li key={t.id} className={cn("flex justify-between gap-2 rounded-2xl px-3 py-2 text-sm text-ink", pastelBg[categoryColor(t.category)])}>
                <span className="truncate font-semibold">{t.title}</span>
                <span className="shrink-0 tabular">{fmtDM(t.date!)}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {reminders.length > 0 && (
        <Block icon={<Bell className="h-3.5 w-3.5" />} title="Nhắc nhở">
          <ul className="flex flex-col gap-1">
            {reminders.map(({ t, next }) => (
              <li key={t.id} className="flex justify-between gap-2 text-sm">
                <span className="truncate font-semibold">{t.title}</span>
                <span className="shrink-0 text-muted">{relativeDay(next!, today)}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {goals.length > 0 && (
        <Block icon={<Target className="h-3.5 w-3.5" />} title="Mục tiêu quan trọng">
          <ul className="flex flex-col gap-3">
            {goals.map((g) => (
              <li key={g.id}>
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span className="truncate font-semibold">{g.title}</span>
                  <span className="shrink-0 text-muted tabular">{Math.round(g.progress * 100)}%</span>
                </div>
                <Progress value={g.progress} className="bg-fg/10" barClassName="bg-accent" />
              </li>
            ))}
          </ul>
        </Block>
      )}
    </Card>
  );
}

function nextOccurrence(t: Task, today: ISODate, data: PlannerData): ISODate | null {
  for (let i = 0; i < 120; i++) {
    const d = addDays(today, i);
    if (occurrencesOn({ ...data, tasks: [t] }, d).length) return d;
  }
  return null;
}
