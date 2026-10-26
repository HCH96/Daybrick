import type { SupabaseClient } from "@supabase/supabase-js";
import { writeReadState } from "./serverSync";
import type { AppNotification, PendingAck } from "./types";

/**
 * 서버에 아직 반영하지 못한 확인/되돌림 기록 (R33, D16).
 * 서버 알림을 바꾸면 먼저 여기에 쌓고, 서버 쓰기에 성공한 것만 지운다.
 */

/** 대기 기록을 더한다. 같은 id는 마지막 기록만 남기고 맨 뒤로 보낸다. */
export function addPending(list: readonly PendingAck[], ack: PendingAck): PendingAck[] {
  return [...list.filter((p) => p.id !== ack.id), ack];
}

/** 받아 온 서버 알림에 대기 기록을 덮어씌운다 (아직 서버에 안 간 내 기록이 우선). */
export function applyPending(list: readonly AppNotification[], pending: readonly PendingAck[]): AppNotification[] {
  if (pending.length === 0) return [...list];
  const byId = new Map(pending.map((p) => [p.id, p]));
  return list.map((n) => {
    const ack = byId.get(n.id);
    return ack && n.readAt !== ack.readAt ? { ...n, readAt: ack.readAt } : n;
  });
}

/** 서버 쓰기에 성공한 기록만 지운다. 그 사이 같은 id에 새 기록(at이 다름)이 생겼으면 남긴다. */
export function removeSent(list: readonly PendingAck[], sent: readonly PendingAck[]): PendingAck[] {
  const sentKeys = new Set(sent.map((p) => `${p.id}|${p.at}`));
  return list.filter((p) => !sentKeys.has(`${p.id}|${p.at}`));
}

/**
 * 대기 기록을 앞에서부터 서버에 반영한다. 같은 readAt 값끼리는 한 번에 보낸다 ([모두 확인]).
 * 실패하면 거기서 멈추고, 성공한 기록만 돌려준다 (호출한 쪽이 removeSent로 지운다).
 */
export async function flushPending(client: SupabaseClient, pending: readonly PendingAck[]): Promise<PendingAck[]> {
  const sent: PendingAck[] = [];
  let index = 0;
  while (index < pending.length) {
    const readAt = pending[index].readAt;
    const group: PendingAck[] = [];
    while (index < pending.length && pending[index].readAt === readAt) {
      group.push(pending[index]);
      index += 1;
    }
    try {
      await writeReadState(
        client,
        group.map((p) => p.id),
        readAt,
      );
    } catch (e: unknown) {
      console.error("서버 알림 확인 기록 실패", e instanceof Error ? e.message : e);
      break;
    }
    sent.push(...group);
  }
  return sent;
}
