/**
 * Data flow
 *   Blair's Calendar (Claude Sheet)  ──sync job──▶  this artifact's database  ──live──▶  the app
 *   the app  ──"pending" changes──▶  database  ──sync job──▶  Sheet
 *
 * An artifact page cannot read another Claude Sheet itself, so a scheduled Claude
 * task (see docs/SYNC.md) copies the Sheet into `mirror/*` and writes the app's
 * `pending/*` changes back into the Sheet.
 */
export const SHEET_ID = "37faeed1-5211-4a15-b116-39f760a40c93";
export const SHEET_URL = "https://claude.ai/artifact/7uwEm3ivb2VWhNyfPzT5hL";

/** Scheduled task that runs the sync; the "Đồng bộ ngay" button fires it. */
export const SYNC_TRIGGER_ID = "trig_01SkcqGPcvgA6Y4NP8purad2";
export const REMOTE_SERVER = "Claude Code Remote";

export const SHEETS = {
  tasks: { name: "Lịch việc", doc: "tasks" },
  habits: { name: "Thói quen", doc: "habits" },
  goals: { name: "Lộ trình", doc: "goals" },
} as const;
export type SheetKey = keyof typeof SHEETS;
