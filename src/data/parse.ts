import type { Goal, Habit, Priority, Repeat, Task, TaskStatus } from "@/domain/types";
import type { ISODate } from "@/lib/date";

/* ---------- raw cell → plain value ---------- */

export type Plain = string | number | boolean | null;

export function plain(cell: unknown): Plain {
  if (cell === null || cell === undefined) return null;
  if (typeof cell !== "object") return cell as Plain;
  const c = cell as Record<string, unknown>;
  if ("date" in c) return String(c.date);
  if ("dateTime" in c) return String(c.dateTime).slice(0, 10);
  if ("time" in c) return String(c.time);
  if ("number" in c) return Number(c.number);
  if ("markdown" in c) return String(c.markdown);
  if ("value" in c) return plain(c.value);
  if ("user" in c) return String(c.name ?? "");
  if (Array.isArray(cell)) return cell.map((x) => plain(x)).join(", ");
  return null;
}
const text = (v: Plain) => (v === null ? "" : String(v).trim());
const isoDate = (v: Plain): ISODate | null => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);

export function colLetter(i: number): string {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

export interface CellsRead {
  revision?: number;
  sheet?: string;
  rows: Record<string, unknown[]>;
}

/** Accepts a mirror document: the Sheet's readCells answer, or one wrapped in {value}. */
export function asCells(doc: unknown): CellsRead | null {
  const o = doc as Record<string, any> | undefined;
  const v = o?.value && typeof o.value === "object" ? o.value : o;
  if (!v || typeof v.rows !== "object") return null;
  return { revision: v.revision, sheet: v.sheet, rows: v.rows };
}

type Grid = { row: number; cells: Plain[] }[];
function grid(read: CellsRead): Grid {
  return Object.entries(read.rows)
    .map(([r, cells]) => ({ row: Number(r), cells: (cells ?? []).map(plain) }))
    .sort((a, b) => a.row - b.row);
}
function findHeader(g: Grid, required: string[]) {
  for (const r of g) {
    const labels = r.cells.map((c) => text(c).toLowerCase());
    if (required.every((q) => labels.includes(q))) {
      const col = (name: string) => labels.indexOf(name.toLowerCase());
      return { row: r.row, labels, col };
    }
  }
  return null;
}

/* ---------- Lịch việc ---------- */

export interface TaskColumns {
  date: string;
  title: string;
  category: string | null;
  repeat: string | null;
  status: string | null;
  note: string | null;
  priority: string | null;
  duration: string | null;
}
export interface TasksParsed {
  tasks: Task[];
  cols: TaskColumns;
  headerRow: number;
  categories: string[];
}

const STATUS: Record<string, TaskStatus> = { "chưa làm": "todo", "đang làm": "doing", xong: "done", "bỏ qua": "skipped" };
const REPEAT: Record<string, Repeat> = {
  "một lần": "once", "hằng ngày": "daily", "hằng tuần": "weekly", "hằng tháng": "monthly", "hằng quý": "quarterly",
};
const PRIORITY: Record<string, Exclude<Priority, null>> = { cao: "high", "vừa": "medium", "thấp": "low" };

export function parseTasks(read: CellsRead): TasksParsed {
  const g = grid(read);
  const h = findHeader(g, ["ngày", "việc"]);
  if (!h) throw new Error(`Sheet "${read.sheet}" thiếu dòng tiêu đề "Ngày" / "Việc"`);
  const idx = {
    date: h.col("Ngày"), title: h.col("Việc"), category: h.col("Nhóm"), repeat: h.col("Lặp lại"),
    status: h.col("Trạng thái"), note: h.col("Ghi chú"), priority: h.col("Ưu tiên"), duration: h.col("Thời lượng"),
  };
  const L = (i: number) => (i >= 0 ? colLetter(i) : null);
  const cols: TaskColumns = {
    date: colLetter(idx.date), title: colLetter(idx.title), category: L(idx.category), repeat: L(idx.repeat),
    status: L(idx.status), note: L(idx.note), priority: L(idx.priority), duration: L(idx.duration),
  };
  const at = (cells: Plain[], i: number) => (i >= 0 ? cells[i] ?? null : null);
  const tasks: Task[] = [];
  const cats = new Set<string>();
  for (const r of g) {
    if (r.row <= h.row) continue;
    const title = text(at(r.cells, idx.title));
    if (!title) continue;
    const category = text(at(r.cells, idx.category));
    if (category) cats.add(category);
    tasks.push({
      id: `${r.row}:${title}`,
      row: r.row,
      date: isoDate(at(r.cells, idx.date)),
      title,
      category,
      repeat: REPEAT[text(at(r.cells, idx.repeat)).toLowerCase()] ?? "once",
      status: STATUS[text(at(r.cells, idx.status)).toLowerCase()] ?? "todo",
      note: text(at(r.cells, idx.note)),
      priority: PRIORITY[text(at(r.cells, idx.priority)).toLowerCase()] ?? null,
      duration: text(at(r.cells, idx.duration)),
    });
  }
  return { tasks, cols, headerRow: h.row, categories: [...cats] };
}

/* ---------- Thói quen ---------- */

export function parseHabits(read: CellsRead): Habit[] {
  const g = grid(read);
  const h = findHeader(g, ["ngày"]);
  if (!h) throw new Error(`Sheet "${read.sheet}" thiếu cột "Ngày"`);
  const dateIdx = h.col("Ngày");
  const skip = new Set(["ngày", "thứ", "ghi chú", ""]);
  const habits: Habit[] = h.labels
    .map((label, i) => ({ label, i }))
    .filter(({ label }) => !skip.has(label))
    .map(({ i }) => {
      const key = text(g.find((r) => r.row === h.row)!.cells[i]);
      return { key, column: colLetter(i), name: key, log: {} as Habit["log"], _i: i } as Habit & { _i: number };
    });
  for (const r of g) {
    if (r.row <= h.row) continue;
    const d = isoDate(r.cells[dateIdx] ?? null);
    if (!d) continue;
    for (const hb of habits as (Habit & { _i: number })[]) {
      const v = r.cells[hb._i];
      if (typeof v === "boolean") hb.log[d] = { row: r.row, done: v };
    }
  }
  return habits.map(({ key, column, name, log }) => ({ key, column, name, log }));
}

/* ---------- Lộ trình ---------- */

export function parseGoals(read: CellsRead): Goal[] {
  const g = grid(read);
  const h = findHeader(g, ["mảng việc"]);
  if (!h) return [];
  const idx = {
    title: h.col("Mảng việc"), category: h.col("Nhóm"), phase: h.col("Giai đoạn"), start: h.col("Bắt đầu"),
    end: h.col("Kết thúc"), progress: h.col("Tiến độ"), status: h.col("Trạng thái"), note: h.col("Ghi chú"),
  };
  const at = (cells: Plain[], i: number) => (i >= 0 ? cells[i] ?? null : null);
  const goals: Goal[] = [];
  for (const r of g) {
    if (r.row <= h.row) continue;
    const title = text(at(r.cells, idx.title));
    if (!title) continue;
    const p = at(r.cells, idx.progress);
    goals.push({
      id: `${r.row}:${title}`,
      row: r.row,
      title,
      category: text(at(r.cells, idx.category)),
      phase: text(at(r.cells, idx.phase)),
      start: isoDate(at(r.cells, idx.start)),
      end: isoDate(at(r.cells, idx.end)),
      progress: typeof p === "number" ? Math.max(0, Math.min(1, p)) : 0,
      status: text(at(r.cells, idx.status)),
      note: text(at(r.cells, idx.note)),
    });
  }
  return goals;
}
