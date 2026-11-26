import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { CategoryColor } from "@/domain/types";

export const pastelBg: Record<CategoryColor, string> = {
  lavender: "bg-lavender", sky: "bg-sky", mint: "bg-mint", butter: "bg-butter", peach: "bg-peach", lilac: "bg-lilac",
};

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl3 bg-surface p-5 shadow-soft", className)} {...props} />;
}

/** A pastel card: always dark ink text, lifts slightly on hover. */
export function PastelCard({ color, className, interactive = true, ...props }: HTMLAttributes<HTMLDivElement> & { color: CategoryColor; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl3 p-5 text-ink transition-all duration-200",
        pastelBg[color],
        interactive && "hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({ title, action, className }: { title: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
