import type { ServerSession } from "../server/session";
import { clearAfter } from "./cronSlots";
import { fetchBodiesOnce, loadProcessState, processQueueOnce } from "./processApi";
import {
  processCallErrorMessage,
  processCancelMessage,
  processDoneMessage,
  processLeftMessage,
  processNoProgressMessage,
  processStateErrorMessage,
  processStopMessage,
} from "./processMessages";

/**
 * [지금 평가] (사용자 테스트 r1 추가 요청 3): 15분 예약을 기다리지 않고 앱이 처리를 이어 부른다.
 * 1) 원문을 못 받은 공고의 원문을 받고 2) 대기 공고를 한 번에 10개씩 다 처리할 때까지 js-process를 부른다.
 * 예약 이어 하기(매시 7·22·37·52분)와 같은 공고를 두 번 처리하지 않도록 그 앞뒤에는 쉬었다 부른다.
 */

/** 실행이 끝난 뒤 보여 줄 한 줄 (ok면 초록, 아니면 빨강) */
export type RunResult = { ok: boolean; text: string } | null;

/** 앱 쪽 실행 상태 */
export type RunState =
  | { kind: "idle" }
  | { kind: "bodies"; pending: number }
  | { kind: "processing"; done: number; remaining: number }
  | { kind: "pause"; until: Date; done: number; remaining: number };

export interface RunHooks {
  session: ServerSession;
  onState: (state: RunState) => void;
  /** 공고 단계가 바뀌었을 수 있을 때 (화면 다시 읽기) */
  onProgress: () => void;
  cancelled: () => boolean;
}

const PROCESS_LIMIT = 10;
const MAX_BODY_CALLS = 5;
const MAX_PROCESS_CALLS = 60;
/** 서버 함수 호출 한 번이 걸릴 수 있는 최대 시간 (함수는 110초 안에 끝낸다) */
const CALL_MS = 115_000;

/** 멈추기를 누르면 바로 깨어나도록 1초씩 나눠 잔다 */
async function sleepUntil(until: Date, cancelled: () => boolean): Promise<void> {
  while (!cancelled() && Date.now() < until.getTime()) {
    await new Promise((r) => setTimeout(r, Math.min(1000, until.getTime() - Date.now())));
  }
}

async function waitClear(h: RunHooks, done: number, remaining: number): Promise<void> {
  const until = clearAfter(new Date(), CALL_MS);
  if (!until) return;
  h.onState({ kind: "pause", until, done, remaining });
  await sleepUntil(until, h.cancelled);
}

/** 원문 받기. 더 줄지 않거나 켜진 사이트가 없으면 그만둔다. 부르지 못하면 오류 줄 */
async function runBodies(h: RunHooks, pending: number): Promise<RunResult> {
  let left = pending;
  for (let i = 0; i < MAX_BODY_CALLS && left > 0 && !h.cancelled(); i++) {
    await waitClear(h, 0, left);
    if (h.cancelled()) break;
    h.onState({ kind: "bodies", pending: left });
    const result = await fetchBodiesOnce(h.session);
    if (!result.ok) return { ok: false, text: processCallErrorMessage(result.error, 0) };
    if (!result.value || result.value.pending >= left) break;
    left = result.value.pending;
    h.onProgress();
  }
  return null;
}

export async function runProcessNow(h: RunHooks): Promise<RunResult> {
  const state = await loadProcessState(h.session);
  if (!state.ok) return { ok: false, text: processStateErrorMessage(state.error) };
  if (state.value.bodies > 0) {
    const failed = await runBodies(h, state.value.bodies);
    if (failed) return failed;
  }

  let done = 0;
  let remaining = state.value.queue;
  let idleCalls = 0;
  for (let i = 0; i < MAX_PROCESS_CALLS; i++) {
    if (h.cancelled()) return { ok: true, text: processCancelMessage(done, remaining) };
    await waitClear(h, done, remaining);
    if (h.cancelled()) return { ok: true, text: processCancelMessage(done, remaining) };
    h.onState({ kind: "processing", done, remaining });
    const result = await processQueueOnce(h.session, PROCESS_LIMIT);
    if (!result.ok) return { ok: false, text: processCallErrorMessage(result.error, done) };
    const { stopped } = result.value;
    done += result.value.done;
    remaining = result.value.remaining;
    if (result.value.done > 0) h.onProgress();
    if (remaining === 0) return { ok: true, text: processDoneMessage(done) };
    if (stopped && stopped.reason !== "time") return { ok: false, text: processStopMessage(stopped, done, remaining) };
    // AI 응답을 읽지 못한 공고(서버가 건너뜀)만 남아 아무것도 끝내지 못하면 두 번까지만 다시 부른다
    idleCalls = result.value.done === 0 ? idleCalls + 1 : 0;
    if (idleCalls >= 2) return { ok: false, text: processNoProgressMessage(done, remaining) };
  }
  return { ok: true, text: processLeftMessage(done, remaining) };
}
