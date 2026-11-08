import type { KindSync } from "./types";

/** R18 판정 결과: 올림 / 받아오기 물음 / 같음 / 사용자가 고름 */
export type Verdict = "upload" | "ask-pull" | "same" | "choose";

/** 서버 행 요약 (내용은 해시로만 비교한다, D8) */
export interface ServerSide {
  rev: number;
  hash: string;
  /** 서버 내용이 "빈 데이터"인지 (plan/index.md 작은 규칙) */
  empty: boolean;
}

/** 로컬 파일 요약 */
export interface LocalSide {
  hash: string;
  empty: boolean;
}

/** 마지막으로 맞춘 기록 (sync.json의 종류별 칸) */
export type LastSync = Pick<KindSync, "rev" | "hash">;

/**
 * 서버·로컬·마지막으로 맞춘 기록으로 할 일을 정한다 (R15, R18, D4).
 * - 서버 행 없음 → 올림
 * - 내용 해시 같음 → 같음
 * - 로컬은 비었는데 서버엔 내용 있음 → 받아오기 물음 (자동으로 올리지 않음)
 * - 이미 맞춘 적 있고 서버 rev가 그대로면 로컬만 바뀐 것 → 올림 (평소 올리기)
 * - 그 밖 (둘 다 내용이 있고 다름) → 사용자가 고름 (R19)
 */
export function decide(server: ServerSide | null, local: LocalSide, last: LastSync | null): Verdict {
  if (server === null) return "upload";
  if (server.hash === local.hash) return "same";
  if (local.empty && !server.empty) return "ask-pull";
  if (last !== null && last.rev !== null && last.rev === server.rev) return "upload";
  return "choose";
}
