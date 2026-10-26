import { useCallback, useEffect, useRef, useState } from "react";
import { cancelGoogleLogin, openLoginPage, signInWithGoogle } from "../../features/server/googleLogin";
import { createSessionClient } from "../../features/server/session";
import { useServer } from "../../features/server/useServer";
import type { LoginPhase } from "../server-setup/wizard/useWizardLogin";

export interface SettingsLogin {
  phase: LoginPhase;
  /** [Google로 로그인] */
  start: () => void;
  /** [브라우저 다시 열기] */
  reopen: () => void;
  /** 기다리는 로그인을 멈춘다 */
  cancel: () => void;
}

/**
 * 설정 "로그인 필요" 칸의 Google 로그인 (R32).
 * 성공하면 `completeLogin`으로 세션을 바꾸고, 같은 서버라 처음 연결한 시각은 그대로 둔다.
 */
export function useSettingsLogin(): SettingsLogin {
  const { config, completeLogin } = useServer();
  const [phase, setPhase] = useState<LoginPhase>({ kind: "idle" });
  const loginUrl = useRef<string | null>(null);
  const seq = useRef(0);
  const connection = config?.connection ?? null;

  // 칸이 사라지면 (다른 화면으로 이동 등) 기다리는 로그인을 멈춘다
  useEffect(
    () => () => {
      seq.current += 1;
      cancelGoogleLogin();
    },
    [],
  );

  const start = useCallback(() => {
    if (!connection) return;
    const id = ++seq.current;
    const keys = { url: connection.url, anonKey: connection.anonKey };
    const client = createSessionClient(keys);
    setPhase({ kind: "waiting" });
    void signInWithGoogle(client, (url) => {
      loginUrl.current = url;
    }).then(async (result) => {
      loginUrl.current = null;
      if (!result.ok) {
        void client.auth.stopAutoRefresh();
        if (id === seq.current) setPhase({ kind: "failed", error: result.error });
        return;
      }
      if (id !== seq.current) {
        // 멈춘 뒤에 로그인이 끝났으면 그 세션은 쓰지 않는다
        void client.auth.stopAutoRefresh();
        return;
      }
      try {
        await completeLogin(keys, result.session);
      } catch (e: unknown) {
        console.error("연결 정보를 저장하지 못함", e);
      }
      setPhase({ kind: "idle" });
    });
  }, [connection, completeLogin]);

  const reopen = useCallback(() => {
    if (loginUrl.current) openLoginPage(loginUrl.current);
  }, []);

  const cancel = useCallback(() => {
    seq.current += 1;
    cancelGoogleLogin();
    loginUrl.current = null;
    setPhase({ kind: "idle" });
  }, []);

  return { phase, start, reopen, cancel };
}
