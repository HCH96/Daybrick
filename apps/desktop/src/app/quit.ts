/**
 * 종료 전 저장 등록소 (백그라운드 실행 D3, D4).
 * 창 닫기(X)는 창을 숨기기만 하므로, 기능은 끄기 직전에 할 일을 여기에 등록한다.
 * 트레이 "종료" 때 BackgroundProvider가 `runQuitHandlers()`로 한꺼번에 부른다.
 */

type QuitHandler = () => Promise<void>;

/** 종료 전 저장을 기다리는 최대 시간 (D3) */
const QUIT_WAIT_MS = 5_000;

const handlers = new Set<QuitHandler>();

/** 종료 전에 할 일을 등록한다. 돌려준 함수를 부르면 등록을 푼다. */
export function onQuitRequested(fn: QuitHandler): () => void {
  handlers.add(fn);
  return () => {
    handlers.delete(fn);
  };
}

/** 등록된 일을 모두 함께 부르고 끝날 때까지 기다린다. 실패해도, 5초가 지나도 그냥 끝난다. */
export async function runQuitHandlers(): Promise<void> {
  const all = Promise.allSettled(
    [...handlers].map((fn) => {
      try {
        return fn();
      } catch (e) {
        return Promise.reject(e);
      }
    }),
  ).then((results) => {
    for (const r of results) {
      if (r.status === "rejected") console.error("종료 전 저장 실패", r.reason);
    }
  });
  let timer: number | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = window.setTimeout(() => {
      console.warn("종료 전 저장이 5초 안에 끝나지 않아 그대로 종료해요");
      resolve();
    }, QUIT_WAIT_MS);
  });
  await Promise.race([all, timeout]);
  window.clearTimeout(timer);
}
