import { useEffect } from "react";
import { usePlan } from "../plan/store";
import { isProjectDone } from "./progress";

/**
 * 완료가 아닌데 골인 본 시각(`goalSeenAt`)이 남은 프로젝트를 찾아 비운다 (프로젝트 R18·R25).
 * 그래서 태스크를 되돌렸다가 다시 완료하면 골인 연출이 또 나온다. 앱 전체(PlanProvider 안)에서 한 번 붙인다.
 */
export function useGoalReset(): void {
  const { state, setGoalSeen } = usePlan();

  useEffect(() => {
    if (state.kind !== "ready") return;
    const { projects, tasks } = state.data;
    for (const p of projects) {
      if (p.goalSeenAt !== null && !isProjectDone(p, tasks)) setGoalSeen(p.id, null);
    }
  }, [state, setGoalSeen]);
}
