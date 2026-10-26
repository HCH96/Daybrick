import { useEffect, useState } from "react";
import { getAppSchemaVersion } from "../../features/server/management";
import { fetchHealth, type HealthInfo } from "../../features/server/serverFunctions";
import type { ServerSession } from "../../features/server/session";
import { toDateKey } from "../../utils/date";

/** 연결됨 칸에 보여줄 서버 정보. health를 읽지 못했으면 server는 null. */
export interface ServerDetails {
  server: HealthInfo | null;
  appSchema: number;
}

/**
 * 연결됨 칸의 서버 구조 번호·Anthropic 키 등록일을 `health`로 읽는다 (R47, R48).
 * refreshKey(마지막 접속 확인 시각)가 바뀔 때마다 다시 읽는다. 읽기 전에는 null.
 */
export function useServerDetails(session: ServerSession, refreshKey: string | null): ServerDetails | null {
  const [details, setDetails] = useState<ServerDetails | null>(null);
  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchHealth(session.client), getAppSchemaVersion()]).then(([health, appSchema]) => {
      if (!cancelled) setDetails({ server: health.ok ? health.value : null, appSchema });
    });
    return () => {
      cancelled = true;
    };
  }, [session, refreshKey]);
  return details;
}

/** "2026-10-26" (PC 현지 시간) */
export function formatDay(iso: string): string {
  return toDateKey(new Date(iso));
}

/** "2026-10-26 09:12" (PC 현지 시간) */
export function formatDayTime(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${toDateKey(date)} ${hh}:${mm}`;
}
