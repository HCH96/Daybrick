/**
 * 회고 패널에 그릴 하루치 내용 (순수 함수, R43–R46).
 * 하루 종일 줄(시각 없는 개인·지원 일정), 타임라인(타이머 기록 구간 + 시각 있는 일정, 시각순), 그날 완료한 태스크.
 * 합계·비율은 만들지 않는다 (R47).
 */
import { NONE_CATEGORY_COLOR } from "../plan/color";
import type { PlanData } from "../plan/types";
import { taskGroupInfo } from "../projects/group";
import { collectSlices } from "../today/stats";
import type { TodayData } from "../today/types";
import { addDays, parseDateKey, toDateKey } from "../../utils/date";
import { buildCalItems, type CalItem, type CalSources } from "./items";

/** 타임라인 한 줄. rec = 타이머 기록 구간(색 막대), item = 시각 있는 일정(칩) */
export type ReviewRow =
  | {
      kind: "rec";
      key: string;
      sort: number; // 그날 0시부터 분
      time: string; // "09:10–10:40"
      from: string | null; // 원래 시작이 전날이면 "11/2 23:20부터" (R45)
      title: string;
      color: string; // 카테고리 색, 프로젝트 태스크는 프로젝트 색
    }
  | { kind: "item"; key: string; sort: number; time: string; item: CalItem };

/** 완료한 태스크 한 줄 (R46) */
export interface ReviewDone {
  taskId: string;
  title: string;
  time: string; // 완료 시각 "HH:mm"
}

export interface ReviewDay {
  allDay: CalItem[];
  timeline: ReviewRow[];
  done: ReviewDone[];
}

export interface ReviewSources extends CalSources {
  today: TodayData | null; // 아직 못 읽었으면 null (기록 줄만 빠진다)
}

const DELETED_TASK = "삭제된 태스크";
const UNTITLED = "제목 없음";

function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** 개인·지원 일정의 시작 시각 (태스크·깃발은 null) */
function itemTime(item: CalItem): string | null {
  return item.kind === "app" || item.kind === "personal" ? item.time : null;
}

/** 타이머 기록 구간을 그날 안으로 잘라 타임라인 줄로 (R44·R45). 그날 끝까지 가면 "24:00" */
function recordRows(sources: ReviewSources, day: string, now: number): ReviewRow[] {
  if (!sources.today) return [];
  const dayStart = parseDateKey(day).getTime();
  const dayEnd = parseDateKey(addDays(day, 1)).getTime();
  const plan = sources.plan;
  const taskById = new Map((plan?.tasks ?? []).map((t) => [t.id, t]));
  const rows: ReviewRow[] = [];
  collectSlices(sources.today, now).forEach((slice, i) => {
    const start = Math.max(slice.start, dayStart);
    const end = Math.min(slice.end, dayEnd);
    if (end <= start) return;
    const task = taskById.get(slice.taskId);
    const origin = new Date(slice.start);
    rows.push({
      kind: "rec",
      key: `rec:${i}:${slice.start}`,
      sort: (start - dayStart) / 60_000,
      time: `${hhmm(new Date(start))}–${end === dayEnd ? "24:00" : hhmm(new Date(end))}`,
      from: slice.start < dayStart ? `${origin.getMonth() + 1}/${origin.getDate()} ${hhmm(origin)}부터` : null,
      title: task ? task.title.trim() || UNTITLED : DELETED_TASK,
      color: task && plan ? taskGroupInfo(plan, task).color : NONE_CATEGORY_COLOR,
    });
  });
  return rows;
}

/** 그날 완료 시각(`completedAt`)이 든 태스크, 완료 시각 순 (R46) */
function doneTasks(plan: PlanData | null, day: string): ReviewDone[] {
  if (!plan) return [];
  return plan.tasks
    .filter((t) => t.status === "done" && t.completedAt !== null && toDateKey(new Date(t.completedAt)) === day)
    .map((t) => ({ task: t, at: new Date(t.completedAt as string) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .map(({ task, at }) => ({ taskId: task.id, title: task.title.trim() || UNTITLED, time: hhmm(at) }));
}

/** 그날(day, "YYYY-MM-DD")의 회고 내용. now는 실행 중 타이머의 열린 구간 끝 */
export function buildReview(sources: ReviewSources, day: string, now: number): ReviewDay {
  const items = buildCalItems(sources, day, day).filter((it) => it.kind === "app" || it.kind === "personal");
  const allDay = items.filter((it) => itemTime(it) === null);
  const timed: ReviewRow[] = items.flatMap((item) => {
    const time = itemTime(item);
    return time === null ? [] : [{ kind: "item" as const, key: item.key, sort: minutesOf(time), time, item }];
  });
  // 같은 시각이면 기록 → 일정 순 (sort는 안정 정렬)
  const timeline = [...recordRows(sources, day, now), ...timed].sort((a, b) => a.sort - b.sort);
  return { allDay, timeline, done: doneTasks(sources.plan, day) };
}

/** 패널 머리 "11월 3일 (화)" */
export function reviewTitle(day: string): string {
  const d = parseDateKey(day);
  const dow = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dow})`;
}
