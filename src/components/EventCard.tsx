import type { DragEvent } from "react";
import { categoryColor } from "@/domain/planner";
import type { Occurrence } from "@/domain/types";
import { cn } from "@/lib/utils";
import { pastelBg } from "./ui/card";
import { iconFor } from "./icons";

/** Small calendar chip. One-off tasks can be dragged to another day. */
export function EventCard({ occ, onOpen, className }: { occ: Occurrence; onOpen?: () => void; className?: string }) {
  const { task, done } = occ;
  const Icon = iconFor(task.category || task.title);
  const draggable = task.repeat === "once";
  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("opacity-50", "scale-95");
  };
  const onDragEnd = (e: DragEvent) => (e.currentTarget as HTMLElement).classList.remove("opacity-50", "scale-95");
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      onClick={onOpen}
      title={task.title + (task.note ? ` — ${task.note}` : "")}
      className={cn(
        "flex w-full min-w-0 items-center gap-1.5 rounded-xl px-2 py-1.5 text-left text-xs font-semibold text-ink transition-all duration-200 hover:-translate-y-px hover:shadow-soft",
        pastelBg[categoryColor(task.category)],
        draggable && "cursor-grab active:cursor-grabbing",
        done && "opacity-60 line-through",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 self-start mt-px" />
      <span className="line-clamp-2 break-words leading-snug">{task.title}</span>
    </button>
  );
}
