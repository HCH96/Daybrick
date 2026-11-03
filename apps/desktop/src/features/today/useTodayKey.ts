import { useEffect, useState } from "react";
import { toDateKey } from "../../utils/date";

/** now부터 다음 자정(현지 시간 0시)까지 남은 밀리초 */
export function msUntilMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/**
 * 오늘 날짜 "YYYY-MM-DD" (PC 시계 기준, R4).
 * 다음 자정에 맞춰 다시 계산하고, 창이 다시 보이거나 포커스를 얻을 때도 확인한다
 * (절전에서 깨어나면 setTimeout이 늦게 불릴 수 있어서).
 */
export function useTodayKey(): string {
  const [key, setKey] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    const refresh = () => setKey(toDateKey(new Date()));
    // 자정을 막 넘긴 뒤 부르도록 조금 여유를 둔다
    const timer = window.setTimeout(refresh, msUntilMidnight(new Date()) + 50);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // key가 바뀌면 다음 자정 타이머를 다시 건다
  }, [key]);

  return key;
}
