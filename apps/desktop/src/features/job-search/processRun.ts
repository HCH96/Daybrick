import type { ServerSession } from "../server/session";
import { clearAfter } from "./cronSlots";
import { fetchBodiesOnce, loadProcessState, submitBatchOnce } from "./processApi";
import {
  batchRunMessage,
  processCallErrorMessage,
  processCancelMessage,
  processStateErrorMessage,
} from "./processMessages";

/**
 * [지금 평가] (R106, D46, D68): 15분 예약을 기다리지 않고 앱이 처리를 부른다.
 * 1) 원문을 못 받은 공고의 원문을 받고(최대 5번) 2) `js-process batch`를 한 번 불러 대기 공고를 일괄 처리로 맡긴다.
 * 예약 이어 하기(매시 7·22·37·52분)와 같은 공고를 두 번 맡기지 않도록 그 앞뒤에는 쉬었다 부른다.
 */

/** 실행이 끝난 뒤 보여 줄 한 줄 (ok면 초록, 아니면 빨강) */
export type RunResult = { ok: boolean; text: string } | null;

/** 앱 쪽 실행 상태 */
export type RunState =
  | { kind: "idle" }
  | { kind: "bodies"; pending: number }
  | { kind: "submitting" }
  | { kind: "pause"; until: Date };

export interface RunHooks {
  session: ServerSession;
  onState: (state: RunState) => void;
  /** 공고 단계가 바뀌었을 수 있을 때 (화면 다시 읽기) */
  onProgress: () => void;
  cancelled: () => boolean;
}

const MAX_BODY_CALLS = 5;
/** 서버 함수 호출 한 번이 걸릴 수 있는 최대 시간 (함수는 110초 안에 끝낸다) */
const CALL_MS = 115_000;

/** 멈추기를 누르면 바로 깨어나도록 1초씩 나눠 잔다 */
async function sleepUntil(until: Date, cancelled: () => boolean): Promise<void> {
  while (!cancelled() && Date.now() < until.getTime()) {
    await new Promise((r) => setTimeout(r, Math.min(1000, until.getTime() - Date.now())));
  }
}

async function waitClear(h: RunHooks): Promise<void> {
  const until = clearAfter(new Date(), CALL_MS);
  if (!until) return;
  h.onState({ kind: "pause", until });
  await sleepUntil(until, h.cancelled);
}

/** 원문 받기. 더 줄지 않거나 켜진 사이트가 없으면 그만둔다. 부르지 못하면 오류 줄 */
async function runBodies(h: RunHooks, pending: number): Promise<RunResult> {
  let left = pending;
  for (let i = 0; i < MAX_BODY_CALLS && left > 0 && !h.cancelled(); i++) {
    await waitClear(h);
    if (h.cancelled()) break;
    h.onState({ kind: "bodies", pending: left });
    const result = await fetchBodiesOnce(h.session);
    if (!result.ok) return { ok: false, text: processCallErrorMessage(result.error) };
    if (!result.value || result.value.pending >= left) break;
    left = result.value.pending;
    h.onProgress();
  }
  return null;
}

export async function runProcessNow(h: RunHooks): Promise<RunResult> {
  const state = await loadProcessState(h.session);
  if (!state.ok) return { ok: false, text: processStateErrorMessage(state.error) };
  // 진행 중 일괄이 있으면 버튼이 꺼져 있다. 그 사이 상태가 바뀐 경우만 여기로 온다 (상태 줄이 다시 읽어 보여 준다)
  if (state.value.inFlight.length > 0) return null;
  if (state.value.bodies > 0) {
    const failed = await runBodies(h, state.value.bodies);
    if (failed) return failed;
  }

  if (h.cancelled()) return { ok: true, text: processCancelMessage() };
  await waitClear(h);
  if (h.cancelled()) return { ok: true, text: processCancelMessage() };
  h.onState({ kind: "submitting" });
  const result = await submitBatchOnce(h.session);
  if (!result.ok) return { ok: false, text: processCallErrorMessage(result.error) };
  const run = result.value;
  if (run.saved.extract + run.saved.score + run.submitted.extract + run.submitted.score > 0) h.onProgress();
  return batchRunMessage(run);
}
