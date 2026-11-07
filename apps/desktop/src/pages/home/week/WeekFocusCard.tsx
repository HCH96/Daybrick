import type { CSSProperties } from "react";
import { weekFocus, weekTotal, type WeekFocusDay } from "../../../features/home/weekFocus";
import { formatDuration } from "../../../features/today/format";
import { useToday } from "../../../features/today/store";
import type { TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";
import { useTodayKey } from "../../../features/today/useTodayKey";
import CardState from "../CardState";
import "./WeekFocus.css";

/**
 * 홈 "이번 주 집중" 카드 본문 (R38–R39, 목업 dash.html dash-week).
 * 위쪽에 이번 주 합계, 아래에 월~일 막대와 하루 목표 점선. 오늘 막대만 강조색, 안 온 요일은 납작한 회색.
 */
function WeekFocusCard() {
  const { state } = useToday();
  const todayKey = useTodayKey();

  if (state.kind === "loading") return <CardState kind="loading" />;
  if (state.kind === "error") return <CardState kind="error" message="집중 기록을 불러오지 못했어요" />;
  return <WeekBars data={state.data} todayKey={todayKey} />;
}

/** 타이머가 도는 동안 1분마다 다시 그리는 부분 (막대는 분 단위면 충분) */
function WeekBars({ data, todayKey }: { data: TodayData; todayKey: string }) {
  const now = useNow(data.running?.state === "running", 60_000);
  const days = weekFocus(data, todayKey, now);
  const goalMs = Math.max(1, data.settings.dailyGoalMinutes) * 60000;
  const scale = Math.max(goalMs, ...days.map((d) => d.ms));
  const goalRatio = goalMs / scale;

  return (
    <div className="week-focus">
      <div className="week-focus__total">
        이번 주 <TotalText ms={weekTotal(days)} />
      </div>
      <div className="week-focus__chart">
        <div className="week-focus__goal" style={{ "--ratio": goalRatio } as CSSProperties}>
          <span>목표 {durationLabel(goalMs)}</span>
        </div>
        {days.map((day) => (
          <WeekCol key={day.dateKey} day={day} ratio={day.ms / scale} />
        ))}
      </div>
    </div>
  );
}

function WeekCol({ day, ratio }: { day: WeekFocusDay; ratio: number }) {
  const height = `${(ratio * 100).toFixed(1)}%`;
  return (
    <div className={`week-focus__col week-focus__col--${day.state}`}>
      {day.state !== "future" && (
        <div className="week-focus__tip" style={{ bottom: `calc(${height} + 8px)` }} role="tooltip">
          {day.label}
          <b>{durationLabel(day.ms)}</b>
        </div>
      )}
      {day.state === "future" ? (
        <i className="week-focus__bar week-focus__bar--empty" />
      ) : (
        <i
          className="week-focus__bar"
          style={{ height }}
          aria-label={`${day.label} ${durationLabel(day.ms)}`}
        />
      )}
      <span>{day.weekday}</span>
    </div>
  );
}

/** "18시간 40분"의 숫자만 굵게 (목업 wk-total) */
function TotalText({ ms }: { ms: number }) {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes < 60) return <><b>{minutes}</b>분</>;
  return (
    <>
      <b>{Math.floor(minutes / 60)}</b>시간 <b>{minutes % 60}</b>분
    </>
  );
}

/** 목표선·말풍선 글자: 딱 떨어지는 시간은 "6시간", 아니면 투데이와 같은 "1시간 30분"·"40분" */
function durationLabel(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}시간`;
  return formatDuration(ms);
}

export default WeekFocusCard;
