import type { SupabaseClient } from "@supabase/supabase-js";
import { KINDS } from "./kinds";
import type { SyncKind } from "./types";

/**
 * 서버 동기화 행 읽기·올리기. 로그인 세션 클라이언트(anon key + 사용자 토큰)만 쓴다 (R6).
 * 쓰기는 RPC `daybrick_sync_push` 하나로만 한다 (D6).
 */

/** sync_documents 한 행 */
export interface ServerDoc {
  data: unknown;
  fileVersion: number;
  rev: number;
  updatedAt: string;
  device: string;
}

/**
 * 실패 종류. network·auth는 "대기"로 두고 연결·로그인이 돌아오면 다시 시도한다 (R11).
 * too-new는 서버 데이터가 앱보다 새 버전이라 받지 않은 것 (R22).
 */
export type SyncErrorType = "network" | "auth" | "too-new" | "server" | "bad-response";

export interface SyncError {
  type: SyncErrorType;
  message: string;
}

export type FetchResult = { ok: true; doc: ServerDoc | null } | { ok: false; error: SyncError };

/** 충돌 때 서버에 있는 지금 행 정보 (행이 없으면 rev·updatedAt·device가 null) */
export interface PushConflict {
  rev: number | null;
  updatedAt: string | null;
  device: string | null;
}

export type PushResult =
  | { ok: true; rev: number; updatedAt: string }
  | { ok: false; conflict: PushConflict }
  | { ok: false; error: SyncError };

interface PostgrestLikeError {
  code?: string;
  message?: string;
}

/** 오류를 network·auth·server로 나눈다. status 0 = 요청 자체가 실패 (인터넷 끊김) */
function classify(error: PostgrestLikeError, status: number): SyncError {
  const message = error.message ?? "서버 요청이 실패했습니다.";
  if (status === 0) return { type: "network", message };
  if (status === 401 || status === 403 || error.code === "42501" || error.code?.startsWith("PGRST3")) {
    return { type: "auth", message };
  }
  // RPC가 로그인 사용자를 못 찾으면 예외를 던진다 (0010: "로그인 필요")
  if (message.includes("로그인 필요")) return { type: "auth", message };
  return { type: "server", message };
}

function thrown(e: unknown): SyncError {
  return { type: "network", message: e instanceof Error ? e.message : "서버에 연결하지 못했습니다." };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** bigint는 PostgREST에서 숫자(또는 문자열)로 온다 */
function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function toText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** 본인 행 하나를 읽는다. 행이 없으면 doc: null. 앱보다 새 파일 버전이면 받지 않는다 (R22) */
export async function fetchDoc(client: SupabaseClient, kind: SyncKind): Promise<FetchResult> {
  try {
    const { data, error, status } = await client
      .from("sync_documents")
      .select("data, file_version, rev, updated_at, device")
      .eq("kind", kind)
      .maybeSingle();
    if (error) return { ok: false, error: classify(error, status) };
    if (data === null) return { ok: true, doc: null };

    const row: unknown = data;
    if (!isRecord(row)) return { ok: false, error: { type: "bad-response", message: "서버 행 모양이 올바르지 않습니다." } };
    const fileVersion = toNumber(row.file_version);
    const rev = toNumber(row.rev);
    const updatedAt = toText(row.updated_at);
    if (fileVersion === null || rev === null || updatedAt === null) {
      return { ok: false, error: { type: "bad-response", message: "서버 행 모양이 올바르지 않습니다." } };
    }
    if (fileVersion > KINDS[kind].fileVersion) {
      return {
        ok: false,
        error: { type: "too-new", message: `서버 데이터가 앱보다 새 버전입니다 (서버 ${fileVersion}, 앱 ${KINDS[kind].fileVersion}).` },
      };
    }
    return { ok: true, doc: { data: row.data, fileVersion, rev, updatedAt, device: toText(row.device) ?? "" } };
  } catch (e) {
    return { ok: false, error: thrown(e) };
  }
}

/**
 * 로컬 내용을 올린다 (D6). baseRev는 마지막으로 맞춘 서버 rev, 행이 없을 때는 null.
 * 서버 rev가 baseRev와 다르면 쓰지 않고 충돌로 돌려준다 (R14).
 */
export async function pushDoc(
  client: SupabaseClient,
  kind: SyncKind,
  data: unknown,
  fileVersion: number,
  baseRev: number | null,
  device: string,
): Promise<PushResult> {
  try {
    const { data: result, error, status } = await client.rpc("daybrick_sync_push", {
      p_kind: kind,
      p_data: data,
      p_file_version: fileVersion,
      p_base_rev: baseRev,
      p_device: device,
    });
    if (error) return { ok: false, error: classify(error, status) };

    const value: unknown = result;
    if (!isRecord(value) || typeof value.ok !== "boolean") {
      return { ok: false, error: { type: "bad-response", message: "서버 응답 모양이 올바르지 않습니다." } };
    }
    if (value.ok) {
      const rev = toNumber(value.rev);
      const updatedAt = toText(value.updated_at);
      if (rev === null || updatedAt === null) {
        return { ok: false, error: { type: "bad-response", message: "서버 응답 모양이 올바르지 않습니다." } };
      }
      return { ok: true, rev, updatedAt };
    }
    return {
      ok: false,
      conflict: { rev: toNumber(value.rev), updatedAt: toText(value.updated_at), device: toText(value.device) },
    };
  } catch (e) {
    return { ok: false, error: thrown(e) };
  }
}
