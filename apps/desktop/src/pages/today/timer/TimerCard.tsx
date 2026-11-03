import type { CSSProperties } from "react";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import { formatShortRange } from "../../../features/plan/format";
import type { Category, Task } from "../../../features/plan/types";
import { formatDuration } from "../../../features/today/format";
import { taskTotalOn } from "../../../features/today/stats";
import type { RunningTimer, TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";
import ElapsedClock from "./ElapsedClock";
import RunTrack from "./RunTrack";
import TimerButtons from "./TimerButtons";
import "./TimerCard.css";

interface TimerCardProps {
  data: TodayData;
  running: RunningTimer;
  /** 플랜에서 지워졌으면 null */
  task: Task | null;
  category: Category | null;
  todayKey: string;
}

/**
 * 도는 타이머 카드 (R16, R18, R40, R41): 카테고리 색 점·이름·기간 → 제목 → 큰 숫자 → 보조 문구, 아래 버튼 세 개.
 * 오른쪽은 하루 목표 달리기 트랙 (R42–R45), 색은 카테고리 색 `--c` (D7).
 */
function TimerCard({ data, running, task, category, todayKey }: TimerCardProps) {
  const paused = running.state === "paused";
  const style = { "--c": category?.color ?? NONE_CATEGORY_COLOR } as CSSProperties;
  const range = task?.start && task.end ? ` · ${formatShortRange(task.start, task.end)}` : "";

  return (
    <div className="timer-card" style={style}>
      <div className="timer-card__top">
        <div className="timer-card__info">
          <div className="timer-card__proj">
            <span className="timer-card__dot" />
            {category?.name ?? "미분류"}
            {range}
          </div>
          <div className="timer-card__title">{task ? task.title || "제목 없음" : "지워진 태스크"}</div>
          <div className={paused ? "timer-card__time timer-card__time--paused" : "timer-card__time"}>
            <ElapsedClock running={running} />
          </div>
          <TimerSubText data={data} running={running} todayKey={todayKey} />
        </div>
        <div className="timer-card__side">
          <RunTrack data={data} todayKey={todayKey} running={running} />
        </div>
      </div>
      <TimerButtons paused={paused} />
    </div>
  );
}

/** 오늘 이 태스크 누적 (지금 세션 포함, R41). 달리는 중에만 1초마다 다시 계산한다. */
function TimerSubText({ data, running, todayKey }: { data: TodayData; running: RunningTimer; todayKey: string }) {
  const now = useNow(running.state === "running");
  const total = taskTotalOn(data, running.taskId, todayKey, now);
  let text: string;
  if (total < 60000) text = "막 출발했어요";
  else text = `${formatDuration(total)} ${running.state === "paused" ? "달리고 쉬는 중" : "달리는 중"}`;
  return <div className="timer-card__sub">{text}</div>;
}

export default TimerCard;
