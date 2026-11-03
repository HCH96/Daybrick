import { createContext, useContext, type PointerEvent as ReactPointerEvent } from "react";
import type { Period } from "../../../features/plan/dragMath";
import { NONE_GROUP_KEY } from "../../../features/plan/selectors";

/**
 * 끌 것 종류 (D12):
 * - list-task: 왼쪽 목록의 태스크 줄 → 달력 칸 (R22), 또는 다른 카테고리 묶음 (R45)
 * - bar-move: 막대 통째로 옮기기 (R25), 왼쪽 목록에 놓으면 날짜 지우기 (R27)
 * - bar-start·bar-end: 막대 왼쪽·오른쪽 끝 끌기 (R26)
 */
export type DragKind = "list-task" | "bar-move" | "bar-start" | "bar-end";

/**
 * 놓을 곳: 달력의 날짜 칸, 왼쪽 목록 영역(`data-drop="list"`, 막대 옮기기만),
 * 카테고리 묶음(`data-drop-group="<id|none>"`, 목록 줄 끌기만). 미분류 묶음은 categoryId가 null (D22·D31),
 * 프로젝트 단계 묶음(`data-drop-stage="<단계 id>"`, 목록 줄 끌기만, 프로젝트 R50)
 */
export type DropTarget =
  | { kind: "day"; day: string }
  | { kind: "list" }
  | { kind: "group"; categoryId: string | null }
  | { kind: "stage"; stageId: string };

/** 묶음 요소의 `data-drop-group` 값 (미분류는 `NONE_GROUP_KEY`) */
export function dropGroupValue(categoryId: string | null): string {
  return categoryId ?? NONE_GROUP_KEY;
}

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

/** 끌고 있는 목록 줄을 이 묶음(미분류는 null)에 놓으려는 중인지 (R45) */
export function useGroupDropHere(categoryId: string | null): boolean {
  const { drag } = usePlanDrag();
  return drag?.kind === "list-task" && drag.target?.kind === "group" && drag.target.categoryId === categoryId;
}

/** 끌고 있는 목록 줄을 이 프로젝트 단계 묶음에 놓으려는 중인지 (프로젝트 R50) */
export function useStageDropHere(stageId: string): boolean {
  const { drag } = usePlanDrag();
  return drag?.kind === "list-task" && drag.target?.kind === "stage" && drag.target.stageId === stageId;
}

/** 이 태스크 줄을 목록에서 끌고 있는지 (원래 자리를 점선으로, R45) */
export function useIsDraggingRow(taskId: string): boolean {
  const { drag } = usePlanDrag();
  return drag?.kind === "list-task" && drag.taskId === taskId;
}
