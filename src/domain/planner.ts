import {
  addDays, addMonths, diffDays, firstSundayOfMonth, lastSundayOfMonth, startOfWeek, type ISODate,
} from "@/lib/date";
import type { CategoryColor, Goal, Habit, Occurrence, PlannerData, Task } from "./types";

/* ---------- categories ---------- */

const KNOWN: Record<string, CategoryColor> = {
  "công việc": "sky",
  acca: "lavender",
  hsk: "mint",
  mba: "peach",
  "ngành": "butter",
  "nhà cỏ": "mint",
  "rà soát": "lilac",
  "mốc": "peach",
};
const PALETTE: CategoryColor[] = ["lavender", "sky", "mint", "butter", "peach", "lilac"];

export function categoryColor(category: string): CategoryColor {
  const k = category.trim().toLowerCase();
  if (KNOWN[k]) return KNOWN[k];
  let h = 0;
  for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/* ---------- habits <-> daily tasks ---------- */

/** A daily task whose category names a habit column (e.g. ACCA ↔ "ACCA 1 giờ") is checked off in the habit log. */
export function habitForTask(task: Task, habits: Habit[]): Habit | undefined {
  if (task.repeat !== "daily") return undefined;
  const cat = task.category.trim().toLowerCase();
  if (!cat) return undefined;
  return habits.find((h) => h.key.toLowerCase().includes(cat));
}

/* ---------- occurrences ---------- */

function occursOn(task: Task, day: ISODate): boolean {
  if (!task.date) return false;
  const d = diffDays(day, task.date);
  if (d < 0) return false;
  switch (task.repeat) {
    case "once":
      return d === 0;
    case "daily":
      return true;
    case "weekly":
      return d % 7 === 0;
    case "monthly": {
      // "Chủ nhật cuối tháng" when the start date is one; otherwise same day of month
      if (lastSundayOfMonth(task.date) === task.date) return lastSundayOfMonth(day) === day;
      for (let i = 0; i < 600; i++) {
        const x = addMonths(task.date, i);
        if (x === day) return true;
        if (x > day) return false;
      }
      return false;
    }
    case "quarterly": {
      const startMonth = Number(task.date.slice(5, 7));
      const m = Number(day.slice(5, 7));
      if ((m - startMonth) % 3 !== 0) return false;
      if (firstSundayOfMonth(task.date) === task.date) return firstSundayOfMonth(day) === day;
      return day.slice(8) === task.date.slice(8);
    }
  }
}

export function occurrencesOn(data: PlannerData, day: ISODate): Occurrence[] {
  const out: Occurrence[] = [];
  for (const task of data.tasks) {
    if (task.status === "skipped" || !occursOn(task, day)) continue;
    const habit = habitForTask(task, data.habits);
    if (habit) {
      out.push({ task, date: day, done: !!habit.log[day]?.done, habitKey: habit.key });
    } else if (task.repeat === "once") {
      out.push({ task, date: day, done: task.status === "done" });
    } else {
      // recurring without a habit column: the status column holds the latest round
      out.push({ task, date: day, done: task.status === "done" });
    }
  }
  return out.sort(sortOcc);
}

export function occurrencesBetween(data: PlannerData, from: ISODate, to: ISODate): Occurrence[] {
  const out: Occurrence[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(...occurrencesOn(data, d));
  return out;
}

const PRI = { high: 0, medium: 1, low: 2 } as const;
function sortOcc(a: Occurrence, b: Occurrence) {
  if (a.done !== b.done) return a.done ? 1 : -1;
  const pa = a.task.priority ? PRI[a.task.priority] : 3;
  const pb = b.task.priority ? PRI[b.task.priority] : 3;
  if (pa !== pb) return pa - pb;
  return a.task.row - b.task.row;
}

/* ---------- one-off tasks ---------- */

export function oneOffTasks(data: PlannerData): Task[] {
  return data.tasks.filter((t) => t.repeat === "once");
}
export function overdue(data: PlannerData, today: ISODate): Task[] {
  return oneOffTasks(data).filter((t) => t.date && t.date < today && (t.status === "todo" || t.status === "doing"));
}
export function upcoming(data: PlannerData, today: ISODate, days: number): Task[] {
  const end = addDays(today, days);
  return oneOffTasks(data).filter(
    (t) => t.date && t.date > today && t.date <= end && t.status !== "done" && t.status !== "skipped",
  );
}

/* ---------- stats ---------- */

export interface DayStats {
  total: number;
  done: number;
  left: number;
  ratio: number;
}
export function dayStats(occ: Occurrence[]): DayStats {
  const total = occ.length;
  const done = occ.filter((o) => o.done).length;
  return { total, done, left: total - done, ratio: total ? done / total : 0 };
}

/* ---------- habits ---------- */

export function habitStreak(h: Habit, today: ISODate): number {
  let d = h.log[today]?.done ? today : addDays(today, -1);
  let n = 0;
  while (h.log[d]?.done) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}
export function habitWeek(h: Habit, today: ISODate): { date: ISODate; done: boolean; tracked: boolean }[] {
  const mon = startOfWeek(today);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(mon, i);
    return { date, done: !!h.log[date]?.done, tracked: !!h.log[date] };
  });
}

/* ---------- goals ---------- */

export function goalMilestones(goal: Goal, data: PlannerData): { done: number; total: number } {
  const ms = oneOffTasks(data).filter(
    (t) => t.category === goal.category && t.status !== "skipped" && (!goal.end || !t.date || t.date <= goal.end),
  );
  return { done: ms.filter((t) => t.status === "done").length, total: ms.length };
}

/* ---------- gamification ---------- */

export function productivityPoints(data: PlannerData): { points: number; level: number; toNext: number } {
  const taskPts = data.tasks.filter((t) => t.status === "done").length * 20;
  const habitPts = data.habits.reduce((s, h) => s + Object.values(h.log).filter((x) => x.done).length * 5, 0);
  const points = taskPts + habitPts;
  const level = Math.floor(points / 100) + 1;
  return { points, level, toNext: level * 100 - points };
}

/** Days in a row (ending today, or yesterday if today has none yet) with at least one habit check-in. */
export function overallStreak(data: PlannerData, today: ISODate): { days: number; doneToday: boolean } {
  const any = (d: ISODate) => data.habits.some((h) => h.log[d]?.done);
  const doneToday = any(today);
  let d = doneToday ? today : addDays(today, -1);
  let days = 0;
  while (any(d)) {
    days++;
    d = addDays(d, -1);
  }
  return { days, doneToday };
}
