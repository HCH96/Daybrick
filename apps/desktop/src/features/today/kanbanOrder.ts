import type { PlanData, Task } from "../plan/types";
import { findStage } from "../projects/group";

/**
 * 투데이 칸반 순서 = 플랜 목록 순서 (D11, 칸반과 홈 "지금 하는 것"이 같이 쓴다):
 * 카테고리 순서 → 프로젝트 순서(프로젝트 R53) → 미분류·없는 카테고리·단계 → 태스크 배열 순서.
 * 단계 태스크는 taskGroupInfo와 같게 단계가 있으면 프로젝트 자리, 없으면 카테고리 규칙을 따른다.
 */
export function sortLikePlanList(data: PlanData, tasks: Task[]): Task[] {
  const catIndex = new Map(data.categories.map((c, i) => [c.id, i]));
  const projectIndex = new Map(data.projects.map((p, i) => [p.id, i]));
  const taskIndex = new Map(data.tasks.map((t, i) => [t.id, i]));
  const noneRank = data.categories.length + data.projects.length;
  const rank = (t: Task): number => {
    const stage = t.stageId !== null ? findStage(data, t.stageId) : undefined;
    if (stage) return data.categories.length + (projectIndex.get(stage.project.id) ?? data.projects.length);
    return (t.categoryId !== null ? catIndex.get(t.categoryId) : undefined) ?? noneRank;
  };
  return [...tasks].sort((a, b) => rank(a) - rank(b) || (taskIndex.get(a.id) ?? 0) - (taskIndex.get(b.id) ?? 0));
}
