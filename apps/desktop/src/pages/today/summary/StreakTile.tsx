import { useState } from "react";
import { FlameIcon } from "../../../components/icons/TodayIcons";
import { monthLights, streak } from "../../../features/today/stats";
import StreakCalendar from "./StreakCalendar";

interface StreakTileProps {
  /** 날짜별 기록 합(밀리초) */
  totals: Map<string, number>;
  todayKey: string;
  goalMinutes: number;
}

/**
 * 스트릭 타일 (R30): "🔥 N일" 숫자만. 마우스를 올린(또는 키보드로 포커스한) 동안만 아래에 이번 달 달력을 띄운다.
 * 오늘 아직 목표에 못 미쳤으면 어제까지 이어진 수를 보인다.
 */
function StreakTile({ totals, todayKey, goalMinutes }: StreakTileProps) {
  const [open, setOpen] = useState(false);
  const days = streak(totals, todayKey, goalMinutes);

  return (
    <div
      className={`today-summary__tile today-summary__streak${open ? " today-summary__streak--open" : ""}`}
      tabIndex={0}
      aria-label={`스트릭 ${days}일, 목표를 채운 날이 이어진 수`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <div className="today-summary__tile-key">
        <span className="today-summary__flame">
          <FlameIcon />
        </span>
        스트릭
      </div>
      <div className="today-summary__tile-value">
        {days}
        <small>일</small>
      </div>
      {open && <StreakCalendar lights={monthLights(totals, todayKey, goalMinutes)} />}
    </div>
  );
}

export default StreakTile;
