import { useEffect, useRef, type Dispatch } from "react";
import { useServer } from "../server/useServer";
import { flushPending } from "./pendingAcks";
import type { NotificationsAction } from "./reducer";
import { fetchServerNotifications, subscribeServerNotifications } from "./serverSync";
import type { PendingAck } from "./types";

/**
 * 서버가 "연결됨"이고 로그인 세션이 있을 때만 서버 알림을 받고 실시간으로 구독한다 (R30–R32, D12).
 * 받은 목록은 서버 사본(serverCopy)에 넣어 파일에 저장되므로, 연결이 끊겨도 마지막 목록을 계속 보여준다 (R34).
 * 서버 알림의 확인 기록(pendingAcks)은 연결되면 먼저 서버에 쓰고 나서 전체를 다시 받는다 (R33, D16).
 * 서버 상태 문제는 알림을 만들지 않는다. 기존 안내 띠(ServerBanner)가 맡는다 (R35, D7).
 * NotificationsProvider 안에서 파일을 다 읽은 뒤(pendingAcks가 null이 아님)에 동작한다.
 */
export function useServerNotifications(pendingAcks: PendingAck[] | null, dispatch: Dispatch<NotificationsAction>): void {
  const { serverSession, status } = useServer();
  const active = pendingAcks !== null && serverSession !== null && status === "connected";
  const pendingRef = useRef<PendingAck[]>([]);
  const flushRef = useRef<(() => Promise<void>) | null>(null);

  // 대기 기록을 ref에 옮기고, 확인·되돌림으로 바뀌면 연결된 동안 바로 서버에 쓴다.
  // 아래 연결 effect보다 먼저 선언해야 연결 직후 첫 flush가 최신 기록을 본다.
  useEffect(() => {
    pendingRef.current = pendingAcks ?? [];
    if (pendingAcks && pendingAcks.length > 0) void flushRef.current?.();
  }, [pendingAcks]);

  useEffect(() => {
    if (!active || !serverSession) return;
    const { client, userId } = serverSession;
    let alive = true;
    let latest = 0;
    let flushing = false;
    let again = false;

    // 대기 기록을 서버에 쓴다. 쓰는 중에 새 기록이 생기면 끝난 뒤 한 번 더 쓴다.
    // 실패하면 남은 기록은 그대로 두고, 다음 확인 동작이나 다시 연결될 때 또 시도한다.
    const flush = async () => {
      if (flushing) {
        again = true;
        return;
      }
      flushing = true;
      try {
        do {
          again = false;
          const list = pendingRef.current;
          if (list.length === 0) break;
          const sent = await flushPending(client, list);
          if (!alive) return;
          if (sent.length > 0) dispatch({ type: "acks-sent", sent });
          if (sent.length < list.length) break;
        } while (again);
      } finally {
        flushing = false;
      }
    };
    flushRef.current = flush;

    // 전체를 다시 받는다. 겹쳐 부르면 마지막 요청의 결과만 쓴다. 대기 기록은 reducer가 덮어씌운다.
    const refetch = () => {
      const request = ++latest;
      fetchServerNotifications(client)
        .then((list) => {
          if (alive && request === latest) dispatch({ type: "server-loaded", list });
        })
        .catch((e: unknown) => {
          console.error("서버 알림 받기 실패", e instanceof Error ? e.message : e);
        });
    };

    // 연결되면 대기 기록을 먼저 쓰고 한 번 받는다. 구독이 SUBSCRIBED가 될 때마다(처음·다시 연결) 다시 받아 빠진 알림을 메운다.
    void flush().then(() => {
      if (alive) refetch();
    });
    const unsubscribe = subscribeServerNotifications(
      client,
      userId,
      (notification) => {
        if (alive) dispatch({ type: "server-upsert", notification });
      },
      refetch,
    );

    return () => {
      alive = false;
      flushRef.current = null;
      unsubscribe();
    };
  }, [active, serverSession, dispatch]);
}
