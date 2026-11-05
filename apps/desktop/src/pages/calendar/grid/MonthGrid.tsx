import { useMemo, useState, type AnimationEvent } from "react";
import { getMonthGrid } from "../../../utils/calendarGrid";
import WeekRow from "./WeekRow";
import "./Grid.css";

/** 달을 넘긴 방향. next = 다음 달(왼쪽으로 밀림), prev = 이전 달(오른쪽으로 밀림) */
export type FlipDir = "next" | "prev";

const DOW = ["월", "화", "수", "목", "금", "토", "일"];

interface MonthGridProps {
  year: number;
  month: number; // 0부터 (0 = 1월)
  dir: FlipDir | null; // 마지막으로 넘긴 방향. null이면 처음 그린 것이라 움직이지 않는다
  todayKey: string;
}

/** 년·월을 하나의 수로 (비교·key용) */
function monthIndex(year: number, month: number): number {
  return year * 12 + month;
}

/**
 * 월 달력 (목업 cal-grid, R2·R4) + 달 넘김 (part-flip, R41).
 * 요일 머리줄은 고정이고, 주 줄 묶음(page)만 넘어간다. 넘길 때 앞 달 page를 잠깐 겹쳐 그려
 * 밀려나게 하고, 새 달 page는 key가 바뀌어 다시 그려지며 들어온다.
 * 애니메이션 중에 또 넘기면 밀려나던 page를 버리고 바로 새 달로 간다 (쌓이지 않음).
 */
function MonthGrid({ year, month, dir, todayKey }: MonthGridProps) {
  const current = monthIndex(year, month);
  const [shown, setShown] = useState(current);
  const [leaving, setLeaving] = useState<{ index: number; dir: FlipDir } | null>(null);

  // 그리는 중에 달이 바뀐 것을 알아채 밀려날 page를 정한다 (React의 "props에서 상태 끌어내기" 방식)
  if (shown !== current) {
    setLeaving(dir && leaving === null ? { index: shown, dir } : null);
    setShown(current);
  }

  const onLeaveEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setLeaving(null);
  };

  return (
    <div className="cal-grid">
      <div className="cal-dow">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="cal-pages">
        {leaving && (
          <MonthPage
            key={`out-${leaving.index}`}
            index={leaving.index}
            todayKey={todayKey}
            className={`cal-page cal-page--out-${leaving.dir}`}
            onAnimationEnd={onLeaveEnd}
          />
        )}
        <MonthPage
          key={current}
          index={current}
          todayKey={todayKey}
          className={dir ? `cal-page cal-page--in-${dir}` : "cal-page"}
        />
      </div>
    </div>
  );
}

interface MonthPageProps {
  index: number; // monthIndex
  todayKey: string;
  className: string;
  onAnimationEnd?: (e: AnimationEvent<HTMLDivElement>) => void;
}

/** 한 달의 주 줄 5~6개 묶음 */
function MonthPage({ index, todayKey, className, onAnimationEnd }: MonthPageProps) {
  const weeks = useMemo(() => getMonthGrid(Math.floor(index / 12), index % 12, 1), [index]);
  return (
    <div
      className={className}
      style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}
      onAnimationEnd={onAnimationEnd}
    >
      {weeks.map((week, w) => (
        <WeekRow key={week[0].key} week={week} todayKey={todayKey} isFirstWeek={w === 0} />
      ))}
    </div>
  );
}

export default MonthGrid;
