import { useEffect, type Dispatch } from "react";
import { useApplications } from "../applications/store";
import type { PlanAction, PlanState } from "./reducer";

/**
 * 없어진 지원 카드를 가리키는 태스크 연결을 끊는다 (R39, D14).
 * 지원 데이터와 플랜 데이터가 둘 다 다 읽혔을 때만 본다. 읽는 중·읽기 실패면 아무것도 하지 않는다
 * (지원 파일을 못 읽었을 때 연결을 모두 지워 버리지 않게).
 * PlanProvider 안에서 한 번만 부른다. ApplicationsProvider가 PlanProvider 바깥에 있어야 한다 (App.tsx).
 */
export function useLinkCleanup(plan: PlanState, dispatch: Dispatch<PlanAction>): void {
  const { state: applications } = useApplications();

  useEffect(() => {
    if (plan.kind !== "ready" || applications.kind !== "ready") return;
    const existing = new Set(applications.data.applications.map((a) => a.id));
    const hasMissing = plan.data.tasks.some((t) => t.applicationId !== null && !existing.has(t.applicationId));
    if (!hasMissing) return;
    dispatch({ type: "clear-missing-links", existingIds: [...existing], now: new Date().toISOString() });
  }, [plan, applications, dispatch]);
}
