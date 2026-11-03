import { useEffect, useRef } from "react";

const HEARTBEAT_MS = 60_000;

/**
 * 타이머가 있는 동안 1분마다 onTick을 부른다 (R25). 부르는 쪽이 lastSeenAt을 지금으로 적고,
 * 자동 저장이 파일에 쓴다. 강제 종료·PC 꺼짐 뒤 다음 실행 때 이 시각까지 기록한다.
 */
export function useHeartbeat(active: boolean, onTick: () => void): void {
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => tickRef.current(), HEARTBEAT_MS);
    return () => window.clearInterval(id);
  }, [active]);
}
