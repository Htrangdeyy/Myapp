/** Dates are handled as ISO "YYYY-MM-DD" strings in the sheet's time zone, so no Date drift. */
export type ISODate = string;

export const TIME_ZONE = "Asia/Ho_Chi_Minh";

export function todayISO(timeZone = TIME_ZONE): ISODate {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function currentHour(timeZone = TIME_ZONE): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hour12: false }).format(new Date()));
}

function toUTC(d: ISODate): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}
function fromUTC(d: Date): ISODate {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: ISODate, n: number): ISODate {
  const x = toUTC(d);
  x.setUTCDate(x.getUTCDate() + n);
  return fromUTC(x);
}
export function addMonths(d: ISODate, n: number): ISODate {
  const x = toUTC(d);
  const day = x.getUTCDate();
  x.setUTCDate(1);
  x.setUTCMonth(x.getUTCMonth() + n);
  const last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
  x.setUTCDate(Math.min(day, last));
  return fromUTC(x);
}
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((toUTC(a).getTime() - toUTC(b).getTime()) / 86400000);
}
/** 1 = Monday … 7 = Sunday */
export function weekday(d: ISODate): number {
  const w = toUTC(d).getUTCDay();
  return w === 0 ? 7 : w;
}
export function startOfWeek(d: ISODate): ISODate {
  return addDays(d, 1 - weekday(d));
}
export function startOfMonth(d: ISODate): ISODate {
  return d.slice(0, 8) + "01";
}
export function daysInMonth(d: ISODate): number {
  const x = toUTC(d);
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
}
export function lastSundayOfMonth(d: ISODate): ISODate {
  const last = d.slice(0, 8) + String(daysInMonth(d)).padStart(2, "0");
  return addDays(last, -(weekday(last) % 7));
}
export function firstSundayOfMonth(d: ISODate): ISODate {
  const first = startOfMonth(d);
  return addDays(first, (7 - weekday(first)) % 7);
}

const WD = ["", "T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WD_LONG = ["", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];
export const weekdayShort = (d: ISODate) => WD[weekday(d)];
export const weekdayLong = (d: ISODate) => WD_LONG[weekday(d)];
export function fmtDM(d: ISODate): string {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}`;
}
export function fmtDMY(d: ISODate): string {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
}
export function fmtMonth(d: ISODate): string {
  return `Tháng ${Number(d.slice(5, 7))}, ${d.slice(0, 4)}`;
}
export function relativeDay(d: ISODate, today: ISODate): string {
  const n = diffDays(d, today);
  if (n === 0) return "Hôm nay";
  if (n === 1) return "Ngày mai";
  if (n === -1) return "Hôm qua";
  if (n > 1 && n < 7) return `${weekdayLong(d)} · còn ${n} ngày`;
  if (n < 0) return `Trễ ${-n} ngày`;
  return fmtDMY(d);
}
