/** 주차형 프로젝트의 체크포인트 깃발 (R15–R16, D4). 단계형 프로젝트는 캘린더에 나오지 않는다. */
import { isStageDone } from "../projects/progress";
import { stageLabel, weekRange } from "../projects/weeks";
import type { PlanData } from "../plan/types";

export interface Checkpoint {
  projectId: string;
  stageId: string;
  label: string; // "프로젝트명 · 3주차 · 이름"
  color: string; // 프로젝트 색 "#RRGGBB"
  date: string; // 그 주차의 일요일 "YYYY-MM-DD"
  done: boolean; // 끝난 주차 (태스크가 있고 모두 완료, 프로젝트 R16)
}

/** 모든 주차형 프로젝트의 주차마다 그 주 일요일에 깃발 하나 */
export function buildCheckpoints(data: PlanData): Checkpoint[] {
  const result: Checkpoint[] = [];
  for (const project of data.projects) {
    if (project.kind !== "weekly") continue;
    project.stages.forEach((stage, i) => {
      const range = weekRange(project, i);
      if (!range) return;
      result.push({
        projectId: project.id,
        stageId: stage.id,
        label: `${project.name} · ${stageLabel(project, i)}`,
        color: project.color,
        date: range.end,
        done: isStageDone(data.tasks, stage.id),
      });
    });
  }
  return result;
}
