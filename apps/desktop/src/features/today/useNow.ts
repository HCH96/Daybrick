import { useEffect, useState } from "react";

/**
 * 지금 시각(밀리초). active일 때만 1초마다 다시 그린다.
 * 시계 글자를 그리는 작은 컴포넌트 안에서만 써서, 화면 전체가 매초 다시 그려지지 않게 한다.
 */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  return now;
}
