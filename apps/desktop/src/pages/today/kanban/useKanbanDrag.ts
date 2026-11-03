import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { TaskStatus } from "../../../features/plan/types";

/** 이만큼(px) 넘게 움직이면 끌기, 아니면 클릭 (플랜 D12와 같은 기준) */
const DRAG_THRESHOLD = 4;

const STATUSES: readonly TaskStatus[] = ["todo", "doing", "done"];

/** 끄는 중인 카드와 포인터 위치 */
export interface KanbanDrag {
  taskId: string;
  /** 카드가 원래 있던 열 */
  from: TaskStatus;
  /** 포인터 아래 열, 열 밖이면 null */
  over: TaskStatus | null;
  x: number;
  y: number;
  /** 누른 점이 카드 왼쪽 위에서 떨어진 거리 */
  offsetX: number;
  offsetY: number;
  width: number;
}

export interface KanbanDragApi {
  drag: KanbanDrag | null;
  /** 카드의 onPointerDown에 단다 */
  onCardPointerDown: (e: ReactPointerEvent<HTMLElement>, taskId: string, from: TaskStatus) => void;
  /** 방금 끌기(또는 Esc 취소)가 끝나 뒤따르는 클릭을 무시해야 하면 true */
  clickSuppressed: () => boolean;
}

/** 포인터 아래 열의 상태 (`data-drop-status`) */
function findDropStatus(x: number, y: number): TaskStatus | null {
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drop-status]");
  const value = el?.dataset.dropStatus;
  return STATUSES.find((s) => s === value) ?? null;
}

/**
 * 칸반 카드 끌기 상태 기계 (R13): 대기 → 누름 → 4px 넘으면 끄는 중 → 놓음.
 * 누른 동안만 창에 포인터·키 이벤트를 단다. 4px 안에서 떼면 그냥 클릭(상세 팝업, R14)이다.
 * ▶·자물쇠 버튼(또는 카드 밖에 그려진 말풍선) 위에서 누르면 시작하지 않는다.
 * Esc는 끌기를 취소하고, 이어지는 떼기·클릭은 무시한다.
 */
export function useKanbanDrag(onDrop: (taskId: string, from: TaskStatus, to: TaskStatus) => void): KanbanDragApi {
  const [drag, setDrag] = useState<KanbanDrag | null>(null);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;
  const suppressRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // 화면이 사라지면 달아 둔 이벤트를 뗀다
  useEffect(() => () => cleanupRef.current?.(), []);

  const suppressNextClick = () => {
    suppressRef.current = true;
    // 떼기 바로 뒤 같은 작업 안에서 오는 클릭만 막는다
    window.setTimeout(() => {
      suppressRef.current = false;
    }, 0);
  };

  const onCardPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>, taskId: string, from: TaskStatus) => {
    if (e.button !== 0) return;
    const target = e.target as Element;
    if (!e.currentTarget.contains(target) || target.closest("button") !== null) return;
    cleanupRef.current?.();

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;
    let cancelled = false;

    const end = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", onCancel);
      document.body.classList.remove("kanban-dragging");
      cleanupRef.current = null;
      setDrag(null);
    };

    const onMove = (ev: PointerEvent) => {
      if (cancelled) return;
      if (!dragging) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) <= DRAG_THRESHOLD) return;
        dragging = true;
        document.body.classList.add("kanban-dragging");
      }
      ev.preventDefault();
      setDrag({
        taskId,
        from,
        over: findDropStatus(ev.clientX, ev.clientY),
        x: ev.clientX,
        y: ev.clientY,
        offsetX: startX - rect.left,
        offsetY: startY - rect.top,
        width: rect.width,
      });
    };

    const onUp = (ev: PointerEvent) => {
      const wasDragging = dragging && !cancelled;
      if (dragging || cancelled) suppressNextClick();
      end();
      if (!wasDragging) return;
      const to = findDropStatus(ev.clientX, ev.clientY);
      if (to !== null && to !== from) onDropRef.current(taskId, from, to);
    };

    const onCancel = () => {
      if (dragging) suppressNextClick();
      end();
    };

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape" || !dragging || cancelled) return;
      ev.preventDefault();
      ev.stopPropagation();
      // 제자리로 돌리고, 손을 뗄 때까지 기다렸다가 클릭을 막는다
      cancelled = true;
      document.body.classList.remove("kanban-dragging");
      setDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", onCancel);
    cleanupRef.current = end;
  }, []);

  const clickSuppressed = useCallback(() => suppressRef.current, []);

  return { drag, onCardPointerDown, clickSuppressed };
}
