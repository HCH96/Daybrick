/**
 * 월 달력 주 줄 하나의 칩 자리 계산 (R18, D8). 순수 함수.
 * 칸마다 칩 줄은 4개. 여러 날 막대가 위, 그 아래 하루짜리(시간 있는 것 시간순 → 시간 없는 것 태스크 → 지원 → 깃발 → 개인).
 * 그날 칩이 4줄을 넘치면 1–3줄만 보이고 4번째 줄은 "+N"이다. 4번째 줄을 지나는 막대는 넘친 날에서 끊는다.
 */
import { addDays, diffDays } from "../../utils/date";
import { itemRange, type CalItem } from "./items";

/** 칸 하나의 칩 줄 수 */
export const CHIP_ROWS = 4;

/** 칩 하나의 자리 */
export interface ChipSlot {
  item: CalItem;
  col: number; // 0(월) ~ 6(일)
  span: number; // 1 ~ 7칸
  row: number; // 0 ~ 3, 위에서 몇 번째 칩 줄
  cutLeft: boolean; // 왼쪽이 잘림 (주 경계 또는 넘친 날에서 끊김)
  cutRight: boolean;
}

/** 넘친 날의 "+N" (4번째 줄 자리) */
export interface DayMore {
  col: number;
  count: number; // 숨긴 칩 수
  items: CalItem[]; // 그날 칩 전부, 칸과 같은 순서 (+N 목록용)
}

export interface WeekLayout {
  slots: ChipSlot[];
  more: DayMore[];
}

/** 여러 날 막대 하나의 자리 (플랜 주간 달력의 개인 일정 층도 쓴다) */
export interface ItemBar {
  item: CalItem;
  col: number;
  span: number;
  lane: number;
  cutLeft: boolean;
  cutRight: boolean;
}

const KIND_RANK: Record<CalItem["kind"], number> = { task: 0, app: 1, flag: 2, personal: 3 };

function itemTime(item: CalItem): string | null {
  return item.kind === "app" || item.kind === "personal" ? item.time : null;
}

function itemCreatedAt(item: CalItem): string {
  return item.kind === "task" || item.kind === "personal" ? item.createdAt : "";
}

/** 여러 날 막대인지 (태스크·개인 일정 중 시작일과 끝일이 다른 것) */
function isMultiDay(item: CalItem): boolean {
  const r = itemRange(item);
  return r.start !== r.end;
}

/** 막대를 플랜 주간 달력(`layoutWeekBars`)과 같은 규칙으로 줄에 놓는다: 시작 칸 → 긴 것 → 만든 순 */
export function layoutBars(items: CalItem[], weekStart: string, weekEnd: string): ItemBar[] {
  const placed = items
    .map((item) => {
      const r = itemRange(item);
      const from = r.start < weekStart ? weekStart : r.start;
      const to = r.end > weekEnd ? weekEnd : r.end;
      return {
        item,
        col: diffDays(weekStart, from),
        span: diffDays(from, to) + 1,
        cutLeft: r.start < weekStart,
        cutRight: r.end > weekEnd,
      };
    })
    .sort(
      (a, b) => a.col - b.col || b.span - a.span || itemCreatedAt(a.item).localeCompare(itemCreatedAt(b.item)),
    );

  const laneEnds: number[] = []; // 줄마다 마지막으로 차지한 칸
  return placed.map((p) => {
    let lane = laneEnds.findIndex((end) => end < p.col);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = p.col + p.span - 1;
    return { ...p, lane };
  });
}

/** 하루짜리 순서: 시간 있는 것(시간순) → 시간 없는 것(태스크 → 지원 → 깃발 → 개인). 같으면 들어온 순서 */
export function compareSingles(a: CalItem, b: CalItem): number {
  const ta = itemTime(a);
  const tb = itemTime(b);
  if (ta !== null && tb !== null) return ta.localeCompare(tb) || KIND_RANK[a.kind] - KIND_RANK[b.kind];
  if (ta !== null) return -1;
  if (tb !== null) return 1;
  return KIND_RANK[a.kind] - KIND_RANK[b.kind];
}

/** 한 주(weekStart = 월요일)의 칩 자리와 +N. items에는 이 주 밖의 항목이 섞여 있어도 된다. */
export function layoutWeek(items: CalItem[], weekStart: string): WeekLayout {
  const weekEnd = addDays(weekStart, 6);
  const inWeek = items.filter((item) => {
    const r = itemRange(item);
    return r.start <= weekEnd && r.end >= weekStart;
  });

  const bars = layoutBars(inWeek.filter(isMultiDay), weekStart, weekEnd);
  const singles = inWeek.filter((item) => !isMultiDay(item)).sort(compareSingles);

  const slots: ChipSlot[] = [];
  const more: DayMore[] = [];
  const overflow: boolean[] = [];

  // 칸마다: 그날을 지나는 막대 줄 다음부터 하루짜리를 쌓는다
  for (let col = 0; col < 7; col++) {
    const day = addDays(weekStart, col);
    const dayBars = bars.filter((b) => b.col <= col && col < b.col + b.span).sort((a, b) => a.lane - b.lane);
    const daySingles = singles.filter((item) => itemRange(item).start === day);
    const base = dayBars.reduce((max, b) => Math.max(max, b.lane + 1), 0);
    const rowsNeeded = daySingles.length > 0 ? base + daySingles.length : base;
    const isOver = rowsNeeded > CHIP_ROWS;
    overflow.push(isOver);

    const lastRow = isOver ? CHIP_ROWS - 2 : CHIP_ROWS - 1; // 넘치면 4번째 줄은 +N 자리
    let shown = dayBars.filter((b) => b.lane <= lastRow).length;
    daySingles.forEach((item, i) => {
      const row = base + i;
      if (row > lastRow) return;
      shown += 1;
      slots.push({ item, col, span: 1, row, cutLeft: false, cutRight: false });
    });

    if (isOver) {
      const dayItems = [...dayBars.map((b) => b.item), ...daySingles];
      more.push({ col, count: dayItems.length - shown, items: dayItems });
    }
  }

  // 막대: 1–3줄은 그대로, 4번째 줄은 넘친 날에서 끊어 조각으로, 5번째 줄 이하는 숨김
  for (const bar of bars) {
    if (bar.lane < CHIP_ROWS - 1) {
      slots.push({ item: bar.item, col: bar.col, span: bar.span, row: bar.lane, cutLeft: bar.cutLeft, cutRight: bar.cutRight });
      continue;
    }
    if (bar.lane > CHIP_ROWS - 1) continue;
    let pieceStart = -1;
    for (let col = bar.col; col <= bar.col + bar.span; col++) {
      const visible = col < bar.col + bar.span && !overflow[col];
      if (visible && pieceStart < 0) pieceStart = col;
      if (!visible && pieceStart >= 0) {
        const pieceEnd = col - 1;
        slots.push({
          item: bar.item,
          col: pieceStart,
          span: pieceEnd - pieceStart + 1,
          row: bar.lane,
          cutLeft: pieceStart > bar.col || bar.cutLeft,
          cutRight: pieceEnd < bar.col + bar.span - 1 || bar.cutRight,
        });
        pieceStart = -1;
      }
    }
  }

  return { slots, more };
}
