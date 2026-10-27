/**
 * 이어 하기 예약(js-continue) 시각 계산 (R74, 0004_job_search_cron.sql).
 * 예약은 UTC로 매시 7·22·37·52분에 돈다. 한국 시간과 분이 같으므로 화면에는 그대로 보여 준다.
 */
export const CONTINUE_MINUTES = [7, 22, 37, 52] as const;

/** 예약 한 번이 처리하는 공고 수 (js-process 기본값) */
export const CONTINUE_BATCH = 5;

/** 예약 실행 한 번이 끝날 때까지 넉넉히 잡은 시간 (서버 함수 한도 150초) */
export const CONTINUE_RUN_MS = 150_000;

const SLOT_MS = 15 * 60_000;

/** `now` 이전(같은 시각 포함)의 마지막 예약 시각 */
export function lastContinueAt(now: Date): Date {
  const base = new Date(now);
  base.setUTCSeconds(0, 0);
  for (let back = 0; back < 60; back++) {
    const t = new Date(base.getTime() - back * 60_000);
    if ((CONTINUE_MINUTES as readonly number[]).includes(t.getUTCMinutes())) return t;
  }
  return new Date(base.getTime() - SLOT_MS);
}

/** `now` 뒤의 다음 예약 시각 */
export function nextContinueAt(now: Date): Date {
  return new Date(lastContinueAt(now).getTime() + SLOT_MS);
}

/** 지금 예약 실행이 돌고 있을 수 있는 때인지 (시작 뒤 150초 안) */
export function continueRunning(now: Date): boolean {
  return now.getTime() - lastContinueAt(now).getTime() < CONTINUE_RUN_MS;
}

/**
 * 앱이 지금 서버 처리를 부르면 예약 실행과 겹칠 수 있으면, 겹치지 않는 시각을 돌려준다. 괜찮으면 null.
 * 같은 공고를 두 번 처리해 AI 비용을 두 번 쓰지 않으려는 것이다.
 * @param callMs 앱의 호출 한 번이 걸릴 수 있는 최대 시간
 */
export function clearAfter(now: Date, callMs: number): Date | null {
  const last = lastContinueAt(now);
  if (now.getTime() - last.getTime() < CONTINUE_RUN_MS) return new Date(last.getTime() + CONTINUE_RUN_MS);
  const next = nextContinueAt(now);
  if (next.getTime() - now.getTime() < callMs) return new Date(next.getTime() + CONTINUE_RUN_MS);
  return null;
}

/** 예약만으로 대기 공고를 다 처리하는 데 걸리는 대략의 시간(분) */
export function continueEtaMinutes(queue: number): number {
  return Math.ceil(queue / CONTINUE_BATCH) * 15;
}

/** 14:07 */
export function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
