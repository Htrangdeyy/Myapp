# My Planner

A personal planner (dashboard, calendar, tasks, goals, habits) built with React, TypeScript,
Tailwind CSS, shadcn/ui-style components and Lucide icons. It is published as a claude.ai
Artifact and shows the schedule from the **Blair's Calendar** Claude Sheet.

## How the data flows

```
Blair's Calendar (Sheet) ──scheduled Claude task──▶ artifact database (mirror/*) ──live──▶ app
app ──pending/* changes──▶ artifact database ──scheduled Claude task──▶ Sheet
```

An artifact page cannot read another Claude Sheet directly, so a scheduled Claude task
copies the Sheet into the app's database every hour (06:17–23:17, Vietnam time) and writes
the app's changes (task status, moved dates, new tasks, habit check-ins) back into the Sheet.
The procedure is in [docs/SYNC.md](docs/SYNC.md). The **Đồng bộ ngay** button fires the task on demand.

## Develop

```bash
npm install
npm run dev     # sample data (no claude.ai runtime locally)
npm run build   # → dist/my-planner.html, the page that is published
```

## Structure

- `src/domain` — types and planner logic (recurrence, stats, streaks, points). No UI.
- `src/data` — sheet parsing, the database mirror, pending changes, the React provider.
- `src/components` — AppShell, TopNavigation, DashboardHeader, ProgressCard, TaskCard, EventCard,
  GoalCard, HabitCard, TodayAgenda, CalendarView, QuickAddModal, and `ui/` primitives.
- `src/pages` — Dashboard, Calendar, Tasks, Goals, Habits.
