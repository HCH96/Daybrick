import { useEffect, useState } from "react";
import { loadJobSearchLocal, markRecommendOpened } from "../../../features/job-search/localState";

/** 이번 실행에서 마지막으로 탭을 떠난 시각 (파일 저장이 끝나기 전에 다시 와도 맞게 보이도록) */
let cachedOpenedAt: string | null | undefined;
/** 개발 모드 StrictMode의 "붙였다 떼었다 다시 붙이기"에서 떠난 시각이 저장되지 않게 미뤄 둔 저장 */
let pendingLeave: number | undefined;

/**
 * 추천 공고 탭을 마지막으로 떠난 시각 (R8, D21).
 * 탭에 있는 동안은 처음 읽은 값을 그대로 써서 "새" 표시가 유지되고, 탭을 떠날 때(컴포넌트가 사라질 때) 지금 시각을 저장한다.
 * 읽는 중이거나 한 번도 연 적 없으면 null.
 */
export function useOpenedAt(): string | null {
  const [openedAt, setOpenedAt] = useState<string | null>(cachedOpenedAt ?? null);

  useEffect(() => {
    if (pendingLeave !== undefined) {
      window.clearTimeout(pendingLeave);
      pendingLeave = undefined;
    }
    let alive = true;
    if (cachedOpenedAt === undefined) {
      loadJobSearchLocal()
        .then((local) => {
          cachedOpenedAt = local.recommendOpenedAt;
          if (alive) setOpenedAt(local.recommendOpenedAt);
        })
        .catch(() => {
          // 파일이 깨졌으면 "새" 표시만 빠진다. 저장도 하지 않는다 (markRecommendOpened가 다시 읽다 실패)
        });
    }
    return () => {
      alive = false;
      pendingLeave = window.setTimeout(() => {
        pendingLeave = undefined;
        const now = new Date().toISOString();
        cachedOpenedAt = now;
        markRecommendOpened(now).catch(() => {
          // 저장하지 못하면 다음 실행에서 "새" 표시가 남을 뿐이다
        });
      }, 0);
    };
  }, []);

  return openedAt;
}
