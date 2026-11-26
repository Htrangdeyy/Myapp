import type { PlannerData, Priority, Repeat, Task, TaskStatus } from "@/domain/types";
import type { ISODate } from "@/lib/date";

/** A change made in the app, waiting for the sync job to write it into the Sheet. */
export type PendingOp =
  | { kind: "taskStatus"; title: string; date: ISODate | null; status: TaskStatus }
  | { kind: "taskMove"; title: string; date: ISODate | null; newDate: ISODate }
  | { kind: "taskAdd"; task: NewTask }
  | { kind: "habit"; habitKey: string; date: ISODate; done: boolean };
export type Pending = PendingOp & { id: string; createdAt: number };

export interface NewTask {
  date: ISODate;
  title: string;
  category: string;
  repeat: Repeat;
  priority: Priority;
  note: string;
  duration: string;
}

/** One pending doc per target, so a later change replaces an earlier one. */
export function pendingId(op: PendingOp): string {
  const key =
    op.kind === "taskStatus" ? `s|${op.title}|${op.date}` :
    op.kind === "taskMove" ? `m|${op.title}|${op.date}` :
    op.kind === "habit" ? `h|${op.habitKey}|${op.date}` :
    `a|${op.task.title}|${op.task.date}|${Date.now()}`;
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619) >>> 0;
  return `${op.kind}-${h.toString(36)}`;
}

const match = (title: string, date: ISODate | null) => (t: Task) => t.title === title && t.date === date;

/** Shows pending changes on top of the last copy of the Sheet. */
export function applyPending(data: PlannerData, pending: Pending[]): PlannerData {
  let tasks = data.tasks;
  let habits = data.habits;
  for (const p of [...pending].sort((a, b) => a.createdAt - b.createdAt)) {
    if (p.kind === "taskStatus") tasks = tasks.map((t) => (match(p.title, p.date)(t) ? { ...t, status: p.status } : t));
    else if (p.kind === "taskMove") tasks = tasks.map((t) => (match(p.title, p.date)(t) ? { ...t, date: p.newDate } : t));
    else if (p.kind === "taskAdd") tasks = [...tasks, { id: `new:${p.id}`, row: 1e9, status: "todo", ...p.task }];
    else if (p.kind === "habit")
      habits = habits.map((h) =>
        h.key === p.habitKey && h.log[p.date] ? { ...h, log: { ...h.log, [p.date]: { ...h.log[p.date], done: p.done } } } : h,
      );
  }
  return { ...data, tasks, habits };
}
