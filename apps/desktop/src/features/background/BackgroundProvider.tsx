import { useEffect, useRef, type ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { runQuitHandlers } from "../../app/quit";
import { ackQuitRequest, hideMainWindow, listenCloseRequested, listenQuitRequested, quitApp } from "./api";

/**
 * 창 닫기·종료 요청을 듣고 처리한다 (백그라운드 실행 R1, R2, R9, R12, D1). 화면은 없다.
 * - 닫기(X·Alt+F4): 창만 숨긴다. 앱 안의 동작은 그대로 돈다 (R3).
 * - 종료(트레이): 받았다고 바로 알리고(D2) → 종료 전 저장(최대 5초, D3) → 끈다.
 * Tauri가 아니면(브라우저 미리보기) 아무것도 하지 않는다.
 */
export function BackgroundProvider({ children }: { children?: ReactNode }) {
  const quittingRef = useRef(false); // 종료 진행 중이면 다시 온 요청은 응답만 한다

  useEffect(() => {
    if (!isTauri()) return;

    async function handleQuit(): Promise<void> {
      await ackQuitRequest().catch((e: unknown) => console.error("종료 요청 응답 실패", e));
      if (quittingRef.current) return;
      quittingRef.current = true;
      await runQuitHandlers();
      await quitApp().catch((e: unknown) => {
        console.error("앱 종료 실패", e);
        quittingRef.current = false;
      });
    }

    const stops = [
      listenCloseRequested(() => {
        void hideMainWindow().catch((e: unknown) => console.error("창 숨기기 실패", e));
      }),
      listenQuitRequested(() => {
        void handleQuit();
      }),
    ];
    return () => {
      for (const stop of stops) void stop.then((fn) => fn());
    };
  }, []);

  return <>{children}</>;
}
