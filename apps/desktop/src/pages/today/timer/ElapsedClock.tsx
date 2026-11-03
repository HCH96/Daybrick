import { formatClock } from "../../../features/today/format";
import { sessionElapsed } from "../../../features/today/stats";
import type { RunningTimer } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";

/**
 * 이번 세션에 흐른 시간 "H:MM" (R40·R48). 달리는 중에만 1초마다 다시 계산한다.
 * 콜론은 따로 감싸서 부르는 쪽 CSS가 콜론만 깜빡이게 한다 (`.elapsed-clock__colon`).
 * 크기·색은 부르는 쪽(타이머 카드 큰 숫자, 칸반 카드 작은 글자)이 정한다.
 */
function ElapsedClock({ running }: { running: RunningTimer }) {
  const now = useNow(running.state === "running");
  const [hours, minutes] = formatClock(sessionElapsed(running, now)).split(":");
  return (
    <span className="elapsed-clock">
      {hours}
      <span className="elapsed-clock__colon">:</span>
      {minutes}
    </span>
  );
}

export default ElapsedClock;
