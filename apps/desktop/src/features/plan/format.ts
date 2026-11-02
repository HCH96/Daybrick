import { addDays, diffDays, isoWeekNumber, parseDateKey } from "../../utils/date";
import type { Task } from "./types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** 달 이름 세 글자 "Oct" */
function shortMonth(month: number): string {
  return MONTHS[month].slice(0, 3);
}

/**
 * 페이지 머리 기간 글자 (R4, D29). weekStart는 월요일 "YYYY-MM-DD".
 * title: 한 달이면 "November 2026", 두 달이면 "Oct – Nov 2026", 해가 걸치면 "Dec 2026 – Jan 2027".
 * week: ISO 주 번호 "Week 45".
 */
export function formatWeekTitle(weekStart: string): { title: string; week: string } {
  const start = parseDateKey(weekStart);
  const end = parseDateKey(addDays(weekStart, 6));
  const week = `Week ${isoWeekNumber(weekStart)}`;
  if (start.getFullYear() !== end.getFullYear()) {
    const title = `${shortMonth(start.getMonth())} ${start.getFullYear()} – ${shortMonth(end.getMonth())} ${end.getFullYear()}`;
    return { title, week };
  }
  if (start.getMonth() !== end.getMonth()) {
    return { title: `${shortMonth(start.getMonth())} – ${shortMonth(end.getMonth())} ${end.getFullYear()}`, week };
  }
  return { title: `${MONTHS[start.getMonth()]} ${start.getFullYear()}`, week };
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

/**
 * 태스크 삭제 확인 창 문구 (R40, R44, 목업 confirm-task). 팝업 삭제와 목록 줄 휴지통이 같이 쓴다.
 * title: "제목" 태스크를 지울까요?  message: 함께 지워지는 것 (Notes, D26)
 */
export function taskDeleteText(task: Task): { title: string; message: string } {
  const name = task.title || "제목 없음";
  const count = task.checklist?.length ?? 0;
  const message =
    count > 0
      ? `Notes와 체크리스트 ${count}개 항목도 함께 지워지고, 되돌릴 수 없어요.`
      : "Notes와 체크리스트도 함께 지워지고, 되돌릴 수 없어요.";
  return { title: `"${name}" 태스크를 지울까요?`, message };
}
