import type { ISODate } from "@/lib/date";

export type TaskStatus = "todo" | "doing" | "done" | "skipped";
export type Repeat = "once" | "daily" | "weekly" | "monthly" | "quarterly";
export type Priority = "high" | "medium" | "low" | null;
export type CategoryColor = "lavender" | "sky" | "mint" | "butter" | "peach" | "lilac";

export interface Task {
  /** stable key: row number + title, used to find the row again after edits */
  id: string;
  row: number;
  date: ISODate | null;
  title: string;
  category: string;
  repeat: Repeat;
  status: TaskStatus;
  note: string;
  priority: Priority;
  duration: string;
}

/** One concrete appearance of a task on a day (recurring tasks appear many times). */
export interface Occurrence {
  task: Task;
  date: ISODate;
  done: boolean;
  /** when done-ness is tracked in the habit log rather than the status column */
  habitKey?: string;
}

export interface Habit {
  key: string; // header text in the habit sheet
  column: string; // sheet column letter
  name: string;
  log: Record<ISODate, { row: number; done: boolean }>;
}

export interface Goal {
  id: string;
  row: number;
  title: string;
  category: string;
  phase: string;
  start: ISODate | null;
  end: ISODate | null;
  progress: number; // 0..1
  status: string;
  note: string;
}

export interface PlannerData {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Chưa làm",
  doing: "Đang làm",
  done: "Xong",
  skipped: "Bỏ qua",
};
export const REPEAT_LABEL: Record<Repeat, string> = {
  once: "Một lần",
  daily: "Hằng ngày",
  weekly: "Hằng tuần",
  monthly: "Hằng tháng",
  quarterly: "Hằng quý",
};
export const PRIORITY_LABEL: Record<Exclude<Priority, null>, string> = { high: "Cao", medium: "Vừa", low: "Thấp" };
