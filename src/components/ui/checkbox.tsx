import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckButton({ checked, onChange, label, className, disabled }: { checked: boolean; onChange: () => void; label: string; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-all duration-200",
        checked ? "border-ink bg-ink text-white" : "border-ink/30 bg-white/50 hover:border-ink/60",
        className,
      )}
    >
      {checked && <Check className="h-3.5 w-3.5 animate-pop" strokeWidth={3} />}
    </button>
  );
}
