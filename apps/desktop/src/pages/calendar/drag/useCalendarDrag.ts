import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { itemRange, type CalItem } from "../../../features/calendar/items";
import { useCalendar } from "../../../features/calendar/store";
import { moveBy } from "../../../features/plan/dragMath";
import { usePlan } from "../../../features/plan/store";
import { addDays, diffDays } from "../../../utils/date";
import { dayAt, type DaySelection } from "../grid/useRangeSelect";

/** 끄는 중인 칩 */
export interface CalDragState {
  item: CalItem;
  drop: DaySelection | null; // 놓일 기간 (그리드 밖이면 null)
  ghost: { left: number; top: number; width: number }; // 떠 있는 칩의 처음 자리 (화면 좌표)
}

/** 주 줄의 칩이 받는 드래그 연결 (MonthGrid → MonthPage → WeekRow → CalChip) */
export interface ChipDrag {
  onChipDown: (item: CalItem, e: ReactMouseEvent<HTMLElement>) => void;
  dragKey: string | null; // 끄는 중인 칩 (원래 자리를 흐리게)
  bounceKey: string | null; // 방금 놓은 칩 (튀어오름, R37)
  shakeKey: string | null; // 끌려다 막힌 칩 (흔들림, R36)
}

/** 이만큼 넘게 움직여야 드래그다 (D10) */
const DRAG_THRESHOLD = 4;
/** 애니메이션(튀어오름 280ms, 흔들림 260ms)이 끝난 뒤 표시를 지운다 */
const BOUNCE_MS = 320;
const SHAKE_MS = 300;

interface Press {
  item: CalItem;
  x: number;
  y: number;
  grabDay: string; // 잡은 칸 날짜 (막대 안 어느 칸인지 포함)
  offX: number; // 칩 안에서 잡은 자리
  offY: number;
  width: number;
  phase: "press" | "drag" | "done"; // done = 흔들림·Esc로 끝났지만 놓기를 기다림
  drop: DaySelection | null;
}

function sameRange(a: DaySelection | null, b: DaySelection | null): boolean {
  return a === b || (a !== null && b !== null && a.start === b.start && a.end === b.end);
}

/** 드래그 뒤 따라오는 click을 한 번 삼킨다 (편집 팝오버·상세가 열리지 않게) */
function swallowNextClick() {
  const block = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
  };
  window.addEventListener("click", block, { capture: true, once: true });
  window.setTimeout(() => window.removeEventListener("click", block, true), 0);
}

/**
 * 달력 칩 옮기기 (R35–R40, D2·D10).
 * 칩에서 누른 채 4px 넘게 움직이면 드래그다. 태스크·개인 일정은 떠 있는 칩이 포인터를 따라가고
 * 놓일 기간을 `drag.drop`으로 내놓는다. 놓으면 (놓은 날 − 잡은 날)만큼 옮기고 새 칩이 튀어오른다.
 * 지원·깃발은 옮기지 않고 흔들기만 한다. 4px 이하로 놓으면 원래 누르기(click)가 그대로 처리된다.
 * 그리드 밖에 놓거나 Esc → 취소. 칸은 `dayAt`(주 줄 너비 ÷ 7, D15)으로 찾는다.
 */
export function useCalendarDrag({ onStart }: { onStart: () => void }) {
  const { updateTask } = usePlan();
  const { moveEvent } = useCalendar();
  const [drag, setDrag] = useState<CalDragState | null>(null);
  const [bounceKey, setBounceKey] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const stop = useRef<() => void>(() => {});
  const timers = useRef<number[]>([]);
  const latest = useRef({ updateTask, moveEvent, onStart });
  latest.current = { updateTask, moveEvent, onStart };

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const onChipDown = useCallback((item: CalItem, e: ReactMouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const grabDay = dayAt(e.clientX, e.clientY);
    if (!grabDay) return;
    // 끄는 중 글자 선택을 막는다. 포커스가 옮겨 가지 않으므로 열린 입력칸은 직접 놓게 해 취소시킨다
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    stop.current();

    const rect = e.currentTarget.getBoundingClientRect();
    const locked = item.kind === "app" || item.kind === "flag"; // D2
    const range = itemRange(item);
    const p: Press = {
      item,
      x: e.clientX,
      y: e.clientY,
      grabDay,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      width: rect.width,
      phase: "press",
      drop: null,
    };

    const dropAt = (x: number, y: number): DaySelection | null => {
      const over = dayAt(x, y);
      if (!over) return null;
      const days = diffDays(grabDay, over);
      return { start: addDays(range.start, days), end: addDays(range.end, days) };
    };

    const move = (ev: MouseEvent) => {
      if (p.phase === "press") {
        if (Math.hypot(ev.clientX - p.x, ev.clientY - p.y) <= DRAG_THRESHOLD) return;
        if (locked) {
          p.phase = "done";
          setShakeKey(item.key);
          later(() => setShakeKey((k) => (k === item.key ? null : k)), SHAKE_MS);
          return;
        }
        p.phase = "drag";
        latest.current.onStart();
        document.body.classList.add("cal-dragging");
        p.drop = dropAt(ev.clientX, ev.clientY);
        setDrag({ item, drop: p.drop, ghost: { left: ev.clientX - p.offX, top: ev.clientY - p.offY, width: p.width } });
        return;
      }
      if (p.phase !== "drag") return;
      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.left = `${ev.clientX - p.offX}px`;
        ghost.style.top = `${ev.clientY - p.offY}px`;
      }
      const drop = dropAt(ev.clientX, ev.clientY);
      if (!sameRange(drop, p.drop)) {
        p.drop = drop;
        setDrag((d) => (d ? { ...d, drop } : d));
      }
    };

    const up = (ev: MouseEvent) => {
      const phase = p.phase;
      cleanup();
      if (phase === "press") return; // 누르기: 뒤따르는 click이 창을 연다
      swallowNextClick();
      if (phase !== "drag") return;
      const drop = dropAt(ev.clientX, ev.clientY);
      if (!drop) return; // 그리드 밖 → 취소
      const days = diffDays(range.start, drop.start);
      if (days === 0) return;
      if (item.kind === "task") latest.current.updateTask(item.taskId, moveBy(item, days));
      else if (item.kind === "personal") latest.current.moveEvent(item.eventId, days);
      setBounceKey(item.key);
      later(() => setBounceKey((k) => (k === item.key ? null : k)), BOUNCE_MS);
    };

    const key = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape" || p.phase !== "drag") return;
      ev.preventDefault();
      p.phase = "done";
      document.body.classList.remove("cal-dragging");
      setDrag(null);
    };

    const cleanup = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("keydown", key, true);
      document.body.classList.remove("cal-dragging");
      setDrag(null);
      stop.current = () => {};
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("keydown", key, true);
    stop.current = cleanup;
  }, []);

  // 화면을 떠나면 하던 드래그와 남은 타이머를 버린다
  useEffect(
    () => () => {
      stop.current();
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const dragKey = drag?.item.key ?? null;
  const chipDrag = useMemo<ChipDrag>(
    () => ({ onChipDown, dragKey, bounceKey, shakeKey }),
    [onChipDown, dragKey, bounceKey, shakeKey],
  );

  return { drag, ghostRef, chipDrag };
}
