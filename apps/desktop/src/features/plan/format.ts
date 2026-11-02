import { addDays, parseDateKey } from "../../utils/date";

/**
 * 주 기간 글자 (R4). weekStart는 월요일 "YYYY-MM-DD".
 * 같은 달 "2026년 11월 2일 – 8일", 달이 다르면 "2026년 11월 30일 – 12월 6일",
 * 해가 다르면 "2026년 12월 28일 – 2027년 1월 3일".
 */
export function formatWeekPeriod(weekStart: string): string {
  const start = parseDateKey(weekStart);
  const end = parseDateKey(addDays(weekStart, 6));
  const head = `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일`;
  if (start.getFullYear() !== end.getFullYear()) {
    return `${head} – ${end.getFullYear()}년 ${end.getMonth() + 1}월 ${end.getDate()}일`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${head} – ${end.getMonth() + 1}월 ${end.getDate()}일`;
  }
  return `${head} – ${end.getDate()}일`;
}

/** "YYYY-MM-DD" → "11/3" */
function shortDay(key: string): string {
  const [, month, day] = key.split("-");
  return `${Number(month)}/${Number(day)}`;
}

/** 목록 줄 기간 (R14): "11/3–11/5", 하루면 "11/6" */
export function formatShortRange(start: string, end: string): string {
  return start === end ? shortDay(start) : `${shortDay(start)}–${shortDay(end)}`;
}
