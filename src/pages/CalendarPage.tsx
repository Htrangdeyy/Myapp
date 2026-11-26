import { CalendarView } from "@/components/CalendarView";
import { SectionError, SyncStatus } from "@/components/SyncStatus";
import type { ISODate } from "@/lib/date";

export function CalendarPage({ onAddOn }: { onAddOn: (d: ISODate) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Lịch</h1>
        <SyncStatus className="mt-2" />
      </div>
      <SectionError sheet="tasks" />
      <CalendarView onAddOn={onAddOn} />
    </div>
  );
}
