import { createContext, useContext, type PointerEvent as ReactPointerEvent } from "react";
import type { Period } from "../../../features/plan/dragMath";

/**
 * 끌 것 종류 (D12):
 * - list-task: 왼쪽 목록의 태스크 줄 → 달력 칸 (R22)
 * - bar-move: 막대 통째로 옮기기 (R25), 왼쪽 목록에 놓으면 날짜 지우기 (R27)
 * - bar-start·bar-end: 막대 왼쪽·오른쪽 끝 끌기 (R26)
 */
export type DragKind = "list-task" | "bar-move" | "bar-start" | "bar-end";

/** 놓을 곳: 달력의 날짜 칸, 또는 왼쪽 목록 영역(`data-drop="list"`) */
export type DropTarget = { kind: "day"; day: string } | { kind: "list" };

export interface PlanDrag {
  kind: DragKind;
  taskId: string;
  /** 지금 놓을 곳. 놓을 수 없는 곳이면 null */
  target: DropTarget | null;
  /** 지금 놓으면 바뀔 기간. 달력 칸 위일 때만 있다 */
  preview: Period | null;
}

export interface PlanDragApi {
  /** 끌기 중이면 그 정보 (4px 넘게 움직인 뒤부터). 아니면 null */
  drag: PlanDrag | null;
  /** 끌 수 있는 요소의 onPointerDown에서 부른다. 4px 안에서 놓으면 그대로 클릭이 된다 */
  startDrag: (e: ReactPointerEvent<HTMLElement>, kind: DragKind, taskId: string) => void;
}

export const PlanDragContext = createContext<PlanDragApi>({ drag: null, startDrag: () => {} });

/** 끄는 모습이 따라갈 포인터 자리 (Provider가 DragGhost에만 넘긴다) */
export interface DragPointer {
  x: number;
  y: number;
  /** 누른 자리가 원래 요소 왼쪽 위에서 떨어진 거리, 원래 요소 너비 */
  offsetX: number;
  offsetY: number;
  width: number;
}

/** 플랜 화면 끌어 놓기 상태와 시작 함수 */
export function usePlanDrag(): PlanDragApi {
  return useContext(PlanDragContext);
}
