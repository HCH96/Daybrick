import { useEffect, useState } from "react";
import { countPendingSuggestions } from "../../../features/job-search/mailApi";
import type { ServerSession } from "../../../features/server/session";

/**
 * 메일 제안 탭 칩의 대기 중 제안 수. 화면이 열릴 때 한 번 읽고,
 * 메일 제안 탭이 목록을 다시 읽을 때마다 `setCount`로 고친다. 읽지 못하면 0(칩 숨김).
 */
export function useMailCount(session: ServerSession | null): [number, (count: number) => void] {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!session) return;
    let alive = true;
    void countPendingSuggestions(session).then((result) => {
      if (!alive) return;
      if (result.ok) setCount(result.value);
      else console.error("대기 중 메일 제안 수를 읽지 못함", result.error);
    });
    return () => {
      alive = false;
    };
  }, [session]);
  return [count, setCount];
}
