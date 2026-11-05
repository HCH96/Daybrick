import type { CSSProperties } from "react";
import { diffDays, parseDateKey } from "../../../utils/date";
import type { DaySelection } from "../grid/useRangeSelect";
import QuickInput from "./QuickInput";

interface RangeInputProps {
  range: DaySelection;
  style: CSSProperties; // 범위 첫 주 줄 안 자리 (범위 너비)
  hintAbove: boolean;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

/** "11/23" 모양 */
function shortDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * 드래그로 고른 범위의 제목 입력 막대 (목업 part-personal 5-2, R24).
 * 범위 첫 주 줄에 범위 너비로 놓이고, 아래 안내에 기간과 일수를 보여준다. Enter = 기간 일정 저장.
 */
function RangeInput({ range, style, hintAbove, onSubmit, onCancel }: RangeInputProps) {
  const days = diffDays(range.start, range.end) + 1;
  return (
    <QuickInput
      style={style}
      hintAbove={hintAbove}
      placeholder="기간 일정 제목"
      hintLead={`${shortDate(range.start)} – ${shortDate(range.end)} · ${days}일  `}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}

export default RangeInput;
