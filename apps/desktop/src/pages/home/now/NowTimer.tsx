import type { CSSProperties } from "react";
import { TimerDoneIcon, TimerPauseIcon, TimerResumeIcon, TimerStopIcon } from "../../../components/icons/TodayIcons";
import type { PlanData } from "../../../features/plan/types";
import { taskGroupInfo } from "../../../features/projects/group";
import { formatClock } from "../../../features/today/format";
import { sessionElapsed, taskTotalOn } from "../../../features/today/stats";
import { useToday } from "../../../features/today/store";
import type { RunningTimer, TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";

interface NowTimerProps {
  plan: PlanData;
  today: TodayData;
  running: RunningTimer;
  todayKey: string; // "YYYY-MM-DD"
}

/**
 * 이번 세션 경과 "H:MM:SS" (R35 "1초마다 갱신", 목업 0:42:15). 투데이 formatClock("H:MM")에 초를 붙인 것이라
 * 시·분은 투데이 타이머와 같다.
 */
function formatClockSeconds(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000) % 60;
  return `${formatClock(ms)}:${String(seconds).padStart(2, "0")}`;
}

/** 매초 바뀌는 글자(묶음 · 오늘 이 태스크 합계, 이번 세션 경과)만 여기서 다시 그린다 */
function LiveTimes({ today, running, todayKey, groupName }: Omit<NowTimerProps, "plan"> & { groupName: string }) {
  const paused = running.state === "paused";
  const now = useNow(!paused);
  return (
    <>
      <div className="now-timer__sub">
        {groupName} · 오늘 이 태스크 {formatClock(taskTotalOn(today, running.taskId, todayKey, now))}
      </div>
      <div className="now-timer__row">
        <span className={paused ? "now-timer__clock now-timer__clock--paused" : "now-timer__clock"}>
          {formatClockSeconds(sessionElapsed(running, now))}
        </span>
        <span className={paused ? "now-badge now-badge--pause" : "now-badge now-badge--run"}>
          {paused ? "일시정지" : "진행 중"}
        </span>
      </div>
    </>
  );
}

/**
 * 타이머가 있을 때 (R35): 태스크 제목·묶음 색, 이번 세션 경과, 상태 배지, [일시정지/재개]·[완료]·[중단].
 * 버튼은 투데이와 같은 저장소 동작을 부른다. 실행 중엔 [완료], 일시정지엔 [재개]를 강조한다. 트랙 그림은 없다.
 */
function NowTimer({ plan, today, running, todayKey }: NowTimerProps) {
  const { pause, resume, complete, stop } = useToday();
  const paused = running.state === "paused";
  const task = plan.tasks.find((t) => t.id === running.taskId);
  const info = task ? taskGroupInfo(plan, task) : undefined;
  const groupName = info ? (info.kind === "stage" ? info.projectName : info.name) : "미분류";
  const title = task ? task.title || "제목 없음" : "지금 도는 태스크";
  const dotStyle = info ? ({ "--c": info.color } as CSSProperties) : undefined;

  return (
    <div className="now-timer">
      <div className="now-timer__task" title={title}>
        <i className="now-dot" style={dotStyle} aria-hidden="true" />
        <span className="now-timer__title">{title}</span>
      </div>
      <LiveTimes today={today} running={running} todayKey={todayKey} groupName={groupName} />
      <div className="now-acts">
        <button
          type="button"
          className={paused ? "now-btn now-btn--primary" : "now-btn"}
          onClick={paused ? resume : pause}
        >
          {paused ? <TimerResumeIcon /> : <TimerPauseIcon />}
          {paused ? "재개" : "일시정지"}
        </button>
        <button type="button" className={paused ? "now-btn" : "now-btn now-btn--primary"} onClick={complete}>
          <TimerDoneIcon />
          완료
        </button>
        <button type="button" className="now-btn now-btn--quiet" onClick={stop}>
          <TimerStopIcon />
          중단
        </button>
      </div>
    </div>
  );
}

export default NowTimer;
