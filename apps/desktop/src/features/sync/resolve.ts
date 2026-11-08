import { invoke, isTauri } from "@tauri-apps/api/core";
import type { SupabaseClient } from "@supabase/supabase-js";
import { KINDS } from "./kinds";
import { fetchDoc, pushDoc } from "./serverApi";
import { hashOf } from "./stableJson";
import type { KindSync, SyncKind } from "./types";

/** 고르기·받아오기 결과. 실패해도 sync는 늘 기록하고, message는 창에 보여준다 */
export interface ResolveResult {
  sync: KindSync;
  /** 성공이면 null */
  message: string | null;
}

/** 선택창에 보여줄 양쪽 정보 (R19) */
export interface ChoiceInfo {
  /** 이 PC: 파일 내용의 가장 늦은 수정 시각 (없으면 null = "알 수 없음") */
  localTime: string | null;
  localDevice: string;
  /** 로컬이 빈 데이터인지 (R15: 이때는 "서버에서 받아오기"를 추천) */
  localEmpty: boolean;
  /** 서버 행 (없으면 null) */
  server: { time: string; device: string } | null;
  /** 서버를 읽지 못했을 때 이유 */
  error: string | null;
}

/** 수정 시각으로 보는 키: 항목 updatedAt, 투데이 기록 end·타이머 lastSeenAt */
const TIME_KEYS = new Set(["updatedAt", "lastSeenAt", "end"]);

/** 데이터 안의 가장 늦은 수정 시각 (ISO 문자열). 하나도 없으면 null */
export function latestUpdatedAt(value: unknown): string | null {
  let best: string | null = null;
  let bestMs = -Infinity;
  const walk = (v: unknown) => {
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (typeof v !== "object" || v === null) return;
    for (const [key, child] of Object.entries(v)) {
      if (TIME_KEYS.has(key) && typeof child === "string") {
        const ms = Date.parse(child);
        if (!Number.isNaN(ms) && ms > bestMs) {
          bestMs = ms;
          best = child;
        }
      } else {
        walk(child);
      }
    }
  };
  walk(value);
  return best;
}

/** 덮기 전 백업 (R21). 실패하면 예외 */
async function writeBackup(kind: SyncKind, json: string): Promise<void> {
  if (!isTauri()) return;
  await invoke<string>("write_sync_backup", { kind, json });
}

function messageOf(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  return typeof e === "string" ? e : fallback;
}

/** 백업 폴더에 파일이 있는지 (R33) */
export async function hasSyncBackups(): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    return await invoke<boolean>("has_sync_backups");
  } catch {
    return false;
  }
}

/** 백업 폴더를 탐색기로 연다 (R33) */
export async function openSyncBackupDir(): Promise<void> {
  if (!isTauri()) return;
  await invoke("open_sync_backup_dir");
}

/**
 * 앱을 켤 때 로컬 파일이 비어 있는지 본다 (R15). 파일을 지웠거나 옮겨 빈 데이터로 읽혔는데
 * 마지막으로 맞춘 서버 행이 있고 내용이 다르면 "선택 필요"로 바꾼다 (자동으로 빈 내용을 올리지 않음).
 * 바꿀 것이 없으면 null.
 */
export async function checkEmptyLocal(kind: SyncKind, prev: KindSync): Promise<KindSync | null> {
  if (prev.rev === null || prev.state === "choice") return null;
  const local = await KINDS[kind].readLocal();
  if (local.kind !== "ok" || !local.empty) return null;
  if ((await hashOf(local.data)) === prev.hash) return null;
  return { ...prev, state: "choice", error: null };
}

/** 선택창을 열 때 양쪽 시각·기기 이름을 읽는다 */
export async function inspectChoice(client: SupabaseClient, kind: SyncKind, device: string): Promise<ChoiceInfo> {
  const def = KINDS[kind];
  const local = await def.readLocal();
  const localTime = local.kind === "ok" ? latestUpdatedAt(local.data) : null;
  const localEmpty = local.kind === "ok" && local.empty;
  const fetched = await fetchDoc(client, kind);
  if (!fetched.ok) return { localTime, localDevice: device, localEmpty, server: null, error: fetched.error.message };
  const doc = fetched.doc;
  return {
    localTime,
    localDevice: device,
    localEmpty,
    server: doc ? { time: doc.updatedAt, device: doc.device || "알 수 없음" } : null,
    error: null,
  };
}

