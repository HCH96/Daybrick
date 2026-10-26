import { invoke, isTauri } from "@tauri-apps/api/core";

/**
 * Rust의 관리 API·Anthropic 키 확인 명령 감싸기 (D11).
 * PAT·키는 호출마다 인자로만 넘기고, 이 파일도 값을 보관하지 않는다 (R18).
 */

/** Rust `server/http.rs`가 돌려주는 오류 원인 종류 */
export type ApiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "rate-limited"
  | "server"
  | "network"
  | "bad-response";

const KINDS: readonly ApiErrorKind[] = [
  "unauthorized",
  "forbidden",
  "not-found",
  "rate-limited",
  "server",
  "network",
  "bad-response",
];

export type ApiResult<T> = { ok: true; value: T } | { ok: false; error: ApiErrorKind };

/** 명령을 부르고 실패를 원인 종류로 바꾼다. 오류 원문은 콘솔에도 남기지 않는다. */
async function call<T>(command: string, args: Record<string, string>): Promise<ApiResult<T>> {
  if (!isTauri()) return { ok: false, error: "network" };
  try {
    return { ok: true, value: await invoke<T>(command, args) };
  } catch (e) {
    const kind = KINDS.find((k) => k === e);
    return { ok: false, error: kind ?? "server" };
  }
}

/** Anthropic 키가 동작하는지 (요금 없는 모델 목록 조회, R12) */
export function checkAnthropicKey(key: string): Promise<ApiResult<null>> {
  return call<null>("check_anthropic_key", { key });
}

/** PAT로 이 프로젝트에 접근할 수 있는지 (R13) */
export function checkPatAccess(pat: string, projectRef: string): Promise<ApiResult<null>> {
  return call<null>("check_pat_access", { pat, projectRef });
}

export interface ProjectInspection {
  /** Daybrick 구조 번호 테이블이 있는지 */
  hasSchemaTable: boolean;
  /** public 스키마의 Daybrick 것이 아닌 테이블 수 */
  otherTables: number;
}

/** 빈 프로젝트 검사 (R14) */
export function inspectProject(pat: string, projectRef: string): Promise<ApiResult<ProjectInspection>> {
  return call<ProjectInspection>("inspect_project", { pat, projectRef });
}

/** [세팅 시작] 전 사전 확인 결과. 실패하면 어느 확인에서 왜 실패했는지만 담는다. */
export type SetupPrecheck =
  | { kind: "ok" }
  | { kind: "not-empty"; otherTables: number }
  | { kind: "anthropic-failed" | "pat-failed" | "inspect-failed"; reason: ApiErrorKind };

/** 키 → PAT → 빈 프로젝트 순서로 확인한다 (R12–R14). 앞이 실패하면 뒤는 부르지 않는다. */
export async function runSetupPrecheck(
  anthropicKey: string,
  pat: string,
  projectRef: string,
): Promise<SetupPrecheck> {
  const key = await checkAnthropicKey(anthropicKey);
  if (!key.ok) return { kind: "anthropic-failed", reason: key.error };
  const access = await checkPatAccess(pat, projectRef);
  if (!access.ok) return { kind: "pat-failed", reason: access.error };
  const inspection = await inspectProject(pat, projectRef);
  if (!inspection.ok) return { kind: "inspect-failed", reason: inspection.error };
  const { hasSchemaTable, otherTables } = inspection.value;
  if (!hasSchemaTable && otherTables > 0) return { kind: "not-empty", otherTables };
  return { kind: "ok" };
}
