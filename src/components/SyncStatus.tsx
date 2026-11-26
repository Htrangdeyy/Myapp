import { AlertTriangle, RefreshCw } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { cn } from "@/lib/utils";

/** Where the data comes from, how fresh it is, and what is still waiting to reach the Sheet. */
export function SyncStatus({ className }: { className?: string }) {
  const { mode, sync, syncNow } = usePlanner();
  const notice =
    mode === "demo" ? "Dữ liệu mẫu · mở trong claude.ai để thấy lịch thật" :
    mode === "unavailable" ? "Trang này không đọc được database" : null;
  if (!notice && !sync.pending && !(mode === "live" && sync.canTrigger) && !sync.lastError) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted", className)}>
      {notice && <span className="rounded-full bg-surface px-2.5 py-1 shadow-soft">{notice}</span>}
      {sync.pending > 0 && (
        <span className="rounded-full bg-butter px-2.5 py-1 font-semibold text-ink" title="Sẽ được ghi vào Sheet ở lần đồng bộ tới">
          {sync.pending} thay đổi chờ ghi vào Sheet
        </span>
      )}
      {mode === "live" && sync.canTrigger && (
        <button onClick={syncNow} disabled={sync.triggering} className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:text-fg disabled:opacity-50">
          <RefreshCw className={cn("h-3 w-3", sync.triggering && "animate-spin")} /> Đồng bộ
        </button>
      )}
      {sync.lastError && (
        <span className="inline-flex w-full items-center gap-1 text-danger">
          <AlertTriangle className="h-3 w-3" /> Lần đồng bộ trước báo lỗi: {sync.lastError}
        </span>
      )}
    </div>
  );
}

export function SectionError({ sheet }: { sheet: "tasks" | "habits" | "goals" }) {
  const { sections, mode, sync } = usePlanner();
  const e = sections[sheet].error;
  const notYet = mode === "live" && sections[sheet].loaded && !sync.syncedAt;
  if (!e && !notYet) return null;
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-peach/60 px-4 py-3 text-sm text-ink">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{e ?? "Chưa có bản sao nào của Sheet. Lịch sẽ hiện sau lần đồng bộ đầu tiên."}</span>
    </div>
  );
}
