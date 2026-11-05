import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { addDays } from "../../../utils/date";

/** 고른 날짜 범위 (start ≤ end, "YYYY-MM-DD") */
export interface DaySelection {
  start: string;
  end: string;
}

interface RangeSelectOptions {
  /** 한 칸 안에서 눌렀다 놓았을 때 (그 칸 날짜) */
  onClick: (day: string) => void;
  /** 여러 칸을 드래그해서 놓았을 때 */
  onRange: (range: DaySelection) => void;
}

/** 이만큼 넘게 움직여야 드래그다 (D10) */
const DRAG_THRESHOLD = 4;

/** 누르기를 시작하지 않는 곳: 칩, "+N", 입력칸 */
const IGNORE_SELECTOR = ".cal-chip, .cal-week-more, .cal-pin";

/** 화면 좌표 아래의 날짜. 주 줄(`.cal-week[data-week]`)의 너비를 7로 나눠 칸을 고른다 */
function dayAt(x: number, y: number): string | null {
  const week = document.elementFromPoint(x, y)?.closest<HTMLElement>(".cal-week[data-week]");
  const weekStart = week?.dataset.week;
  if (!week || !weekStart) return null;
  const rect = week.getBoundingClientRect();
  const col = Math.min(6, Math.max(0, Math.floor(((x - rect.left) / rect.width) * 7)));
  return addDays(weekStart, col);
}

function ordered(a: string, b: string): DaySelection {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

interface Press {
  x: number;
  y: number;
  day: string;
  ranging: boolean;
  last: string; // 마지막으로 지나간 날
}

/**
 * 달력 빈 곳 누르기·드래그 (R23·R24, D10).
 * 빈 곳에서 누른 채 다른 칸으로 4px 넘게 움직이면 범위 모드가 되고, 지나간 칸을 `selecting`으로 내놓는다.
 * 놓을 때 범위 모드면 `onRange`, 한 칸 안에서만 움직였으면 `onClick`.
 * 시작은 마우스 이벤트(mousedown)로 받는다: 작은 창이 열려 있을 때 바깥을 누르면 `useOutsideLayer`가
 * mousedown을 막아 주므로, 창을 닫는 누름이 입력으로 이어지지 않는다 (D15).
 */
export function useRangeSelect({ onClick, onRange }: RangeSelectOptions) {
  const [selecting, setSelecting] = useState<DaySelection | null>(null);
  const press = useRef<Press | null>(null);
  const handlers = useRef({ onClick, onRange });
  handlers.current = { onClick, onRange };

  const stop = useRef<() => void>(() => {});

  const onMouseDown = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest(IGNORE_SELECTOR)) return;
    const day = dayAt(e.clientX, e.clientY);
    if (!day) return;
    // 드래그 중 글자 선택을 막는다. 그러면 포커스가 옮겨 가지 않으므로, 열린 입력칸은 직접 놓게 해 취소시킨다
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    stop.current();
    press.current = { x: e.clientX, y: e.clientY, day, ranging: false, last: day };

    const move = (ev: MouseEvent) => {
      const p = press.current;
      if (!p) return;
      const over = dayAt(ev.clientX, ev.clientY) ?? p.last;
      p.last = over;
      if (!p.ranging) {
        const far = Math.hypot(ev.clientX - p.x, ev.clientY - p.y) > DRAG_THRESHOLD;
        if (!far || over === p.day) return;
        p.ranging = true;
      }
      const next = ordered(p.day, over);
      setSelecting((s) => (s && s.start === next.start && s.end === next.end ? s : next));
    };

    const up = () => {
      const p = press.current;
      cleanup();
      if (!p) return;
      const range = ordered(p.day, p.last);
      if (p.ranging && range.start !== range.end) handlers.current.onRange(range);
      else handlers.current.onClick(p.day);
    };

    const cleanup = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      press.current = null;
      setSelecting(null);
      stop.current = () => {};
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    stop.current = cleanup;
  }, []);

  // 화면을 떠나면 하던 드래그를 버린다
  useEffect(() => () => stop.current(), []);

  return { selecting, onMouseDown };
}
