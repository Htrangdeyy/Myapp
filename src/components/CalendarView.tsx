import { CalendarDays, ChevronLeft, ChevronRight, List, Plus, Rows3, Sun } from "lucide-react";
import { useState, type DragEvent } from "react";
import { usePlanner } from "@/data/PlannerProvider";
import { occurrencesOn } from "@/domain/planner";
import type { Occurrence } from "@/domain/types";
import {
  addDays, addMonths, daysInMonth, fmtDM, fmtMonth, relativeDay, startOfMonth, startOfWeek, weekday, weekdayLong, weekdayShort, type ISODate,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog } from "./ui/dialog";
import { Segmented } from "./ui/field";
import { EventCard } from "./EventCard";
import { TaskCard } from "./TaskCard";

export type CalMode = "day" | "week" | "month" | "agenda";

export function CalendarView({ onAddOn }: { onAddOn: (date: ISODate) => void }) {
  const { data, today, moveTask } = usePlanner();
  const [mode, setMode] = useState<CalMode>("week");
  const [cursor, setCursor] = useState<ISODate>(today);
  const [open, setOpen] = useState<Occurrence | null>(null);
  const [over, setOver] = useState<ISODate | null>(null);

  const step = (dir: 1 | -1) => {
    if (mode === "day") setCursor(addDays(cursor, dir));
    else if (mode === "week") setCursor(addDays(cursor, 7 * dir));
    else if (mode === "month") setCursor(addMonths(cursor, dir));
    else setCursor(addDays(cursor, 30 * dir));
  };

  const dropProps = (date: ISODate) => ({
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setOver(date);
    },
    onDragLeave: () => setOver((o) => (o === date ? null : o)),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(null);
      const id = e.dataTransfer.getData("text/plain");
      const task = data.tasks.find((t) => t.id === id);
      if (task && task.date !== date) moveTask(task, date);
    },
  });

  const title =
    mode === "day" ? `${weekdayLong(cursor)}, ${fmtDM(cursor)}` :
    mode === "week" ? `${fmtDM(startOfWeek(cursor))} – ${fmtDM(addDays(startOfWeek(cursor), 6))}` :
    mode === "month" ? fmtMonth(cursor) : `Từ ${fmtDM(cursor)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="soft" onClick={() => step(-1)} aria-label="Trước"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="soft" onClick={() => step(1)} aria-label="Sau"><ChevronRight className="h-4 w-4" /></Button>
          <Button size="sm" variant="soft" onClick={() => setCursor(today)}>Hôm nay</Button>
          <h2 className="ml-1 text-lg font-bold tracking-tight">{title}</h2>
        </div>
        <Segmented
          value={mode}
          onChange={setMode}
          className="max-w-full overflow-x-auto no-scrollbar"
          options={[
            { value: "day", label: "Hôm nay", icon: <Sun className="h-3.5 w-3.5" /> },
            { value: "week", label: "Tuần", icon: <Rows3 className="h-3.5 w-3.5" /> },
            { value: "month", label: "Tháng", icon: <CalendarDays className="h-3.5 w-3.5" /> },
            { value: "agenda", label: "Agenda", icon: <List className="h-3.5 w-3.5" /> },
          ]}
        />
      </div>

      {mode === "day" && <DayView date={cursor} onOpen={setOpen} onAddOn={onAddOn} />}

      {mode === "week" && (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[760px] grid-cols-7 gap-3">
            {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i)).map((d) => {
              const occ = occurrencesOn(data, d);
              const isToday = d === today;
              return (
                <div
                  key={d}
                  {...dropProps(d)}
                  className={cn(
                    "flex min-h-[260px] flex-col gap-2 rounded-xl3 bg-surface p-3 shadow-soft transition-all",
                    isToday && "ring-2 ring-accent",
                    over === d && "scale-[1.02] bg-accent/10",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-muted">{weekdayShort(d)}</div>
                      <div className={cn("text-xl font-extrabold tabular", isToday && "text-accent")}>{d.slice(8)}</div>
                    </div>
                    <button className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg" onClick={() => onAddOn(d)} aria-label={`Thêm việc ngày ${fmtDM(d)}`}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {occ.map((o) => <EventCard key={o.task.id} occ={o} onOpen={() => setOpen(o)} />)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === "month" && (
        <Card className="p-3 sm:p-4">
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((w) => <div key={w}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: weekday(startOfMonth(cursor)) - 1 }, (_, i) => <div key={`pad${i}`} />)}
            {Array.from({ length: daysInMonth(cursor) }, (_, i) => addDays(startOfMonth(cursor), i)).map((d) => {
              const occ = occurrencesOn(data, d);
              const isToday = d === today;
              return (
                <div
                  key={d}
                  {...dropProps(d)}
                  onDoubleClick={() => onAddOn(d)}
                  className={cn(
                    "flex min-h-[64px] min-w-0 flex-col gap-1 rounded-2xl bg-surface-2 p-1.5 transition-all sm:min-h-[104px]",
                    isToday && "bg-accent/15 ring-2 ring-accent",
                    over === d && "scale-[1.03] bg-accent/20",
                  )}
                >
                  <div className={cn("text-xs font-bold tabular", isToday ? "text-accent" : "text-muted")}>{Number(d.slice(8))}</div>
                  <div className="hidden flex-col gap-1 sm:flex">
                    {occ.slice(0, 3).map((o) => <EventCard key={o.task.id} occ={o} onOpen={() => setOpen(o)} className="py-1" />)}
                    {occ.length > 3 && <button className="text-left text-[11px] font-semibold text-muted hover:text-fg" onClick={() => { setCursor(d); setMode("day"); }}>+{occ.length - 3} việc</button>}
                  </div>
                  {occ.length > 0 && (
                    <button className="flex flex-wrap gap-0.5 sm:hidden" onClick={() => { setCursor(d); setMode("day"); }} aria-label={`${occ.length} việc`}>
                      {occ.slice(0, 4).map((o) => <span key={o.task.id} className="h-1.5 w-1.5 rounded-full bg-accent" />)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Kéo một việc sang ngày khác để dời lịch. Nhấp đúp vào một ngày để thêm việc.</p>
        </Card>
      )}

      {mode === "agenda" && <AgendaList from={cursor} onOpen={setOpen} />}

      <Dialog open={!!open} onClose={() => setOpen(null)} title="Chi tiết">
        {open && <TaskCard occ={occurrencesOn(data, open.date).find((o) => o.task.id === open.task.id) ?? open} />}
      </Dialog>
    </div>
  );
}

function DayView({ date, onOpen, onAddOn }: { date: ISODate; onOpen: (o: Occurrence) => void; onAddOn: (d: ISODate) => void }) {
  const { data } = usePlanner();
  const occ = occurrencesOn(data, date);
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {occ.map((o) => (
        <div key={o.task.id} onClick={() => onOpen(o)} className="cursor-pointer">
          <TaskCard occ={o} />
        </div>
      ))}
      <button onClick={() => onAddOn(date)} className="flex min-h-[140px] items-center justify-center gap-2 rounded-xl3 border-2 border-dashed border-line text-sm font-semibold text-muted transition hover:border-accent hover:text-fg">
        <Plus className="h-4 w-4" /> Thêm việc cho ngày này
      </button>
    </div>
  );
}

function AgendaList({ from, onOpen }: { from: ISODate; onOpen: (o: Occurrence) => void }) {
  const { data, today } = usePlanner();
  const days = Array.from({ length: 30 }, (_, i) => addDays(from, i))
    .map((d) => ({ d, occ: occurrencesOn(data, d).filter((o) => o.task.repeat !== "daily") }))
    .filter((x) => x.occ.length);
  if (!days.length) return <Card className="text-sm text-muted">Không có việc nào trong 30 ngày này (không tính việc hằng ngày).</Card>;
  return (
    <div className="flex flex-col gap-4">
      {days.map(({ d, occ }) => (
        <div key={d} className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <div className={cn("pt-2", d === today && "text-accent")}>
            <div className="text-sm font-bold">{relativeDay(d, today)}</div>
            <div className="text-xs text-muted">{weekdayLong(d)}, {fmtDM(d)}</div>
          </div>
          <div className="flex flex-col gap-2">
            {occ.map((o) => <EventCard key={o.task.id} occ={o} onOpen={() => onOpen(o)} className="px-3 py-2.5 text-sm" />)}
          </div>
        </div>
      ))}
    </div>
  );
}
