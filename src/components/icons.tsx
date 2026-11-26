import {
  BookOpen, Briefcase, Calculator, ClipboardCheck, Factory, GraduationCap, Heart, Languages, Sparkles, Store, User, type LucideIcon,
} from "lucide-react";

const MAP: [RegExp, LucideIcon][] = [
  [/công việc|work/i, Briefcase],
  [/acca|kế toán/i, Calculator],
  [/hsk|tiếng|ielts|language/i, Languages],
  [/mba|chevening|gmat/i, GraduationCap],
  [/ngành/i, Factory],
  [/nhà cỏ|shopee|shop|bán/i, Store],
  [/rà soát|review|check-in/i, ClipboardCheck],
  [/học|đọc|sách/i, BookOpen],
  [/sức khỏe|health|đi bộ|tập/i, Heart],
  [/cá nhân|personal/i, User],
];

export function iconFor(text: string): LucideIcon {
  return MAP.find(([re]) => re.test(text))?.[1] ?? Sparkles;
}
