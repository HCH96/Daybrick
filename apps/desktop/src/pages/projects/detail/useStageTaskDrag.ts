import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { usePlan } from "../../../features/plan/store";

/** 4px 넘게 움직여야 끄는 것으로 본다. 그 전에 놓으면 그냥 클릭 (플랜 끌기와 같음) */
const DRAG_THRESHOLD = 4;

/** 끄는 모습 자리: 포인터 위치와 줄 안에서 잡은 곳, 줄 너비 */
export interface StageDragPointer {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
}

/** 끄는 중인 태스크와 지금 포인터 아래 칸 (`data-drop-stage`) */
export interface StageDrag {
  taskId: string;
  fromStageId: string;
  overStageId: string | null;
  pointer: StageDragPointer;
}

interface Pending {
  taskId: string;
  fromStageId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  dragging: boolean;
}

/** 포인터 아래 단계 칸 id (끄는 모습은 pointer-events: none이라 가리지 않는다) */
function stageAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  const column = el instanceof Element ? el.closest<HTMLElement>("[data-drop-stage]") : null;
  return column?.dataset.dropStage ?? null;
}

/**
 * 단계 칸 사이 태스크 끌어 옮기기 (프로젝트 R34).
 * 줄을 누르고 4px 넘게 움직이면 끄는 중, 놓은 칸이 다른 단계면 `updateTask(id, { stageId })`.
 * 같은 칸·칸 밖에 놓으면 그대로. 끈 뒤 바로 오는 클릭(상세 팝업 열기)은 막는다.
 */
export function useStageTaskDrag() {
  const { updateTask } = usePlan();
  const [drag, setDrag] = useState<StageDrag | null>(null);
  const pending = useRef<Pending | null>(null);
  const [active, setActive] = useState(false);

  const startDrag = useCallback((e: ReactPointerEvent<HTMLElement>, taskId: string, fromStageId: string) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pending.current = {
      taskId,
      fromStageId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      dragging: false,
    };
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;

    const onMove = (e: PointerEvent) => {
      const p = pending.current;
      if (!p) return;
      if (!p.dragging) {
        if (Math.hypot(e.clientX - p.startX, e.clientY - p.startY) <= DRAG_THRESHOLD) return;
        p.dragging = true;
      }
      e.preventDefault();
      setDrag({
        taskId: p.taskId,
        fromStageId: p.fromStageId,
        overStageId: stageAt(e.clientX, e.clientY),
        pointer: { x: e.clientX, y: e.clientY, offsetX: p.offsetX, offsetY: p.offsetY, width: p.width },
      });
    };

    const finish = (e: PointerEvent, drop: boolean) => {
      const p = pending.current;
      pending.current = null;
      setActive(false);
      setDrag(null);
      if (!p?.dragging) return;
      // 끈 뒤에 오는 클릭이 줄 클릭(팝업 열기)으로 번지지 않게
      const stopClick = (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      window.addEventListener("click", stopClick, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", stopClick, { capture: true }), 0);
      if (!drop) return;
      const target = stageAt(e.clientX, e.clientY);
      if (target && target !== p.fromStageId) updateTask(p.taskId, { stageId: target });
    };

    const onUp = (e: PointerEvent) => finish(e, true);
    const onCancel = (e: PointerEvent) => finish(e, false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [active, updateTask]);

  return { drag, startDrag };
}
