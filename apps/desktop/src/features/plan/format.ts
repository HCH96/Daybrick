import { addDays, diffDays, parseDateKey } from "../../utils/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

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

/** 상세 팝업 날짜 칩 (R35): "YYYY-MM-DD" → "11월 2일 (월)" */
export function formatChipDay(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

/** 기간 일수 (R35): 시작일·끝일을 모두 세어 "3일", 하루면 "1일" */
export function formatDayCount(start: string, end: string): string {
  return `${diffDays(start, end) + 1}일`;
}

/** "YYYY-MM-DD" → "11/4 (수)" */
function shortDayWithWeekday(key: string): string {
  return `${shortDay(key)} (${WEEKDAYS[parseDateKey(key).getDay()]})`;
}

/**
 * 끄는 동안 달력 아래 놓일 날짜 알약 (R22·R25·R26).
 * 옮기기: 하루면 "11/4 (수)", 여러 날이면 "11/4–11/6 (3일)". 끝 끌기: "끝일 11/5 (목) · 4일", "시작일 11/3 (화) · 3일".
 */
export function formatDropHint(edge: "start" | "end" | null, start: string, end: string): string {
  if (edge === "start") return `시작일 ${shortDayWithWeekday(start)} · ${formatDayCount(start, end)}`;
  if (edge === "end") return `끝일 ${shortDayWithWeekday(end)} · ${formatDayCount(start, end)}`;
  if (start === end) return shortDayWithWeekday(start);
  return `${formatShortRange(start, end)} (${formatDayCount(start, end)})`;
}
