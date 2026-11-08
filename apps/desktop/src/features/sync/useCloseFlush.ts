import { useCallback, useRef } from "react";

/** 닫기 전에 다른 기능의 로컬 저장을 기다리는 최대 시간 */
const LOCAL_WAIT_MS = 1_000;
/** 창을 닫을 때 올리기를 시도하는 최대 시간 (D7) */
const UPLOAD_WAIT_MS = 3_000;
/** 같은 닫기 요청을 받은 다른 처리기가 합류할 짧은 틈 */
const JOIN_MS = 50;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * 창을 닫을 때 남은 올리기를 한 번만 짧게 시도한다 (R12).
 *
 * Tauri의 onCloseRequested 처리기는 각자 끝나는 대로 창을 없앤다. 그래서 동기화가 따로 처리기를 두면
 * 기능의 빠른 로컬 저장 처리기가 먼저 창을 닫아 올리기가 끊긴다. 대신 각 기능의 닫기 처리기가
 * 자기 로컬 저장 Promise를 `closeFlush`에 넘기고 그 결과를 기다린다:
 * 로컬 저장들(최대 1초) → 대기 종류 올리기(최대 3초). 시간이 지나거나 실패해도 닫기는 막지 않고,
 * "대기" 표시는 sync.json에 남아 다음 실행 때 올라간다.
 */
export function useCloseFlush(uploadPending: () => Promise<void>): (localSave: Promise<void>) => Promise<void> {
  const uploadRef = useRef(uploadPending);
  uploadRef.current = uploadPending;
  const sessionRef = useRef<Promise<void> | null>(null);
  const localsRef = useRef<Promise<unknown>[]>([]);

  return useCallback((localSave: Promise<void>) => {
    localsRef.current.push(localSave.catch(() => undefined));
    if (!sessionRef.current) {
      sessionRef.current = (async () => {
        await sleep(JOIN_MS);
        await Promise.race([Promise.allSettled(localsRef.current), sleep(LOCAL_WAIT_MS)]);
        await Promise.race([uploadRef.current().catch(() => undefined), sleep(UPLOAD_WAIT_MS)]);
      })();
    }
    // 자기 로컬 저장은 시간과 상관없이 끝까지 기다린다 (지금까지와 같음)
    return Promise.allSettled([localSave, sessionRef.current]).then(() => undefined);
  }, []);
}
