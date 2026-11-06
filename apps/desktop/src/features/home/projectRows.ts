/**
 * 홈 "프로젝트 진행" 카드 줄 계산 (순수 함수, R40–R41).
 * 프로젝트 기능의 계산(현재 자리·캐릭터 위치·누적 시간)을 그대로 써서 프로젝트 화면과 값이 같다 (D11).
 */
import type { PlanData, Project } from "../plan/types";
import { activeProjects, currentStage, runnerPosition } from "../projects/progress";
import { projectSlices, projectTotal } from "../projects/time";
import type { TodayData } from "../today/types";

export interface ProjectRowView {
  id: string;
  name: string;
  color: string; // 프로젝트 색 "#RRGGBB"
  /** 현재 자리: 주차형 "3주차 / 8", 단계형 "2단계 · 단계 이름", 단계가 없으면 "단계 없음" */
  position: string;
  /** 진행 막대 비율 0~1 = 캐릭터 위치 / 단계 수 (프로젝트 R23) */
  progress: number;
  /** 누적 시간(밀리초, 실행 중 타이머는 now까지 포함) */
  totalMs: number;
}

/** 현재 자리 글자 */
function positionLabel(project: Project, index: number | null): string {
  if (index === null) return "단계 없음";
  if (project.kind === "weekly") return `${index + 1}주차 / ${project.stages.length}`;
  const name = project.stages[index]?.name ?? "";
  return name ? `${index + 1}단계 · ${name}` : `${index + 1}단계`;
}

/** 진행 중 프로젝트(프로젝트 화면 순서) 전부의 줄. 카드가 앞의 4개만 그리고 나머지는 "외 N개"로 쓴다. */
export function projectRows(plan: PlanData, today: TodayData, todayKey: string, now: number): ProjectRowView[] {
  const slices = projectSlices(plan, today, now);
  return activeProjects(plan).map((project) => {
    const stageCount = project.stages.length;
    const progress = stageCount > 0 ? runnerPosition(project, plan.tasks) / stageCount : 0;
    return {
      id: project.id,
      name: project.name,
      color: project.color,
      position: positionLabel(project, currentStage(project, plan.tasks, todayKey)),
      progress: Math.max(0, Math.min(1, progress)),
      totalMs: projectTotal(slices.get(project.id)),
    };
  });
}
