import { useEffect, useState, type FormEvent } from "react";
import { usePlanner } from "@/data/PlannerProvider";
import { REPEAT_LABEL, PRIORITY_LABEL, type Priority, type Repeat } from "@/domain/types";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Field, Input, Select, Textarea } from "./ui/field";

export function QuickAddModal({ open, onClose, defaultDate }: { open: boolean; onClose: () => void; defaultDate?: string }) {
  const { today, categories, addTask, busy, mode } = usePlanner();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate ?? today);
  const [category, setCategory] = useState("");
  const [repeat, setRepeat] = useState<Repeat>("once");
  const [priority, setPriority] = useState<Priority>(null);
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setDate(defaultDate ?? today);
      setCategory((c) => c || categories[0] || "");
    }
  }, [open, defaultDate, today, categories]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask({ title: title.trim(), date, category, repeat, priority, duration: duration.trim(), note: note.trim() });
    setTitle("");
    setNote("");
    setDuration("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Thêm vào lịch">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Việc" htmlFor="qa-title">
          <Input id="qa-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Ôn ACCA chương 3" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ngày" htmlFor="qa-date">
            <Input id="qa-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Nhóm" htmlFor="qa-cat">
            <Select id="qa-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Lặp lại" htmlFor="qa-repeat">
            <Select id="qa-repeat" value={repeat} onChange={(e) => setRepeat(e.target.value as Repeat)}>
              {(Object.keys(REPEAT_LABEL) as Repeat[]).map((r) => (
                <option key={r} value={r}>{REPEAT_LABEL[r]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Ưu tiên" htmlFor="qa-pri">
            <Select id="qa-pri" value={priority ?? ""} onChange={(e) => setPriority((e.target.value || null) as Priority)}>
              <option value="">Không</option>
              {(Object.keys(PRIORITY_LABEL) as Exclude<Priority, null>[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Thời lượng" htmlFor="qa-dur">
          <Input id="qa-dur" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30 phút, 1 giờ…" />
        </Field>
        <Field label="Ghi chú" htmlFor="qa-note">
          <Textarea id="qa-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <p className="text-xs text-muted">
          {mode === "live" ? "Việc mới hiện ngay trong app và được chèn vào sheet Lịch việc ở lần đồng bộ tới." : "Đang dùng dữ liệu mẫu: việc chỉ được thêm tạm trên trang này."}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="soft" onClick={onClose}>Huỷ</Button>
          <Button type="submit" variant="accent" disabled={busy || !title.trim()}>Thêm vào lịch</Button>
        </div>
      </form>
    </Dialog>
  );
}
