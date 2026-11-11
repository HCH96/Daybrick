// 서버 함수 공용: Anthropic Message Batches API (job-search R102–R110, D70–D72).
// 요청 본문(params)은 `ai.ts`의 `messageParams`로 만든다 (바로 호출과 같은 본문, D45).
// 키 값과 요청·결과 본문은 기록하지 않는다. 크레딧 부족·오류 알림과 비용 기록은 호출하는 쪽이 한다.
import { isCreditError } from "./ai.ts";

const API = "https://api.anthropic.com/v1/messages/batches";
const VERSION = "2023-06-01";

/** 일괄 요청 하나: custom_id는 공고 id (uuid, Anthropic 제한 `^[a-zA-Z0-9_-]{1,64}$` 안) */
export interface BatchRequest {
  custom_id: string;
  params: Record<string, unknown>;
}

export type BatchFailure = { reason: "missing-key" | "network" | "upstream" | "credit" | "bad-response" };

export type BatchResultType = "succeeded" | "errored" | "canceled" | "expired";

export interface BatchCounts {
  processing: number;
  succeeded: number;
  errored: number;
  canceled: number;
  expired: number;
}

export interface BatchInfo {
  id: string;
  /** in_progress | canceling | ended */
  status: string;
  counts: BatchCounts;
  /** ended일 때만 있다 */
  resultsUrl: string | null;
}

/** 결과 파일(JSONL) 한 줄 */
export interface BatchLine {
  customId: string;
  type: BatchResultType;
  /** succeeded일 때 Messages 응답 본문 (content·usage·stop_reason) */
  message: unknown;
  /** errored일 때 오류 본문 ({ type, error: { type, message } }) */
  error: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function headers(key: string): Record<string, string> {
  return { "x-api-key": key, "anthropic-version": VERSION, "content-type": "application/json" };
}

/** 오류 응답을 함수 로그에 남긴다: 상태 코드, 오류 종류·메시지(300자), 요청 ID. 키와 본문은 남기지 않는다 */
function logFailure(label: string, status: number, body: unknown) {
  const error = isRecord(body) && isRecord(body.error) ? body.error : {};
  const type = typeof error.type === "string" ? error.type : "(없음)";
  const message = typeof error.message === "string" ? error.message.slice(0, 300) : "(없음)";
  const requestId = isRecord(body) && typeof body.request_id === "string" ? body.request_id : "(없음)";
  console.error(`Anthropic 일괄 API 오류(${label}): status=${status} type=${type} request_id=${requestId} message=${message}`);
}

function readInfo(body: unknown): BatchInfo | null {
  if (!isRecord(body) || typeof body.id !== "string") return null;
  const c = isRecord(body.request_counts) ? body.request_counts : {};
  return {
    id: body.id,
    status: typeof body.processing_status === "string" ? body.processing_status : "in_progress",
    counts: {
      processing: num(c.processing),
      succeeded: num(c.succeeded),
      errored: num(c.errored),
      canceled: num(c.canceled),
      expired: num(c.expired),
    },
    resultsUrl: typeof body.results_url === "string" ? body.results_url : null,
  };
}

async function send(
  url: string,
  init: { method: string; body?: string },
  label: string,
): Promise<BatchInfo | BatchFailure> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return { reason: "missing-key" };
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: headers(key) });
  } catch {
    return { reason: "network" };
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isCreditError(response.status, body)) return { reason: "credit" };
    logFailure(label, response.status, body);
    return { reason: "upstream" };
  }
  return readInfo(body) ?? { reason: "bad-response" };
}

/** 요청 하나를 JSON 글자로 만든다. 맡기는 쪽이 크기(약 10MB 나누기)를 재고 그대로 `createBatch`에 넘긴다 */
export function batchRequestJson(customId: string, params: Record<string, unknown>): string {
  const request: BatchRequest = { custom_id: customId, params };
  return JSON.stringify(request);
}

/** 일괄 작업을 만든다 (`POST /v1/messages/batches`). `requests`는 `batchRequestJson`으로 만든 글자들 */
export function createBatch(requests: string[]): Promise<BatchInfo | BatchFailure> {
  return send(API, { method: "POST", body: `{"requests":[${requests.join(",")}]}` }, "만들기");
}

/** 일괄 작업 상태를 읽는다 (`GET /v1/messages/batches/{id}`) */
export function getBatch(id: string): Promise<BatchInfo | BatchFailure> {
  return send(`${API}/${encodeURIComponent(id)}`, { method: "GET" }, "상태 읽기");
}

export function isBatchFailure(value: BatchInfo | BatchFailure): value is BatchFailure {
  return "reason" in value;
}

function readLine(text: string): BatchLine | null {
  let row: unknown;
  try {
    row = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(row) || typeof row.custom_id !== "string" || !isRecord(row.result)) return null;
  const type = row.result.type;
  if (type !== "succeeded" && type !== "errored" && type !== "canceled" && type !== "expired") return null;
  return { customId: row.custom_id, type, message: row.result.message ?? null, error: row.result.error ?? null };
}

/**
 * 결과 파일(JSONL)을 줄 단위로 읽어 한 줄씩 `onLine`에 넘긴다 (파일 전체를 메모리에 올리지 않는다).
 * `deadline`(Date.now() 값)이 지나면 다음 줄을 넘기지 않고 `time`을 돌려준다. 다음 실행이 처음부터 다시 읽는다.
 * `onLine`이 false를 돌려주면 그 자리에서 멈추고 `stopped`.
 */
export async function readResults(
  url: string,
  onLine: (line: BatchLine) => Promise<boolean | void>,
  deadline: number,
): Promise<"done" | "time" | "stopped" | BatchFailure> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return { reason: "missing-key" };
  let response: Response;
  try {
    response = await fetch(url, { headers: { "x-api-key": key, "anthropic-version": VERSION } });
  } catch {
    return { reason: "network" };
  }
  if (!response.ok || !response.body) {
    const body: unknown = await response.json().catch(() => null);
    logFailure("결과 읽기", response.status, body);
    return { reason: "upstream" };
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let rest = "";
  const handle = async (text: string): Promise<"time" | "stopped" | null> => {
    if (text.trim() === "") return null;
    if (Date.now() > deadline) return "time";
    const line = readLine(text);
    if (!line) {
      console.error("Anthropic 일괄 결과 줄 해석 실패");
      return null;
    }
    return (await onLine(line)) === false ? "stopped" : null;
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      rest += value;
      let at = rest.indexOf("\n");
      while (at >= 0) {
        const stop = await handle(rest.slice(0, at));
        if (stop) {
          await reader.cancel().catch(() => undefined);
          return stop;
        }
        rest = rest.slice(at + 1);
        at = rest.indexOf("\n");
      }
    }
    const stop = await handle(rest);
    return stop ?? "done";
  } catch {
    return { reason: "network" };
  }
}
