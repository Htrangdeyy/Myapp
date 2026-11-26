import { usePlanner } from "@/data/PlannerProvider";
import { HabitCard } from "@/components/HabitCard";
import { SectionError, SyncStatus } from "@/components/SyncStatus";
import { addDays, fmtDM, weekdayShort } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function HabitsPage() {
  const { data, today, sections } = usePlanner();
  const days = Array.from({ length: 28 }, (_, i) => addDays(today, i - 27));
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Thói quen</h1>
        <p className="mt-1 text-sm text-muted">Check-in ở đây sẽ tick ô tương ứng trong sheet Thói quen.</p>
        <SyncStatus className="mt-2" />
      </div>
      <SectionError sheet="habits" />
      {sections.habits.loaded && !data.habits.length && !sections.habits.error && <p className="text-sm text-muted">Sheet Thói quen chưa có cột thói quen nào.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.habits.map((h) => <HabitCard key={h.key} habit={h} />)}
      </div>
      {data.habits.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-bold tracking-tight">28 ngày qua</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="w-40" />
                  {days.map((d) => (
                    <th key={d} className={cn("font-semibold text-muted", d === today && "text-accent")} title={fmtDM(d)}>
                      {weekdayShort(d).replace("T", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.habits.map((h) => (
                  <tr key={h.key}>
                    <td className="truncate pr-2 text-sm font-semibold">{h.name}</td>
                    {days.map((d) => (
                      <td key={d}>
                        <div className={cn("mx-auto h-5 w-5 rounded-md", h.log[d]?.done ? "bg-accent" : h.log[d] ? "bg-fg/10" : "bg-fg/[0.03]")} title={`${fmtDM(d)}: ${h.log[d]?.done ? "đã làm" : h.log[d] ? "chưa làm" : "chưa theo dõi"}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
