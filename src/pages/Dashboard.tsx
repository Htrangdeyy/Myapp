import { CheckCircle2, ListTodo, Hourglass, TrendingUp } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { dayStats, occurrencesOn, overdue, upcoming } from "@/domain/planner";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ProgressCard } from "@/components/ProgressCard";
import { TaskCard } from "@/components/TaskCard";
import { TodayAgenda } from "@/components/TodayAgenda";
import { SectionError } from "@/components/SyncStatus";
import { SectionTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitCard } from "@/components/HabitCard";
import type { Route } from "@/components/nav";

export function Dashboard({ onQuickAdd, navigate }: { onQuickAdd: () => void; navigate: (r: Route) => void }) {
  const { data, today, sections } = usePlanner();
  const todays = occurrencesOn(data, today);
  const s = dayStats(todays);
  const late = overdue(data, today);
  const week = upcoming(data, today, 7);
  const loading = !sections.tasks.loaded;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader onQuickAdd={onQuickAdd} onSearchPick={navigate} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="Tổng quan">
        <ProgressCard label="Tổng công việc" value={s.total} hint="trong hôm nay" color="lavender" icon={ListTodo} />
        <ProgressCard label="Đã hoàn thành" value={s.done} hint={late.length ? `${late.length} việc quá hạn` : "không có việc quá hạn"} color="mint" icon={CheckCircle2} />
        <ProgressCard label="Còn lại" value={s.left} hint={`${week.length} việc trong 7 ngày tới`} color="butter" icon={Hourglass} />
        <ProgressCard label="Tiến độ hôm nay" value={`${Math.round(s.ratio * 100)}%`} color="sky" icon={TrendingUp} ring={s.ratio} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <SectionError sheet="tasks" />
          <section>
            <SectionTitle title="Kế hoạch hôm nay" action={<Button size="sm" variant="soft" onClick={() => navigate("calendar")}>Xem lịch</Button>} />
            {loading ? (
              <Skeleton />
            ) : todays.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {todays.map((o) => <TaskCard key={o.task.id} occ={o} />)}
              </div>
            ) : (
              <Empty onQuickAdd={onQuickAdd} />
            )}
          </section>

          {late.length > 0 && (
            <section>
              <SectionTitle title="Quá hạn" />
              <div className="grid gap-4 sm:grid-cols-2">
                {late.map((t) => <TaskCard key={t.id} occ={{ task: t, date: t.date!, done: false }} />)}
              </div>
            </section>
          )}

          <section>
            <SectionTitle title="Tuần này" action={<Button size="sm" variant="soft" onClick={() => navigate("tasks")}>Tất cả việc</Button>} />
            {week.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {week.map((t) => <TaskCard key={t.id} occ={{ task: t, date: t.date!, done: t.status === "done" }} compact />)}
              </div>
            ) : (
              <p className="text-sm text-muted">Không có việc một lần nào trong 7 ngày tới.</p>
            )}
          </section>

          {data.habits.length > 0 && (
            <section>
              <SectionTitle title="Thói quen" action={<Button size="sm" variant="soft" onClick={() => navigate("habits")}>Chi tiết</Button>} />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.habits.map((h) => <HabitCard key={h.key} habit={h} />)}
              </div>
            </section>
          )}
        </div>
        <aside className="min-w-0">
          <TodayAgenda />
        </aside>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-xl3 bg-surface" />)}
    </div>
  );
}
function Empty({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl3 border-2 border-dashed border-line p-6">
      <p className="text-sm text-muted">Hôm nay chưa có việc nào trong sheet Lịch việc.</p>
      <Button variant="accent" onClick={onQuickAdd}>Thêm việc cho hôm nay</Button>
    </div>
  );
}
