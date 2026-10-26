import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelGoogleLogin,
  openLoginPage,
  signInWithGoogle,
  type LoginErrorKind,
  type LoginResult,
} from "../../../features/server/googleLogin";
import type { KeysCheck } from "../../../features/server/probe";
import { createSessionClient, type ServerSession } from "../../../features/server/session";
import { useServer } from "../../../features/server/useServer";

/** 로그인 화면(이미 세팅된 서버)의 상태: 시작 전, 브라우저 대기, 실패 */
export type LoginPhase = { kind: "idle" } | { kind: "waiting" } | { kind: "failed"; error: LoginErrorKind };

export interface WizardLogin {
  /** 로그인한다. 이 마법사에서 이미 로그인했으면 그 세션을 돌려준다 (자동 세팅 다시 시도용). */
  login: () => Promise<LoginResult>;
  /** 로그인 화면의 [Google로 로그인]. 사용자가 멈췄으면 null. */
  startLogin: () => Promise<LoginResult | null>;
  phase: LoginPhase;
  /** 브라우저 로그인을 기다리는 중이면 연 주소 */
  loginUrl: string | null;
  /** [브라우저 다시 열기] */
  reopenBrowser: () => void;
  /** 기다리는 로그인을 멈추고 시작 전으로 */
  cancelLogin: () => void;
}

/**
 * 마법사의 Google 로그인. ③ 자동 세팅 "계정 등록"과 로그인 화면이 함께 쓴다.
 * 로그인에 성공하면 그때 연결 정보를 저장한다 (`completeLogin`, 작은 규칙).
 */
export function useWizardLogin(keysCheck: KeysCheck | null): WizardLogin {
  const { completeLogin } = useServer();
  const sessionRef = useRef<ServerSession | null>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<LoginPhase>({ kind: "idle" });
  // 기다리는 중에 멈추거나 마법사가 닫히면 늦게 온 결과를 버리기 위한 번호
  const loginSeq = useRef(0);

  // 마법사가 닫히면 기다리는 로그인도 멈춘다
  useEffect(
    () => () => {
      loginSeq.current += 1;
      cancelGoogleLogin();
    },
    [],
  );

  const login = useCallback(async (): Promise<LoginResult> => {
    if (sessionRef.current) return { ok: true, session: sessionRef.current };
    if (keysCheck?.kind !== "ok") return { ok: false, error: "login-failed" };
    const connection = { url: keysCheck.url, anonKey: keysCheck.anonKey };
    const client = createSessionClient(connection);
    const result = await signInWithGoogle(client, setLoginUrl);
    setLoginUrl(null);
    if (!result.ok) {
      void client.auth.stopAutoRefresh();
      return result;
    }
    sessionRef.current = result.session;
    try {
      await completeLogin(connection, result.session);
    } catch (e: unknown) {
      console.error("연결 정보를 저장하지 못함", e);
    }
    return result;
  }, [keysCheck, completeLogin]);

  const startLogin = useCallback(async (): Promise<LoginResult | null> => {
    const seq = ++loginSeq.current;
    setPhase({ kind: "waiting" });
    const result = await login();
    // 멈춘 뒤에 온 결과는 화면에 반영하지 않는다 (이미 로그인됐으면 그 세션은 저장돼 있다)
    if (seq !== loginSeq.current) return null;
    setPhase(result.ok ? { kind: "idle" } : { kind: "failed", error: result.error });
    return result;
  }, [login]);

  const reopenBrowser = useCallback(() => {
    if (loginUrl) openLoginPage(loginUrl);
  }, [loginUrl]);

  const cancelLogin = useCallback(() => {
    loginSeq.current += 1;
    cancelGoogleLogin();
    setLoginUrl(null);
    setPhase({ kind: "idle" });
  }, []);

  return { login, startLogin, phase, loginUrl, reopenBrowser, cancelLogin };
}
