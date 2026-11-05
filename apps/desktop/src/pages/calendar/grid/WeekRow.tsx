import { CHIP_ROWS, type WeekLayout } from "../../../features/calendar/monthLayout";
import { diffDays } from "../../../utils/date";
import type { CalendarCell } from "../../../utils/calendarGrid";
import CalChip, { type CalOpenHandler } from "../chips/CalChip";
import MoreButton from "../more/MoreButton";
import QuickInput from "../personal/QuickInput";
import RangeInput from "../personal/RangeInput";
import DayCell from "./DayCell";
import type { ChipDrag } from "../drag/useCalendarDrag";
import type { DaySelection } from "./useRangeSelect";

/** 입력 중인 새 개인 일정: quick = 빈 곳 누르기(하루짜리), range = 드래그(기간) */
export interface PersonalDraft extends DaySelection {
  kind: "quick" | "range";
}

interface WeekRowProps {
  week: CalendarCell[]; // 월~일 7칸
  todayKey: string;
  isFirstWeek: boolean;
  isLastWeek: boolean; // 맨 아래 주면 입력칸 안내를 위로 띄운다 (달력 아래에서 잘리지 않게)
  layout: WeekLayout; // 이 주의 칩 자리와 +N (monthLayout)
  onOpen: CalOpenHandler; // 칩을 눌렀을 때 (R19)
  selection: DaySelection | null; // 보라로 묶을 범위 (R24)
  draft: PersonalDraft | null; // 이 주에서 시작하면 입력칸을 그린다
  onDraftSubmit: (title: string) => void;
  onDraftCancel: () => void;
  chipDrag?: ChipDrag; // 칩 옮기기 (밀려나는 달 page에는 없음, R35)
  drop?: DaySelection | null; // 끄는 칩이 놓일 기간
  reviewDay?: string | null; // 회고 패널로 고른 지난 날 (R42)
}

/** col부터 span칸에서 칩이 하나도 없는 맨 위 칩 줄. 없으면 마지막 줄(입력칸이 덮는다) */
function freeRow(layout: WeekLayout, col: number, span: number): number {
  const last = col + span - 1;
  const used = new Set<number>();
  for (const s of layout.slots) {
    if (s.col <= last && s.col + s.span - 1 >= col) used.add(s.row);
  }
  if (layout.more.some((m) => m.col >= col && m.col <= last)) used.add(CHIP_ROWS - 1);
  for (let row = 0; row < CHIP_ROWS; row++) if (!used.has(row)) return row;
  return CHIP_ROWS - 1;
}

/**
 * 주 줄 하나 (목업 .week). 뒤에 7칸 배경(날짜 숫자 포함)을 깔고,
 * 앞쪽 그리드(열 7, 1행 날짜 자리 + 칩 줄 4)에 칩과 +N을 열·폭·줄 자리로 놓는다 (D12).
 * 새 개인 일정 입력칸은 그 칸(범위면 범위 첫 주 줄)의 빈 줄에 칩 모양으로 놓는다 (R23·R24).
 * 칩을 끄는 중이면 놓일 기간이 이 주에 걸친 만큼 빈 줄에 보라 점선 자리를 그린다 (R35).
 */
function WeekRow({
  week,
  todayKey,
  isFirstWeek,
  isLastWeek,
  layout,
  onOpen,
  selection,
  draft,
  onDraftSubmit,
  onDraftCancel,
  chipDrag,
  drop = null,
  reviewDay = null,
}: WeekRowProps) {
  const weekStart = week[0].key;
  const weekEnd = week[6].key;
  const pin = draft && draft.start >= weekStart && draft.start <= weekEnd ? draft : null;

  let pinView = null;
  if (pin) {
    const col = diffDays(weekStart, pin.start);
    const span = pin.kind === "range" ? Math.min(diffDays(pin.start, pin.end), 6 - col) + 1 : 1;
    const style = { gridColumn: `${col + 1} / span ${span}`, gridRow: freeRow(layout, col, span) + 2 };
    pinView =
      pin.kind === "range" ? (
        <RangeInput key={`${pin.start}~${pin.end}`} range={pin} style={style} hintAbove={isLastWeek} onSubmit={onDraftSubmit} onCancel={onDraftCancel} />
      ) : (
        <QuickInput key={pin.start} style={style} hintAbove={isLastWeek} onSubmit={onDraftSubmit} onCancel={onDraftCancel} />
      );
  }

  let dropSlot = null;
  if (drop && drop.start <= weekEnd && drop.end >= weekStart) {
    const col = Math.max(0, diffDays(weekStart, drop.start));
    const span = Math.min(6, diffDays(weekStart, drop.end)) - col + 1;
    dropSlot = (
      <div className="cal-drop-slot" style={{ gridColumn: `${col + 1} / span ${span}`, gridRow: freeRow(layout, col, span) + 2 }} />
    );
  }

  return (
    <div className={pin ? "cal-week cal-week--pin" : "cal-week"} data-week={weekStart}>
      <div className="cal-week__bg">
        {week.map((cell, i) => (
          <DayCell
            key={cell.key}
            cell={cell}
            todayKey={todayKey}
            showMonth={(isFirstWeek && i === 0) || cell.date.getDate() === 1}
            selection={selection}
            drop={drop}
            reviewed={cell.key === reviewDay}
          />
        ))}
      </div>
      {layout.slots.map((slot) => (
        <CalChip key={`${slot.item.key}@${slot.col}`} slot={slot} onOpen={onOpen} drag={chipDrag} />
      ))}
      {dropSlot}
      {layout.more.map((m) => (
        <MoreButton key={`more@${m.col}`} more={m} date={week[m.col].date} onOpen={onOpen} />
      ))}
      {pinView}
    </div>
  );
}

export default WeekRow;
