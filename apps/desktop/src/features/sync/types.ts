/** 동기화하는 종류. 서버 테이블 kind check 제약과 같다. */
export type SyncKind = "plan" | "calendar" | "applications" | "today";

export const SYNC_KINDS: readonly SyncKind[] = ["plan", "calendar", "applications", "today"];

/** 맞음·대기·선택 필요·오류·건너뜀 */
export type KindState = "ok" | "pending" | "choice" | "error" | "skipped";

export interface KindSync {
  /** 마지막으로 맞춘 서버 rev */
  rev: number | null;
  /** 그때 내용 해시 (D8) */
  hash: string | null;
  /** 마지막으로 올린/맞춘 시각 (ISO 문자열) */
  syncedAt: string | null;
  state: KindState;
  error: string | null;
}

/** 앱 데이터 폴더 sync.json의 모양 */
export interface SyncFile {
  version: 1;
  enabled: boolean;
  /** 마지막으로 동기화한 계정 id */
  userId: string | null;
  kinds: Record<SyncKind, KindSync>;
}
