import { useEffect, useRef } from "react";
import { useApplications } from "../applications/store";
import type { Application, StatusId } from "../applications/types";
import type { ServerSession } from "../server/session";
import { useServer } from "../server/useServer";
import { updateServerApplication } from "./applyApi";
import { loadJobSearchLocal, updateJobSearchLocal, withPending, type PendingStatus } from "./localState";

/**
 * 지원 관리 카드 상태 → 서버 지원 건 (R58, R59, D21).
 * 구직 관리가 만든 카드(`jobLink`)의 상태가 바뀌면 서버 지원 건 상태를 고치고,
 * 카드를 지우거나 종료로 바꾸면 `closed = true`(메일 확인 대상에서 빠짐).
 * 보내지 못하면 job-search.json 대기 목록에 쌓았다가 다음 연결 때 보낸다.
 */

interface LinkState {
  serverId: string;
  status: StatusId;
}

/** 카드 id → 연결된 지원 건과 지금 상태 */
function linkMap(applications: Application[]): Map<string, LinkState> {
  const map = new Map<string, LinkState>();
  for (const a of applications) {
    if (a.jobLink) map.set(a.id, { serverId: a.jobLink.serverId, status: a.status });
  }
  return map;
}

/** 앞뒤 상태를 비교해 서버에 보낼 변경을 만든다. 새로 생긴 카드는 서버에 이미 같은 상태가 있어 보내지 않는다 */
export function diffLinks(prev: Map<string, LinkState>, next: Map<string, LinkState>, at: string): PendingStatus[] {
  const changes: PendingStatus[] = [];
  for (const [cardId, before] of prev) {
    const after = next.get(cardId);
    if (!after) changes.push({ serverId: before.serverId, status: before.status, closed: true, at });
    else if (after.status !== before.status) {
      changes.push({ serverId: after.serverId, status: after.status, closed: after.status === "closed", at });
    }
  }
  return changes;
}

/** 하나를 보내고 결과에 맞춰 대기 목록을 고친다 (보냈으면 그 지원 건의 옛 대기를 지운다) */
async function send(session: ServerSession | null, change: PendingStatus): Promise<void> {
  const result = session ? await updateServerApplication(session, change.serverId, change) : null;
  const sent = result?.ok === true;
  if (!sent && result) console.error("지원 건 상태를 서버에 보내지 못함", result.error);
  await updateJobSearchLocal((local) => ({
    ...local,
    pendingStatus: sent
      ? local.pendingStatus.filter((p) => p.serverId !== change.serverId || p.at > change.at)
      : withPending(local.pendingStatus, change),
  }));
}

/** 대기 목록을 보낸다. 보내는 동안 새로 쌓인 변경은 남긴다 */
export async function flushPending(session: ServerSession): Promise<void> {
  const local = await loadJobSearchLocal();
  const done: PendingStatus[] = [];
  for (const item of local.pendingStatus) {
    const result = await updateServerApplication(session, item.serverId, item);
    if (!result.ok) {
      console.error("대기 중인 지원 건 상태를 보내지 못함", result.error);
      continue;
    }
    done.push(item);
  }
  if (done.length === 0) return;
  await updateJobSearchLocal((l) => ({
    ...l,
    pendingStatus: l.pendingStatus.filter((p) => !done.some((d) => d.serverId === p.serverId && d.at === p.at)),
  }));
}

/** ApplicationsProvider 안에서 한 번만 부른다 (App.tsx) */
export function useJobStatusSync(): void {
  const { state } = useApplications();
  const { serverSession, status } = useServer();
  const session = serverSession !== null && status === "connected" ? serverSession : null;
  const sessionRef = useRef<ServerSession | null>(session);
  sessionRef.current = session;
  const prevRef = useRef<Map<string, LinkState> | null>(null);

  const applications = state.kind === "ready" ? state.data.applications : null;
  useEffect(() => {
    if (!applications) return;
    const next = linkMap(applications);
    const prev = prevRef.current;
    prevRef.current = next;
    if (!prev) return; // 처음 읽은 상태는 비교하지 않는다
    for (const change of diffLinks(prev, next, new Date().toISOString())) {
      send(sessionRef.current, change).catch((e: unknown) => console.error("지원 건 상태 대기 목록 저장 실패", e));
    }
  }, [applications]);

  // 연결되면(앱 시작·다시 로그인) 대기 목록을 보낸다
  useEffect(() => {
    if (!session) return;
    flushPending(session).catch((e: unknown) => console.error("지원 건 상태 대기 목록 읽기 실패", e));
  }, [session]);
}
