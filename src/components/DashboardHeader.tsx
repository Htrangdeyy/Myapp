import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { usePlanner } from "@/data/PlannerProvider";
import { currentHour, fmtDM } from "@/lib/date";
import { Button } from "./ui/button";
import { SyncStatus } from "./SyncStatus";

const QUOTES = [
  "Làm từng việc nhỏ, đều đặn mỗi ngày.",
  "Một giờ tập trung hơn ba giờ dang dở.",
  "Tiến bộ quan trọng hơn hoàn hảo.",
  "Việc khó nhất, làm trước tiên.",
  "Hôm nay gieo, mùa sau gặt.",
];

function greeting(h: number) {
  if (h < 11) return "Chào buổi sáng!";
  if (h < 14) return "Chào buổi trưa!";
  if (h < 18) return "Chào buổi chiều!";
  return "Chào buổi tối!";
}

export function DashboardHeader({ onQuickAdd, onSearchPick }: { onQuickAdd: () => void; onSearchPick: (route: "tasks" | "goals") => void }) {
  const { data, today } = usePlanner();
  const [q, setQ] = useState("");
  const quote = QUOTES[Number(today.slice(8)) % QUOTES.length];
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const tasks = data.tasks.filter((t) => (t.title + " " + t.note + " " + t.category).toLowerCase().includes(s)).map((t) => ({ id: t.id, title: t.title, sub: `${t.category} · ${t.date ? fmtDM(t.date) : ""}`, route: "tasks" as const }));
    const goals = data.goals.filter((g) => (g.title + " " + g.note).toLowerCase().includes(s)).map((g) => ({ id: g.id, title: g.title, sub: `Mục tiêu · ${g.phase}`, route: "goals" as const }));
    return [...tasks, ...goals].slice(0, 7);
  }, [q, data]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{greeting(currentHour())}</h1>
        <p className="mt-1 text-lg font-semibold text-fg/80">Hôm nay bạn muốn hoàn thành điều gì?</p>
        <p className="mt-1 text-sm text-muted">“{quote}”</p>
        <SyncStatus className="mt-3" />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm việc, sự kiện, mục tiêu…"
            className="h-11 w-full rounded-full bg-surface pl-10 pr-4 text-sm shadow-soft outline-none focus:ring-2 focus:ring-accent/40"
            aria-label="Tìm kiếm"
          />
          {results.length > 0 && (
            <ul className="absolute right-0 top-12 z-20 w-full animate-fade-in overflow-hidden rounded-2xl bg-surface p-1 shadow-lift">
              {results.map((r) => (
                <li key={r.id}>
                  <button className="w-full rounded-xl px-3 py-2 text-left hover:bg-surface-2" onClick={() => { setQ(""); onSearchPick(r.route); }}>
                    <div className="truncate text-sm font-semibold">{r.title}</div>
                    <div className="truncate text-xs text-muted">{r.sub}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button variant="accent" size="lg" onClick={onQuickAdd} className="hidden shrink-0 md:inline-flex">
          <Plus className="h-4 w-4" /> Thêm
        </Button>
      </div>
    </div>
  );
}
