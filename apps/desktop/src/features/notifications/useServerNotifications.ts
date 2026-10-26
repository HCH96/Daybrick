import { useEffect, type Dispatch } from "react";
import { useServer } from "../server/useServer";
import type { NotificationsAction } from "./reducer";
import { fetchServerNotifications, subscribeServerNotifications } from "./serverSync";

/**
 * 서버가 "연결됨"이고 로그인 세션이 있을 때만 서버 알림을 받고 실시간으로 구독한다 (R30–R32, D12).
 * 받은 목록은 서버 사본(serverCopy)에 넣어 파일에 저장되므로, 연결이 끊겨도 마지막 목록을 계속 보여준다 (R34).
 * 서버 상태 문제는 알림을 만들지 않는다. 기존 안내 띠(ServerBanner)가 맡는다 (R35, D7).
 * NotificationsProvider 안에서 파일을 다 읽은 뒤(ready)에 동작한다.
 */
export function useServerNotifications(ready: boolean, dispatch: Dispatch<NotificationsAction>): void {
  const { serverSession, status } = useServer();
  const active = ready && serverSession !== null && status === "connected";

  useEffect(() => {
    if (!active || !serverSession) return;
    const { client, userId } = serverSession;
    let alive = true;
    let latest = 0;

    // 전체를 다시 받는다. 겹쳐 부르면 마지막 요청의 결과만 쓴다.
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

    // 켤 때 한 번 받고, 구독이 SUBSCRIBED가 될 때마다(처음·다시 연결) 다시 받아 빠진 알림을 메운다.
    refetch();
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
      unsubscribe();
    };
  }, [active, serverSession, dispatch]);
}
