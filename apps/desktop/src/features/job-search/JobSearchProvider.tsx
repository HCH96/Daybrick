import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ApiErrorKind } from "../server/management";
import type { ServerSession } from "../server/session";
import { loadAiCallsSince, loadBalanceRecords, loadSettings } from "./api";
import { callsSince } from "./usage";
import { useProcessRunner } from "./useProcessRunner";
import { JobSearchContext, type JobSearchData, type JobSearchState } from "./useJobSearch";

/** 입력 기록 표에 보여 줄 기준 잔액 수 */
const BALANCE_HISTORY_SIZE = 10;

/** 구직 관리 화면이 열릴 때 설정·기준 잔액·호출 기록을 읽어 탭들에 나눠 준다 (R75, R76) */
export function JobSearchProvider({ session, children }: { session: ServerSession; children: ReactNode }) {
  const [data, setData] = useState<JobSearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorKind | null>(null);
  // 늦게 끝난 앞 요청이 새 결과를 덮지 않게 요청 번호를 센다
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    const [settings, records] = await Promise.all([loadSettings(session), loadBalanceRecords(session, BALANCE_HISTORY_SIZE)]);
    if (request !== requestRef.current) return;
    if (!settings.ok || !records.ok) {
      setError(!settings.ok ? settings.error : !records.ok ? records.error : "server");
      setLoading(false);
      return;
    }
    const calls = await loadAiCallsSince(session, callsSince(records.value, new Date()));
    if (request !== requestRef.current) return;
    if (!calls.ok) {
      setError(calls.error);
    } else {
      setError(null);
      setData({ settings: settings.value, balanceRecords: records.value, aiCalls: calls.value });
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // 평가가 끝나면 사용액(AI 호출 기록)을 다시 읽는다
  const afterRun = useCallback(() => void refresh(), [refresh]);
  const runner = useProcessRunner(session, afterRun);

  const value = useMemo<JobSearchState>(
    () => ({ session, data, loading, error, refresh, runner }),
    [session, data, loading, error, refresh, runner],
  );

  return <JobSearchContext.Provider value={value}>{children}</JobSearchContext.Provider>;
}
