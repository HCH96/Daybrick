import { getAppSchemaVersion } from "./management";
import { probeServer } from "./probe";
import { fetchHealth } from "./serverFunctions";
import type { ServerSession } from "./session";
import type { ServerConnection, ServerStatus } from "./types";

/**
 * 접속 확인으로 서버 상태를 정한다 (R37–R40, D17).
 * 로그인돼 있으면 `health` 서버 함수, 아니면 공개 RPC `daybrick_schema_version()`. 둘 다 DB를 실제로 읽는다 (R39).
 * 연결 정보가 없을 때("off")는 부르지 않는다.
 */

type ConnectionKeys = Pick<ServerConnection, "url" | "anonKey">;

/** 서버 구조 번호와 앱의 최신 번호로 정하는 상태 (같으면 연결됨) */
function statusForSchema(schema: number | null, appSchema: number): ServerStatus {
  const server = schema ?? 0;
  if (server === appSchema) return "connected";
  return server < appSchema ? "server-update" : "app-update";
}

/** 로그인 없이 공개 RPC로 확인한다. 서버가 앱보다 새 버전이면 앱 업데이트, 그 밖에는 로그인 필요. */
async function checkWithoutLogin(connection: ConnectionKeys, appSchema: number): Promise<ServerStatus> {
  const probe = await probeServer(connection.url, connection.anonKey);
  switch (probe.kind) {
    case "ok":
      return probe.schema !== null && probe.schema > appSchema ? "app-update" : "login-needed";
    case "paused":
      return "paused";
    // 저장된 키가 거절되는 경우도 사용자가 할 일은 설정에서 연결을 확인하는 것이라 접속 불가로 묶는다
    case "bad-key":
    case "bad-url":
    case "unreachable":
      return "unreachable";
  }
}

/** 서버 상태를 한 번 확인한다. 세션이 있으면 로그인한 확인, 없으면 공개 RPC. */
export async function checkServerStatus(
  connection: ConnectionKeys,
  session: ServerSession | null,
): Promise<ServerStatus> {
  const appSchema = await getAppSchemaVersion();
  if (!session) return checkWithoutLogin(connection, appSchema);

  const health = await fetchHealth(session.client);
  if (health.ok) return statusForSchema(health.value.schema, appSchema);

  // 세션이 만료·취소됐으면 로그인 필요. 단 서버가 멈춘 경우와 구분하려고 공개 RPC로 한 번 더 본다.
  const probe = await probeServer(connection.url, connection.anonKey);
  if (probe.kind === "paused") return "paused";
  if (probe.kind !== "ok") return "unreachable";
  if (health.error === "unauthorized") return "login-needed";
  // DB는 읽히는데 서버 함수가 없으면 함수 재배포(서버 업데이트)가 필요하다
  if (health.error === "not-found") return "server-update";
  const bySchema = statusForSchema(probe.schema, appSchema);
  return bySchema === "connected" ? "unreachable" : bySchema;
}
