import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { runQuitHandlers } from "../../app/quit";
import { useToday } from "../today/store";
import {
  ackQuitRequest,
  hideMainWindow,
  listenCloseRequested,
  listenQuitRequested,
  loadAppSettings,
  markCloseNoticeSeen,
  quitApp,
  showMainWindow,
} from "./api";

/** 지금 떠 있는 창: 첫 닫기 안내(R4) / 타이머 종료 확인(R10) */
export type BackgroundDialog = "close-notice" | "quit-confirm" | null;

export interface BackgroundStore {
  dialog: BackgroundDialog;
  /** 안내 [확인]: 본 것으로 적고 창을 숨긴다 */
  confirmCloseNotice: () => void;
  /** 안내 Esc: 안내만 닫는다 (숨기지 않고, 본 것으로 적지 않음) */
  dismissCloseNotice: () => void;
  /** 종료 확인 [종료]: 저장한 뒤 끈다 */
  confirmQuit: () => void;
  /** 종료 확인 [취소]: 아무것도 하지 않는다 */
  cancelQuit: () => void;
}

const BackgroundContext = createContext<BackgroundStore | null>(null);

/** 안내·확인 창 상태. BackgroundProvider 밖이면 null (BackgroundDialogs가 아무것도 그리지 않음). */
export function useBackground(): BackgroundStore | null {
  return useContext(BackgroundContext);
}

function hide(): void {
  void hideMainWindow().catch((e: unknown) => console.error("창 숨기기 실패", e));
}

/**
 * 창 닫기·종료 요청을 듣고 처리한다 (백그라운드 실행 R1, R2, R4, R9, R10, R12, D1).
 * - 닫기(X·Alt+F4): 첫 번째면 안내 창을 띄우고, 그다음부터는 창만 숨긴다. 앱 안의 동작은 그대로 돈다 (R3).
 * - 종료(트레이): 받았다고 바로 알리고(D2) → 타이머가 있으면 창을 보여 주고 묻기(R10) → 종료 전 저장(최대 5초, D3) → 끈다.
 *   저장 전에 묻기 때문에 [취소]해도 저장 처리기가 한 번 돈 상태로 남지 않는다.
 * Tauri가 아니면(브라우저 미리보기) 요청을 듣지 않는다.
 */
export function BackgroundProvider({ children }: { children?: ReactNode }) {
  const { state: today } = useToday();
  const hasTimer = today.kind === "ready" && today.data.running !== null;

  const [dialog, setDialogState] = useState<BackgroundDialog>(null);
  // 이벤트 처리기는 한 번만 등록하므로 최신 값은 ref로 읽는다
  const dialogRef = useRef<BackgroundDialog>(null);
  const hasTimerRef = useRef(hasTimer);
  hasTimerRef.current = hasTimer;
  const noticeSeenRef = useRef(false); // 읽기 전·읽기 실패면 안 본 것으로 본다
  const quittingRef = useRef(false); // 종료 진행 중이면 다시 온 요청은 응답만 한다

  const setDialog = useCallback((next: BackgroundDialog) => {
    dialogRef.current = next;
    setDialogState(next);
  }, []);

  const quitNow = useCallback(async (): Promise<void> => {
    if (quittingRef.current) return;
    quittingRef.current = true;
    await runQuitHandlers();
    await quitApp().catch((e: unknown) => {
      console.error("앱 종료 실패", e);
      quittingRef.current = false;
    });
  }, []);

  useEffect(() => {
    if (!isTauri()) return;

    void loadAppSettings()
      .then((settings) => {
        if (settings.closeNoticeSeen) noticeSeenRef.current = true;
      })
      .catch((e: unknown) => console.error("앱 설정 읽기 실패", e));

    async function handleQuit(): Promise<void> {
      await ackQuitRequest().catch((e: unknown) => console.error("종료 요청 응답 실패", e));
      // 종료 진행 중이거나 확인 창이 떠 있으면 새 요청은 무시한다
      if (quittingRef.current || dialogRef.current === "quit-confirm") return;
      if (hasTimerRef.current) {
        await showMainWindow().catch((e: unknown) => console.error("창 보이기 실패", e));
        setDialog("quit-confirm");
        return;
      }
      setDialog(null);
      await quitNow();
    }

    const stops = [
      listenCloseRequested(() => {
        // 안내·확인 창이 떠 있는 동안은 그 창에서 고르게 한다
        if (dialogRef.current !== null) return;
        if (noticeSeenRef.current) hide();
        else setDialog("close-notice");
      }),
      listenQuitRequested(() => {
        void handleQuit();
      }),
    ];
    return () => {
      for (const stop of stops) void stop.then((fn) => fn());
    };
  }, [setDialog, quitNow]);

  const store = useMemo<BackgroundStore>(
    () => ({
      dialog,
      confirmCloseNotice: () => {
        setDialog(null);
        noticeSeenRef.current = true;
        void markCloseNoticeSeen().catch((e: unknown) => console.error("첫 닫기 안내 기록 실패", e));
        hide();
      },
      dismissCloseNotice: () => setDialog(null),
      confirmQuit: () => {
        setDialog(null);
        void quitNow();
      },
      cancelQuit: () => setDialog(null),
    }),
    [dialog, setDialog, quitNow],
  );

  return <BackgroundContext.Provider value={store}>{children}</BackgroundContext.Provider>;
}
