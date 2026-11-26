import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Goal, Habit, PlannerData, Occurrence, Task, TaskStatus } from "@/domain/types";
import { STATUS_LABEL } from "@/domain/types";
import { todayISO, type ISODate } from "@/lib/date";
import { REMOTE_SERVER, SHEETS, SYNC_TRIGGER_ID, type SheetKey } from "./config";
import type { DB, DbError, McpNamespace } from "./claude";
import { demoData } from "./demo";
import { asCells, parseGoals, parseHabits, parseTasks } from "./parse";
import { applyPending, pendingId, type NewTask, type Pending, type PendingOp } from "./pending";

export type { NewTask };
export type Mode = "connecting" | "live" | "demo" | "unavailable";
export interface SectionState {
  loaded: boolean;
  error: string | null;
}
interface Toast {
  id: number;
  text: string;
  tone: "ok" | "error";
}
export interface SyncInfo {
  syncedAt: string | null;
  pending: number;
  canTrigger: boolean;
  triggering: boolean;
  lastError: string | null;
}

interface PlannerCtx {
  mode: Mode;
  today: ISODate;
  data: PlannerData;
  categories: string[];
  sections: Record<SheetKey, SectionState>;
  sync: SyncInfo;
  busy: boolean;
  toasts: Toast[];
  setTaskStatus(task: Task, status: TaskStatus): Promise<void>;
  toggleOccurrence(o: Occurrence): Promise<void>;
  setHabit(habitKey: string, date: ISODate, done: boolean): Promise<void>;
  moveTask(task: Task, date: ISODate): Promise<void>;
  addTask(t: NewTask): Promise<void>;
  syncNow(): Promise<void>;
  dismissToast(id: number): void;
}

const Ctx = createContext<PlannerCtx | null>(null);
export const usePlanner = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlanner outside PlannerProvider");
  return c;
};

