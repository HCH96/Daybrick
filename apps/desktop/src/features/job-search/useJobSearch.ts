import { createContext, useContext } from "react";
import type { ApiErrorKind } from "../server/management";
import type { ServerSession } from "../server/session";
import type { AiCall, BalanceRecord, JsSettings } from "./types";
import type { ProcessRunner } from "./useProcessRunner";

/** 구직 관리 탭들이 같이 쓰는 데이터. 단계마다 넓힌다. */
export interface JobSearchData {
  settings: JsSettings;
  /** 기준 잔액 입력 기록 (최근 것부터) */
  balanceRecords: BalanceRecord[];
  /** 이번 달 1일과 가장 오래된 기준 중 이른 쪽부터의 AI 호출 기록 */
  aiCalls: AiCall[];
}

export interface JobSearchState {
  session: ServerSession;
  /** 처음 읽기 전이거나 읽기에 실패했으면 null */
  data: JobSearchData | null;
  loading: boolean;
  /** 마지막 읽기의 실패 원인 */
  error: ApiErrorKind | null;
  /** 설정·기록·사용량을 다시 읽는다 */
  refresh: () => Promise<void>;
  /** [지금 평가] 실행기 (탭을 옮겨도 이어 돈다) */
  runner: ProcessRunner;
}

/** JobSearchProvider가 값을 넣는다 */
export const JobSearchContext = createContext<JobSearchState | null>(null);

export function useJobSearch(): JobSearchState {
  const state = useContext(JobSearchContext);
  if (!state) {
    throw new Error("useJobSearch는 JobSearchProvider 안에서만 쓸 수 있다.");
  }
  return state;
}
