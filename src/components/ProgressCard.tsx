import type { LucideIcon } from "lucide-react";
import type { CategoryColor } from "@/domain/types";
import { PastelCard } from "./ui/card";
import { Ring } from "./ui/progress";

export function ProgressCard({ label, value, hint, color, icon: Icon, ring }: { label: string; value: string | number; hint?: string; color: CategoryColor; icon: LucideIcon; ring?: number }) {
  return (
    <PastelCard color={color} className="flex min-h-[132px] flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-soft">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/60" aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-4xl font-extrabold tracking-tight tabular">{value}</div>
          {hint && <div className="mt-0.5 text-xs font-medium text-ink-soft">{hint}</div>}
        </div>
        {ring !== undefined && <Ring value={ring} />}
      </div>
    </PastelCard>
  );
}
