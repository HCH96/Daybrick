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

/** 인증 설정: Google 로그인 켜기, 이메일 로그인 끄기, 리디렉션 허용 주소 (R15 1단계) */
export function configureAuth(
  pat: string,
  projectRef: string,
  googleClientId: string,
  googleClientSecret: string,
): Promise<ApiResult<null>> {
  return call<null>("configure_auth", { pat, projectRef, googleClientId, googleClientSecret });
}

export interface AppliedMigrations {
  /** 적용 전 서버 구조 번호 */
  from: number;
  /** 적용 뒤 서버 구조 번호 */
  to: number;
}

/** 서버의 지금 번호 다음부터 앱의 최신 번호까지 적용 (R22, R26). 시작 번호는 Rust가 서버에서 읽는다. */
export function applyMigrations(pat: string, projectRef: string): Promise<ApiResult<AppliedMigrations>> {
  return call<AppliedMigrations>("apply_migrations", { pat, projectRef });
}

/** 앱이 가진 서버 함수 묶음을 모두 배포 (D16) */
export function deployFunctions(pat: string, projectRef: string): Promise<ApiResult<null>> {
  return call<null>("deploy_functions", { pat, projectRef });
}

/** 서버 함수 비밀값 등록: ANTHROPIC_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (R15 4단계) */
export function setSecrets(
  pat: string,
  projectRef: string,
  anthropicKey: string,
  googleClientId: string,
  googleClientSecret: string,
): Promise<ApiResult<null>> {
  return call<null>("set_secrets", { pat, projectRef, anthropicKey, googleClientId, googleClientSecret });
}

/** 새 가입 막기 켜기: 처음 로그인한 계정 하나만 남긴다 (R29, D12) */
export function disableSignup(pat: string, projectRef: string): Promise<ApiResult<null>> {
  return call<null>("disable_signup", { pat, projectRef });
}

/**
 * 관리 API의 프로젝트 상태를 재개 판단에 필요한 만큼만 나눈 것.
 * `INACTIVE` = 일시정지(추측), `ACTIVE_HEALTHY` = 켜짐, 그 밖(`RESTORING`·`COMING_UP` 등) = 켜지는 중.
 */
export type ProjectRunState = "paused" | "active" | "starting";

/** 프로젝트가 일시정지인지·켜졌는지·켜지는 중인지 (R42) */
export async function getProjectRunState(pat: string, projectRef: string): Promise<ApiResult<ProjectRunState>> {
  const result = await call<string>("project_status", { pat, projectRef });
  if (!result.ok) return result;
  const status = result.value.toUpperCase();
  if (status === "INACTIVE" || status === "PAUSED") return { ok: true, value: "paused" };
  if (status === "ACTIVE_HEALTHY") return { ok: true, value: "active" };
  return { ok: true, value: "starting" };
}

/** 일시정지된 프로젝트 재개 요청 (R42). 켜지는 데 1~2분 걸린다. */
export function restoreProject(pat: string, projectRef: string): Promise<ApiResult<null>> {
  return call<null>("restore_project", { pat, projectRef });
}

/** [여기서 재개] 결과: 재개를 요청함 / 이미 켜지는 중 / 이미 켜짐 / 실패 */
export type ResumeRequest = { kind: "requested" | "starting" | "active" } | { kind: "failed"; reason: ApiErrorKind };

/** 상태를 먼저 보고, 일시정지일 때만 재개를 요청한다 (이미 켜지는 중이면 기다리기만). */
export async function requestResume(pat: string, projectRef: string): Promise<ResumeRequest> {
  const state = await getProjectRunState(pat, projectRef);
  if (!state.ok) return { kind: "failed", reason: state.error };
  if (state.value !== "paused") return { kind: state.value };
  const restored = await restoreProject(pat, projectRef);
  return restored.ok ? { kind: "requested" } : { kind: "failed", reason: restored.error };
}

/** Tauri 밖(브라우저 미리보기)에서 쓰는 최신 서버 구조 번호. 기준은 Rust `migrations.rs` (D15). */
const PREVIEW_SCHEMA_VERSION = 1;
let appSchemaVersion: Promise<number> | null = null;

/** 앱의 최신 서버 구조 번호를 Rust에서 한 번 받아 와 기억한다 (D24) */
export function getAppSchemaVersion(): Promise<number> {
  if (!isTauri()) return Promise.resolve(PREVIEW_SCHEMA_VERSION);
  appSchemaVersion ??= invoke<number>("latest_schema_version").catch(() => {
    appSchemaVersion = null;
    return PREVIEW_SCHEMA_VERSION;
  });
  return appSchemaVersion;
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