const idle = (): SectionState => ({ loaded: false, error: null });
const dbErrorText = (e: DbError) =>
  e.code === "revoked" || e.code === "not_granted" ? "Trang này không còn quyền đọc dữ liệu." :
  e.code === "quota_exceeded" ? "Database của app đã đầy." :
  e.message || "Không đọc được dữ liệu.";

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("connecting");
  const [today, setToday] = useState(todayISO());
  const [base, setBase] = useState<PlannerData>({ tasks: [], habits: [], goals: [] });
  const [categories, setCategories] = useState<string[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [sections, setSections] = useState<Record<SheetKey, SectionState>>({ tasks: idle(), habits: idle(), goals: idle() });
  const [meta, setMeta] = useState<{ syncedAt: string | null; lastError: string | null }>({ syncedAt: null, lastError: null });
  const [canTrigger, setCanTrigger] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const db = useRef<DB | null>(null);
  const mcp = useRef<McpNamespace | null>(null);

  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setToday(todayISO()), 60_000);
    return () => clearInterval(t);
  }, []);

  /* ---------- connect to the artifact database (or fall back to sample data) ---------- */
  useEffect(() => {
    let alive = true;
    const stops: (() => void)[] = [];
    const use = window.claude?.use;
    if (!use) {
      setMode("demo");
      const d = demoData();
      setBase(d);
      setCategories(["Công việc", "Học tập", "Sức khỏe", "Cá nhân", "Rà soát"]);
      setSections({ tasks: { loaded: true, error: null }, habits: { loaded: true, error: null }, goals: { loaded: true, error: null } });
      return;
    }
    window.claude!.use("db").then((store) => {
      if (!alive) return;
      if (!store) return setMode("unavailable");
      db.current = store;
      setMode("live");
      const fail = (key: SheetKey) => (e: DbError) => setSections((s) => ({ ...s, [key]: { loaded: true, error: dbErrorText(e) } }));
      const watch = (key: SheetKey, onDoc: (d: Record<string, unknown> | undefined) => void) =>
        stops.push(
          store.doc(`mirror/${SHEETS[key].doc}`).onSnapshot((snap) => {
            try {
              onDoc(snap.exists ? snap.data() : undefined);
              setSections((s) => ({ ...s, [key]: { loaded: true, error: null } }));
            } catch (err) {
              setSections((s) => ({ ...s, [key]: { loaded: true, error: (err as Error).message } }));
            }
          }, fail(key)),
        );
      watch("tasks", (d) => {
        const cells = asCells(d);
        const p = cells ? parseTasks(cells) : null;
        setBase((b) => ({ ...b, tasks: p?.tasks ?? [] }));
        setCategories(p?.categories ?? []);
      });
      watch("habits", (d) => {
        const cells = asCells(d);
        setBase((b) => ({ ...b, habits: cells ? parseHabits(cells) : ([] as Habit[]) }));
      });
      watch("goals", (d) => {
        const cells = asCells(d);
        setBase((b) => ({ ...b, goals: cells ? parseGoals(cells) : ([] as Goal[]) }));
      });
      stops.push(
        store.doc("mirror/meta").onSnapshot((snap) => {
          const m = snap.data() ?? {};
          setMeta({ syncedAt: (m.syncedAt as string) ?? null, lastError: (m.lastError as string) || null });
        }, () => {}),
      );
      stops.push(
        store.collection("pending").onSnapshot(
          (snap) => setPending(snap.docs.filter((d) => d.exists).map((d) => ({ ...(d.data() as PendingOp & { createdAt: number }), id: d.id }))),
          () => {},
        ),
      );
    });
    // the "sync now" button: fire the scheduled task, if this viewer can
    if (SYNC_TRIGGER_ID.startsWith("trig_")) {
      window.claude!.use("mcp").then(async (m) => {
        if (!alive || !m) return;
        mcp.current = m;
        try {
          const { servers } = await m.listTools(REMOTE_SERVER);
          setCanTrigger(!!servers.find((s) => s.server === REMOTE_SERVER)?.tools.some((t) => t.name === "fire_trigger"));
        } catch {
          setCanTrigger(false);
        }
      });
    }
    return () => {
      alive = false;
      stops.forEach((s) => s());
    };
  }, []);

  const data = useMemo(() => applyPending(base, pending), [base, pending]);

  /* ---------- writes: queue a change for the Sheet ---------- */
  const queue = useCallback(
    async (op: PendingOp, ok: string) => {
      const createdAt = Date.now();
      const id = pendingId(op);
      if (mode === "demo") {
        setPending((p) => [...p.filter((x) => x.id !== id), { ...op, id, createdAt }]);
        toast(ok + " (dữ liệu mẫu)");
        return;
      }
      if (!db.current) return;
      setBusy(true);
      try {
        await db.current.doc(`pending/${id}`).set({ ...op, createdAt });
        toast(ok);
      } catch (e) {
        toast(dbErrorText(e as DbError), "error");
      } finally {
        setBusy(false);
      }
    },
    [mode, toast],
  );

  const setTaskStatus = useCallback(
    (task: Task, status: TaskStatus) => queue({ kind: "taskStatus", title: task.title, date: task.date, status }, `"${task.title}" → ${STATUS_LABEL[status]}`),
    [queue],
  );
  const moveTask = useCallback(
    (task: Task, date: ISODate) => queue({ kind: "taskMove", title: task.title, date: task.date, newDate: date }, `Đã dời "${task.title}"`),
    [queue],
  );
  const addTask = useCallback((task: NewTask) => queue({ kind: "taskAdd", task }, `Đã thêm "${task.title}"`), [queue]);
  const setHabit = useCallback(
    async (habitKey: string, date: ISODate, done: boolean) => {
      const h = data.habits.find((x) => x.key === habitKey);
      if (!h?.log[date]) {
        toast(`Sheet Thói quen chưa có dòng cho ngày ${date.split("-").reverse().join("/")}`, "error");
        return;
      }
      await queue({ kind: "habit", habitKey, date, done }, done ? `Đã check-in "${h.name}"` : `Đã bỏ check-in "${h.name}"`);
    },
    [data.habits, queue, toast],
  );
  const toggleOccurrence = useCallback(
    (o: Occurrence) => (o.habitKey ? setHabit(o.habitKey, o.date, !o.done) : setTaskStatus(o.task, o.done ? "todo" : "done")),
    [setHabit, setTaskStatus],
  );

  const syncNow = useCallback(async () => {
    if (!mcp.current) return;
    setTriggering(true);
    try {
      await mcp.current.callTool(REMOTE_SERVER, "fire_trigger", { trigger_id: SYNC_TRIGGER_ID }, { cache: false });
      toast("Đã yêu cầu đồng bộ. Claude sẽ cập nhật trong vài phút.");
    } catch (e) {
      const code = (e as { code?: string }).code;
      toast(code === "not_in_manifest" || code === "consent_required" ? "Hãy cho phép Claude Code Remote trong menu Permissions của trang." : "Không gửi được yêu cầu đồng bộ.", "error");
    } finally {
      setTriggering(false);
    }
  }, [toast]);

  const value = useMemo<PlannerCtx>(
    () => ({
      mode, today, data, categories, sections, busy, toasts,
      sync: { syncedAt: meta.syncedAt, lastError: meta.lastError, pending: pending.length, canTrigger, triggering },
      setTaskStatus, toggleOccurrence, setHabit, moveTask, addTask, syncNow,
      dismissToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    }),
    [mode, today, data, categories, sections, busy, toasts, meta, pending.length, canTrigger, triggering, setTaskStatus, toggleOccurrence, setHabit, moveTask, addTask, syncNow],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
