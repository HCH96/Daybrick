import { useEffect, useState } from "react";
import { loadRecommend, type RecommendPosting } from "../../../features/job-search/recommendApi";
import type { ServerSession } from "../../../features/server/session";
import { useServer } from "../../../features/server/useServer";
import { readOpenedAt } from "../../job-search/recommend/useOpenedAt";

export type HomeRecommendState =
  | { kind: "loading" }
  /** 서버 연결이 없거나 로그인이 안 됨 (서버 업데이트 필요 등으로 막힌 때도 같다) */
  | { kind: "off" }
  | { kind: "error" }
  | { kind: "ready"; postings: RecommendPosting[]; lastCollectAt: string | null; openedAt: string | null };

type Loaded = Extract<HomeRecommendState, { kind: "error" } | { kind: "ready" }>;

/**
 * 홈 "새 추천 공고"가 쓸 추천 공고와 new 기준 시각 (R43, D9, D10).
 * 서버에 연결·로그인돼 있으면 홈에 들어올 때(카드가 붙을 때) 한 번 읽고, 머무는 동안은 다시 읽지 않는다.
 * 세션이 바뀌거나 끊겼다 다시 이어지면 다시 읽는다. 기준 시각은 읽기만 한다 (R47).
 */
export function useHomeRecommend(): HomeRecommendState {
  const { config, sessionReady, serverSession, status } = useServer();
  // 구직 관리 화면과 같은 연결 조건 (JobSearchPage)
  const session = serverSession !== null && status === "connected" ? serverSession : null;
  const [loaded, setLoaded] = useState<{ session: ServerSession; value: Loaded } | null>(null);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    Promise.all([loadRecommend(session), readOpenedAt()])
      .then(([result, openedAt]) => {
        if (!alive) return;
        const value: Loaded = result.ok
          ? { kind: "ready", postings: result.value.postings, lastCollectAt: result.value.lastCollectAt, openedAt }
          : { kind: "error" };
        setLoaded({ session, value });
      })
      .catch(() => {
        if (alive) setLoaded({ session, value: { kind: "error" } });
      });
    return () => {
      alive = false;
    };
  }, [session]);

  if (config === null || !sessionReady) return { kind: "loading" };
  if (!session) return { kind: "off" };
  if (!loaded || loaded.session !== session) return { kind: "loading" };
  return loaded.value;
}
