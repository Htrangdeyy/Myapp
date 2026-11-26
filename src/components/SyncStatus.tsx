import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { SHEET_URL } from "@/data/config";
import { usePlanner } from "@/data/PlannerProvider";
import { cn } from "@/lib/utils";

function ago(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

/** Where the data comes from, how fresh it is, and what is still waiting to reach the Sheet. */
export function SyncStatus({ className }: { className?: string }) {
  const { mode, sync, busy, syncNow } = usePlanner();
  const label =
    mode === "demo" ? "Dữ liệu mẫu · mở trong claude.ai để thấy lịch thật" :
    mode === "connecting" ? "Đang kết nối…" :
    mode === "unavailable" ? "Trang này không đọc được database" :
    busy ? "Đang lưu…" :
    sync.syncedAt ? `Lấy từ Blair's Calendar · ${ago(sync.syncedAt)}` :
    "Chưa đồng bộ lần nào";
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm font-medium text-muted", className)}>
      <span className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-surface px-4 py-2 shadow-soft">
        {sync.lastError ? <AlertTriangle className="h-4 w-4 text-danger" /> : (
          <span className={cn("h-2 w-2 rounded-full", mode === "live" && sync.syncedAt ? "bg-success" : mode === "demo" ? "bg-butter" : "bg-muted", busy && "animate-pulse")} />
        )}
        {label}
      </span>
      {sync.pending > 0 && (
        <span className="inline-flex min-h-[36px] items-center rounded-full bg-butter px-4 py-2 font-semibold text-ink" title="Sẽ được ghi vào Sheet ở lần đồng bộ tới">
          {sync.pending} thay đổi chờ ghi vào Sheet
        </span>
      )}
      {mode === "live" && sync.canTrigger && (
        <button onClick={syncNow} disabled={sync.triggering} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-surface/60 px-3 py-2 hover:text-fg disabled:opacity-50">
          <RefreshCw className={cn("h-4 w-4", sync.triggering && "animate-spin")} /> Đồng bộ ngay
        </button>
      )}
      {mode === "live" && (
        <a href={SHEET_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-surface/60 px-3 py-2 hover:text-fg">
          <ExternalLink className="h-4 w-4" /> Mở Sheet
        </a>
      )}
      {sync.lastError && <span className="w-full text-danger">Lần đồng bộ trước báo lỗi: {sync.lastError}</span>}
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
