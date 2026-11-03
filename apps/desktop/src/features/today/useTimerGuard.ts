import { useEffect, useRef } from "react";
import type { PlanState } from "../plan/reducer";
import type { TaskStatus } from "../plan/types";
import type { RunningTimer } from "./types";

/**
 * 실행 중 태스크를 플랜 데이터에서 지켜본다 (D10).
 * - 다른 화면에서 진행 중 → 완료/시작 전으로 바뀌면 타이머를 끝낸다(상태는 이미 바뀌었으므로 기록만).
 * - 태스크가 지워지면 그때까지 기록하고 타이머를 끈다.
 * 타이머 카드의 완료·중단은 기록을 먼저 옮겨 running이 비므로 여기서 다시 처리되지 않는다.
 * 상태는 "진행 중이었다가 바뀐 때"만 본다 — 시작 직후 플랜 상태가 아직 안 바뀐 순간을 끝으로 오해하지 않게.
 */
export function useTimerGuard(
  enabled: boolean,
  running: RunningTimer | null,
  plan: PlanState,
  onEnd: () => void,
): void {
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  // 지난번에 본 실행 중 태스크의 상태
  const seenRef = useRef<{ taskId: string; status: TaskStatus } | null>(null);

  useEffect(() => {
    if (!enabled || running === null || plan.kind !== "ready") {
      if (running === null) seenRef.current = null;
      return;
    }
    const task = plan.data.tasks.find((t) => t.id === running.taskId);
    if (task === undefined) {
      seenRef.current = null;
      endRef.current();
      return;
    }
    const seen = seenRef.current;
    const wasDoing = seen !== null && seen.taskId === task.id && seen.status === "doing";
    seenRef.current = { taskId: task.id, status: task.status };
    if (wasDoing && task.status !== "doing") {
      seenRef.current = null;
      endRef.current();
    }
  }, [enabled, running, plan]);
}
