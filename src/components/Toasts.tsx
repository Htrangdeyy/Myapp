import { CheckCircle2, XCircle } from "lucide-react";
import { usePlanner } from "@/data/PlannerProvider";
import { cn } from "@/lib/utils";

export function Toasts() {
  const { toasts, dismissToast } = usePlanner();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={cn(
            "pointer-events-auto flex max-w-md animate-dialog-in items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lift",
            t.tone === "ok" ? "bg-fg text-bg" : "bg-danger text-white",
          )}
        >
          {t.tone === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          <span className="text-left">{t.text}</span>
        </button>
      ))}
    </div>
  );
}
