import { useEffect, useState } from "react";

/**
 * 지금 시각(밀리초). active일 때만 intervalMs(기본 1초)마다 다시 그린다.
 * 시계 글자를 그리는 작은 컴포넌트 안에서만 써서, 화면 전체가 매초 다시 그려지지 않게 한다.
 * 오늘 요약(타임라인·집중 시간)은 1분 간격으로 쓴다.
 */
export function useNow(active: boolean, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [active, intervalMs]);

  return now;
}
