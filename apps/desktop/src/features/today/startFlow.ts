/**
 * 타이머 시작 흐름 (R26). 시작은 모두 이 흐름을 거친다:
 * requestStart → beforeStart(시작 전 단계) → start.
 * 나중에 안드로이드 연동 팝업(QR·숫자 입력)을 beforeStart에 끼운다 (extension.md).
 */

/** 시작 전 단계. true면 시작하고 false면 그만둔다. 지금은 바로 통과한다. */
export async function beforeStart(taskId: string): Promise<boolean> {
  void taskId;
  return true;
}

/** 시작 전 단계를 거친 뒤 start를 부른다 */
export async function runStartFlow(taskId: string, start: (taskId: string) => void): Promise<void> {
  const ok = await beforeStart(taskId);
  if (ok) start(taskId);
}
