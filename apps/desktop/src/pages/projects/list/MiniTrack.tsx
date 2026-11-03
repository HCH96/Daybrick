import type { CSSProperties } from "react";
import { isStageDone, runnerPosition } from "../../../features/projects/progress";
import type { Project, Task } from "../../../features/plan/types";
import { FinishArt, RunnerArt } from "../common/ProjectIcons";

interface MiniTrackProps {
  project: Project;
  tasks: Task[];
  /** 완료된 프로젝트면 캐릭터를 결승선에 둔다 (프로젝트 R6) */
  finished?: boolean;
}

/**
 * 카드의 작은 진행 트랙 (프로젝트 R3, 목업 .track.mini).
 * 단계 시작점마다 같은 간격으로 점(끝난 단계는 프로젝트 색), 지나온 길, 캐릭터, 끝에 체크무늬 깃발.
 */
function MiniTrack({ project, tasks, finished = false }: MiniTrackProps) {
  const count = project.stages.length;
  const position = finished ? count : runnerPosition(project, tasks);
  const ratio = count > 0 ? Math.min(1, position / count) : 0;
  const style = { "--p": ratio } as CSSProperties;

  return (
    <div className="proj-mini" style={style} aria-hidden="true">
      <div className="proj-mini__rail">
        <i />
      </div>
      {project.stages.map((stage, i) => (
        <span
          key={stage.id}
          className={isStageDone(tasks, stage.id) ? "proj-mini__pin proj-mini__pin--done" : "proj-mini__pin"}
          style={{ left: `${(i / count) * 100}%` }}
        />
      ))}
      <span className="proj-mini__finish">
        <FinishArt />
      </span>
      <span className="proj-mini__runner">
        <RunnerArt />
      </span>
    </div>
  );
}

export default MiniTrack;
