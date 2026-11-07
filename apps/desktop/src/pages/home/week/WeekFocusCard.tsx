import type { CSSProperties } from "react";
import { weekFocus, weekTotal, type WeekFocusDay } from "../../../features/home/weekFocus";
import { formatDuration } from "../../../features/today/format";
import { useToday } from "../../../features/today/store";
import type { TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";
import { useTodayKey } from "../../../features/today/useTodayKey";
import CardState from "../CardState";
import { brickSegments, wallColumns } from "./bricks";
import "./WeekFocus.css";

const HOUR_MS = 3_600_000;

/**
 * 홈 "이번 주 집중" 카드 본문 (R38–R39). 홈의 "순간"인 벽돌 벽.
 * 한 줄이 하루(월~일), 벽돌 한 장 = 집중 1시간. 홀수 줄은 이음매를 반 칸 엇갈린다.
 * 오늘 줄만 강조색, 안 온 요일은 비우고, 하루 목표는 세로 점선.
 */
function WeekFocusCard() {
  const { state } = useToday();
  const todayKey = useTodayKey();

  if (state.kind === "loading") return <CardState kind="loading" />;
  if (state.kind === "error") return <CardState kind="error" message="집중 기록을 불러오지 못했어요" />;
  return <WeekWall data={state.data} todayKey={todayKey} />;
}

/** 타이머가 도는 동안 1분마다 다시 그리는 부분 (벽돌은 분 단위면 충분) */
function WeekWall({ data, todayKey }: { data: TodayData; todayKey: string }) {
  const now = useNow(data.running?.state === "running", 60_000);
  const days = weekFocus(data, todayKey, now);
  const goalHours = Math.max(1, data.settings.dailyGoalMinutes) / 60;
  const cols = wallColumns(goalHours, days.map((d) => d.ms / HOUR_MS));

  return (
    <div className="week-focus">
      <div className="week-focus__total">
        이번 주 <TotalText ms={weekTotal(days)} />
      </div>
      <div className="week-focus__wall" style={{ "--goal": goalHours / cols } as CSSProperties}>
        <div className="week-focus__goal" aria-hidden="true">
          <span>목표 {durationLabel(goalHours * HOUR_MS)}</span>
        </div>
        {days.map((day, i) => (
          <WeekRow key={day.dateKey} day={day} cols={cols} offset={i % 2 === 1} />
        ))}
      </div>
    </div>
  );
}

/** 하루 한 줄: 요일 글자 + 벽돌. 마우스를 올리면 줄 끝 위에 "11/5 (목) 4시간" */
function WeekRow({ day, cols, offset }: { day: WeekFocusDay; cols: number; offset: boolean }) {
  const hours = day.ms / HOUR_MS;
  const segments = day.state === "future" ? [] : brickSegments(hours, offset);
  const label = `${day.label} ${durationLabel(day.ms)}`;
  const endStyle = { "--end": hours / cols } as CSSProperties;

  return (
    <div className={`week-focus__row week-focus__row--${day.state}`} style={endStyle}>
      <span className="week-focus__day">{day.weekday}</span>
      <div className="week-focus__bricks" role="img" aria-label={day.state === "future" ? day.label : label}>
        {segments.map((size, i) => (
          <i key={i} className="week-focus__brick" style={{ width: `${(size / cols) * 100}%` }} />
        ))}
      </div>
      {day.state !== "future" && (
        <div className="week-focus__tip" role="tooltip">
          {day.label}
          <b>{durationLabel(day.ms)}</b>
        </div>
      )}
    </div>
  );
}

/** "18시간 40분"의 숫자만 크게 */
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
