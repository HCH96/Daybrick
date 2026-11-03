import type { CSSProperties } from "react";
import { formatDuration } from "../../../features/today/format";
import { dayTotal } from "../../../features/today/stats";
import type { TodayData } from "../../../features/today/types";
import RunTrack from "./RunTrack";
import "./TimerCard.css";

/**
 * 빈 상태 카드 (R21, R46): 도는 타이머가 없을 때. 버튼 대신 안내 한 줄.
 * 오른쪽 트랙에는 캐릭터가 오늘 진행 위치에 서 있다 (색은 앱 강조색, D7).
 */
function TimerEmpty({ data, todayKey }: { data: TodayData; todayKey: string }) {
  const total = dayTotal(data, todayKey, Date.now());
  const sub = total < 60000 ? "오늘 아직 출발 전이에요" : `오늘 ${formatDuration(total)} 달렸어요`;
  const style = { "--c": "var(--accent)" } as CSSProperties;

  return (
    <div className="timer-card" style={style}>
      <div className="timer-card__top">
        <div className="timer-card__info">
          <div className="timer-card__proj">돌고 있는 타이머 없음</div>
          <div className="timer-card__title">칸반 카드에서 시작하세요</div>
          <div className="timer-card__sub">{sub}</div>
        </div>
        <div className="timer-card__side">
          <RunTrack data={data} todayKey={todayKey} running={null} />
        </div>
      </div>
      <div className="timer-card__guide">시작 전·진행 중 카드의 ▶ 버튼을 누르면 여기서 시간이 흘러요.</div>
    </div>
  );
}

export default TimerEmpty;
