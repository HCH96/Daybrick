/** 투데이 화면 글자 만들기 (순수 함수) */
import { diffDays, parseDateKey, toDateKey } from "../../utils/date";
import type { Task } from "../plan/types";

/** "11/2" (앞자리 0 없이) */
function monthDay(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 기간 글자 "10/28 – 10/30" (미완료 팝업 원래 기간·바뀔 기간, R35–R37) */
export function formatDateRange(start: string, end: string): string {
  return `${monthDay(start)} – ${monthDay(end)}`;
}

/** 이번 주 기간 글자 "11/2 – 11/8" (R5) */
export function formatWeekRange(start: string, end: string): string {
  return formatDateRange(start, end);
}

/** 끝일이 지난 날수 "4일 지남" (R35) */
export function formatOverdueDays(end: string, todayKey: string): string {
  return `${diffDays(end, todayKey)}일 지남`;
}

/** 남은 기간 칩 (R10) */
export interface DdayChip {
  text: string;
  /** 끝일이 오늘이면 true (주황 "오늘 마감") */
  dueToday: boolean;
}

/**
 * 여러 날 태스크의 끝일까지 남은 기간. 하루짜리·날짜 없는 태스크는 null (칩 없음).
 * 끝일이 오늘이면 "오늘 마감", 아니면 "D-N" (N = 끝일 − 오늘).
 */
export function formatDday(task: Task, todayKey: string): DdayChip | null {
  if (task.start === null || task.end === null || task.start === task.end) return null;
  const left = diffDays(todayKey, task.end);
  if (left <= 0) return { text: "오늘 마감", dueToday: true };
  return { text: `D-${left}`, dueToday: false };
}

/** 완료 카드의 끝낸 때: 오늘이면 "오늘 11:32 완료", 아니면 "11/2 완료". 완료 시각이 없으면 "완료". */
export function formatDoneAt(completedAt: string | null, todayKey: string): string {
  if (completedAt === null) return "완료";
  const at = new Date(completedAt);
  if (Number.isNaN(at.getTime())) return "완료";
  const key = toDateKey(at);
  if (key !== todayKey) return `${monthDay(key)} 완료`;
  const mm = String(at.getMinutes()).padStart(2, "0");
  return `오늘 ${at.getHours()}:${mm} 완료`;
}

/** 흐른 시간 "H:MM" (초 없음, R40·R48): 0:42, 1:05 */
export function formatClock(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/** 누적 시간 글자 (R41·R46): 1시간 미만 "N분", 이상 "N시간 M분" */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
}
