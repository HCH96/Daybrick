/**
 * 홈 "다가오는 7일" 카드 계산 (R29–R34, D6). 화면 없는 순수 함수.
 * 캘린더 `buildCalItems`로 항목을 모은 뒤 홈 규칙(하루에 한 번, 완료 태스크 제외, 날짜 안 순서)을 더한다.
 */
import { EVENT_KIND_LABELS } from "../applications/statuses";
import type { EventKind } from "../applications/types";
import { buildCalItems, type CalItem, type CalSources } from "../calendar/items";
import { addDays, parseDateKey } from "../../utils/date";

/** 앞으로 보여 줄 날 수 (오늘 포함) */
export const UPCOMING_DAYS = 7;

export type UpcomingRow =
  | { kind: "task"; key: string; title: string; color: string }
  | {
      kind: "app";
      key: string;
      title: string; // 회사 → 카드 제목 → "제목 없음"
      sub: string; // 전형 종류 ("면접", "지원 마감" 등)
      eventKind: EventKind;
      time: string | null;
      initial: string; // 이니셜 배지 글자
      badge: number; // 배지 색 1~7
    }
  | { kind: "flag"; key: string; title: string; sub: string | null; color: string; done: boolean }
  | { kind: "personal"; key: string; title: string; time: string | null; endLabel: string | null }; // "~11/12"

export interface UpcomingDay {
  dateKey: string;
  label: string; // "오늘", "내일", "11/10 (화)"
  isToday: boolean;
  rows: UpcomingRow[];
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** "2026-11-10" → "11/10 (화)" */
export function shortDateLabel(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`;
}

/** "2026-11-12" → "~11/12" */
function endLabelOf(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return `~${d.getMonth() + 1}/${d.getDate()}`;
}

/** 날짜 머리 (R29) */
function dayLabel(offset: number, dateKey: string): string {
  if (offset === 0) return "오늘";
  if (offset === 1) return "내일";
  return shortDateLabel(dateKey);
}

/** 시각 없는 항목의 순서 (R32): 지원 → 깃발 → 개인 → 태스크 */
const KIND_ORDER: Record<UpcomingRow["kind"], number> = { app: 0, flag: 1, personal: 2, task: 3 };

function rowTime(row: UpcomingRow): string | null {
  return row.kind === "app" || row.kind === "personal" ? row.time : null;
}

/** "프로젝트명 · 3주차" → 앞은 제목, 뒤는 흐린 글자 */
function splitFlagLabel(label: string): { title: string; sub: string | null } {
  const at = label.indexOf(" · ");
  if (at < 0) return { title: label, sub: null };
  return { title: label.slice(0, at), sub: label.slice(at + 3) };
}

/** 캘린더 항목 하나를 7일 안 어느 날에 넣을지와 줄 모양. 넣지 않으면 null (R31) */
function placeItem(item: CalItem, from: string, to: string): { date: string; row: UpcomingRow } | null {
  switch (item.kind) {
    case "task":
      // 끝나는 날에만 한 번, 완료 태스크는 뺀다
      if (item.done || item.end < from || item.end > to) return null;
      return { date: item.end, row: { kind: "task", key: item.key, title: item.title, color: item.color } };
    case "app":
      return {
        date: item.date,
        row: {
          kind: "app",
          key: item.key,
          title: item.text,
          sub: EVENT_KIND_LABELS[item.eventKind],
          eventKind: item.eventKind,
          time: item.time,
          initial: item.initial,
          badge: item.badge,
        },
      };
    case "flag":
      return { date: item.date, row: { kind: "flag", key: item.key, ...splitFlagLabel(item.label), color: item.color, done: item.done } };
    case "personal": {
      // 여러 날 일정은 7일 안의 첫날에 한 번 넣고 끝날을 붙인다
      const multi = item.start !== item.end;
      return {
        date: item.start < from ? from : item.start,
        row: {
          kind: "personal",
          key: item.key,
          title: item.title,
          time: item.time,
          endLabel: multi ? endLabelOf(item.end) : null,
        },
      };
    }
  }
}

/**
 * 오늘부터 6일 뒤까지 7일을 날짜별로 묶는다 (R29–R32). 항목 없는 날도 rows가 빈 채로 들어간다 (R33).
 * 날짜 안 순서: 시각 있는 것(시각순) → 시각 없는 것(지원 → 깃발 → 개인 → 태스크). 같으면 캘린더가 모은 순서.
 */
export function buildUpcoming(src: CalSources, todayKey: string): UpcomingDay[] {
  const to = addDays(todayKey, UPCOMING_DAYS - 1);
  const days: UpcomingDay[] = [];
  const byDate = new Map<string, UpcomingRow[]>();
  for (let i = 0; i < UPCOMING_DAYS; i++) {
    const dateKey = addDays(todayKey, i);
    const rows: UpcomingRow[] = [];
    days.push({ dateKey, label: dayLabel(i, dateKey), isToday: i === 0, rows });
    byDate.set(dateKey, rows);
  }

  for (const item of buildCalItems(src, todayKey, to)) {
    const placed = placeItem(item, todayKey, to);
    if (placed) byDate.get(placed.date)?.push(placed.row);
  }

  for (const day of days) {
    // sort는 안정 정렬이라 같은 키면 캘린더가 모은 순서를 지킨다
    day.rows.sort((a, b) => {
      const ta = rowTime(a);
      const tb = rowTime(b);
      if (ta !== null && tb !== null) return ta.localeCompare(tb);
      if (ta !== null) return -1;
      if (tb !== null) return 1;
      return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    });
  }
  return days;
}
