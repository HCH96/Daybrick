import { getAppSchemaVersion } from "./management";
import { createServerClient } from "./supabaseClient";
import type { ProbeResult } from "./types";
import { keyFormat, parseSupabaseUrl } from "./validate";

/** 접속 확인을 기다리는 최대 시간. 넘으면 접속 불가로 본다. */
const PROBE_TIMEOUT_MS = 10_000;

/**
 * Supabase가 일시정지된 프로젝트에 돌려주는 상태 코드 (추측: Supabase 문서의 "540 Project Paused").
 * 실제 일시정지 프로젝트로 아직 확인하지 못했다.
 */
const PAUSED_STATUS = 540;

/** 함수가 없을 때 PostgREST 오류 코드 (빈 서버) */
const FUNCTION_NOT_FOUND = "PGRST202";

/**
 * 공개 RPC `daybrick_schema_version()`을 불러 서버 상태를 본다 (D17).
 * 주소·키 형식은 미리 확인했다고 본다.
 */
export async function probeServer(url: string, anonKey: string): Promise<ProbeResult> {
  const client = createServerClient(url, anonKey);
  const { data, error, status } = await client
    .rpc("daybrick_schema_version")
    .abortSignal(AbortSignal.timeout(PROBE_TIMEOUT_MS));

  if (!error) {
    const schema: unknown = data;
    return { kind: "ok", schema: typeof schema === "number" ? schema : null };
  }
  if (status === PAUSED_STATUS || /paused/i.test(error.message)) return { kind: "paused" };
  if (status === 401 || status === 403) return { kind: "bad-key" };
  if (error.code === FUNCTION_NOT_FOUND) return { kind: "ok", schema: null };
  // status 0 = 요청 자체가 실패(인터넷 끊김, 없는 주소, 시간 초과). 그 밖의 서버 오류도 접속 불가로 본다.
  return { kind: "unreachable" };
}

/** 접속에 성공한 뒤 갈 곳 (R6) */
export type KeysRoute = "setup" | "login" | "login-update" | "app-update";

/**
 * 서버 구조 번호와 앱의 최신 번호(Rust `migrations.rs`, D24)로 다음 화면을 정한다:
 * 없음 → 자동 세팅, 같음 → 로그인, 낮음 → 로그인 후 서버 업데이트, 높음 → 앱 업데이트
 */
export function routeForSchema(schema: number | null, appSchema: number): KeysRoute {
  if (schema === null) return "setup";
  if (schema === appSchema) return "login";
  return schema < appSchema ? "login-update" : "app-update";
}

/** ② 주소·키 [확인] 결과. 형식 오류는 서버에 묻지 않고 앱에서 바로 정한다. */
export type KeysCheck =
  | {
      kind: "ok";
      url: string;
      ref: string;
      anonKey: string;
      schema: number | null;
      /** 앱의 최신 서버 구조 번호 */
      appSchema: number;
      route: KeysRoute;
    }
  | { kind: "bad-url" | "bad-key-format" | "secret-key" | "bad-key" | "unreachable" }
  | { kind: "paused"; ref: string };

/** 주소·키 형식을 보고, 맞으면 서버에 접속해 본다 (R4–R6) */
export async function checkKeys(urlInput: string, keyInput: string): Promise<KeysCheck> {
  const address = parseSupabaseUrl(urlInput);
  if (!address) return { kind: "bad-url" };
  const format = keyFormat(keyInput);
  if (format === null) return { kind: "bad-key-format" };
  if (format === "secret") return { kind: "secret-key" };

  const anonKey = keyInput.trim();
  const probe = await probeServer(address.url, anonKey);
  switch (probe.kind) {
    case "ok": {
      const appSchema = await getAppSchemaVersion();
      const route = routeForSchema(probe.schema, appSchema);
      return { kind: "ok", ...address, anonKey, schema: probe.schema, appSchema, route };
    }
    case "paused":
      return { kind: "paused", ref: address.ref };
    default:
      return { kind: probe.kind };
  }
}
