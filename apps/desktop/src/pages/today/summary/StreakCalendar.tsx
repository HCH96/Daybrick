import type { MonthLight } from "../../../features/today/stats";

/**
 * 스트릭 달력 (R30): 요일·월 이름 없이 1~말일 숫자를 7개씩.
 * 채운 날 주황 빛, 못 채운 날 꺼짐, 오늘 테두리, 아직 안 온 날 흐린 숫자.
 */
function StreakCalendar({ lights }: { lights: MonthLight[] }) {
  return (
    <div className="streak-cal" aria-hidden="true">
      <div className="streak-cal__grid">
        {lights.map((l) => (
          <span key={l.day} className={`streak-cal__day streak-cal__day--${dayKind(l)}${l.today ? " streak-cal__day--today" : ""}`}>
            {l.day}
          </span>
        ))}
      </div>
    </div>
  );
}

function dayKind(l: MonthLight): "on" | "off" | "later" {
  if (l.future) return "later";
  return l.lit ? "on" : "off";
}

export default StreakCalendar;
