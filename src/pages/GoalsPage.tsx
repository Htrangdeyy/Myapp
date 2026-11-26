import { usePlanner } from "@/data/PlannerProvider";
import { GoalCard } from "@/components/GoalCard";
import { SectionError, SyncStatus } from "@/components/SyncStatus";

export function GoalsPage() {
  const { data, today, sections } = usePlanner();
  const phases = [...new Set(data.goals.map((g) => g.phase || "Khác"))];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mục tiêu</h1>
        <p className="mt-1 text-sm text-muted">Từ sheet Lộ trình. Số mốc là các việc một lần cùng nhóm trong Lịch việc.</p>
        <SyncStatus className="mt-2" />
      </div>
      <SectionError sheet="goals" />
      {sections.goals.loaded && !data.goals.length && !sections.goals.error && <p className="text-sm text-muted">Sheet Lộ trình chưa có mục tiêu nào.</p>}
      {phases.map((p) => {
        const goals = data.goals.filter((g) => (g.phase || "Khác") === p);
        const active = goals.filter((g) => !g.start || g.start <= today).length;
        return (
          <section key={p}>
            <h2 className="mb-3 flex items-baseline gap-2 text-lg font-bold tracking-tight">
              {p} <span className="text-sm font-semibold text-muted">{active}/{goals.length} đang diễn ra</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
