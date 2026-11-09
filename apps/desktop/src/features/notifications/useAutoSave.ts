import { useEffect, useRef } from "react";
import { onQuitRequested } from "../../app/quit";
import { useSync } from "../sync/useSync";
import { saveNotificationsFile } from "./storage";
import type { NotificationsFile } from "./types";

const SAVE_DELAY_MS = 500;

/**
 * 알림 데이터가 바뀌면 0.5초 기다렸다가 파일에 쓴다. 그 사이 또 바뀌면 타이머를 다시 건다.
 * 앱을 종료할 때(트레이 "종료") 기다리던 저장이 있으면 바로 쓰고 끈다. (지원 관리 useAutoSave와 같은 방식)
 * file이 null이면(아직 읽는 중이거나 읽기 실패) 아무것도 저장하지 않는다.
 */
export function useAutoSave(file: NotificationsFile | null): void {
  const lastSavedRef = useRef<NotificationsFile | null>(null); // 파일과 같은 내용
  const pendingRef = useRef<NotificationsFile | null>(null); // 아직 쓰지 않은 내용
  const timerRef = useRef<number | undefined>(undefined);
  // 종료할 때 동기화의 마지막 올리기가 끝날 때까지 이 처리기도 기다린다 (데이터 동기화 R12)
  const { closeFlush } = useSync();
  const closeFlushRef = useRef(closeFlush);
  closeFlushRef.current = closeFlush;

  // 처음 읽어 온 데이터는 파일과 같으므로 저장하지 않는다.
  useEffect(() => {
    if (file === null) return;
    if (lastSavedRef.current === null) {
      lastSavedRef.current = file;
      return;
    }
    if (file === lastSavedRef.current) return;

    pendingRef.current = file;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void flush();
    }, SAVE_DELAY_MS);
  }, [file]);

  async function flush(): Promise<void> {
    window.clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    if (pending === null) return;
    pendingRef.current = null;
    try {
      await saveNotificationsFile(pending);
      lastSavedRef.current = pending;
    } catch (e) {
      console.error("알림 데이터 저장 실패", e);
    }
  }

  // flush를 최신 상태로 부를 수 있게 ref에 담아 둔다 (종료 처리기는 한 번만 등록).
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(
    () =>
      onQuitRequested(async () => {
        await closeFlushRef.current(flushRef.current());
      }),
    [],
  );
}
