import { useEffect, useRef, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { touchRunning } from "./reducer";
import { saveTodayData } from "./storage";
import type { TodayData } from "./types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const SAVE_DELAY_MS = 500;

/**
 * 데이터가 바뀌면 0.5초 기다렸다가 파일에 쓴다. 그 사이 또 바뀌면 타이머를 다시 건다.
 * 창을 닫을 때 기다리던 저장이 있으면 바로 쓰고 닫는다.
 * 앱 종료 처리(R24, D9)도 여기 한 곳에 둔다: stampOnClose가 켜져 있으면 닫을 때 실행 중 타이머의
 * lastSeenAt만 지금으로 적어 바로 쓴다. 기록 옮기기·태스크 상태 바꾸기는 다음 실행 때 복구가 한다.
 * (나중 백그라운드 상주가 생기면 이 지점만 옮긴다, extension.md)
 * data가 null이면(아직 읽는 중이거나 읽기 실패) 아무것도 저장하지 않는다.
 */
export function useTodayAutoSave(data: TodayData | null, stampOnClose: boolean): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const lastSavedRef = useRef<TodayData | null>(null); // 파일과 같은 내용
  const pendingRef = useRef<TodayData | null>(null); // 아직 쓰지 않은 내용
  const timerRef = useRef<number | undefined>(undefined);
  const dataRef = useRef(data); // 지금 화면의 최신 데이터
  dataRef.current = data;
  const stampRef = useRef(stampOnClose);
  stampRef.current = stampOnClose;

  // 처음 읽어 온 데이터는 파일과 같으므로 저장하지 않는다.
  useEffect(() => {
    if (data === null) return;
    if (lastSavedRef.current === null) {
      lastSavedRef.current = data;
      return;
    }
    if (data === lastSavedRef.current) return;

    pendingRef.current = data;
    setStatus("saving");
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void flush();
    }, SAVE_DELAY_MS);
  }, [data]);

  async function flush(): Promise<void> {
    window.clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    if (pending === null) return;
    pendingRef.current = null;
    try {
      await saveTodayData(pending);
      lastSavedRef.current = pending;
      // 쓰는 동안 새 변경이 들어왔으면 "저장 중"을 유지한다.
      if (pendingRef.current === null) setStatus("saved");
    } catch (e) {
      console.error("투데이 데이터 저장 실패", e);
      setStatus("error");
    }
  }

  // flush를 최신 상태로 부를 수 있게 ref에 담아 둔다 (창 닫기 처리기는 한 번만 등록).
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    if (!isTauri()) return;
    let alive = true;
    let unlisten: (() => void) | undefined;
    void getCurrentWindow()
      .onCloseRequested(async () => {
        const latest = dataRef.current;
        if (stampRef.current && latest !== null && latest.running !== null) {
          pendingRef.current = touchRunning(latest, new Date().toISOString());
        }
        await flushRef.current();
      })
      .then((stop) => {
        if (alive) unlisten = stop;
        else stop();
      });
    return () => {
      alive = false;
      unlisten?.();
    };
  }, []);

  return status;
}
