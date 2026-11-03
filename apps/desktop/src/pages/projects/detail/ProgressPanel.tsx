import { fireByLastDay, formatLastWork } from "../../../features/projects/campfire";
import { currentStage, isProjectDone, stageTasks } from "../../../features/projects/progress";
import type { ProjectTime } from "../../../features/projects/useProjectClock";
import { weekRange } from "../../../features/projects/weeks";
import type { Project, Task } from "../../../features/plan/types";
import { formatDateRange, formatDuration } from "../../../features/today/format";
import Campfire from "../common/Campfire";
import FlagTrack from "../common/FlagTrack";
import GoalCelebration, { useGoalCelebration } from "./GoalCelebration";

interface ProgressPanelProps {
  project: Project;
  tasks: Task[];
  time: ProjectTime;
  todayKey: string;
  /** 이 프로젝트 태스크로 타이머가 실제로 도는 중 (일시정지 아님) */
  running: boolean;
}

/**
 * 진행 상황 판 (프로젝트 R21–R28, 목업 detail-progress·weekly-progress).
 * 왼쪽: 한 줄 요약 + 깃발 트랙(골인하면 결승 깃발 펄럭 + 색종이 + "골인!", R25). 오른쪽 250px: 큰 모닥불 + 마지막 작업 / 누적 투입 시간(숫자만) / 타이머 진행 중.
 */
function ProgressPanel({ project, tasks, time, todayKey, running }: ProgressPanelProps) {
  const current = currentStage(project, tasks, todayKey);
  const celebrating = useGoalCelebration(project, isProjectDone(project, tasks));

  return (
    <section className="proj-progress" aria-label="진행 상황">
      <div className={celebrating ? "proj-progress__track proj-progress__track--goal" : "proj-progress__track"}>
        <TrackCaption project={project} tasks={tasks} todayKey={todayKey} current={current} />
        <FlagTrack project={project} tasks={tasks} currentIndex={current} />
        {celebrating && <GoalCelebration />}
      </div>
      <div className="proj-progress__stats">
        <div className="proj-progress__fire">
          <Campfire fire={fireByLastDay(time.lastDay, todayKey)} size={60} />
          <div className="proj-stat">
            <small>마지막 작업</small>
            <b>{formatLastWork(time.lastDay, todayKey)}</b>
          </div>
        </div>
        <div className="proj-stat">
          <small>누적 투입 시간</small>
          <b>{formatDuration(time.total)}</b>
          {running && <div className="proj-stat__live">타이머 진행 중</div>}
        </div>
      </div>
    </section>
  );
}

interface TrackCaptionProps {
  project: Project;
  tasks: Task[];
  todayKey: string;
  current: number | null;
}

/**
 * 트랙 위 한 줄. 단계형 `<현재 단계> 진행 중 · 전체 태스크 N/M 완료`,
 * 주차형 `<N주차> 이번 주 11/2–11/8 · 전체 태스크 N/M 완료 · 3주차 1개 남음`(지난 주차에 남은 태스크가 있을 때).
 */
function TrackCaption({ project, tasks, todayKey, current }: TrackCaptionProps) {
  const lists = project.stages.map((s) => stageTasks(tasks, s.id));
  const total = lists.reduce((n, list) => n + list.length, 0);
  const done = lists.reduce((n, list) => n + list.filter((t) => t.status === "done").length, 0);
  const summary = `전체 태스크 ${done}/${total} 완료`;

  if (current === null) return <div className="proj-progress__cap">{summary}</div>;
  if (isProjectDone(project, tasks)) {
    return (
      <div className="proj-progress__cap">
        <b>모든 단계 완료</b> {summary}
      </div>
    );
  }

  if (project.kind !== "weekly") {
    return (
      <div className="proj-progress__cap">
        <b>{project.stages[current].name}</b> 진행 중 · {summary}
      </div>
    );
  }

  const range = weekRange(project, current);
  const inWeek = range !== null && range.start <= todayKey && todayKey <= range.end;
  const rangeText = range ? formatDateRange(range.start, range.end).replace(" – ", "–") : "";
  return (
    <div className="proj-progress__cap">
      <b>{project.stages[current].name || `${current + 1}주차`}</b>
      {range && ` ${inWeek ? "이번 주 " : ""}${rangeText} ·`} {summary}
      {leftoverText(project, lists, current)}
    </div>
  );
}

/** 현재 주차보다 앞 주차에 남은(완료 안 된) 태스크: 한 주차면 ` · 3주차 1개 남음`, 여러 주차면 ` · 지난 주차 N개 남음` */
function leftoverText(project: Project, lists: Task[][], current: number): string {
  const left = lists
    .slice(0, current)
    .map((list, i) => ({ i, n: list.filter((t) => t.status !== "done").length }))
    .filter((w) => w.n > 0);
  if (left.length === 0) return "";
  if (left.length === 1) {
    const { i, n } = left[0];
    return ` · ${project.stages[i].name || `${i + 1}주차`} ${n}개 남음`;
  }
  return ` · 지난 주차 ${left.reduce((sum, w) => sum + w.n, 0)}개 남음`;
}

export default ProgressPanel;
