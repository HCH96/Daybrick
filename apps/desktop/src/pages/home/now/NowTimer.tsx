import type { CSSProperties } from "react";
import { TimerDoneIcon, TimerPauseIcon, TimerResumeIcon, TimerStopIcon } from "../../../components/icons/TodayIcons";
import type { PlanData } from "../../../features/plan/types";
import { taskGroupInfo } from "../../../features/projects/group";
import { formatClock } from "../../../features/today/format";
import { dayTotal, sessionElapsed } from "../../../features/today/stats";
import { useToday } from "../../../features/today/store";
import type { RunningTimer, TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";

interface NowTimerProps {
  plan: PlanData;
  today: TodayData;
  running: RunningTimer;
  todayKey: string; // "YYYY-MM-DD"
}

/** 이번 세션 경과의 초 ":SS" (D15). 시·분은 투데이 formatClock("H:MM")을 그대로 쓴다. */
function formatSeconds(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000) % 60;
  return `:${String(seconds).padStart(2, "0")}`;
}

/**
 * 매초 바뀌는 부분만 여기서 다시 그린다: 가운데 시계 "H:MM:SS"(D15)와
 * 오늘 집중 막대·숫자(요약 줄과 같은 dayTotal·dailyGoalMinutes, D18). 막대는 100%에서 멈춘다.
 */
function LiveTimes({ today, running, todayKey }: Omit<NowTimerProps, "plan">) {
  const paused = running.state === "paused";
  const now = useNow(!paused);
  const elapsed = sessionElapsed(running, now);
  const total = dayTotal(today, todayKey, now);
  const goalMs = Math.max(1, today.settings.dailyGoalMinutes) * 60000;
  const ratio = Math.min(1, total / goalMs);

  return (
    <>
      <div className="now-timer__clock">
        {formatClock(elapsed)}
        <span className="now-timer__sec">{formatSeconds(elapsed)}</span>
      </div>
      <div className="now-timer__bar" aria-hidden="true">
        <i style={{ width: `${ratio * 100}%` }} />
      </div>
      <div className="now-timer__goal">
        <span>
          오늘 집중 <b>{formatClock(total)}</b>
        </span>
        <span>목표 {formatClock(today.settings.dailyGoalMinutes * 60000)}</span>
      </div>
    </>
  );
}

/**
 * 타이머가 있을 때 (R35, 목업 T1): 묶음 색 점·이름 + 상태 배지, 태스크 제목, 가운데 큰 시계,
 * 오늘 집중 막대, [일시정지/재개]·[완료]·[중단]. 실행 중에만 묶음 색(--tc)을 카드 위 띠·시계 바탕·초·막대에 쓴다 (D18).
 * 버튼은 투데이와 같은 저장소 동작을 부른다. 실행 중엔 [완료], 일시정지엔 [재개]를 강조한다. 트랙 그림은 없다.
 */
function NowTimer({ plan, today, running, todayKey }: NowTimerProps) {
  const { pause, resume, complete, stop } = useToday();
  const paused = running.state === "paused";
  const task = plan.tasks.find((t) => t.id === running.taskId);
  const info = task ? taskGroupInfo(plan, task) : undefined;
  const groupName = info ? (info.kind === "stage" ? info.projectName : info.name) : "미분류";
  const title = task ? task.title || "제목 없음" : "지금 도는 태스크";
  const color = info ? info.color : "var(--muted)";
  const style = { "--tc": color } as CSSProperties;

  return (
    <div className={paused ? "now-timer now-timer--paused" : "now-timer now-timer--run"} style={style}>
      <div className="now-timer__top">
        <span className="now-timer__group">
          <i className="now-dot" style={{ "--c": color } as CSSProperties} aria-hidden="true" />
          <span className="now-timer__group-name">{groupName}</span>
        </span>
        <span className={paused ? "now-badge now-badge--pause" : "now-badge now-badge--run"}>
          {paused ? "일시정지" : "진행 중"}
        </span>
      </div>
      <div className="now-timer__title" title={title}>
        {title}
      </div>
      <LiveTimes today={today} running={running} todayKey={todayKey} />
      <div className="now-acts">
        <button
          type="button"
          className={paused ? "now-btn now-btn--tall now-btn--primary" : "now-btn now-btn--tall"}
          onClick={paused ? resume : pause}
        >
          {paused ? <TimerResumeIcon /> : <TimerPauseIcon />}
          {paused ? "재개" : "일시정지"}
        </button>
        <button
          type="button"
          className={paused ? "now-btn now-btn--tall" : "now-btn now-btn--tall now-btn--primary"}
          onClick={complete}
        >
          <TimerDoneIcon />
          완료
        </button>
        <button type="button" className="now-btn now-btn--square" onClick={stop} title="중단" aria-label="중단">
          <TimerStopIcon />
        </button>
      </div>
    </div>
  );
}

export default NowTimer;