/**
 * PC 내용 남기기 (서버를 덮음, R19·R21).
 * 서버 행을 다시 읽어 그 내용을 백업 → 지금 서버 rev로 올림. 그 사이 또 바뀌어 충돌하면 "선택 필요"로 두고 다시 고르게 한다.
 * 백업이 실패하면 덮지 않는다 (D5).
 */
export async function keepLocal(
  client: SupabaseClient,
  kind: SyncKind,
  prev: KindSync,
  device: string,
): Promise<ResolveResult> {
  const def = KINDS[kind];
  const local = await def.readLocal();
  if (local.kind === "unreadable") {
    return { sync: { ...prev, state: "skipped", error: local.message }, message: `이 PC 파일을 읽지 못했습니다: ${local.message}` };
  }

  const fetched = await fetchDoc(client, kind);
  if (!fetched.ok) return { sync: prev, message: fetched.error.message };
  const doc = fetched.doc;

  if (doc) {
    try {
      await writeBackup(kind, JSON.stringify(doc.data, null, 2));
    } catch (e) {
      return { sync: prev, message: `서버 내용을 백업하지 못해 덮지 않았습니다: ${messageOf(e, "백업 실패")}` };
    }
  }

  const hash = await hashOf(local.data);
  const pushed = await pushDoc(client, kind, local.data, def.fileVersion, doc ? doc.rev : null, device);
  if (pushed.ok) {
    return { sync: { rev: pushed.rev, hash, syncedAt: pushed.updatedAt, state: "ok", error: null }, message: null };
  }
  if ("conflict" in pushed) {
    return { sync: { ...prev, state: "choice", error: null }, message: "그 사이 서버 내용이 또 바뀌었습니다. 다시 골라 주세요." };
  }
  return { sync: prev, message: pushed.error.message };
}

/**
 * 서버 내용 받기 (PC를 덮음, R21–R23, R31).
 * 서버 데이터를 검사(새 버전·틀린 모양이면 거부) → 로컬 파일 백업 → 로컬에 씀 → 기능 화면 다시 읽기 → rev·hash 기록.
 * 백업이 실패하면 덮지 않는다 (D5).
 */
export async function takeServer(
  client: SupabaseClient,
  kind: SyncKind,
  prev: KindSync,
  reload: (() => Promise<void>) | undefined,
): Promise<ResolveResult> {
  const def = KINDS[kind];
  const fetched = await fetchDoc(client, kind);
  // 앱보다 새 버전은 fetchDoc이 거른다 (too-new)
  if (!fetched.ok) return { sync: prev, message: `받지 않았습니다. ${fetched.error.message}` };
  const doc = fetched.doc;
  if (!doc) return { sync: prev, message: "서버에 받을 내용이 없습니다." };

  let data: unknown;
  try {
    data = def.parse(doc.data);
  } catch (e) {
    return { sync: prev, message: `서버 내용의 모양이 맞지 않아 받지 않았습니다: ${messageOf(e, "검사 실패")}` };
  }

  try {
    const raw = await def.readRaw();
    if (raw !== null) await writeBackup(kind, raw);
  } catch (e) {
    return { sync: prev, message: `이 PC 파일을 백업하지 못해 덮지 않았습니다: ${messageOf(e, "백업 실패")}` };
  }

  try {
    await def.writeLocal(data);
  } catch (e) {
    return { sync: prev, message: `이 PC 파일에 쓰지 못했습니다: ${messageOf(e, "저장 실패")}` };
  }

  const hash = await hashOf(data);
  const sync: KindSync = { rev: doc.rev, hash, syncedAt: doc.updatedAt, state: "ok", error: null };
  try {
    await reload?.();
  } catch (e) {
    console.error("받은 내용 다시 읽기 실패", e);
    return { sync, message: "받아 왔지만 화면을 다시 읽지 못했습니다. 앱을 다시 켜 주세요." };
  }
  return { sync, message: null };
}
