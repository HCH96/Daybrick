import { useEffect, useRef, useState, type CSSProperties } from "react";
import { isStageDone, runnerPosition } from "../../../features/projects/progress";
import { weekRange } from "../../../features/projects/weeks";
import type { Project, Task } from "../../../features/plan/types";
import { FinishArt, FlagDoneArt, FlagTodoArt, RunnerArt } from "./ProjectIcons";

interface FlagTrackProps {
  project: Project;
  tasks: Task[];
  /** 현재 단계 자리 (이름표를 프로젝트 색으로), 없으면 null */
  currentIndex: number | null;
}

/** "YYYY-MM-DD" → "M/D" */
function shortDay(key: string): string {
  const [, m, d] = key.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/**
 * 상세 진행 트랙 (프로젝트 R22–R24, 목업 detail-progress의 .track).
 * 단계 시작점마다 같은 간격으로 깃발(끝난 단계는 프로젝트 색 + 체크, 나머지 회색), 끝에 결승 깃발.
 * 캐릭터 위치 = runnerPosition / 단계 수. 위치가 바뀌면 이전 자리에서 달려간다 (도착하면 멈춤).
 */
function FlagTrack({ project, tasks, currentIndex }: FlagTrackProps) {
  const count = project.stages.length;
  const ratio = count > 0 ? Math.min(1, runnerPosition(project, tasks) / count) : 0;
  const { direction, onArrive } = useRunState(ratio);

  const runnerClasses = ["proj-track__runner"];
  if (direction !== "idle") runnerClasses.push("proj-track__runner--running");
  if (direction === "back") runnerClasses.push("proj-track__runner--back");

  return (
    <div className="proj-track" style={{ "--p": ratio } as CSSProperties}>
      <div className="proj-track__rail">
        <i />
      </div>
      {project.stages.map((stage, i) => {
        const done = isStageDone(tasks, stage.id);
        const range = weekRange(project, i);
        const name = project.kind === "weekly" ? stage.name || `${i + 1}주차` : stage.name;
        const classes = ["proj-flag"];
        if (done) classes.push("proj-flag--done");
        if (i === currentIndex) classes.push("proj-flag--now");
        return (
          <span key={stage.id} className={classes.join(" ")} style={{ left: `${(i / count) * 100}%` }}>
            {done ? <FlagDoneArt /> : <FlagTodoArt />}
            <span className="proj-flag__name" title={name}>
              {name}
              {range && <small>{shortDay(range.start)}</small>}
            </span>
          </span>
        );
      })}
      <span className="proj-track__finish" aria-hidden="true">
        <FinishArt />
      </span>
      <span
        className={runnerClasses.join(" ")}
        aria-hidden="true"
        onTransitionEnd={(e) => {
          if (e.propertyName === "left") onArrive();
        }}
      >
        <RunnerArt />
      </span>
    </div>
  );
}

type RunDirection = "idle" | "forward" | "back";

/** CSS 달려가기 전환(0.9초)보다 조금 길게 */
const RUN_FALLBACK_MS = 1200;

/**
 * 캐릭터 달리기 상태. 위치가 바뀐 순간 앞(또는 뒤)으로 달리기 시작하고, CSS 전환이 끝나면 멈춘다.
 * 처음 그릴 때는 달리지 않는다. 전환 끝 알림이 오지 않아도(창이 가려진 때 등) 잠시 뒤 멈춘다.
 */
function useRunState(ratio: number): { direction: RunDirection; onArrive: () => void } {
  const previous = useRef(ratio);
  const [direction, setDirection] = useState<RunDirection>("idle");

  useEffect(() => {
    if (previous.current === ratio) return;
    setDirection(ratio > previous.current ? "forward" : "back");
    previous.current = ratio;
    const stop = window.setTimeout(() => setDirection("idle"), RUN_FALLBACK_MS);
    return () => window.clearTimeout(stop);
  }, [ratio]);

  return { direction, onArrive: () => setDirection("idle") };
}

export default FlagTrack;
