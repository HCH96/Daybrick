import { useCallback, useEffect, useRef, useState } from "react";
import { checkServerStatus } from "./health";
import type { ServerSession } from "./session";
import type { ServerConnection, ServerStatus } from "./types";

/** 앱이 켜져 있는 동안 다시 확인하는 간격. 접속 불가일 때도, 연결됨일 때도 같다 (R44, r1 U28) */
const RECHECK_MS = 3 * 60_000;
/** 재개를 요청한 뒤 다시 확인하는 간격 (R43) */
const RESUME_RETRY_MS = 10_000;

/** 재개 중에 계속 기다리는 상태 (켜지는 동안은 일시정지·접속 불가로 보일 수 있다) */
function stillDown(status: ServerStatus | null): boolean {
  return status === "paused" || status === "unreachable";
}

interface HealthCheckOptions {
  connection: ServerConnection | null;
  /** 켤 때 로그인 복원이 끝났는지. 끝나기 전에는 확인하지 않는다 (로그인 필요로 잘못 판정하지 않게). */
  sessionReady: boolean;
  session: ServerSession | null;
  /** 세션이 없으면 저장된 로그인으로 다시 받아 본다 (켤 때 인터넷이 끊겨 복원을 못 한 경우) */
  ensureSession: () => Promise<ServerSession | null>;
  /** 확인이 끝날 때마다: server.json의 lastCheck에 남긴다 */
  onChecked: (status: ServerStatus, at: string) => void;
}

export interface HealthCheck {
  /** 마지막 확인 결과. 연결 정보가 없거나 아직 확인 전이면 null */
  status: ServerStatus | null;
  checking: boolean;
  /** 바로 다시 확인한다 (설정의 [지금 다시 확인], 대시보드에서 재개 뒤) */
  recheck: () => void;
  /** 재개를 요청해 켜지기를 기다리는 중인지 */
  resuming: boolean;
  /** 재개를 요청한 뒤 몇 번 확인했는지 (진행 표시용) */
  resumeChecks: number;
  /** 재개를 요청했다: 켜질 때까지 10초마다 확인한다 */
  startResume: () => void;
}

/**
 * 앱을 켤 때·연결이나 로그인이 바뀔 때 서버 상태를 확인한다 (R37). 앱이 그려진 뒤 비동기로 해서 시작을 막지 않는다 (R38).
 * 그 뒤로는 3분마다(재개 중이면 10초마다) 다시 확인하고, 네트워크가 끊기거나 다시 붙으면 바로 확인한다 (R43, R44).
 */
export function useHealthCheck({
  connection,
  sessionReady,
  session,
  ensureSession,
  onChecked,
}: HealthCheckOptions): HealthCheck {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [resumeChecks, setResumeChecks] = useState(0);
  // 확인이 끝날 때마다 바뀌어, 결과가 같아도 다음 다시 확인 타이머를 새로 건다
  const [checkCount, setCheckCount] = useState(0);
  const runId = useRef(0);
  const resumingRef = useRef(false);
  const onCheckedRef = useRef(onChecked);
  useEffect(() => {
    onCheckedRef.current = onChecked;
  }, [onChecked]);

  const url = connection?.url ?? null;
  const anonKey = connection?.anonKey ?? null;

  const run = useCallback(async () => {
    if (!url || !anonKey || !sessionReady) return;
    const id = ++runId.current;
    setChecking(true);
    let result: ServerStatus;
    try {
      const current = await ensureSession();
      result = await checkServerStatus({ url, anonKey }, current);
    } catch (e) {
      console.error("서버 상태를 확인하지 못함", e);
      result = "unreachable";
    }
    // 그사이 연결·로그인이 바뀌어 새 확인이 시작됐으면 이 결과는 버린다
    if (id !== runId.current) return;
    setStatus(result);
    setChecking(false);
    setCheckCount((n) => n + 1);
    if (resumingRef.current) {
      if (stillDown(result)) setResumeChecks((n) => n + 1);
      else {
        resumingRef.current = false;
        setResuming(false);
      }
    }
    onCheckedRef.current(result, new Date().toISOString());
  }, [url, anonKey, sessionReady, ensureSession]);

  // 연결·로그인이 바뀌면 (켤 때 포함) 다시 확인한다. 세션 객체가 바뀌는 것도 포함 (로그인·로그아웃).
  useEffect(() => {
    if (!url) {
      runId.current++;
      setStatus(null);
      setChecking(false);
      resumingRef.current = false;
      setResuming(false);
      return;
    }
    void run();
  }, [url, run, session]);

  // 다시 확인 타이머: 재개 중 10초, 그 밖에는 3분. 연결됨일 때도 돌려 실행 중에 끊긴 것을 알아챈다.
  useEffect(() => {
    if (!url || checking || status === null) return;
    const delay = resuming && stillDown(status) ? RESUME_RETRY_MS : RECHECK_MS;
    const timer = window.setTimeout(() => void run(), delay);
    return () => window.clearTimeout(timer);
  }, [url, checking, resuming, status, checkCount, run]);

  // 운영체제가 네트워크가 끊기거나 다시 붙었다고 알려 주면 기다리지 않고 바로 확인한다.
  // (가상 네트워크 어댑터가 있으면 이 신호가 안 올 수 있어 위의 3분 확인도 함께 둔다)
  useEffect(() => {
    if (!url) return;
    const onChange = () => void run();
    window.addEventListener("online", onChange);
    window.addEventListener("offline", onChange);
    return () => {
      window.removeEventListener("online", onChange);
      window.removeEventListener("offline", onChange);
    };
  }, [url, run]);

  const recheck = useCallback(() => void run(), [run]);

  const startResume = useCallback(() => {
    resumingRef.current = true;
    setResuming(true);
    setResumeChecks(0);
    void run();
  }, [run]);

  return { status, checking, recheck, resuming, resumeChecks, startResume };
}
