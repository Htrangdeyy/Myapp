import { addDays, todayISO } from "@/lib/date";
import type { PlannerData } from "@/domain/types";

/** Example data shown only outside claude.ai (local dev), clearly labelled as a sample. */
export function demoData(): PlannerData {
  const t = todayISO();
  const d = (n: number) => addDays(t, n);
  let row = 4;
  const task = (date: string, title: string, category: string, repeat: any, status: any, note = "", priority: any = null, duration = "") => ({
    id: `${row}:${title}`, row: row++, date, title, category, repeat, status, note, priority, duration,
  });
  const log = (pattern: boolean[]) =>
    Object.fromEntries(pattern.map((done, i) => [d(i - pattern.length + 1), { row: 4 + i, done }]));
  return {
    tasks: [
      task(d(-3), "Đọc 20 trang sách", "Học tập", "daily", "todo", "Buổi tối trước khi ngủ", null, "30 phút"),
      task(d(0), "Chuẩn bị slide họp nhóm", "Công việc", "once", "doing", "5 slide, tập trung số liệu tháng", "high"),
      task(d(0), "Gọi điện cho nhà cung cấp", "Công việc", "once", "todo", "Hỏi lại báo giá", "medium"),
      task(d(0), "Đi bộ 30 phút", "Sức khỏe", "once", "done", "", "low"),
      task(d(1), "Nộp báo cáo tuần", "Công việc", "once", "todo", "", "high"),
      task(d(3), "Ôn tập chương 4", "Học tập", "once", "todo", "Bài tập cuối chương"),
      task(d(-1), "Check-in tuần", "Rà soát", "weekly", "todo", "3 việc đã làm, 1 vướng mắc", null, "15 phút"),
      task(d(6), "Sinh nhật bạn", "Cá nhân", "once", "todo", "Mua quà trước"),
      task(d(12), "Đăng ký khóa học", "Học tập", "once", "todo"),
    ],
    habits: [
      { key: "Học tập 30 phút", column: "C", name: "Học tập 30 phút", log: log([true, true, false, true, true, true, false]) },
      { key: "Sức khỏe", column: "D", name: "Sức khỏe", log: log([true, false, true, true, false, true, true]) },
    ],
    goals: [
      { id: "g1", row: 35, title: "Hoàn thành khóa học", category: "Học tập", phase: "Giai đoạn 1", start: d(-20), end: d(40), progress: 0.35, status: "Đang làm", note: "" },
      { id: "g2", row: 36, title: "Dự án quý", category: "Công việc", phase: "Giai đoạn 1", start: d(-10), end: d(60), progress: 0.2, status: "Đang làm", note: "" },
    ],
  };
}
