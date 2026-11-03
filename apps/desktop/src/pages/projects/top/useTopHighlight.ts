import { useCallback, useState } from "react";

/** 목록 윗줄 서로 강조 상태 (프로젝트 R58–R59): 마우스가 올라간 버블 원·범례의 프로젝트, 잔디 칸의 날짜 */
export interface TopHighlight {
  projectId: string | null;
  dayKey: string | null;
}

const NONE: TopHighlight = { projectId: null, dayKey: null };

/** 버블 ↔ 잔디 서로 강조. 같은 값이면 상태를 바꾸지 않는다 */
export function useTopHighlight() {
  const [highlight, setHighlight] = useState<TopHighlight>(NONE);
  const hoverProject = useCallback((projectId: string | null) => {
    setHighlight((prev) => (prev.projectId === projectId ? prev : { ...prev, projectId }));
  }, []);
  const hoverDay = useCallback((dayKey: string | null) => {
    setHighlight((prev) => (prev.dayKey === dayKey ? prev : { ...prev, dayKey }));
  }, []);
  return { highlight, hoverProject, hoverDay };
}
