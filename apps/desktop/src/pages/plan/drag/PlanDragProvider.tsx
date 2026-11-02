import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { moveBy, placeOnDay, resizeEnd, resizeStart, samePeriod, type Period } from "../../../features/plan/dragMath";
import { usePlan } from "../../../features/plan/store";
import type { Task } from "../../../features/plan/types";
import { diffDays } from "../../../utils/date";
import DragGhost from "./DragGhost";
import { PlanDragContext, type DragKind, type DragPointer, type DropTarget, type PlanDrag } from "./usePlanDrag";
import "./drag.css";

/** 이만큼 넘게 움직여야 끌기로 본다. 그 전에 놓으면 클릭 (D12) */
const DRAG_THRESHOLD = 4;

/**
 * 달력(`data-drop="calendar"`) 안 x 위치의 날짜. 막대 층이 세로줄 위를 덮으므로
 * 요소를 찾지 않고 `.plan-cols` 사각형을 7칸으로 나눠 계산한다 (D21의 `data-day` 세로줄).
 */
function dayInCalendar(calendar: Element, x: number): string | null {
  const cols = calendar.querySelector(".plan-cols");
  const cells = cols ? Array.from(cols.querySelectorAll<HTMLElement>("[data-day]")) : [];
  if (!cols || cells.length === 0) return null;
  const rect = cols.getBoundingClientRect();
  if (rect.width <= 0) return null;
  const index = Math.min(cells.length - 1, Math.max(0, Math.floor(((x - rect.left) / rect.width) * cells.length)));
  return cells[index].dataset.day ?? null;
}

/** 포인터 아래 놓을 곳. 목록 영역은 막대 옮기기만 받는다 (R27) */
function findTarget(x: number, y: number, kind: DragKind): DropTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  if (kind === "bar-move" && el.closest('[data-drop="list"]')) return { kind: "list" };
  const calendar = el.closest('[data-drop="calendar"]');
  if (!calendar) return null;
  const day = dayInCalendar(calendar, x);
  return day ? { kind: "day", day } : null;
}

/** 달력 칸에 놓으면 바뀔 기간 (R22·R25·R26) */
function previewFor(kind: DragKind, task: Task, grabDay: string | null, target: DropTarget | null): Period | null {
  if (target?.kind !== "day") return null;
  switch (kind) {
    case "list-task":
      return placeOnDay(task, target.day);
    case "bar-move":
      return grabDay ? moveBy(task, diffDays(grabDay, target.day)) : null;
    case "bar-start":
      return resizeStart(task, target.day);
    case "bar-end":
      return resizeEnd(task, target.day);
  }
}

function sameDrag(a: PlanDrag | null, b: PlanDrag): boolean {
  if (!a) return false;
  const sameTarget =
    a.target === b.target ||
    (a.target !== null &&
      b.target !== null &&
      a.target.kind === b.target.kind &&
      (a.target.kind === "list" || (b.target.kind === "day" && a.target.day === b.target.day)));
  const samePreview = a.preview === b.preview || (a.preview !== null && b.preview !== null && samePeriod(a.preview, b.preview));
  return sameTarget && samePreview;
}

/**
 * 플랜 화면 끌어 놓기 (D12): 목록 태스크 → 달력, 막대 옮기기·끝 끌기, 막대 → 목록(날짜 지우기).
 * 포인터를 누르고 4px 넘게 움직이면 끌기를 시작하고, 놓으면 기간만 바꾼다. Esc는 취소.
 */
function PlanDragProvider({ children }: { children: ReactNode }) {
  const { state, updateTask } = usePlan();
  const tasksRef = useRef<Task[]>([]);
  useEffect(() => {
    tasksRef.current = state.kind === "ready" ? state.data.tasks : [];
  }, [state]);
  const [drag, setDrag] = useState<PlanDrag | null>(null);
  const [pointer, setPointer] = useState<DragPointer | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);

  const startDrag = useCallback(
    (e: ReactPointerEvent<HTMLElement>, kind: DragKind, taskId: string) => {
      if (e.button !== 0) return;
      // 안쪽 버튼(상태 표시 등)·입력칸에서 누른 것은 끌기로 보지 않는다
      const interactive = (e.target as HTMLElement).closest("button, input, textarea, a");
      if (interactive && !interactive.contains(e.currentTarget)) return;
      const task = tasksRef.current.find((t) => t.id === taskId);
      if (!task) return;
      if (kind !== "list-task" && task.start === null) return;

      const el = e.currentTarget;
      const pointerId = e.pointerId;
      const startX = e.clientX;
      const startY = e.clientY;
      const rect = el.getBoundingClientRect();
      const calendar = el.closest('[data-drop="calendar"]');
      const grabDay = kind === "bar-move" && calendar ? dayInCalendar(calendar, startX) : null;
      if (kind === "bar-move" && !grabDay) return;

      let dragging = false;
      let current: PlanDrag | null = null;

      const onPointerMove = (ev: PointerEvent) => {
        if (!dragging) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) <= DRAG_THRESHOLD) return;
          dragging = true;
          window.getSelection()?.removeAllRanges();
          document.body.style.userSelect = "none";
          document.body.style.cursor = kind === "bar-start" || kind === "bar-end" ? "ew-resize" : "grabbing";
          try {
            el.setPointerCapture(pointerId);
          } catch {
            // 이미 손을 뗐으면 잡지 못한다. 창 이벤트로 계속 따라간다.
          }
        }
        setPointer({ x: ev.clientX, y: ev.clientY, offsetX: startX - rect.left, offsetY: startY - rect.top, width: rect.width });
        const target = findTarget(ev.clientX, ev.clientY, kind);
        const next: PlanDrag = { kind, taskId, target, preview: previewFor(kind, task, grabDay, target) };
        if (!sameDrag(current, next)) {
          current = next;
          setDrag(next);
        }
      };

      const finish = (drop: boolean) => {
        cleanup.current?.();
        if (!dragging) return;
        setDrag(null);
        setPointer(null);
        // 끌고 난 뒤 이어지는 클릭(팝업 열기)이 눌리지 않게 한 번 막는다
        const stopClick = (ev: MouseEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        window.addEventListener("click", stopClick, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", stopClick, { capture: true }), 0);
        if (!drop || !current) return;
        if (current.target?.kind === "list") {
          // 목록에 놓으면 날짜 지우기. 이미 날짜 없음이면 아무것도 안 함 (R27)
          if (task.start !== null) updateTask(taskId, { start: null, end: null });
        } else if (current.preview && !samePeriod(current.preview, task)) {
          updateTask(taskId, current.preview);
        }
      };

      const onPointerUp = () => finish(true);
      const onPointerCancel = () => finish(false);
      const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === "Escape" && dragging) {
          ev.preventDefault();
          finish(false);
        }
      };

      cleanup.current?.();
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
      window.addEventListener("keydown", onKeyDown, { capture: true });
      cleanup.current = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerCancel);
        window.removeEventListener("keydown", onKeyDown, { capture: true });
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
        cleanup.current = null;
      };
    },
    [updateTask],
  );

  const value = useMemo(() => ({ drag, startDrag }), [drag, startDrag]);

  return (
    <PlanDragContext.Provider value={value}>
      {children}
      {drag && pointer && <DragGhost drag={drag} pointer={pointer} />}
    </PlanDragContext.Provider>
  );
}

export default PlanDragProvider;
