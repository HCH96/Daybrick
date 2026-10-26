import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { clearServerConnection, createDefaultServerConfig, loadServerConfig, saveServerConfig } from "./config";
import { deleteSavedLogin, restoreSession, stopSession, type ServerSession } from "./session";
import type { ServerConfig, ServerStatus } from "./types";
import { useHealthCheck } from "./useHealthCheck";
import { ServerContext, type ServerState } from "./useServer";

/**
 * 앱을 켤 때 server.json을 읽고 로그인을 복원해, 연결 정보·세션·상태를 앱 전체에 공유한다.
 * 상태는 앱이 그려진 뒤 접속 확인으로 정한다 (useHealthCheck, R37–R44).
 */
export function ServerProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ServerConfig | null>(null);
  // 연달아 바꿀 때도 최신 값을 기준으로 합치기 위해 따로 들고 있는다
  const configRef = useRef<ServerConfig | null>(null);
  const [session, setSessionState] = useState<ServerSession | null>(null);
  const sessionRef = useRef<ServerSession | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  /** 세션을 바꾼다. 앞 세션의 토큰 자동 갱신은 멈춘다. */
  const replaceSession = useCallback((next: ServerSession | null) => {
    const prev = sessionRef.current;
    if (prev && prev !== next) stopSession(prev);
    sessionRef.current = next;
    setSessionState(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadServerConfig()
      .catch((e: unknown) => {
        console.error("서버 연결 정보를 읽지 못함", e);
        return createDefaultServerConfig();
      })
      .then(async (loaded) => {
        if (cancelled) return;
        configRef.current = loaded;
        setConfig(loaded);
        // 저장된 refresh 토큰으로 로그인을 다시 받는다 (R31, D14)
        const restored = loaded.connection ? await restoreSession(loaded.connection) : null;
        if (cancelled) {
          if (restored) stopSession(restored);
          return;
        }
        // 복원을 기다리는 사이 마법사에서 새로 로그인했으면 그쪽을 쓴다
        if (restored && !sessionRef.current) replaceSession(restored);
        else if (restored) stopSession(restored);
        setSessionReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [replaceSession]);

  // 앱이 닫힐 때(개발 중 다시 그릴 때 포함) 토큰 자동 갱신을 멈춘다
  useEffect(
    () => () => {
      if (sessionRef.current) stopSession(sessionRef.current);
    },
    [],
  );

  const updateConfig = useCallback<ServerState["updateConfig"]>(async (patch) => {
    const next: ServerConfig = { ...(configRef.current ?? createDefaultServerConfig()), ...patch };
    configRef.current = next;
    setConfig(next);
    await saveServerConfig(next);
  }, []);

  const completeLogin = useCallback<ServerState["completeLogin"]>(
    async ({ url, anonKey }, next) => {
      replaceSession(next);
      const current = configRef.current?.connection;
      // 같은 서버에 다시 로그인했으면 처음 연결한 시각을 그대로 둔다
      const connectedAt = current?.url === url ? current.connectedAt : new Date().toISOString();
      await updateConfig({ connection: { url, anonKey, connectedAt } });
    },
    [replaceSession, updateConfig],
  );

  // 연결 해제 뒤에는 첫 실행 안내 대신 설정의 "연결 안 함" 칸을 보여주므로 welcomeDismissed는 true로 남긴다
  const clearConnection = useCallback(async () => {
    const url = configRef.current?.connection?.url;
    replaceSession(null);
    if (url) await deleteSavedLogin(url);
    await clearServerConnection();
    const next: ServerConfig = { ...createDefaultServerConfig(), welcomeDismissed: true };
    configRef.current = next;
    setConfig(next);
    await saveServerConfig(next);
  }, [replaceSession]);

  // 연결 마법사가 열려 있는지 (첫 실행 안내와 설정 화면 양쪽에서 연다). 입력값은 마법사 안에만 둔다
  const [setupOpen, setSetupOpen] = useState(false);
  const openSetup = useCallback(() => setSetupOpen(true), []);
  const closeSetup = useCallback(() => setSetupOpen(false), []);

  /** 세션이 없으면 저장된 로그인으로 다시 받아 본다 (켤 때 인터넷이 끊겨 복원하지 못했을 수 있다) */
  const ensureSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;
    const connection = configRef.current?.connection;
    if (!connection) return null;
    const restored = await restoreSession(connection);
    if (!restored) return sessionRef.current;
    if (sessionRef.current || configRef.current?.connection?.url !== connection.url) {
      stopSession(restored);
      return sessionRef.current;
    }
    replaceSession(restored);
    return restored;
  }, [replaceSession]);

  const saveLastCheck = useCallback(
    (checked: ServerStatus, at: string) => {
      updateConfig({ lastCheck: { status: checked, at } }).catch((e: unknown) =>
        console.error("접속 확인 결과를 저장하지 못함", e),
      );
    },
    [updateConfig],
  );

  const health = useHealthCheck({
    connection: config?.connection ?? null,
    sessionReady,
    session,
    ensureSession,
    onChecked: saveLastCheck,
  });

  // 확인 결과가 나오기 전에는 띠를 띄우지 않도록 연결됨으로 둔다
  const status: ServerStatus = config?.connection ? (health.status ?? "connected") : "off";

  // [×]로 숨긴 안내 띠 (이번 실행 동안만, 파일에 남기지 않음, R41)
  const [dismissedBanners, setDismissedBanners] = useState<readonly ServerStatus[]>([]);
  const dismissBanner = useCallback((s: ServerStatus) => {
    setDismissedBanners((prev) => (prev.includes(s) ? prev : [...prev, s]));
  }, []);

  const { checking, recheck, resuming, resumeChecks, startResume } = health;
  const value = useMemo<ServerState>(
    () => ({
      config,
      status,
      checking,
      recheck,
      resuming,
      resumeChecks,
      startResume,
      dismissedBanners,
      dismissBanner,
      updateConfig,
      clearConnection,
      session,
      sessionReady,
      completeLogin,
      setupOpen,
      openSetup,
      closeSetup,
    }),
    [
      config,
      status,
      checking,
      recheck,
      resuming,
      resumeChecks,
      startResume,
      dismissedBanners,
      dismissBanner,
      updateConfig,
      clearConnection,
      session,
      sessionReady,
      completeLogin,
      setupOpen,
      openSetup,
      closeSetup,
    ],
  );

  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>;
}
